"""Tests for rag_embedding_config."""

import pytest
from rag_embedding_config.constants import (
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
        assert MAX_EMBEDDING_BATCH_SIZE == 500


class TestBarrelExports:
    def test_constants_from_barrel(self):
        from rag_embedding_config import (
            DEFAULT_EMBEDDINGS_BASE_URL,
            EMBEDDINGS_PATH,
            MAX_EMBEDDING_BATCH_SIZE,
        )
        assert DEFAULT_EMBEDDINGS_BASE_URL == "https://api.openai.com/v1"
        assert EMBEDDINGS_PATH == "/embeddings"
        assert MAX_EMBEDDING_BATCH_SIZE == 500

    def test_kwargs_from_barrel(self):
        from rag_embedding_config import (
            get_httpx_kwargs,
            get_langchain_kwargs,
            get_embeddings_kwargs,
        )
        assert callable(get_httpx_kwargs)
        assert callable(get_langchain_kwargs)
        assert callable(get_embeddings_kwargs)
        # get_embeddings_kwargs is an alias for get_langchain_kwargs
        assert get_embeddings_kwargs is get_langchain_kwargs

    def test_kwargs_openai_direct_imports(self):
        from rag_embedding_config.kwargs_openai import (
            get_httpx_kwargs,
            get_langchain_kwargs,
            get_embeddings_kwargs,
        )
        assert callable(get_httpx_kwargs)
        assert callable(get_langchain_kwargs)
        assert callable(get_embeddings_kwargs)
        assert get_embeddings_kwargs is get_langchain_kwargs
