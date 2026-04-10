"""Custom exceptions for the RAG embedding client.

``EmbeddingBatchRejectedError`` is raised when one or more sub-batches are
rejected with HTTP 403 Forbidden during ``embed_documents()``.  It carries
any partial embeddings that succeeded and a list of
``ForbiddenRejection`` records describing the rejected sub-batches.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class ForbiddenRejection:
    """Details about a single sub-batch rejected with HTTP 403."""

    batch_index: int
    """0-based index of the sub-batch within the overall embed_documents() call."""

    text_count: int
    """Number of texts in the rejected sub-batch."""

    content_preview: str
    """First 200 characters of the first text in the sub-batch."""

    status_code: int = 403
    """HTTP status code returned by the upstream server."""

    error_body: str = ""
    """Raw response body (truncated to 1000 chars)."""


@dataclass
class EmbeddingBatchRejectedError(Exception):
    """Raised when sub-batches are rejected with HTTP 403 Forbidden.

    Callers can inspect ``partial_embeddings`` for the results that
    succeeded and ``rejections`` for details about the rejected
    sub-batches.
    """

    message: str
    partial_embeddings: list[list[float]] = field(default_factory=list)
    rejections: list[ForbiddenRejection] = field(default_factory=list)

    def __str__(self) -> str:
        n_ok = len(self.partial_embeddings)
        n_rejected = len(self.rejections)
        return f"{self.message} (partial={n_ok}, rejected={n_rejected})"
