from __future__ import annotations

from model_drift.review import build_model_review, build_review_plan


def _record(
    model_id: str,
    path: str,
    *,
    status: str = "complete",
    analysis_status: str = "complete",
    policy_status: str = "passed",
    summary: dict[str, int] | None = None,
    change_profile: dict[str, dict[str, int]] | None = None,
) -> dict[str, object]:
    record: dict[str, object] = {
        "id": model_id,
        "headPath": path,
        "status": status,
        "analysisStatus": analysis_status,
        "policyStatus": policy_status,
        "summary": summary or {},
        "changeProfile": change_profile or {},
    }
    record["review"] = build_model_review(record)
    return record


def test_model_review_blocks_policy_failure_before_high_priority_drift() -> None:
    record = _record(
        "controller",
        "models/controller.slx",
        policy_status="failed",
        summary={"modified": 1, "interfaceChanges": 1},
        change_profile={"classifications": {"functional": 1}},
    )

    assert record["review"] == {
        "priority": "blocked",
        "rank": 0,
        "summary": "Policy gate failed",
        "action": "Resolve policy findings before approval.",
        "reasons": ["policy-failed", "interface-change", "functional-change"],
    }


def test_review_plan_orders_priority_then_path_deterministically() -> None:
    records = [
        _record("low", "models/z-low.slx"),
        _record(
            "normal-b",
            "models/b-normal.slx",
            summary={"modified": 1},
        ),
        _record(
            "high",
            "models/high.slx",
            summary={"modified": 1, "interfaceChanges": 1},
        ),
        _record(
            "blocked",
            "models/blocked.slx",
            analysis_status="partial",
        ),
        _record(
            "normal-a",
            "models/a-normal.slx",
            summary={"modified": 1},
        ),
    ]

    plan = build_review_plan(records)

    assert plan == {
        "status": "blocked",
        "recommendedAction": "Resolve blocked model reviews before approval.",
        "counts": {"blocked": 1, "high": 1, "normal": 2, "low": 1},
        "orderedModelIds": [
            "blocked",
            "high",
            "normal-a",
            "normal-b",
            "low",
        ],
    }


def test_review_plan_is_clear_only_when_no_model_needs_review() -> None:
    plan = build_review_plan([_record("low", "models/low.slx")])

    assert plan["status"] == "clear"
    assert plan["recommendedAction"] == (
        "No semantic model drift requires reviewer action."
    )
