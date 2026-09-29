from __future__ import annotations

import hashlib
import xml.etree.ElementTree as ET
import zipfile
from collections import Counter
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import BinaryIO

from model_drift.models import AnalysisStatus

_CONTENT_TYPES_PART = "[Content_Types].xml"
_CONTENT_TYPES_NAMESPACE = "http://schemas.openxmlformats.org/package/2006/content-types"
_READ_CHUNK_SIZE = 1024 * 1024


@dataclass(frozen=True, slots=True)
class InventoryLimits:
    max_archive_bytes: int = 1024 * 1024 * 1024
    max_entries: int = 10_000
    max_member_uncompressed_bytes: int = 128 * 1024 * 1024
    max_total_uncompressed_bytes: int = 512 * 1024 * 1024
    max_compression_ratio: float = 250.0
    max_opc_xml_bytes: int = 2 * 1024 * 1024

    def __post_init__(self) -> None:
        if (
            self.max_archive_bytes <= 0
            or self.max_entries <= 0
            or self.max_member_uncompressed_bytes <= 0
            or self.max_total_uncompressed_bytes <= 0
            or self.max_compression_ratio <= 0
            or self.max_opc_xml_bytes <= 0
        ):
            raise ValueError("inventory limits must be positive")


@dataclass(frozen=True, slots=True)
class PackageEntry:
    name: str
    content_type: str | None
    compressed_bytes: int
    uncompressed_bytes: int
    compression_method: int
    crc32: str
    encrypted: bool

    def to_dict(self) -> dict[str, object]:
        return {
            "name": self.name,
            "contentType": self.content_type,
            "compressedBytes": self.compressed_bytes,
            "uncompressedBytes": self.uncompressed_bytes,
            "compressionMethod": self.compression_method,
            "crc32": self.crc32,
            "encrypted": self.encrypted,
        }


@dataclass(frozen=True, slots=True)
class PackageInventory:
    source: str
    artifact_sha256: str | None
    status: AnalysisStatus
    is_zip: bool
    is_opc: bool
    entries: tuple[PackageEntry, ...] = ()
    warnings: tuple[str, ...] = ()
    unsupported_features: tuple[str, ...] = ()
    error: str | None = None

    def to_dict(self) -> dict[str, object]:
        return {
            "source": self.source,
            "artifactSha256": self.artifact_sha256,
            "analysis": {
                "status": self.status.value,
                "warnings": list(self.warnings),
                "unsupportedFeatures": list(self.unsupported_features),
                "error": self.error,
            },
            "package": {
                "isZip": self.is_zip,
                "isOpc": self.is_opc,
                "entries": [entry.to_dict() for entry in self.entries],
            },
        }


def inspect_slx_package(
    artifact: str | Path,
    *,
    limits: InventoryLimits | None = None,
    validate_crc: bool = True,
) -> PackageInventory:
    """Inspect documented ZIP/OPC structures without interpreting Simulink XML."""
    path = Path(artifact)
    source = path.as_posix()
    active_limits = limits or InventoryLimits()

    if not path.exists():
        return _failed(source, f"Artifact does not exist: {source}")
    if not path.is_file():
        return _failed(source, f"Artifact is not a regular file: {source}")

    try:
        artifact_size = path.stat().st_size
    except OSError as exc:
        return _failed(source, f"Artifact metadata could not be read: {exc}")

    if artifact_size > active_limits.max_archive_bytes:
        return PackageInventory(
            source=source,
            artifact_sha256=None,
            status=AnalysisStatus.UNSUPPORTED,
            is_zip=False,
            is_opc=False,
            unsupported_features=(
                "Artifact exceeds the configured compressed archive size limit.",
            ),
        )

    try:
        artifact_sha256 = _hash_file(path)
    except OSError as exc:
        return _failed(source, f"Artifact could not be read: {exc}")
    if not zipfile.is_zipfile(path):
        return _failed(
            source,
            "Artifact is not a valid ZIP archive; SLX package inventory was not possible.",
            artifact_sha256=artifact_sha256,
        )

    warnings: set[str] = set()
    unsupported: set[str] = set()
    if path.suffix.lower() != ".slx":
        warnings.add("Artifact does not use the .slx extension.")

    try:
        with zipfile.ZipFile(path) as package:
            infos = package.infolist()
            limit_error = _check_archive_limits(infos, active_limits)
            if limit_error:
                unsupported.add(limit_error)
                return PackageInventory(
                    source=source,
                    artifact_sha256=artifact_sha256,
                    status=AnalysisStatus.UNSUPPORTED,
                    is_zip=True,
                    is_opc=_CONTENT_TYPES_PART in package.namelist(),
                    warnings=tuple(sorted(warnings)),
                    unsupported_features=tuple(sorted(unsupported)),
                )

            names = [info.filename for info in infos]
            duplicate_names = sorted(
                name for name, count in Counter(names).items() if count > 1
            )
            if duplicate_names:
                warnings.add(
                    "Archive contains duplicate member names: "
                    + ", ".join(duplicate_names)
                )

            unsafe_names = sorted(
                info.filename for info in infos if not _is_safe_part_name(info.filename)
            )
            if unsafe_names:
                warnings.add(
                    "Archive contains non-canonical or traversal-like member names: "
                    + ", ".join(unsafe_names)
                )

            encrypted = sorted(
                info.filename for info in infos if bool(info.flag_bits & 0x1)
            )
            if encrypted:
                unsupported.add(
                    "Encrypted ZIP members cannot be inspected: " + ", ".join(encrypted)
                )

            if _CONTENT_TYPES_PART not in names:
                unsupported.add(
                    "ZIP archive has no [Content_Types].xml OPC manifest."
                )
                return PackageInventory(
                    source=source,
                    artifact_sha256=artifact_sha256,
                    status=AnalysisStatus.UNSUPPORTED,
                    is_zip=True,
                    is_opc=False,
                    warnings=tuple(sorted(warnings)),
                    unsupported_features=tuple(sorted(unsupported)),
                )

            content_types = _read_content_types(package, active_limits)
            entries = tuple(
                sorted(
                    (
                        _entry_from_info(info, content_types)
                        for info in infos
                    ),
                    key=lambda item: item.name,
                )
            )

            if validate_crc and not encrypted:
                _validate_members(package, infos)
            elif not validate_crc:
                warnings.add("ZIP member CRC validation was not requested.")

            warnings.add(
                "Raw package inspection is diagnostic only; Simulink semantics "
                "were not evaluated."
            )
            unsupported.add(
                "Semantic model extraction requires a supported MATLAB/Simulink "
                "API or official comparison result."
            )
            return PackageInventory(
                source=source,
                artifact_sha256=artifact_sha256,
                status=(
                    AnalysisStatus.UNSUPPORTED
                    if encrypted
                    else AnalysisStatus.PARTIAL
                ),
                is_zip=True,
                is_opc=True,
                entries=entries,
                warnings=tuple(sorted(warnings)),
                unsupported_features=tuple(sorted(unsupported)),
            )
    except (zipfile.BadZipFile, EOFError, OSError, ET.ParseError, RuntimeError) as exc:
        return _failed(
            source,
            f"Malformed or unreadable SLX OPC package: {exc}",
            artifact_sha256=artifact_sha256,
            is_zip=True,
            is_opc=True,
        )


def _failed(
    source: str,
    message: str,
    *,
    artifact_sha256: str | None = None,
    is_zip: bool = False,
    is_opc: bool = False,
) -> PackageInventory:
    return PackageInventory(
        source=source,
        artifact_sha256=artifact_sha256,
        status=AnalysisStatus.FAILED,
        is_zip=is_zip,
        is_opc=is_opc,
        error=message,
    )


def _hash_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(_READ_CHUNK_SIZE), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _check_archive_limits(
    infos: list[zipfile.ZipInfo], limits: InventoryLimits
) -> str | None:
    if len(infos) > limits.max_entries:
        return (
            f"Archive contains {len(infos)} members, exceeding the configured "
            f"limit of {limits.max_entries}."
        )

    total_size = 0
    for info in infos:
        total_size += info.file_size
        if info.file_size > limits.max_member_uncompressed_bytes:
            return (
                f"Member {info.filename!r} exceeds the configured uncompressed "
                "size limit."
            )
        ratio = info.file_size / max(info.compress_size, 1)
        if ratio > limits.max_compression_ratio:
            return (
                f"Member {info.filename!r} exceeds the configured compression "
                "ratio limit."
            )
    if total_size > limits.max_total_uncompressed_bytes:
        return "Archive exceeds the configured total uncompressed size limit."
    return None


def _is_safe_part_name(name: str) -> bool:
    normalized = name.replace("\\", "/")
    path = PurePosixPath(normalized)
    return (
        bool(normalized)
        and not normalized.startswith("/")
        and "\\" not in name
        and ".." not in path.parts
        and not any(part in ("", ".") for part in path.parts)
    )


def _read_content_types(
    package: zipfile.ZipFile, limits: InventoryLimits
) -> tuple[dict[str, str], dict[str, str]]:
    info = package.getinfo(_CONTENT_TYPES_PART)
    if info.file_size > limits.max_opc_xml_bytes:
        raise RuntimeError("[Content_Types].xml exceeds the configured XML size limit")
    payload = package.read(info)
    upper_payload = payload.upper()
    if b"<!DOCTYPE" in upper_payload or b"<!ENTITY" in upper_payload:
        raise RuntimeError(
            "[Content_Types].xml contains prohibited DTD or entity declarations"
        )

    root = ET.fromstring(payload)
    if root.tag != f"{{{_CONTENT_TYPES_NAMESPACE}}}Types":
        raise ET.ParseError("[Content_Types].xml has an unexpected root element")

    defaults: dict[str, str] = {}
    overrides: dict[str, str] = {}
    for child in root:
        if child.tag == f"{{{_CONTENT_TYPES_NAMESPACE}}}Default":
            extension = child.attrib.get("Extension", "").lower()
            content_type = child.attrib.get("ContentType", "")
            if extension and content_type:
                defaults[extension] = content_type
        elif child.tag == f"{{{_CONTENT_TYPES_NAMESPACE}}}Override":
            part_name = child.attrib.get("PartName", "").lstrip("/")
            content_type = child.attrib.get("ContentType", "")
            if part_name and content_type:
                overrides[part_name] = content_type
    return defaults, overrides


def _entry_from_info(
    info: zipfile.ZipInfo,
    content_types: tuple[dict[str, str], dict[str, str]],
) -> PackageEntry:
    defaults, overrides = content_types
    extension = PurePosixPath(info.filename).suffix.lstrip(".").lower()
    content_type = overrides.get(info.filename, defaults.get(extension))
    return PackageEntry(
        name=info.filename,
        content_type=content_type,
        compressed_bytes=info.compress_size,
        uncompressed_bytes=info.file_size,
        compression_method=info.compress_type,
        crc32=f"{info.CRC:08x}",
        encrypted=bool(info.flag_bits & 0x1),
    )


def _validate_members(
    package: zipfile.ZipFile, infos: list[zipfile.ZipInfo]
) -> None:
    for info in infos:
        if info.is_dir():
            continue
        with package.open(info) as stream:
            _drain(stream)


def _drain(stream: BinaryIO) -> None:
    while stream.read(_READ_CHUNK_SIZE):
        pass
