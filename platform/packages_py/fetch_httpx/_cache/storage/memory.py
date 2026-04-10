"""
In-Memory Cache Storage

Default storage backend using dict with TTL support and automatic cleanup.
"""

from __future__ import annotations

import asyncio
import fnmatch
import time
from typing import TypeVar

from ..types import CacheEntry, CacheStats, CacheStorage

T = TypeVar("T")


class MemoryStorage(CacheStorage[T]):
    """
    In-memory cache storage with TTL support.

    Features:
    - Automatic expired entry cleanup
    - LRU-style eviction when at capacity
    - Pattern matching for bulk deletion

    Example:
        storage = MemoryStorage(max_entries=500)

        await storage.set('key', entry)
        cached = await storage.get('key')

        await storage.delete_pattern('user:*')
        await storage.close()
    """

    def __init__(
        self,
        *,
        max_entries: int = 1000,
        cleanup_interval: float = 60.0,
    ) -> None:
        self._cache: dict[str, CacheEntry[T]] = {}
        self._max_entries = max_entries
        self._cleanup_interval = cleanup_interval
        self._stats = CacheStats()
        self._cleanup_task: asyncio.Task | None = None
        self._closed = False

    async def _start_cleanup(self) -> None:
        """Start the background cleanup task."""
        if self._cleanup_task is None and not self._closed:
            self._cleanup_task = asyncio.create_task(self._cleanup_loop())

    async def _cleanup_loop(self) -> None:
        """Background cleanup loop."""
        while not self._closed:
            await asyncio.sleep(self._cleanup_interval)
            self._cleanup_expired()

    def _cleanup_expired(self) -> None:
        """Remove expired entries."""
        now = time.time()
        expired_keys = [key for key, entry in self._cache.items() if now > entry.expires_at]
        for key in expired_keys:
            del self._cache[key]
            self._stats.evictions += 1

        if expired_keys:
            self._stats.size = len(self._cache)

    def _evict_oldest(self) -> None:
        """Evict the oldest entry when at capacity."""
        if not self._cache:
            return

        oldest_key = min(self._cache.keys(), key=lambda k: self._cache[k].created_at)
        del self._cache[oldest_key]
        self._stats.evictions += 1

    async def get(self, key: str) -> CacheEntry[T] | None:
        await self._start_cleanup()

        entry = self._cache.get(key)

        if entry is None:
            self._stats.misses += 1
            return None

        if entry.is_expired:
            del self._cache[key]
            self._stats.misses += 1
            self._stats.evictions += 1
            self._stats.size = len(self._cache)
            return None

        self._stats.hits += 1
        return entry

    async def set(self, key: str, entry: CacheEntry[T]) -> None:
        await self._start_cleanup()

        # Evict if at capacity
        if len(self._cache) >= self._max_entries and key not in self._cache:
            self._evict_oldest()

        self._cache[key] = entry
        self._stats.size = len(self._cache)

    async def has(self, key: str) -> bool:
        entry = await self.get(key)
        return entry is not None

    async def delete(self, key: str) -> bool:
        if key in self._cache:
            del self._cache[key]
            self._stats.size = len(self._cache)
            return True
        return False

    async def delete_pattern(self, pattern: str) -> int:
        """Delete keys matching glob pattern."""
        keys_to_delete = [key for key in self._cache.keys() if fnmatch.fnmatch(key, pattern)]
        for key in keys_to_delete:
            del self._cache[key]

        self._stats.size = len(self._cache)
        return len(keys_to_delete)

    async def clear(self) -> None:
        self._cache.clear()
        self._stats.size = 0

    async def keys(self, pattern: str | None = None) -> list[str]:
        all_keys = list(self._cache.keys())
        if pattern is None:
            return all_keys
        return [k for k in all_keys if fnmatch.fnmatch(k, pattern)]

    async def stats(self) -> CacheStats:
        return CacheStats(
            size=self._stats.size,
            hits=self._stats.hits,
            misses=self._stats.misses,
            evictions=self._stats.evictions,
        )

    async def close(self) -> None:
        self._closed = True
        if self._cleanup_task:
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass
        self._cache.clear()
