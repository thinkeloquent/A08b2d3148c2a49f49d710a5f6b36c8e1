"""
JSX Usage Extractor

Dual-state regex extraction for React component usage patterns:
  1. Self-closing: <Component prop="val" />
  2. Paired tags:  <Component prop="val">...children...</Component>

Max snippet length is capped at 500 characters.
"""

from __future__ import annotations

import re

__all__ = ["extract_jsx_usages"]

MAX_SNIPPET_LENGTH = 500


def extract_jsx_usages(source: str, component_name: str) -> list[str]:
    """Extract all JSX usages of a named component from source text.

    Args:
        source: File contents (JSX/TSX).
        component_name: Component name to search for (e.g. "Accordion").

    Returns:
        List of matched JSX snippets (trimmed, max 500 chars each).
    """
    escaped = re.escape(component_name)

    # Self-closing: <Component ... />
    self_closing_re = re.compile(
        rf"<{escaped}(\s[^>]*)?\s*/>",
        re.DOTALL,
    )

    # Paired: <Component ...>...</Component>
    paired_re = re.compile(
        rf"<{escaped}(\s[^>]*)?>[\s\S]*?</{escaped}>",
        re.DOTALL,
    )

    matches: set[str] = set()

    for m in self_closing_re.finditer(source):
        matches.add(_truncate(m.group(0).strip()))

    for m in paired_re.finditer(source):
        matches.add(_truncate(m.group(0).strip()))

    return list(matches)


def _truncate(snippet: str) -> str:
    """Truncate a snippet to MAX_SNIPPET_LENGTH characters."""
    if len(snippet) <= MAX_SNIPPET_LENGTH:
        return snippet
    return snippet[:MAX_SNIPPET_LENGTH] + "..."
