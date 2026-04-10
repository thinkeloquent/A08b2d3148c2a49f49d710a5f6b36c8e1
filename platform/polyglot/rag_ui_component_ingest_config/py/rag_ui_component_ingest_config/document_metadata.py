"""Document metadata types and enrichment utilities for rag_ui_component_ingest_config."""

from __future__ import annotations

import hashlib
import re
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Optional

from .logger import create_logger

_log = create_logger("document_metadata")


# ---------------------------------------------------------------------------
# SourceType
# ---------------------------------------------------------------------------


class SourceType(str, Enum):
    """Classifies the semantic role of an ingested document chunk."""

    component = "component"
    story = "story"
    doc = "doc"
    style = "style"
    type = "type"
    test = "test"
    config = "config"


# ---------------------------------------------------------------------------
# DocumentMetadata dataclass
# ---------------------------------------------------------------------------


@dataclass
class DocumentMetadata:
    """Metadata attached to every document chunk stored in the vector index."""

    # ---- Identity --------------------------------------------------------
    library: str
    file_name: str
    file_path: str
    source_type: str
    language: str
    content_hash: str
    chunk_index: int
    total_chunks: int
    ingested_at: str

    # ---- Optional identity -----------------------------------------------
    library_version: Optional[str] = None
    component: Optional[str] = None

    # ---- Navigation ------------------------------------------------------
    heading: Optional[str] = None
    export_name: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        """Return a plain dict representation."""
        return asdict(self)


# ---------------------------------------------------------------------------
# Source type classification
# ---------------------------------------------------------------------------

_STORY_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile(r"\.stories\.[jt]sx?$", re.IGNORECASE),
    re.compile(r"\.story\.[jt]sx?$", re.IGNORECASE),
    re.compile(r"/stories/", re.IGNORECASE),
)

_STYLE_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile(r"\.(css|less|scss|sass|styl)$", re.IGNORECASE),
)

_TYPE_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile(r"\.d\.ts$", re.IGNORECASE),
    re.compile(r"/types/", re.IGNORECASE),
    re.compile(r"/type/", re.IGNORECASE),
)

_TEST_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile(r"\.(test|spec)\.[jt]sx?$", re.IGNORECASE),
    re.compile(r"/__tests__/", re.IGNORECASE),
    re.compile(r"/__snapshots__/", re.IGNORECASE),
)

_DOC_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile(r"\.(md|mdx)$", re.IGNORECASE),
    re.compile(r"/docs?/", re.IGNORECASE),
)

_CONFIG_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile(
        r"(webpack|babel|jest|rollup|vite|tsconfig|eslint|prettier)\.(config|rc)\.[jt]sx?$",
        re.IGNORECASE,
    ),
    re.compile(r"\.(json|yaml|yml|toml)$", re.IGNORECASE),
)


def classify_source_type(file_path: str) -> str:
    """Classify a file path into one of the ``SourceType`` string values.

    Evaluation order (first match wins):
    test → story → style → type → doc → config → component
    """
    for pat in _TEST_PATTERNS:
        if pat.search(file_path):
            return SourceType.test.value

    for pat in _STORY_PATTERNS:
        if pat.search(file_path):
            return SourceType.story.value

    for pat in _STYLE_PATTERNS:
        if pat.search(file_path):
            return SourceType.style.value

    for pat in _TYPE_PATTERNS:
        if pat.search(file_path):
            return SourceType.type.value

    for pat in _DOC_PATTERNS:
        if pat.search(file_path):
            return SourceType.doc.value

    for pat in _CONFIG_PATTERNS:
        if pat.search(file_path):
            return SourceType.config.value

    return SourceType.component.value


# ---------------------------------------------------------------------------
# Component name extraction
# ---------------------------------------------------------------------------


def extract_component(
    file_path: str, component_path_segment: str = "components"
) -> Optional[str]:
    """Extract the component name from *file_path* relative to *component_path_segment*.

    Returns the first path segment immediately following ``component_path_segment``
    in the resolved file path, or ``None`` if the segment is not present.

    Example::

        extract_component(".../antd/components/Button/index.tsx", "components")
        # → "Button"
    """
    parts = Path(file_path).parts
    for i, part in enumerate(parts):
        if part == component_path_segment and i + 1 < len(parts):
            return parts[i + 1]
    return None


# ---------------------------------------------------------------------------
# Language detection
# ---------------------------------------------------------------------------

_EXT_LANGUAGE_MAP: dict[str, str] = {
    ".tsx": "typescript",
    ".ts": "typescript",
    ".jsx": "javascript",
    ".js": "javascript",
    ".mjs": "javascript",
    ".cjs": "javascript",
    ".md": "markdown",
    ".mdx": "mdx",
    ".css": "css",
    ".less": "less",
    ".scss": "scss",
    ".sass": "sass",
    ".json": "json",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".toml": "toml",
    ".py": "python",
    ".rs": "rust",
    ".go": "go",
    ".java": "java",
    ".rb": "ruby",
    ".php": "php",
    ".html": "html",
    ".htm": "html",
    ".svg": "svg",
    ".graphql": "graphql",
    ".gql": "graphql",
}


def detect_language(file_path: str) -> str:
    """Detect the programming / markup language from the file extension.

    Returns a lowercase language name string, or ``"unknown"`` when the
    extension is not recognised.
    """
    suffix = Path(file_path).suffix.lower()
    # Handle double extensions like `.d.ts`
    stem = Path(file_path).stem
    if stem.endswith(".d") and suffix == ".ts":
        return "typescript"
    return _EXT_LANGUAGE_MAP.get(suffix, "unknown")


# ---------------------------------------------------------------------------
# Import-pattern builder
# ---------------------------------------------------------------------------


def build_import_patterns(import_packages: list[str]) -> list[re.Pattern[str]]:
    """Build regex patterns that match ES import / require statements for *import_packages*.

    Each pattern matches either::

        import ... from 'package-name'
        import ... from "package-name"
        require('package-name')
        require("package-name")

    Scoped packages (e.g. ``@ant-design/icons``) and sub-path imports
    (``antd/button``) are handled by anchoring on the package root.
    """
    patterns: list[re.Pattern[str]] = []
    for pkg in import_packages:
        escaped = re.escape(pkg)
        # Match import/require from the package root or any sub-path
        patterns.append(
            re.compile(
                rf"""(?:import\s+.*?\s+from\s+|require\s*\(\s*)['"]{escaped}(?:/[^'"]*)?['"]""",
                re.DOTALL,
            )
        )
    return patterns


def build_component_extract_patterns(import_packages: list[str]) -> list[re.Pattern[str]]:
    """Build regex patterns that extract named imports from destructured ES imports.

    Unlike ``build_import_patterns()`` (boolean match), these patterns include
    a capture group ``([^}]+)`` to extract the comma-separated import names.

    Example match::

        import { Button, Input } from 'antd'
        → capture group 1 = " Button, Input "
    """
    patterns: list[re.Pattern[str]] = []
    for pkg in import_packages:
        escaped = re.escape(pkg)
        patterns.append(
            re.compile(
                r"import\s*\{([^}]+)\}\s*from\s*['\"]" + escaped + r"(?:/[^'\"]*)?['\"]"
            )
        )
    return patterns


# ---------------------------------------------------------------------------
# Metadata enrichment
# ---------------------------------------------------------------------------


def _compute_hash(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def _now_iso() -> str:
    return datetime.now(tz=timezone.utc).isoformat()


def enrich_metadata(doc: Any, library_config: Any) -> Any:
    """Enrich a document object or dict with full metadata fields.

    Parameters
    ----------
    doc:
        Either a dict with ``"page_content"`` and ``"metadata"`` keys, or an
        object exposing ``page_content`` (str) and ``metadata`` (dict)
        attributes (e.g. a LangChain ``Document``).
    library_config:
        A ``ResolvedLibraryConfig`` instance (or any object/dict with the
        expected attributes).

    Returns
    -------
    The same *doc* object/dict with ``metadata`` mutated in-place to include
    all standard fields.
    """
    # --- Unpack doc -------------------------------------------------------
    if isinstance(doc, dict):
        content: str = doc.get("page_content", "")
        meta: dict[str, Any] = doc.setdefault("metadata", {})
    else:
        content = getattr(doc, "page_content", "")
        meta = doc.metadata  # type: ignore[union-attr]

    # --- Unpack library_config -------------------------------------------
    if isinstance(library_config, dict):
        slug: str = library_config.get("slug", "")
        version: Optional[str] = library_config.get("version")
        component_path_segment: str = library_config.get("component_path_segment", "components")
    else:
        slug = getattr(library_config, "slug", "")
        version = getattr(library_config, "version", None)
        component_path_segment = getattr(library_config, "component_path_segment", "components")

    file_path: str = meta.get("file_path", meta.get("source", ""))
    file_name: str = Path(file_path).name if file_path else meta.get("file_name", "")

    # --- Derive fields ----------------------------------------------------
    source_type = classify_source_type(file_path)
    language = detect_language(file_path)
    component = extract_component(file_path, component_path_segment)
    content_hash = _compute_hash(content)
    ingested_at = _now_iso()

    chunk_index: int = int(meta.get("chunk_index", 0))
    total_chunks: int = int(meta.get("total_chunks", 1))

    # --- Write enriched metadata -----------------------------------------
    meta.update(
        {
            "library": slug,
            "library_version": version,
            "component": component,
            "file_name": file_name,
            "file_path": file_path,
            "source_type": source_type,
            "language": language,
            "content_hash": content_hash,
            "chunk_index": chunk_index,
            "total_chunks": total_chunks,
            "ingested_at": ingested_at,
        }
    )

    _log.debug(
        "Enriched metadata for '%s' chunk %d/%d (source_type=%s)",
        file_name,
        chunk_index,
        total_chunks,
        source_type,
    )

    return doc
