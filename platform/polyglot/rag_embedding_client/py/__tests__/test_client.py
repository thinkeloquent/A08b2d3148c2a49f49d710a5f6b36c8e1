"""Tests for rag_embedding_client."""

import pytest
from rag_embedding_client.constants import (
    DEFAULT_EMBEDDINGS_BASE_URL,
    EMBEDDINGS_PATH,
    MAX_EMBEDDING_BATCH_SIZE,
)


class TestConstants:
    def test_default_base_url(self):
        assert DEFAULT_EMBEDDINGS_BASE_URL == "https://api.openai.com/v1"

    def test_embeddings_path(self):
        assert EMBEDDINGS_PATH == "/embeddings"

    def test_max_batch_size(self):
        assert MAX_EMBEDDING_BATCH_SIZE == 2048


class TestHttpxEmbeddingClient:
    def test_import(self):
        from rag_embedding_client import HttpxEmbeddingClient
        assert HttpxEmbeddingClient is not None

    def test_barrel_exports(self):
        from rag_embedding_client import (
            HttpxEmbeddingClient,
            get_embeddings,
            build_client_sync,
            build_client_async,
            post,
            apost,
            DEFAULT_EMBEDDINGS_BASE_URL,
            EMBEDDINGS_PATH,
            MAX_EMBEDDING_BATCH_SIZE,
            get_httpx_kwargs,
            get_embeddings_kwargs,
        )
        # All should be importable
        assert callable(HttpxEmbeddingClient)
        assert callable(get_embeddings)
        assert callable(build_client_sync)
        assert callable(build_client_async)
        assert callable(post)
        assert callable(apost)
        assert callable(get_httpx_kwargs)
        assert callable(get_embeddings_kwargs)

    def test_kwargs_openai_direct_imports(self):
        from rag_embedding_client.kwargs_openai import (
            get_httpx_kwargs,
            get_langchain_kwargs,
            get_embeddings_kwargs,
        )
        assert callable(get_httpx_kwargs)
        assert callable(get_langchain_kwargs)
        assert callable(get_embeddings_kwargs)
        # get_embeddings_kwargs is an alias for get_langchain_kwargs
        assert get_embeddings_kwargs is get_langchain_kwargs
