from __future__ import annotations

from model_drift.context import build_repository_context, model_impact


def _scan(
    nodes: list[tuple[str, str]],
    edges: list[tuple[str, str, str]],
) -> dict[str, object]:
    return {
        "status": "complete",
        "scanner": {
            "name": "data-explorer-core",
            "version": "1.32.0",
            "trust": "structural-non-semantic",
        },
        "nodes": [{"path": path, "kind": kind} for path, kind in nodes],
        "edges": [
            {"source": source, "target": target, "type": edge_type}
            for source, target, edge_type in edges
        ],
        "errors": [],
    }


def test_repository_context_computes_direct_and_transitive_dependents() -> None:
    scan = _scan(
        [
            ("models/controller.slx", "model"),
            ("models/vehicle.slx", "model"),
            ("models/system.slx", "model"),
            ("data/params.sldd", "data-dictionary"),
        ],
        [
            ("models/vehicle.slx", "controller.slx", "model-reference"),
            ("models/system.slx", "vehicle.slx", "model-reference"),
            ("models/controller.slx", "../data/params.sldd", "data-dictionary"),
        ],
    )

    context = build_repository_context(scan, scan, ["models/controller.slx"])

    assert context["status"] == "complete"
    assert context["directlyAffectedModels"] == ["models/vehicle.slx"]
    assert context["transitivelyAffectedModels"] == ["models/system.slx"]
    assert context["unresolvedReferences"] == []
    assert model_impact(context, "models/controller.slx") == {
        "directDependents": ["models/vehicle.slx"],
        "transitiveDependents": ["models/system.slx"],
        "unresolvedReferences": [],
    }


def test_repository_context_records_unresolved_references_and_cycles() -> None:
    scan = _scan(
        [("a.slx", "model"), ("b.slx", "model")],
        [
            ("a.slx", "b.slx", "model-reference"),
            ("b.slx", "a.slx", "model-reference"),
            ("a.slx", "missing.sldd", "data-dictionary"),
        ],
    )

    context = build_repository_context(scan, scan, ["a.slx"])

    assert context["cycles"] == [["a.slx", "b.slx", "a.slx"]]
    assert context["unresolvedReferences"] == [
        {
            "source": "a.slx",
            "target": "missing.sldd",
            "requestedTarget": "missing.sldd",
            "type": "data-dictionary",
            "resolved": False,
        }
    ]


def test_deleted_model_uses_base_graph_for_impact() -> None:
    base = _scan(
        [("controller.slx", "model"), ("vehicle.slx", "model")],
        [("vehicle.slx", "controller.slx", "model-reference")],
    )
    head = _scan([("vehicle.slx", "model")], [])

    context = build_repository_context(base, head, ["controller.slx"])

    assert context["directlyAffectedModels"] == ["vehicle.slx"]
