"""
In-memory backend for server_provider_cache.

Provides a simple dict-based storage with TTL support via lazy expiration.
Suitable for single-process applications.

Note: Data is NOT shared across worker processes or instances.
"""

import asyncio
import time
from typing import Any, Optional
from dataclasses import dataclass

from ..logger import create as create_logger

logger = create_logger("server_provider_cache", __name__)


@dataclass
class CacheEntry:
    """Cache entry with value and expiration timestamp."""

    value: Any
    expires: float  # Unix timestamp in seconds, 0 = no expiration
    timer_task: Optional[asyncio.Task[None]] = None


class MemoryBackend:
    """In-memory cache backend using dict with TTL support."""

    def __init__(self, name: str = "memory"):
        self._store: dict[str, CacheEntry] = {}
        self._name = name

    async def get(self, key: str) -> Any | None:
        """Get a value from the cache.

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found/expired
        """
        entry = self._store.get(key)

        if entry is None:
            return None

        # Check if expired (lazy expiration)
        if entry.expires > 0 and time.time() > entry.expires:
            await self.delete(key)
            return None

        return entry.value

    async def set(self, key: str, value: Any, ttl_ms: int) -> None:
        """Set a value in the cache with TTL.

        Args:
            key: Cache key
            value: Value to cache
            ttl_ms: Time-to-live in milliseconds
        """
        # Cancel existing timer if overwriting
        existing = self._store.get(key)
        if existing and existing.timer_task:
            existing.timer_task.cancel()

        expires = time.time() + (ttl_ms / 1000) if ttl_ms > 0 else 0.0

        # Set up expiration timer
        timer_task: Optional[asyncio.Task[None]] = None
        if ttl_ms > 0:

            async def expire_key() -> None:
                await asyncio.sleep(ttl_ms / 1000)
                if key in self._store:
                    del self._store[key]
                    logger.debug(f"key expired: {key}")

            timer_task = asyncio.create_task(expire_key())

        self._store[key] = CacheEntry(value=value, expires=expires, timer_task=timer_task)

    async def delete(self, key: str) -> None:
        """Delete a key from the cache.

        Args:
            key: Cache key
        """
        entry = self._store.get(key)
        if entry and entry.timer_task:
            entry.timer_task.cancel()
        if key in self._store:
            del self._store[key]

    async def clear(self) -> None:
        """Clear all entries from the cache."""
        # Cancel all timers
        for entry in self._store.values():
            if entry.timer_task:
                entry.timer_task.cancel()
        self._store.clear()

    async def keys(self) -> list[str]:
        """Get all keys in the cache.

        Returns:
            List of cache keys
        """
        return list(self._store.keys())

    async def size(self) -> int:
        """Get the number of entries in the cache.

        Returns:
            Number of entries
        """
        return len(self._store)

    async def connect(self) -> None:
        """Optional connect method (no-op for memory backend)."""
        logger.debug("Memory backend ready (no connection needed)")

    async def disconnect(self) -> None:
        """Optional disconnect method - clears all data."""
        await self.clear()
        logger.debug("Memory backend disconnected")


def create_memory_backend(name: str = "memory") -> MemoryBackend:
    """Create a new MemoryBackend instance.

    Args:
        name: Backend name for logging

    Returns:
        MemoryBackend instance
    """
    return MemoryBackend(name)


__all__ = ["MemoryBackend", "create_memory_backend", "CacheEntry"]
