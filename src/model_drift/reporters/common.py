from __future__ import annotations

import hashlib
import json
from collections.abc import Mapping
from dataclasses import asdict, is_dataclass
from typing import Any

from model_drift.rules import Finding


def to_mapping(value: Any) -> Mapping[str, Any]:
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
    raise TypeError("value must be a mapping or expose to_dict()/model_dump()")


def deterministic_json(value: Any) -> str:
    return json.dumps(
        value,
        indent=2,
        sort_keys=True,
        ensure_ascii=True,
        separators=(",", ": "),
    ) + "\n"


def normalize_uri(value: str) -> str:
    normalized = value.replace("\\", "/")
    while normalized.startswith("./"):
        normalized = normalized[2:]
    return normalized


def finding_fingerprint(finding: Finding) -> str:
    identity = "\n".join(
        (
            finding.rule_id,
            normalize_uri(finding.artifact_uri),
            finding.element_id or finding.model_path,
            finding.property or finding.change_kind or "",
        )
    )
    return hashlib.sha256(identity.encode("utf-8")).hexdigest()


def policy_status(findings: tuple[Finding, ...] | list[Finding]) -> str:
    return "failed" if any(finding.level == "error" for finding in findings) else "passed"
