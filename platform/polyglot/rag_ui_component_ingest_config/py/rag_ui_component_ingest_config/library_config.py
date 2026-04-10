"""LibraryConfig and ResolvedLibraryConfig for rag_ui_component_ingest_config."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Optional

from .base_config import BaseIngestConfig
from .defaults import DEFAULT_LIBRARY
from .logger import create_logger
from .schema import LibraryConfigSchema

_log = create_logger("library_config")


@dataclass
class LibraryConfig:
    """Per-library configuration with optional overrides.

    Unset optional fields are resolved against base infrastructure values
    when ``resolve()`` is called.
    """

    # Required identity fields
    name: str
    slug: str

    # Optional library-level overrides
    version: Optional[str] = None
    source_directory: Optional[str] = None
    persist_directory: Optional[str] = None
    examples_directory: Optional[str] = None
    elasticsearch_index: Optional[str] = None
    component_path_segment: str = "components"

    import_packages: list[str] = field(default_factory=list)
    chunk_size: Optional[int] = None
    chunk_overlap: Optional[int] = None

    file_extensions: Optional[list[str]] = None
    ignored_directories: Optional[list[str]] = None

    enabled: bool = True

    def __post_init__(self) -> None:
        # Validate via Pydantic schema — raises ValidationError on bad data.
        LibraryConfigSchema(
            name=self.name,
            slug=self.slug,
            version=self.version,
            source_directory=self.source_directory,
            persist_directory=self.persist_directory,
            examples_directory=self.examples_directory,
            elasticsearch_index=self.elasticsearch_index,
            component_path_segment=self.component_path_segment,
            import_packages=self.import_packages,
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            file_extensions=self.file_extensions,
            ignored_directories=self.ignored_directories,
            enabled=self.enabled,
        )

    def resolve(self, base: BaseIngestConfig) -> ResolvedLibraryConfig:
        """Produce a fully resolved, frozen config by merging with *base*.

        Computed defaults:
        - source_directory  → ``{base.dataset_root}/{slug}/components``
        - persist_directory → ``{base.persist_root}/{slug}``
        - examples_directory→ ``{base.dataset_root}/{slug}/components-examples``
        - elasticsearch_index → ``"rag-{slug}"``
        - chunk_size / chunk_overlap fall back to base values
        - file_extensions / ignored_directories fall back to DEFAULT_LIBRARY
        """
        # Check env var overrides for path fields (matching old RagIngestConfig behavior)
        env_source_dir = os.environ.get("RAG_SOURCE_DIRECTORY")
        env_persist_dir = os.environ.get("RAG_PERSIST_DIRECTORY")
        env_es_index = os.environ.get("RAG_ES_INDEX")
        env_examples_dir = os.environ.get("RAG_EXAMPLES_DIRECTORY")

        resolved_source = (
            self.source_directory
            or env_source_dir
            or f"{base.dataset_root}/{self.slug}/{self.component_path_segment}"
        )
        resolved_persist = (
            self.persist_directory
            or env_persist_dir
            or f"{base.persist_root}/{self.slug}"
        )
        resolved_examples = (
            self.examples_directory
            or env_examples_dir
            or f"{base.dataset_root}/{self.slug}/components-examples"
        )
        resolved_es_index = self.elasticsearch_index or env_es_index or f"rag-{self.slug}"

        resolved_chunk_size = self.chunk_size if self.chunk_size is not None else base.chunk_size
        resolved_chunk_overlap = (
            self.chunk_overlap if self.chunk_overlap is not None else base.chunk_overlap
        )

        resolved_file_extensions = (
            list(self.file_extensions)
            if self.file_extensions is not None
            else list(DEFAULT_LIBRARY["file_extensions"])
        )
        resolved_ignored_directories = (
            list(self.ignored_directories)
            if self.ignored_directories is not None
            else list(DEFAULT_LIBRARY["ignored_directories"])
        )

        _log.debug(
            "Resolved library '%s': source=%s persist=%s",
            self.slug,
            resolved_source,
            resolved_persist,
        )

        return ResolvedLibraryConfig(
            # Library identity
            name=self.name,
            slug=self.slug,
            version=self.version,
            component_path_segment=self.component_path_segment,
            import_packages=list(self.import_packages),
            # Resolved paths
            source_directory=resolved_source,
            persist_directory=resolved_persist,
            examples_directory=resolved_examples,
            elasticsearch_index=resolved_es_index,
            # Resolved chunking
            chunk_size=resolved_chunk_size,
            chunk_overlap=resolved_chunk_overlap,
            # Resolved file filtering
            file_extensions=resolved_file_extensions,
            ignored_directories=resolved_ignored_directories,
            # Enabled flag
            enabled=self.enabled,
            # Base infrastructure — all fields forwarded
            dataset_root=base.dataset_root,
            persist_root=base.persist_root,
            embeddings_model_name=base.embeddings_model_name,
            vector_backend=base.vector_backend,
            elasticsearch_host=base.elasticsearch_host,
            elasticsearch_port=base.elasticsearch_port,
            elasticsearch_scheme=base.elasticsearch_scheme,
            redis_host=base.redis_host,
            redis_port=base.redis_port,
            llm_provider=base.llm_provider,
            openai_model=base.openai_model,
            anthropic_model=base.anthropic_model,
            gemini_model=base.gemini_model,
            hybrid_alpha=base.hybrid_alpha,
            score_threshold=base.score_threshold,
            reranker_enabled=base.reranker_enabled,
            reranker_model=base.reranker_model,
            retrieve_n=base.retrieve_n,
            top_k=base.top_k,
            postgres_enabled=base.postgres_enabled,
        )


@dataclass(frozen=True)
class ResolvedLibraryConfig:
    """Fully resolved, immutable library configuration.

    All optional fields have been filled in; all base infrastructure fields
    are present.  Produced exclusively by ``LibraryConfig.resolve()``.
    """

    # ---- Library identity ------------------------------------------------
    name: str
    slug: str
    version: Optional[str]
    component_path_segment: str
    import_packages: list[str]

    # ---- Resolved paths --------------------------------------------------
    source_directory: str
    persist_directory: str
    examples_directory: str
    elasticsearch_index: str

    # ---- Resolved chunking -----------------------------------------------
    chunk_size: int
    chunk_overlap: int

    # ---- Resolved file filtering -----------------------------------------
    file_extensions: list[str]
    ignored_directories: list[str]

    # ---- Enabled flag ----------------------------------------------------
    enabled: bool

    # ---- Base infrastructure (forwarded from BaseIngestConfig) -----------
    dataset_root: str
    persist_root: str
    embeddings_model_name: str
    vector_backend: str
    elasticsearch_host: str
    elasticsearch_port: int
    elasticsearch_scheme: str
    redis_host: str
    redis_port: int
    llm_provider: str
    openai_model: str
    anthropic_model: str
    gemini_model: str
    hybrid_alpha: float
    score_threshold: float
    reranker_enabled: bool
    reranker_model: str
    retrieve_n: int
    top_k: int
    postgres_enabled: bool

    def to_dict(self) -> dict[str, object]:
        """Return a plain dict representation of all resolved fields."""
        return {
            # Library identity
            "name": self.name,
            "slug": self.slug,
            "version": self.version,
            "component_path_segment": self.component_path_segment,
            "import_packages": list(self.import_packages),
            # Paths
            "source_directory": self.source_directory,
            "persist_directory": self.persist_directory,
            "examples_directory": self.examples_directory,
            "elasticsearch_index": self.elasticsearch_index,
            # Chunking
            "chunk_size": self.chunk_size,
            "chunk_overlap": self.chunk_overlap,
            # File filtering
            "file_extensions": list(self.file_extensions),
            "ignored_directories": list(self.ignored_directories),
            # Enabled
            "enabled": self.enabled,
            # Base infrastructure
            "dataset_root": self.dataset_root,
            "persist_root": self.persist_root,
            "embeddings_model_name": self.embeddings_model_name,
            "vector_backend": self.vector_backend,
            "elasticsearch_host": self.elasticsearch_host,
            "elasticsearch_port": self.elasticsearch_port,
            "elasticsearch_scheme": self.elasticsearch_scheme,
            "redis_host": self.redis_host,
            "redis_port": self.redis_port,
            "llm_provider": self.llm_provider,
            "openai_model": self.openai_model,
            "anthropic_model": self.anthropic_model,
            "gemini_model": self.gemini_model,
            "hybrid_alpha": self.hybrid_alpha,
            "score_threshold": self.score_threshold,
            "reranker_enabled": self.reranker_enabled,
            "reranker_model": self.reranker_model,
            "retrieve_n": self.retrieve_n,
            "top_k": self.top_k,
            "postgres_enabled": self.postgres_enabled,
        }
