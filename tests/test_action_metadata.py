import tomllib
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]


def test_canonical_consumer_invokes_published_action_from_steps() -> None:
    workflow = yaml.safe_load(
        (ROOT / "samples" / "github-actions" / "canonical-pr.yml").read_text(
            encoding="utf-8"
        )
    )
    version = tomllib.loads((ROOT / "pyproject.toml").read_text(encoding="utf-8"))[
        "project"
    ]["version"]

    job = workflow["jobs"]["model-drift"]
    assert "uses" not in job
    assert job["runs-on"] == "ubuntu-latest"

    steps = job["steps"]
    checkout = next(step for step in steps if step.get("uses") == "actions/checkout@v7")
    assert checkout["with"]["fetch-depth"] == 0
    assert checkout["with"]["persist-credentials"] is False

    action = next(
        step
        for step in steps
        if step.get("uses", "").startswith("samueltauil/simulink-model-diff@")
    )
    assert action["uses"] == f"samueltauil/simulink-model-diff@v{version}"
    assert "/.github/workflows/" not in action["uses"]


def test_action_and_reusable_workflow_expose_review_contract() -> None:
    action = yaml.safe_load((ROOT / "action.yml").read_text(encoding="utf-8"))
    action_outputs = action["outputs"]
    for output in (
        "review-status",
        "context-status",
        "evidence-status",
        "affected-models",
        "missing-evidence",
    ):
        assert action_outputs[output]["value"] == f"${{{{ steps.pr.outputs['{output}'] }}}}"

    workflow = yaml.safe_load(
        (ROOT / ".github" / "workflows" / "pr-analysis.yml").read_text(
            encoding="utf-8"
        )
    )
    workflow_outputs = workflow[True]["workflow_call"]["outputs"]
    job_outputs = workflow["jobs"]["analyze"]["outputs"]
    for output in (
        "review-status",
        "context-status",
        "evidence-status",
        "affected-models",
        "missing-evidence",
    ):
        assert workflow_outputs[output]["value"] == (
            f"${{{{ jobs.analyze.outputs['{output}'] }}}}"
        )
        assert job_outputs[output] == f"${{{{ steps.drift.outputs['{output}'] }}}}"
