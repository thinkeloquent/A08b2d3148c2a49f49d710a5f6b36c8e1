"""
JSON Redis Storage - Redis-based JSON storage with size limits and eviction policies.

This package provides a high-level interface for storing JSON data in Redis with:
- Size limits (by entry count or memory usage)
- TTL (time-to-live) for automatic expiration
- Multiple eviction policies (FIFO, LRU, LFU)
- Rotation mode for log/token storage
- Key prefix namespacing
"""

from .storage import (
    ErrorRecord,
    EvictionPolicy,
    JsonRedisStorage,
    JsonRedisStorageConnectionError,
    JsonRedisStorageError,
    JsonRedisStorageReadError,
    JsonRedisStorageSerializationError,
    JsonRedisStorageWriteError,
    RedisClientProtocol,
    StorageEntry,
    StorageLimits,
    StorageStats,
)

__all__ = [
    # Main class
    "JsonRedisStorage",
    # Protocol
    "RedisClientProtocol",
    # Enums
    "EvictionPolicy",
    # Data classes
    "ErrorRecord",
    "StorageEntry",
    "StorageStats",
    "StorageLimits",
    # Exceptions
    "JsonRedisStorageError",
    "JsonRedisStorageReadError",
    "JsonRedisStorageWriteError",
    "JsonRedisStorageSerializationError",
    "JsonRedisStorageConnectionError",
]

__version__ = "1.0.0"
