"""Thin httpx transport factory for OpenAI-compatible API calls.

Re-exports from rag_embedding_client for backward compatibility.
"""

from rag_embedding_client.client_httpx import (  # noqa: F401
    build_client_sync,
    build_client_async,
    post,
    apost,
)
