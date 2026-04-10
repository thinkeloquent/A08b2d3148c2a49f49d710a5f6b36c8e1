"""Centralized kwargs builders for OpenAI-compatible embedding providers.

Re-exports from rag_embedding_config for backward compatibility.
"""

from rag_embedding_config.kwargs_openai import get_httpx_kwargs  # noqa: F401
from rag_embedding_config.kwargs_openai import get_langchain_kwargs  # noqa: F401
from rag_embedding_config.kwargs_openai import get_embeddings_kwargs  # noqa: F401
