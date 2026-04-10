"""Type definitions for search results."""

from dataclasses import dataclass
from typing import Any


@dataclass
class SearchResult:
    """A single search result with content, metadata, and score."""
    content: str
    metadata: dict[str, Any]
    score: float


@dataclass
class FusedResult:
    """A result after RRF fusion with a fused score."""
    content_hash: str
    score: float
