"""Component detection from search results.

Detects UI component names via:
- Metadata inspection (component field)
- JSX tag parsing
- Import pattern matching (via rag_ui_component_ingest_config)
"""

import re
from typing import Optional


_JSX_TAG_RE = re.compile(r"<([A-Z][a-zA-Z0-9]*(?:\.[A-Z][a-zA-Z0-9]*)?)")

# Default import packages (Ant Design) for backward compatibility
_DEFAULT_IMPORT_PACKAGES = ["antd", "@ant-design/icons", "@ant-design/pro-components"]

# Module-level cache: tuple(import_packages) -> list[re.Pattern]
_extract_pattern_cache: dict[tuple[str, ...], list[re.Pattern[str]]] = {}


def _get_import_extract_patterns(
    import_packages: Optional[list[str]] = None,
) -> list[re.Pattern[str]]:
    """Return cached component-extract patterns for the given import packages."""
    pkgs = tuple(import_packages or _DEFAULT_IMPORT_PACKAGES)
    if pkgs not in _extract_pattern_cache:
        from rag_ui_component_ingest_config import build_component_extract_patterns

        _extract_pattern_cache[pkgs] = build_component_extract_patterns(list(pkgs))
    return _extract_pattern_cache[pkgs]


def detect_components_metadata(results: list) -> list[str]:
    """Detect component names from document metadata.

    Args:
        results: List of (document, score) tuples where document has .metadata dict.

    Returns:
        Sorted list of unique lowercase component names.
    """
    components = set()
    for doc, _score in results:
        comp = doc.metadata.get("component")
        if comp:
            components.add(comp.lower().strip())
    return sorted(components)


def detect_components_parse(
    results: list,
    import_packages: Optional[list[str]] = None,
) -> list[str]:
    """Detect component names by parsing document content.

    Combines metadata detection with JSX tag parsing and import pattern matching.

    Args:
        results: List of (document, score) tuples.
        import_packages: Package names to build import patterns for.
            Defaults to Ant Design packages.

    Returns:
        Sorted list of unique lowercase component names.
    """
    components = set(detect_components_metadata(results))
    extract_patterns = _get_import_extract_patterns(import_packages)
    for doc, _score in results:
        text = doc.page_content
        for m in _JSX_TAG_RE.finditer(text):
            components.add(m.group(1).lower())
        for pat in extract_patterns:
            for m in pat.finditer(text):
                for name in m.group(1).split(","):
                    name = name.strip()
                    if name:
                        components.add(name.lower())
    return sorted(components)
