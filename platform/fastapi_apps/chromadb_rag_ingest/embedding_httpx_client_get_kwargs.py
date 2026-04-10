"""Centralized kwargs builder for HttpxEmbeddingClient.

Re-exports from rag_embedding_config for backward compatibility.
"""

from rag_embedding_config.kwargs_openai import get_httpx_kwargs  # noqa: F401
