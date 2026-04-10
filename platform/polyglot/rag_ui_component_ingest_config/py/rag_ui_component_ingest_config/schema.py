"""Pydantic v2 validation schemas for rag_ui_component_ingest_config."""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator, model_validator


class BaseIngestConfigSchema(BaseModel):
    """Validated view of all shared infrastructure configuration fields."""

    # Paths
    dataset_root: str = Field(..., min_length=1)
    persist_root: str = Field(..., min_length=1)

    # Embeddings
    embeddings_model_name: str = Field(..., min_length=1)

    # Chunking
    chunk_size: int = Field(..., gt=0)
    chunk_overlap: int = Field(..., ge=0)

    # Vector backend
    vector_backend: Literal["chroma", "elasticsearch"]

    # Elasticsearch
    elasticsearch_host: str = Field(..., min_length=1)
    elasticsearch_port: int = Field(..., gt=0)
    elasticsearch_scheme: str = Field(..., min_length=1)

    # Redis
    redis_host: str = Field(..., min_length=1)
    redis_port: int = Field(..., gt=0)

    # LLM
    llm_provider: str = Field(..., min_length=1)
    openai_model: str = Field(..., min_length=1)
    anthropic_model: str = Field(..., min_length=1)
    gemini_model: str = Field(..., min_length=1)

    # Search / retrieval
    hybrid_alpha: float = Field(..., ge=0.0, le=1.0)
    score_threshold: float = Field(..., ge=0.0)
    reranker_enabled: bool
    reranker_model: str = Field(..., min_length=1)
    retrieve_n: int = Field(..., gt=0)
    top_k: int = Field(..., gt=0)

    # Database
    postgres_enabled: bool

    @model_validator(mode="after")
    def chunk_overlap_less_than_chunk_size(self) -> "BaseIngestConfigSchema":
        if self.chunk_overlap >= self.chunk_size:
            raise ValueError(
                f"chunk_overlap ({self.chunk_overlap}) must be less than "
                f"chunk_size ({self.chunk_size})"
            )
        return self

    model_config = {"extra": "forbid"}


class LibraryConfigSchema(BaseModel):
    """Validated view of a single library configuration entry."""

    # Identity — required
    name: str = Field(..., min_length=1)
    slug: str = Field(
        ...,
        pattern=r"^[a-z0-9][a-z0-9-]*[a-z0-9]$",
        description="URL-safe lowercase identifier",
    )

    # Optional overrides
    version: Optional[str] = None
    source_directory: Optional[str] = None
    persist_directory: Optional[str] = None
    examples_directory: Optional[str] = None
    elasticsearch_index: Optional[str] = None
    component_path_segment: str = "components"

    import_packages: list[str] = Field(default_factory=list)
    chunk_size: Optional[int] = Field(default=None, gt=0)
    chunk_overlap: Optional[int] = Field(default=None, ge=0)

    file_extensions: Optional[list[str]] = None
    ignored_directories: Optional[list[str]] = None

    enabled: bool = True

    @field_validator("slug")
    @classmethod
    def slug_min_two_chars(cls, v: str) -> str:
        # The regex requires at least two characters (start + end char class).
        # Single-char slugs like "a" do not satisfy `^[a-z0-9][a-z0-9-]*[a-z0-9]$`
        # because the `*` between the two anchored char classes needs 0+ middle
        # chars — that means the slug must be at least 2 chars.
        return v

    model_config = {"extra": "forbid"}


class DocumentMetadataSchema(BaseModel):
    """Validated view of a single document chunk's metadata."""

    # Identity
    library: str = Field(..., min_length=1)
    library_version: Optional[str] = None
    component: Optional[str] = None

    # Source
    file_name: str = Field(..., min_length=1)
    file_path: str = Field(..., min_length=1)
    source_type: Literal["component", "story", "doc", "style", "type", "test", "config"]
    language: str

    # Lineage
    content_hash: str
    chunk_index: int = Field(..., ge=0)
    total_chunks: int = Field(..., ge=1)
    ingested_at: str

    # Navigation
    heading: Optional[str] = None
    export_name: Optional[str] = None

    model_config = {"extra": "allow"}
