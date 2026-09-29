from __future__ import annotations

import json
from importlib.resources import files
from pathlib import Path

from jsonschema import Draft202012Validator

from model_drift.canonicalize import compute_fingerprints
from model_drift.models import (
    AnalysisInfo,
    AnalysisStatus,
    CanonicalModelManifest,
    ChangeEvidence,
    ChangeKind,
    ComparisonInfo,
    DriftChange,
    DriftManifest,
    DriftSummary,
    Fingerprints,
    FunctionalClassification,
    GeneratorInfo,
    ModelInfo,
    SourceInfo,
)
from model_drift.serialization import stable_fingerprint, to_json_value


def _schema(filename: str) -> dict[str, object]:
    resource = files("model_drift.schemas").joinpath(filename)
    return json.loads(resource.read_text(encoding="utf-8"))


def test_schemas_are_valid_draft_2020_12_documents() -> None:
    Draft202012Validator.check_schema(_schema("canonical-model.schema.json"))
    Draft202012Validator.check_schema(_schema("drift-manifest.schema.json"))


def test_minimal_canonical_manifest_validates() -> None:
    digest = "b" * 64
    manifest = CanonicalModelManifest(
        generator=GeneratorInfo(version="0.1.0", strategy="simulink-api"),
        source=SourceInfo(artifact="models/controller.slx", artifact_sha256=digest),
        analysis=AnalysisInfo(status=AnalysisStatus.COMPLETE),
        model=ModelInfo(name="controller", model_type="model", root_path="controller"),
        fingerprints=Fingerprints(
            model=digest,
            structure=digest,
            interfaces=digest,
            parameters=digest,
            stateflow=digest,
            configuration=digest,
        ),
    )

    Draft202012Validator(_schema("canonical-model.schema.json")).validate(
        to_json_value(manifest)
    )


def test_minimal_drift_manifest_validates() -> None:
    change_hash = stable_fingerprint("interface:inport:VehicleSpeed", "dataType")[:32]
    manifest = DriftManifest(
        comparison=ComparisonInfo(
            base_artifact="models/controller-base.slx",
            target_artifact="models/controller-head.slx",
            status=AnalysisStatus.COMPLETE,
        ),
        summary=DriftSummary(modified=1, interface_changes=1),
        changes=(
            DriftChange(
                change_id=f"chg-{change_hash}",
                kind=ChangeKind.MODIFIED,
                category="interface",
                element_type="inport",
                element_id="interface:inport:VehicleSpeed",
                model_path="controller/VehicleSpeed",
                property="dataType",
                before="double",
                after="single",
                functional_classification=FunctionalClassification.POTENTIALLY_FUNCTIONAL,
                evidence=ChangeEvidence(extractor="simulink-api"),
            ),
        ),
    )

    Draft202012Validator(_schema("drift-manifest.schema.json")).validate(
        to_json_value(manifest)
    )


def test_checked_in_contract_examples_validate() -> None:
    root = Path(__file__).parents[1]
    canonical_validator = Draft202012Validator(_schema("canonical-model.schema.json"))
    drift_validator = Draft202012Validator(_schema("drift-manifest.schema.json"))

    for filename in ("controller-base.model.json", "controller-target.model.json"):
        document = json.loads(
            (root / "examples" / "canonical" / filename).read_text(encoding="utf-8")
        )
        canonical_validator.validate(document)
        assert document["fingerprints"] == compute_fingerprints(document)

    drift = json.loads(
        (root / "examples" / "output" / "controller.drift.json").read_text(
            encoding="utf-8"
        )
    )
    drift_validator.validate(drift)
