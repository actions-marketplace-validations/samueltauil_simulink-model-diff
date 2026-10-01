"""Deterministic reviewer prioritization for pull-request model drift."""

from __future__ import annotations

from collections import Counter
from collections.abc import Mapping, Sequence
from typing import Any

_PRIORITIES = ("blocked", "high", "normal", "low")
_RANK = {priority: rank for rank, priority in enumerate(_PRIORITIES)}


def build_model_review(record: Mapping[str, Any]) -> dict[str, Any]:
    status = str(record.get("status", "failed")).lower()
    analysis = str(record.get("analysisStatus", "failed")).lower()
    policy = str(record.get("policyStatus", "not-evaluated")).lower()
    summary = _mapping(record.get("summary"))
    profile = _mapping(record.get("changeProfile"))
    classifications = _mapping(profile.get("classifications"))
    categories = _mapping(profile.get("categories"))

    reasons: list[str] = []
    if status == "failed":
        reasons.append("analysis-failed")
    elif analysis and analysis != "complete":
        reasons.append(f"analysis-{analysis}")
    if policy == "failed":
        reasons.append("policy-failed")
    if _count(summary, "interfaceChanges") or _count(categories, "interface"):
        reasons.append("interface-change")
    if _count(classifications, "functional"):
        reasons.append("functional-change")
    if _count(classifications, "potentially-functional"):
        reasons.append("potentially-functional-change")

    change_count = sum(
        _count(summary, key) for key in ("added", "removed", "modified", "moved")
    )
    if not reasons and change_count:
        reasons.append("recorded-drift")
    if not reasons:
        reasons.append("no-semantic-drift")

    if status == "failed" or analysis in {"failed", "unsupported"}:
        priority = "blocked"
        summary_text = "Analysis unavailable"
        action = "Fix extraction and regenerate the report before review."
    elif analysis and analysis != "complete":
        priority = "blocked"
        summary_text = "Qualified extraction required"
        action = "Run the approved qualified extractor before approval."
    elif policy == "failed":
        priority = "blocked"
        summary_text = "Policy gate failed"
        action = "Resolve policy findings before approval."
    elif any(
        reason in reasons
        for reason in (
            "interface-change",
            "functional-change",
            "potentially-functional-change",
        )
    ):
        priority = "high"
        summary_text = "Behavior or interface review required"
        action = "Confirm intended behavior, compatibility, and supporting tests."
    elif change_count:
        priority = "normal"
        summary_text = "Recorded model drift"
        action = "Review the recorded drift and confirm the change is intentional."
    else:
        priority = "low"
        summary_text = "No semantic drift recorded"
        action = "Verify the Git change is limited to rename or packaging metadata."

    return {
        "priority": priority,
        "rank": _RANK[priority],
        "summary": summary_text,
        "action": action,
        "reasons": reasons,
    }


def build_review_plan(records: Sequence[Mapping[str, Any]]) -> dict[str, Any]:
    ordered = sorted(
        records,
        key=lambda record: (
            _review_rank(record),
            str(record.get("headPath") or record.get("basePath") or ""),
            str(record.get("id") or ""),
        ),
    )
    counts = Counter(
        str(_mapping(record.get("review")).get("priority", "normal"))
        for record in ordered
    )
    if counts["blocked"]:
        status = "blocked"
        action = "Resolve blocked model reviews before approval."
    elif counts["high"] or counts["normal"]:
        status = "review-required"
        action = "Review the prioritized model changes before approval."
    else:
        status = "clear"
        action = "No semantic model drift requires reviewer action."
    return {
        "status": status,
        "recommendedAction": action,
        "counts": {priority: counts[priority] for priority in _PRIORITIES},
        "orderedModelIds": [
            str(record["id"]) for record in ordered if record.get("id") is not None
        ],
    }


def _review_rank(record: Mapping[str, Any]) -> int:
    review = _mapping(record.get("review"))
    value = review.get("rank")
    return int(value) if isinstance(value, int) else len(_RANK)


def _mapping(value: object) -> Mapping[str, Any]:
    return value if isinstance(value, Mapping) else {}


def _count(value: Mapping[str, Any], key: str) -> int:
    raw = value.get(key, 0)
    return int(raw) if isinstance(raw, int | float | str) and str(raw).isdigit() else 0
