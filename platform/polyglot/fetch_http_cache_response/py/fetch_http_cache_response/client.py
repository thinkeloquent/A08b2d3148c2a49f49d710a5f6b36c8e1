"""FetchHttpCacheClient — HTTP client with S3 response caching (Story 3)."""

from __future__ import annotations

import asyncio
import hashlib
import json
import time
from typing import Any

from .exceptions import (
    FetchCacheNetworkError,
    FetchCacheStorageError,
    FetchCacheTimeoutError,
)
from .logger import create as create_logger
from .token_manager import TokenRefreshManager
from .types import (
    CacheResponseConfig,
    CachedHttpResponse,
    FetchResult,
    HttpFetchConfig,
    SDKConfig,
)

logger = create_logger(__name__)


def _generate_cache_key(
    method: str,
    url: str,
    key_strategy: str,
    key_prefix: str,
    body: Any = None,
    key_fn: Any = None,
) -> str:
    """Generate cache key based on strategy."""
    if key_strategy == "custom" and key_fn is not None:
        raw = key_fn(method, url, body)
    elif key_strategy == "url+body":
        parts = f"{method.upper()}:{url}"
        if body is not None:
            parts += f":{json.dumps(body, sort_keys=True)}"
        raw = parts
    else:  # "url" (default)
        raw = f"{method.upper()}:{url}"

    hashed = hashlib.sha256(raw.encode()).hexdigest()[:16]
    return f"{key_prefix}{hashed}"


class FetchHttpCacheClient:
    """HTTP client with integrated S3 response caching and auth token rotation."""

    def __init__(
        self,
        config: SDKConfig,
        http_client: Any = None,
        storage: Any = None,
        token_manager: TokenRefreshManager | None = None,
    ):
        self._config = config
        self._http_client = http_client
        self._storage = storage
        self._token_manager = token_manager
        self._closed = False
        self._logger = logger.child("client")

        if config.debug:
            self._logger.debug(
                f"initialized: base_url={config.http.base_url}, "
                f"cache={'enabled' if config.cache.enabled else 'disabled'}"
            )

    # ── Lazy init ──────────────────────────────────────────────────────────

    async def _ensure_http_client(self) -> Any:
        if self._http_client is None:
            try:
                from fetch_httpx_clients import fetch_httpx_async

                self._http_client = fetch_httpx_async(
                    base_url=self._config.http.base_url or None,
                    timeout=self._config.http.timeout,
                    verify=self._config.http.verify,
                    follow_redirects=self._config.http.follow_redirects,
                    headers=self._config.http.headers or None,
                )
            except ImportError:
                from fetch_httpx import AsyncClient

                self._http_client = AsyncClient(
                    base_url=self._config.http.base_url or None,
                    timeout=self._config.http.timeout,
                    verify=self._config.http.verify,
                    follow_redirects=self._config.http.follow_redirects,
                    headers=self._config.http.headers or None,
                )
        return self._http_client

    async def _ensure_storage(self) -> Any:
        if self._storage is None and self._config.cache.enabled:
            if self._config.cache.storage_type == "s3":
                try:
                    from cache_json_awss3_storage import JsonS3Storage, create_storage

                    s3_cfg = self._config.cache.s3_config or {}
                    self._storage = create_storage(
                        bucket_name=s3_cfg.get("bucket_name", ""),
                        key_prefix=self._config.cache.key_prefix,
                        ttl=self._config.cache.ttl_seconds,
                    )
                except ImportError:
                    self._logger.warn("cache_json_awss3_storage not available, caching disabled")
                    self._config.cache.enabled = False
            elif self._config.cache.storage_type == "memory":
                from fetch_httpx._cache.storage.memory import MemoryStorage

                self._storage = MemoryStorage()
        return self._storage

    # ── Auth headers ───────────────────────────────────────────────────────

    async def _get_auth_headers(self) -> dict[str, str]:
        if self._token_manager is None:
            return {}
        return await self._token_manager.build_auth_headers()

    # ── Cache operations ───────────────────────────────────────────────────

    async def _cache_get(self, key: str) -> CachedHttpResponse | None:
        """Try to load cached response."""
        storage = await self._ensure_storage()
        if storage is None:
            return None

        try:
            entry = await storage.load(key)
            if entry is None:
                return None

            data = entry if isinstance(entry, dict) else (
                entry.data if hasattr(entry, "data") else None
            )
            if data is None:
                return None

            # Check TTL
            expires_at = data.get("expires_at") if isinstance(data, dict) else (
                getattr(entry, "expires_at", None)
            )
            now = time.time()
            if expires_at and now > expires_at:
                # Check stale_while_revalidate
                stale_window = self._config.cache.stale_while_revalidate
                if stale_window and now < expires_at + stale_window:
                    self._logger.debug(f"serving stale cache for key={key}")
                    response_data = data.get("response", data) if isinstance(data, dict) else data
                    return CachedHttpResponse(
                        status_code=response_data.get("status_code", 200)
                        if isinstance(response_data, dict) else 200,
                        headers=response_data.get("headers", {})
                        if isinstance(response_data, dict) else {},
                        body=response_data.get("body")
                        if isinstance(response_data, dict) else response_data,
                        cache_hit=True,
                        cache_key=key,
                        cache_age=now - (data.get("created_at", now)
                                         if isinstance(data, dict) else now),
                        cache_expires_at=expires_at,
                    )
                return None

            response_data = data.get("response", data) if isinstance(data, dict) else data
            return CachedHttpResponse(
                status_code=response_data.get("status_code", 200)
                if isinstance(response_data, dict) else 200,
                headers=response_data.get("headers", {})
                if isinstance(response_data, dict) else {},
                body=response_data.get("body")
                if isinstance(response_data, dict) else response_data,
                cache_hit=True,
                cache_key=key,
                cache_age=now - (data.get("created_at", now) if isinstance(data, dict) else now),
                cache_expires_at=expires_at,
            )
        except Exception as e:
            self._logger.warn(f"cache read failed for key={key}: {e}")
            return None

    async def _cache_set(self, key: str, response: CachedHttpResponse) -> None:
        """Store response in cache."""
        storage = await self._ensure_storage()
        if storage is None:
            return

        now = time.time()
        entry = {
            "key": key,
            "data": {
                "response": {
                    "status_code": response.status_code,
                    "headers": response.headers,
                    "body": response.body,
                },
                "created_at": now,
                "expires_at": now + self._config.cache.ttl_seconds,
            },
            "created_at": now,
            "expires_at": now + self._config.cache.ttl_seconds,
        }

        try:
            await storage.save(entry)
            self._logger.debug(f"cached response: key={key}, ttl={self._config.cache.ttl_seconds}s")
        except Exception as e:
            raise FetchCacheStorageError(
                f"Failed to cache response for key={key}: {e}", cause=e
            ) from e

    # ── HTTP methods ───────────────────────────────────────────────────────

    async def request(
        self,
        method: str,
        url: str,
        headers: dict[str, str] | None = None,
        body: Any = None,
        params: dict[str, str] | None = None,
        key_fn: Any = None,
    ) -> FetchResult[Any]:
        """Make an HTTP request with optional caching."""
        start = time.monotonic()

        # Build merged headers
        merged_headers = dict(self._config.http.headers)
        auth_headers = await self._get_auth_headers()
        merged_headers.update(auth_headers)
        if headers:
            merged_headers.update(headers)

        # Resolve full URL
        full_url = url
        if self._config.http.base_url and not url.startswith(("http://", "https://")):
            base = self._config.http.base_url.rstrip("/")
            full_url = f"{base}/{url.lstrip('/')}"

        # Cache check (for cacheable methods)
        cache_key = None
        should_cache = (
            self._config.cache.enabled
            and method.upper() in self._config.cache.cache_methods
        )

        if should_cache:
            cache_key = _generate_cache_key(
                method=method,
                url=full_url,
                key_strategy=self._config.cache.key_strategy,
                key_prefix=self._config.cache.key_prefix,
                body=body,
                key_fn=key_fn,
            )

            cached = await self._cache_get(cache_key)
            if cached is not None:
                elapsed = (time.monotonic() - start) * 1000
                self._logger.debug(f"cache hit: key={cache_key}, elapsed={elapsed:.1f}ms")

                # If stale, trigger background revalidation
                if (
                    cached.cache_expires_at
                    and time.time() > cached.cache_expires_at
                    and self._config.cache.stale_while_revalidate
                ):
                    asyncio.create_task(
                        self._background_revalidate(method, url, merged_headers, body, cache_key)
                    )

                return FetchResult.ok(
                    data=cached.body,
                    cached=True,
                    cache_key=cache_key,
                    elapsed_ms=elapsed,
                )

        # Make HTTP request
        try:
            client = await self._ensure_http_client()

            kwargs: dict[str, Any] = {"headers": merged_headers}
            if body is not None:
                kwargs["json"] = body
            if params is not None:
                kwargs["params"] = params

            response = await client.request(method.upper(), url, **kwargs)
            elapsed = (time.monotonic() - start) * 1000

            # Parse response
            try:
                response_body = response.json()
            except Exception:
                response_body = response.text if hasattr(response, "text") else str(response.content)

            response_headers = dict(response.headers) if hasattr(response, "headers") else {}

            # Cache successful responses
            if should_cache and cache_key and 200 <= response.status_code < 400:
                cached_response = CachedHttpResponse(
                    status_code=response.status_code,
                    headers=response_headers,
                    body=response_body,
                    cache_hit=False,
                    cache_key=cache_key,
                )
                try:
                    await self._cache_set(cache_key, cached_response)
                except FetchCacheStorageError:
                    self._logger.warn(f"failed to cache response for key={cache_key}")

            self._logger.debug(
                f"fetch: {method.upper()} {url} -> {response.status_code} ({elapsed:.1f}ms)"
            )

            return FetchResult.ok(
                data=response_body,
                cached=False,
                cache_key=cache_key,
                elapsed_ms=elapsed,
            )

        except asyncio.TimeoutError as e:
            elapsed = (time.monotonic() - start) * 1000
            raise FetchCacheTimeoutError(
                f"Request timed out: {method.upper()} {url}", cause=e
            ) from e
        except FetchCacheStorageError:
            raise
        except Exception as e:
            elapsed = (time.monotonic() - start) * 1000
            raise FetchCacheNetworkError(
                f"HTTP request failed: {method.upper()} {url}: {e}", cause=e
            ) from e

    async def _background_revalidate(
        self,
        method: str,
        url: str,
        headers: dict[str, str],
        body: Any,
        cache_key: str,
    ) -> None:
        """Background revalidation for stale-while-revalidate."""
        try:
            client = await self._ensure_http_client()
            kwargs: dict[str, Any] = {"headers": headers}
            if body is not None:
                kwargs["json"] = body
            response = await client.request(method.upper(), url, **kwargs)

            if 200 <= response.status_code < 400:
                try:
                    response_body = response.json()
                except Exception:
                    response_body = response.text if hasattr(response, "text") else str(
                        response.content
                    )
                cached_response = CachedHttpResponse(
                    status_code=response.status_code,
                    headers=dict(response.headers) if hasattr(response, "headers") else {},
                    body=response_body,
                    cache_hit=False,
                    cache_key=cache_key,
                )
                await self._cache_set(cache_key, cached_response)
                self._logger.debug(f"background revalidation complete: key={cache_key}")
        except Exception as e:
            self._logger.warn(f"background revalidation failed: key={cache_key}: {e}")

    # ── Convenience methods ────────────────────────────────────────────────

    async def get(self, url: str, **kwargs: Any) -> FetchResult[Any]:
        return await self.request("GET", url, **kwargs)

    async def post(self, url: str, **kwargs: Any) -> FetchResult[Any]:
        return await self.request("POST", url, **kwargs)

    async def put(self, url: str, **kwargs: Any) -> FetchResult[Any]:
        return await self.request("PUT", url, **kwargs)

    async def delete(self, url: str, **kwargs: Any) -> FetchResult[Any]:
        return await self.request("DELETE", url, **kwargs)

    async def head(self, url: str, **kwargs: Any) -> FetchResult[Any]:
        return await self.request("HEAD", url, **kwargs)

    # ── Cache management ──────────────────────────────────────────────────

    async def invalidate_cache(self, key: str) -> None:
        """Manually invalidate a cache entry."""
        storage = await self._ensure_storage()
        if storage is not None:
            try:
                await storage.delete(key)
                self._logger.debug(f"invalidated cache: key={key}")
            except Exception as e:
                raise FetchCacheStorageError(
                    f"Failed to invalidate cache key={key}: {e}", cause=e
                ) from e

    # ── Context manager ───────────────────────────────────────────────────

    async def __aenter__(self) -> FetchHttpCacheClient:
        return self

    async def __aexit__(self, *args: Any) -> None:
        await self.close()

    async def close(self) -> None:
        """Cleanup: close HTTP pool, flush pending S3 writes."""
        if self._closed:
            return
        self._closed = True

        if self._http_client is not None and hasattr(self._http_client, "aclose"):
            await self._http_client.aclose()
        elif self._http_client is not None and hasattr(self._http_client, "close"):
            await self._http_client.close()

        if self._storage is not None and hasattr(self._storage, "close"):
            await self._storage.close()

        self._logger.debug("client closed")
