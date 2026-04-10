"""Direct httpx embedding client and central routing for embedding backends.

Re-exports from rag_embedding_client for backward compatibility.
"""

from rag_embedding_client.client import (  # noqa: F401
    HttpxEmbeddingClient,
    get_embeddings,
)
