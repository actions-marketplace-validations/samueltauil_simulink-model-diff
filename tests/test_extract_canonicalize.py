from __future__ import annotations

import hashlib
import json
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

from model_drift.canonicalize import (
    ManifestCanonicalizationError,
    canonical_json,
    canonicalize_manifest,
)
from model_drift.extract import (
    AdapterExtractor,
    AnalysisStatus,
    ExternalCommandExtractor,
    InventoryLimits,
    inspect_slx_package,
)
from model_drift.models import (
    AnalysisInfo,
    CanonicalModelManifest,
    Fingerprints,
    GeneratorInfo,
    ModelInfo,
    SourceInfo,
)

CONTENT_TYPES = """\
<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/simulink/blockdiagram.xml"
    ContentType="application/vnd.mathworks.simulink.blockdiagram+xml"/>
</Types>
"""


class PackageInventoryTests(unittest.TestCase):
    def test_valid_opc_is_partial_not_semantically_complete(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            artifact = Path(directory) / "model.slx"
            with zipfile.ZipFile(artifact, "w", zipfile.ZIP_DEFLATED) as package:
                package.writestr("[Content_Types].xml", CONTENT_TYPES)
                package.writestr("simulink/blockdiagram.xml", "<Model/>")

            result = inspect_slx_package(artifact)

            self.assertEqual(result.status, AnalysisStatus.PARTIAL)
            self.assertTrue(result.is_opc)
            self.assertEqual(
                [entry.name for entry in result.entries],
                ["[Content_Types].xml", "simulink/blockdiagram.xml"],
            )
            self.assertIn(
                "Semantic model extraction requires a supported MATLAB/Simulink "
                "API or official comparison result.",
                result.unsupported_features,
            )

    def test_simulink_structure_summary_identifies_key_slx_members(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            artifact = Path(directory) / "model.slx"
            with zipfile.ZipFile(artifact, "w", zipfile.ZIP_DEFLATED) as package:
                package.writestr("[Content_Types].xml", CONTENT_TYPES)
                package.writestr("metadata/mwcoreProperties.xml", "<props/>")
                package.writestr("simulink/blockdiagram.xml", "<Model/>")
                package.writestr("simulink/stateflow.xml", "<Stateflow/>")

            result = inspect_slx_package(artifact)

            self.assertTrue(result.structure["likelySimulinkPackage"])
            self.assertTrue(result.structure["hasBlockDiagram"])
            self.assertTrue(result.structure["hasStateflow"])
            self.assertIn("simulink/blockdiagram.xml", result.structure["keyFiles"])
            self.assertIn("metadata/mwcoreProperties.xml", result.structure["keyFiles"])

    def test_plain_zip_is_explicitly_unsupported(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            artifact = Path(directory) / "model.slx"
            with zipfile.ZipFile(artifact, "w") as package:
                package.writestr("data.bin", b"data")

            result = inspect_slx_package(artifact)

            self.assertEqual(result.status, AnalysisStatus.UNSUPPORTED)
            self.assertFalse(result.is_opc)

    def test_malformed_archive_is_failed(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            artifact = Path(directory) / "model.slx"
            artifact.write_bytes(b"not a zip")

            result = inspect_slx_package(artifact)

            self.assertEqual(result.status, AnalysisStatus.FAILED)
            self.assertIn("not a valid ZIP archive", result.error or "")

    def test_malformed_opc_manifest_is_failed(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            artifact = Path(directory) / "model.slx"
            with zipfile.ZipFile(artifact, "w") as package:
                package.writestr("[Content_Types].xml", "<Types>")

            result = inspect_slx_package(artifact)

            self.assertEqual(result.status, AnalysisStatus.FAILED)
            self.assertTrue(result.is_opc)
            self.assertIn("Malformed or unreadable", result.error or "")

    def test_archive_limits_fail_closed(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            artifact = Path(directory) / "model.slx"
            with zipfile.ZipFile(artifact, "w") as package:
                package.writestr("[Content_Types].xml", CONTENT_TYPES)
                package.writestr("one.xml", "<one/>")

            result = inspect_slx_package(
                artifact, limits=InventoryLimits(max_entries=1)
            )

            self.assertEqual(result.status, AnalysisStatus.UNSUPPORTED)
            self.assertIn("exceeding the configured limit", result.unsupported_features[0])

    def test_compressed_archive_size_limit_is_checked_before_reading(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            artifact = Path(directory) / "model.slx"
            artifact.write_bytes(b"more than one byte")

            result = inspect_slx_package(
                artifact,
                limits=InventoryLimits(max_archive_bytes=1),
            )

            self.assertEqual(result.status, AnalysisStatus.UNSUPPORTED)
            self.assertIsNone(result.artifact_sha256)


class SemanticExtractorTests(unittest.TestCase):
    def _manifest(self, artifact: Path) -> dict[str, object]:
        manifest = {
            "$schema": "./canonical-model.schema.json",
            "schemaVersion": "0.1.0",
            "generator": {
                "name": "test-extractor",
                "version": "1",
                "strategy": "supported-api",
            },
            "source": {
                "artifact": "model.slx",
                "artifactSha256": hashlib.sha256(artifact.read_bytes()).hexdigest(),
                "simulinkRelease": None,
            },
            "analysis": {
                "status": "complete",
                "warnings": [],
                "unsupportedFeatures": [],
            },
            "model": {"name": "model", "modelType": "model", "rootPath": "model"},
            "interfaces": {
                "inports": [],
                "outports": [],
                "triggerPorts": [],
                "enablePorts": [],
                "buses": [],
            },
            "systems": [],
            "blocks": [],
            "connections": [],
            "stateflow": {
                "charts": [],
                "states": [],
                "transitions": [],
                "junctions": [],
                "events": [],
                "data": [],
            },
            "configuration": {},
            "references": {
                "models": [],
                "libraries": [],
                "dataDictionaries": [],
                "requirements": [],
            },
            "fingerprints": {
                "model": "0" * 64,
                "structure": "0" * 64,
                "interfaces": "0" * 64,
                "parameters": "0" * 64,
                "stateflow": "0" * 64,
                "configuration": "0" * 64,
            },
        }
        return manifest

    def test_adapter_requires_explicit_status_and_validates_artifact_hash(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            artifact = Path(directory) / "model.slx"
            artifact.write_bytes(b"semantic fixture")
            manifest = self._manifest(artifact)

            result = AdapterExtractor(lambda _: manifest).extract(artifact)

            self.assertEqual(result.status, AnalysisStatus.COMPLETE)
            self.assertIsNotNone(result.manifest)

            manifest["analysis"]["status"] = "partial"  # type: ignore[index]
            manifest["analysis"]["unsupportedFeatures"] = ["stateflow"]  # type: ignore[index]
            result = AdapterExtractor(lambda _: manifest).extract(artifact)
            self.assertEqual(result.status, AnalysisStatus.PARTIAL)

    def test_adapter_rejects_missing_status_and_hash_mismatch(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            artifact = Path(directory) / "model.slx"
            artifact.write_bytes(b"semantic fixture")
            manifest = self._manifest(artifact)
            del manifest["analysis"]  # type: ignore[misc]

            result = AdapterExtractor(lambda _: manifest).extract(artifact)
            self.assertEqual(result.status, AnalysisStatus.FAILED)
            self.assertIn("explicitly report analysis.status", result.error or "")

            manifest = self._manifest(artifact)
            manifest["source"]["artifactSha256"] = "f" * 64  # type: ignore[index]
            result = AdapterExtractor(lambda _: manifest).extract(artifact)
            self.assertEqual(result.status, AnalysisStatus.FAILED)
            self.assertIn("does not match", result.error or "")

    def test_external_command_reads_manifest_without_shell_and_bounds_result(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            artifact = root / "model.slx"
            artifact.write_bytes(b"semantic fixture")
            manifest_path = root / "manifest.json"
            manifest_path.write_text(json.dumps(self._manifest(artifact)), encoding="utf-8")
            command = (
                sys.executable,
                "-c",
                "import pathlib,sys; print(pathlib.Path(sys.argv[1]).read_text())",
                str(manifest_path),
            )

            result = ExternalCommandExtractor(command).extract(artifact)

            self.assertEqual(result.status, AnalysisStatus.COMPLETE)

    def test_external_command_timeout_is_failed(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            artifact = Path(directory) / "model.slx"
            artifact.write_bytes(b"semantic fixture")
            command = (sys.executable, "-c", "import time; time.sleep(1)")

            result = ExternalCommandExtractor(command, timeout_seconds=0.01).extract(artifact)

            self.assertEqual(result.status, AnalysisStatus.FAILED)
            self.assertIn("timed out", result.error or "")


class CanonicalizationTests(unittest.TestCase):
    def _manifest(self) -> dict[str, object]:
        return {
            "schemaVersion": "0.1.0",
            "generatedAt": "volatile",
            "analysis": {
                "status": "complete",
                "warnings": ["z", "a", "a"],
                "unsupportedFeatures": [],
            },
            "source": {"artifact": r".\models\controller.slx"},
            "model": {"name": "controller", "rootPath": r"controller\\"},
            "interfaces": {
                "inports": [
                    {"id": "interface:inport:B", "name": "B", "port": 2},
                    {"id": "interface:inport:A", "name": "A", "port": 1},
                ]
            },
            "systems": [],
            "blocks": [
                {
                    "path": r"controller\B",
                    "parameters": {"Gain": {"value": "2.5"}},
                },
                {
                    "path": r"controller\A",
                    "parameters": {"Gain": {"value": "1"}},
                },
            ],
            "connections": [
                {
                    "source": {"blockId": "block:controller/A", "port": 1},
                    "destination": {"blockId": "block:controller/B", "port": 1},
                }
            ],
            "stateflow": {},
            "configuration": {"Solver": "FixedStepAuto"},
            "references": {},
        }

    def test_output_and_fingerprints_are_deterministic(self) -> None:
        first = canonicalize_manifest(self._manifest())
        reversed_manifest = self._manifest()
        reversed_manifest["blocks"] = list(
            reversed(reversed_manifest["blocks"])  # type: ignore[index]
        )

        second = canonicalize_manifest(reversed_manifest)

        self.assertEqual(first, second)
        self.assertEqual(
            [block["id"] for block in first["blocks"]],
            ["block:controller/A", "block:controller/B"],
        )
        self.assertTrue(first["connections"][0]["id"].startswith("connection:"))
        self.assertEqual(first["analysis"]["warnings"], ["a", "z"])
        self.assertNotIn("generatedAt", first)
        self.assertEqual(
            first["source"]["artifact"],
            "models/controller.slx",
        )
        self.assertEqual(canonical_json(first), canonical_json(second))

    def test_parameter_change_only_changes_parameter_and_model_fingerprints(self) -> None:
        before = canonicalize_manifest(self._manifest())
        changed = self._manifest()
        changed["blocks"][0]["parameters"]["Gain"]["value"] = "3"  # type: ignore[index]
        after = canonicalize_manifest(changed)

        self.assertEqual(
            before["fingerprints"]["structure"],
            after["fingerprints"]["structure"],
        )
        self.assertNotEqual(
            before["fingerprints"]["parameters"],
            after["fingerprints"]["parameters"],
        )
        self.assertNotEqual(
            before["fingerprints"]["model"],
            after["fingerprints"]["model"],
        )

    def test_domain_manifest_is_a_supported_input(self) -> None:
        digest = "a" * 64
        manifest = CanonicalModelManifest(
            generator=GeneratorInfo(version="0.1.0", strategy="simulink-api"),
            source=SourceInfo(
                artifact=r"models\controller.slx",
                artifact_sha256=digest,
            ),
            analysis=AnalysisInfo(status=AnalysisStatus.COMPLETE),
            model=ModelInfo(
                name="controller",
                model_type="model",
                root_path="controller",
            ),
            fingerprints=Fingerprints(
                model=digest,
                structure=digest,
                interfaces=digest,
                parameters=digest,
                stateflow=digest,
                configuration=digest,
            ),
        )

        result = canonicalize_manifest(manifest)

        self.assertEqual(result["source"]["artifact"], "models/controller.slx")
        self.assertEqual(result["analysis"]["status"], "complete")
        self.assertNotEqual(result["fingerprints"]["model"], digest)

    def test_unsafe_repository_artifact_path_is_rejected(self) -> None:
        manifest = self._manifest()
        manifest["source"] = {"artifact": "../controller.slx"}

        with self.assertRaises(ManifestCanonicalizationError):
            canonicalize_manifest(manifest)

    def test_semantic_timestamp_parameter_is_not_discarded(self) -> None:
        manifest = self._manifest()
        manifest["blocks"][0]["parameters"]["timestamp"] = {  # type: ignore[index]
            "value": "10",
            "valueType": "expression",
        }

        result = canonicalize_manifest(manifest)

        self.assertIn("timestamp", result["blocks"][1]["parameters"])


if __name__ == "__main__":
    unittest.main()
