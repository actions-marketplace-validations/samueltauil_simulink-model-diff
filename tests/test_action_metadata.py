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
