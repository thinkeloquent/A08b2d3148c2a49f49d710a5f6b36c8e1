"""Shared infrastructure defaults for rag_ui_component_ingest_config."""

from __future__ import annotations

from types import MappingProxyType
from typing import Any

# ---------------------------------------------------------------------------
# Infrastructure defaults — all values are immutable at module level.
# ---------------------------------------------------------------------------

DEFAULTS: MappingProxyType[str, Any] = MappingProxyType(
    {
        # Dataset / persistence paths
        "dataset_root": "dataset/repos",
        "persist_root": "data/chroma",
        # Embeddings
        "embeddings_model_name": "text-embedding-3-small",
        # Chunking
        "chunk_size": 1200,
        "chunk_overlap": 150,
        # Vector backend
        "vector_backend": "chroma",
        # Elasticsearch
        "elasticsearch_host": "localhost",
        "elasticsearch_port": 53300,
        "elasticsearch_scheme": "https",
        # Redis
        "redis_host": "localhost",
        "redis_port": 53200,
        # LLM
        "llm_provider": "openai",
        "openai_model": "gpt-4o",
        "anthropic_model": "claude-sonnet-4-5-20250514",
        "gemini_model": "gemini-2.0-flash",
        # Search / retrieval
        "hybrid_alpha": 0.5,
        "score_threshold": 0.0,
        "reranker_enabled": False,
        "reranker_model": "gemini-2.0-flash",
        "retrieve_n": 50,
        "top_k": 6,
        # Database
        "postgres_enabled": True,
    }
)

# ---------------------------------------------------------------------------
# Default library — Ant Design.
# ---------------------------------------------------------------------------

DEFAULT_LIBRARY: MappingProxyType[str, Any] = MappingProxyType(
    {
        "name": "Ant Design",
        "slug": "ant-design",
        "version": "5.x",
        "import_packages": ("antd", "@ant-design/icons", "@ant-design/pro-components"),
        "component_path_segment": "components",
        "file_extensions": (
            ".tsx",
            ".jsx",
            ".ts",
            ".js",
            ".md",
            ".mdx",
            ".css",
            ".less",
        ),
        "ignored_directories": (
            "node_modules",
            "__tests__",
            "demo",
            "locale",
            "style",
            "__snapshots__",
        ),
    }
)
