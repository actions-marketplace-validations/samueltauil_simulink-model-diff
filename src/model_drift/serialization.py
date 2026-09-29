"""Deterministic JSON serialization and stable fingerprint helpers."""

from __future__ import annotations

import hashlib
import json
import math
import re
from collections.abc import Collection, Mapping
from dataclasses import fields, is_dataclass
from enum import Enum
from pathlib import PurePath
from typing import Any

_CAMEL_BOUNDARY = re.compile(r"_([a-zA-Z0-9])")


def _json_key(name: str) -> str:
    if name == "schema":
        return "$schema"
    return _CAMEL_BOUNDARY.sub(lambda match: match.group(1).upper(), name)


def normalize_repository_path(path: str | PurePath) -> str:
    """Return a stable repository-relative path using POSIX separators."""
    normalized = str(path).replace("\\", "/")
    while "//" in normalized:
        normalized = normalized.replace("//", "/")
    if normalized.startswith("/") or re.match(r"^[a-zA-Z]:/", normalized):
        raise ValueError(f"path must be repository-relative: {path!s}")
    parts = [part for part in normalized.split("/") if part not in ("", ".")]
    if any(part == ".." for part in parts):
        raise ValueError(f"path must not escape the repository: {path!s}")
    return "/".join(parts)


def to_json_value(value: Any) -> Any:
    """Convert supported domain values to deterministic JSON-compatible values."""
    if is_dataclass(value) and not isinstance(value, type):
        return {
            _json_key(item.name): to_json_value(getattr(value, item.name))
            for item in fields(value)
        }
    if isinstance(value, Enum):
        return value.value
    if value is None or isinstance(value, (str, bool, int)):
        return value
    if isinstance(value, float):
        if not math.isfinite(value):
            raise ValueError("non-finite floats are not valid canonical JSON")
        return 0.0 if value == 0 else value
    if isinstance(value, Mapping):
        if not all(isinstance(key, str) for key in value):
            raise TypeError("canonical JSON object keys must be strings")
        return {key: to_json_value(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [to_json_value(item) for item in value]
    raise TypeError(f"unsupported canonical JSON value: {type(value).__name__}")


def canonical_json_text(value: Any, *, trailing_newline: bool = True) -> str:
    """Serialize a value using the project's canonical JSON representation."""
    text = json.dumps(
        to_json_value(value),
        ensure_ascii=False,
        allow_nan=False,
        sort_keys=True,
        separators=(",", ":"),
    )
    return f"{text}\n" if trailing_newline else text


def canonical_json_bytes(value: Any, *, trailing_newline: bool = True) -> bytes:
    return canonical_json_text(value, trailing_newline=trailing_newline).encode("utf-8")


def _without_keys(value: Any, excluded: Collection[str]) -> Any:
    if isinstance(value, Mapping):
        return {
            key: _without_keys(item, excluded)
            for key, item in value.items()
            if key not in excluded
        }
    if isinstance(value, list):
        return [_without_keys(item, excluded) for item in value]
    return value


def fingerprint_json(value: Any, *, exclude_keys: Collection[str] = ()) -> str:
    """Return a SHA-256 fingerprint of canonical JSON without a trailing newline."""
    normalized = _without_keys(to_json_value(value), set(exclude_keys))
    return hashlib.sha256(canonical_json_bytes(normalized, trailing_newline=False)).hexdigest()


def stable_fingerprint(*parts: str, namespace: str = "simulink-model-drift/v1") -> str:
    """Hash ordered identity parts using length-prefixing to prevent ambiguity."""
    digest = hashlib.sha256()
    for part in (namespace, *parts):
        encoded = part.encode("utf-8")
        digest.update(len(encoded).to_bytes(8, byteorder="big"))
        digest.update(encoded)
    return digest.hexdigest()
