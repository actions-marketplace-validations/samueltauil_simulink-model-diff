#!/usr/bin/env python3
"""Safe wrapper around the MATLAB/Simulink semantic extractor.

This wrapper intentionally fails closed: it never invokes a shell, validates the
artifact path, resolves a MATLAB executable explicitly, and returns structured
JSON when requested.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

from model_drift.extract import AdapterExtractor, AnalysisStatus

SCRIPT_PATH = Path(__file__).resolve().parent / "matlab" / "extract_simulink_model.m"
_DEFAULT_TIMEOUT_SECONDS = 300.0
_SUPPORTED_ARTIFACT_SUFFIXES = frozenset({".slx", ".mdl"})


def _json_dump(payload: dict[str, Any], *, quiet: bool) -> None:
    text = json.dumps(payload, sort_keys=True)
    if not quiet:
        print(text)
    else:
        sys.stderr.write(text + "\n")


def _resolve_matlab_executable(explicit: str | None) -> str | None:
    if explicit:
        candidate = Path(explicit)
        if candidate.exists() or candidate.suffix.lower() in {".exe", ".bat", ".cmd", ".ps1"}:
            return str(candidate)
        resolved = shutil.which(explicit)
        if resolved:
            return resolved
        return None
    env_names = ("MATLAB_EXECUTABLE", "MATLAB_EXE", "MATLAB_PATH")
    for name in env_names:
        value = os.environ.get(name)
        if not value:
            continue
        candidate = Path(value)
        if candidate.exists():
            return str(candidate)
        resolved = shutil.which(value)
        if resolved:
            return resolved
    for candidate in ("matlab", "matlab.exe", "matlab.bat"):
        resolved = shutil.which(candidate)
        if resolved:
            return resolved
    return None


def _matlab_string(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def _build_command(matlab_executable: str, artifact: Path) -> list[str]:
    script_directory = _matlab_string(str(SCRIPT_PATH.parent.resolve()))
    quoted_artifact = _matlab_string(str(artifact.resolve()))
    command = f"addpath({script_directory}); extract_simulink_model({quoted_artifact}, '');"
    if Path(matlab_executable).suffix.lower() in {".py", ".pyw"}:
        return [sys.executable, matlab_executable, "-batch", command]
    return [matlab_executable, "-batch", command]


def _error_payload(message: str, *, exit_code: int, artifact: str | None = None) -> dict[str, Any]:
    payload = {
        "status": "error",
        "exitCode": exit_code,
        "message": message,
        "artifact": artifact,
    }
    return payload


def _run_command(command: list[str], timeout_seconds: float) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        check=False,
        capture_output=True,
        text=True,
        timeout=timeout_seconds,
        shell=False,
    )


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Safely invoke the MATLAB semantic extractor for a Simulink model or SLX.",
    )
    parser.add_argument("artifact", nargs="?", help="Path to the Simulink model or SLX file.")
    parser.add_argument(
        "--matlab-executable", default=None, help="Explicit MATLAB executable to run."
    )
    parser.add_argument(
        "--timeout", type=float, default=_DEFAULT_TIMEOUT_SECONDS, help="Timeout in seconds."
    )
    parser.add_argument(
        "--output", default=None, help="Optional path for extracted canonical manifest JSON."
    )
    parser.add_argument(
        "--json", action="store_true", help="Emit a JSON status object instead of plain text."
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Suppress standard output while still updating the requested file.",
    )
    parser.add_argument(
        "--dry-run", action="store_true", help="Validate arguments without invoking MATLAB."
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    if args.timeout <= 0:
        if args.json:
            _json_dump(_error_payload("Timeout must be positive.", exit_code=2), quiet=args.quiet)
            return 2
        print("error: --timeout must be positive.", file=sys.stderr)
        return 2

    artifact = Path(args.artifact).resolve() if args.artifact else None
    if artifact is None or not artifact.is_file():
        payload = _error_payload(
            "A valid model or SLX artifact path is required.",
            exit_code=2,
            artifact=str(artifact) if artifact is not None else None,
        )
        if args.json:
            _json_dump(payload, quiet=args.quiet)
            return 2
        print("error: a valid model or SLX artifact path is required.", file=sys.stderr)
        return 2
    if artifact.suffix.lower() not in _SUPPORTED_ARTIFACT_SUFFIXES:
        payload = _error_payload(
            "The MATLAB extractor accepts only .slx or .mdl model artifacts.",
            exit_code=2,
            artifact=str(artifact),
        )
        if args.json:
            _json_dump(payload, quiet=args.quiet)
            return 2
        print(f"error: {payload['message']}", file=sys.stderr)
        return 2

    output_path = Path(args.output).resolve() if args.output else None
    matlab_executable = _resolve_matlab_executable(args.matlab_executable)
    if args.dry_run:
        payload = {
            "status": "dry-run",
            "artifact": str(artifact),
            "outputPath": str(output_path) if output_path else None,
            "matlabExecutable": matlab_executable,
            "command": _build_command(matlab_executable or "matlab", artifact)
            if matlab_executable
            else ["matlab"],
        }
        if args.json:
            _json_dump(payload, quiet=args.quiet)
            return 0
        print(json.dumps(payload, sort_keys=True))
        return 0

    if matlab_executable is None:
        payload = _error_payload(
            "MATLAB/Simulink is not installed or not configured. "
            "The extraction path is intentionally unavailable.",
            exit_code=10,
            artifact=str(artifact),
        )
        if args.json:
            _json_dump(payload, quiet=args.quiet)
            return 10
        print(
            "error: MATLAB/Simulink is not installed or the path is not configured.",
            file=sys.stderr,
        )
        return 10

    command = _build_command(matlab_executable, artifact)
    try:
        completed = _run_command(command, args.timeout)
    except subprocess.TimeoutExpired:
        payload = _error_payload(
            f"MATLAB extraction timed out after {args.timeout} seconds.",
            exit_code=124,
            artifact=str(artifact),
        )
        if args.json:
            _json_dump(payload, quiet=args.quiet)
            return 124
        print(f"error: MATLAB extraction timed out after {args.timeout} seconds.", file=sys.stderr)
        return 124

    stdout = completed.stdout.strip()
    stderr = completed.stderr.strip()

    if completed.returncode != 0:
        payload = {
            "status": "error",
            "exitCode": completed.returncode,
            "artifact": str(artifact),
            "stdout": stdout,
            "stderr": stderr,
        }
        if args.json:
            _json_dump(payload, quiet=args.quiet)
            return completed.returncode
        if stdout:
            print(stdout)
        if stderr:
            print(stderr, file=sys.stderr)
        return completed.returncode

    try:
        parsed = json.loads(stdout)
    except json.JSONDecodeError as exc:
        payload = _error_payload(
            f"MATLAB extractor did not emit exactly one JSON object: {exc}",
            exit_code=4,
            artifact=str(artifact),
        )
        if args.json:
            _json_dump(payload, quiet=args.quiet)
        else:
            print(f"error: {payload['message']}", file=sys.stderr)
        return 4
    if not isinstance(parsed, dict):
        payload = _error_payload(
            "MATLAB extractor output must be a JSON object.",
            exit_code=4,
            artifact=str(artifact),
        )
        if args.json:
            _json_dump(payload, quiet=args.quiet)
        else:
            print(f"error: {payload['message']}", file=sys.stderr)
        return 4
    validated = AdapterExtractor(
        lambda _: parsed,
        name="matlab-static-api",
    ).extract(artifact)
    if validated.manifest is None:
        payload = _error_payload(
            validated.error or "MATLAB extractor output failed canonical contract validation.",
            exit_code=4,
            artifact=str(artifact),
        )
        if args.json:
            _json_dump(payload, quiet=args.quiet)
        else:
            print(f"error: {payload['message']}", file=sys.stderr)
        return 4
    parsed = dict(validated.manifest)
    if validated.status in {AnalysisStatus.UNSUPPORTED, AnalysisStatus.FAILED}:
        payload = _error_payload(
            "MATLAB extractor did not produce an analyzable canonical manifest.",
            exit_code=4,
            artifact=str(artifact),
        )
        if args.json:
            _json_dump(payload, quiet=args.quiet)
        else:
            print(f"error: {payload['message']}", file=sys.stderr)
        return 4
    if output_path is not None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(
            json.dumps(parsed, sort_keys=True, separators=(",", ":")) + "\n",
            encoding="utf-8",
        )

    if args.json:
        if not args.quiet:
            _json_dump(parsed, quiet=False)
        return 0

    if not args.quiet:
        print(json.dumps(parsed, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
