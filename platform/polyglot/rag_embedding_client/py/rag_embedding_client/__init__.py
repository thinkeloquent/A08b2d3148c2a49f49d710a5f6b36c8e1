"""RAG Embedding Client — OpenAI-compatible /v1/embeddings client."""

from .client import HttpxEmbeddingClient, get_embeddings
from .client_http_methods import HttpMethods
from .client_httpx import build_client_sync, build_client_async, post, apost
from .exceptions import EmbeddingBatchRejectedError, ForbiddenRejection
from rag_embedding_config import DEFAULT_EMBEDDINGS_BASE_URL, EMBEDDINGS_PATH, MAX_EMBEDDING_BATCH_SIZE
from rag_embedding_config import get_httpx_kwargs, get_embeddings_kwargs

__all__ = [
    "HttpxEmbeddingClient",
    "HttpMethods",
    "EmbeddingBatchRejectedError",
    "ForbiddenRejection",
    "get_embeddings",
    "build_client_sync",
    "build_client_async",
    "post",
    "apost",
    "DEFAULT_EMBEDDINGS_BASE_URL",
    "EMBEDDINGS_PATH",
    "MAX_EMBEDDING_BATCH_SIZE",
    "get_httpx_kwargs",
    "get_embeddings_kwargs",
]
