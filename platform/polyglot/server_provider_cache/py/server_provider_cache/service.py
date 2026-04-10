"""
CacheService - Individual cache instance for server_provider_cache.

Provides the core cache operations with TTL support, namespace prefixing,
and read-through caching via get_or_set.

Usage:
    cache = CacheService(name='providers', default_ttl=600)
    await cache.set('oauth:google', token_data)
    token = await cache.get_or_set('oauth:google', fetch_token, 600)
"""

from typing import Any, Callable, Awaitable, Optional, TypeVar

from .logger import create as create_logger
from .backends.memory import MemoryBackend
from .constants import DEFAULT_TTL, DEFAULT_BACKEND

PKG = "server_provider_cache"

T = TypeVar("T")


class CacheService:
    """Individual cache instance with CRUD operations and read-through caching."""

    def __init__(
        self,
        name: str,
        default_ttl: int = DEFAULT_TTL,
        backend: str = DEFAULT_BACKEND,
        namespace: str = "",
        logger: Optional[Any] = None,
    ):
        """Create a new cache service instance.

        Args:
            name: Cache instance name (required)
            default_ttl: Default TTL in seconds
            backend: Backend type ('memory' | 'redis')
            namespace: Key namespace prefix
            logger: Custom logger instance
        """
        if not name:
            raise ValueError("CacheService requires a name")

        self._name = name
        self._default_ttl = default_ttl
        self._backend_type = backend
        self._namespace = namespace
        self._logger = logger or create_logger(PKG, "service").child(name)

        # Initialize backend
        if backend == "memory":
            self._backend = MemoryBackend(name)
        else:
            # For now, fallback to memory
            self._logger.warn(f"Backend '{backend}' not available, using memory")
            self._backend = MemoryBackend(name)

        self._logger.info(f"initialized: backend={backend}, ttl={default_ttl}s")

    @property
    def name(self) -> str:
        """Cache instance name."""
        return self._name

    @property
    def default_ttl(self) -> int:
        """Default TTL in seconds."""
        return self._default_ttl

    @property
    def backend(self) -> str:
        """Backend type."""
        return self._backend_type

    def _prefix_key(self, key: str) -> str:
        """Apply namespace prefix to a key."""
        return f"{self._namespace}:{key}" if self._namespace else key

    def _unprefix_key(self, key: str) -> str:
        """Remove namespace prefix from a key."""
        if self._namespace and key.startswith(f"{self._namespace}:"):
            return key[len(self._namespace) + 1 :]
        return key

    async def get(self, key: str) -> Any | None:
        """Get a value from the cache.

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found/expired
        """
        prefixed_key = self._prefix_key(key)
        value = await self._backend.get(prefixed_key)
        return value

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set a value in the cache.

        Args:
            key: Cache key
            value: Value to cache
            ttl: TTL in seconds (defaults to default_ttl)
        """
        ttl_seconds = ttl if ttl is not None else self._default_ttl
        ttl_ms = ttl_seconds * 1000
        prefixed_key = self._prefix_key(key)

        await self._backend.set(prefixed_key, value, ttl_ms)
        self._logger.debug(f"set: {key} (ttl={ttl_seconds}s)")

    async def delete(self, key: str) -> None:
        """Delete a key from the cache.

        Args:
            key: Cache key
        """
        prefixed_key = self._prefix_key(key)
        await self._backend.delete(prefixed_key)
        self._logger.debug(f"del: {key}")

    # Alias for consistency with Node.js API
    async def del_(self, key: str) -> None:
        """Alias for delete() - matches Node.js del() method."""
        await self.delete(key)

    async def clear(self) -> None:
        """Clear all entries from this cache instance."""
        await self._backend.clear()
        self._logger.debug("cleared all keys")

    async def keys(self) -> list[str]:
        """Get all keys in this cache instance.

        Returns:
            List of cache keys (without namespace prefix)
        """
        all_keys = await self._backend.keys()
        return [self._unprefix_key(k) for k in all_keys]

    async def size(self) -> int:
        """Get the number of entries in this cache instance.

        Returns:
            Number of entries
        """
        return await self._backend.size()

    async def get_or_set(
        self,
        key: str,
        fetch_fn: Callable[[], Awaitable[T]],
        ttl: Optional[int] = None,
    ) -> T:
        """Get a value from cache, or fetch and cache if missing.

        Read-through caching pattern:
        - On cache hit: return cached value (fetch_fn not called)
        - On cache miss: call fetch_fn, cache result, return value
        - On fetch_fn error: propagate error (value not cached)

        Args:
            key: Cache key
            fetch_fn: Async function to fetch value on miss
            ttl: TTL in seconds (defaults to default_ttl)

        Returns:
            Cached or freshly fetched value

        Raises:
            Exception: If fetch_fn raises an exception
        """
        cached = await self.get(key)

        if cached is not None:
            self._logger.debug(f"cache hit: {key}")
            return cached  # type: ignore

        self._logger.debug(f"cache miss: {key}, fetching...")

        try:
            value = await fetch_fn()
            await self.set(key, value, ttl)
            return value
        except Exception as e:
            self._logger.error(f"fetch failed: {key} - {e}")
            raise

    async def destroy(self) -> None:
        """Cleanup resources (disconnect backend)."""
        await self._backend.disconnect()
        self._logger.info("destroyed")


def create_cache_service(
    name: str,
    default_ttl: int = DEFAULT_TTL,
    backend: str = DEFAULT_BACKEND,
    namespace: str = "",
    logger: Optional[Any] = None,
) -> CacheService:
    """Create a new CacheService instance.

    Args:
        name: Cache instance name
        default_ttl: Default TTL in seconds
        backend: Backend type
        namespace: Key namespace prefix
        logger: Custom logger instance

    Returns:
        CacheService instance
    """
    return CacheService(
        name=name,
        default_ttl=default_ttl,
        backend=backend,
        namespace=namespace,
        logger=logger,
    )


__all__ = ["CacheService", "create_cache_service"]
