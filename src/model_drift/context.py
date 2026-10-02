"""Repository relationship context and change-impact analysis."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
from collections import defaultdict, deque
from collections.abc import Mapping, Sequence
from importlib.resources import as_file, files
from pathlib import Path, PurePosixPath
from typing import Any

from model_drift.serialization import normalize_repository_path

_MAX_SCANNER_OUTPUT = 64 * 1024 * 1024


class ContextScanError(ValueError):
    """Raised when the bundled relationship scanner cannot run safely."""


def run_context_scanner(root: Path, *, timeout_seconds: float = 120.0) -> dict[str, Any]:
    node = shutil.which("node")
    if node is None:
        raise ContextScanError("Node.js is required for repository relationship scanning.")
    resource = files("model_drift.context_scanner").joinpath("scanner.mjs")
    with as_file(resource) as scanner:
        try:
            result = subprocess.run(
                (node, str(scanner), "--root", str(root)),
                check=False,
                capture_output=True,
                timeout=timeout_seconds,
                env={**os.environ, "NO_COLOR": "1"},
            )
        except (OSError, subprocess.TimeoutExpired) as exc:
            raise ContextScanError(f"relationship scanner could not complete: {exc}") from exc
    if result.returncode != 0:
        detail = result.stderr[:256 * 1024].decode("utf-8", errors="replace").strip()
        raise ContextScanError(detail or "relationship scanner failed")
    if len(result.stdout) > _MAX_SCANNER_OUTPUT:
        raise ContextScanError("relationship scanner output exceeded 64 MiB")
    try:
        document = json.loads(result.stdout.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ContextScanError(f"relationship scanner returned invalid JSON: {exc}") from exc
    return _validate_scan(document)


def build_repository_context(
    base_scan: Mapping[str, Any],
    head_scan: Mapping[str, Any],
    changed_paths: Sequence[str],
) -> dict[str, Any]:
    base = _resolve_scan(base_scan)
    head = _resolve_scan(head_scan)
    changed = tuple(sorted({normalize_repository_path(path) for path in changed_paths if path}))
    base_reverse = _reverse_edges(base["edges"])
    head_reverse = _reverse_edges(head["edges"])
    impact_by_path = {}
    direct: set[str] = set()
    transitive: set[str] = set()
    for path in changed:
        head_direct, head_transitive = _dependents_for(path, head_reverse)
        base_direct, base_transitive = _dependents_for(path, base_reverse)
        path_direct = (head_direct | base_direct) - set(changed)
        path_transitive = (head_transitive | base_transitive) - path_direct - set(changed)
        impact_by_path[path] = {
            "directDependents": sorted(path_direct),
            "transitiveDependents": sorted(path_transitive),
        }
        direct.update(path_direct)
        transitive.update(path_transitive)
    transitive.difference_update(direct)

    errors = [
        {"side": side, **error}
        for side, scan in (("base", base_scan), ("head", head_scan))
        for error in scan.get("errors", ())
        if isinstance(error, Mapping)
    ]
    status = (
        "failed"
        if base_scan.get("status") == "failed" or head_scan.get("status") == "failed"
        else "partial"
        if errors or base_scan.get("status") != "complete" or head_scan.get("status") != "complete"
        else "complete"
    )
    return {
        "status": status,
        "trust": "structural-non-semantic",
        "scanner": head_scan.get("scanner") or base_scan.get("scanner") or {},
        "changedPaths": list(changed),
        "directlyAffectedModels": sorted(direct),
        "transitivelyAffectedModels": sorted(transitive),
        "impactByChangedPath": impact_by_path,
        "nodes": head["nodes"],
        "edges": head["edges"],
        "cycles": _cycles(head["nodes"], head["edges"]),
        "unresolvedReferences": [
            edge for edge in head["edges"] if not edge["resolved"]
        ],
        "baseSummary": _scan_summary(base),
        "headSummary": _scan_summary(head),
        "errors": errors,
    }


def model_impact(context: Mapping[str, Any], model_path: str | None) -> dict[str, Any]:
    if not model_path:
        return {"directDependents": [], "transitiveDependents": [], "unresolvedReferences": []}
    path = normalize_repository_path(model_path)
    path_impact = context.get("impactByChangedPath", {})
    if isinstance(path_impact, Mapping) and isinstance(path_impact.get(path), Mapping):
        impact = path_impact[path]
        direct = list(impact.get("directDependents", ()))
        transitive = list(impact.get("transitiveDependents", ()))
    else:
        direct = []
        transitive = []
    edges = context.get("edges", ())
    unresolved = [
        dict(edge)
        for edge in edges
        if isinstance(edge, Mapping)
        and edge.get("source") == path
        and not edge.get("resolved")
    ]
    return {
        "directDependents": direct,
        "transitiveDependents": transitive,
        "unresolvedReferences": unresolved,
    }


def failed_context(message: str) -> dict[str, Any]:
    return {
        "status": "failed",
        "trust": "structural-non-semantic",
        "scanner": {},
        "changedPaths": [],
        "directlyAffectedModels": [],
        "transitivelyAffectedModels": [],
        "impactByChangedPath": {},
        "nodes": [],
        "edges": [],
        "cycles": [],
        "unresolvedReferences": [],
        "baseSummary": {},
        "headSummary": {},
        "errors": [{"side": "both", "path": "", "message": message}],
    }


def _validate_scan(document: object) -> dict[str, Any]:
    if not isinstance(document, Mapping):
        raise ContextScanError("relationship scanner result must be a JSON object")
    nodes = document.get("nodes")
    edges = document.get("edges")
    errors = document.get("errors")
    if not isinstance(nodes, list) or not isinstance(edges, list) or not isinstance(errors, list):
        raise ContextScanError("relationship scanner result has invalid collections")
    validated_nodes = []
    for node in nodes:
        if not isinstance(node, Mapping):
            raise ContextScanError("relationship scanner node must be an object")
        validated_nodes.append(
            {
                "path": normalize_repository_path(str(node.get("path", ""))),
                "kind": str(node.get("kind", "unknown")),
            }
        )
    validated_edges = []
    for edge in edges:
        if not isinstance(edge, Mapping):
            raise ContextScanError("relationship scanner edge must be an object")
        validated_edges.append(
            {
                "source": normalize_repository_path(str(edge.get("source", ""))),
                "target": str(edge.get("target", "")).replace("\\", "/"),
                "type": str(edge.get("type", "reference")),
            }
        )
    return {
        "schemaVersion": str(document.get("schemaVersion", "0.1.0")),
        "scanner": dict(document.get("scanner", {}))
        if isinstance(document.get("scanner"), Mapping)
        else {},
        "status": str(document.get("status", "partial")),
        "nodes": sorted(validated_nodes, key=lambda item: item["path"]),
        "edges": sorted(
            validated_edges,
            key=lambda item: (item["source"], item["type"], item["target"]),
        ),
        "errors": [
            {"path": str(item.get("path", "")), "message": str(item.get("message", ""))}
            for item in errors
            if isinstance(item, Mapping)
        ],
    }


def _resolve_scan(scan: Mapping[str, Any]) -> dict[str, Any]:
    nodes = [dict(node) for node in scan.get("nodes", ()) if isinstance(node, Mapping)]
    paths = {str(node["path"]) for node in nodes}
    by_basename: dict[str, list[str]] = defaultdict(list)
    for path in paths:
        by_basename[PurePosixPath(path).name.lower()].append(path)
    edges = []
    for raw in scan.get("edges", ()):
        if not isinstance(raw, Mapping):
            continue
        source = str(raw["source"])
        requested = str(raw["target"])
        target = _resolve_target(source, requested, paths, by_basename)
        edges.append(
            {
                "source": source,
                "target": target or requested,
                "requestedTarget": requested,
                "type": str(raw.get("type", "reference")),
                "resolved": target is not None,
            }
        )
    return {
        "nodes": sorted(nodes, key=lambda item: str(item["path"])),
        "edges": sorted(
            edges,
            key=lambda item: (
                str(item["source"]),
                str(item["type"]),
                str(item["target"]),
            ),
        ),
    }


def _resolve_target(
    source: str,
    requested: str,
    paths: set[str],
    by_basename: Mapping[str, list[str]],
) -> str | None:
    normalized = _normalize_reference(requested)
    relative = _normalize_reference(
        f"{PurePosixPath(source).parent.as_posix()}/{requested}"
    )
    candidates = [candidate for candidate in (normalized, relative) if candidate]
    for candidate in candidates:
        if candidate in paths:
            return candidate
    if normalized is None:
        return None
    matches = by_basename.get(PurePosixPath(normalized).name.lower(), ())
    return matches[0] if len(matches) == 1 else None


def _normalize_reference(value: str) -> str | None:
    parts: list[str] = []
    for part in value.replace("\\", "/").split("/"):
        if part in {"", "."}:
            continue
        if part == "..":
            if not parts:
                return None
            parts.pop()
            continue
        parts.append(part)
    if not parts:
        return None
    try:
        return normalize_repository_path("/".join(parts))
    except ValueError:
        return None


def _scan_summary(scan: Mapping[str, Any]) -> dict[str, int]:
    return {
        "nodes": len(scan.get("nodes", ())),
        "edges": len(scan.get("edges", ())),
        "errors": len(scan.get("errors", ())),
    }


def _reverse_edges(edges: Sequence[Mapping[str, Any]]) -> dict[str, set[str]]:
    reverse: dict[str, set[str]] = defaultdict(set)
    for edge in edges:
        if edge.get("resolved"):
            reverse[str(edge["target"])].add(str(edge["source"]))
    return reverse


def _dependents_for(
    changed: str, reverse: Mapping[str, set[str]]
) -> tuple[set[str], set[str]]:
    direct = set(reverse.get(changed, ()))
    transitive: set[str] = set()
    visited = {changed, *direct}
    queue: deque[str] = deque(sorted(direct))
    while queue:
        target = queue.popleft()
        for dependent in sorted(reverse.get(target, ())):
            if dependent in visited:
                continue
            visited.add(dependent)
            transitive.add(dependent)
            queue.append(dependent)
    return direct, transitive


def _cycles(
    nodes: Sequence[Mapping[str, Any]],
    edges: Sequence[Mapping[str, Any]],
) -> list[list[str]]:
    graph: dict[str, list[str]] = defaultdict(list)
    model_paths = {
        str(node["path"]) for node in nodes if node.get("kind") == "model"
    }
    for edge in edges:
        source = str(edge["source"])
        target = str(edge["target"])
        if edge.get("resolved") and source in model_paths and target in model_paths:
            graph[source].append(target)
    found: set[tuple[str, ...]] = set()
    active: list[str] = []
    active_set: set[str] = set()
    visited: set[str] = set()

    def visit(node: str) -> None:
        visited.add(node)
        active.append(node)
        active_set.add(node)
        for target in sorted(graph.get(node, ())):
            if target not in visited:
                visit(target)
            elif target in active_set:
                start = active.index(target)
                cycle = [*active[start:], target]
                body = cycle[:-1]
                rotations = [tuple(body[index:] + body[:index]) for index in range(len(body))]
                canonical = min(rotations)
                found.add((*canonical, canonical[0]))
        active.pop()
        active_set.remove(node)

    for node in sorted(model_paths):
        if node not in visited:
            visit(node)
    return [list(cycle) for cycle in sorted(found)]
