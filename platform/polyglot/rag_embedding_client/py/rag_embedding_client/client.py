"""Direct httpx embedding client and central routing for embedding backends.

Provides ``HttpxEmbeddingClient`` — a lightweight alternative to
``langchain_openai.OpenAIEmbeddings`` that speaks the OpenAI
``POST /v1/embeddings`` protocol directly via httpx.

The ``get_embeddings`` routing function selects the backend based on the
``RAG_EMBEDDING_BACKEND`` env var (``"httpx"`` by default, ``"langchain"``
for the LangChain fallback).

Environment variables (all optional — omit to use OpenAI defaults):

    RAG_EMBEDDING_BACKEND        "httpx" (default) or "langchain"
    OPENAI_EMBEDDINGS_BASE_URL   Custom API base URL
    OPENAI_EMBEDDINGS_API_KEY    API key (overrides OPENAI_API_KEY)
    OPENAI_EMBEDDINGS_ORG        Organization ID
    OPENAI_EMBEDDINGS_PROXY_URL  HTTP/SOCKS proxy for outbound requests
"""

from __future__ import annotations

import logging
import os
import time

from fetch_httpx import HTTPStatusError
from rag_embedding_config import DEFAULT_EMBEDDINGS_BASE_URL, EMBEDDINGS_PATH, MAX_EMBEDDING_BATCH_SIZE

from .client_http_methods import HttpMethods
from .client_httpx import build_client_async, build_client_sync
from .exceptions import EmbeddingBatchRejectedError, ForbiddenRejection

_TAG = "[embedding-client]"
logger = logging.getLogger("chromadb_rag_ingest")


def _build_headers(api_key: str, org: str | None) -> dict[str, str]:
    headers: dict[str, str] = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    if org:
        headers["OpenAI-Organization"] = org
    return headers


class HttpxEmbeddingClient:
    """Lightweight OpenAI-compatible embedding client using httpx.

    Implements the same duck-typed interface as
    ``langchain_openai.OpenAIEmbeddings``:

    - ``embed_documents(texts) -> list[list[float]]``
    - ``embed_query(text) -> list[float]``
    - ``aembed_query(text) -> list[float]``  (async)
    """

    def __init__(
        self,
        model: str,
        api_key: str,
        base_url: str = DEFAULT_EMBEDDINGS_BASE_URL,
        verify: str | bool = True,
        organization: str | None = None,
        proxy_url: str | None = None,
        timeout: float = 120.0,
        ca_bundle: str | None = None,
        http_methods: HttpMethods | None = None,
    ) -> None:
        self.model = model
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout
        self._proxy_url = proxy_url
        self._headers = _build_headers(api_key, organization)
        self._http_methods = http_methods or HttpMethods()

        # ca_bundle overrides verify for backward compat with callers
        # that pass ca_bundle but not verify
        if ca_bundle and verify is True:
            verify = ca_bundle

        print(f"{_TAG} HttpxEmbeddingClient.__init__")
        print(f"{_TAG}   model:     {model}")
        print(f"{_TAG}   endpoint:  {self._base_url}{EMBEDDINGS_PATH}")
        print(f"{_TAG}   timeout:   {timeout}s")
        print(f"{_TAG}   proxy:     {'(set)' if proxy_url else '(none)'}")
        print(f"{_TAG}   verify:    {verify}")
        print(f"{_TAG}   auth:      Bearer {'(set)' if api_key else '(empty)'}")
        print(f"{_TAG}   org:       {'(set)' if organization else '(none)'}")

        self._client = build_client_sync(
            headers=self._headers,
            timeout=timeout,
            proxy_url=proxy_url,
            verify=verify,
        )
        self._async_client = build_client_async(
            headers=self._headers,
            timeout=timeout,
            proxy_url=proxy_url,
            verify=verify,
        )
        print(f"{_TAG}   sync client ready:  {type(self._client).__name__}")
        print(f"{_TAG}   async client ready: {type(self._async_client).__name__}")

    @property
    def _endpoint(self) -> str:
        return f"{self._base_url}{EMBEDDINGS_PATH}"

    def _post(self, texts: list[str]) -> list[list[float]]:
        """Send a single batch and return ordered embeddings."""
        payload = {"input": texts, "model": self.model}
        data = self._http_methods.post(self._client, self._endpoint, payload)
        items = sorted(data["data"], key=lambda d: d["index"])
        return [item["embedding"] for item in items]

    async def _apost(self, texts: list[str]) -> list[list[float]]:
        """Async version of _post."""
        payload = {"input": texts, "model": self.model}
        data = await self._http_methods.apost(self._async_client, self._endpoint, payload)
        items = sorted(data["data"], key=lambda d: d["index"])
        return [item["embedding"] for item in items]

    # ------------------------------------------------------------------
    # Public interface (duck-typed with OpenAIEmbeddings)
    # ------------------------------------------------------------------

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        """Embed a list of texts, batching to stay within API limits.

        Raises ``EmbeddingBatchRejectedError`` if any sub-batch receives
        an HTTP 403 Forbidden response.  The exception carries partial
        embeddings for the sub-batches that succeeded before the
        rejection.  Non-403 errors are re-raised immediately.
        """
        n_texts = len(texts)
        n_batches = (n_texts + MAX_EMBEDDING_BATCH_SIZE - 1) // MAX_EMBEDDING_BATCH_SIZE
        print(f"{_TAG} embed_documents: {n_texts} texts in {n_batches} batch(es)")
        all_embeddings: list[list[float]] = []
        rejections: list[ForbiddenRejection] = []
        for i in range(0, n_texts, MAX_EMBEDDING_BATCH_SIZE):
            batch = texts[i : i + MAX_EMBEDDING_BATCH_SIZE]
            batch_num = i // MAX_EMBEDDING_BATCH_SIZE + 1
            print(f"{_TAG}   batch {batch_num}/{n_batches}: {len(batch)} texts")
            start = time.perf_counter()
            try:
                all_embeddings.extend(self._post(batch))
            except HTTPStatusError as exc:
                if exc.response.status_code == 403:
                    preview = batch[0][:200] if batch else ""
                    error_body = exc.response.text[:1000]
                    rejection = ForbiddenRejection(
                        batch_index=batch_num - 1,
                        text_count=len(batch),
                        content_preview=preview,
                        status_code=403,
                        error_body=error_body,
                    )
                    rejections.append(rejection)
                    logger.exception(
                        "HTTP 403 Forbidden on batch %d/%d (%d texts). "
                        "Content preview: %.200s | Response: %.500s | "
                        "SRE HINT: Check upstream policy rules for false positives.",
                        batch_num, n_batches, len(batch), preview, error_body,
                    )
                    print(
                        f"{_TAG}   batch {batch_num} REJECTED (403 Forbidden) — "
                        f"{len(batch)} texts skipped"
                    )
                    continue
                raise
            elapsed = time.perf_counter() - start
            print(f"{_TAG}   batch {batch_num} done ({elapsed:.3f}s)")

        if rejections:
            raise EmbeddingBatchRejectedError(
                message=f"{len(rejections)}/{n_batches} sub-batch(es) rejected with 403 Forbidden",
                partial_embeddings=all_embeddings,
                rejections=rejections,
            )
        return all_embeddings

    def embed_query(self, text: str) -> list[float]:
        """Embed a single query string."""
        print(f"{_TAG} embed_query: {len(text)} chars")
        return self.embed_documents([text])[0]

    async def aembed_query(self, text: str) -> list[float]:
        """Async embed a single query string."""
        print(f"{_TAG} aembed_query: {len(text)} chars")
        results = await self._apost([text])
        dim = len(results[0]) if results else 0
        print(f"{_TAG}   result: {dim}-dim vector")
        return results[0]


# ------------------------------------------------------------------
# Central routing
# ------------------------------------------------------------------

async def get_embeddings(cfg):
    """Return an embedding client based on ``RAG_EMBEDDING_BACKEND``.

    - ``"httpx"``     (default) — ``HttpxEmbeddingClient``
    - ``"langchain"`` — ``langchain_openai.OpenAIEmbeddings``

    Both backends expose ``embed_documents``, ``embed_query``, and
    ``aembed_query``.
    """
    backend = os.environ.get("RAG_EMBEDDING_BACKEND", "httpx").lower().strip()
    print(f"{_TAG} get_embeddings() routing")
    print(f"{_TAG}   RAG_EMBEDDING_BACKEND={backend}")
    print(f"{_TAG}   cfg.embeddings_model_name={cfg.embeddings_model_name}")

    if backend == "langchain":
        from .kwargs_openai import get_langchain_kwargs
        from langchain_openai import OpenAIEmbeddings

        kwargs = await get_langchain_kwargs(cfg)
        print(f"{_TAG} Using LangChain OpenAIEmbeddings (model={cfg.embeddings_model_name})")
        print(f"{_TAG}   kwargs keys: {sorted(kwargs.keys())}")
        return OpenAIEmbeddings(**kwargs)

    # Default: httpx
    from .kwargs_openai import get_httpx_kwargs

    kwargs = await get_httpx_kwargs(cfg)
    print(f"{_TAG} Constructing HttpxEmbeddingClient...")
    print(f"{_TAG}   kwargs keys: {sorted(kwargs.keys())}")
    return HttpxEmbeddingClient(**kwargs)
