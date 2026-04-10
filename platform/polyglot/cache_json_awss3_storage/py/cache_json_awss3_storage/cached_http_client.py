"""
Cached HTTP Client — Higher-Order Function Pattern

Wraps any supported HTTP client with S3-backed response caching.
Provides standard HTTP methods where each response has an explicit
``.save_response()`` method for manual cache persistence.

Usage::

    cached = await with_s3_cache(http_client)(s3_config)
    res = await cached.get("https://api.example.com/data")
    key = await res.save_response()   # persist to S3

Supported clients:
    - fetch_client/FetchClient  (response["data"], response["status"])
    - fetch_httpx/AsyncClient   (response.json(), response.status_code)
    - raw httpx.AsyncClient     (response.json(), response.status_code)
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Any, Protocol, runtime_checkable

from cache_json_awss3_storage.client_factory import ClientAsync, get_client_factory
from cache_json_awss3_storage.exceptions import JsonS3StorageConfigError
from cache_json_awss3_storage.key_generator import generate_key_string
from cache_json_awss3_storage.logger import create as create_logger
from cache_json_awss3_storage.logger import LoggerProtocol
from cache_json_awss3_storage.storage import JsonS3Storage, create_storage


# ---------------------------------------------------------------------------
# S3CacheConfig
# ---------------------------------------------------------------------------

@dataclass
class S3CacheConfig:
    """Configuration for S3 cache connection."""

    bucket_name: str
    region_name: str | None = None
    endpoint_url: str | None = None
    aws_access_key_id: str | None = None
    aws_secret_access_key: str | None = None
    ttl: float = 600.0
    prefix: str = "cache:"
    addressing_style: str = "path"


# ---------------------------------------------------------------------------
# NormalizedResponse (internal)
# ---------------------------------------------------------------------------

@dataclass
class _NormalizedResponse:
    """Internal unified response shape from adapters."""

    status: int
    headers: dict[str, str]
    body: Any
    ok: bool
    url: str
    method: str


# ---------------------------------------------------------------------------
# HttpClientAdapter protocol (internal)
# ---------------------------------------------------------------------------

@runtime_checkable
class _HttpClientAdapter(Protocol):
    async def request(
        self,
        method: str,
        url: str,
        *,
        headers: dict[str, str] | None = None,
        body: Any | None = None,
        params: dict[str, str] | None = None,
        timeout: float | None = None,
    ) -> _NormalizedResponse: ...


# ---------------------------------------------------------------------------
# FetchClientAdapter — wraps polyglot fetch_client/FetchClient
# ---------------------------------------------------------------------------

class _FetchClientAdapter:
    """Adapter for polyglot fetch_client.FetchClient."""

    def __init__(self, client: Any) -> None:
        self._client = client

    async def request(
        self,
        method: str,
        url: str,
        *,
        headers: dict[str, str] | None = None,
        body: Any | None = None,
        params: dict[str, str] | None = None,
        timeout: float | None = None,
    ) -> _NormalizedResponse:
        m = method.lower()
        kwargs: dict[str, Any] = {}
        if headers:
            kwargs["headers"] = headers
        if timeout:
            kwargs["timeout"] = timeout

        if m == "get":
            response = await self._client.get(url, params, **kwargs)
        elif m == "delete":
            response = await self._client.delete(url, **kwargs)
        else:
            # post, put, patch — body as second positional arg
            fn = getattr(self._client, m)
            response = await fn(url, body, **kwargs)

        return _NormalizedResponse(
            status=response["status"],
            headers=response.get("headers", {}),
            body=response["data"],
            ok=response.get("ok", 200 <= response["status"] < 300),
            url=url,
            method=method.upper(),
        )


# ---------------------------------------------------------------------------
# FetchHttpxAdapter — wraps fetch_httpx/AsyncClient
# ---------------------------------------------------------------------------

class _FetchHttpxAdapter:
    """Adapter for fetch_httpx.AsyncClient (and raw httpx.AsyncClient)."""

    def __init__(self, client: Any) -> None:
        self._client = client

    async def request(
        self,
        method: str,
        url: str,
        *,
        headers: dict[str, str] | None = None,
        body: Any | None = None,
        params: dict[str, str] | None = None,
        timeout: float | None = None,
    ) -> _NormalizedResponse:
        kwargs: dict[str, Any] = {}
        if headers:
            kwargs["headers"] = headers
        if params:
            kwargs["params"] = params
        if timeout:
            kwargs["timeout"] = timeout
        if body is not None:
            kwargs["json"] = body

        response = await self._client.request(method.upper(), url, **kwargs)

        # Parse body — httpx Response has .json() (sync) and .text (property)
        resp_body: Any = None
        try:
            resp_body = response.json()
        except Exception:
            try:
                resp_body = response.text
            except Exception:
                resp_body = None

        # Convert headers to plain dict
        resp_headers: dict[str, str] = {}
        if hasattr(response.headers, "items"):
            resp_headers = dict(response.headers.items())

        status_code: int = response.status_code
        ok = 200 <= status_code < 300

        return _NormalizedResponse(
            status=status_code,
            headers=resp_headers,
            body=resp_body,
            ok=ok,
            url=url,
            method=method.upper(),
        )


# ---------------------------------------------------------------------------
# detect_adapter — auto-detect HTTP client type
# ---------------------------------------------------------------------------

def _detect_adapter(http_client: Any) -> _HttpClientAdapter:
    """Auto-detect the HTTP client type and return the appropriate adapter."""
    if http_client is None:
        raise JsonS3StorageConfigError(
            "http_client must be a FetchClient, fetch_httpx.AsyncClient, or httpx.AsyncClient"
        )

    # fetch_httpx / raw httpx.AsyncClient — has aclose(), request() takes (method, url)
    if hasattr(http_client, "aclose") and hasattr(http_client, "request"):
        return _FetchHttpxAdapter(http_client)

    # polyglot FetchClient — has .get/.post/.request/.close, dict-style responses
    if (
        hasattr(http_client, "get")
        and hasattr(http_client, "post")
        and hasattr(http_client, "request")
        and hasattr(http_client, "close")
        and not hasattr(http_client, "aclose")
    ):
        return _FetchClientAdapter(http_client)

    raise JsonS3StorageConfigError(
        "Unrecognized HTTP client type. "
        "Supported: FetchClient, fetch_httpx.AsyncClient, httpx.AsyncClient"
    )


# ---------------------------------------------------------------------------
# CachedResponse
# ---------------------------------------------------------------------------

class CachedResponse:
    """
    Wraps a normalized HTTP response with S3 cache persistence.

    Attributes:
        status: HTTP status code.
        headers: Response headers as a plain dict.
        data: Parsed response body (JSON or raw).
        ok: True if status is 2xx.
        url: Request URL.
        method: HTTP method used.
    """

    __slots__ = (
        "status", "headers", "data", "ok", "url", "method",
        "_storage", "_default_ttl", "_logger",
    )

    def __init__(
        self,
        normalized: _NormalizedResponse,
        storage: JsonS3Storage,
        logger: LoggerProtocol,
        default_ttl: float | None = None,
    ) -> None:
        self.status: int = normalized.status
        self.headers: dict[str, str] = normalized.headers
        self.data: Any = normalized.body
        self.ok: bool = normalized.ok
        self.url: str = normalized.url
        self.method: str = normalized.method
        self._storage = storage
        self._default_ttl = default_ttl
        self._logger = logger

    async def save_response(
        self,
        key: str | None = None,
        *,
        ttl: float | None = None,
    ) -> str:
        """
        Manually save this response to S3.

        Args:
            key: Custom cache key. Defaults to hash of ``{method}:{url}``.
            ttl: TTL override in seconds. Defaults to config TTL.

        Returns:
            The S3 storage key used.
        """
        cache_key = key or generate_key_string(f"{self.method}:{self.url}")
        effective_ttl = ttl if ttl is not None else self._default_ttl

        start_time = time.time()

        self._logger.debug(
            f"save_response: method={self.method} url={self.url} key={cache_key}"
        )

        payload: dict[str, Any] = {
            "status": self.status,
            "headers": self.headers,
            "data": self.data,
            "ok": self.ok,
            "url": self.url,
            "method": self.method,
            "cached_at": time.time(),
        }

        saved_key = await self._storage.save(
            cache_key, payload, ttl=effective_ttl
        )

        elapsed = (time.time() - start_time) * 1000
        self._logger.info(
            f"save_response: saved key={saved_key} in {elapsed:.1f}ms"
        )

        return saved_key


# ---------------------------------------------------------------------------
# CachedHttpClient
# ---------------------------------------------------------------------------

class CachedHttpClient:
    """
    HTTP client wrapping an adapter with S3 cache storage.

    Provides standard async HTTP methods (get, post, put, patch, delete).
    Each response is a ``CachedResponse`` with a ``.save_response()`` method.
    """

    def __init__(
        self,
        adapter: _HttpClientAdapter,
        storage: JsonS3Storage,
        client_ctx: Any,
        s3_client: Any,
        logger: LoggerProtocol,
        ttl: float | None = None,
    ) -> None:
        self._adapter = adapter
        self._storage = storage
        self._client_ctx = client_ctx
        self._s3_client = s3_client
        self._logger = logger
        self._ttl = ttl

    async def _request(
        self,
        method: str,
        url: str,
        *,
        headers: dict[str, str] | None = None,
        body: Any | None = None,
        params: dict[str, str] | None = None,
        timeout: float | None = None,
    ) -> CachedResponse:
        start_time = time.time()
        self._logger.debug(f"request: {method} {url}")

        normalized = await self._adapter.request(
            method, url,
            headers=headers, body=body, params=params, timeout=timeout,
        )

        elapsed = (time.time() - start_time) * 1000
        self._logger.info(
            f"request: {method} {url} → {normalized.status} in {elapsed:.1f}ms"
        )

        return CachedResponse(normalized, self._storage, self._logger, self._ttl)

    async def get(
        self,
        url: str,
        params: dict[str, str] | None = None,
        options: dict[str, Any] | None = None,
    ) -> CachedResponse:
        opts = options or {}
        return await self._request(
            "GET", url, params=params,
            headers=opts.get("headers"), timeout=opts.get("timeout"),
        )

    async def post(
        self,
        url: str,
        body: Any | None = None,
        options: dict[str, Any] | None = None,
    ) -> CachedResponse:
        opts = options or {}
        return await self._request(
            "POST", url, body=body,
            headers=opts.get("headers"), timeout=opts.get("timeout"),
        )

    async def put(
        self,
        url: str,
        body: Any | None = None,
        options: dict[str, Any] | None = None,
    ) -> CachedResponse:
        opts = options or {}
        return await self._request(
            "PUT", url, body=body,
            headers=opts.get("headers"), timeout=opts.get("timeout"),
        )

    async def patch(
        self,
        url: str,
        body: Any | None = None,
        options: dict[str, Any] | None = None,
    ) -> CachedResponse:
        opts = options or {}
        return await self._request(
            "PATCH", url, body=body,
            headers=opts.get("headers"), timeout=opts.get("timeout"),
        )

    async def delete(
        self,
        url: str,
        options: dict[str, Any] | None = None,
    ) -> CachedResponse:
        opts = options or {}
        return await self._request(
            "DELETE", url,
            headers=opts.get("headers"), timeout=opts.get("timeout"),
        )

    async def destroy(self) -> None:
        """Cleanup S3 client resources."""
        self._logger.info("destroy: closing S3 client and storage")
        await self._storage.close()
        if self._client_ctx:
            await self._client_ctx.__aexit__(None, None, None)


# ---------------------------------------------------------------------------
# with_s3_cache — the HOF
# ---------------------------------------------------------------------------

def with_s3_cache(
    http_client: Any,
):
    """
    Higher-order function that wraps an HTTP client with S3 caching.

    First call: accepts any supported HTTP client, returns an async config function.
    Second call (async): accepts S3CacheConfig, returns a ready-to-use CachedHttpClient.

    Example::

        import httpx
        from cache_json_awss3_storage import with_s3_cache, S3CacheConfig

        async_client = httpx.AsyncClient()
        cached = await with_s3_cache(async_client)(S3CacheConfig(
            bucket_name="my-cache",
            endpoint_url="http://localhost:4566",
            ttl=600,
        ))

        res = await cached.get("https://api.example.com/users")
        print(res.data)
        await res.save_response()    # cache to S3
        await cached.destroy()       # cleanup

    Args:
        http_client: A FetchClient, fetch_httpx.AsyncClient, or httpx.AsyncClient.

    Returns:
        An async callable that accepts S3CacheConfig and returns CachedHttpClient.
    """
    adapter = _detect_adapter(http_client)

    async def _configure(config: S3CacheConfig) -> CachedHttpClient:
        if not config.bucket_name:
            raise JsonS3StorageConfigError("S3CacheConfig.bucket_name is required")

        logger = create_logger("cache_json_awss3_storage", __file__)
        logger.info(
            f"with_s3_cache: creating cached client "
            f"bucket={config.bucket_name}, region={config.region_name}, "
            f"endpoint={config.endpoint_url}, ttl={config.ttl}"
        )

        # Create S3 client config via existing factory
        client_config = get_client_factory(
            bucket_name=config.bucket_name,
            region_name=config.region_name,
            endpoint_url=config.endpoint_url,
            aws_access_key_id=config.aws_access_key_id,
            aws_secret_access_key=config.aws_secret_access_key,
            addressing_style=config.addressing_style,
            ttl=config.ttl,
        )

        # Open async S3 client via context manager
        client_ctx = ClientAsync(client_config)
        s3_client = await client_ctx.__aenter__()

        # Create JsonS3Storage for cache persistence
        storage = create_storage(
            s3_client,
            config.bucket_name,
            key_prefix=config.prefix,
            ttl=config.ttl,
            region=config.region_name,
            logger=logger,
        )

        return CachedHttpClient(
            adapter=adapter,
            storage=storage,
            client_ctx=client_ctx,
            s3_client=s3_client,
            logger=logger,
            ttl=config.ttl,
        )

    return _configure
