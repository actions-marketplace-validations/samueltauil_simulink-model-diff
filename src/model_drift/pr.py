"""Git-native pull-request model analysis."""

from __future__ import annotations

import hashlib
import os
import re
import shutil
import subprocess
import tempfile
from collections import Counter
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Any

from model_drift import __version__
from model_drift.canonicalize import canonicalize_manifest
from model_drift.compare import compare_manifests
from model_drift.extract import ExternalCommandExtractor
from model_drift.reporters import build_sarif, render_markdown, render_sarif, render_svg
from model_drift.review import build_model_review, build_review_plan
from model_drift.rules import Finding, Rule, evaluate_rules, load_rules
from model_drift.serialization import canonical_json_text, normalize_repository_path, to_json_value

DEFAULT_INCLUDES = ("**/*.slx", "**/*.mdl")
_EXIT_PRIORITY = {0: 0, 1: 1, 4: 2, 3: 3, 2: 4, 5: 5}
_SAFE_SLUG = re.compile(r"[^A-Za-z0-9._-]+")


@dataclass(frozen=True, slots=True)
class PullRequestAnalysisError(ValueError):
    message: str
    diagnostic_code: str
    exit_code: int
    context: Mapping[str, object] | None = None

    def __str__(self) -> str:
        return self.message


@dataclass(frozen=True, slots=True)
class ChangedModel:
    change_type: str
    base_path: str | None
    head_path: str | None

    @property
    def logical_path(self) -> str:
        return self.head_path or self.base_path or "model"


@dataclass(frozen=True, slots=True)
class PullRequestOptions:
    repository: Path
    base_ref: str
    head_ref: str
    includes: tuple[str, ...]
    rules: tuple[Path, ...]
    output: Path
    extractor_command: tuple[str, ...]
    timeout_seconds: float
    fail_on: str


def analyze_pull_request(options: PullRequestOptions) -> int:
    repository, git_dir = _repository_paths(options.repository)
    output = _safe_output_path(options.output, repository, git_dir)
    base_commit = _resolve_commit(repository, options.base_ref, "base")
    head_commit = _resolve_commit(repository, options.head_ref, "head")
    models = _changed_models(
        repository,
        base_commit,
        head_commit,
        options.includes or DEFAULT_INCLUDES,
    )
    rules = _load_rule_set(options.rules)
    _prepare_output(output)

    records: list[dict[str, Any]] = []
    all_findings: list[Finding] = []
    exit_codes: list[int] = []
    failures: list[dict[str, str]] = []
    with tempfile.TemporaryDirectory(prefix="simulink-model-drift-pr-") as directory:
        temporary_root = Path(directory)
        for model in models:
            try:
                record, findings, exit_code = _analyze_model(
                    repository,
                    temporary_root,
                    output,
                    base_commit,
                    head_commit,
                    model,
                    rules,
                    options,
                )
                records.append(record)
                all_findings.extend(findings)
                exit_codes.append(exit_code)
            except PullRequestAnalysisError as exc:
                failures.append(
                    {
                        "path": model.logical_path,
                        "code": exc.diagnostic_code,
                        "message": exc.message,
                    }
                )
                records.append(
                    {
                        "id": _model_id(model),
                        "changeType": model.change_type,
                        "basePath": model.base_path,
                        "headPath": model.head_path,
                        "status": "failed",
                        "error": {"code": exc.diagnostic_code, "message": exc.message},
                    }
                )
                exit_codes.append(exc.exit_code)

    records.sort(key=lambda item: (str(item.get("headPath") or item.get("basePath")), item["id"]))
    all_findings.sort(
        key=lambda item: (
            item.rule_id,
            item.artifact_uri,
            item.model_path,
            item.property or "",
            item.change_id or "",
        )
    )
    index = _build_index(
        options,
        base_commit,
        head_commit,
        records,
        all_findings,
        failures,
    )
    _write_text(output / "model-drift-index.json", canonical_json_text(index))
    _write_text(output / "model-drift-summary.md", _aggregate_markdown(index))
    aggregate_sarif = build_sarif(all_findings, rules, tool_version=__version__)
    if failures:
        aggregate_sarif["runs"][0]["invocations"] = [
            {
                "executionSuccessful": False,
                "toolExecutionNotifications": [
                    {
                        "level": "error",
                        "message": {
                            "text": f"{failure['path']}: {failure['message']}"
                        },
                    }
                    for failure in sorted(failures, key=lambda item: item["path"])
                ],
            }
        ]
    _write_text(output / "model-drift.sarif", _pretty_json(aggregate_sarif))
    return max(exit_codes, key=lambda code: _EXIT_PRIORITY[code]) if exit_codes else 0


def _analyze_model(
    repository: Path,
    temporary_root: Path,
    output: Path,
    base_commit: str,
    head_commit: str,
    model: ChangedModel,
    rules: Sequence[Rule],
    options: PullRequestOptions,
) -> tuple[dict[str, Any], tuple[Finding, ...], int]:
    model_id = _model_id(model)
    work = temporary_root / model_id
    work.mkdir()
    base_manifest = _manifest_for_side(
        repository,
        work,
        base_commit,
        model.base_path,
        "base",
        options,
        model.logical_path,
    )
    head_manifest = _manifest_for_side(
        repository,
        work,
        head_commit,
        model.head_path,
        "head",
        options,
        model.logical_path,
    )
    drift = compare_manifests(base_manifest, head_manifest)
    drift_document = to_json_value(drift)
    findings = evaluate_rules(drift_document, rules)
    model_output = _safe_child(output / "models", model_id)
    model_output.mkdir(parents=True, exist_ok=True)
    _write_text(model_output / "model-drift.json", canonical_json_text(drift_document))
    _write_text(model_output / "model-drift.md", render_markdown(drift_document, findings))
    _write_text(
        model_output / "model-drift.sarif",
        render_sarif(findings, rules, tool_version=__version__),
    )
    _write_text(model_output / "model-drift.svg", render_svg(drift_document, findings))

    analysis_status = drift.comparison.status.value
    policy_failed = _policy_failed(findings, options.fail_on)
    exit_code = 3 if policy_failed else 4 if analysis_status != "complete" else 0
    relative_output = model_output.relative_to(output).as_posix()
    changes = drift_document.get("changes", ())
    classifications = Counter(
        str(change.get("functionalClassification", "unknown"))
        for change in changes
        if isinstance(change, Mapping)
    )
    categories = Counter(
        str(change.get("category", "unknown"))
        for change in changes
        if isinstance(change, Mapping)
    )
    record = {
        "id": model_id,
        "changeType": model.change_type,
        "basePath": model.base_path,
        "headPath": model.head_path,
        "status": "complete" if analysis_status == "complete" else "incomplete",
        "analysisStatus": analysis_status,
        "policyStatus": "failed" if policy_failed else "passed",
        "summary": drift_document["summary"],
        "changeProfile": {
            "classifications": dict(sorted(classifications.items())),
            "categories": dict(sorted(categories.items())),
        },
        "findingCounts": dict(sorted(Counter(item.level for item in findings).items())),
        "outputDirectory": relative_output,
        "artifacts": {
            "json": f"{relative_output}/model-drift.json",
            "markdown": f"{relative_output}/model-drift.md",
            "sarif": f"{relative_output}/model-drift.sarif",
            "svg": f"{relative_output}/model-drift.svg",
        },
    }
    return record, findings, exit_code


def _manifest_for_side(
    repository: Path,
    work: Path,
    commit: str,
    repository_path: str | None,
    side: str,
    options: PullRequestOptions,
    logical_path: str,
) -> Mapping[str, Any]:
    if repository_path is None:
        return _empty_manifest(logical_path, side)
    if not options.extractor_command:
        raise PullRequestAnalysisError(
            "semantic extraction requires --extractor-command, "
            "config.extractor.command, or SIMULINK_DIFF_COMMAND",
            "EXTRACTOR_NOT_CONFIGURED",
            5,
            {"path": repository_path, "side": side},
        )
    suffix = Path(repository_path).suffix.lower()
    artifact = work / f"{side}{suffix}"
    artifact.write_bytes(_git(repository, "show", f"{commit}:{repository_path}", binary=True))
    extractor = ExternalCommandExtractor(
        options.extractor_command,
        timeout_seconds=options.timeout_seconds,
        cwd=repository,
    )
    result = extractor.extract(artifact)
    if result.status.value == "failed" or result.manifest is None:
        raise PullRequestAnalysisError(
            f"extractor failed for {repository_path} at {side}: "
            f"{result.error or 'no canonical manifest was produced'}",
            "PR_EXTRACTION_FAILED",
            5,
            {"path": repository_path, "side": side},
        )
    manifest = dict(result.manifest)
    manifest["source"] = dict(manifest["source"])
    manifest["source"]["artifact"] = repository_path
    return canonicalize_manifest(manifest)


def _empty_manifest(logical_path: str, side: str) -> Mapping[str, Any]:
    model_name = Path(logical_path).stem or "model"
    return canonicalize_manifest(
        {
            "$schema": "./canonical-model.schema.json",
            "schemaVersion": "0.1.0",
            "generator": {
                "name": "simulink-model-drift",
                "version": __version__,
                "strategy": f"deterministic-empty-{side}",
            },
            "source": {
                "artifact": logical_path,
                "artifactSha256": "0" * 64,
                "simulinkRelease": None,
            },
            "analysis": {
                "status": "complete",
                "warnings": [],
                "unsupportedFeatures": [],
            },
            "model": {
                "name": model_name,
                "modelType": "model",
                "rootPath": model_name,
            },
            "interfaces": {
                "inports": [],
                "outports": [],
                "triggerPorts": [],
                "enablePorts": [],
                "buses": [],
            },
            "systems": [],
            "blocks": [],
            "connections": [],
            "stateflow": {
                "charts": [],
                "states": [],
                "transitions": [],
                "junctions": [],
                "events": [],
                "data": [],
            },
            "configuration": {},
            "references": {
                "models": [],
                "libraries": [],
                "dataDictionaries": [],
                "requirements": [],
            },
            "fingerprints": {
                "model": "0" * 64,
                "structure": "0" * 64,
                "interfaces": "0" * 64,
                "parameters": "0" * 64,
                "stateflow": "0" * 64,
                "configuration": "0" * 64,
            },
        }
    )


def _repository_paths(path: Path) -> tuple[Path, Path]:
    requested = path.resolve()
    try:
        root_text = _git(requested, "rev-parse", "--show-toplevel").strip()
        git_text = _git(requested, "rev-parse", "--absolute-git-dir").strip()
    except PullRequestAnalysisError as exc:
        raise PullRequestAnalysisError(
            f"{requested} is not a usable git repository",
            "PR_REPOSITORY_INVALID",
            2,
        ) from exc
    return Path(root_text).resolve(), Path(git_text).resolve()


def _safe_output_path(output: Path, repository: Path, git_dir: Path) -> Path:
    candidate = output if output.is_absolute() else repository / output
    if candidate.exists() and candidate.is_symlink():
        raise PullRequestAnalysisError(
            "output directory must not be a symbolic link",
            "PR_OUTPUT_UNSAFE",
            2,
        )
    resolved = candidate.resolve()
    if resolved == repository:
        raise PullRequestAnalysisError(
            "output directory must not be the repository root",
            "PR_OUTPUT_UNSAFE",
            2,
        )
    if resolved == git_dir or git_dir in resolved.parents:
        raise PullRequestAnalysisError(
            "output directory must not be inside the git metadata directory",
            "PR_OUTPUT_UNSAFE",
            2,
        )
    return resolved


def _safe_child(parent: Path, name: str) -> Path:
    candidate = (parent / name).resolve()
    resolved_parent = parent.resolve()
    if candidate.parent != resolved_parent:
        raise PullRequestAnalysisError(
            "generated output path escaped its parent directory",
            "PR_OUTPUT_UNSAFE",
            2,
        )
    return candidate


def _prepare_output(output: Path) -> None:
    output.mkdir(parents=True, exist_ok=True)
    for filename in (
        "model-drift-index.json",
        "model-drift-summary.md",
        "model-drift.sarif",
    ):
        path = output / filename
        if path.is_symlink():
            raise PullRequestAnalysisError(
                f"output artifact must not be a symbolic link: {filename}",
                "PR_OUTPUT_UNSAFE",
                2,
            )
        if path.exists():
            if not path.is_file():
                raise PullRequestAnalysisError(
                    f"output artifact path is not a file: {filename}",
                    "PR_OUTPUT_UNSAFE",
                    2,
                )
            path.unlink()
    models = output / "models"
    if models.is_symlink():
        raise PullRequestAnalysisError(
            "per-model output directory must not be a symbolic link",
            "PR_OUTPUT_UNSAFE",
            2,
        )
    if models.exists():
        if not models.is_dir():
            raise PullRequestAnalysisError(
                "per-model output path is not a directory",
                "PR_OUTPUT_UNSAFE",
                2,
            )
        shutil.rmtree(models)


def _resolve_commit(repository: Path, ref: str, label: str) -> str:
    if not ref or "\x00" in ref:
        raise PullRequestAnalysisError(
            f"{label} ref must be non-empty",
            "PR_REF_INVALID",
            2,
        )
    try:
        return _git(repository, "rev-parse", "--verify", f"{ref}^{{commit}}").strip()
    except PullRequestAnalysisError as exc:
        raise PullRequestAnalysisError(
            f"cannot resolve {label} ref '{ref}' to a commit",
            "PR_REF_INVALID",
            2,
            {"ref": ref, "side": label},
        ) from exc


def _changed_models(
    repository: Path,
    base_commit: str,
    head_commit: str,
    includes: Sequence[str],
) -> tuple[ChangedModel, ...]:
    raw = _git(
        repository,
        "diff",
        "--name-status",
        "-z",
        "--find-renames",
        f"{base_commit}...{head_commit}",
        "--",
        binary=True,
    )
    tokens = raw.split(b"\0")
    if tokens and tokens[-1] == b"":
        tokens.pop()
    models: list[ChangedModel] = []
    index = 0
    while index < len(tokens):
        status = tokens[index].decode("ascii", errors="strict")
        index += 1
        if status.startswith(("R", "C")):
            old_path = _git_path(tokens[index])
            new_path = _git_path(tokens[index + 1])
            index += 2
            model = ChangedModel("renamed", old_path, new_path)
        else:
            path = _git_path(tokens[index])
            index += 1
            if status == "A":
                model = ChangedModel("added", None, path)
            elif status == "D":
                model = ChangedModel("deleted", path, None)
            elif status == "M":
                model = ChangedModel("modified", path, path)
            else:
                continue
        if any(
            _matches_include(path, includes)
            for path in (model.base_path, model.head_path)
            if path
        ):
            models.append(model)
    return tuple(sorted(models, key=lambda item: (item.logical_path, item.change_type)))


def _git_path(raw: bytes) -> str:
    path = raw.decode("utf-8", errors="surrogateescape")
    try:
        return normalize_repository_path(path)
    except ValueError as exc:
        raise PullRequestAnalysisError(
            f"git returned an unsafe repository path: {path!r}",
            "PR_GIT_PATH_UNSAFE",
            2,
        ) from exc


def _matches_include(path: str, includes: Sequence[str]) -> bool:
    candidate = PurePosixPath(path)
    return any(
        candidate.match(pattern)
        or (pattern.startswith("**/") and candidate.match(pattern[3:]))
        for pattern in includes
    )


def _model_id(model: ChangedModel) -> str:
    path = model.logical_path
    stem = _SAFE_SLUG.sub("-", PurePosixPath(path).stem).strip(".-") or "model"
    digest = hashlib.sha256(
        f"{model.base_path or ''}\0{model.head_path or ''}".encode()
    ).hexdigest()[:12]
    return f"{stem[:48]}-{digest}"


def _load_rule_set(paths: Sequence[Path]) -> tuple[Rule, ...]:
    rules = tuple(rule for path in paths for rule in load_rules(path))
    duplicates = sorted(
        rule_id for rule_id, count in Counter(rule.id for rule in rules).items() if count > 1
    )
    if duplicates:
        raise PullRequestAnalysisError(
            "duplicate rule ids across files: " + ", ".join(duplicates),
            "PR_RULES_INVALID",
            2,
        )
    return rules


def _build_index(
    options: PullRequestOptions,
    base_commit: str,
    head_commit: str,
    records: Sequence[Mapping[str, Any]],
    findings: Sequence[Finding],
    failures: Sequence[Mapping[str, str]],
) -> dict[str, Any]:
    prepared_records = []
    for source in records:
        record = dict(source)
        record["review"] = build_model_review(record)
        prepared_records.append(record)

    drift_totals = Counter()
    for record in prepared_records:
        summary = record.get("summary")
        if isinstance(summary, Mapping):
            drift_totals.update({key: int(value) for key, value in summary.items()})
    aggregate_status = (
        "failed"
        if failures
        else "incomplete"
        if any(record.get("status") == "incomplete" for record in prepared_records)
        else "complete"
    )
    review_plan = build_review_plan(prepared_records)
    return {
        "$schema": "https://github.com/github/simulink-model-drift/model-drift-index/0.1.0",
        "schemaVersion": "0.1.0",
        "baseRef": options.base_ref,
        "headRef": options.head_ref,
        "baseCommit": base_commit,
        "headCommit": head_commit,
        "includes": list(options.includes),
        "status": aggregate_status,
        "summary": {
            "changedModels": len(prepared_records),
            "successfulModels": sum(
                record.get("status") == "complete" for record in prepared_records
            ),
            "incompleteModels": sum(
                record.get("status") == "incomplete" for record in prepared_records
            ),
            "failedModels": sum(
                record.get("status") == "failed" for record in prepared_records
            ),
            "policyFailedModels": sum(
                record.get("policyStatus") == "failed" for record in prepared_records
            ),
            "findings": dict(sorted(Counter(item.level for item in findings).items())),
            "drift": dict(sorted(drift_totals.items())),
        },
        "reviewPlan": review_plan,
        "models": prepared_records,
        "failures": list(sorted(failures, key=lambda item: item["path"])),
    }


def _aggregate_markdown(index: Mapping[str, Any]) -> str:
    summary = index["summary"]
    models = index["models"]
    lines = [
        "## Simulink Model Drift",
        "",
        f"**Range:** `{index['baseRef']}...{index['headRef']}`  ",
        f"**Analysis:** {str(index['status']).title()}  ",
        f"**Review status:** {str(index['reviewPlan']['status']).replace('-', ' ').title()}  ",
        f"**Changed models:** {summary['changedModels']}  ",
        f"**Next step:** {index['reviewPlan']['recommendedAction']}",
        "",
    ]
    if not models:
        lines.extend(
            [
                "No changed Simulink model files matched the configured include globs.",
                "",
            ]
        )
        return "\n".join(lines)
    lines.extend(
        [
            "### Prioritized review plan",
            "",
            "| Priority | Model | Analysis | Policy | Why | Next step |",
            "| --- | --- | --- | --- | --- | --- |",
        ]
    )
    order = {
        model_id: position
        for position, model_id in enumerate(index["reviewPlan"]["orderedModelIds"])
    }
    prioritized = sorted(
        models,
        key=lambda model: (
            order.get(model.get("id"), len(order)),
            str(model.get("headPath") or model.get("basePath")),
        ),
    )
    for model in prioritized:
        review = model.get("review", {})
        lines.append(
            f"| {str(review.get('priority', 'normal')).title()} "
            f"| `{model.get('headPath') or model.get('basePath')}` "
            f"| {model['status']} "
            f"| {model.get('policyStatus', 'not-evaluated')} "
            f"| {review.get('summary', 'Review required')} "
            f"| {review.get('action', 'Inspect the model report.')} |"
        )
    lines.extend(
        [
            "",
            "### Drift details",
            "",
            "| Model | Git change | Added | Removed | Modified | Interfaces |",
            "| --- | --- | ---: | ---: | ---: | ---: |",
        ]
    )
    for model in prioritized:
        drift = model.get("summary", {})
        lines.append(
            f"| `{model.get('headPath') or model.get('basePath')}` "
            f"| {model['changeType']} "
            f"| {drift.get('added', 0)} | {drift.get('removed', 0)} "
            f"| {drift.get('modified', 0)} | {drift.get('interfaceChanges', 0)} |"
        )
    lines.append("")
    failures = index.get("failures", ())
    if failures:
        lines.extend(["### Analysis failures", ""])
        lines.extend(
            f"- `{failure['path']}`: {failure['message']}" for failure in failures
        )
        lines.append("")
    return "\n".join(lines)


def _policy_failed(findings: Sequence[Finding], threshold: str) -> bool:
    if threshold == "none":
        return False
    levels = {"warning": 1, "error": 2}
    minimum = levels[threshold]
    return any(levels.get(finding.level, 0) >= minimum for finding in findings)


def _git(repository: Path, *arguments: str, binary: bool = False) -> Any:
    environment = dict(os.environ)
    environment.update({"GIT_OPTIONAL_LOCKS": "0", "GIT_PAGER": "cat"})
    try:
        result = subprocess.run(
            ("git", "-c", "core.quotepath=false", *arguments),
            cwd=repository,
            env=environment,
            check=False,
            capture_output=True,
            text=not binary,
        )
    except OSError as exc:
        raise PullRequestAnalysisError(
            f"git could not be started: {exc}",
            "PR_GIT_FAILED",
            2,
        ) from exc
    if result.returncode != 0:
        stderr = (
            result.stderr.decode("utf-8", errors="replace")
            if binary
            else result.stderr
        )
        raise PullRequestAnalysisError(
            stderr.strip() or f"git {' '.join(arguments)} failed",
            "PR_GIT_FAILED",
            2,
        )
    return result.stdout


def _pretty_json(value: object) -> str:
    import json

    return json.dumps(
        value,
        indent=2,
        sort_keys=True,
        ensure_ascii=True,
        separators=(",", ": "),
    ) + "\n"


def _write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")
