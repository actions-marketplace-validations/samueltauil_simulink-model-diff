from __future__ import annotations

import json

import pytest

from model_drift.models import (
    AnalysisInfo,
    AnalysisStatus,
    CanonicalModelManifest,
    Fingerprints,
    GeneratorInfo,
    ModelInfo,
    SourceInfo,
)
from model_drift.serialization import (
    canonical_json_bytes,
    canonical_json_text,
    fingerprint_json,
    normalize_repository_path,
    stable_fingerprint,
)


def _manifest() -> CanonicalModelManifest:
    digest = "a" * 64
    return CanonicalModelManifest(
        generator=GeneratorInfo(version="0.1.0", strategy="test"),
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


def test_canonical_json_is_stable_compact_utf8_and_newline_terminated() -> None:
    first = canonical_json_bytes({"z": "Δ", "a": [2, 1]})
    second = canonical_json_bytes({"a": [2, 1], "z": "Δ"})

    assert first == second == b'{"a":[2,1],"z":"\xce\x94"}\n'


def test_domain_model_uses_contract_field_names() -> None:
    document = json.loads(canonical_json_text(_manifest()))

    assert document["$schema"] == "./canonical-model.schema.json"
    assert document["schemaVersion"] == "0.1.0"
    assert document["source"]["artifactSha256"] == "a" * 64
    assert document["analysis"]["unsupportedFeatures"] == []


def test_fingerprints_are_unambiguous_and_can_exclude_volatile_keys() -> None:
    assert stable_fingerprint("ab", "c") != stable_fingerprint("a", "bc")
    assert fingerprint_json({"value": 1, "timestamp": "first"}, exclude_keys={"timestamp"}) == (
        fingerprint_json({"timestamp": "second", "value": 1}, exclude_keys={"timestamp"})
    )


@pytest.mark.parametrize(
    ("source", "expected"),
    [
        (r"models\controller.slx", "models/controller.slx"),
        ("./models//controller.slx", "models/controller.slx"),
    ],
)
def test_repository_paths_are_normalized(source: str, expected: str) -> None:
    assert normalize_repository_path(source) == expected


@pytest.mark.parametrize("path", ["/absolute/model.slx", r"C:\model.slx", "../model.slx"])
def test_repository_paths_reject_unsafe_values(path: str) -> None:
    with pytest.raises(ValueError):
        normalize_repository_path(path)


@pytest.mark.parametrize("value", [float("nan"), float("inf"), float("-inf")])
def test_non_finite_numbers_are_rejected(value: float) -> None:
    with pytest.raises(ValueError):
        canonical_json_text(value)
