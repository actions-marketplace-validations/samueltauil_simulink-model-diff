from __future__ import annotations

from collections.abc import Sequence
from typing import Any

from model_drift.rules import Finding, findings_as_dicts

from .common import deterministic_json, policy_status, to_mapping


def build_json_report(
    drift_manifest: Any, findings: Sequence[Finding]
) -> dict[str, Any]:
    ordered_findings = tuple(findings)
    return {
        "drift": dict(to_mapping(drift_manifest)),
        "policy": {
            "status": policy_status(ordered_findings),
            "findings": findings_as_dicts(ordered_findings),
        },
    }


def render_json(drift_manifest: Any, findings: Sequence[Finding]) -> str:
    return deterministic_json(build_json_report(drift_manifest, findings))
