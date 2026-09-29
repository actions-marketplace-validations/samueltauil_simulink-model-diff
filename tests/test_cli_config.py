from __future__ import annotations

import json
from pathlib import Path

import pytest

from model_drift.cli import ExitCode, main
from model_drift.config import ConfigError, load_config

ROOT = Path(__file__).parents[1]
BASE = ROOT / "examples" / "canonical" / "controller-base.model.json"
TARGET = ROOT / "examples" / "canonical" / "controller-target.model.json"
RULES = ROOT / "examples" / "rules" / "default-rules.yml"


def _write_config(path: Path, *, command: str | None = None) -> None:
    command_line = f"  command: {json.dumps(command)}\n" if command else ""
    path.write_text(
        "\n".join(
            [
                'schemaVersion: "0.1.0"',
                "extractor:",
                "  strategy: simulink-api",
                "  failOnIncompleteAnalysis: true",
                command_line.rstrip(),
                "reporting:",
                "  outputDirectory: reports",
                "  formats: [json, markdown]",
                "policy:",
                f"  rules: [{json.dumps(str(RULES))}]",
                "  failureLevels: []",
            ]
        ).replace("\n\n", "\n")
        + "\n",
        encoding="utf-8",
    )


def test_config_rejects_unknown_fields(tmp_path: Path) -> None:
    config = tmp_path / "config.yml"
    config.write_text(
        'schemaVersion: "0.1.0"\nreporting:\n  outputDirectory: out\n  typo: true\n',
        encoding="utf-8",
    )

    with pytest.raises(ConfigError, match="unsupported fields: typo"):
        load_config(config, base_dir=tmp_path)


def test_analyze_uses_discovered_config_for_output_formats_and_policy(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    model_drift = tmp_path / "model-drift"
    model_drift.mkdir()
    _write_config(model_drift / "config.yml")
    monkeypatch.chdir(tmp_path)

    result = main(
        [
            "analyze",
            "--base",
            str(BASE),
            "--target",
            str(TARGET),
        ]
    )

    assert result == ExitCode.SUCCESS
    assert {path.name for path in (tmp_path / "reports").iterdir()} == {
        "model-drift.json",
        "model-drift.md",
    }


def test_batch_plan_analyzes_all_pairs_under_output_root(tmp_path: Path) -> None:
    config = tmp_path / "config.yml"
    _write_config(config)
    plan = tmp_path / "plan.yml"
    plan.write_text(
        "\n".join(
            [
                'schemaVersion: "0.1.0"',
                "pairs:",
                "  - id: first",
                f"    base: {json.dumps(str(BASE))}",
                f"    target: {json.dumps(str(TARGET))}",
                "  - id: second",
                f"    base: {json.dumps(str(BASE))}",
                f"    target: {json.dumps(str(BASE))}",
            ]
        )
        + "\n",
        encoding="utf-8",
    )
    output = tmp_path / "batch"

    result = main(
        [
            "analyze",
            "--plan",
            str(plan),
            "--config",
            str(config),
            "--output",
            str(output),
        ]
    )

    assert result == ExitCode.SUCCESS
    for pair_id in ("first", "second"):
        assert (output / pair_id / "model-drift.json").is_file()
        assert (output / pair_id / "model-drift.md").is_file()


def test_doctor_reports_missing_extractor_without_false_success(
    tmp_path: Path,
    capsys: pytest.CaptureFixture[str],
) -> None:
    config = tmp_path / "config.yml"
    _write_config(config)

    result = main(["doctor", "--config", str(config), "--json"])

    assert result == ExitCode.NOT_READY
    payload = json.loads(capsys.readouterr().out)
    assert payload["ready"] is False
    extractor = next(check for check in payload["checks"] if check["name"] == "extractor")
    assert extractor["ready"] is False


def test_doctor_succeeds_when_extractor_executable_resolves(
    tmp_path: Path,
    capsys: pytest.CaptureFixture[str],
) -> None:
    config = tmp_path / "config.yml"
    _write_config(config, command="python {artifact}")

    result = main(["doctor", "--config", str(config), "--json"])

    assert result == ExitCode.SUCCESS
    assert json.loads(capsys.readouterr().out)["ready"] is True


def test_missing_extractor_has_stable_json_diagnostic(
    tmp_path: Path,
    capsys: pytest.CaptureFixture[str],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    artifact = tmp_path / "model.slx"
    artifact.write_bytes(b"model")
    monkeypatch.chdir(tmp_path)

    result = main(
        [
            "--diagnostics-format",
            "json",
            "analyze",
            "--base",
            str(artifact),
            "--target",
            str(artifact),
            "--output",
            str(tmp_path / "out"),
        ]
    )

    assert result == ExitCode.EXTRACTION_FAILURE
    diagnostic = json.loads(capsys.readouterr().err)
    assert diagnostic["code"] == "EXTRACTOR_NOT_CONFIGURED"
    assert diagnostic["exitCode"] == 5
    assert diagnostic["context"]["pairId"] == "model-drift"


def test_version_command_supports_machine_readable_output(
    capsys: pytest.CaptureFixture[str],
) -> None:
    assert main(["version", "--json"]) == ExitCode.SUCCESS
    payload = json.loads(capsys.readouterr().out)
    assert payload["cli"] == "simulink-model-drift"
    assert payload["version"]
    assert payload["python"]


def test_analyze_uses_packaged_default_rules_without_repository_config(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.chdir(tmp_path)
    output = tmp_path / "reports"

    result = main(
        [
            "analyze",
            "--base",
            str(BASE),
            "--target",
            str(TARGET),
            "--output",
            str(output),
            "--fail-on",
            "none",
        ]
    )

    assert result == ExitCode.SUCCESS
    assert (output / "model-drift.sarif").is_file()
