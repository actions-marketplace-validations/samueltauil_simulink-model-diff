from __future__ import annotations

import re
from collections.abc import Iterable, Mapping, Sequence
from dataclasses import asdict, dataclass, is_dataclass
from pathlib import Path
from typing import Any

import yaml

_RULE_ID_RE = re.compile(r"^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$")
_LEVELS = {"none", "note", "warning", "error"}
_ANALYSIS_STATUSES = {"complete", "partial", "unsupported", "failed"}
_MATCH_FIELDS = {
    "analysisStatus",
    "blockType",
    "category",
    "elementType",
    "functionalClassification",
    "kind",
    "property",
}


class RuleConfigError(ValueError):
    """Raised when a policy rule file is invalid."""


@dataclass(frozen=True)
class RuleMatch:
    category: str | None = None
    element_type: str | None = None
    block_type: str | None = None
    property: str | None = None
    kind: str | None = None
    functional_classification: str | None = None
    analysis_status: tuple[str, ...] = ()


@dataclass(frozen=True)
class Rule:
    id: str
    title: str
    category: str
    level: str
    match: RuleMatch
    description: str | None = None


@dataclass(frozen=True)
class Finding:
    rule_id: str
    title: str
    category: str
    level: str
    message: str
    artifact_uri: str
    model_path: str
    logical_kind: str
    change_id: str | None = None
    change_kind: str | None = None
    property: str | None = None
    before: Any = None
    after: Any = None
    element_id: str | None = None

    def to_dict(self) -> dict[str, Any]:
        result = {
            "ruleId": self.rule_id,
            "title": self.title,
            "category": self.category,
            "level": self.level,
            "message": self.message,
            "artifactUri": self.artifact_uri,
            "modelPath": self.model_path,
            "logicalKind": self.logical_kind,
            "changeId": self.change_id,
            "changeKind": self.change_kind,
            "property": self.property,
            "before": self.before,
            "after": self.after,
            "elementId": self.element_id,
        }
        return {key: value for key, value in result.items() if value is not None}


def _mapping(value: Any, label: str) -> Mapping[str, Any]:
    if isinstance(value, Mapping):
        return value
    if is_dataclass(value):
        return asdict(value)
    to_dict = getattr(value, "to_dict", None)
    if callable(to_dict):
        result = to_dict()
        if isinstance(result, Mapping):
            return result
    model_dump = getattr(value, "model_dump", None)
    if callable(model_dump):
        result = model_dump(by_alias=True, exclude_none=False)
        if isinstance(result, Mapping):
            return result
    raise TypeError(f"{label} must be a mapping or expose to_dict()/model_dump()")


def _get(mapping: Mapping[str, Any], camel: str, snake: str | None = None) -> Any:
    if camel in mapping:
        return mapping[camel]
    return mapping.get(snake or camel)


def _required_text(mapping: Mapping[str, Any], key: str, index: int) -> str:
    value = mapping.get(key)
    if not isinstance(value, str) or not value.strip():
        raise RuleConfigError(f"rules[{index}].{key} must be a non-empty string")
    return value.strip()


def parse_rules(document: Mapping[str, Any]) -> tuple[Rule, ...]:
    raw_rules = document.get("rules")
    if not isinstance(raw_rules, list):
        raise RuleConfigError("rule document must contain a 'rules' list")

    rules: list[Rule] = []
    seen_ids: set[str] = set()
    for index, raw_rule in enumerate(raw_rules):
        if not isinstance(raw_rule, Mapping):
            raise RuleConfigError(f"rules[{index}] must be a mapping")
        rule_id = _required_text(raw_rule, "id", index)
        if not _RULE_ID_RE.fullmatch(rule_id):
            raise RuleConfigError(
                f"rules[{index}].id '{rule_id}' must be a stable uppercase identifier"
            )
        if rule_id in seen_ids:
            raise RuleConfigError(f"duplicate rule id '{rule_id}'")
        seen_ids.add(rule_id)

        level = _required_text(raw_rule, "level", index).lower()
        if level not in _LEVELS:
            raise RuleConfigError(
                f"rules[{index}].level must be one of {sorted(_LEVELS)}"
            )
        raw_match = raw_rule.get("match")
        if not isinstance(raw_match, Mapping) or not raw_match:
            raise RuleConfigError(f"rules[{index}].match must be a non-empty mapping")
        unknown_fields = set(raw_match) - _MATCH_FIELDS
        if unknown_fields:
            raise RuleConfigError(
                f"rules[{index}].match has unsupported fields: "
                f"{', '.join(sorted(unknown_fields))}"
            )

        raw_status = raw_match.get("analysisStatus", ())
        if isinstance(raw_status, str):
            statuses = (raw_status,)
        elif isinstance(raw_status, list) and all(
            isinstance(value, str) for value in raw_status
        ):
            statuses = tuple(raw_status)
        elif raw_status in (None, ()):
            statuses = ()
        else:
            raise RuleConfigError(
                f"rules[{index}].match.analysisStatus must be a string or list"
            )
        unknown_statuses = set(statuses) - _ANALYSIS_STATUSES
        if unknown_statuses:
            raise RuleConfigError(
                f"rules[{index}] has unknown analysis status: "
                f"{', '.join(sorted(unknown_statuses))}"
            )

        match = RuleMatch(
            category=_optional_text(raw_match, "category", index),
            element_type=_optional_text(raw_match, "elementType", index),
            block_type=_optional_text(raw_match, "blockType", index),
            property=_optional_text(raw_match, "property", index),
            kind=_optional_text(raw_match, "kind", index),
            functional_classification=_optional_text(
                raw_match, "functionalClassification", index
            ),
            analysis_status=statuses,
        )
        if not any(
            (
                match.category,
                match.element_type,
                match.block_type,
                match.property,
                match.kind,
                match.functional_classification,
                match.analysis_status,
            )
        ):
            raise RuleConfigError(f"rules[{index}].match has no supported match fields")

        rules.append(
            Rule(
                id=rule_id,
                title=_required_text(raw_rule, "title", index),
                category=_required_text(raw_rule, "category", index),
                level=level,
                match=match,
                description=_optional_text(raw_rule, "description", index),
            )
        )
    return tuple(sorted(rules, key=lambda rule: rule.id))


def _optional_text(
    mapping: Mapping[str, Any], key: str, index: int
) -> str | None:
    value = mapping.get(key)
    if value is None:
        return None
    if not isinstance(value, str) or not value.strip():
        raise RuleConfigError(f"rules[{index}].match.{key} must be a string")
    return value.strip()


def load_rules(path: str | Path) -> tuple[Rule, ...]:
    rule_path = Path(path)
    try:
        document = yaml.safe_load(rule_path.read_text(encoding="utf-8"))
    except OSError as exc:
        raise RuleConfigError(f"cannot read rule file '{rule_path}': {exc}") from exc
    except yaml.YAMLError as exc:
        raise RuleConfigError(f"invalid YAML in rule file '{rule_path}': {exc}") from exc
    if not isinstance(document, Mapping):
        raise RuleConfigError("rule file must contain a YAML mapping")
    return parse_rules(document)


def evaluate_rules(
    drift_manifest: Any, rules: Sequence[Rule]
) -> tuple[Finding, ...]:
    manifest = _mapping(drift_manifest, "drift_manifest")
    comparison = _mapping(manifest.get("comparison", {}), "comparison")
    status = str(comparison.get("status", "failed"))
    artifact_uri = str(
        _get(comparison, "targetArtifact", "target_artifact")
        or _get(comparison, "baseArtifact", "base_artifact")
        or "model.slx"
    ).replace("\\", "/")

    findings: list[Finding] = []
    for rule in rules:
        if rule.match.analysis_status and status in rule.match.analysis_status:
            findings.append(
                Finding(
                    rule_id=rule.id,
                    title=rule.title,
                    category=rule.category,
                    level=rule.level,
                    message=f"Model analysis is {status}; results may be incomplete.",
                    artifact_uri=artifact_uri,
                    model_path=_model_name(artifact_uri),
                    logical_kind="Simulink Model Analysis",
                    change_kind="unsupported" if status == "unsupported" else "unresolved",
                    property="analysisStatus",
                    after=status,
                    element_id=f"analysis:{_model_name(artifact_uri)}",
                )
            )

        if rule.match.analysis_status:
            continue
        for raw_change in manifest.get("changes", ()):
            change = _mapping(raw_change, "change")
            if _matches_change(rule.match, change):
                findings.append(_finding_for_change(rule, change, artifact_uri))

    return tuple(sorted(findings, key=_finding_sort_key))


def _matches_change(match: RuleMatch, change: Mapping[str, Any]) -> bool:
    expected = (
        ("category", match.category),
        ("elementType", match.element_type),
        ("blockType", match.block_type),
        ("property", match.property),
        ("kind", match.kind),
        ("functionalClassification", match.functional_classification),
    )
    return all(
        wanted is None
        or str(_match_value(change, key)) == wanted
        for key, wanted in expected
    )


def _match_value(change: Mapping[str, Any], key: str) -> Any:
    value = _get(change, key, _camel_to_snake(key))
    if value is not None or key != "blockType":
        return value

    evidence = change.get("evidence")
    if evidence is None:
        return None
    evidence_mapping = _mapping(evidence, "change.evidence")
    details = evidence_mapping.get("details")
    if details is None:
        return None
    return _get(_mapping(details, "change.evidence.details"), key, "block_type")


def _finding_for_change(
    rule: Rule, change: Mapping[str, Any], artifact_uri: str
) -> Finding:
    model_path = str(
        _get(change, "modelPath", "model_path")
        or _get(change, "elementId", "element_id")
        or _model_name(artifact_uri)
    )
    element_type = str(
        _get(change, "elementType", "element_type") or rule.category
    )
    property_name = _get(change, "property")
    before = _get(change, "before")
    after = _get(change, "after")
    return Finding(
        rule_id=rule.id,
        title=rule.title,
        category=rule.category,
        level=rule.level,
        message=_change_message(model_path, property_name, before, after, rule.title),
        artifact_uri=artifact_uri,
        model_path=model_path,
        logical_kind=f"Simulink {element_type.replace('_', ' ').title()}",
        change_id=_get(change, "changeId", "change_id"),
        change_kind=_get(change, "kind"),
        property=property_name,
        before=before,
        after=after,
        element_id=_get(change, "elementId", "element_id"),
    )


def _change_message(
    model_path: str, property_name: Any, before: Any, after: Any, fallback: str
) -> str:
    element = model_path.rsplit("/", 1)[-1]
    if property_name is not None and before is not None and after is not None:
        label = _property_label(str(property_name), element)
        subject = f"{element} {label}".strip()
        return f"{subject} changed from {_display(before)} to {_display(after)}."
    if before is not None and after is not None:
        return f"{element} changed from {_display(before)} to {_display(after)}."
    return f"{fallback}: {model_path}."


def _display(value: Any) -> str:
    if isinstance(value, (dict, list)):
        import json

        return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    return str(value)


def _property_label(property_name: str, element: str) -> str:
    if property_name == "dataType":
        return "data type"
    if property_name.startswith("parameters."):
        parts = property_name.split(".")
        if len(parts) > 1 and parts[1].casefold() == element.casefold():
            return ""
        if len(parts) > 1:
            return f"{parts[1]} value"
    return property_name


def _model_name(artifact_uri: str) -> str:
    return Path(artifact_uri).stem or "model"


def _camel_to_snake(value: str) -> str:
    return re.sub(r"(?<!^)(?=[A-Z])", "_", value).lower()


def _finding_sort_key(finding: Finding) -> tuple[Any, ...]:
    level_order = {"error": 0, "warning": 1, "note": 2, "none": 3}
    return (
        level_order.get(finding.level, 4),
        finding.rule_id,
        finding.artifact_uri,
        finding.model_path,
        finding.property or "",
        finding.change_id or "",
    )


def findings_as_dicts(findings: Iterable[Finding]) -> list[dict[str, Any]]:
    return [finding.to_dict() for finding in sorted(findings, key=_finding_sort_key)]
