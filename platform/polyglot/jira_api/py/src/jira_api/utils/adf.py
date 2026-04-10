"""Atlassian Document Format (ADF) v1 builder utilities.

Converts plain text to ADF structure required by Jira Cloud REST API v3.
"""

from __future__ import annotations

from typing import Any


def text_to_adf(text: str) -> dict[str, Any] | None:
    """Convert plain text to an ADF v1 document."""
    if not text:
        return None
    return {
        "type": "doc",
        "version": 1,
        "content": [
            {
                "type": "paragraph",
                "content": [{"type": "text", "text": str(text)}],
            }
        ],
    }


def comment_to_adf(text: str) -> dict[str, Any] | None:
    """Wrap text in an ADF comment body."""
    doc = text_to_adf(text)
    if not doc:
        return None
    return {"body": doc}
