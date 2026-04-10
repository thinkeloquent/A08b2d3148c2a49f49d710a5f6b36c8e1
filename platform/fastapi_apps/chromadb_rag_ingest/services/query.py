"""RAG query engine for ChromaDB RAG Ingest.

Adapted from test/integration/RAG001/ant-design/query.py.
Module-level globals replaced by RagQueryEngine class.

Pure utility functions have been extracted to shared polyglot modules:
- rag_search_algorithms: RRF, content_hash, code/text separation, component detection
- rag_llm_synthesis: LLM client, reranker, JSON extraction, structured output
"""

import json
import os
from typing import List, Optional, Tuple

import numpy as np
from rank_bm25 import BM25Okapi

from langchain_chroma import Chroma
from langchain_core.documents import Document

# --- Imports from shared polyglot modules ---
from rag_search_algorithms import (
    content_hash as _content_hash_fn,
    reciprocal_rank_fusion,
    separate_code_text_regex,
    detect_components_metadata,
    detect_components_parse,
    build_context,
    post_process_results,
)
from rag_llm_synthesis import (
    extract_json as _extract_json_fn,
    gemini_rerank,
    build_format_instructions,
    SCHEMA_LANGUAGE_LABELS,
)


# Backward-compat alias — internal callers use _content_hash(text)
def _content_hash(text: str) -> str:
    return _content_hash_fn(text)


# ---------------------------------------------------------------------------
# RagQueryEngine — holds BM25 index + LLM clients
# ---------------------------------------------------------------------------

class RagQueryEngine:
    """Stateful query engine. Holds BM25 index and lazy LLM clients."""

    def __init__(self, config):
        self.config = config
        self._bm25_index: Optional[BM25Okapi] = None
        self._bm25_corpus: list[dict] = []
        self._openai_client = None
        self._anthropic_client = None
        self._gemini_client = None

    # -- BM25 --

    def build_bm25_index(self, db: Chroma) -> int:
        try:
            total = db._collection.count()
        except Exception:
            total = 0

        self._bm25_corpus = []
        tokenized = []

        # Fetch in batches to avoid ChromaDB "too many SQL variables" error
        batch_size = 5000
        for offset in range(0, total, batch_size):
            batch = db._collection.get(
                include=["documents", "metadatas"],
                limit=batch_size,
                offset=offset,
            )
            ids = batch["ids"]
            documents = batch["documents"] or []
            metadatas = batch["metadatas"] or []

            for doc_id, text, meta in zip(ids, documents, metadatas):
                if not text:
                    continue
                ch = _content_hash(text)
                self._bm25_corpus.append({
                    "id": doc_id, "text": text,
                    "metadata": meta or {}, "content_hash": ch,
                })
                tokenized.append(text.lower().split())

        if tokenized:
            self._bm25_index = BM25Okapi(tokenized)
        else:
            self._bm25_index = None

        return len(self._bm25_corpus)

    # -- LLM clients (lazy) --

    def _get_openai_client(self):
        if self._openai_client is None:
            try:
                from openai import OpenAI
            except ImportError:
                raise RuntimeError("LLM provider is not available. Required dependency is not installed.")
            self._openai_client = OpenAI()
        return self._openai_client

    def _get_anthropic_client(self):
        if self._anthropic_client is None:
            try:
                import anthropic
            except ImportError:
                raise RuntimeError("LLM provider is not available. Required dependency is not installed.")
            self._anthropic_client = anthropic.Anthropic()
        return self._anthropic_client

    def _get_gemini_client(self):
        if self._gemini_client is None:
            try:
                from openai import OpenAI
            except ImportError:
                raise RuntimeError("LLM provider is not available. Required dependency is not installed.")
            api_key = os.environ.get("GEMINI_API_KEY")
            if not api_key:
                raise ValueError("GEMINI_API_KEY environment variable is required for Gemini provider.")
            self._gemini_client = OpenAI(
                api_key=api_key,
                base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            )
        return self._gemini_client

    # -- Hybrid search --

    def hybrid_search(
        self,
        db,
        query: str,
        k: int,
        alpha: float = None,
        threshold: float = None,
        use_reranker: bool = None,
        backend: str = None,
        es_client=None,
        embeddings_model=None,
    ) -> List[Tuple[Document, float]]:
        cfg = self.config
        _backend = backend or cfg.vector_backend

        if _backend == "elasticsearch" and es_client is not None and embeddings_model is not None:
            from .elasticsearch_store import hybrid_search_elasticsearch
            return hybrid_search_elasticsearch(
                es_client, cfg, query, embeddings_model, k, alpha, threshold,
            )

        _alpha = alpha if alpha is not None else cfg.hybrid_alpha
        _threshold = threshold if threshold is not None else cfg.score_threshold
        _reranker = use_reranker if use_reranker is not None else cfg.reranker_enabled
        n = cfg.retrieve_n

        # Stage 1a: Vector search
        vector_raw = db.similarity_search_with_relevance_scores(query, k=n)

        vector_by_hash = {}
        vector_ranked = []
        for doc, score in vector_raw:
            ch = _content_hash(doc.page_content)
            vector_by_hash[ch] = (doc, score)
            vector_ranked.append((ch, score))

        if _threshold > 0.0:
            vector_by_hash = {
                ch: (doc, s)
                for ch, (doc, s) in vector_by_hash.items()
                if s >= _threshold
            }
            vector_ranked = [(ch, s) for ch, s in vector_ranked if ch in vector_by_hash]

        # Pure vector path
        if _alpha >= 1.0 or self._bm25_index is None:
            results = list(vector_by_hash.values())
            results.sort(key=lambda x: x[1], reverse=True)
            if _reranker:
                return gemini_rerank(query, results, k, model=cfg.reranker_model)
            return results[:k]

        # Stage 1b: BM25 search
        query_tokens = query.lower().split()
        bm25_scores = self._bm25_index.get_scores(query_tokens)
        top_bm25_idx = np.argsort(bm25_scores)[::-1][:n]

        bm25_by_hash = {}
        bm25_ranked = []
        for idx in top_bm25_idx:
            idx = int(idx)
            if bm25_scores[idx] <= 0:
                break
            entry = self._bm25_corpus[idx]
            ch = entry["content_hash"]
            doc = Document(page_content=entry["text"], metadata=entry["metadata"])
            bm25_by_hash[ch] = (doc, float(bm25_scores[idx]))
            bm25_ranked.append((ch, float(bm25_scores[idx])))

        # Pure BM25 path
        if _alpha <= 0.0:
            results = list(bm25_by_hash.values())
            results.sort(key=lambda x: x[1], reverse=True)
            if _reranker:
                return gemini_rerank(query, results, k, model=cfg.reranker_model)
            return results[:k]

        # Stage 2: RRF Fusion
        fused = reciprocal_rank_fusion(vector_ranked, bm25_ranked, _alpha)

        all_docs = {**bm25_by_hash, **vector_by_hash}

        results = []
        seen = set()
        for ch, fused_score in fused:
            if ch in seen:
                continue
            seen.add(ch)
            if ch in all_docs:
                doc, _original_score = all_docs[ch]
                results.append((doc, fused_score))

        if _reranker:
            return gemini_rerank(query, results, k, model=cfg.reranker_model)

        return results[:k]

    # -- LLM ask --

    _SCHEMA_LANGUAGE_LABELS = SCHEMA_LANGUAGE_LABELS

    def _system_prompt(self) -> str:
        name = self.config.library_name
        return (
            f"You are an expert on the {name} component library. You answer questions "
            f"about components, props, patterns, and usage based on the source code provided as context.\n\n"
            f"Rules:\n"
            f"- Only answer based on the provided context. If the context doesn't contain enough information, say so.\n"
            f"- When referencing components, mention the file path so the user can find it.\n"
            f"- Provide code examples when relevant.\n"
            f"- Be concise but thorough."
        )

    def ask_llm(
        self,
        question: str,
        context: str,
        system_prompt: str = None,
        provider: str = None,
        output_format: str = "markdown",
        schema_language: str = None,
        schema_text: str = None,
        schema_name: str = None,
    ) -> str:
        cfg = self.config
        prov = provider or cfg.llm_provider
        sys_msg = system_prompt or self._system_prompt()
        user_msg = (
            f"Context from {cfg.library_name} source code:\n\n{context}\n\n---\n\nQuestion: {question}"
        )

        # Determine enforcement strategy
        use_native = False
        native_schema = None
        if output_format == "json" and schema_language == "json_schema" and schema_text:
            try:
                native_schema = json.loads(schema_text)
                use_native = True
            except json.JSONDecodeError:
                use_native = False

        # Anthropic never uses native enforcement
        if prov == "anthropic":
            use_native = False

        # Prompt-engineering path: append schema/format instructions to system prompt
        if not use_native:
            sys_msg += build_format_instructions(output_format, schema_language, schema_text)

        if prov == "anthropic":
            client = self._get_anthropic_client()
            response = client.messages.create(
                model=cfg.anthropic_model,
                max_tokens=4096,
                system=sys_msg,
                messages=[{"role": "user", "content": user_msg}],
                temperature=0.2,
            )
            text = response.content[0].text
            if output_format == "json":
                text = _extract_json_fn(text)
            return text
        elif prov == "gemini":
            client = self._get_gemini_client()
            kwargs = {}
            if use_native and native_schema:
                kwargs["response_format"] = {
                    "type": "json_schema",
                    "json_schema": {
                        "name": schema_name or "structured_output",
                        "schema": native_schema,
                        "strict": True,
                    },
                }
            response = client.chat.completions.create(
                model=cfg.gemini_model,
                messages=[
                    {"role": "system", "content": sys_msg},
                    {"role": "user", "content": user_msg},
                ],
                temperature=0.2,
                **kwargs,
            )
            return response.choices[0].message.content
        else:
            client = self._get_openai_client()
            kwargs = {}
            if use_native and native_schema:
                kwargs["response_format"] = {
                    "type": "json_schema",
                    "json_schema": {
                        "name": schema_name or "structured_output",
                        "schema": native_schema,
                        "strict": True,
                    },
                }
            response = client.chat.completions.create(
                model=cfg.openai_model,
                messages=[
                    {"role": "system", "content": sys_msg},
                    {"role": "user", "content": user_msg},
                ],
                temperature=0.2,
                **kwargs,
            )
            return response.choices[0].message.content

    def _get_async_openai_client(self):
        if not hasattr(self, '_async_openai_client') or self._async_openai_client is None:
            try:
                from openai import AsyncOpenAI
            except ImportError:
                raise RuntimeError("LLM provider is not available. Required dependency is not installed.")
            self._async_openai_client = AsyncOpenAI()
        return self._async_openai_client

    def _get_async_anthropic_client(self):
        if not hasattr(self, '_async_anthropic_client') or self._async_anthropic_client is None:
            try:
                import anthropic
            except ImportError:
                raise RuntimeError("LLM provider is not available. Required dependency is not installed.")
            self._async_anthropic_client = anthropic.AsyncAnthropic()
        return self._async_anthropic_client

    def _get_async_gemini_client(self):
        if not hasattr(self, '_async_gemini_client') or self._async_gemini_client is None:
            try:
                from openai import AsyncOpenAI
            except ImportError:
                raise RuntimeError("LLM provider is not available. Required dependency is not installed.")
            import os
            api_key = os.environ.get("GEMINI_API_KEY")
            if not api_key:
                raise ValueError("GEMINI_API_KEY environment variable is required for Gemini provider.")
            self._async_gemini_client = AsyncOpenAI(
                api_key=api_key,
                base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            )
        return self._async_gemini_client

    async def async_ask_llm(
        self,
        question: str,
        context: str,
        system_prompt: str = None,
        provider: str = None,
        output_format: str = "markdown",
        schema_language: str = None,
        schema_text: str = None,
        schema_name: str = None,
    ) -> str:
        """Async version of ask_llm(). Uses async LLM clients."""
        cfg = self.config
        prov = provider or cfg.llm_provider
        sys_msg = system_prompt or self._system_prompt()
        user_msg = (
            f"Context from {cfg.library_name} source code:\n\n{context}\n\n---\n\nQuestion: {question}"
        )

        use_native = False
        native_schema = None
        if output_format == "json" and schema_language == "json_schema" and schema_text:
            try:
                native_schema = json.loads(schema_text)
                use_native = True
            except json.JSONDecodeError:
                use_native = False

        if prov == "anthropic":
            use_native = False

        if not use_native:
            sys_msg += build_format_instructions(output_format, schema_language, schema_text)

        if prov == "anthropic":
            client = self._get_async_anthropic_client()
            response = await client.messages.create(
                model=cfg.anthropic_model,
                max_tokens=4096,
                system=sys_msg,
                messages=[{"role": "user", "content": user_msg}],
                temperature=0.2,
            )
            text = response.content[0].text
            if output_format == "json":
                text = _extract_json_fn(text)
            return text
        elif prov == "gemini":
            client = self._get_async_gemini_client()
            kwargs = {}
            if use_native and native_schema:
                kwargs["response_format"] = {
                    "type": "json_schema",
                    "json_schema": {
                        "name": schema_name or "structured_output",
                        "schema": native_schema,
                        "strict": True,
                    },
                }
            response = await client.chat.completions.create(
                model=cfg.gemini_model,
                messages=[
                    {"role": "system", "content": sys_msg},
                    {"role": "user", "content": user_msg},
                ],
                temperature=0.2,
                **kwargs,
            )
            return response.choices[0].message.content
        else:
            client = self._get_async_openai_client()
            kwargs = {}
            if use_native and native_schema:
                kwargs["response_format"] = {
                    "type": "json_schema",
                    "json_schema": {
                        "name": schema_name or "structured_output",
                        "schema": native_schema,
                        "strict": True,
                    },
                }
            response = await client.chat.completions.create(
                model=cfg.openai_model,
                messages=[
                    {"role": "system", "content": sys_msg},
                    {"role": "user", "content": user_msg},
                ],
                temperature=0.2,
                **kwargs,
            )
            return response.choices[0].message.content

    @staticmethod
    def _extract_json(text: str) -> str:
        """Extract JSON from LLM response, stripping markdown fences if present."""
        return _extract_json_fn(text)
