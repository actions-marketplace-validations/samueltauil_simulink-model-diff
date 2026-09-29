from __future__ import annotations

from collections import Counter
from collections.abc import Mapping, Sequence
from typing import Any

from model_drift.rules import Finding

from .common import policy_status, to_mapping


def render_markdown(drift_manifest: Any, findings: Sequence[Finding]) -> str:
    manifest = to_mapping(drift_manifest)
    comparison = to_mapping(manifest.get("comparison", {}))
    analysis_status = str(comparison.get("status", "failed"))
    ordered = sorted(
        findings,
        key=lambda item: (
            {"error": 0, "warning": 1, "note": 2, "none": 3}.get(item.level, 4),
            item.rule_id,
            item.model_path,
        ),
    )
    lines = [
        "## Simulink Model Drift",
        "",
        f"**Analysis:** {analysis_status.title()}  ",
        f"**Policy result:** {policy_status(ordered).title()}",
        "",
        "### Model changes",
        "",
    ]
    summary_lines = _summary_lines(manifest)
    lines.extend(f"- {line}" for line in summary_lines)
    lines.extend(("", "### Actionable findings", ""))
    if ordered:
        lines.extend(
            f"- **{finding.level.title()}:** `{_escape_code(finding.rule_id)}` "
            f"{finding.message}"
            for finding in ordered
        )
    else:
        lines.append("- No policy violations detected.")
    return "\n".join(lines) + "\n"


def _summary_lines(manifest: Mapping[str, Any]) -> list[str]:
    summary = manifest.get("summary")
    if isinstance(summary, Mapping):
        preferred = (
            ("added", "added change", "added changes"),
            ("removed", "removed change", "removed changes"),
            ("modified", "modified change", "modified changes"),
            ("moved", "moved change", "moved changes"),
            ("interfaceChanges", "interface change", "interface changes"),
        )
        lines = [
            f"{int(summary[key])} "
            f"{singular if int(summary[key]) == 1 else plural}"
            for key, singular, plural in preferred
            if key in summary and int(summary[key]) != 0
        ]
        if lines:
            return lines

    changes = manifest.get("changes", ())
    counts = Counter(
        str(to_mapping(change).get("kind", "unresolved")) for change in changes
    )
    if not counts:
        return ["No model changes detected."]
    return [f"{counts[kind]} {kind}" for kind in sorted(counts)]


def _escape_code(value: str) -> str:
    return value.replace("`", "'")
