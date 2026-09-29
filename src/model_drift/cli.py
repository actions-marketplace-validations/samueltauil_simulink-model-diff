"""Command-line interface for canonical model comparison and diagnostics."""

from __future__ import annotations

import argparse
import importlib.metadata
import json
import os
import shlex
import shutil
import sys
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from enum import IntEnum
from importlib.resources import as_file, files
from pathlib import Path

from jsonschema import Draft202012Validator
from jsonschema.exceptions import SchemaError, ValidationError

from model_drift import __version__
from model_drift.compare import compare_manifests
from model_drift.config import (
    AnalysisPair,
    AppConfig,
    ConfigError,
    discover_config,
    load_config,
    load_plan,
)
from model_drift.extract import ExternalCommandExtractor, inspect_slx_package
from model_drift.reporters import render_markdown, render_sarif, render_svg
from model_drift.rules import RuleConfigError, evaluate_rules, load_rules
from model_drift.serialization import canonical_json_text, fingerprint_json, to_json_value


class ExitCode(IntEnum):
    """Stable public process exit codes."""

    SUCCESS = 0
    NOT_READY = 1
    INVALID_INPUT = 2
    POLICY_FAILURE = 3
    INCOMPLETE_ANALYSIS = 4
    EXTRACTION_FAILURE = 5


@dataclass(frozen=True, slots=True)
class CliError(ValueError):
    """A structured user-facing CLI failure."""

    message: str
    diagnostic_code: str = "CLI_INVALID_INPUT"
    exit_code: ExitCode = ExitCode.INVALID_INPUT
    context: Mapping[str, object] | None = None

    def __str__(self) -> str:
        return self.message


class _ArgumentParser(argparse.ArgumentParser):
    def error(self, message: str) -> None:
        raise CliError(message, "CLI_USAGE")


def _parser() -> argparse.ArgumentParser:
    parser = _ArgumentParser(prog="simulink-model-drift")
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    parser.add_argument(
        "--diagnostics-format",
        choices=("text", "json"),
        default=os.environ.get("MODEL_DRIFT_DIAGNOSTICS", "text"),
        help="render user-facing errors as text or one JSON object",
    )
    commands = parser.add_subparsers(dest="command", required=True)

    version = commands.add_parser("version", help="report CLI and Python version information")
    version.add_argument("--json", action="store_true", dest="as_json")

    doctor = commands.add_parser(
        "doctor",
        help="check Python, package, configuration, and extractor readiness",
    )
    doctor.add_argument("--config", type=Path)
    doctor.add_argument("--json", action="store_true", dest="as_json")

    schema = commands.add_parser("schema", help="print the path to a packaged JSON Schema")
    schema.add_argument("contract", choices=("canonical", "drift"))

    fingerprint = commands.add_parser("fingerprint", help="fingerprint a JSON document")
    fingerprint.add_argument("document", type=Path)

    validate = commands.add_parser("validate", help="validate a JSON contract")
    validate.add_argument("contract", choices=("canonical", "drift"))
    validate.add_argument("document", type=Path)

    compare = commands.add_parser(
        "compare",
        help="compare canonical base and target JSON and emit deterministic reports",
    )
    compare.add_argument("--base", type=Path, required=True)
    compare.add_argument("--target", type=Path, required=True)
    compare.add_argument("--rules", type=Path, action="append", required=True)
    compare.add_argument("--output", type=Path, required=True)
    compare.add_argument(
        "--fail-on",
        choices=("none", "warning", "error"),
        default="error",
        help="return a policy failure exit code at or above this level",
    )

    analyze = commands.add_parser(
        "analyze",
        help="analyze one pair or every pair in a YAML manifest plan",
    )
    analyze.add_argument("--base", type=Path)
    analyze.add_argument("--target", type=Path)
    analyze.add_argument("--plan", type=Path)
    analyze.add_argument("--config", type=Path)
    analyze.add_argument("--rules", type=Path, action="append")
    analyze.add_argument("--output", type=Path)
    analyze.add_argument(
        "--fail-on",
        choices=("none", "warning", "error"),
        default=None,
        help="override policy.failureLevels from configuration",
    )
    analyze.add_argument(
        "--extractor-command",
        type=str,
        default=None,
        help="Command that emits canonical JSON for each .slx input; use {artifact}.",
    )

    inspect = commands.add_parser(
        "inspect-slx",
        help="emit bounded ZIP/OPC diagnostics without claiming semantic extraction",
    )
    inspect.add_argument("artifact", type=Path)
    inspect.add_argument("--output", type=Path)
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    diagnostic_format = _requested_diagnostic_format(argv)
    try:
        args = _parser().parse_args(argv)
        diagnostic_format = args.diagnostics_format
        if args.command == "version":
            return _version(args.as_json)
        if args.command == "doctor":
            return _doctor(args)
        if args.command == "schema":
            resource = files("model_drift.schemas").joinpath(_schema_filename(args.contract))
            with as_file(resource) as path:
                print(path)
            return ExitCode.SUCCESS
        if args.command == "fingerprint":
            print(fingerprint_json(_load_json(args.document)))
            return ExitCode.SUCCESS
        if args.command == "validate":
            _validate_contract(_load_json(args.document), args.contract, args.document)
            print(f"{args.document.as_posix()}: valid {args.contract} contract")
            return ExitCode.SUCCESS
        if args.command == "inspect-slx":
            result = inspect_slx_package(args.artifact)
            text = canonical_json_text(result.to_dict())
            if args.output:
                _write_text(args.output, text)
            else:
                print(text, end="")
            return (
                ExitCode.SUCCESS
                if result.status.value == "complete"
                else ExitCode.NOT_READY
            )
        if args.command == "analyze":
            return _analyze(args)
        return _compare(args)
    except CliError as exc:
        _print_diagnostic(exc, diagnostic_format)
        return exc.exit_code
    except (ConfigError, RuleConfigError) as exc:
        error = CliError(str(exc), "CONFIG_INVALID")
        _print_diagnostic(error, diagnostic_format)
        return error.exit_code
    except (OSError, json.JSONDecodeError) as exc:
        error = CliError(str(exc), "INPUT_READ_FAILED")
        _print_diagnostic(error, diagnostic_format)
        return error.exit_code


def _version(as_json: bool) -> int:
    payload = {
        "cli": "simulink-model-drift",
        "version": __version__,
        "python": sys.version.split()[0],
        "pythonExecutable": sys.executable,
    }
    if as_json:
        print(canonical_json_text(payload), end="")
    else:
        print(f"simulink-model-drift {__version__}")
        print(f"Python {payload['python']} ({sys.executable})")
    return ExitCode.SUCCESS


def _doctor(args: argparse.Namespace) -> int:
    checks: list[dict[str, object]] = []
    python_ready = sys.version_info >= (3, 11)
    checks.append(
        _check(
            "python",
            python_ready,
            f"Python {sys.version.split()[0]} at {sys.executable}",
            "Python 3.11 or newer is required",
        )
    )

    package_ready = True
    package_detail = f"model_drift {__version__}"
    try:
        installed_version = importlib.metadata.version("simulink-model-drift")
        package_detail += f" (distribution {installed_version})"
        if installed_version != __version__:
            package_ready = False
            package_detail += "; imported and installed versions do not match"
    except importlib.metadata.PackageNotFoundError:
        package_detail += " (source checkout; distribution metadata unavailable)"
    try:
        for contract in ("canonical", "drift"):
            resource = files("model_drift.schemas").joinpath(_schema_filename(contract))
            json.loads(resource.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        package_ready = False
        package_detail = f"packaged schemas are unavailable or invalid: {exc}"
    checks.append(_check("package", package_ready, package_detail, package_detail))

    config_path = discover_config(args.config)
    config: AppConfig | None = None
    try:
        config = load_config(config_path)
        config_detail = (
            f"loaded {config.source}"
            if config.source is not None
            else "using built-in defaults; no model-drift/config.yml found"
        )
        missing_rules = [str(path) for path in config.policy.rules if not path.is_file()]
        config_ready = not missing_rules
        if missing_rules:
            config_detail = "missing rule files: " + ", ".join(missing_rules)
        else:
            for path in config.policy.rules:
                load_rules(path)
    except ConfigError as exc:
        config_ready = False
        config_detail = str(exc)
    except RuleConfigError as exc:
        config_ready = False
        config_detail = str(exc)
    checks.append(_check("config", config_ready, config_detail, config_detail))

    command = (
        os.environ.get("SIMULINK_DIFF_COMMAND")
        or (config.extractor.command if config is not None else None)
    )
    try:
        extractor_ready, extractor_detail = _extractor_readiness(command)
    except CliError as exc:
        extractor_ready, extractor_detail = False, exc.message
    checks.append(
        _check("extractor", extractor_ready, extractor_detail, extractor_detail)
    )

    ready = all(bool(check["ready"]) for check in checks)
    payload = {"ready": ready, "checks": checks}
    if args.as_json:
        print(canonical_json_text(payload), end="")
    else:
        for check in checks:
            marker = "ok" if check["ready"] else "not ready"
            print(f"[{marker}] {check['name']}: {check['detail']}")
        print("ready" if ready else "not ready")
    return ExitCode.SUCCESS if ready else ExitCode.NOT_READY


def _check(name: str, ready: bool, success: str, failure: str) -> dict[str, object]:
    return {"name": name, "ready": ready, "detail": success if ready else failure}


def _extractor_readiness(command_text: str | None) -> tuple[bool, str]:
    if not command_text:
        return (
            False,
            "no semantic extractor command configured via config.extractor.command "
            "or SIMULINK_DIFF_COMMAND",
        )
    command = _split_command(command_text)
    executable = command[0]
    path = Path(executable)
    if path.parent != Path("."):
        ready = path.is_file()
        resolved = str(path.resolve()) if ready else executable
    else:
        found = shutil.which(executable)
        ready = found is not None
        resolved = found or executable
    if not ready:
        return False, f"extractor executable not found: {executable}"
    return True, f"extractor command is configured; executable resolved to {resolved}"


def _compare(args: argparse.Namespace) -> int:
    base = _load_json(args.base)
    target = _load_json(args.target)
    _validate_contract(base, "canonical", args.base)
    _validate_contract(target, "canonical", args.target)
    return _emit_reports(
        base,
        target,
        tuple(args.rules),
        args.output,
        args.fail_on,
        ("json", "markdown", "sarif", "svg"),
    )


def _analyze(args: argparse.Namespace) -> int:
    config_path = discover_config(args.config)
    config = load_config(config_path)
    if args.plan and (args.base or args.target):
        raise CliError("--plan cannot be combined with --base or --target", "CLI_USAGE")
    if args.plan:
        plan = load_plan(args.plan)
        pairs = plan.pairs
    else:
        if args.base is None or args.target is None:
            raise CliError(
                "analyze requires --base and --target, or --plan",
                "CLI_USAGE",
            )
        pairs = (
            AnalysisPair(
                id="model-drift",
                base=args.base,
                target=args.target,
                output=args.output,
                rules=tuple(args.rules or ()),
                fail_on=args.fail_on,
                extractor_command=args.extractor_command,
            ),
        )

    statuses: list[int] = []
    multi = len(pairs) > 1
    for pair in pairs:
        output = pair.output or (
            (args.output or config.reporting.output_directory) / pair.id
            if multi
            else args.output or config.reporting.output_directory
        )
        rules = pair.rules or tuple(args.rules or ()) or config.policy.rules
        if not rules:
            rules = (_default_rules_path(),)
        fail_on = pair.fail_on or args.fail_on or config.policy.fail_on
        command = (
            pair.extractor_command
            or args.extractor_command
            or os.environ.get("SIMULINK_DIFF_COMMAND")
            or config.extractor.command
        )
        try:
            statuses.append(
                int(
                    _analyze_pair(
                        pair,
                        command,
                        config.extractor.timeout_seconds,
                        rules,
                        output,
                        fail_on,
                        config.reporting.formats,
                        config.extractor.fail_on_incomplete_analysis,
                    )
                )
            )
        except CliError as exc:
            context = dict(exc.context or {})
            context["pairId"] = pair.id
            raise CliError(
                exc.message,
                exc.diagnostic_code,
                exc.exit_code,
                context,
            ) from exc
    return max(statuses, key=_exit_priority)


def _analyze_pair(
    pair: AnalysisPair,
    command: str | None,
    timeout_seconds: float,
    rules: Sequence[Path],
    output: Path,
    fail_on: str,
    formats: Sequence[str],
    fail_on_incomplete_analysis: bool,
) -> int:
    if not _looks_like_manifest(pair.base) or not _looks_like_manifest(pair.target):
        if not command:
            raise CliError(
                "semantic extraction requires an extractor command via "
                "--extractor-command, config.extractor.command, or SIMULINK_DIFF_COMMAND",
                "EXTRACTOR_NOT_CONFIGURED",
                ExitCode.EXTRACTION_FAILURE,
            )
        base_manifest = _extract_manifest(pair.base, command, timeout_seconds)
        target_manifest = _extract_manifest(pair.target, command, timeout_seconds)
    else:
        base_manifest = _load_json(pair.base)
        target_manifest = _load_json(pair.target)
    _validate_contract(base_manifest, "canonical", pair.base)
    _validate_contract(target_manifest, "canonical", pair.target)
    return _emit_reports(
        base_manifest,
        target_manifest,
        rules,
        output,
        fail_on,
        formats,
        fail_on_incomplete_analysis,
    )


def _emit_reports(
    base: object,
    target: object,
    rule_paths: Sequence[Path],
    output_dir: Path,
    fail_on: str,
    formats: Sequence[str],
    fail_on_incomplete_analysis: bool = True,
) -> int:
    rules = tuple(rule for path in rule_paths for rule in load_rules(path))
    ids = [rule.id for rule in rules]
    duplicates = sorted({rule_id for rule_id in ids if ids.count(rule_id) > 1})
    if duplicates:
        raise RuleConfigError("duplicate rule ids across files: " + ", ".join(duplicates))
    drift = compare_manifests(base, target)
    drift_document = to_json_value(drift)
    _validate_contract(drift_document, "drift", Path("generated drift manifest"))
    findings = evaluate_rules(drift_document, rules)

    output_dir.mkdir(parents=True, exist_ok=True)
    renderers = {
        "json": ("model-drift.json", canonical_json_text(drift_document)),
        "markdown": ("model-drift.md", render_markdown(drift_document, findings)),
        "sarif": (
            "model-drift.sarif",
            render_sarif(findings, rules, tool_version=__version__),
        ),
        "svg": ("model-drift.svg", render_svg(drift_document, findings)),
    }
    for output_format in formats:
        filename, text = renderers[output_format]
        _write_text(output_dir / filename, text)

    if _policy_failed(findings, fail_on):
        return ExitCode.POLICY_FAILURE
    if fail_on_incomplete_analysis and drift.comparison.status.value != "complete":
        return ExitCode.INCOMPLETE_ANALYSIS
    return ExitCode.SUCCESS


def _schema_filename(contract: str) -> str:
    return {
        "canonical": "canonical-model.schema.json",
        "drift": "drift-manifest.schema.json",
    }[contract]


def _default_rules_path() -> Path:
    repo_root = Path(__file__).resolve().parents[2]
    default = repo_root / "model-drift" / "rules" / "default-rules.yml"
    if default.exists():
        return default
    return Path(__file__).with_name("default-rules.yml")


def _looks_like_manifest(path: Path) -> bool:
    return path.suffix.lower() == ".json"


def _extract_manifest(artifact: Path, command_text: str, timeout_seconds: float) -> object:
    command = _split_command(command_text)
    extractor = ExternalCommandExtractor(tuple(command), timeout_seconds=timeout_seconds)
    result = extractor.extract(artifact)
    if result.status.value == "failed":
        raise CliError(
            f"extractor failed for {artifact.as_posix()}: "
            f"{result.error or result.status.value}",
            "EXTRACTOR_FAILED",
            ExitCode.EXTRACTION_FAILURE,
            {"artifact": artifact.as_posix(), "status": result.status.value},
        )
    if result.manifest is None:
        raise CliError(
            f"extractor produced no manifest for {artifact.as_posix()}",
            "EXTRACTOR_NO_MANIFEST",
            ExitCode.EXTRACTION_FAILURE,
            {"artifact": artifact.as_posix()},
        )
    return result.manifest


def _split_command(command_text: str) -> list[str]:
    try:
        command = shlex.split(command_text, posix=os.name != "nt")
    except ValueError as exc:
        raise CliError(
            f"invalid extractor command: {exc}",
            "EXTRACTOR_COMMAND_INVALID",
            ExitCode.EXTRACTION_FAILURE,
        ) from exc
    if not command:
        raise CliError(
            "extractor command is empty",
            "EXTRACTOR_COMMAND_INVALID",
            ExitCode.EXTRACTION_FAILURE,
        )
    if os.name == "nt":
        command = [_strip_wrapping_quotes(argument) for argument in command]
    return command


def _strip_wrapping_quotes(value: str) -> str:
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {'"', "'"}:
        return value[1:-1]
    return value


def _load_json(path: Path) -> object:
    with path.open("r", encoding="utf-8") as stream:
        return json.load(stream)


def _validate_contract(document: object, contract: str, source: Path) -> None:
    resource = files("model_drift.schemas").joinpath(_schema_filename(contract))
    schema = json.loads(resource.read_text(encoding="utf-8"))
    try:
        Draft202012Validator.check_schema(schema)
        Draft202012Validator(schema).validate(document)
    except (SchemaError, ValidationError) as exc:
        location = "/".join(str(part) for part in exc.absolute_path) or "<root>"
        raise CliError(
            f"{source.as_posix()} is not a valid {contract} contract at "
            f"{location}: {exc.message}",
            "CONTRACT_INVALID",
            context={
                "source": source.as_posix(),
                "contract": contract,
                "location": location,
            },
        ) from exc


def _write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")


def _policy_failed(findings: Sequence[object], threshold: str) -> bool:
    if threshold == "none":
        return False
    levels = {"warning": 1, "error": 2}
    minimum = levels[threshold]
    return any(
        levels.get(str(getattr(finding, "level", "none")), 0) >= minimum
        for finding in findings
    )


def _exit_priority(code: int) -> int:
    priority = {
        ExitCode.SUCCESS: 0,
        ExitCode.NOT_READY: 1,
        ExitCode.INCOMPLETE_ANALYSIS: 2,
        ExitCode.POLICY_FAILURE: 3,
        ExitCode.INVALID_INPUT: 4,
        ExitCode.EXTRACTION_FAILURE: 5,
    }
    return priority[ExitCode(code)]


def _requested_diagnostic_format(argv: Sequence[str] | None) -> str:
    values = list(sys.argv[1:] if argv is None else argv)
    try:
        index = values.index("--diagnostics-format")
        return values[index + 1] if values[index + 1] in {"text", "json"} else "text"
    except (ValueError, IndexError):
        return os.environ.get("MODEL_DRIFT_DIAGNOSTICS", "text")


def _print_diagnostic(error: CliError, output_format: str) -> None:
    payload: dict[str, object] = {
        "code": error.diagnostic_code,
        "message": error.message,
        "exitCode": int(error.exit_code),
    }
    if error.context:
        payload["context"] = dict(error.context)
    if output_format == "json":
        print(json.dumps(payload, sort_keys=True, separators=(",", ":")), file=sys.stderr)
    else:
        print(
            f"simulink-model-drift: {error.diagnostic_code}: {error.message}",
            file=sys.stderr,
        )
