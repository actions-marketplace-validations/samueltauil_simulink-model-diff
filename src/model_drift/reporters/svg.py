from __future__ import annotations

from collections.abc import Mapping, Sequence
from html import escape
from typing import Any

from model_drift.rules import Finding

from .common import policy_status, to_mapping


def render_svg(drift_manifest: Any, findings: Sequence[Finding]) -> str:
    manifest = to_mapping(drift_manifest)
    comparison = to_mapping(manifest.get("comparison", {}))
    summary = _summary(manifest.get("summary"))
    status = str(comparison.get("status", "failed")).title()
    policy = policy_status(tuple(findings)).title()
    colors = {
        "Passed": ("#166534", "#dcfce7"),
        "Failed": ("#991b1b", "#fee2e2"),
    }
    policy_text, policy_fill = colors[policy]
    rows = (
        ("Added", summary["added"]),
        ("Removed", summary["removed"]),
        ("Modified", summary["modified"]),
        ("Moved", summary["moved"]),
        ("Interface changes", summary["interfaceChanges"]),
        ("Policy findings", len(findings)),
    )
    row_markup = "\n".join(
        f'  <text x="44" y="{178 + index * 34}" class="label">{escape(label)}</text>'
        f'\n  <text x="556" y="{178 + index * 34}" class="value">{value}</text>'
        for index, (label, value) in enumerate(rows)
    )
    return f"""\
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="410"
  viewBox="0 0 600 410" role="img" aria-labelledby="title desc">
  <title id="title">Simulink model drift summary</title>
  <desc id="desc">Analysis {escape(status)}, policy {escape(policy)},
    with deterministic change counts.</desc>
  <style>
    .title {{ font: 700 24px system-ui, sans-serif; fill: #111827; }}
    .meta {{ font: 600 15px system-ui, sans-serif; fill: #374151; }}
    .label {{ font: 15px system-ui, sans-serif; fill: #374151; }}
    .value {{ font: 700 15px ui-monospace, monospace; fill: #111827; text-anchor: end; }}
  </style>
  <rect width="600" height="410" rx="16" fill="#f8fafc"/>
  <rect x="20" y="20" width="560" height="370" rx="12" fill="#ffffff" stroke="#cbd5e1"/>
  <text id="title-text" x="44" y="64" class="title">Simulink Model Drift</text>
  <text x="44" y="100" class="meta">Analysis: {escape(status)}</text>
  <rect x="399" y="76" width="157" height="34" rx="17" fill="{policy_fill}"/>
  <text x="477" y="99" class="meta" fill="{policy_text}"
    text-anchor="middle">Policy: {escape(policy)}</text>
  <line x1="44" y1="132" x2="556" y2="132" stroke="#e2e8f0"/>
{row_markup}
</svg>
"""


def _summary(value: Any) -> dict[str, int]:
    source = value if isinstance(value, Mapping) else {}
    return {
        key: int(source.get(key, 0))
        for key in ("added", "removed", "modified", "moved", "interfaceChanges")
    }
