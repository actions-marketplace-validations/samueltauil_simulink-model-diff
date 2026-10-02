from __future__ import annotations

import json
from pathlib import Path

import pytest

from model_drift.evidence import (
    collect_external_evidence,
    evidence_for_model,
)

MODELS = (
    {
        "id": "controller-id",
        "headPath": "models/controller.slx",
        "basePath": "models/controller.slx",
    },
)


def test_sarif_error_maps_to_model_and_blocks(tmp_path: Path) -> None:
    evidence = tmp_path / "quality.sarif"
    evidence.write_text(
        json.dumps(
            {
                "version": "2.1.0",
                "runs": [
                    {
                        "tool": {"driver": {"name": "Model Advisor"}},
                        "results": [
                            {
                                "ruleId": "MA-001",
                                "level": "error",
                                "message": {"text": "Unsafe setting"},
                                "locations": [
                                    {
                                        "physicalLocation": {
                                            "artifactLocation": {
                                                "uri": "models/controller.slx"
                                            }
                                        }
                                    }
                                ],
                            }
                        ],
                    }
                ],
            }
        ),
        encoding="utf-8",
    )

    result = collect_external_evidence(
        tmp_path, (Path("quality.sarif"),), (), MODELS
    )

    assert result["status"] == "blocked"
    assert result["summary"]["mappedFindings"] == 1
    assert evidence_for_model(result, "controller-id")["summary"]["findings"] == {
        "error": 1
    }


def test_junit_failure_blocks_and_maps_file_attribute(tmp_path: Path) -> None:
    (tmp_path / "tests.xml").write_text(
        """<?xml version="1.0"?>
<testsuite name="controller tests" tests="1" failures="1">
  <testcase name="holds limit" classname="Controller" file="models/controller.slx">
    <failure message="Expected 65, got 70" />
  </testcase>
</testsuite>
""",
        encoding="utf-8",
    )

    result = collect_external_evidence(
        tmp_path, (Path("tests.xml"),), (), MODELS
    )

    assert result["status"] == "blocked"
    assert result["tests"][0]["modelId"] == "controller-id"
    assert result["summary"]["tests"] == {"failed": 1}


def test_missing_required_evidence_blocks_explicitly(tmp_path: Path) -> None:
    result = collect_external_evidence(
        tmp_path, (), (Path("required-results.sarif"),), MODELS
    )

    assert result["status"] == "blocked"
    assert result["summary"]["missingRequired"] == 1
    assert result["findings"][0]["ruleId"] == "EVIDENCE-MISSING"


def test_model_mapping_does_not_use_partial_basename_matches(tmp_path: Path) -> None:
    evidence = tmp_path / "quality.sarif"
    evidence.write_text(
        json.dumps(
            {
                "version": "2.1.0",
                "runs": [
                    {
                        "tool": {"driver": {"name": "Fixture lint"}},
                        "results": [
                            {
                                "ruleId": "FIXTURE-001",
                                "level": "warning",
                                "message": {"text": "Finding belongs to data.slx"},
                                "locations": [
                                    {
                                        "physicalLocation": {
                                            "artifactLocation": {
                                                "uri": "models/data.slx"
                                            }
                                        }
                                    }
                                ],
                            }
                        ],
                    }
                ],
            }
        ),
        encoding="utf-8",
    )
    short_name_model = (
        {
            "id": "short-id",
            "headPath": "models/a.slx",
            "basePath": "models/a.slx",
        },
    )

    result = collect_external_evidence(
        tmp_path, (Path("quality.sarif"),), (), short_name_model
    )

    assert result["summary"]["mappedFindings"] == 0
    assert result["summary"]["unmappedFindings"] == 1


def test_evidence_path_must_remain_inside_repository(tmp_path: Path) -> None:
    outside = tmp_path.parent / "outside.sarif"

    with pytest.raises(ValueError, match="must remain inside repository"):
        collect_external_evidence(tmp_path, (outside,), (), MODELS)
