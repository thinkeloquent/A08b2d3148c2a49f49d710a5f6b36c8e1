"""APIRouter factory for ChromaDB RAG Ingest.

Dependencies are injected via closure — no module-level globals.
"""

import threading
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query

from .models import (
    SearchRequest, QueryRequest, LLMRequest, IngestRequest, RunFunctionRequest,
    CreateSessionRequest, UpdateSessionRequest, AppendLlmResponseRequest, SessionResponse,
    PromptTemplateRef,
)
from .services.query import build_context, post_process_results
from .structured_templates import TEMPLATES, TEMPLATES_BY_ID


def create_router(bundles, embeddings, pg_manager=None):
    """Build and return an APIRouter with all RAG endpoints.

    Args:
        bundles:     dict[str, dict] keyed by framework slug, each containing:
                       config, engine, cache, db_holder, es_holder, registry_service
        embeddings:  OpenAIEmbeddings instance (shared)
        pg_manager:  DatabaseManager instance (or None)
    """
    router = APIRouter()

    # -- helpers --

    def _get_bundle(slug: str | None):
        if not bundles:
            raise HTTPException(status_code=503, detail="No frameworks available")
        if slug and slug in bundles:
            return bundles[slug]
        if not slug:
            return next(iter(bundles.values()))
        raise HTTPException(status_code=404, detail=f"Framework '{slug}' not found")

    def _get_db(bundle):
        db = bundle["db_holder"].get("db")
        if db is None and bundle["es_holder"].get("client") is None:
            raise HTTPException(status_code=503, detail="Vector store not loaded yet")
        return db

    def _safe_count(db) -> int:
        """Get collection doc count without crashing on internal API changes."""
        if db is None:
            return 0
        try:
            return db._collection.count()
        except Exception:
            return 0

    def _reload_db(bundle):
        from langchain_chroma import Chroma
        bundle["db_holder"]["db"] = Chroma(
            persist_directory=bundle["config"].persist_directory,
            embedding_function=embeddings,
            collection_name=bundle["config"].collection_name,
        )

    # -- endpoints --

    @router.get("/frameworks")
    def list_frameworks():
        """Return all enabled frameworks with ingestion status."""
        result = []
        for slug, b in bundles.items():
            db = b["db_holder"].get("db")
            chunk_count = _safe_count(db)
            has_es = b["es_holder"].get("client") is not None
            result.append({
                "slug": slug,
                "name": b["config"].library_name,
                "ingested": chunk_count > 0 or has_es,
                "chunk_count": chunk_count,
            })
        return result

    @router.get("/")
    def info(framework: str | None = Query(default=None)):
        b = _get_bundle(framework)
        config = b["config"]
        db = b["db_holder"].get("db")
        es_holder = b["es_holder"]
        cache = b["cache"]
        chunk_count = _safe_count(db)
        return {
            "app": "chromadb_rag_ingest",
            "library": config.library_name,
            "slug": config.library_slug,
            "persist_directory": config.persist_directory,
            "embeddings_model": config.embeddings_model_name,
            "vector_backend": config.vector_backend,
            "elasticsearch_available": es_holder.get("client") is not None,
            "redis_available": cache.available if cache else False,
            "chunk_count": chunk_count,
            "pipeline": {
                "alpha": config.hybrid_alpha,
                "threshold": config.score_threshold,
                "reranker_enabled": config.reranker_enabled,
                "reranker_model": config.reranker_model,
                "retrieve_n": config.retrieve_n,
            },
        }

    # Track per-framework ingest status
    _ingest_status: dict[str, dict] = {}

    @router.post("/ingest")
    def ingest(req: IngestRequest = None):
        """Run the ingestion pipeline in a background thread."""
        fw = req.framework if req else None
        b = _get_bundle(fw)
        slug = b["config"].library_slug

        # Check if already running
        status = _ingest_status.get(slug)
        if status and status["running"]:
            return {"status": "already_running", "slug": slug}

        _ingest_status[slug] = {"running": True, "error": None}

        def _run():
            try:
                from .services.ingest import run_ingest_sync
                run_ingest_sync(b["config"], embeddings)

                # Reload ChromaDB and rebuild BM25
                _reload_db(b)
                db = b["db_holder"].get("db")
                if db:
                    b["engine"].build_bm25_index(db)

                # Invalidate search cache
                if b["cache"]:
                    try:
                        b["cache"].invalidate_search_cache()
                    except Exception:
                        pass

                _ingest_status[slug] = {"running": False, "error": None}
            except Exception as e:
                _ingest_status[slug] = {"running": False, "error": str(e)}

        thread = threading.Thread(target=_run, daemon=True)
        thread.start()
        return {"status": "started", "slug": slug}

    @router.get("/ingest/status")
    def ingest_status(framework: str | None = Query(default=None)):
        """Check ingestion status for a framework."""
        b = _get_bundle(framework)
        slug = b["config"].library_slug
        status = _ingest_status.get(slug, {"running": False, "error": None})
        db = b["db_holder"].get("db")
        chunk_count = _safe_count(db)
        return {"slug": slug, "chunk_count": chunk_count, **status}

    @router.post("/search")
    def search(req: SearchRequest):
        """Hybrid search (no LLM call)."""
        b = _get_bundle(req.framework)
        config = b["config"]
        engine = b["engine"]
        cache = b["cache"]
        db_holder = b["db_holder"]
        es_holder = b["es_holder"]

        _backend = req.backend or config.vector_backend

        # Check cache
        if cache:
            try:
                cached = cache.get_cached_search(
                    req.query, req.top_k, alpha=req.alpha,
                    threshold=req.threshold, reranker=req.reranker, backend=_backend,
                )
                if cached:
                    return {**cached, "_cached": True}
            except Exception:
                pass

        _get_db(b)
        results = engine.hybrid_search(
            db_holder.get("db"), req.query, req.top_k,
            alpha=req.alpha,
            threshold=req.threshold,
            use_reranker=req.reranker,
            backend=_backend,
            es_client=es_holder.get("client"),
            embeddings_model=embeddings,
        )
        processed = post_process_results(
            results,
            code_mode=req.code_mode or "regex",
            component_mode=req.component_mode or "metadata",
            import_packages=config.import_packages,
        )
        response = {"query": req.query, **processed}

        # Store in cache
        if cache:
            try:
                cache.set_cached_search(
                    req.query, response, req.top_k, alpha=req.alpha,
                    threshold=req.threshold, reranker=req.reranker, backend=_backend,
                )
            except Exception:
                pass

        return response

    @router.post("/query")
    def query(req: QueryRequest):
        """Search + LLM: retrieve relevant chunks then ask the LLM."""
        b = _get_bundle(req.framework)
        config = b["config"]
        engine = b["engine"]
        cache = b["cache"]
        db_holder = b["db_holder"]
        es_holder = b["es_holder"]

        _backend = req.backend or config.vector_backend

        # Check caches
        cached_answer = None
        if cache:
            try:
                cached_answer = cache.get_cached_llm(req.query, provider=req.provider)
            except Exception:
                pass

        cached_search = None
        if cache:
            try:
                cached_search = cache.get_cached_search(
                    req.query, req.top_k, alpha=req.alpha,
                    threshold=req.threshold, reranker=req.reranker, backend=_backend,
                )
            except Exception:
                pass

        if cached_search and cached_answer:
            return {**cached_search, "answer": cached_answer, "_cached": True}

        _get_db(b)
        results = engine.hybrid_search(
            db_holder.get("db"), req.query, req.top_k,
            alpha=req.alpha,
            threshold=req.threshold,
            use_reranker=req.reranker,
            backend=_backend,
            es_client=es_holder.get("client"),
            embeddings_model=embeddings,
        )
        docs = [doc for doc, _score in results]
        if not docs:
            return {"query": req.query, "components": [], "results": [], "answer": None}

        context = build_context(docs)

        # LLM answer
        if cached_answer:
            answer = cached_answer
        else:
            answer = engine.ask_llm(req.query, context, provider=req.provider)

        processed = post_process_results(
            results,
            code_mode=req.code_mode or "regex",
            component_mode=req.component_mode or "metadata",
            import_packages=config.import_packages,
        )
        response = {"query": req.query, **processed, "answer": answer}

        # Cache results
        if cache:
            try:
                search_only = {"query": req.query, **processed}
                cache.set_cached_search(
                    req.query, search_only, req.top_k, alpha=req.alpha,
                    threshold=req.threshold, reranker=req.reranker, backend=_backend,
                )
            except Exception:
                pass
            if not cached_answer:
                try:
                    cache.set_cached_llm(req.query, answer, provider=req.provider)
                except Exception:
                    pass

        return response

    @router.get("/structured-templates")
    def list_structured_templates():
        """Return available structured output templates."""
        return [
            {
                "id": t.id,
                "name": t.name,
                "description": t.description,
                "schema": t.schema,
            }
            for t in TEMPLATES
        ]

    @router.post("/llm")
    def llm(req: LLMRequest, framework: str | None = Query(default=None)):
        """Direct LLM call with user-provided context."""
        b = _get_bundle(framework)
        engine = b["engine"]

        import json as _json
        sp = req.system_prompt if req.system_prompt and req.system_prompt.strip() else None

        # Resolve schema_config
        schema_language = None
        schema_text = None
        schema_name = None
        if req.schema_config:
            schema_language = req.schema_config.language
            schema_text = req.schema_config.text
            # If a preset template_id is set, resolve canonical schema text
            if req.schema_config.template_id:
                tmpl = TEMPLATES_BY_ID.get(req.schema_config.template_id)
                if tmpl:
                    schema_text = _json.dumps(tmpl.schema)
                    schema_name = tmpl.id

        try:
            answer = engine.ask_llm(
                req.question,
                req.context,
                system_prompt=sp,
                provider=req.provider,
                output_format=req.output_format,
                schema_language=schema_language,
                schema_text=schema_text,
                schema_name=schema_name,
            )
        except RuntimeError as exc:
            raise HTTPException(status_code=503, detail=str(exc))
        return {"question": req.question, "answer": answer}

    # -- component registry endpoints --

    @router.post("/component-registry/ingest")
    async def cr_ingest(framework: str | None = Query(default=None)):
        """Run the component registry ELT pipeline."""
        b = _get_bundle(framework)
        registry_service = b.get("registry_service")
        if registry_service is None:
            raise HTTPException(status_code=503, detail="Component registry not available")
        try:
            result = await registry_service.run_ingest()
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @router.get("/component-registry/documents")
    async def cr_documents(components: str = "", framework: str | None = Query(default=None)):
        """Get markdown documents for given components (comma-separated)."""
        b = _get_bundle(framework)
        registry_service = b.get("registry_service")
        if registry_service is None:
            raise HTTPException(status_code=503, detail="Component registry not available")
        names = [c.strip() for c in components.split(",") if c.strip()]
        docs = await registry_service.get_documents(names)
        return {"documents": docs}

    @router.get("/component-registry/functions")
    async def cr_functions(components: str = "", framework: str | None = Query(default=None)):
        """Get function metadata for given components (comma-separated)."""
        b = _get_bundle(framework)
        registry_service = b.get("registry_service")
        if registry_service is None:
            raise HTTPException(status_code=503, detail="Component registry not available")
        names = [c.strip() for c in components.split(",") if c.strip()]
        fns = await registry_service.get_functions(names)
        return {"functions": fns}

    @router.post("/component-registry/functions/{file_id}/run/{fn_name}")
    def cr_run_function(file_id: str, fn_name: str, req: RunFunctionRequest = None,
                        framework: str | None = Query(default=None)):
        """Execute a function from a component's .fnc.py module."""
        b = _get_bundle(framework)
        registry_service = b.get("registry_service")
        if registry_service is None:
            raise HTTPException(status_code=503, detail="Component registry not available")
        try:
            params = req.params if req else None
            result = registry_service.execute_function(file_id, fn_name, params)
            return {"result": result}
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    # -- session persistence endpoints --

    @router.post("/sessions", status_code=201)
    async def create_session(req: CreateSessionRequest):
        """Create a new chat session after initial search."""
        if pg_manager is None:
            raise HTTPException(status_code=503, detail="Session persistence not available")
        from .db_models import RagChatSession
        from sqlalchemy import select

        async with pg_manager.async_session() as db:
            existing = (await db.execute(
                select(RagChatSession).where(RagChatSession.id == req.session_id)
            )).scalar_one_or_none()
            if existing:
                return {"id": str(existing.id), "status": "exists"}

            session = RagChatSession(
                id=req.session_id,
                query=req.query,
                mode=req.mode,
                top_k=req.top_k,
                provider=req.provider,
                alpha=req.alpha,
                threshold=req.threshold,
                reranker=req.reranker,
                backend=req.backend,
                code_mode=req.code_mode,
                component_mode=req.component_mode,
                search_results=req.search_results,
                components=req.components,
                search_answer=req.search_answer,
            )
            db.add(session)
            return {"id": str(session.id), "status": "created"}

    @router.get("/sessions/{session_id}")
    async def get_session(session_id: UUID):
        """Retrieve full session state."""
        if pg_manager is None:
            raise HTTPException(status_code=503, detail="Session persistence not available")
        from .db_models import RagChatSession
        from sqlalchemy import select

        async with pg_manager.async_session() as db:
            row = (await db.execute(
                select(RagChatSession).where(RagChatSession.id == session_id)
            )).scalar_one_or_none()
            if not row:
                raise HTTPException(status_code=404, detail="Session not found")

            templates = None
            if row.prompt_templates:
                templates = [PromptTemplateRef(**t) for t in row.prompt_templates]

            return SessionResponse(
                id=row.id,
                query=row.query,
                mode=row.mode,
                top_k=row.top_k,
                provider=row.provider,
                alpha=row.alpha,
                threshold=row.threshold,
                reranker=row.reranker,
                backend=row.backend,
                code_mode=row.code_mode,
                component_mode=row.component_mode,
                search_results=row.search_results,
                components=row.components,
                search_answer=row.search_answer,
                question=row.question,
                system_prompt=row.system_prompt,
                format=row.format,
                schema_config=row.schema_config,
                prompt_templates=templates,
                selected_docs=row.selected_docs,
                variant_selections=row.variant_selections,
                llm_responses=row.llm_responses,
                created_at=row.created_at,
                updated_at=row.updated_at,
            )

    _JSONB_SESSION_FIELDS = frozenset({
        "schema_config", "prompt_templates", "selected_docs",
        "variant_selections", "search_results", "components",
    })

    @router.patch("/sessions/{session_id}")
    async def update_session(session_id: UUID, req: UpdateSessionRequest):
        """Partial update of AskLlmPanel state."""
        if pg_manager is None:
            raise HTTPException(status_code=503, detail="Session persistence not available")
        from .db_models import RagChatSession
        from sqlalchemy import select
        from sqlalchemy.orm.attributes import flag_modified

        async with pg_manager.async_session() as db:
            row = (await db.execute(
                select(RagChatSession).where(RagChatSession.id == session_id)
            )).scalar_one_or_none()
            if not row:
                raise HTTPException(status_code=404, detail="Session not found")

            updates = req.model_dump(exclude_unset=True)
            if "prompt_templates" in updates and updates["prompt_templates"] is not None:
                updates["prompt_templates"] = [t.model_dump() for t in req.prompt_templates]
            for field, value in updates.items():
                setattr(row, field, value)
                if field in _JSONB_SESSION_FIELDS:
                    flag_modified(row, field)

            return {"id": str(session_id), "status": "updated"}

    @router.post("/sessions/{session_id}/llm-responses", status_code=201)
    async def append_llm_response(session_id: UUID, req: AppendLlmResponseRequest):
        """Append an LLM question/answer pair to the session."""
        if pg_manager is None:
            raise HTTPException(status_code=503, detail="Session persistence not available")
        from .db_models import RagChatSession
        from sqlalchemy import select
        from sqlalchemy.orm.attributes import flag_modified

        async with pg_manager.async_session() as db:
            row = (await db.execute(
                select(RagChatSession).where(RagChatSession.id == session_id)
            )).scalar_one_or_none()
            if not row:
                raise HTTPException(status_code=404, detail="Session not found")

            entry = {
                "question": req.question,
                "answer": req.answer,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            if row.llm_responses is None:
                row.llm_responses = [entry]
            else:
                row.llm_responses = [*row.llm_responses, entry]
            flag_modified(row, "llm_responses")

            return {"id": str(session_id), "count": len(row.llm_responses)}

    return router
