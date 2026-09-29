"""Typed user configuration and batch analysis plans."""

from __future__ import annotations

import re
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml

CONFIG_SCHEMA_VERSION = "0.1.0"
DEFAULT_CONFIG_PATH = Path("model-drift/config.yml")
SUPPORTED_FORMATS = frozenset({"json", "markdown", "sarif", "svg"})
SUPPORTED_FAILURE_LEVELS = frozenset({"warning", "error"})
_PAIR_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")


class ConfigError(ValueError):
    """Raised when user configuration or an analysis plan is invalid."""


@dataclass(frozen=True, slots=True)
class ExtractorConfig:
    strategy: str = "simulink-api"
    fail_on_incomplete_analysis: bool = True
    command: str | None = None
    timeout_seconds: float = 300.0


@dataclass(frozen=True, slots=True)
class ComparisonConfig:
    identity_strategy: str = "normalized-path"
    infer_moves: bool = False


@dataclass(frozen=True, slots=True)
class ReportingConfig:
    output_directory: Path = Path("model-drift-output")
    formats: tuple[str, ...] = ("json", "markdown", "sarif", "svg")


@dataclass(frozen=True, slots=True)
class PolicyConfig:
    rules: tuple[Path, ...] = ()
    failure_levels: tuple[str, ...] = ("error",)

    @property
    def fail_on(self) -> str:
        if "warning" in self.failure_levels:
            return "warning"
        if "error" in self.failure_levels:
            return "error"
        return "none"


@dataclass(frozen=True, slots=True)
class AppConfig:
    schema_version: str = CONFIG_SCHEMA_VERSION
    extractor: ExtractorConfig = ExtractorConfig()
    comparison: ComparisonConfig = ComparisonConfig()
    reporting: ReportingConfig = ReportingConfig()
    policy: PolicyConfig = PolicyConfig()
    source: Path | None = None


@dataclass(frozen=True, slots=True)
class AnalysisPair:
    id: str
    base: Path
    target: Path
    output: Path | None = None
    rules: tuple[Path, ...] = ()
    fail_on: str | None = None
    extractor_command: str | None = None


@dataclass(frozen=True, slots=True)
class AnalysisPlan:
    schema_version: str
    pairs: tuple[AnalysisPair, ...]
    source: Path


def discover_config(explicit: Path | None, *, cwd: Path | None = None) -> Path | None:
    if explicit is not None:
        return explicit
    candidate = (cwd or Path.cwd()) / DEFAULT_CONFIG_PATH
    return candidate if candidate.is_file() else None


def load_config(path: Path | None, *, base_dir: Path | None = None) -> AppConfig:
    if path is None:
        return AppConfig()
    document = _load_yaml_mapping(path, "configuration")
    _keys(document, {"schemaVersion", "extractor", "comparison", "reporting", "policy"}, "config")
    version = _required_text(document, "schemaVersion", "config")
    if version != CONFIG_SCHEMA_VERSION:
        raise ConfigError(
            f"config.schemaVersion must be {CONFIG_SCHEMA_VERSION!r}, got {version!r}"
        )

    root = (base_dir or Path.cwd()).resolve()
    extractor_data = _optional_mapping(document, "extractor", "config")
    comparison_data = _optional_mapping(document, "comparison", "config")
    reporting_data = _optional_mapping(document, "reporting", "config")
    policy_data = _optional_mapping(document, "policy", "config")

    _keys(
        extractor_data,
        {"strategy", "failOnIncompleteAnalysis", "command", "timeoutSeconds"},
        "config.extractor",
    )
    strategy = _text(extractor_data.get("strategy", "simulink-api"), "config.extractor.strategy")
    if strategy not in {"simulink-api", "external-command"}:
        raise ConfigError(
            "config.extractor.strategy must be 'simulink-api' or 'external-command'"
        )
    command = _optional_text(extractor_data.get("command"), "config.extractor.command")
    timeout = _positive_number(
        extractor_data.get("timeoutSeconds", 300.0),
        "config.extractor.timeoutSeconds",
    )
    extractor = ExtractorConfig(
        strategy=strategy,
        fail_on_incomplete_analysis=_boolean(
            extractor_data.get("failOnIncompleteAnalysis", True),
            "config.extractor.failOnIncompleteAnalysis",
        ),
        command=command,
        timeout_seconds=timeout,
    )

    _keys(
        comparison_data,
        {"identityStrategy", "inferMoves"},
        "config.comparison",
    )
    identity = _text(
        comparison_data.get("identityStrategy", "normalized-path"),
        "config.comparison.identityStrategy",
    )
    if identity != "normalized-path":
        raise ConfigError(
            "config.comparison.identityStrategy currently supports only 'normalized-path'"
        )
    infer_moves = _boolean(
        comparison_data.get("inferMoves", False),
        "config.comparison.inferMoves",
    )
    if infer_moves:
        raise ConfigError("config.comparison.inferMoves=true is not supported")
    comparison = ComparisonConfig(identity_strategy=identity, infer_moves=infer_moves)

    _keys(reporting_data, {"outputDirectory", "formats"}, "config.reporting")
    formats = _string_list(
        reporting_data.get("formats", ["json", "markdown", "sarif", "svg"]),
        "config.reporting.formats",
    )
    unknown_formats = set(formats) - SUPPORTED_FORMATS
    if unknown_formats:
        raise ConfigError(
            "config.reporting.formats contains unsupported values: "
            + ", ".join(sorted(unknown_formats))
        )
    if not formats:
        raise ConfigError("config.reporting.formats must not be empty")
    reporting = ReportingConfig(
        output_directory=_resolve_path(
            _text(
                reporting_data.get("outputDirectory", "model-drift-output"),
                "config.reporting.outputDirectory",
            ),
            root,
        ),
        formats=tuple(dict.fromkeys(formats)),
    )

    _keys(policy_data, {"rules", "failureLevels"}, "config.policy")
    rules = tuple(
        _resolve_path(value, root)
        for value in _string_list(policy_data.get("rules", []), "config.policy.rules")
    )
    failure_levels = _string_list(
        policy_data.get("failureLevels", ["error"]),
        "config.policy.failureLevels",
    )
    unknown_levels = set(failure_levels) - SUPPORTED_FAILURE_LEVELS
    if unknown_levels:
        raise ConfigError(
            "config.policy.failureLevels contains unsupported values: "
            + ", ".join(sorted(unknown_levels))
        )
    policy = PolicyConfig(
        rules=rules,
        failure_levels=tuple(dict.fromkeys(failure_levels)),
    )
    return AppConfig(
        schema_version=version,
        extractor=extractor,
        comparison=comparison,
        reporting=reporting,
        policy=policy,
        source=path.resolve(),
    )


def load_plan(path: Path) -> AnalysisPlan:
    document = _load_yaml_mapping(path, "analysis plan")
    _keys(document, {"schemaVersion", "pairs"}, "plan")
    version = _required_text(document, "schemaVersion", "plan")
    if version != CONFIG_SCHEMA_VERSION:
        raise ConfigError(
            f"plan.schemaVersion must be {CONFIG_SCHEMA_VERSION!r}, got {version!r}"
        )
    raw_pairs = document.get("pairs")
    if not isinstance(raw_pairs, list) or not raw_pairs:
        raise ConfigError("plan.pairs must be a non-empty list")

    base_dir = path.resolve().parent
    pairs: list[AnalysisPair] = []
    seen: set[str] = set()
    for index, value in enumerate(raw_pairs):
        label = f"plan.pairs[{index}]"
        if not isinstance(value, Mapping):
            raise ConfigError(f"{label} must be a mapping")
        _keys(
            value,
            {"id", "base", "target", "output", "rules", "failOn", "extractorCommand"},
            label,
        )
        pair_id = _required_text(value, "id", label)
        if not _PAIR_ID.fullmatch(pair_id):
            raise ConfigError(
                f"{label}.id must contain only letters, digits, '.', '_', or '-'"
            )
        if pair_id in seen:
            raise ConfigError(f"duplicate analysis pair id {pair_id!r}")
        seen.add(pair_id)
        fail_on = _optional_text(value.get("failOn"), f"{label}.failOn")
        if fail_on not in {None, "none", "warning", "error"}:
            raise ConfigError(f"{label}.failOn must be none, warning, or error")
        output_text = _optional_text(value.get("output"), f"{label}.output")
        pairs.append(
            AnalysisPair(
                id=pair_id,
                base=_resolve_path(_required_text(value, "base", label), base_dir),
                target=_resolve_path(_required_text(value, "target", label), base_dir),
                output=_resolve_path(output_text, base_dir) if output_text else None,
                rules=tuple(
                    _resolve_path(item, base_dir)
                    for item in _string_list(value.get("rules", []), f"{label}.rules")
                ),
                fail_on=fail_on,
                extractor_command=_optional_text(
                    value.get("extractorCommand"),
                    f"{label}.extractorCommand",
                ),
            )
        )
    return AnalysisPlan(schema_version=version, pairs=tuple(pairs), source=path.resolve())


def _load_yaml_mapping(path: Path, label: str) -> Mapping[str, Any]:
    try:
        document = yaml.safe_load(path.read_text(encoding="utf-8"))
    except OSError as exc:
        raise ConfigError(f"cannot read {label} '{path}': {exc}") from exc
    except yaml.YAMLError as exc:
        raise ConfigError(f"invalid YAML in {label} '{path}': {exc}") from exc
    if not isinstance(document, Mapping):
        raise ConfigError(f"{label} '{path}' must contain a YAML mapping")
    return document


def _keys(document: Mapping[str, Any], allowed: set[str], label: str) -> None:
    unknown = set(document) - allowed
    if unknown:
        raise ConfigError(f"{label} has unsupported fields: {', '.join(sorted(unknown))}")


def _optional_mapping(
    document: Mapping[str, Any],
    key: str,
    label: str,
) -> Mapping[str, Any]:
    value = document.get(key, {})
    if not isinstance(value, Mapping):
        raise ConfigError(f"{label}.{key} must be a mapping")
    return value


def _required_text(document: Mapping[str, Any], key: str, label: str) -> str:
    if key not in document:
        raise ConfigError(f"{label}.{key} is required")
    return _text(document[key], f"{label}.{key}")


def _text(value: object, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ConfigError(f"{label} must be a non-empty string")
    return value.strip()


def _optional_text(value: object, label: str) -> str | None:
    if value is None:
        return None
    return _text(value, label)


def _boolean(value: object, label: str) -> bool:
    if not isinstance(value, bool):
        raise ConfigError(f"{label} must be true or false")
    return value


def _positive_number(value: object, label: str) -> float:
    if isinstance(value, bool) or not isinstance(value, int | float) or value <= 0:
        raise ConfigError(f"{label} must be a positive number")
    return float(value)


def _string_list(value: object, label: str) -> list[str]:
    if not isinstance(value, Sequence) or isinstance(value, str | bytes):
        raise ConfigError(f"{label} must be a list of strings")
    result: list[str] = []
    for index, item in enumerate(value):
        result.append(_text(item, f"{label}[{index}]"))
    return result


def _resolve_path(value: str, base_dir: Path) -> Path:
    path = Path(value)
    return path if path.is_absolute() else (base_dir / path).resolve()
