"""
Pool Factory.

Generic singleton httpx.Client / httpx.AsyncClient factory for any origin host.
Provides high-performance connection pooling and keep-alive.

Example (Async - recommended for high concurrency):
    from fetch_httpx.sdk.pool import get_async_pool

    pool = get_async_pool("https://api.example.com", {
        "headers": {"Authorization": "Bearer token"}
    })
    response = await pool.post("/users", {"name": "John"})
    data = await pool.get("/users/123")

    # Clean up when done
    await pool.aclose()

Example (Sync):
    from fetch_httpx.sdk.pool import get_pool

    pool = get_pool("https://api.example.com", {
        "headers": {"Authorization": "Bearer token"}
    })
    response = pool.post("/users", {"name": "John"})
    data = pool.get("/users/123")

    # Clean up when done
    pool.close()
"""

from __future__ import annotations

from typing import Any, TypedDict

import httpx

from ..logger import create as create_logger

log = create_logger("fetch_httpx", __file__)


class PoolConfig(TypedDict, total=False):
    """Pool client configuration."""

    headers: dict[str, str]  # Default headers to include in all requests
    timeout_s: float  # Request timeout in seconds (default: 30.0)
    max_connections: int  # Maximum connections in pool (default: 100)
    max_keepalive_connections: int  # Maximum keep-alive connections (default: 20)
    keepalive_expiry: float  # Keep-alive expiry in seconds (default: 60.0)
    http2: bool  # Enable HTTP/2 (default: True)


class RequestOptions(TypedDict, total=False):
    """Request options for individual requests."""

    headers: dict[str, str]  # Request headers (merged with default headers)
    timeout_s: float  # Request timeout in seconds (overrides pool default)


class PoolClient:
    """
    Pool Client (Sync).

    Provides a connection-pooled client for any origin using httpx.Client.

    httpx.Client internally maintains a connection pool and reuses
    connections per-origin, equivalent to undici.Pool behavior.
    """

    def __init__(self, origin_host: str, config: PoolConfig | None = None) -> None:
        config = config or {}
        self.origin_host = origin_host.rstrip("/")
        self._default_headers = config.get("headers", {})

        timeout_s = config.get("timeout_s", 30.0)
        self._timeout_s = timeout_s

        self._client = httpx.Client(
            base_url=self.origin_host,
            headers=self._default_headers,
            timeout=httpx.Timeout(timeout_s),
            limits=httpx.Limits(
                max_connections=config.get("max_connections", 100),
                max_keepalive_connections=config.get("max_keepalive_connections", 20),
                keepalive_expiry=config.get("keepalive_expiry", 60.0),
            ),
            http2=config.get("http2", True),
        )

        log.info(
            "PoolClient (sync) created",
            context={
                "origin_host": self.origin_host,
                "http2": config.get("http2", True),
                "max_connections": config.get("max_connections", 100),
            },
        )

    @property
    def client(self) -> httpx.Client:
        """Get the underlying httpx.Client instance."""
        return self._client

    def _merge_headers(self, options: RequestOptions | None) -> dict[str, str]:
        if not options or "headers" not in options:
            return self._default_headers
        return {**self._default_headers, **options["headers"]}

    def _get_timeout(self, options: RequestOptions | None) -> float:
        if options and "timeout_s" in options:
            return options["timeout_s"]
        return self._timeout_s

    def post(self, path: str, body: Any, options: RequestOptions | None = None) -> Any:
        """Send a POST request with JSON body."""
        headers = self._merge_headers(options)
        timeout = self._get_timeout(options)
        r = self._client.post(path, json=body, headers=headers, timeout=timeout)
        r.raise_for_status()
        return r.json()

    def get(self, path: str, options: RequestOptions | None = None) -> Any:
        """Send a GET request."""
        headers = self._merge_headers(options)
        timeout = self._get_timeout(options)
        r = self._client.get(path, headers=headers, timeout=timeout)
        r.raise_for_status()
        return r.json()

    def put(self, path: str, body: Any, options: RequestOptions | None = None) -> Any:
        """Send a PUT request with JSON body."""
        headers = self._merge_headers(options)
        timeout = self._get_timeout(options)
        r = self._client.put(path, json=body, headers=headers, timeout=timeout)
        r.raise_for_status()
        return r.json()

    def patch(self, path: str, body: Any, options: RequestOptions | None = None) -> Any:
        """Send a PATCH request with JSON body."""
        headers = self._merge_headers(options)
        timeout = self._get_timeout(options)
        r = self._client.patch(path, json=body, headers=headers, timeout=timeout)
        r.raise_for_status()
        return r.json()

    def delete(self, path: str, options: RequestOptions | None = None) -> Any:
        """Send a DELETE request."""
        headers = self._merge_headers(options)
        timeout = self._get_timeout(options)
        r = self._client.delete(path, headers=headers, timeout=timeout)
        r.raise_for_status()
        return r.json()

    def close(self) -> None:
        """Close the HTTP client."""
        self._client.close()
        log.info("PoolClient (sync) closed", context={"origin_host": self.origin_host})

    def __enter__(self) -> PoolClient:
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.close()


class AsyncPoolClient:
    """
    Pool Client (Async).

    Provides a connection-pooled async client for any origin using httpx.AsyncClient.

    httpx.AsyncClient internally maintains a connection pool and reuses
    connections per-origin, equivalent to undici.Pool behavior.

    Recommended for high-concurrency usage.
    """

    def __init__(self, origin_host: str, config: PoolConfig | None = None) -> None:
        config = config or {}
        self.origin_host = origin_host.rstrip("/")
        self._default_headers = config.get("headers", {})

        timeout_s = config.get("timeout_s", 30.0)
        self._timeout_s = timeout_s

        self._client = httpx.AsyncClient(
            base_url=self.origin_host,
            headers=self._default_headers,
            timeout=httpx.Timeout(timeout_s),
            limits=httpx.Limits(
                max_connections=config.get("max_connections", 200),
                max_keepalive_connections=config.get("max_keepalive_connections", 50),
                keepalive_expiry=config.get("keepalive_expiry", 60.0),
            ),
            http2=config.get("http2", True),
        )

        log.info(
            "AsyncPoolClient created",
            context={
                "origin_host": self.origin_host,
                "http2": config.get("http2", True),
                "max_connections": config.get("max_connections", 200),
            },
        )

    @property
    def client(self) -> httpx.AsyncClient:
        """Get the underlying httpx.AsyncClient instance."""
        return self._client

    def _merge_headers(self, options: RequestOptions | None) -> dict[str, str]:
        if not options or "headers" not in options:
            return self._default_headers
        return {**self._default_headers, **options["headers"]}

    def _get_timeout(self, options: RequestOptions | None) -> float:
        if options and "timeout_s" in options:
            return options["timeout_s"]
        return self._timeout_s

    async def post(self, path: str, body: Any, options: RequestOptions | None = None) -> Any:
        """Send a POST request with JSON body."""
        headers = self._merge_headers(options)
        timeout = self._get_timeout(options)
        r = await self._client.post(path, json=body, headers=headers, timeout=timeout)
        r.raise_for_status()
        return r.json()

    async def get(self, path: str, options: RequestOptions | None = None) -> Any:
        """Send a GET request."""
        headers = self._merge_headers(options)
        timeout = self._get_timeout(options)
        r = await self._client.get(path, headers=headers, timeout=timeout)
        r.raise_for_status()
        return r.json()

    async def put(self, path: str, body: Any, options: RequestOptions | None = None) -> Any:
        """Send a PUT request with JSON body."""
        headers = self._merge_headers(options)
        timeout = self._get_timeout(options)
        r = await self._client.put(path, json=body, headers=headers, timeout=timeout)
        r.raise_for_status()
        return r.json()

    async def patch(self, path: str, body: Any, options: RequestOptions | None = None) -> Any:
        """Send a PATCH request with JSON body."""
        headers = self._merge_headers(options)
        timeout = self._get_timeout(options)
        r = await self._client.patch(path, json=body, headers=headers, timeout=timeout)
        r.raise_for_status()
        return r.json()

    async def delete(self, path: str, options: RequestOptions | None = None) -> Any:
        """Send a DELETE request."""
        headers = self._merge_headers(options)
        timeout = self._get_timeout(options)
        r = await self._client.delete(path, headers=headers, timeout=timeout)
        r.raise_for_status()
        return r.json()

    async def aclose(self) -> None:
        """Close the HTTP client."""
        await self._client.aclose()
        log.info("AsyncPoolClient closed", context={"origin_host": self.origin_host})

    async def __aenter__(self) -> AsyncPoolClient:
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        await self.aclose()


# Singleton instances (keyed by origin)
_sync_singletons: dict[str, PoolClient] = {}
_async_singletons: dict[str, AsyncPoolClient] = {}


def get_pool(origin_host: str, config: PoolConfig | None = None) -> PoolClient:
    """
    Get or create a singleton sync pool client for an origin.

    Args:
        origin_host: The origin (e.g., 'https://api.example.com')
        config: Optional pool configuration

    Returns:
        The singleton PoolClient instance for this origin

    Example:
        # Basic usage
        api = get_pool("https://api.example.com")
        data = api.get("/users")

        # With configuration
        api = get_pool("https://api.example.com", {
            "headers": {"Authorization": "Bearer token"},
            "max_connections": 50
        })
    """
    normalized_origin = origin_host.rstrip("/")

    if normalized_origin not in _sync_singletons:
        _sync_singletons[normalized_origin] = PoolClient(origin_host, config)

    return _sync_singletons[normalized_origin]


def get_async_pool(origin_host: str, config: PoolConfig | None = None) -> AsyncPoolClient:
    """
    Get or create a singleton async pool client for an origin.

    Args:
        origin_host: The origin (e.g., 'https://api.example.com')
        config: Optional pool configuration

    Returns:
        The singleton AsyncPoolClient instance for this origin

    Example:
        # Basic usage
        api = get_async_pool("https://api.example.com")
        data = await api.get("/users")

        # With configuration
        api = get_async_pool("https://api.example.com", {
            "headers": {"Authorization": "Bearer token"},
            "max_connections": 100
        })
    """
    normalized_origin = origin_host.rstrip("/")

    if normalized_origin not in _async_singletons:
        _async_singletons[normalized_origin] = AsyncPoolClient(origin_host, config)

    return _async_singletons[normalized_origin]


def close_pool(origin_host: str) -> None:
    """Close a singleton sync pool client for a specific origin."""
    normalized_origin = origin_host.rstrip("/")

    if normalized_origin in _sync_singletons:
        _sync_singletons[normalized_origin].close()
        del _sync_singletons[normalized_origin]


async def close_async_pool(origin_host: str) -> None:
    """Close a singleton async pool client for a specific origin."""
    normalized_origin = origin_host.rstrip("/")

    if normalized_origin in _async_singletons:
        await _async_singletons[normalized_origin].aclose()
        del _async_singletons[normalized_origin]


def close_all_pools() -> None:
    """Close all singleton sync pool clients."""
    for client in _sync_singletons.values():
        client.close()
    _sync_singletons.clear()


async def close_all_async_pools() -> None:
    """Close all singleton async pool clients."""
    for client in _async_singletons.values():
        await client.aclose()
    _async_singletons.clear()


def get_active_pool_origins() -> list[str]:
    """Get all active sync pool origins."""
    return list(_sync_singletons.keys())


def get_active_async_pool_origins() -> list[str]:
    """Get all active async pool origins."""
    return list(_async_singletons.keys())
