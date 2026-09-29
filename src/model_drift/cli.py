"""Command-line interface for canonical model comparison and diagnostics."""

from __future__ import annotations

import argparse
import json
import sys
from collections.abc import Sequence
from importlib.resources import as_file, files
from pathlib import Path

from jsonschema import Draft202012Validator
from jsonschema.exceptions import SchemaError, ValidationError

from model_drift import __version__
from model_drift.compare import compare_manifests
from model_drift.extract import inspect_slx_package
from model_drift.reporters import render_markdown, render_sarif, render_svg
from model_drift.rules import RuleConfigError, evaluate_rules, load_rules
from model_drift.serialization import (
    canonical_json_text,
    fingerprint_json,
    to_json_value,
)


class CliError(ValueError):
    """A user-facing CLI failure."""


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="simulink-model-drift")
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    commands = parser.add_subparsers(dest="command", required=True)

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
    compare.add_argument("--rules", type=Path, required=True)
    compare.add_argument("--output", type=Path, required=True)
    compare.add_argument(
        "--fail-on",
        choices=("none", "warning", "error"),
        default="error",
        help="return a policy failure exit code at or above this level",
    )

    inspect = commands.add_parser(
        "inspect-slx",
        help="emit bounded ZIP/OPC diagnostics without claiming semantic extraction",
    )
    inspect.add_argument("artifact", type=Path)
    inspect.add_argument("--output", type=Path)
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    try:
        if args.command == "schema":
            resource = files("model_drift.schemas").joinpath(_schema_filename(args.contract))
            with as_file(resource) as path:
                print(path)
            return 0

        if args.command == "fingerprint":
            print(fingerprint_json(_load_json(args.document)))
            return 0

        if args.command == "validate":
            _validate_contract(_load_json(args.document), args.contract, args.document)
            print(f"{args.document.as_posix()}: valid {args.contract} contract")
            return 0

        if args.command == "inspect-slx":
            result = inspect_slx_package(args.artifact)
            text = canonical_json_text(result.to_dict())
            if args.output:
                _write_text(args.output, text)
            else:
                print(text, end="")
            return 0 if result.status.value == "complete" else 1

        return _compare(args)
    except (CliError, OSError, json.JSONDecodeError, RuleConfigError) as exc:
        print(f"simulink-model-drift: error: {exc}", file=sys.stderr)
        return 2


def _compare(args: argparse.Namespace) -> int:
    base = _load_json(args.base)
    target = _load_json(args.target)
    _validate_contract(base, "canonical", args.base)
    _validate_contract(target, "canonical", args.target)

    rules = load_rules(args.rules)
    drift = compare_manifests(base, target)
    drift_document = to_json_value(drift)
    _validate_contract(drift_document, "drift", Path("generated drift manifest"))
    findings = evaluate_rules(drift_document, rules)

    args.output.mkdir(parents=True, exist_ok=True)
    _write_text(
        args.output / "model-drift.json",
        canonical_json_text(drift_document),
    )
    _write_text(
        args.output / "model-drift.md",
        render_markdown(drift_document, findings),
    )
    _write_text(
        args.output / "model-drift.sarif",
        render_sarif(findings, rules, tool_version=__version__),
    )
    _write_text(
        args.output / "model-drift.svg",
        render_svg(drift_document, findings),
    )

    if _policy_failed(findings, args.fail_on):
        return 3
    if drift.comparison.status.value != "complete":
        return 4
    return 0


def _schema_filename(contract: str) -> str:
    return {
        "canonical": "canonical-model.schema.json",
        "drift": "drift-manifest.schema.json",
    }[contract]


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
            f"{location}: {exc.message}"
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
