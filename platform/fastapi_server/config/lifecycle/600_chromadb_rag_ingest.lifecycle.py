"""
ChromaDB RAG Ingest Lifecycle Hook for FastAPI

Initializes the RAG ingestion/query app and mounts its router under
/apps/chromadb_rag_ingest.

Loads ALL enabled frameworks from llm_rag.yml and builds per-framework
state bundles.  If no frameworks are enabled, mounts a minimal router
with empty bundles.

Loading Order: 600 (after core services and provider SDKs)

Environment Variables:
    CHROMADB_RAG_INGEST_ENABLED  - Enable/disable this app (default: true)
    RAG_VECTOR_BACKEND      - "chroma" or "elasticsearch" (default: chroma)
    RAG_PERSIST_DIRECTORY   - ChromaDB persist path (default: fastapi_apps/chromadb_rag_ingest/data/chroma)
    DATASET_ROOT            - Root path for source repos
    EMBEDDINGS_MODEL_NAME   - OpenAI model (default: text-embedding-3-small)
    LLM_PROVIDER            - openai | anthropic | gemini (default: openai)

Endpoints (prefix: /apps/chromadb_rag_ingest):
    GET    /frameworks       - List loaded frameworks
    GET    /                 - App info + config
    POST   /ingest           - Run ingestion pipeline
    POST   /search           - Hybrid search (no LLM)
    POST   /query            - Search + LLM answer
    POST   /llm              - Direct LLM with provided context
    POST   /component-registry/ingest     - Run component registry ELT
    GET    /component-registry/documents  - Get markdown docs
    GET    /component-registry/functions  - Get function metadata
    POST   /component-registry/functions/{file_id}/run/{fn_name} - Execute function
"""

import logging
import os
import sys
from pathlib import Path
from typing import Any

from fastapi import FastAPI

logger = logging.getLogger("lifecycle.chromadb_rag_ingest")

PREFIX = "/apps/chromadb_rag_ingest"


def _is_enabled() -> bool:
    return os.environ.get("CHROMADB_RAG_INGEST_ENABLED", "true").lower() in ("true", "1", "yes")


async def onStartup(app: FastAPI, config: dict[str, Any]) -> None:
    """Startup hook — initialize RAG services and mount router."""
    logger.info("Starting chromadb_rag_ingest lifecycle hook...")
    try:
        if not _is_enabled():
            logger.info("Disabled via CHROMADB_RAG_INGEST_ENABLED=false")
            return

        logger.info("Initializing...")

        # Add fastapi_apps/, packages_py/, and polyglot modules to sys.path
        _root = Path(__file__).parent.parent.parent.parent
        _fastapi_apps_path = _root / "fastapi_apps"
        _packages_py_path = _root / "packages_py"
        _polyglot_rag_config_path = _root / "polyglot" / "rag_ui_component_ingest_config" / "py"
        _polyglot_rag_embedding_config_path = _root / "polyglot" / "rag_embedding_config" / "py"
        _polyglot_rag_embedding_path = _root / "polyglot" / "rag_embedding_client" / "py"
        _polyglot_rag_search_path = _root / "polyglot" / "rag_search_algorithms" / "py"
        _polyglot_rag_llm_path = _root / "polyglot" / "rag_llm_synthesis" / "py"
        for p in [
            str(_fastapi_apps_path),
            str(_packages_py_path),
            str(_polyglot_rag_config_path),
            str(_polyglot_rag_embedding_config_path),
            str(_polyglot_rag_embedding_path),
            str(_polyglot_rag_search_path),
            str(_polyglot_rag_llm_path),
        ]:
            if p not in sys.path:
                sys.path.insert(0, p)

        # NLTK data lives in project-local ./data/nltk_data (used by unstructured)
        import nltk
        nltk.data.path.insert(0, str(_root / "data" / "nltk_data"))

        from rag_ui_component_ingest_config import RagUIComponentIngestConfig
        from chromadb_rag_ingest.config import RagIngestConfig
        from chromadb_rag_ingest.services.query import RagQueryEngine
        from chromadb_rag_ingest.services.cache import CacheService
        from chromadb_rag_ingest.router import create_router

        _yaml_path = str(_root / "common" / "config" / "llm_rag.yml")
        _project_root = str(_root)

        # 1. Load multi-config and discover enabled frameworks
        logger.debug("Loading RAG config from %s", _yaml_path)
        multi = RagUIComponentIngestConfig.from_yaml(
            _yaml_path, enabled_only=True, project_root=_project_root,
        )
        enabled_libs = multi.get_enabled_libraries()

        if not enabled_libs:
            logger.info("No framework to ingest")
            router = create_router(bundles={}, embeddings=None, pg_manager=None)
            app.include_router(router, prefix=PREFIX)
            app.state.chromadb_rag_ingest = {"bundles": {}, "embeddings": None, "pg_manager": None}
            logger.info("Ready (empty) — routes at %s/*", PREFIX)
            return

        slugs = [lib.slug for lib in enabled_libs]
        logger.info("Enabled frameworks: %s", ", ".join(slugs))

        # 2. Load embeddings model once (shared across all frameworks)
        # Use the first framework's config to get the model name
        first_cfg = RagIngestConfig(yaml_path=_yaml_path, library_slug=slugs[0], project_root=_project_root)
        logger.info("Loading embeddings model (%s)...", first_cfg.embeddings_model_name)
        from chromadb_rag_ingest.embedding_client import get_embeddings
        embeddings = await get_embeddings(first_cfg)

        # 3. PostgreSQL (shared across all frameworks)
        pg_manager = None
        pg_connected = False
        if first_cfg.postgres_enabled:
            try:
                from db_connection_postgres import PostgresConfig, DatabaseManager, Base
                from chromadb_rag_ingest.db_models import RagComponentDocument, RagComponentFunctionModule, RagChatSession

                pg_config = PostgresConfig()
                pg_manager = DatabaseManager(config=pg_config)

                if await pg_manager.test_connection():
                    pg_connected = True
                    logger.info("PostgreSQL: connected")

                    async with pg_manager.engine.begin() as conn:
                        await conn.run_sync(
                            Base.metadata.create_all,
                            tables=[
                                RagComponentDocument.__table__,
                                RagComponentFunctionModule.__table__,
                                RagChatSession.__table__,
                            ],
                        )
                else:
                    logger.warning("PostgreSQL: connection failed (registry disabled)")
            except Exception as e:
                logger.warning("PostgreSQL/registry unavailable: %s", e)
        else:
            logger.info("PostgreSQL: disabled via RAG_POSTGRES_ENABLED=false")

        # 4. Build per-framework bundles
        bundles: dict[str, dict] = {}

        for slug in slugs:
            slug_logger = logging.getLogger(f"lifecycle.chromadb_rag_ingest.{slug}")
            cfg = RagIngestConfig(yaml_path=_yaml_path, library_slug=slug, project_root=_project_root)
            slug_logger.info("Library: %s, backend: %s", cfg.library_name, cfg.vector_backend)

            # ChromaDB
            db_holder: dict[str, Any] = {"db": None}
            try:
                from langchain_chroma import Chroma
                if os.path.exists(cfg.persist_directory):
                    db = Chroma(persist_directory=cfg.persist_directory, embedding_function=embeddings, collection_name=cfg.collection_name)
                    count = db._collection.count()
                    db_holder["db"] = db
                    slug_logger.info("ChromaDB: %d chunks loaded from %s", count, cfg.persist_directory)
                else:
                    slug_logger.info("ChromaDB: no existing store at %s (run /ingest)", cfg.persist_directory)
            except Exception as e:
                slug_logger.warning("ChromaDB init warning: %s", e)

            # BM25 index
            engine = RagQueryEngine(cfg)
            if db_holder["db"] is not None:
                slug_logger.info("Building BM25 index...")
                bm25_count = engine.build_bm25_index(db_holder["db"])
                slug_logger.info("BM25 index: %d documents", bm25_count)

            # Elasticsearch (optional)
            es_holder: dict[str, Any] = {"client": None}
            if cfg.vector_backend == "elasticsearch":
                try:
                    from chromadb_rag_ingest.services.elasticsearch_store import (
                        get_elasticsearch_client, get_doc_count,
                    )
                    es_client = get_elasticsearch_client(cfg)
                    es_count = get_doc_count(es_client, cfg)
                    es_holder["client"] = es_client
                    slug_logger.info("Elasticsearch: %d chunks in index", es_count)
                except Exception as e:
                    slug_logger.warning("Elasticsearch unavailable: %s", e)

            # Redis cache (optional)
            cache = CacheService(cfg)
            if cache.available:
                slug_logger.info("Redis cache: connected")
            else:
                slug_logger.info("Redis cache: unavailable (caching disabled)")

            # Component Registry (optional, per-framework)
            registry_service = None
            if pg_connected and cfg.postgres_enabled:
                try:
                    from chromadb_rag_ingest.services.component_registry import ComponentRegistryService
                    registry_service = ComponentRegistryService(cfg, pg_manager)
                    ingest_result = await registry_service.run_ingest()
                    slug_logger.info(
                        "Component registry: %d docs, %d functions scanned",
                        ingest_result.get('docs', 0),
                        ingest_result.get('functions', 0),
                    )
                except Exception as e:
                    slug_logger.warning("Component registry unavailable: %s", e)
                    registry_service = None

            bundles[slug] = {
                "config": cfg,
                "engine": engine,
                "cache": cache,
                "db_holder": db_holder,
                "es_holder": es_holder,
                "registry_service": registry_service,
            }

        # 5. Create and mount router (server becomes available immediately)
        router = create_router(bundles, embeddings, pg_manager=pg_manager)
        app.include_router(router, prefix=PREFIX)

        # 6. Store state for shutdown
        app.state.chromadb_rag_ingest = {
            "bundles": bundles,
            "embeddings": embeddings,
            "pg_manager": pg_manager,
        }

        logger.info("Ready — %d framework(s) at %s/*", len(bundles), PREFIX)
        logger.info("chromadb_rag_ingest lifecycle hook completed successfully")
    except Exception as exc:
        logger.error("chromadb_rag_ingest lifecycle hook failed: %s", exc, exc_info=True)
        raise


async def onShutdown(app: FastAPI, config: dict[str, Any]) -> None:
    """Shutdown hook — close Elasticsearch clients and PostgreSQL pool."""
    logger.info("Starting chromadb_rag_ingest shutdown...")
    try:
        state = getattr(app.state, "chromadb_rag_ingest", None)
        if not state:
            logger.debug("No chromadb_rag_ingest state found, skipping shutdown")
            return

        # Close per-framework ES clients
        for slug, bundle in state.get("bundles", {}).items():
            es_holder = bundle.get("es_holder", {})
            es_client = es_holder.get("client")
            if es_client:
                logger.info("Closing Elasticsearch client for %s...", slug)
                try:
                    es_client.close()
                except Exception as e:
                    logger.warning("Error closing Elasticsearch client for %s: %s", slug, e)
                logger.info("Elasticsearch client closed for %s", slug)

        pg_manager = state.get("pg_manager")
        if pg_manager:
            logger.info("Closing PostgreSQL pool...")
            try:
                await pg_manager.dispose()
            except Exception as e:
                logger.warning("Error closing PostgreSQL pool: %s", e)
            logger.info("PostgreSQL pool closed")

        logger.info("chromadb_rag_ingest shutdown completed successfully")
    except Exception as exc:
        logger.error("chromadb_rag_ingest shutdown failed: %s", exc, exc_info=True)
        raise
