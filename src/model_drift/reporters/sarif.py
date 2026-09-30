from __future__ import annotations

import re
from collections.abc import Sequence
from typing import Any

from model_drift.rules import Finding, Rule

from .common import deterministic_json, finding_fingerprint, normalize_uri

SARIF_SCHEMA = "https://json.schemastore.org/sarif-2.1.0.json"


def build_sarif(
    findings: Sequence[Finding],
    rules: Sequence[Rule],
    *,
    tool_version: str = "0.3.0",
    information_uri: str = "https://github.com/github/simulink-model-drift",
) -> dict[str, Any]:
    rule_by_id = {rule.id: rule for rule in rules}
    used_rule_ids = {finding.rule_id for finding in findings}
    sarif_rules = [
        _sarif_rule(rule_by_id[rule_id])
        for rule_id in sorted(used_rule_ids)
        if rule_id in rule_by_id
    ]
    ordered_findings = sorted(
        findings,
        key=lambda item: (
            item.rule_id,
            normalize_uri(item.artifact_uri),
            item.model_path,
            item.property or "",
            item.change_id or "",
        ),
    )
    return {
        "$schema": SARIF_SCHEMA,
        "version": "2.1.0",
        "runs": [
            {
                "tool": {
                    "driver": {
                        "name": "Simulink Model Drift Analyzer",
                        "version": tool_version,
                        "informationUri": information_uri,
                        "rules": sarif_rules,
                    }
                },
                "results": [_sarif_result(finding) for finding in ordered_findings],
            }
        ],
    }


def render_sarif(
    findings: Sequence[Finding],
    rules: Sequence[Rule],
    *,
    tool_version: str = "0.3.0",
    information_uri: str = "https://github.com/github/simulink-model-drift",
) -> str:
    return deterministic_json(
        build_sarif(
            findings,
            rules,
            tool_version=tool_version,
            information_uri=information_uri,
        )
    )


def _sarif_rule(rule: Rule) -> dict[str, Any]:
    result: dict[str, Any] = {
        "id": rule.id,
        "name": _rule_name(rule.title),
        "shortDescription": {"text": rule.title},
        "defaultConfiguration": {"level": rule.level},
        "properties": {"category": rule.category},
    }
    if rule.description:
        result["fullDescription"] = {"text": rule.description}
    return result


def _sarif_result(finding: Finding) -> dict[str, Any]:
    properties = {
        "modelPath": finding.model_path,
        "category": finding.category,
        "changeKind": finding.change_kind,
        "property": finding.property,
        "before": finding.before,
        "after": finding.after,
        "changeId": finding.change_id,
        "elementId": finding.element_id,
    }
    return {
        "ruleId": finding.rule_id,
        "level": finding.level,
        "message": {"text": finding.message},
        "locations": [
            {
                "physicalLocation": {
                    "artifactLocation": {
                        "uri": normalize_uri(finding.artifact_uri),
                        "uriBaseId": "%SRCROOT%",
                    }
                },
                "logicalLocations": [
                    {
                        "fullyQualifiedName": finding.model_path,
                        "kind": finding.logical_kind,
                    }
                ],
            }
        ],
        "partialFingerprints": {
            "modelDrift/v1": finding_fingerprint(finding),
        },
        "properties": {
            key: value for key, value in properties.items() if value is not None
        },
    }


def _rule_name(title: str) -> str:
    words = re.findall(r"[A-Za-z0-9]+", title)
    return "".join(word[:1].upper() + word[1:] for word in words) or "ModelDriftRule"
