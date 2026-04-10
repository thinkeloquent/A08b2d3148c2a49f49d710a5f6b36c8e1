"""Centralized configuration for ChromaDB RAG Ingest.

This module delegates to the polyglot ``rag_ui_component_ingest_config``
package and exposes a backward-compatible ``RagIngestConfig`` class that
all existing consumers can continue to use unchanged.

Resolution chain: YAML file (base) -> env vars (override) -> computed defaults.
"""

from __future__ import annotations

import logging
import os
from typing import Optional

from rag_ui_component_ingest_config import RagUIComponentIngestConfig

_DEFAULT_YAML_PATH = "common/config/llm_rag.yml"

logger = logging.getLogger("rag-ingest-config")


class RagIngestConfig:
    """Drop-in replacement wrapping the polyglot config module.

    Builds a ``SingleLibraryConfig`` from YAML + environment variables and
    exposes every field as an attribute — identical to the old flat dataclass.
    """

    def __init__(
        self,
        yaml_path: Optional[str] = None,
        library_slug: Optional[str] = None,
        project_root: Optional[str] = None,
    ) -> None:
        path = yaml_path or os.environ.get("RAG_CONFIG_YAML", _DEFAULT_YAML_PATH)
        logger.info("RagIngestConfig.__init__")
        logger.info("  yaml_path:     %s", path)
        logger.info("  library_slug:  %s", library_slug)
        logger.info("  project_root:  %s", project_root)

        self._project_root = project_root
        self._multi = RagUIComponentIngestConfig.from_yaml(
            path, project_root=project_root
        )

        n_libs = len(self._multi.libraries)
        logger.info("  loaded %d libraries from YAML", n_libs)

        self._single = self._multi.for_library(library_slug)
        logger.info("  resolved library: %s (%s)", self._single.name, self._single.slug)
        logger.info("  embeddings_model: %s", self._single.embeddings_model_name)
        logger.info("  vector_backend:   %s", self._single.vector_backend)
        logger.info("  source_dir:       %s", self._single.source_directory)
        logger.info("  persist_dir:      %s", self._single.persist_directory)

    def _resolve_path(self, p: str) -> str:
        """Resolve relative paths against project_root."""
        if self._project_root and not os.path.isabs(p):
            return os.path.join(self._project_root, p)
        return p

    # --- Library identity ---------------------------------------------------

    @property
    def library_name(self) -> str:
        return self._single.name

    @property
    def library_slug(self) -> str:
        return self._single.slug

    # --- Paths --------------------------------------------------------------

    @property
    def dataset_root(self) -> str:
        return self._resolve_path(self._single.dataset_root)

    @property
    def source_directory(self) -> str:
        return self._resolve_path(self._single.source_directory)

    @property
    def persist_directory(self) -> str:
        return self._resolve_path(self._single.persist_directory)

    @property
    def examples_directory(self) -> str:
        return self._resolve_path(self._single.examples_directory)

    # --- Embeddings ---------------------------------------------------------

    @property
    def embeddings_model_name(self) -> str:
        return self._single.embeddings_model_name

    # --- Chunking -----------------------------------------------------------

    @property
    def chunk_size(self) -> int:
        return self._single.chunk_size

    @property
    def chunk_overlap(self) -> int:
        return self._single.chunk_overlap

    # --- Vector backend -----------------------------------------------------

    @property
    def vector_backend(self) -> str:
        return self._single.vector_backend

    # --- Elasticsearch ------------------------------------------------------

    @property
    def elasticsearch_host(self) -> str:
        return self._single.elasticsearch_host

    @property
    def elasticsearch_port(self) -> int:
        return self._single.elasticsearch_port

    @property
    def elasticsearch_scheme(self) -> str:
        return self._single.elasticsearch_scheme

    @property
    def elasticsearch_index(self) -> str:
        return self._single.elasticsearch_index

    # --- Redis --------------------------------------------------------------

    @property
    def redis_host(self) -> str:
        return self._single.redis_host

    @property
    def redis_port(self) -> int:
        return self._single.redis_port

    # --- LLM ----------------------------------------------------------------

    @property
    def llm_provider(self) -> str:
        return self._single.llm_provider

    @property
    def openai_model(self) -> str:
        return self._single.openai_model

    @property
    def anthropic_model(self) -> str:
        return self._single.anthropic_model

    @property
    def gemini_model(self) -> str:
        return self._single.gemini_model

    # --- Search pipeline ----------------------------------------------------

    @property
    def hybrid_alpha(self) -> float:
        return self._single.hybrid_alpha

    @property
    def score_threshold(self) -> float:
        return self._single.score_threshold

    @property
    def reranker_enabled(self) -> bool:
        return self._single.reranker_enabled

    @property
    def reranker_model(self) -> str:
        return self._single.reranker_model

    @property
    def retrieve_n(self) -> int:
        return self._single.retrieve_n

    @property
    def top_k(self) -> int:
        return self._single.top_k

    # --- Database -----------------------------------------------------------

    @property
    def postgres_enabled(self) -> bool:
        return self._single.postgres_enabled

    # --- ChromaDB collection ------------------------------------------------

    COLLECTION_NAME = "chromadb-rag-ingest-manager"

    @property
    def collection_name(self) -> str:
        return self.COLLECTION_NAME

    # --- Library detail -----------------------------------------------------

    @property
    def import_packages(self) -> list[str]:
        return list(self._single.import_packages)
