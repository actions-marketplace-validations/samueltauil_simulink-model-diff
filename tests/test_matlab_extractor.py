from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WRAPPER = ROOT / "tools" / "run_matlab_extractor.py"
MATLAB_SCRIPT = ROOT / "tools" / "matlab" / "extract_simulink_model.m"


def _run_wrapper(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(WRAPPER), *args],
        capture_output=True,
        text=True,
        check=False,
    )


def test_matlab_extractor_scaffold_exists_and_documents_contract() -> None:
    assert MATLAB_SCRIPT.exists()
    text = MATLAB_SCRIPT.read_text(encoding="utf-8")
    assert "extract_simulink_model" in text
    assert "unsupportedFeatures" in text
    assert "analysis" in text
    assert "MATLAB/Simulink is unavailable" in text
    assert "load_system(artifact)" in text
    assert "find_system" in text
    assert "'DialogParameters'" in text
    assert "get_param(handle, name)" in text
    assert "'SrcPortHandle'" in text
    assert "'DstPortHandle'" in text
    assert "'DataDictionary'" in text
    assert "Stateflow.Machine" in text
    assert "sha256_file(artifact)" in text
    assert "'compiled-model-attributes'" in text
    assert "fileread(" not in text
    assert "SearchDepth', 'all'" not in text


def test_matlab_extractor_dry_run_validates_arguments_without_running_matlab(
    tmp_path: Path,
) -> None:
    artifact = tmp_path / "controller.slx"
    artifact.write_text("not actually a model", encoding="utf-8")

    result = _run_wrapper(str(artifact), "--dry-run", "--json")

    assert result.returncode == 0
    payload = json.loads(result.stdout)
    assert payload["status"] == "dry-run"
    assert payload["artifact"] == str(artifact.resolve())
    assert payload["matlabExecutable"] is None


def test_matlab_extractor_uses_stubbed_matlab_and_writes_manifest(tmp_path: Path) -> None:
    artifact = tmp_path / "controller.slx"
    artifact.write_bytes(b"not really a slx")
    artifact_hash = hashlib.sha256(artifact.read_bytes()).hexdigest()

    stub = tmp_path / "fake_matlab.py"
    manifest = {
        "$schema": ("https://schemas.example.org/simulink-model-drift/canonical-model/0.1.0"),
        "schemaVersion": "0.1.0",
        "generator": {
            "name": "stubbed-matlab",
            "version": "0.1.0",
            "strategy": "test-fake",
        },
        "source": {
            "artifact": "controller.slx",
            "artifactSha256": artifact_hash,
            "simulinkRelease": "R2024a",
        },
        "analysis": {
            "status": "partial",
            "warnings": ["static pass"],
            "unsupportedFeatures": ["compiled-model-attributes"],
        },
        "model": {
            "name": "controller",
            "modelType": "model",
            "rootPath": "controller",
        },
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
            "model": "1" * 64,
            "structure": "2" * 64,
            "interfaces": "3" * 64,
            "parameters": "4" * 64,
            "stateflow": "5" * 64,
            "configuration": "6" * 64,
        },
    }
    stub.write_text(
        f"import json\nprint(json.dumps({manifest!r}))\n",
        encoding="utf-8",
    )
    output = tmp_path / "manifest.json"

    result = _run_wrapper(
        str(artifact),
        "--matlab-executable",
        str(stub),
        "--output",
        str(output),
        "--json",
    )

    assert result.returncode == 0
    payload = json.loads(result.stdout)
    assert payload["schemaVersion"] == "0.1.0"
    assert payload["analysis"]["status"] == "partial"
    assert output.exists()
    written = json.loads(output.read_text(encoding="utf-8"))
    assert written == payload
    assert written["source"]["artifactSha256"] == artifact_hash
    assert written["fingerprints"]["model"] != "1" * 64


def test_matlab_extractor_rejects_contract_or_hash_mismatch(tmp_path: Path) -> None:
    artifact = tmp_path / "controller.slx"
    artifact.write_bytes(b"not really a slx")
    stub = tmp_path / "fake_matlab.py"
    invalid_manifest = {
        "analysis": {
            "status": "complete",
            "warnings": [],
            "unsupportedFeatures": [],
        },
        "source": {
            "artifact": "controller.slx",
            "artifactSha256": "0" * 64,
        },
    }
    stub.write_text(
        f"import json\nprint(json.dumps({invalid_manifest!r}))\n",
        encoding="utf-8",
    )

    result = _run_wrapper(
        str(artifact),
        "--matlab-executable",
        str(stub),
        "--json",
    )

    assert result.returncode == 4
    payload = json.loads(result.stdout)
    assert payload["status"] == "error"
    assert "contract validation failed" in payload["message"].lower()


def test_matlab_batch_command_uses_matlab_string_literals(tmp_path: Path) -> None:
    artifact = tmp_path / "controller's model.slx"
    artifact.write_bytes(b"fixture")
    stub = tmp_path / "fake_matlab.py"
    stub.write_text("import sys; sys.exit(1)\n", encoding="utf-8")

    result = _run_wrapper(
        str(artifact),
        "--matlab-executable",
        str(stub),
        "--dry-run",
        "--json",
    )

    assert result.returncode == 0
    command = json.loads(result.stdout)["command"][-1]
    assert command.startswith("addpath('")
    assert "extract_simulink_model('" in command
    assert "controller''s model.slx" in command
    assert "run(" not in command


def test_matlab_output_option_keeps_manifest_on_stdout_for_validation(
    tmp_path: Path,
) -> None:
    artifact = tmp_path / "controller.slx"
    artifact.write_bytes(b"fixture")
    output = tmp_path / "manifest.json"
    stub = tmp_path / "fake_matlab.py"
    stub.write_text("import sys; sys.exit(1)\n", encoding="utf-8")

    result = _run_wrapper(
        str(artifact),
        "--matlab-executable",
        str(stub),
        "--output",
        str(output),
        "--dry-run",
        "--json",
    )

    assert result.returncode == 0
    payload = json.loads(result.stdout)
    assert payload["outputPath"] == str(output.resolve())
    assert payload["command"][-1].endswith(", '');")


def test_matlab_extractor_reports_missing_matlab_explicitly() -> None:
    artifact = Path("example.slx")
    if artifact.exists():
        artifact.unlink()
    artifact.write_text("not a model", encoding="utf-8")
    try:
        result = _run_wrapper(str(artifact), "--json")
    finally:
        artifact.unlink()

    assert result.returncode == 10
    payload = json.loads(result.stdout)
    assert payload["status"] == "error"
    assert "MATLAB/Simulink" in payload["message"]


def test_matlab_extractor_rejects_non_model_artifact(tmp_path: Path) -> None:
    artifact = tmp_path / "controller.json"
    artifact.write_text("{}", encoding="utf-8")

    result = _run_wrapper(str(artifact), "--dry-run", "--json")

    assert result.returncode == 2
    payload = json.loads(result.stdout)
    assert payload["status"] == "error"
    assert ".slx or .mdl" in payload["message"]


def test_matlab_extractor_propagates_failure_exit_status() -> None:
    with subprocess.Popen(
        [
            sys.executable,
            "-c",
            "import sys; sys.stderr.write('simulink model unavailable\\n'); sys.exit(7)",
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    ) as process:
        assert process.wait() == 7

    artifact = Path("stub-model.slx")
    artifact.write_text("not a model", encoding="utf-8")
    stubs_dir = Path(__file__).resolve().parent / "tmp_stub_bin"
    stubs_dir.mkdir(exist_ok=True)
    stub = stubs_dir / "fake_matlab_fail.py"
    stub.write_text(
        "import sys\nsys.stderr.write('simulink model unavailable\\n')\nsys.exit(7)\n",
        encoding="utf-8",
    )
    try:
        result = _run_wrapper(str(artifact), "--matlab-executable", str(stub), "--json")
    finally:
        artifact.unlink()
        if stub.exists():
            stub.unlink()
        if stubs_dir.exists() and not any(stubs_dir.iterdir()):
            stubs_dir.rmdir()

    assert result.returncode == 7
    payload = json.loads(result.stdout)
    assert payload["status"] == "error"
    assert payload["stderr"] == "simulink model unavailable"
