"""ChromaDB RAG Ingest — document ingestion and hybrid search app."""

__all__ = ["RagIngestConfig", "create_router"]


def __getattr__(name):
    if name == "RagIngestConfig":
        from .config import RagIngestConfig
        return RagIngestConfig
    if name == "create_router":
        from .router import create_router
        return create_router
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
