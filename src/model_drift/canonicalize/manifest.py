from __future__ import annotations

import json
import math
import re
from collections.abc import Mapping
from copy import deepcopy
from dataclasses import is_dataclass
from enum import Enum
from typing import Any

from model_drift.serialization import (
    canonical_json_text,
    fingerprint_json,
    normalize_repository_path,
    to_json_value,
)

_ANALYSIS_STATUSES = {"complete", "partial", "unsupported", "failed"}
_VOLATILE_METADATA_KEYS = {"createdAt", "extractedAt", "generatedAt", "timestamp"}
_ORDERED_COLLECTIONS = {
    ("blocks",),
    ("connections",),
    ("systems",),
    ("interfaces", "inports"),
    ("interfaces", "outports"),
    ("interfaces", "triggerPorts"),
    ("interfaces", "enablePorts"),
    ("interfaces", "buses"),
    ("stateflow", "charts"),
    ("stateflow", "states"),
    ("stateflow", "transitions"),
    ("stateflow", "junctions"),
    ("stateflow", "events"),
    ("stateflow", "data"),
    ("references", "models"),
    ("references", "libraries"),
    ("references", "dataDictionaries"),
    ("references", "requirements"),
}
_MULTIPLE_SLASHES = re.compile(r"/+")


class ManifestCanonicalizationError(ValueError):
    pass


def canonicalize_manifest(manifest: Any) -> dict[str, Any]:
    """Canonicalize a semantic manifest produced by a supported extractor."""
    source = _as_mapping(manifest)
    result = _canonicalize(deepcopy(dict(source)), ())
    if not isinstance(result, dict):
        raise ManifestCanonicalizationError("manifest must canonicalize to an object")

    analysis = result.setdefault(
        "analysis",
        {
            "status": "unsupported",
            "warnings": ["Extraction completeness was not reported."],
            "unsupportedFeatures": ["Missing extraction analysis metadata."],
        },
    )
    if not isinstance(analysis, dict):
        raise ManifestCanonicalizationError("analysis must be an object")
    status = analysis.get("status")
    if status not in _ANALYSIS_STATUSES:
        raise ManifestCanonicalizationError(
            "analysis.status must be complete, partial, unsupported, or failed"
        )
    analysis["warnings"] = _sorted_unique_strings(analysis.get("warnings", []))
    analysis["unsupportedFeatures"] = _sorted_unique_strings(
        analysis.get("unsupportedFeatures", [])
    )

    _ensure_stable_identities(result)
    result = _canonicalize(result, ())
    result["fingerprints"] = compute_fingerprints(result)
    return _canonicalize(result, ())


def compute_fingerprints(manifest: Mapping[str, Any]) -> dict[str, str]:
    canonical = _canonicalize(dict(manifest), ())
    canonical.pop("fingerprints", None)

    blocks = canonical.get("blocks", [])
    structural_blocks = [
        {key: value for key, value in block.items() if key != "parameters"}
        if isinstance(block, dict)
        else block
        for block in blocks
    ]
    parameter_view = [
        {
            "id": block.get("id"),
            "path": block.get("path"),
            "parameters": block.get("parameters", {}),
        }
        for block in blocks
        if isinstance(block, dict)
    ]

    views = {
        "structure": {
            "model": canonical.get("model", {}),
            "systems": canonical.get("systems", []),
            "blocks": structural_blocks,
            "connections": canonical.get("connections", []),
        },
        "interfaces": canonical.get("interfaces", {}),
        "parameters": parameter_view,
        "stateflow": canonical.get("stateflow", {}),
        "configuration": canonical.get("configuration", {}),
    }
    model_view = {
        "model": canonical.get("model", {}),
        "interfaces": views["interfaces"],
        "systems": canonical.get("systems", []),
        "blocks": blocks,
        "connections": canonical.get("connections", []),
        "stateflow": views["stateflow"],
        "configuration": views["configuration"],
        "references": canonical.get("references", {}),
    }
    return {
        "model": _fingerprint(model_view),
        "structure": _fingerprint(views["structure"]),
        "interfaces": _fingerprint(views["interfaces"]),
        "parameters": _fingerprint(views["parameters"]),
        "stateflow": _fingerprint(views["stateflow"]),
        "configuration": _fingerprint(views["configuration"]),
    }


def canonical_json(manifest: Any, *, trailing_newline: bool = True) -> str:
    return canonical_json_text(
        canonicalize_manifest(manifest),
        trailing_newline=trailing_newline,
    )


def _as_mapping(value: Any) -> Mapping[str, Any]:
    if isinstance(value, Mapping):
        return value
    if is_dataclass(value):
        converted = to_json_value(value)
        if isinstance(converted, Mapping):
            return converted
    to_dict = getattr(value, "to_dict", None)
    if callable(to_dict):
        converted = to_dict()
        if isinstance(converted, Mapping):
            return converted
    model_dump = getattr(value, "model_dump", None)
    if callable(model_dump):
        converted = model_dump(by_alias=True, exclude_none=False)
        if isinstance(converted, Mapping):
            return converted
    raise ManifestCanonicalizationError(
        "manifest must be a mapping, dataclass, or expose to_dict()/model_dump()"
    )


def _canonicalize(value: Any, path: tuple[str, ...]) -> Any:
    if isinstance(value, Mapping):
        if not all(isinstance(key, str) for key in value):
            raise ManifestCanonicalizationError("manifest object keys must be strings")
        normalized: dict[str, Any] = {}
        for key in sorted(value):
            if _is_volatile(path, key):
                continue
            item = _canonicalize(value[key], (*path, key))
            if isinstance(item, str) and _is_path_field(path, key):
                item = _normalize_path(
                    item,
                    repository_path=path == ("source",),
                )
            if isinstance(item, str) and key in {"id", "blockId"}:
                item = _normalize_identity(item)
            normalized[key] = item
        return normalized
    if isinstance(value, (list, tuple)):
        items = [_canonicalize(item, path) for item in value]
        if path in _ORDERED_COLLECTIONS:
            return sorted(items, key=_collection_sort_key)
        return items
    if isinstance(value, float):
        if not math.isfinite(value):
            raise ManifestCanonicalizationError(
                "NaN and infinite numbers are not valid canonical values"
            )
        if value == 0:
            return 0
        if value.is_integer():
            return int(value)
        return float(format(value, ".15g"))
    if isinstance(value, Enum):
        return _canonicalize(value.value, path)
    if value is None or isinstance(value, (str, int, bool)):
        return value
    raise ManifestCanonicalizationError(
        f"unsupported canonical value type: {type(value).__name__}"
    )


def _normalize_path(value: str, *, repository_path: bool = False) -> str:
    if repository_path:
        try:
            return normalize_repository_path(value)
        except ValueError as exc:
            raise ManifestCanonicalizationError(str(exc)) from exc
    normalized = _MULTIPLE_SLASHES.sub("/", value.replace("\\", "/"))
    while normalized.startswith("./"):
        normalized = normalized[2:]
    if normalized.startswith("/") or re.match(r"^[a-zA-Z]:/", normalized):
        raise ManifestCanonicalizationError(
            f"model path must not be absolute: {value}"
        )
    if ".." in normalized.split("/"):
        raise ManifestCanonicalizationError(
            f"model path must not contain parent traversal: {value}"
        )
    return normalized.rstrip("/") if normalized != "/" else normalized


def _normalize_identity(value: str) -> str:
    if value.startswith("block:"):
        return f"block:{_normalize_path(value.removeprefix('block:'))}"
    if value.startswith("system:"):
        return f"system:{_normalize_path(value.removeprefix('system:'))}"
    return value


def _is_path_field(path: tuple[str, ...], key: str) -> bool:
    if path == ("source",):
        return key == "artifact"
    if path == ("model",):
        return key == "rootPath"
    if path and path[0] in {"blocks", "systems"}:
        return key in {"path", "parent"}
    if path and path[0] == "stateflow":
        return key == "modelPath"
    return False


def _is_volatile(path: tuple[str, ...], key: str) -> bool:
    if key == "uiMetadata":
        return True
    return key in _VOLATILE_METADATA_KEYS and path in {
        (),
        ("generator",),
        ("source",),
    }


def _collection_sort_key(value: Any) -> tuple[str, str]:
    if isinstance(value, dict):
        for key in ("id", "path", "name", "artifact"):
            candidate = value.get(key)
            if candidate is not None:
                return str(candidate), _stable_json(value)
    return "", _stable_json(value)


def _sorted_unique_strings(value: Any) -> list[str]:
    if not isinstance(value, (list, tuple)):
        raise ManifestCanonicalizationError("diagnostic collections must be arrays")
    if not all(isinstance(item, str) for item in value):
        raise ManifestCanonicalizationError(
            "diagnostic collections must contain only strings"
        )
    return sorted(set(value))


def _ensure_stable_identities(manifest: dict[str, Any]) -> None:
    blocks = manifest.get("blocks", [])
    if isinstance(blocks, list):
        for block in blocks:
            if not isinstance(block, dict):
                continue
            path = block.get("path")
            if "id" not in block and isinstance(path, str):
                block["id"] = f"block:{_normalize_path(path)}"

    connections = manifest.get("connections", [])
    if isinstance(connections, list):
        for connection in connections:
            if not isinstance(connection, dict) or connection.get("id"):
                continue
            identity = {
                "source": connection.get("source"),
                "destination": connection.get("destination"),
                "signal": connection.get("signal"),
            }
            connection["id"] = f"connection:{_fingerprint(identity)}"


def _fingerprint(value: Any) -> str:
    return fingerprint_json(_canonicalize(value, ()))


def _stable_json(value: Any) -> str:
    return json.dumps(
        _canonicalize(value, ()),
        ensure_ascii=True,
        allow_nan=False,
        sort_keys=True,
        separators=(",", ":"),
    )
