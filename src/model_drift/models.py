"""Immutable domain models for canonical and drift manifests."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum
from typing import TypeAlias

JSONScalar: TypeAlias = str | int | float | bool | None
JSONValue: TypeAlias = JSONScalar | list["JSONValue"] | dict[str, "JSONValue"]

SCHEMA_VERSION = "0.1.0"


class AnalysisStatus(StrEnum):
    COMPLETE = "complete"
    PARTIAL = "partial"
    UNSUPPORTED = "unsupported"
    FAILED = "failed"


class ChangeKind(StrEnum):
    ADDED = "added"
    REMOVED = "removed"
    MODIFIED = "modified"
    MOVED = "moved"
    RENAMED = "renamed"
    RECONNECTED = "reconnected"
    UNRESOLVED = "unresolved"
    UNSUPPORTED = "unsupported"


class FunctionalClassification(StrEnum):
    FUNCTIONAL = "functional"
    POTENTIALLY_FUNCTIONAL = "potentially-functional"
    NON_FUNCTIONAL = "non-functional"
    UNKNOWN = "unknown"


@dataclass(frozen=True, slots=True, kw_only=True)
class GeneratorInfo:
    version: str
    strategy: str
    name: str = "simulink-model-drift"


@dataclass(frozen=True, slots=True, kw_only=True)
class SourceInfo:
    artifact: str
    artifact_sha256: str
    simulink_release: str | None = None


@dataclass(frozen=True, slots=True, kw_only=True)
class AnalysisInfo:
    status: AnalysisStatus
    warnings: tuple[str, ...] = ()
    unsupported_features: tuple[str, ...] = ()


@dataclass(frozen=True, slots=True, kw_only=True)
class ModelInfo:
    name: str
    model_type: str
    root_path: str


@dataclass(frozen=True, slots=True, kw_only=True)
class ParameterValue:
    value: JSONValue
    value_type: str


@dataclass(frozen=True, slots=True, kw_only=True)
class PortCounts:
    inputs: int
    outputs: int


@dataclass(frozen=True, slots=True, kw_only=True)
class Block:
    id: str
    path: str
    name: str
    block_type: str
    parent: str
    ports: PortCounts
    reference: str | None = None
    parameters: dict[str, ParameterValue] = field(default_factory=dict)


@dataclass(frozen=True, slots=True, kw_only=True)
class ConnectionEndpoint:
    block_id: str
    port: int


@dataclass(frozen=True, slots=True, kw_only=True)
class Signal:
    name: str | None = None
    data_type: str | None = None
    dimensions: tuple[int, ...] = ()
    unit: str | None = None


@dataclass(frozen=True, slots=True, kw_only=True)
class Connection:
    id: str
    source: ConnectionEndpoint
    destination: ConnectionEndpoint
    signal: Signal = field(default_factory=Signal)


@dataclass(frozen=True, slots=True, kw_only=True)
class Interface:
    id: str
    name: str
    direction: str
    port: int
    data_type: str | None = None
    dimensions: tuple[int, ...] = ()
    sample_time: str | None = None
    unit: str | None = None
    minimum: JSONScalar = None
    maximum: JSONScalar = None


@dataclass(frozen=True, slots=True, kw_only=True)
class Interfaces:
    inports: tuple[Interface, ...] = ()
    outports: tuple[Interface, ...] = ()
    trigger_ports: tuple[Interface, ...] = ()
    enable_ports: tuple[Interface, ...] = ()
    buses: tuple[dict[str, JSONValue], ...] = ()


@dataclass(frozen=True, slots=True, kw_only=True)
class Stateflow:
    charts: tuple[dict[str, JSONValue], ...] = ()
    states: tuple[dict[str, JSONValue], ...] = ()
    transitions: tuple[dict[str, JSONValue], ...] = ()
    junctions: tuple[dict[str, JSONValue], ...] = ()
    events: tuple[dict[str, JSONValue], ...] = ()
    data: tuple[dict[str, JSONValue], ...] = ()


@dataclass(frozen=True, slots=True, kw_only=True)
class References:
    models: tuple[str, ...] = ()
    libraries: tuple[str, ...] = ()
    data_dictionaries: tuple[str, ...] = ()
    requirements: tuple[str, ...] = ()


@dataclass(frozen=True, slots=True, kw_only=True)
class Fingerprints:
    model: str
    structure: str
    interfaces: str
    parameters: str
    stateflow: str
    configuration: str


@dataclass(frozen=True, slots=True, kw_only=True)
class CanonicalModelManifest:
    generator: GeneratorInfo
    source: SourceInfo
    analysis: AnalysisInfo
    model: ModelInfo
    fingerprints: Fingerprints
    schema_version: str = SCHEMA_VERSION
    schema: str = "./canonical-model.schema.json"
    interfaces: Interfaces = field(default_factory=Interfaces)
    systems: tuple[dict[str, JSONValue], ...] = ()
    blocks: tuple[Block, ...] = ()
    connections: tuple[Connection, ...] = ()
    stateflow: Stateflow = field(default_factory=Stateflow)
    configuration: dict[str, JSONValue] = field(default_factory=dict)
    references: References = field(default_factory=References)


@dataclass(frozen=True, slots=True, kw_only=True)
class ComparisonInfo:
    base_artifact: str
    target_artifact: str
    status: AnalysisStatus


@dataclass(frozen=True, slots=True, kw_only=True)
class DriftSummary:
    added: int = 0
    removed: int = 0
    modified: int = 0
    moved: int = 0
    interface_changes: int = 0


@dataclass(frozen=True, slots=True, kw_only=True)
class MatchInfo:
    strategy: str
    confidence: float


@dataclass(frozen=True, slots=True, kw_only=True)
class ChangeEvidence:
    extractor: str
    details: dict[str, JSONValue] = field(default_factory=dict)


@dataclass(frozen=True, slots=True, kw_only=True)
class DriftChange:
    change_id: str
    kind: ChangeKind
    category: str
    element_type: str
    element_id: str
    model_path: str
    functional_classification: FunctionalClassification
    property: str | None = None
    before: JSONValue = None
    after: JSONValue = None
    evidence: ChangeEvidence | None = None
    match: MatchInfo | None = None


@dataclass(frozen=True, slots=True, kw_only=True)
class DriftManifest:
    comparison: ComparisonInfo
    summary: DriftSummary
    changes: tuple[DriftChange, ...] = ()
    schema_version: str = SCHEMA_VERSION
    schema: str = "./drift-manifest.schema.json"
