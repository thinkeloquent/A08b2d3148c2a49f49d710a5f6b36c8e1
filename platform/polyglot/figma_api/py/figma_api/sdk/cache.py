"""
Cache Module — Figma API SDK

LRU request cache for GET requests.
max_size=100, ttl=300 seconds.
"""

import time
from collections import OrderedDict
from dataclasses import dataclass, field
from typing import Any, Optional

from ..logger import create_logger

log = create_logger("figma-api", __file__)


@dataclass
class CacheStats:
    hits: int = 0
    misses: int = 0
    size: int = 0


class RequestCache:
    """LRU cache with TTL expiration for GET request responses."""

    def __init__(self, max_size: int = 100, ttl: int = 300):
        self.max_size = max_size
        self.ttl = ttl  # seconds
        self._cache: OrderedDict[str, dict] = OrderedDict()
        self._hits = 0
        self._misses = 0

    def _is_expired(self, entry: dict) -> bool:
        return (time.time() - entry["timestamp"]) > self.ttl

    def _evict_if_needed(self) -> None:
        if len(self._cache) >= self.max_size:
            key, _ = self._cache.popitem(last=False)
            log.debug("cache evicted oldest entry", key=key)

    def get(self, key: str) -> Optional[Any]:
        entry = self._cache.get(key)
        if entry is None:
            self._misses += 1
            return None

        if self._is_expired(entry):
            del self._cache[key]
            self._misses += 1
            log.debug("cache entry expired", key=key)
            return None

        # Move to end for LRU
        self._cache.move_to_end(key)
        self._hits += 1
        return entry["data"]

    def set(self, key: str, data: Any) -> None:
        if key in self._cache:
            del self._cache[key]
        self._evict_if_needed()
        self._cache[key] = {"data": data, "timestamp": time.time()}

    def has(self, key: str) -> bool:
        entry = self._cache.get(key)
        if entry is None:
            return False
        if self._is_expired(entry):
            del self._cache[key]
            return False
        return True

    def clear(self) -> None:
        self._cache.clear()
        log.debug("cache cleared")

    @property
    def stats(self) -> CacheStats:
        return CacheStats(hits=self._hits, misses=self._misses, size=len(self._cache))
