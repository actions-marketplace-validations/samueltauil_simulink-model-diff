"""Compare canonical manifests without inferring unsupported equivalence."""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from dataclasses import dataclass
from typing import Any

from model_drift.canonicalize import canonicalize_manifest
from model_drift.models import (
    AnalysisStatus,
    ChangeEvidence,
    ChangeKind,
    ComparisonInfo,
    DriftChange,
    DriftManifest,
    DriftSummary,
    FunctionalClassification,
    MatchInfo,
)
from model_drift.serialization import stable_fingerprint, to_json_value

_STATUS_ORDER = {
    AnalysisStatus.COMPLETE.value: 0,
    AnalysisStatus.PARTIAL.value: 1,
    AnalysisStatus.UNSUPPORTED.value: 2,
    AnalysisStatus.FAILED.value: 3,
}
_INTERFACE_GROUPS = (
    ("inports", "inport"),
    ("outports", "outport"),
    ("triggerPorts", "trigger-port"),
    ("enablePorts", "enable-port"),
    ("buses", "bus"),
)
_INTERFACE_PROPERTIES = (
    "name",
    "direction",
    "port",
    "dataType",
    "dimensions",
    "sampleTime",
    "unit",
    "minimum",
    "maximum",
)
_BLOCK_PROPERTIES = ("name", "blockType", "parent", "reference", "ports")
_PRESENTATION_PARAMETER_TOKENS = {
    "backgroundcolor",
    "blockrotation",
    "dropShadow",
    "fontangle",
    "fontname",
    "fontsize",
    "fontweight",
    "foregroundcolor",
    "iconshape",
    "orientation",
    "position",
    "showname",
}
_PRESENTATION_CONFIGURATION_TOKENS = {
    "hiliteancestors",
    "location",
    "open",
    "screen",
    "window",
    "zoom",
}
_MISSING = object()


@dataclass(frozen=True, slots=True)
class _ConnectionMatch:
    base: Mapping[str, Any]
    target: Mapping[str, Any]
    strategy: str
    confidence: float


def compare_manifests(base: Any, target: Any) -> DriftManifest:
    """Return a deterministic factual drift manifest for two canonical manifests."""
    base_manifest = canonicalize_manifest(_canonical_input(base))
    target_manifest = canonicalize_manifest(_canonical_input(target))
    comparison_status = _comparison_status(base_manifest, target_manifest)
    extractor = _extractor_evidence(base_manifest, target_manifest)

    changes: list[DriftChange] = []
    changes.extend(_compare_blocks(base_manifest, target_manifest, extractor))
    changes.extend(_compare_interfaces(base_manifest, target_manifest, extractor))
    changes.extend(_compare_connections(base_manifest, target_manifest, extractor))
    changes.extend(_compare_configuration(base_manifest, target_manifest, extractor))
    if comparison_status is not AnalysisStatus.COMPLETE:
        changes.append(
            _incomplete_analysis_change(
                base_manifest, target_manifest, comparison_status, extractor
            )
        )

    ordered_changes = tuple(sorted(changes, key=_change_sort_key))
    return DriftManifest(
        comparison=ComparisonInfo(
            base_artifact=str(base_manifest.get("source", {}).get("artifact", "")),
            target_artifact=str(target_manifest.get("source", {}).get("artifact", "")),
            status=comparison_status,
        ),
        summary=_summarize(ordered_changes),
        changes=ordered_changes,
    )


def _compare_blocks(
    base: Mapping[str, Any],
    target: Mapping[str, Any],
    extractor: str,
) -> list[DriftChange]:
    base_blocks = _index_by_identity(base.get("blocks", ()))
    target_blocks = _index_by_identity(target.get("blocks", ()))
    changes: list[DriftChange] = []

    for identity in sorted(base_blocks.keys() - target_blocks.keys()):
        block = base_blocks[identity]
        changes.append(
            _change(
                kind=ChangeKind.REMOVED,
                category="block",
                element_type="block",
                element_id=identity,
                model_path=_model_path(block, identity),
                before=block,
                classification=FunctionalClassification.POTENTIALLY_FUNCTIONAL,
                extractor=extractor,
                details=_block_details(block),
            )
        )
    for identity in sorted(target_blocks.keys() - base_blocks.keys()):
        block = target_blocks[identity]
        changes.append(
            _change(
                kind=ChangeKind.ADDED,
                category="block",
                element_type="block",
                element_id=identity,
                model_path=_model_path(block, identity),
                after=block,
                classification=FunctionalClassification.POTENTIALLY_FUNCTIONAL,
                extractor=extractor,
                details=_block_details(block),
            )
        )

    for identity in sorted(base_blocks.keys() & target_blocks.keys()):
        before = base_blocks[identity]
        after = target_blocks[identity]
        match = MatchInfo(strategy="stable-id", confidence=1.0)
        before_path = _model_path(before, identity)
        after_path = _model_path(after, identity)
        if before_path != after_path:
            changes.append(
                _change(
                    kind=ChangeKind.MOVED,
                    category="block",
                    element_type="block",
                    element_id=identity,
                    model_path=after_path,
                    property_name="path",
                    before=before_path,
                    after=after_path,
                    classification=FunctionalClassification.NON_FUNCTIONAL,
                    extractor=extractor,
                    details=_block_details(after),
                    match=match,
                )
            )
        for property_name in _BLOCK_PROPERTIES:
            if before.get(property_name) != after.get(property_name):
                classification = (
                    FunctionalClassification.NON_FUNCTIONAL
                    if property_name == "parent" and before_path != after_path
                    else FunctionalClassification.POTENTIALLY_FUNCTIONAL
                )
                changes.append(
                    _change(
                        kind=ChangeKind.MODIFIED,
                        category="block",
                        element_type="block",
                        element_id=identity,
                        model_path=after_path,
                        property_name=property_name,
                        before=before.get(property_name),
                        after=after.get(property_name),
                        classification=classification,
                        extractor=extractor,
                        details=_block_details(after),
                        match=match,
                    )
                )
        changes.extend(
            _compare_parameters(identity, before, after, extractor, match)
        )
    return changes


def _compare_parameters(
    identity: str,
    before_block: Mapping[str, Any],
    after_block: Mapping[str, Any],
    extractor: str,
    match: MatchInfo,
) -> list[DriftChange]:
    before_parameters = _mapping(before_block.get("parameters"))
    after_parameters = _mapping(after_block.get("parameters"))
    model_path = _model_path(after_block, identity)
    changes: list[DriftChange] = []
    for name in sorted(before_parameters.keys() | after_parameters.keys()):
        before = before_parameters.get(name, _MISSING)
        after = after_parameters.get(name, _MISSING)
        if before == after:
            continue
        classification = _parameter_classification(name)
        for suffix, before_value, after_value in _changed_leaves(before, after):
            property_name = f"parameters.{name}"
            if suffix:
                property_name = f"{property_name}.{suffix}"
            changes.append(
                _change(
                    kind=ChangeKind.MODIFIED,
                    category="parameter",
                    element_type="block",
                    element_id=identity,
                    model_path=model_path,
                    property_name=property_name,
                    before=_json_or_none(before_value),
                    after=_json_or_none(after_value),
                    classification=classification,
                    extractor=extractor,
                    details=_block_details(after_block),
                    match=match,
                )
            )
    return changes


def _compare_interfaces(
    base: Mapping[str, Any],
    target: Mapping[str, Any],
    extractor: str,
) -> list[DriftChange]:
    base_interfaces = _mapping(base.get("interfaces"))
    target_interfaces = _mapping(target.get("interfaces"))
    root_path = str(_mapping(target.get("model")).get("rootPath", ""))
    changes: list[DriftChange] = []
    for group, element_type in _INTERFACE_GROUPS:
        before_items = _index_by_identity(base_interfaces.get(group, ()))
        after_items = _index_by_identity(target_interfaces.get(group, ()))
        for identity in sorted(before_items.keys() - after_items.keys()):
            item = before_items[identity]
            changes.append(
                _change(
                    kind=ChangeKind.REMOVED,
                    category="interface",
                    element_type=element_type,
                    element_id=identity,
                    model_path=_interface_path(root_path, item, identity),
                    before=item,
                    classification=FunctionalClassification.POTENTIALLY_FUNCTIONAL,
                    extractor=extractor,
                )
            )
        for identity in sorted(after_items.keys() - before_items.keys()):
            item = after_items[identity]
            changes.append(
                _change(
                    kind=ChangeKind.ADDED,
                    category="interface",
                    element_type=element_type,
                    element_id=identity,
                    model_path=_interface_path(root_path, item, identity),
                    after=item,
                    classification=FunctionalClassification.POTENTIALLY_FUNCTIONAL,
                    extractor=extractor,
                )
            )
        for identity in sorted(before_items.keys() & after_items.keys()):
            before = before_items[identity]
            after = after_items[identity]
            match = MatchInfo(strategy="stable-id", confidence=1.0)
            for property_name in _INTERFACE_PROPERTIES:
                if before.get(property_name) == after.get(property_name):
                    continue
                changes.append(
                    _change(
                        kind=ChangeKind.MODIFIED,
                        category="interface",
                        element_type=element_type,
                        element_id=identity,
                        model_path=_interface_path(root_path, after, identity),
                        property_name=property_name,
                        before=before.get(property_name),
                        after=after.get(property_name),
                        classification=FunctionalClassification.POTENTIALLY_FUNCTIONAL,
                        extractor=extractor,
                        match=match,
                    )
                )
    return changes


def _compare_connections(
    base: Mapping[str, Any],
    target: Mapping[str, Any],
    extractor: str,
) -> list[DriftChange]:
    base_connections = _index_by_identity(base.get("connections", ()))
    target_connections = _index_by_identity(target.get("connections", ()))
    changes: list[DriftChange] = []

    for identity in sorted(base_connections.keys() & target_connections.keys()):
        before = base_connections[identity]
        after = target_connections[identity]
        changes.extend(
            _connection_property_changes(
                identity,
                before,
                after,
                extractor,
                MatchInfo(strategy="stable-id", confidence=1.0),
            )
        )

    unmatched_base = {
        identity: base_connections[identity]
        for identity in base_connections.keys() - target_connections.keys()
    }
    unmatched_target = {
        identity: target_connections[identity]
        for identity in target_connections.keys() - base_connections.keys()
    }
    reconnections = _match_reconnections(unmatched_base, unmatched_target)
    matched_base = {str(match.base["id"]) for match in reconnections}
    matched_target = {str(match.target["id"]) for match in reconnections}

    for match in reconnections:
        before_id = str(match.base["id"])
        after_id = str(match.target["id"])
        changes.append(
            _change(
                kind=ChangeKind.RECONNECTED,
                category="connection",
                element_type="connection",
                element_id=after_id,
                model_path=_connection_path(match.target),
                property_name="endpoints",
                before={
                    "source": match.base.get("source"),
                    "destination": match.base.get("destination"),
                },
                after={
                    "source": match.target.get("source"),
                    "destination": match.target.get("destination"),
                },
                classification=FunctionalClassification.POTENTIALLY_FUNCTIONAL,
                extractor=extractor,
                details={"previousElementId": before_id},
                match=MatchInfo(
                    strategy=match.strategy,
                    confidence=match.confidence,
                ),
            )
        )
        changes.extend(
            _connection_signal_changes(
                after_id,
                match.base,
                match.target,
                extractor,
                MatchInfo(strategy=match.strategy, confidence=match.confidence),
            )
        )

    for identity in sorted(unmatched_base.keys() - matched_base):
        connection = unmatched_base[identity]
        changes.append(
            _change(
                kind=ChangeKind.REMOVED,
                category="connection",
                element_type="connection",
                element_id=identity,
                model_path=_connection_path(connection),
                before=connection,
                classification=FunctionalClassification.POTENTIALLY_FUNCTIONAL,
                extractor=extractor,
            )
        )
    for identity in sorted(unmatched_target.keys() - matched_target):
        connection = unmatched_target[identity]
        changes.append(
            _change(
                kind=ChangeKind.ADDED,
                category="connection",
                element_type="connection",
                element_id=identity,
                model_path=_connection_path(connection),
                after=connection,
                classification=FunctionalClassification.POTENTIALLY_FUNCTIONAL,
                extractor=extractor,
            )
        )
    return changes


def _connection_property_changes(
    identity: str,
    before: Mapping[str, Any],
    after: Mapping[str, Any],
    extractor: str,
    match: MatchInfo,
) -> list[DriftChange]:
    if before.get("source") != after.get("source") or before.get(
        "destination"
    ) != after.get("destination"):
        changes = [
            _change(
                kind=ChangeKind.RECONNECTED,
                category="connection",
                element_type="connection",
                element_id=identity,
                model_path=_connection_path(after),
                property_name="endpoints",
                before={
                    "source": before.get("source"),
                    "destination": before.get("destination"),
                },
                after={
                    "source": after.get("source"),
                    "destination": after.get("destination"),
                },
                classification=FunctionalClassification.POTENTIALLY_FUNCTIONAL,
                extractor=extractor,
                match=match,
            )
        ]
    else:
        changes = []
    changes.extend(
        _connection_signal_changes(identity, before, after, extractor, match)
    )
    return changes


def _connection_signal_changes(
    identity: str,
    before: Mapping[str, Any],
    after: Mapping[str, Any],
    extractor: str,
    match: MatchInfo,
) -> list[DriftChange]:
    before_signal = _mapping(before.get("signal"))
    after_signal = _mapping(after.get("signal"))
    changes: list[DriftChange] = []
    for property_name in sorted(before_signal.keys() | after_signal.keys()):
        if before_signal.get(property_name) == after_signal.get(property_name):
            continue
        changes.append(
            _change(
                kind=ChangeKind.MODIFIED,
                category="signal",
                element_type="connection",
                element_id=identity,
                model_path=_connection_path(after),
                property_name=f"signal.{property_name}",
                before=before_signal.get(property_name),
                after=after_signal.get(property_name),
                classification=FunctionalClassification.POTENTIALLY_FUNCTIONAL,
                extractor=extractor,
                match=match,
            )
        )
    return changes


def _match_reconnections(
    base: Mapping[str, Mapping[str, Any]],
    target: Mapping[str, Mapping[str, Any]],
) -> tuple[_ConnectionMatch, ...]:
    candidates: list[tuple[str, str, str, float]] = []
    for base_id, before in base.items():
        for target_id, after in target.items():
            strategy = _reconnection_strategy(before, after)
            if strategy is not None:
                candidates.append((base_id, target_id, strategy[0], strategy[1]))

    base_counts: dict[str, int] = {}
    target_counts: dict[str, int] = {}
    for base_id, target_id, _, _ in candidates:
        base_counts[base_id] = base_counts.get(base_id, 0) + 1
        target_counts[target_id] = target_counts.get(target_id, 0) + 1

    matches = [
        _ConnectionMatch(base[base_id], target[target_id], strategy, confidence)
        for base_id, target_id, strategy, confidence in candidates
        if base_counts[base_id] == 1 and target_counts[target_id] == 1
    ]
    return tuple(
        sorted(matches, key=lambda item: (str(item.base["id"]), str(item.target["id"])))
    )


def _reconnection_strategy(
    before: Mapping[str, Any], after: Mapping[str, Any]
) -> tuple[str, float] | None:
    source_same = before.get("source") == after.get("source")
    destination_same = before.get("destination") == after.get("destination")
    if source_same == destination_same:
        return None
    before_signal = _mapping(before.get("signal"))
    after_signal = _mapping(after.get("signal"))
    signal_name = before_signal.get("name")
    same_named_signal = bool(signal_name) and signal_name == after_signal.get("name")
    if not same_named_signal:
        return None
    return (
        ("source-and-signal" if source_same else "destination-and-signal"),
        0.95,
    )


def _compare_configuration(
    base: Mapping[str, Any],
    target: Mapping[str, Any],
    extractor: str,
) -> list[DriftChange]:
    before = _mapping(base.get("configuration"))
    after = _mapping(target.get("configuration"))
    model = _mapping(target.get("model"))
    model_path = str(model.get("rootPath") or model.get("name") or "model")
    element_id = f"configuration:{model_path}"
    changes: list[DriftChange] = []
    for property_name, before_value, after_value in _mapping_changes(before, after):
        changes.append(
            _change(
                kind=ChangeKind.MODIFIED,
                category="configuration",
                element_type="configuration",
                element_id=element_id,
                model_path=model_path,
                property_name=property_name,
                before=_json_or_none(before_value),
                after=_json_or_none(after_value),
                classification=_configuration_classification(property_name),
                extractor=extractor,
                match=MatchInfo(strategy="model-root", confidence=1.0),
            )
        )
    return changes


def _incomplete_analysis_change(
    base: Mapping[str, Any],
    target: Mapping[str, Any],
    status: AnalysisStatus,
    extractor: str,
) -> DriftChange:
    before_analysis = _mapping(base.get("analysis"))
    after_analysis = _mapping(target.get("analysis"))
    model = _mapping(target.get("model"))
    model_path = str(model.get("rootPath") or model.get("name") or "model")
    kind = (
        ChangeKind.UNSUPPORTED
        if status is AnalysisStatus.UNSUPPORTED
        else ChangeKind.UNRESOLVED
    )
    return _change(
        kind=kind,
        category="analysis",
        element_type="model",
        element_id=f"analysis:{model_path}",
        model_path=model_path,
        property_name="analysisStatus",
        before=before_analysis.get("status"),
        after=after_analysis.get("status"),
        classification=FunctionalClassification.UNKNOWN,
        extractor=extractor,
        details={
            "baseWarnings": list(before_analysis.get("warnings", ())),
            "targetWarnings": list(after_analysis.get("warnings", ())),
            "baseUnsupportedFeatures": list(
                before_analysis.get("unsupportedFeatures", ())
            ),
            "targetUnsupportedFeatures": list(
                after_analysis.get("unsupportedFeatures", ())
            ),
            "comparisonStatus": status.value,
        },
    )


def _comparison_status(
    base: Mapping[str, Any], target: Mapping[str, Any]
) -> AnalysisStatus:
    statuses = (
        str(_mapping(base.get("analysis")).get("status", "failed")),
        str(_mapping(target.get("analysis")).get("status", "failed")),
    )
    worst = max(statuses, key=lambda status: _STATUS_ORDER.get(status, 3))
    return AnalysisStatus(worst if worst in _STATUS_ORDER else "failed")


def _summarize(changes: Iterable[DriftChange]) -> DriftSummary:
    materialized = tuple(changes)
    return DriftSummary(
        added=sum(change.kind is ChangeKind.ADDED for change in materialized),
        removed=sum(change.kind is ChangeKind.REMOVED for change in materialized),
        modified=sum(change.kind is ChangeKind.MODIFIED for change in materialized),
        moved=sum(change.kind is ChangeKind.MOVED for change in materialized),
        interface_changes=sum(
            change.category == "interface" for change in materialized
        ),
    )


def _change(
    *,
    kind: ChangeKind,
    category: str,
    element_type: str,
    element_id: str,
    model_path: str,
    classification: FunctionalClassification,
    extractor: str,
    property_name: str | None = None,
    before: Any = None,
    after: Any = None,
    details: Mapping[str, Any] | None = None,
    match: MatchInfo | None = None,
) -> DriftChange:
    change_id = "chg-" + stable_fingerprint(
        kind.value,
        category,
        element_type,
        element_id,
        property_name or "",
        namespace="simulink-model-drift/change/v1",
    )[:24]
    return DriftChange(
        change_id=change_id,
        kind=kind,
        category=category,
        element_type=element_type,
        element_id=element_id,
        model_path=model_path,
        property=property_name,
        before=before,
        after=after,
        functional_classification=classification,
        evidence=ChangeEvidence(extractor=extractor, details=dict(details or {})),
        match=match,
    )


def _index_by_identity(items: Any) -> dict[str, Mapping[str, Any]]:
    result: dict[str, Mapping[str, Any]] = {}
    if not isinstance(items, (list, tuple)):
        return result
    for item in items:
        if not isinstance(item, Mapping):
            continue
        identity = item.get("id")
        if isinstance(identity, str) and identity:
            result[identity] = item
    return result


def _changed_leaves(
    before: Any, after: Any, prefix: str = ""
) -> Iterable[tuple[str, Any, Any]]:
    if isinstance(before, Mapping) and isinstance(after, Mapping):
        for key in sorted(before.keys() | after.keys()):
            child_prefix = f"{prefix}.{key}" if prefix else str(key)
            yield from _changed_leaves(
                before.get(key, _MISSING),
                after.get(key, _MISSING),
                child_prefix,
            )
        return
    if before != after:
        yield prefix, before, after


def _mapping_changes(
    before: Mapping[str, Any],
    after: Mapping[str, Any],
    prefix: str = "",
) -> Iterable[tuple[str, Any, Any]]:
    for key in sorted(before.keys() | after.keys()):
        property_name = f"{prefix}.{key}" if prefix else str(key)
        before_value = before.get(key, _MISSING)
        after_value = after.get(key, _MISSING)
        if isinstance(before_value, Mapping) and isinstance(after_value, Mapping):
            yield from _mapping_changes(before_value, after_value, property_name)
        elif before_value != after_value:
            yield property_name, before_value, after_value


def _parameter_classification(name: str) -> FunctionalClassification:
    token = name.replace("_", "").lower()
    presentation = {value.lower() for value in _PRESENTATION_PARAMETER_TOKENS}
    if token in presentation:
        return FunctionalClassification.NON_FUNCTIONAL
    return FunctionalClassification.POTENTIALLY_FUNCTIONAL


def _configuration_classification(
    property_name: str,
) -> FunctionalClassification:
    lowered = property_name.lower()
    if any(token.lower() in lowered for token in _PRESENTATION_CONFIGURATION_TOKENS):
        return FunctionalClassification.NON_FUNCTIONAL
    return FunctionalClassification.POTENTIALLY_FUNCTIONAL


def _extractor_evidence(
    base: Mapping[str, Any], target: Mapping[str, Any]
) -> str:
    base_strategy = str(_mapping(base.get("generator")).get("strategy", "unknown"))
    target_strategy = str(_mapping(target.get("generator")).get("strategy", "unknown"))
    if base_strategy == target_strategy:
        return target_strategy
    return f"base:{base_strategy};target:{target_strategy}"


def _mapping(value: Any) -> Mapping[str, Any]:
    return value if isinstance(value, Mapping) else {}


def _canonical_input(value: Any) -> Any:
    return value if isinstance(value, Mapping) else to_json_value(value)


def _model_path(item: Mapping[str, Any], fallback: str) -> str:
    return str(item.get("path") or item.get("name") or fallback)


def _interface_path(
    root_path: str, item: Mapping[str, Any], fallback: str
) -> str:
    name = str(item.get("name") or fallback)
    return f"{root_path}/{name}" if root_path else name


def _connection_path(connection: Mapping[str, Any]) -> str:
    source = _mapping(connection.get("source"))
    destination = _mapping(connection.get("destination"))
    return (
        f"{source.get('blockId', '?')}:{source.get('port', '?')} -> "
        f"{destination.get('blockId', '?')}:{destination.get('port', '?')}"
    )


def _block_details(block: Mapping[str, Any]) -> dict[str, Any]:
    block_type = block.get("blockType")
    return {"blockType": block_type} if block_type is not None else {}


def _json_or_none(value: Any) -> Any:
    return None if value is _MISSING else value


def _change_sort_key(change: DriftChange) -> tuple[str, ...]:
    return (
        change.category,
        change.element_type,
        change.model_path,
        change.element_id,
        change.property or "",
        change.kind.value,
        change.change_id,
    )
