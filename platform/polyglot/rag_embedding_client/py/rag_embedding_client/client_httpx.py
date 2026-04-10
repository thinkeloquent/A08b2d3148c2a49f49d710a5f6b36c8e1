"""Thin httpx transport factory for OpenAI-compatible API calls.

Provides ``build_client_sync`` / ``build_client_async`` factories and
``post`` / ``apost`` methods that accept a pre-built client, enabling
connection pooling and HTTP/2 reuse across requests.
"""

from __future__ import annotations

import logging
import time
from typing import Any

from fetch_httpx import AsyncClient, AsyncHTTPTransport, Client, HTTPTransport, Proxy

_TAG = "[embedding-httpx]"
logger = logging.getLogger("chromadb_rag_ingest")


def build_client_sync(
    headers: dict[str, str] | None = None,
    timeout: float = 120.0,
    proxy_url: str | None = None,
    verify: str | bool = True,
) -> Client:
    """Create a configured sync httpx ``Client``."""
    print(f"{_TAG} build_client_sync(timeout={timeout}, proxy={proxy_url}, verify={verify})")
    transport = HTTPTransport(proxy=Proxy(proxy_url)) if proxy_url else None
    return Client(headers=headers, timeout=timeout, transport=transport, verify=verify)


def build_client_async(
    headers: dict[str, str] | None = None,
    timeout: float = 120.0,
    proxy_url: str | None = None,
    verify: str | bool = True,
) -> AsyncClient:
    """Create a configured async httpx ``AsyncClient``."""
    print(f"{_TAG} build_client_async(timeout={timeout}, proxy={proxy_url}, verify={verify})")
    transport = AsyncHTTPTransport(proxy=Proxy(proxy_url)) if proxy_url else None
    return AsyncClient(headers=headers, timeout=timeout, transport=transport, verify=verify)


def post(client: Client, url: str, payload: dict[str, Any]) -> Any:
    """Sync POST — returns parsed JSON response."""
    model = payload.get("model", "?")
    n_inputs = len(payload.get("input", []))
    print(f"{_TAG} POST {url} (model={model}, inputs={n_inputs})")

    start = time.perf_counter()
    try:
        resp = client.post(url, json=payload)
    except RuntimeError as exc:
        if "This event loop is already running" in str(exc):
            raise RuntimeError(
                f"{_TAG} Cannot use sync embedding client inside an async context "
                f"(e.g. a FastAPI endpoint). Use apost() with the async client, "
                f"or make the calling endpoint/function async."
            ) from exc
        raise
    elapsed = time.perf_counter() - start

    print(f"{_TAG}   status={resp.status_code} elapsed={elapsed:.3f}s")
    _log_response_debug(resp)

    if resp.status_code >= 400:
        _log_error_body(resp)
    resp.raise_for_status()
    return resp.json()


async def apost(client: AsyncClient, url: str, payload: dict[str, Any]) -> Any:
    """Async POST — returns parsed JSON response."""
    model = payload.get("model", "?")
    n_inputs = len(payload.get("input", []))
    print(f"{_TAG} POST {url} (model={model}, inputs={n_inputs})")

    start = time.perf_counter()
    resp = await client.post(url, json=payload)
    elapsed = time.perf_counter() - start

    print(f"{_TAG}   status={resp.status_code} elapsed={elapsed:.3f}s")
    _log_response_debug(resp)

    if resp.status_code >= 400:
        _log_error_body(resp)
    resp.raise_for_status()
    return resp.json()


def _log_response_debug(resp) -> None:
    """Print response headers useful for debugging connection issues."""
    headers_of_interest = [
        "x-request-id",
        "x-ratelimit-limit-requests",
        "x-ratelimit-remaining-requests",
        "x-ratelimit-limit-tokens",
        "x-ratelimit-remaining-tokens",
        "x-ratelimit-reset-requests",
        "openai-organization",
        "openai-processing-ms",
        "openai-version",
        "cf-ray",
        "content-type",
    ]
    found = []
    for h in headers_of_interest:
        val = resp.headers.get(h)
        if val:
            found.append(f"{h}: {val}")
    if found:
        print(f"{_TAG}   response headers:")
        for entry in found:
            print(f"{_TAG}     {entry}")

    # Log usage from response body if available
    try:
        body = resp.json()
        usage = body.get("usage")
        if usage:
            print(f"{_TAG}   usage: prompt_tokens={usage.get('prompt_tokens', '?')} total_tokens={usage.get('total_tokens', '?')}")
    except Exception:
        pass


def _log_error_body(resp) -> None:
    """Print API error response body for debugging."""
    print(f"{_TAG} API error {resp.status_code}")
    print(f"{_TAG}   url: {resp.url}")
    print(f"{_TAG}   response headers (all):")
    for k, v in resp.headers.items():
        print(f"{_TAG}     {k}: {v}")
    try:
        body = resp.json()
        err = body.get("error", {})
        if isinstance(err, dict):
            print(f"{_TAG}   error.message: {err.get('message', '(none)')}")
            print(f"{_TAG}   error.type:    {err.get('type', '(none)')}")
            print(f"{_TAG}   error.code:    {err.get('code', '(none)')}")
        else:
            print(f"{_TAG}   error: {err}")
    except Exception:
        print(f"{_TAG}   raw body: {resp.text[:1000]}")
    logger.error(
        "API error %d from %s — body: %.1000s",
        resp.status_code, resp.url, resp.text[:1000],
    )
