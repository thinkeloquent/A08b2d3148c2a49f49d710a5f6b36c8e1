"""BaseIngestConfig — shared infrastructure configuration resolved from env vars."""

from __future__ import annotations

import os
from dataclasses import dataclass, field

from env_resolver import resolve_anthropic_env
from .defaults import DEFAULTS
from .logger import create_logger
from .schema import BaseIngestConfigSchema

_log = create_logger("base_config")


def _env_str(name: str, default: str) -> str:
    return os.environ.get(name, default)


def _env_int(name: str, default: int) -> int:
    raw = os.environ.get(name)
    if raw is None:
        return default
    try:
        return int(raw)
    except ValueError:
        _log.warning("Invalid integer for %s=%r, using default %d", name, raw, default)
        return default


def _env_float(name: str, default: float) -> float:
    raw = os.environ.get(name)
    if raw is None:
        return default
    try:
        return float(raw)
    except ValueError:
        _log.warning("Invalid float for %s=%r, using default %f", name, raw, default)
        return default


def _env_bool(name: str, default: bool) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in ("1", "true", "yes", "on")


@dataclass(frozen=True)
class BaseIngestConfig:
    """Resolved shared infrastructure configuration.

    All fields are populated from environment variables with fallback to the
    values defined in ``defaults.DEFAULTS``. Validation is performed via
    ``BaseIngestConfigSchema`` in ``__post_init__``.
    """

    # Paths
    dataset_root: str = field(
        default_factory=lambda: _env_str("DATASET_ROOT", DEFAULTS["dataset_root"])
    )
    persist_root: str = field(
        default_factory=lambda: _env_str("RAG_PERSIST_ROOT", DEFAULTS["persist_root"])
    )

    # Embeddings
    embeddings_model_name: str = field(
        default_factory=lambda: _env_str(
            "EMBEDDINGS_MODEL_NAME", DEFAULTS["embeddings_model_name"]
        )
    )

    # Chunking
    chunk_size: int = field(
        default_factory=lambda: _env_int("CHUNK_SIZE", DEFAULTS["chunk_size"])
    )
    chunk_overlap: int = field(
        default_factory=lambda: _env_int("CHUNK_OVERLAP", DEFAULTS["chunk_overlap"])
    )

    # Vector backend
    vector_backend: str = field(
        default_factory=lambda: _env_str("RAG_VECTOR_BACKEND", DEFAULTS["vector_backend"])
    )

    # Elasticsearch
    elasticsearch_host: str = field(
        default_factory=lambda: _env_str("ELASTIC_DB_HOST", DEFAULTS["elasticsearch_host"])
    )
    elasticsearch_port: int = field(
        default_factory=lambda: _env_int("ELASTIC_DB_PORT", DEFAULTS["elasticsearch_port"])
    )
    elasticsearch_scheme: str = field(
        default_factory=lambda: _env_str("ELASTIC_DB_SCHEME", DEFAULTS["elasticsearch_scheme"])
    )

    # Redis
    redis_host: str = field(
        default_factory=lambda: _env_str("REDIS_HOST", DEFAULTS["redis_host"])
    )
    redis_port: int = field(
        default_factory=lambda: _env_int("REDIS_PORT", DEFAULTS["redis_port"])
    )

    # LLM
    llm_provider: str = field(
        default_factory=lambda: _env_str("LLM_PROVIDER", DEFAULTS["llm_provider"])
    )
    openai_model: str = field(
        default_factory=lambda: _env_str("OPENAI_MODEL", DEFAULTS["openai_model"])
    )
    anthropic_model: str = field(
        default_factory=lambda: resolve_anthropic_env().model
    )
    gemini_model: str = field(
        default_factory=lambda: _env_str("GEMINI_MODEL", DEFAULTS["gemini_model"])
    )

    # Search / retrieval
    hybrid_alpha: float = field(
        default_factory=lambda: _env_float("HYBRID_ALPHA", DEFAULTS["hybrid_alpha"])
    )
    score_threshold: float = field(
        default_factory=lambda: _env_float(
            "SCORE_THRESHOLD", DEFAULTS["score_threshold"]
        )
    )
    reranker_enabled: bool = field(
        default_factory=lambda: _env_bool(
            "RERANKER_ENABLED", DEFAULTS["reranker_enabled"]
        )
    )
    reranker_model: str = field(
        default_factory=lambda: _env_str("RERANKER_MODEL", DEFAULTS["reranker_model"])
    )
    retrieve_n: int = field(
        default_factory=lambda: _env_int("RETRIEVE_N", DEFAULTS["retrieve_n"])
    )
    top_k: int = field(
        default_factory=lambda: _env_int("TOP_K", DEFAULTS["top_k"])
    )

    # Database
    postgres_enabled: bool = field(
        default_factory=lambda: _env_bool(
            "RAG_POSTGRES_ENABLED", DEFAULTS["postgres_enabled"]
        )
    )

    # ------------------------------------------------------------------
    # Post-init validation
    # ------------------------------------------------------------------

    def __post_init__(self) -> None:
        schema = BaseIngestConfigSchema(
            dataset_root=self.dataset_root,
            persist_root=self.persist_root,
            embeddings_model_name=self.embeddings_model_name,
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            vector_backend=self.vector_backend,  # type: ignore[arg-type]
            elasticsearch_host=self.elasticsearch_host,
            elasticsearch_port=self.elasticsearch_port,
            elasticsearch_scheme=self.elasticsearch_scheme,
            redis_host=self.redis_host,
            redis_port=self.redis_port,
            llm_provider=self.llm_provider,
            openai_model=self.openai_model,
            anthropic_model=self.anthropic_model,
            gemini_model=self.gemini_model,
            hybrid_alpha=self.hybrid_alpha,
            score_threshold=self.score_threshold,
            reranker_enabled=self.reranker_enabled,
            reranker_model=self.reranker_model,
            retrieve_n=self.retrieve_n,
            top_k=self.top_k,
            postgres_enabled=self.postgres_enabled,
        )
        _log.debug(
            "BaseIngestConfig validated: %s",
            schema.model_dump(),
        )

    # ------------------------------------------------------------------
    # Serialisation
    # ------------------------------------------------------------------

    def to_dict(self) -> dict[str, object]:
        """Return a snake_case dictionary of all resolved values."""
        return {
            "dataset_root": self.dataset_root,
            "persist_root": self.persist_root,
            "embeddings_model_name": self.embeddings_model_name,
            "chunk_size": self.chunk_size,
            "chunk_overlap": self.chunk_overlap,
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
