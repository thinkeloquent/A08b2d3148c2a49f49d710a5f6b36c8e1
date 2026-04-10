"""
Cache Types for fetch_httpx

Core interfaces for the caching middleware.
"""

from __future__ import annotations

import time
from abc import ABC, abstractmethod
from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any, Generic, TypeVar

T = TypeVar("T")


# Cache key strategy type
CacheKeyStrategy = Callable[
    [str, str, dict[str, str] | None, Any, dict[str, Any] | None],  # method, url, headers, body, params
    str,
]


@dataclass
class CacheEntryMetadata:
    """Metadata stored with each cache entry."""

    status_code: int
    headers: dict[str, str]
    url: str
    method: str
    content_type: str | None = None
    size: int | None = None


@dataclass
class CacheEntry(Generic[T]):
    """Cache entry structure."""

    key: str
    data: T
    created_at: float
    expires_at: float
    metadata: CacheEntryMetadata

    @property
    def is_expired(self) -> bool:
        """Check if entry has expired."""
        return time.time() > self.expires_at

    @property
    def ttl_remaining(self) -> float:
        """Get remaining TTL in seconds."""
        return max(0, self.expires_at - time.time())


@dataclass
class CacheStats:
    """Cache statistics."""

    size: int = 0
    hits: int = 0
    misses: int = 0
    evictions: int = 0


class CacheStorage(ABC, Generic[T]):
    """
    Abstract cache storage interface.

    Implement this for custom backends (Redis, file, etc.)

    Example:
        class RedisStorage(CacheStorage):
            async def get(self, key: str) -> CacheEntry | None:
                ...
            async def set(self, key: str, entry: CacheEntry) -> None:
                ...
    """

    @abstractmethod
    async def get(self, key: str) -> CacheEntry[T] | None:
        """Get an entry by key."""
        ...

    @abstractmethod
    async def set(self, key: str, entry: CacheEntry[T]) -> None:
        """Set an entry."""
        ...

    @abstractmethod
    async def has(self, key: str) -> bool:
        """Check if key exists and is not expired."""
        ...

    @abstractmethod
    async def delete(self, key: str) -> bool:
        """Delete a single key."""
        ...

    @abstractmethod
    async def delete_pattern(self, pattern: str) -> int:
        """Delete keys matching a pattern (glob-style)."""
        ...

    @abstractmethod
    async def clear(self) -> None:
        """Clear all entries."""
        ...

    @abstractmethod
    async def keys(self, pattern: str | None = None) -> list[str]:
        """Get all keys, optionally matching pattern."""
        ...

    @abstractmethod
    async def stats(self) -> CacheStats:
        """Get storage statistics."""
        ...

    @abstractmethod
    async def close(self) -> None:
        """Close/cleanup storage."""
        ...


@dataclass
class CacheConfig:
    """Cache configuration options."""

    ttl: float = 60.0  # Default TTL in seconds
    storage: CacheStorage | None = None
    key_strategy: CacheKeyStrategy | None = None
    methods: list[str] = field(default_factory=lambda: ["GET", "HEAD"])
    max_entries: int = 1000
    stale_while_revalidate: bool = False
    stale_grace_period: float = 30.0


@dataclass
class RequestCacheOptions:
    """Per-request cache options."""

    ttl: float | None = None
    no_cache: bool = False
    force_refresh: bool = False
    cache_key: str | None = None
