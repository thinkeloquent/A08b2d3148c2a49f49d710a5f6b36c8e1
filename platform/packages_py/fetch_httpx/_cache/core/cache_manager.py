"""
Cache Manager

Core cache logic for managing cached responses.
"""

from __future__ import annotations

import json
import logging
import time
from typing import TYPE_CHECKING, Any

from ..._exceptions import CacheSerializationError
from ..storage.memory import MemoryStorage
from ..types import (
    CacheConfig,
    CacheEntry,
    CacheEntryMetadata,
    CacheKeyStrategy,
    CacheStats,
    RequestCacheOptions,
)
from .key_strategy import default_key_strategy

if TYPE_CHECKING:
    from ..types import CacheStorage

logger = logging.getLogger("fetch_httpx.cache")


class CacheManager:
    """
    Core cache logic for managing cached responses.

    Handles cache key generation, storage operations, and response serialization.

    Example:
        manager = CacheManager(CacheConfig(ttl=60.0))

        key = manager.generate_key('GET', 'https://api.example.com/users')
        await manager.set(key, response)

        cached = await manager.get(key)
        response = manager.create_response_from_cache(cached)
    """

    def __init__(self, config: CacheConfig | None = None) -> None:
        config = config or CacheConfig()

        self._storage: CacheStorage = config.storage or MemoryStorage(max_entries=config.max_entries)
        self._ttl = config.ttl
        self._methods = [m.upper() for m in config.methods]
        self._key_strategy: CacheKeyStrategy = config.key_strategy or default_key_strategy
        self._stale_while_revalidate = config.stale_while_revalidate
        self._stale_grace_period = config.stale_grace_period

        # Track in-flight requests for deduplication
        self._pending: dict[str, Any] = {}

    def generate_key(
        self,
        method: str,
        url: str,
        headers: dict[str, str] | None = None,
        body: Any = None,
        params: dict[str, Any] | None = None,
    ) -> str:
        """Generate a cache key for a request."""
        return self._key_strategy(method, url, headers, body, params)

    def should_cache(
        self,
        method: str,
        options: RequestCacheOptions | None = None,
    ) -> bool:
        """Check if a request should be cached."""
        if options and options.no_cache:
            return False
        return method.upper() in self._methods

    async def get(self, key: str) -> CacheEntry | None:
        """Get an entry from cache."""
        return await self._storage.get(key)

    async def get_stale(
        self, key: str
    ) -> tuple[CacheEntry | None, bool]:
        """
        Get with stale-while-revalidate support.

        Returns:
            Tuple of (entry, is_stale)
        """
        entry = await self._storage.get(key)

        if not entry:
            return None, False

        now = time.time()
        is_stale = now > entry.expires_at
        within_grace = now < entry.expires_at + self._stale_grace_period

        if is_stale and not within_grace:
            return None, True

        return entry, is_stale

    async def set(
        self,
        key: str,
        response: Any,  # Response type
        ttl: float | None = None,
    ) -> None:
        """
        Store a response in cache.

        Args:
            key: Cache key
            response: Response object to cache
            ttl: Optional TTL override

        Raises:
            CacheSerializationError: If response data cannot be serialized
        """
        effective_ttl = ttl if ttl is not None else self._ttl
        now = time.time()

        logger.info(
            "CacheManager.set called",
            extra={
                "key": key[:50],
                "ttl": effective_ttl,
                "response_type": type(response).__name__,
                "storage_type": type(self._storage).__name__,
            },
        )

        # Read response body with proper error handling
        data = None
        if hasattr(response, "json"):
            try:
                data = response.json()
            except json.JSONDecodeError as json_err:
                logger.debug(
                    "Response is not JSON, falling back to text",
                    extra={"key": key[:50], "error": str(json_err)},
                )
                # Not JSON - try text
                if hasattr(response, "text"):
                    try:
                        data = response.text
                    except Exception as text_err:
                        logger.warning(
                            "Failed to read response text",
                            extra={"key": key[:50], "error": str(text_err)},
                        )
                        data = None
            except Exception as e:
                # Unexpected error reading JSON - log and raise
                logger.error(
                    "Failed to read response body for caching",
                    extra={
                        "key": key[:50],
                        "error": str(e),
                        "error_type": type(e).__name__,
                    },
                )
                raise CacheSerializationError(
                    f"Failed to read response body: {e}",
                    operation="set",
                    key=key,
                    original_error=e,
                ) from e

        # Get metadata
        status_code = getattr(response, "status_code", 200)
        headers_obj = getattr(response, "headers", {})
        if hasattr(headers_obj, "items"):
            headers_dict = dict(headers_obj.items())
        else:
            headers_dict = dict(headers_obj) if headers_obj else {}

        url_obj = getattr(response, "url", None)
        url_str = str(url_obj) if url_obj else ""

        request_obj = getattr(response, "request", None)
        method = getattr(request_obj, "method", "GET") if request_obj else "GET"

        entry = CacheEntry(
            key=key,
            data=data,
            created_at=now,
            expires_at=now + effective_ttl,
            metadata=CacheEntryMetadata(
                status_code=status_code,
                headers=headers_dict,
                url=url_str,
                method=method,
                content_type=headers_dict.get("content-type"),
                size=len(str(data)) if data else None,
            ),
        )

        await self._storage.set(key, entry)
        logger.debug(
            "Cached response",
            extra={
                "key": key[:50],
                "status_code": status_code,
                "ttl": effective_ttl,
                "size": entry.metadata.size,
            },
        )

    def create_response_from_cache(self, entry: CacheEntry) -> Any:
        """
        Create a Response from a cached entry.

        Note: Returns a dict-like object that mimics Response.
        For full Response reconstruction, use the actual Response class.

        Raises:
            CacheSerializationError: If entry data cannot be converted to response content
        """
        # Import here to avoid circular imports
        try:
            from ..._models import URL, Headers, Response

            content: bytes
            try:
                if isinstance(entry.data, str):
                    content = entry.data.encode("utf-8")
                elif isinstance(entry.data, bytes):
                    content = entry.data
                elif entry.data is None:
                    content = b""
                else:
                    content = json.dumps(entry.data).encode("utf-8")
            except (TypeError, ValueError) as e:
                logger.error(
                    "Failed to serialize cached data to response content",
                    extra={
                        "key": entry.key[:50],
                        "data_type": type(entry.data).__name__,
                        "error": str(e),
                    },
                )
                raise CacheSerializationError(
                    f"Failed to serialize cached data: {e}",
                    operation="create_response",
                    key=entry.key,
                    original_error=e,
                ) from e

            logger.debug(
                "Created response from cache",
                extra={
                    "key": entry.key[:50],
                    "status_code": entry.metadata.status_code,
                },
            )
            return Response(
                status_code=entry.metadata.status_code,
                headers=Headers(entry.metadata.headers),
                content=content,
                request=None,
            )
        except ImportError:
            # Fallback: return a simple object
            logger.debug(
                "Using fallback CachedResponse (Response model not available)",
                extra={"key": entry.key[:50]},
            )

            class CachedResponse:
                def __init__(self, entry: CacheEntry):
                    self.status_code = entry.metadata.status_code
                    self.headers = entry.metadata.headers
                    self.url = entry.metadata.url
                    self._data = entry.data
                    self._content = None
                    self._text = None

                @property
                def ok(self) -> bool:
                    return 200 <= self.status_code < 300

                @property
                def is_success(self) -> bool:
                    return self.ok

                def json(self) -> Any:
                    return self._data

                @property
                def text(self) -> str:
                    if self._text is None:
                        if isinstance(self._data, str):
                            self._text = self._data
                        elif self._data is None:
                            self._text = ""
                        else:
                            self._text = json.dumps(self._data)
                    return self._text

                @property
                def content(self) -> bytes:
                    if self._content is None:
                        self._content = self.text.encode("utf-8")
                    return self._content

            return CachedResponse(entry)

    async def invalidate(self, key: str) -> bool:
        """Invalidate a single cache key."""
        return await self._storage.delete(key)

    async def invalidate_pattern(self, pattern: str) -> int:
        """Invalidate keys matching a glob pattern."""
        return await self._storage.delete_pattern(pattern)

    async def clear(self) -> None:
        """Clear all cache entries."""
        await self._storage.clear()

    async def keys(self, pattern: str | None = None) -> list[str]:
        """Get all cache keys."""
        return await self._storage.keys(pattern)

    async def stats(self) -> CacheStats:
        """Get cache statistics."""
        return await self._storage.stats()

    @property
    def stale_while_revalidate_enabled(self) -> bool:
        """Check if stale-while-revalidate is enabled."""
        return self._stale_while_revalidate

    async def close(self) -> None:
        """Close the cache manager."""
        await self._storage.close()
