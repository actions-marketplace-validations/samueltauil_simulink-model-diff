from __future__ import annotations

import json
import tempfile
import zipfile
from copy import deepcopy
from pathlib import Path

from jsonschema import Draft202012Validator

from model_drift.cli import main
from model_drift.reporters import build_sarif
from model_drift.rules import evaluate_rules, load_rules

ROOT = Path(__file__).parents[1]
BASE = ROOT / "samples" / "canonical" / "controller-base.model.json"
TARGET = ROOT / "samples" / "canonical" / "controller-target.model.json"
RULES = ROOT / "samples" / "rules" / "default-rules.yml"


def _json(path: Path) -> object:
    return json.loads(path.read_text(encoding="utf-8"))


def test_compare_cli_emits_valid_deterministic_reports_and_visual_evidence() -> None:
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        first = root / "first"
        second = root / "second"

        assert main(
            [
                "compare",
                "--base",
                str(BASE),
                "--target",
                str(TARGET),
                "--rules",
                str(RULES),
                "--output",
                str(first),
                "--fail-on",
                "none",
            ]
        ) == 0
        assert main(
            [
                "compare",
                "--base",
                str(BASE),
                "--target",
                str(TARGET),
                "--rules",
                str(RULES),
                "--output",
                str(second),
                "--fail-on",
                "none",
            ]
        ) == 0

        names = {
            "model-drift.json",
            "model-drift.md",
            "model-drift.sarif",
            "model-drift.svg",
        }
        assert {path.name for path in first.iterdir()} == names
        for name in names:
            assert (first / name).read_bytes() == (second / name).read_bytes()
        checked_in = {
            "model-drift.json": "controller.drift.json",
            "model-drift.md": "controller-summary.md",
            "model-drift.sarif": "controller.sarif",
            "model-drift.svg": "controller-summary.svg",
        }
        for generated, fixture in checked_in.items():
            assert (first / generated).read_bytes() == (
                ROOT / "samples" / "output" / fixture
            ).read_bytes()

        drift = _json(first / "model-drift.json")
        schema = _json(
            ROOT / "src" / "model_drift" / "schemas" / "drift-manifest.schema.json"
        )
        Draft202012Validator(schema).validate(drift)
        assert drift["summary"] == {
            "added": 1,
            "interfaceChanges": 1,
            "modified": 2,
            "moved": 0,
            "removed": 0,
        }
        properties = {change["property"] for change in drift["changes"]}
        assert "parameters.Gain.value" in properties
        assert "dataType" in properties
        assert any(
            change["kind"] == "added"
            and change["elementId"] == "block:controller/SpeedLoop/Saturation"
            for change in drift["changes"]
        )
        assert "<svg" in (first / "model-drift.svg").read_text(encoding="utf-8")


def test_analyze_cli_extracts_slx_inputs_and_emits_reports() -> None:
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        base_artifact = root / "base.slx"
        target_artifact = root / "target.slx"
        base_artifact.write_bytes(b"base-model")
        target_artifact.write_bytes(b"target-model")
        script = root / "extractor.py"
        script.write_text(
            "\n".join(
                [
                    "import hashlib",
                    "import json",
                    "import sys",
                    "from pathlib import Path",
                    "fixtures = {",
                    f"    'base.slx': Path({str(BASE)!r}).read_text(encoding='utf-8'),",
                    f"    'target.slx': Path({str(TARGET)!r}).read_text(encoding='utf-8'),",
                    "}",
                    "artifact = Path(sys.argv[1])",
                    "manifest = json.loads(fixtures[artifact.name])",
                    "manifest['source']['artifact'] = artifact.name",
                    "manifest['source']['artifactSha256'] = "
                    "hashlib.sha256(artifact.read_bytes()).hexdigest()",
                    "print(json.dumps(manifest))",
                ]
            ),
            encoding="utf-8",
        )
        out = root / "output"

        assert main(
            [
                "analyze",
                "--base",
                str(base_artifact),
                "--target",
                str(target_artifact),
                "--rules",
                str(RULES),
                "--output",
                str(out),
                "--fail-on",
                "none",
                "--extractor-command",
                f"python {script.as_posix()} {{artifact}}",
            ]
        ) == 0
        assert (out / "model-drift.json").exists()
        assert (out / "model-drift.md").exists()
        assert (out / "model-drift.sarif").exists()
        assert (out / "model-drift.svg").exists()


def test_analyze_cli_emits_reports_for_valid_partial_extraction() -> None:
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        artifact = root / "model.slx"
        artifact.write_bytes(b"model")
        partial = deepcopy(_json(BASE))
        partial["analysis"] = {
            "status": "partial",
            "warnings": ["Static extraction only."],
            "unsupportedFeatures": ["compiled-model-attributes"],
        }
        script = root / "extractor.py"
        script.write_text(
            "\n".join(
                [
                    "import hashlib",
                    "import json",
                    "import sys",
                    "from pathlib import Path",
                    f"manifest = {partial!r}",
                    "artifact = Path(sys.argv[1])",
                    "manifest['source']['artifact'] = artifact.name",
                    "manifest['source']['artifactSha256'] = "
                    "hashlib.sha256(artifact.read_bytes()).hexdigest()",
                    "print(json.dumps(manifest))",
                ]
            ),
            encoding="utf-8",
        )
        output = root / "output"

        result = main(
            [
                "analyze",
                "--base",
                str(artifact),
                "--target",
                str(artifact),
                "--output",
                str(output),
                "--fail-on",
                "none",
                "--extractor-command",
                f"python {script.as_posix()} {{artifact}}",
            ]
        )

        assert result == 4
        assert (output / "model-drift.json").is_file()
        assert (output / "model-drift.sarif").is_file()


def test_compare_cli_rejects_invalid_canonical_contract(capsys: object) -> None:
    with tempfile.TemporaryDirectory() as directory:
        target = deepcopy(_json(TARGET))
        target["source"]["artifactSha256"] = "not-a-sha256"  # type: ignore[index]
        invalid = Path(directory) / "invalid.json"
        invalid.write_text(json.dumps(target), encoding="utf-8")

        result = main(
            [
                "compare",
                "--base",
                str(BASE),
                "--target",
                str(invalid),
                "--rules",
                str(RULES),
                "--output",
                str(Path(directory) / "output"),
            ]
        )

        assert result == 2


def test_incomplete_analysis_emits_error_finding_and_nonzero_status() -> None:
    with tempfile.TemporaryDirectory() as directory:
        target = deepcopy(_json(TARGET))
        target["analysis"] = {
            "status": "partial",
            "warnings": ["Referenced model was unavailable."],
            "unsupportedFeatures": ["referenced-model"],
        }
        partial = Path(directory) / "partial.json"
        partial.write_text(json.dumps(target), encoding="utf-8")
        output = Path(directory) / "output"

        assert main(
            [
                "compare",
                "--base",
                str(BASE),
                "--target",
                str(partial),
                "--rules",
                str(RULES),
                "--output",
                str(output),
                "--fail-on",
                "none",
            ]
        ) == 4
        sarif = _json(output / "model-drift.sarif")
        assert any(
            result["ruleId"] == "SIMULINK-ANALYSIS-001"
            for result in sarif["runs"][0]["results"]  # type: ignore[index]
        )


def test_malformed_slx_diagnostics_are_explicit_and_machine_readable() -> None:
    with tempfile.TemporaryDirectory() as directory:
        artifact = Path(directory) / "malformed.slx"
        artifact.write_bytes(b"not a zip archive")
        output = Path(directory) / "diagnostics.json"

        assert main(["inspect-slx", str(artifact), "--output", str(output)]) == 1
        diagnostics = _json(output)
        assert diagnostics["analysis"]["status"] == "failed"  # type: ignore[index]
        assert "not a valid ZIP archive" in diagnostics["analysis"]["error"]  # type: ignore[index]


def test_partial_slx_diagnostics_have_a_failure_exit_status() -> None:
    with tempfile.TemporaryDirectory() as directory:
        artifact = Path(directory) / "diagnostic.slx"
        with zipfile.ZipFile(artifact, "w") as package:
            package.writestr(
                "[Content_Types].xml",
                """\
<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/xml"/>
</Types>
""",
            )

        assert main(["inspect-slx", str(artifact)]) == 1


def test_sarif_fingerprints_ignore_changed_values() -> None:
    drift = _json(ROOT / "samples" / "output" / "controller.drift.json")
    rules = load_rules(RULES)
    first_findings = evaluate_rules(drift, rules)
    changed = deepcopy(drift)
    gain = next(
        change
        for change in changed["changes"]  # type: ignore[index]
        if change.get("property") == "parameters.Gain.value"
    )
    gain["after"] = "4.0"
    second_findings = evaluate_rules(changed, rules)

    first = build_sarif(first_findings, rules)
    second = build_sarif(second_findings, rules)
    first_fingerprints = {
        result["ruleId"]: result["partialFingerprints"]["modelDrift/v1"]
        for result in first["runs"][0]["results"]
    }
    second_fingerprints = {
        result["ruleId"]: result["partialFingerprints"]["modelDrift/v1"]
        for result in second["runs"][0]["results"]
    }
    assert first_fingerprints == second_fingerprints
