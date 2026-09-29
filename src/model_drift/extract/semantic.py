"""Safe integration boundaries for supported semantic Simulink extractors.

This module deliberately does not parse or interpret SLX XML. A semantic
extractor must provide an explicit canonical manifest and analysis status.
"""

from __future__ import annotations

import hashlib
import json
import subprocess
import tempfile
from collections.abc import Callable, Mapping
from contextlib import suppress
from dataclasses import dataclass
from importlib.resources import files
from pathlib import Path
from typing import Protocol

from jsonschema import Draft202012Validator, ValidationError

from model_drift.canonicalize import ManifestCanonicalizationError, canonicalize_manifest
from model_drift.models import AnalysisStatus
from model_drift.serialization import to_json_value

_STATUS_VALUES = frozenset(status.value for status in AnalysisStatus)
_DEFAULT_MAX_STDOUT_BYTES = 32 * 1024 * 1024
_DEFAULT_MAX_STDERR_BYTES = 256 * 1024


@dataclass(frozen=True, slots=True)
class ExtractionResult:
    """An explicit result from a semantic extractor or adapter."""

    status: AnalysisStatus
    manifest: Mapping[str, object] | None = None
    warnings: tuple[str, ...] = ()
    unsupported_features: tuple[str, ...] = ()
    error: str | None = None
    extractor: str = "unknown"

    def to_dict(self) -> dict[str, object]:
        return {
            "status": self.status.value,
            "manifest": to_json_value(self.manifest) if self.manifest is not None else None,
            "warnings": list(self.warnings),
            "unsupportedFeatures": list(self.unsupported_features),
            "error": self.error,
            "extractor": self.extractor,
        }


class SemanticExtractor(Protocol):
    """Contract implemented by a supported semantic extractor."""

    def extract(self, artifact: str | Path) -> ExtractionResult:
        """Extract semantics without treating raw package XML as semantics."""


class SemanticExtractorAdapter(Protocol):
    """Adapter contract for an in-process MATLAB-backed integration."""

    def extract(self, artifact: Path) -> ExtractionResult | Mapping[str, object]:
        """Return an explicit result or a canonical manifest mapping."""


class AdapterExtractor:
    """Adapt a supported in-process semantic extractor to this contract."""

    def __init__(
        self,
        adapter: SemanticExtractorAdapter
        | Callable[[Path], ExtractionResult | Mapping[str, object]],
        *,
        name: str = "adapter",
    ) -> None:
        self._adapter = adapter
        self._name = name

    def extract(self, artifact: str | Path) -> ExtractionResult:
        path = Path(artifact)
        try:
            if hasattr(self._adapter, "extract"):
                result = self._adapter.extract(path)
            else:
                result = self._adapter(path)
        except Exception as exc:
            return _failed(self._name, f"Semantic extractor adapter failed: {exc}")
        if isinstance(result, ExtractionResult):
            return _normalize_result(result, path, self._name)
        return _manifest_result(result, path, self._name)


@dataclass(frozen=True, slots=True)
class ExternalCommandExtractor:
    """Run a trusted semantic extractor command without invoking a shell.

    The command must write one canonical manifest JSON object to stdout. Use
    ``{artifact}`` in a command argument to place the artifact path there; if
    absent, the path is appended as the final argument. The command owns the
    semantic interpretation and must explicitly set ``analysis.status``.
    """

    command: tuple[str, ...]
    timeout_seconds: float = 300.0
    max_stdout_bytes: int = _DEFAULT_MAX_STDOUT_BYTES
    max_stderr_bytes: int = _DEFAULT_MAX_STDERR_BYTES
    cwd: str | Path | None = None

    def __post_init__(self) -> None:
        if not self.command or not all(self.command):
            raise ValueError("external extractor command must not be empty")
        if self.timeout_seconds <= 0:
            raise ValueError("external extractor timeout must be positive")
        if self.max_stdout_bytes <= 0 or self.max_stderr_bytes <= 0:
            raise ValueError("external extractor output limits must be positive")

    def extract(self, artifact: str | Path) -> ExtractionResult:
        path = Path(artifact)
        command = self._command_for(path)
        stdout_path: str | None = None
        stderr_path: str | None = None
        try:
            with (
                tempfile.NamedTemporaryFile(prefix="slx-extractor-", delete=False) as stdout,
                tempfile.NamedTemporaryFile(prefix="slx-extractor-", delete=False) as stderr,
            ):
                stdout_path = stdout.name
                stderr_path = stderr.name
                process = subprocess.Popen(
                    command,
                    cwd=self.cwd,
                    stdout=stdout,
                    stderr=stderr,
                    shell=False,
                )
            try:
                return_code = process.wait(timeout=self.timeout_seconds)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
                return _failed("external-command", "Semantic extractor timed out.")

            output = _read_bounded(Path(stdout_path), self.max_stdout_bytes)
            diagnostics = _read_bounded(Path(stderr_path), self.max_stderr_bytes)
            if output is None:
                return _failed(
                    "external-command",
                    "Semantic extractor stdout exceeded its configured limit.",
                )
            if diagnostics is None:
                diagnostics = "<stderr exceeded configured limit>"
            if return_code != 0:
                detail = diagnostics.strip() or f"process exited with status {return_code}"
                return _failed("external-command", f"Semantic extractor failed: {detail}")
            if not output.strip():
                return _failed(
                    "external-command",
                    "Semantic extractor produced no manifest on stdout.",
                )
            try:
                manifest = json.loads(output.decode("utf-8"))
            except (UnicodeDecodeError, json.JSONDecodeError) as exc:
                return _failed(
                    "external-command",
                    f"Semantic extractor output was not valid UTF-8 JSON: {exc}",
                )
            return _manifest_result(manifest, path, "external-command")
        except (OSError, ValueError) as exc:
            return _failed("external-command", f"Semantic extractor could not be started: {exc}")
        finally:
            for temporary_path in (stdout_path, stderr_path):
                if temporary_path:
                    with suppress(OSError):
                        Path(temporary_path).unlink()

    def _command_for(self, artifact: Path) -> list[str]:
        artifact_text = str(artifact.resolve())
        has_placeholder = any("{artifact}" in argument for argument in self.command)
        command = [argument.replace("{artifact}", artifact_text) for argument in self.command]
        if not has_placeholder:
            command.append(artifact_text)
        return command


def _manifest_result(
    manifest: object,
    artifact: Path,
    extractor: str,
) -> ExtractionResult:
    if not isinstance(manifest, Mapping):
        return _failed(extractor, "Semantic extractor result must be a JSON object.")
    analysis = manifest.get("analysis")
    if not isinstance(analysis, Mapping) or analysis.get("status") not in _STATUS_VALUES:
        return _failed(
            extractor,
            "Semantic extractor must explicitly report analysis.status as complete, "
            "partial, unsupported, or failed.",
        )
    status = AnalysisStatus(analysis["status"])
    if status is AnalysisStatus.COMPLETE and analysis.get("unsupportedFeatures"):
        return _failed(
            extractor,
            "A complete semantic result cannot report unsupported features.",
        )
    try:
        canonical = canonicalize_manifest(manifest)
        _validate_schema(canonical)
    except (ManifestCanonicalizationError, TypeError, ValueError, ValidationError) as exc:
        return _failed(extractor, f"Semantic manifest contract validation failed: {exc}")
    try:
        expected_hash = _sha256(artifact)
    except OSError as exc:
        return _failed(extractor, f"Source artifact could not be hashed: {exc}")
    actual_hash = canonical.get("source", {}).get("artifactSha256")
    if actual_hash != expected_hash:
        return _failed(
            extractor,
            "Semantic manifest source.artifactSha256 does not match the supplied artifact.",
        )
    return ExtractionResult(
        status=status,
        manifest=canonical,
        warnings=tuple(canonical["analysis"]["warnings"]),
        unsupported_features=tuple(canonical["analysis"]["unsupportedFeatures"]),
        extractor=extractor,
    )


def _normalize_result(result: ExtractionResult, artifact: Path, name: str) -> ExtractionResult:
    if result.manifest is None:
        if result.status is AnalysisStatus.FAILED and result.error:
            return result
        return _failed(name, "Semantic extractor returned no manifest.")
    validated = _manifest_result(result.manifest, artifact, name)
    if validated.status is AnalysisStatus.FAILED:
        return validated
    if result.status is not validated.status:
        return _failed(name, "Adapter result status does not match manifest analysis.status.")
    return validated


def _validate_schema(manifest: Mapping[str, object]) -> None:
    schema = json.loads(
        files("model_drift.schemas")
        .joinpath("canonical-model.schema.json")
        .read_text(encoding="utf-8")
    )
    Draft202012Validator(schema).validate(manifest)


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _read_bounded(path: Path, limit: int) -> bytes | None:
    size = path.stat().st_size
    if size > limit:
        return None
    return path.read_bytes()


def _failed(extractor: str, message: str) -> ExtractionResult:
    return ExtractionResult(status=AnalysisStatus.FAILED, error=message, extractor=extractor)
