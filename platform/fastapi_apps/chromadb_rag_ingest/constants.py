"""Shared constants for the chromadb_rag_ingest embedding subsystem.

Re-exports from rag_embedding_client for backward compatibility.
"""

from rag_embedding_client.constants import (  # noqa: F401
    DEFAULT_EMBEDDINGS_BASE_URL,
    EMBEDDINGS_PATH,
    MAX_EMBEDDING_BATCH_SIZE,
)
