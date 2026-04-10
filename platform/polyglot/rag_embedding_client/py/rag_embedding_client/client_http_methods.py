"""Overridable HTTP method wrappers for the embedding client.

Provides a base ``HttpMethods`` class that delegates to the module-level
``post`` / ``apost`` functions in ``client_httpx``.  Cloud deployments can
subclass to inject corporate headers, custom error handling, or additional
telemetry without modifying the core client.

Example::

    from rag_embedding_client import HttpMethods

    class CustomHttpMethods(HttpMethods):
        def post(self, client, url, payload):
            client.headers["X-Custom-Source"] = "ai-platform"
            return super().post(client, url, payload)

    embeddings = HttpxEmbeddingClient(..., http_methods=CustomHttpMethods())
"""

from __future__ import annotations

from typing import Any

from fetch_httpx import AsyncClient, Client


class HttpMethods:
    """Base HTTP method wrappers — delegates to ``client_httpx`` helpers."""

    # ------------------------------------------------------------------
    # Sync
    # ------------------------------------------------------------------

    def post(self, client: Client, url: str, payload: dict[str, Any]) -> Any:
        """Sync POST — returns parsed JSON response."""
        from .client_httpx import post as _post
        return _post(client, url, payload)

    def get(self, client: Client, url: str) -> Any:
        """Sync GET — returns parsed JSON response."""
        resp = client.get(url)
        resp.raise_for_status()
        return resp.json()

    def put(self, client: Client, url: str, payload: dict[str, Any]) -> Any:
        """Sync PUT — returns parsed JSON response."""
        resp = client.put(url, json=payload)
        resp.raise_for_status()
        return resp.json()

    def delete(self, client: Client, url: str) -> Any:
        """Sync DELETE — returns parsed JSON response."""
        resp = client.delete(url)
        resp.raise_for_status()
        return resp.json()

    # ------------------------------------------------------------------
    # Async
    # ------------------------------------------------------------------

    async def apost(self, client: AsyncClient, url: str, payload: dict[str, Any]) -> Any:
        """Async POST — returns parsed JSON response."""
        from .client_httpx import apost as _apost
        return await _apost(client, url, payload)

    async def aget(self, client: AsyncClient, url: str) -> Any:
        """Async GET — returns parsed JSON response."""
        resp = await client.get(url)
        resp.raise_for_status()
        return resp.json()

    async def aput(self, client: AsyncClient, url: str, payload: dict[str, Any]) -> Any:
        """Async PUT — returns parsed JSON response."""
        resp = await client.put(url, json=payload)
        resp.raise_for_status()
        return resp.json()

    async def adelete(self, client: AsyncClient, url: str) -> Any:
        """Async DELETE — returns parsed JSON response."""
        resp = await client.delete(url)
        resp.raise_for_status()
        return resp.json()
