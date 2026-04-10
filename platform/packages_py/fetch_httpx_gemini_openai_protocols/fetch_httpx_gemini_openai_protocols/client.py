"""
Gemini OpenAI-Compatible Client.

Singleton httpx.Client / httpx.AsyncClient targeted at Gemini API origin
for high-performance connection pooling and keep-alive.

Example (Async - recommended for high concurrency):
    from fetch_httpx_gemini_openai_protocols import get_async_gemini_client

    gemini = get_async_gemini_client()
    response = await gemini.chat_completions({
        "model": "gemini-2.0-flash",
        "messages": [{"role": "user", "content": "Hello!"}]
    })
    print(response["choices"][0]["message"]["content"])

    # Clean up when done
    await gemini.aclose()

Example (Sync):
    from fetch_httpx_gemini_openai_protocols import get_gemini_client

    gemini = get_gemini_client()
    response = gemini.chat_completions({
        "model": "gemini-2.0-flash",
        "messages": [{"role": "user", "content": "Hello!"}]
    })
    print(response["choices"][0]["message"]["content"])

    # Clean up when done
    gemini.close()
"""

from __future__ import annotations

import os
from typing import Any, TypedDict

import httpx


class ChatMessage(TypedDict, total=False):
    """Chat message format."""

    role: str  # 'system', 'user', 'assistant'
    content: str


class ChatCompletionRequest(TypedDict, total=False):
    """Chat completion request payload."""

    model: str
    messages: list[ChatMessage]
    temperature: float
    max_tokens: int
    top_p: float
    stream: bool
    response_format: dict[str, str]


class GeminiClientConfig(TypedDict, total=False):
    """Gemini client configuration."""

    api_key: str  # API key (defaults to GEMINI_API_KEY env var)
    timeout_s: float  # Request timeout in seconds (default: 30.0)
    max_connections: int  # Maximum connections in pool (default: 100)
    max_keepalive_connections: int  # Maximum keep-alive connections (default: 20)
    keepalive_expiry: float  # Keep-alive expiry in seconds (default: 60.0)
    http2: bool  # Enable HTTP/2 (default: True)


# Default Gemini API origin
GEMINI_ORIGIN = "https://generativelanguage.googleapis.com"

# Gemini OpenAI-compatible chat completions endpoint
GEMINI_CHAT_COMPLETIONS_PATH = "/v1beta/openai/chat/completions"


class GeminiClient:
    """
    Gemini OpenAI-Compatible Client (Sync).

    Provides a connection-pooled client for the Gemini API using the
    OpenAI-compatible endpoint.

    httpx.Client internally maintains a connection pool and reuses
    connections per-origin, equivalent to undici.Pool behavior.
    """

    def __init__(
        self,
        origin_host: str = GEMINI_ORIGIN,
        config: GeminiClientConfig | None = None,
        client: httpx.Client | None = None,
    ) -> None:
        config = config or {}
        self.origin_host = origin_host.rstrip("/")

        if client is not None:
            # Use provided client directly (assumes it's already configured)
            self._client = client
            self._api_key = config.get("api_key") or os.environ.get("GEMINI_API_KEY", "")
        else:
            self._api_key = config.get("api_key") or os.environ.get("GEMINI_API_KEY", "")

            if not self._api_key:
                raise ValueError(
                    "Gemini API key required: set GEMINI_API_KEY env var or pass api_key in config"
                )

            timeout_s = config.get("timeout_s", 30.0)

            self._client = httpx.Client(
                base_url=self.origin_host,
                headers={
                    "Authorization": f"Bearer {self._api_key}",
                    "Content-Type": "application/json",
                },
                timeout=httpx.Timeout(timeout_s),
                limits=httpx.Limits(
                    max_connections=config.get("max_connections", 100),
                    max_keepalive_connections=config.get("max_keepalive_connections", 20),
                    keepalive_expiry=config.get("keepalive_expiry", 60.0),
                ),
                http2=config.get("http2", True),
            )

    def chat_completions(self, payload: dict[str, Any]) -> dict[str, Any]:
        """
        Send a chat completion request using OpenAI-compatible endpoint.

        Args:
            payload: Chat completion request payload

        Returns:
            Chat completion response dict
        """
        r = self._client.post(GEMINI_CHAT_COMPLETIONS_PATH, json=payload)
        r.raise_for_status()
        return r.json()

    def post(self, path: str, payload: Any) -> Any:
        """Send a raw POST request to any Gemini endpoint."""
        r = self._client.post(path, json=payload)
        r.raise_for_status()
        return r.json()

    def close(self) -> None:
        """Close the HTTP client."""
        self._client.close()

    def __enter__(self) -> GeminiClient:
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.close()


class AsyncGeminiClient:
    """
    Gemini OpenAI-Compatible Client (Async).

    Provides a connection-pooled async client for the Gemini API using the
    OpenAI-compatible endpoint.

    httpx.AsyncClient internally maintains a connection pool and reuses
    connections per-origin, equivalent to undici.Pool behavior.

    Recommended for high-concurrency LLM usage.
    """

    def __init__(
        self,
        origin_host: str = GEMINI_ORIGIN,
        config: GeminiClientConfig | None = None,
        client: httpx.AsyncClient | None = None,
    ) -> None:
        config = config or {}
        self.origin_host = origin_host.rstrip("/")

        if client is not None:
            # Use provided client directly (assumes it's already configured)
            self._client = client
            self._api_key = config.get("api_key") or os.environ.get("GEMINI_API_KEY", "")
        else:
            self._api_key = config.get("api_key") or os.environ.get("GEMINI_API_KEY", "")

            if not self._api_key:
                raise ValueError(
                    "Gemini API key required: set GEMINI_API_KEY env var or pass api_key in config"
                )

            timeout_s = config.get("timeout_s", 30.0)

            self._client = httpx.AsyncClient(
                base_url=self.origin_host,
                headers={
                    "Authorization": f"Bearer {self._api_key}",
                    "Content-Type": "application/json",
                },
                timeout=httpx.Timeout(timeout_s),
                limits=httpx.Limits(
                    max_connections=config.get("max_connections", 200),
                    max_keepalive_connections=config.get("max_keepalive_connections", 50),
                    keepalive_expiry=config.get("keepalive_expiry", 60.0),
                ),
                http2=config.get("http2", True),
            )

    async def chat_completions(self, payload: dict[str, Any]) -> dict[str, Any]:
        """
        Send a chat completion request using OpenAI-compatible endpoint.

        Args:
            payload: Chat completion request payload

        Returns:
            Chat completion response dict
        """
        r = await self._client.post(GEMINI_CHAT_COMPLETIONS_PATH, json=payload)
        r.raise_for_status()
        return r.json()

    async def post(self, path: str, payload: Any) -> Any:
        """Send a raw POST request to any Gemini endpoint."""
        r = await self._client.post(path, json=payload)
        r.raise_for_status()
        return r.json()

    async def aclose(self) -> None:
        """Close the HTTP client."""
        await self._client.aclose()

    async def __aenter__(self) -> AsyncGeminiClient:
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        await self.aclose()


# Singleton instances
_sync_singleton: GeminiClient | None = None
_sync_singleton_origin: str | None = None

_async_singleton: AsyncGeminiClient | None = None
_async_singleton_origin: str | None = None


def get_gemini_client(
    origin_host: str = GEMINI_ORIGIN,
    config: GeminiClientConfig | None = None,
    client: httpx.Client | None = None,
) -> GeminiClient:
    """
    Get or create the singleton sync Gemini client.

    Args:
        origin_host: The Gemini API origin (default: 'https://generativelanguage.googleapis.com')
        config: Optional client configuration
        client: Optional pre-configured httpx.Client to use

    Returns:
        The singleton GeminiClient instance

    Example:
        gemini = get_gemini_client()
        response = gemini.chat_completions({
            "model": "gemini-2.0-flash",
            "messages": [{"role": "user", "content": "Hello!"}]
        })
    """
    global _sync_singleton, _sync_singleton_origin

    if _sync_singleton is None or _sync_singleton_origin != origin_host:
        # Close existing singleton if origin changed
        if _sync_singleton is not None:
            try:
                _sync_singleton.close()
            except Exception:
                pass

        _sync_singleton = GeminiClient(origin_host, config, client)
        _sync_singleton_origin = origin_host

    return _sync_singleton


def get_async_gemini_client(
    origin_host: str = GEMINI_ORIGIN,
    config: GeminiClientConfig | None = None,
    client: httpx.AsyncClient | None = None,
) -> AsyncGeminiClient:
    """
    Get or create the singleton async Gemini client.

    Args:
        origin_host: The Gemini API origin (default: 'https://generativelanguage.googleapis.com')
        config: Optional client configuration
        client: Optional pre-configured httpx.AsyncClient to use

    Returns:
        The singleton AsyncGeminiClient instance

    Example:
        gemini = get_async_gemini_client()
        response = await gemini.chat_completions({
            "model": "gemini-2.0-flash",
            "messages": [{"role": "user", "content": "Hello!"}]
        })
    """
    global _async_singleton, _async_singleton_origin

    if _async_singleton is None or _async_singleton_origin != origin_host:
        _async_singleton = AsyncGeminiClient(origin_host, config, client)
        _async_singleton_origin = origin_host

    return _async_singleton


def close_gemini_client() -> None:
    """Close the singleton sync Gemini client."""
    global _sync_singleton, _sync_singleton_origin

    if _sync_singleton is not None:
        _sync_singleton.close()
        _sync_singleton = None
        _sync_singleton_origin = None


async def close_async_gemini_client() -> None:
    """Close the singleton async Gemini client."""
    global _async_singleton, _async_singleton_origin

    if _async_singleton is not None:
        await _async_singleton.aclose()
        _async_singleton = None
        _async_singleton_origin = None
