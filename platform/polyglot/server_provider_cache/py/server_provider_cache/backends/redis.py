"""
Redis backend stub for server_provider_cache.

This is a placeholder for future Redis integration.
Currently raises NotImplementedError for all operations.

When implemented, this will support:
- Connection via REDIS_URL environment variable
- Key namespacing for multi-tenant isolation
- Native Redis TTL via SETEX/PSETEX
- Automatic reconnection
"""

from typing import Any, Optional

from ..logger import create as create_logger

logger = create_logger("server_provider_cache", __name__)


class RedisBackend:
    """Redis backend stub (not yet implemented)."""

    def __init__(
        self,
        name: str = "redis",
        url: Optional[str] = None,
        namespace: Optional[str] = None,
    ):
        """Initialize Redis backend stub.

        Args:
            name: Backend instance name
            url: Redis URL (default: uses REDIS_URL env var)
            namespace: Key namespace prefix
        """
        self._name = name
        self._url = url
        self._namespace = namespace
        self._connected = False
        logger.warn("RedisBackend is a stub - Redis support not yet implemented")

    async def get(self, key: str) -> Any | None:
        """Get a value from Redis.

        Args:
            key: Cache key

        Raises:
            NotImplementedError: Redis support not yet implemented
        """
        raise NotImplementedError("RedisBackend.get() not implemented - use MemoryBackend")

    async def set(self, key: str, value: Any, ttl_ms: int) -> None:
        """Set a value in Redis with TTL.

        Args:
            key: Cache key
            value: Value to cache
            ttl_ms: Time-to-live in milliseconds

        Raises:
            NotImplementedError: Redis support not yet implemented
        """
        raise NotImplementedError("RedisBackend.set() not implemented - use MemoryBackend")

    async def delete(self, key: str) -> None:
        """Delete a key from Redis.

        Args:
            key: Cache key

        Raises:
            NotImplementedError: Redis support not yet implemented
        """
        raise NotImplementedError("RedisBackend.delete() not implemented - use MemoryBackend")

    async def clear(self) -> None:
        """Clear all entries with the configured namespace.

        Raises:
            NotImplementedError: Redis support not yet implemented
        """
        raise NotImplementedError("RedisBackend.clear() not implemented - use MemoryBackend")

    async def keys(self) -> list[str]:
        """Get all keys matching the namespace pattern.

        Raises:
            NotImplementedError: Redis support not yet implemented
        """
        raise NotImplementedError("RedisBackend.keys() not implemented - use MemoryBackend")

    async def size(self) -> int:
        """Get the number of keys in the namespace.

        Raises:
            NotImplementedError: Redis support not yet implemented
        """
        raise NotImplementedError("RedisBackend.size() not implemented - use MemoryBackend")

    async def connect(self) -> None:
        """Connect to Redis.

        Raises:
            NotImplementedError: Redis support not yet implemented
        """
        raise NotImplementedError("RedisBackend.connect() not implemented - use MemoryBackend")

    async def disconnect(self) -> None:
        """Disconnect from Redis."""
        self._connected = False
        logger.debug("Redis backend disconnected (stub)")


def create_redis_backend(
    name: str = "redis",
    url: Optional[str] = None,
    namespace: Optional[str] = None,
) -> RedisBackend:
    """Create a new RedisBackend instance.

    Args:
        name: Backend name
        url: Redis URL
        namespace: Key namespace

    Returns:
        RedisBackend instance
    """
    return RedisBackend(name, url, namespace)


__all__ = ["RedisBackend", "create_redis_backend"]
