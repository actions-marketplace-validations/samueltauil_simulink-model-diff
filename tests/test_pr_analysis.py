from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from copy import deepcopy
from pathlib import Path

import pytest

from model_drift.cli import ExitCode, main

ROOT = Path(__file__).parents[1]
BASE_FIXTURE = ROOT / "examples" / "canonical" / "controller-base.model.json"
TARGET_FIXTURE = ROOT / "examples" / "canonical" / "controller-target.model.json"


def _git(repository: Path, *arguments: str) -> str:
    result = subprocess.run(
        ("git", *arguments),
        cwd=repository,
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


def _repository(tmp_path: Path) -> Path:
    repository = tmp_path / "repository"
    repository.mkdir()
    _git(repository, "init", "--quiet")
    _git(repository, "config", "user.name", "PR Engine Test")
    _git(repository, "config", "user.email", "pr-engine@example.invalid")
    return repository


def _commit(repository: Path, message: str) -> str:
    _git(repository, "add", "--all")
    _git(repository, "commit", "--quiet", "--allow-empty", "-m", message)
    return _git(repository, "rev-parse", "HEAD")


def _manifest(path: Path = BASE_FIXTURE) -> dict[str, object]:
    return json.loads(path.read_text(encoding="utf-8"))


def _write_model(
    repository: Path,
    relative_path: str,
    manifest: dict[str, object],
) -> None:
    path = repository / relative_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(manifest), encoding="utf-8")


def _extractor(
    tmp_path: Path,
    *,
    fail: bool = False,
    partial: bool = False,
    fail_model_name: str | None = None,
) -> str:
    script = tmp_path / "extractor.py"
    if fail:
        script.write_text(
            "import sys\nprint('intentional extraction failure', file=sys.stderr)\n"
            "raise SystemExit(7)\n",
            encoding="utf-8",
        )
    else:
        script.write_text(
            "\n".join(
                [
                    "import hashlib",
                    "import json",
                    "import sys",
                    "from pathlib import Path",
                    "artifact = Path(sys.argv[1])",
                    "manifest = json.loads(artifact.read_text(encoding='utf-8'))",
                    *(
                        [
                            f"if manifest['model']['name'] == {fail_model_name!r}:",
                            "    print('selected extraction failure', file=sys.stderr)",
                            "    raise SystemExit(8)",
                        ]
                        if fail_model_name
                        else []
                    ),
                    "manifest['source']['artifact'] = artifact.name",
                    "manifest['source']['artifactSha256'] = "
                    "hashlib.sha256(artifact.read_bytes()).hexdigest()",
                    *(
                        [
                            "manifest['analysis'] = {",
                            "    'status': 'partial',",
                            "    'warnings': ['test partial extraction'],",
                            "    'unsupportedFeatures': ['compiled-attributes'],",
                            "}",
                        ]
                        if partial
                        else []
                    ),
                    "print(json.dumps(manifest))",
                ]
            )
            + "\n",
            encoding="utf-8",
        )
    return f'"{sys.executable}" "{script}" {{artifact}}'


def _run(
    repository: Path,
    base_ref: str,
    output: Path,
    extractor: str | None = None,
    *,
    fail_on: str = "none",
) -> int:
    arguments = [
        "pr",
        "--base-ref",
        base_ref,
        "--output",
        str(output),
        "--fail-on",
        fail_on,
    ]
    if extractor:
        arguments.extend(["--extractor-command", extractor])
    arguments.append(str(repository))
    return main(arguments)


def _index(output: Path) -> dict[str, object]:
    return json.loads((output / "model-drift-index.json").read_text(encoding="utf-8"))


def _model_drift(output: Path) -> dict[str, object]:
    model_directory = next((output / "models").iterdir())
    return json.loads(
        (model_directory / "model-drift.json").read_text(encoding="utf-8")
    )


def _assert_root_contract(output: Path) -> None:
    assert {path.name for path in output.iterdir()} >= {
        "model-drift-index.json",
        "model-drift-summary.md",
        "model-drift.sarif",
    }
    sarif = json.loads((output / "model-drift.sarif").read_text(encoding="utf-8"))
    assert sarif["version"] == "2.1.0"


def _assert_model_contract(output: Path) -> None:
    model_directory = next((output / "models").iterdir())
    assert {path.name for path in model_directory.iterdir()} == {
        "model-drift.json",
        "model-drift.md",
        "model-drift.sarif",
        "model-drift.svg",
    }


def test_pr_no_changed_models_is_successful_and_useful(tmp_path: Path) -> None:
    repository = _repository(tmp_path)
    _write_model(repository, "controller.slx", _manifest())
    base = _commit(repository, "base")
    _commit(repository, "head without model changes")
    output = tmp_path / "output"

    result = _run(repository, base, output)

    assert result == ExitCode.SUCCESS
    _assert_root_contract(output)
    index = _index(output)
    assert index["status"] == "complete"
    assert index["summary"]["changedModels"] == 0  # type: ignore[index]
    assert index["models"] == []
    assert not (output / "models").exists()
    assert "No changed Simulink model files" in (
        output / "model-drift-summary.md"
    ).read_text(encoding="utf-8")


def test_pr_modified_model_emits_deterministic_per_model_reports(
    tmp_path: Path,
) -> None:
    repository = _repository(tmp_path)
    _write_model(repository, "models/controller.slx", _manifest())
    base = _commit(repository, "base")
    _write_model(repository, "models/controller.slx", _manifest(TARGET_FIXTURE))
    _commit(repository, "modify model")
    output = tmp_path / "output"

    result = _run(repository, base, output, _extractor(tmp_path))

    assert result == ExitCode.SUCCESS
    _assert_root_contract(output)
    _assert_model_contract(output)
    index = _index(output)
    model = index["models"][0]  # type: ignore[index]
    assert model["changeType"] == "modified"
    assert model["basePath"] == "models/controller.slx"
    assert model["headPath"] == "models/controller.slx"
    assert model["analysisStatus"] == "complete"
    assert model["summary"]["added"] == 1


def test_pr_added_model_uses_empty_base_and_reports_all_semantic_elements(
    tmp_path: Path,
) -> None:
    repository = _repository(tmp_path)
    base = _commit(repository, "empty base")
    added = _manifest()
    added["systems"] = [{"id": "system:controller", "path": "controller"}]
    added["stateflow"]["transitions"] = [  # type: ignore[index]
        {"id": "transition:1", "modelPath": "controller/Chart"}
    ]
    added["connections"] = [
        {
            "id": "connection:1",
            "source": {"blockId": "block:controller/In1", "port": 1},
            "destination": {"blockId": "block:controller/Gain", "port": 1},
            "signal": {
                "name": "input",
                "dataType": "double",
                "dimensions": [1],
                "unit": None,
            },
        }
    ]
    added["references"]["models"] = ["plant.slx"]  # type: ignore[index]
    _write_model(repository, "controller.slx", added)
    _commit(repository, "add model")
    output = tmp_path / "output"

    result = _run(repository, base, output, _extractor(tmp_path))

    assert result == ExitCode.SUCCESS
    _assert_model_contract(output)
    drift = _model_drift(output)
    assert drift["comparison"]["baseArtifact"] == "controller.slx"  # type: ignore[index]
    changes = drift["changes"]
    assert changes
    assert {change["kind"] for change in changes} == {"added"}  # type: ignore[union-attr]
    assert {"block", "interface", "connection", "system", "stateflow", "reference"} <= {
        change["category"] for change in changes  # type: ignore[union-attr]
    }


def test_pr_deleted_model_uses_empty_head_and_reports_removals(tmp_path: Path) -> None:
    repository = _repository(tmp_path)
    _write_model(repository, "obsolete.mdl", _manifest())
    base = _commit(repository, "base")
    (repository / "obsolete.mdl").unlink()
    _commit(repository, "delete model")
    output = tmp_path / "output"

    result = _run(repository, base, output, _extractor(tmp_path))

    assert result == ExitCode.SUCCESS
    index = _index(output)
    model = index["models"][0]  # type: ignore[index]
    assert model["changeType"] == "deleted"
    assert model["basePath"] == "obsolete.mdl"
    assert model["headPath"] is None
    changes = _model_drift(output)["changes"]
    assert changes
    assert {change["kind"] for change in changes} == {"removed"}  # type: ignore[union-attr]


def test_pr_renamed_model_preserves_both_paths(tmp_path: Path) -> None:
    repository = _repository(tmp_path)
    _write_model(repository, "old/controller.slx", _manifest())
    base = _commit(repository, "base")
    (repository / "new").mkdir()
    (repository / "old" / "controller.slx").replace(
        repository / "new" / "renamed-controller.slx"
    )
    _commit(repository, "rename model")
    output = tmp_path / "output"

    result = _run(repository, base, output, _extractor(tmp_path))

    assert result == ExitCode.SUCCESS
    model = _index(output)["models"][0]  # type: ignore[index]
    assert model["changeType"] == "renamed"
    assert model["basePath"] == "old/controller.slx"
    assert model["headPath"] == "new/renamed-controller.slx"
    assert _model_drift(output)["changes"] == []


def test_pr_policy_failure_has_stable_exit_and_aggregate_sarif(tmp_path: Path) -> None:
    repository = _repository(tmp_path)
    _write_model(repository, "controller.slx", _manifest())
    base = _commit(repository, "base")
    target = deepcopy(_manifest())
    target["interfaces"]["inports"][0]["dataType"] = "single"  # type: ignore[index]
    _write_model(repository, "controller.slx", target)
    _commit(repository, "break interface policy")
    output = tmp_path / "output"

    result = _run(
        repository,
        base,
        output,
        _extractor(tmp_path),
        fail_on="error",
    )

    assert result == ExitCode.POLICY_FAILURE
    index = _index(output)
    assert index["summary"]["policyFailedModels"] == 1  # type: ignore[index]
    sarif = json.loads((output / "model-drift.sarif").read_text(encoding="utf-8"))
    assert any(
        result["ruleId"] == "SIMULINK-IFACE-001"
        for result in sarif["runs"][0]["results"]
    )


def test_pr_extraction_failure_is_fail_closed_but_still_emits_index(
    tmp_path: Path,
) -> None:
    repository = _repository(tmp_path)
    _write_model(repository, "controller.slx", _manifest())
    base = _commit(repository, "base")
    changed = deepcopy(_manifest())
    changed["model"]["name"] = "changed"  # type: ignore[index]
    _write_model(repository, "controller.slx", changed)
    _commit(repository, "change model")
    output = tmp_path / "output"

    result = _run(repository, base, output, _extractor(tmp_path, fail=True))

    assert result == ExitCode.EXTRACTION_FAILURE
    _assert_root_contract(output)
    index = _index(output)
    assert index["status"] == "failed"
    assert index["summary"]["failedModels"] == 1  # type: ignore[index]
    assert index["failures"][0]["code"] == "PR_EXTRACTION_FAILED"  # type: ignore[index]
    sarif = json.loads((output / "model-drift.sarif").read_text(encoding="utf-8"))
    assert sarif["runs"][0]["invocations"][0]["executionSuccessful"] is False


def test_pr_incomplete_analysis_is_fail_closed_with_reports(tmp_path: Path) -> None:
    repository = _repository(tmp_path)
    _write_model(repository, "controller.slx", _manifest())
    base = _commit(repository, "base")
    _write_model(repository, "controller.slx", _manifest(TARGET_FIXTURE))
    _commit(repository, "change model")
    output = tmp_path / "output"

    result = _run(
        repository,
        base,
        output,
        _extractor(tmp_path, partial=True),
    )

    assert result == ExitCode.INCOMPLETE_ANALYSIS
    _assert_root_contract(output)
    _assert_model_contract(output)
    index = _index(output)
    assert index["status"] == "incomplete"
    assert index["summary"]["incompleteModels"] == 1  # type: ignore[index]
    assert index["models"][0]["analysisStatus"] == "partial"  # type: ignore[index]


def test_pr_exit_priority_keeps_extraction_failure_above_policy_failure(
    tmp_path: Path,
) -> None:
    repository = _repository(tmp_path)
    _write_model(repository, "policy.slx", _manifest())
    failing_base = deepcopy(_manifest())
    failing_base["model"]["name"] = "before-failure"  # type: ignore[index]
    _write_model(repository, "failure.slx", failing_base)
    base = _commit(repository, "base")

    policy_target = deepcopy(_manifest())
    policy_target["interfaces"]["inports"][0]["dataType"] = "single"  # type: ignore[index]
    _write_model(repository, "policy.slx", policy_target)
    failing_target = deepcopy(failing_base)
    failing_target["model"]["name"] = "selected-failure"  # type: ignore[index]
    _write_model(repository, "failure.slx", failing_target)
    _commit(repository, "policy and extraction failures")
    output = tmp_path / "output"

    result = _run(
        repository,
        base,
        output,
        _extractor(tmp_path, fail_model_name="selected-failure"),
        fail_on="error",
    )

    assert result == ExitCode.EXTRACTION_FAILURE
    index = _index(output)
    assert index["summary"]["failedModels"] == 1  # type: ignore[index]
    assert index["summary"]["policyFailedModels"] == 1  # type: ignore[index]


def test_pr_rejects_output_inside_git_metadata(
    tmp_path: Path,
    capsys: pytest.CaptureFixture[str],
) -> None:
    repository = _repository(tmp_path)
    base = _commit(repository, "base")

    result = _run(repository, base, repository / ".git" / "reports")

    assert result == ExitCode.INVALID_INPUT
    assert "PR_OUTPUT_UNSAFE" in capsys.readouterr().err


def test_pr_outputs_are_byte_for_byte_deterministic(tmp_path: Path) -> None:
    repository = _repository(tmp_path)
    _write_model(repository, "a/controller.slx", _manifest())
    base = _commit(repository, "base")
    _write_model(repository, "a/controller.slx", _manifest(TARGET_FIXTURE))
    _write_model(repository, "b/added.mdl", _manifest())
    _commit(repository, "change models")
    first = tmp_path / "first"
    second = tmp_path / "second"
    extractor = _extractor(tmp_path)

    assert _run(repository, base, first, extractor) == ExitCode.SUCCESS
    assert _run(repository, base, second, extractor) == ExitCode.SUCCESS

    first_files = {
        path.relative_to(first).as_posix(): path.read_bytes()
        for path in first.rglob("*")
        if path.is_file()
    }
    second_files = {
        path.relative_to(second).as_posix(): path.read_bytes()
        for path in second.rglob("*")
        if path.is_file()
    }
    assert first_files == second_files
    index = json.loads(first_files["model-drift-index.json"])
    assert index["baseCommit"] == base
    assert index["headCommit"] == _git(repository, "rev-parse", "HEAD")
    assert hashlib.sha256(first_files["model-drift.sarif"]).hexdigest()
