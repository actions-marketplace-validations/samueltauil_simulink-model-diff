"""Import external quality and test evidence into the pull-request review."""

from __future__ import annotations

import json
import re
import xml.etree.ElementTree as ET
from collections import Counter
from collections.abc import Mapping, Sequence
from pathlib import Path, PurePosixPath
from typing import Any

from model_drift.serialization import normalize_repository_path

_MAX_EVIDENCE_BYTES = 64 * 1024 * 1024
_MAX_RECORDS = 100_000


def collect_external_evidence(
    repository: Path,
    evidence_paths: Sequence[Path],
    required_paths: Sequence[Path],
    models: Sequence[Mapping[str, Any]],
) -> dict[str, Any]:
    declared = [(path, False) for path in evidence_paths] + [
        (path, True) for path in required_paths
    ]
    unique: dict[str, tuple[Path, bool]] = {}
    for path, required in declared:
        relative = _relative_path(repository, path)
        previous = unique.get(relative)
        unique[relative] = (path, required or bool(previous and previous[1]))

    sources: list[dict[str, Any]] = []
    findings: list[dict[str, Any]] = []
    tests: list[dict[str, Any]] = []
    for relative, (requested, required) in sorted(unique.items()):
        path = requested if requested.is_absolute() else repository / requested
        if not path.is_file():
            level = "error" if required else "warning"
            findings.append(
                {
                    "source": relative,
                    "tool": "simulink-model-drift",
                    "ruleId": "EVIDENCE-MISSING",
                    "level": level,
                    "message": f"Declared evidence file is missing: {relative}",
                    "artifactUri": relative,
                    "modelId": None,
                }
            )
            sources.append(
                {
                    "path": relative,
                    "required": required,
                    "format": "unknown",
                    "status": "missing",
                    "tool": None,
                    "records": 0,
                }
            )
            continue
        try:
            if path.stat().st_size > _MAX_EVIDENCE_BYTES:
                raise ValueError("evidence file exceeds 64 MiB")
            if path.suffix.lower() in {".xml", ".junit"}:
                parsed_tests, tool = _parse_junit(path, models)
                if len(parsed_tests) > _MAX_RECORDS:
                    raise ValueError("JUnit evidence exceeds 100000 test cases")
                tests.extend(parsed_tests)
                sources.append(
                    {
                        "path": relative,
                        "required": required,
                        "format": "junit",
                        "status": _test_source_status(parsed_tests),
                        "tool": tool,
                        "records": len(parsed_tests),
                    }
                )
            else:
                parsed_findings, tool = _parse_sarif(path, models)
                if len(parsed_findings) > _MAX_RECORDS:
                    raise ValueError("SARIF evidence exceeds 100000 results")
                findings.extend(parsed_findings)
                sources.append(
                    {
                        "path": relative,
                        "required": required,
                        "format": "sarif",
                        "status": _finding_source_status(parsed_findings),
                        "tool": tool,
                        "records": len(parsed_findings),
                    }
                )
        except (OSError, ValueError, json.JSONDecodeError, ET.ParseError) as exc:
            level = "error" if required else "warning"
            findings.append(
                {
                    "source": relative,
                    "tool": "simulink-model-drift",
                    "ruleId": "EVIDENCE-INVALID",
                    "level": level,
                    "message": f"Evidence could not be imported: {exc}",
                    "artifactUri": relative,
                    "modelId": None,
                }
            )
            sources.append(
                {
                    "path": relative,
                    "required": required,
                    "format": "unknown",
                    "status": "invalid",
                    "tool": None,
                    "records": 0,
                }
            )

    findings.sort(
        key=lambda item: (
            str(item["level"]),
            str(item["tool"]),
            str(item["ruleId"]),
            str(item["artifactUri"]),
            str(item["message"]),
        )
    )
    tests.sort(
        key=lambda item: (
            str(item["status"]),
            str(item["suite"]),
            str(item["name"]),
        )
    )
    counts = Counter(str(item["level"]) for item in findings)
    test_counts = Counter(str(item["status"]) for item in tests)
    status = (
        "blocked"
        if counts["error"] or test_counts["failed"] or test_counts["error"]
        else "review-required"
        if counts["warning"]
        else "clear"
    )
    return {
        "status": status,
        "sources": sources,
        "findings": findings,
        "tests": tests,
        "summary": {
            "findings": dict(sorted(counts.items())),
            "tests": dict(sorted(test_counts.items())),
            "mappedFindings": sum(item.get("modelId") is not None for item in findings),
            "unmappedFindings": sum(item.get("modelId") is None for item in findings),
            "mappedTests": sum(item.get("modelId") is not None for item in tests),
            "unmappedTests": sum(item.get("modelId") is None for item in tests),
            "missingRequired": sum(
                source["required"] and source["status"] == "missing" for source in sources
            ),
        },
    }


def evidence_for_model(evidence: Mapping[str, Any], model_id: str) -> dict[str, Any]:
    findings = [
        item
        for item in evidence.get("findings", ())
        if isinstance(item, Mapping) and item.get("modelId") == model_id
    ]
    tests = [
        item
        for item in evidence.get("tests", ())
        if isinstance(item, Mapping) and item.get("modelId") == model_id
    ]
    finding_counts = Counter(str(item["level"]) for item in findings)
    test_counts = Counter(str(item["status"]) for item in tests)
    return {
        "findings": findings,
        "tests": tests,
        "summary": {
            "findings": dict(sorted(finding_counts.items())),
            "tests": dict(sorted(test_counts.items())),
        },
    }


def empty_external_evidence() -> dict[str, Any]:
    return {
        "status": "clear",
        "sources": [],
        "findings": [],
        "tests": [],
        "summary": {
            "findings": {},
            "tests": {},
            "mappedFindings": 0,
            "unmappedFindings": 0,
            "mappedTests": 0,
            "unmappedTests": 0,
            "missingRequired": 0,
        },
    }


def build_external_sarif_runs(evidence: Mapping[str, Any]) -> list[dict[str, Any]]:
    grouped: dict[str, list[Mapping[str, Any]]] = {}
    for finding in evidence.get("findings", ()):
        if not isinstance(finding, Mapping):
            continue
        grouped.setdefault(str(finding.get("tool", "External evidence")), []).append(
            finding
        )
    runs = []
    for tool, findings in sorted(grouped.items()):
        rule_ids = sorted({str(item.get("ruleId", "external-finding")) for item in findings})
        runs.append(
            {
                "tool": {
                    "driver": {
                        "name": tool,
                        "rules": [
                            {
                                "id": rule_id,
                                "shortDescription": {"text": rule_id},
                            }
                            for rule_id in rule_ids
                        ],
                    }
                },
                "results": [
                    {
                        "ruleId": str(item.get("ruleId", "external-finding")),
                        "level": str(item.get("level", "warning")),
                        "message": {"text": str(item.get("message", "External finding"))},
                        "locations": [
                            {
                                "physicalLocation": {
                                    "artifactLocation": {
                                        "uri": str(item.get("artifactUri", item.get("source", "")))
                                    }
                                }
                            }
                        ],
                        "properties": {
                            "sourceEvidence": item.get("source"),
                            "modelId": item.get("modelId"),
                        },
                    }
                    for item in findings
                ],
            }
        )
    return runs


def _parse_sarif(
    path: Path,
    models: Sequence[Mapping[str, Any]],
) -> tuple[list[dict[str, Any]], str]:
    document = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(document, Mapping) or document.get("version") != "2.1.0":
        raise ValueError("expected SARIF 2.1.0")
    records = []
    tools = []
    for run in document.get("runs", ()):
        if not isinstance(run, Mapping):
            continue
        driver = (
            run.get("tool", {}).get("driver", {})
            if isinstance(run.get("tool"), Mapping)
            else {}
        )
        tool = str(driver.get("name", "SARIF"))
        tools.append(tool)
        for result in run.get("results", ()):
            if not isinstance(result, Mapping):
                continue
            uri = _sarif_uri(result)
            logical = _sarif_logical(result)
            records.append(
                {
                    "source": path.name,
                    "tool": tool,
                    "ruleId": str(result.get("ruleId", "external-finding")),
                    "level": _sarif_level(str(result.get("level", "warning"))),
                    "message": _message_text(result.get("message")),
                    "artifactUri": uri or logical or path.name,
                    "logicalLocation": logical,
                    "modelId": _map_model(uri or logical, models),
                }
            )
    return records, ", ".join(sorted(set(tools))) or "SARIF"


def _parse_junit(
    path: Path,
    models: Sequence[Mapping[str, Any]],
) -> tuple[list[dict[str, Any]], str]:
    payload = path.read_bytes()
    if b"<!DOCTYPE" in payload.upper():
        raise ValueError("JUnit XML document types are not supported")
    root = ET.fromstring(payload)
    suites = [root] if root.tag == "testsuite" else list(root.findall(".//testsuite"))
    records = []
    for suite in suites:
        suite_name = suite.attrib.get("name", "test suite")
        for case in suite.findall("testcase"):
            status = "passed"
            detail = None
            for tag, value in (("failure", "failed"), ("error", "error"), ("skipped", "skipped")):
                element = case.find(tag)
                if element is not None:
                    status = value
                    detail = element.attrib.get("message") or (element.text or "").strip() or None
                    break
            hint = (
                case.attrib.get("file")
                or case.attrib.get("classname")
                or case.attrib.get("name")
                or ""
            )
            records.append(
                {
                    "source": path.name,
                    "tool": "JUnit",
                    "suite": suite_name,
                    "name": case.attrib.get("name", "test"),
                    "classname": case.attrib.get("classname"),
                    "file": case.attrib.get("file"),
                    "status": status,
                    "durationSeconds": _float_or_none(case.attrib.get("time")),
                    "message": detail,
                    "modelId": _map_model(hint, models),
                }
            )
    if not suites:
        raise ValueError("expected JUnit testsuite or testsuites document")
    return records, "JUnit"


def _map_model(hint: str | None, models: Sequence[Mapping[str, Any]]) -> str | None:
    if not hint:
        return None
    normalized_hint = str(hint).replace("\\", "/").lower()
    hint_tokens = set(re.split(r"[^a-z0-9_.-]+", normalized_hint))
    exact = []
    basename = []
    for model in models:
        path = str(model.get("headPath") or model.get("basePath") or "")
        if not path:
            continue
        lowered = path.lower()
        if lowered == normalized_hint or normalized_hint.endswith(f"/{lowered}"):
            exact.append(str(model["id"]))
        if PurePosixPath(lowered).name in hint_tokens:
            basename.append(str(model["id"]))
    if len(set(exact)) == 1:
        return exact[0]
    return basename[0] if len(set(basename)) == 1 else None


def _relative_path(repository: Path, path: Path) -> str:
    candidate = path if path.is_absolute() else repository / path
    try:
        relative = candidate.resolve().relative_to(repository.resolve())
    except ValueError as exc:
        raise ValueError(f"evidence path must remain inside repository: {path}") from exc
    return normalize_repository_path(relative)


def _sarif_uri(result: Mapping[str, Any]) -> str | None:
    locations = result.get("locations")
    if not isinstance(locations, list) or not locations:
        return None
    location = locations[0]
    if not isinstance(location, Mapping):
        return None
    physical = location.get("physicalLocation")
    if not isinstance(physical, Mapping):
        return None
    artifact = physical.get("artifactLocation")
    return (
        str(artifact.get("uri"))
        if isinstance(artifact, Mapping) and artifact.get("uri")
        else None
    )


def _sarif_logical(result: Mapping[str, Any]) -> str | None:
    locations = result.get("locations")
    if not isinstance(locations, list) or not locations:
        return None
    location = locations[0]
    if not isinstance(location, Mapping):
        return None
    logical = location.get("logicalLocations")
    if not isinstance(logical, list) or not logical or not isinstance(logical[0], Mapping):
        return None
    value = logical[0].get("fullyQualifiedName")
    return str(value) if value else None


def _message_text(message: object) -> str:
    if isinstance(message, Mapping):
        return str(message.get("text") or message.get("markdown") or "External finding")
    return str(message or "External finding")


def _sarif_level(level: str) -> str:
    return {"error": "error", "warning": "warning", "note": "note", "none": "note"}.get(
        level.lower(), "warning"
    )


def _finding_source_status(findings: Sequence[Mapping[str, Any]]) -> str:
    levels = {str(item.get("level")) for item in findings}
    return "blocked" if "error" in levels else "review-required" if "warning" in levels else "clear"


def _test_source_status(tests: Sequence[Mapping[str, Any]]) -> str:
    statuses = {str(item.get("status")) for item in tests}
    return "blocked" if statuses & {"failed", "error"} else "clear"


def _float_or_none(value: str | None) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except ValueError:
        return None
