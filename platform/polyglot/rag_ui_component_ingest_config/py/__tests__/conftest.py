"""Shared fixtures for rag_ui_component_ingest_config test suite."""

from __future__ import annotations

import pytest

from rag_ui_component_ingest_config import (
    BaseIngestConfig,
    LibraryConfig,
    RagUIComponentIngestConfig,
)
from rag_ui_component_ingest_config.defaults import DEFAULTS, DEFAULT_LIBRARY


@pytest.fixture(autouse=True)
def _clean_env(monkeypatch):
    """Remove env vars that would interfere with default-value tests."""
    env_vars = [
        "DATASET_ROOT", "RAG_PERSIST_ROOT", "EMBEDDINGS_MODEL_NAME",
        "CHUNK_SIZE", "CHUNK_OVERLAP", "RAG_VECTOR_BACKEND",
        "ELASTIC_DB_HOST", "ELASTIC_DB_PORT", "ELASTIC_DB_SCHEME",
        "REDIS_HOST", "REDIS_PORT", "LLM_PROVIDER",
        "OPENAI_MODEL", "ANTHROPIC_MODEL", "GEMINI_MODEL",
        "HYBRID_ALPHA", "SCORE_THRESHOLD", "RERANKER_ENABLED",
        "RERANKER_MODEL", "RETRIEVE_N", "TOP_K",
        "RAG_POSTGRES_ENABLED",
        "RAG_SOURCE_DIRECTORY", "RAG_PERSIST_DIRECTORY",
        "RAG_ES_INDEX", "RAG_EXAMPLES_DIRECTORY",
    ]
    for var in env_vars:
        monkeypatch.delenv(var, raising=False)


@pytest.fixture()
def base_config() -> BaseIngestConfig:
    """A BaseIngestConfig constructed with all hard-coded defaults (no env overrides)."""
    return BaseIngestConfig()


@pytest.fixture()
def ant_design_library() -> LibraryConfig:
    """A LibraryConfig for Ant Design using the canonical DEFAULT_LIBRARY values."""
    return LibraryConfig(
        name=DEFAULT_LIBRARY["name"],
        slug=DEFAULT_LIBRARY["slug"],
        version=DEFAULT_LIBRARY["version"],
        import_packages=list(DEFAULT_LIBRARY["import_packages"]),
        component_path_segment=DEFAULT_LIBRARY["component_path_segment"],
        file_extensions=list(DEFAULT_LIBRARY["file_extensions"]),
        ignored_directories=list(DEFAULT_LIBRARY["ignored_directories"]),
    )


@pytest.fixture()
def single_library_config(ant_design_library, base_config):
    """A RagUIComponentIngestConfig pre-loaded with the default Ant Design library."""
    return RagUIComponentIngestConfig(base=base_config, libraries=[ant_design_library])


@pytest.fixture()
def multi_library_config(base_config) -> RagUIComponentIngestConfig:
    """A RagUIComponentIngestConfig with two libraries: ant-design (enabled) and mui (disabled)."""
    ant = LibraryConfig(
        name="Ant Design",
        slug="ant-design",
        version="5.x",
        import_packages=["antd"],
        enabled=True,
    )
    mui = LibraryConfig(
        name="MUI",
        slug="mui",
        version="6.x",
        import_packages=["@mui/material"],
        enabled=False,
    )
    return RagUIComponentIngestConfig(base=base_config, libraries=[ant, mui])
