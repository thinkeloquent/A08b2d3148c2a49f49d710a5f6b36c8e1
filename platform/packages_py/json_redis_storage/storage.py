"""
Redis-based JSON storage with size limits, TTL, and configurable eviction policies.

This module provides a Redis-backed storage system with features including:
- Configurable size limits (by count or memory)
- TTL (time-to-live) support for automatic expiration
- Multiple eviction policies (FIFO, LRU, LFU)
- Rotation mode for log/token storage
- Key prefix/namespace support
- Comprehensive error handling and diagnostics
"""

from __future__ import annotations

import hashlib
import json
import logging
import time
import traceback
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Any, Protocol, runtime_checkable

if TYPE_CHECKING:
    pass

logger = logging.getLogger("json_redis_storage")


# =============================================================================
# Enums
# =============================================================================


class EvictionPolicy(Enum):
    """Eviction policy when storage limits are reached."""

    FIFO = "fifo"  # First In First Out (default)
    LRU = "lru"  # Least Recently Used
    LFU = "lfu"  # Least Frequently Used


# =============================================================================
# Protocols for Redis Client
# =============================================================================


@runtime_checkable
class RedisClientProtocol(Protocol):
    """Protocol for async Redis client operations."""

    async def get(self, key: str) -> bytes | str | None: ...
    async def set(
        self,
        key: str,
        value: str | bytes,
        ex: int | None = None,
        px: int | None = None,
        nx: bool = False,
        xx: bool = False,
    ) -> bool | None: ...
    async def delete(self, *keys: str) -> int: ...
    async def exists(self, *keys: str) -> int: ...
    async def keys(self, pattern: str) -> list[bytes] | list[str]: ...
    async def ttl(self, key: str) -> int: ...
    async def expire(self, key: str, seconds: int) -> bool: ...
    async def incr(self, key: str) -> int: ...
    async def incrby(self, key: str, amount: int) -> int: ...
    async def memory_usage(self, key: str) -> int | None: ...
    async def scan(
        self,
        cursor: int = 0,
        match: str | None = None,
        count: int | None = None,
    ) -> tuple[int, list[bytes] | list[str]]: ...


# =============================================================================
# Data Classes
# =============================================================================


@dataclass
class ErrorRecord:
    """Record of an error that occurred during a storage operation."""

    timestamp: str
    operation: str
    error_type: str
    error_message: str
    traceback: str
    key: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert error record to dictionary."""
        return {
            "timestamp": self.timestamp,
            "operation": self.operation,
            "error_type": self.error_type,
            "error_message": self.error_message,
            "traceback": self.traceback,
            "key": self.key,
        }


@dataclass
class StorageEntry:
    """Wrapper for stored data with metadata."""

    key: str
    data: dict[str, Any]
    created_at: float
    expires_at: float | None = None
    access_count: int = 0
    last_accessed_at: float | None = None

    @property
    def is_expired(self) -> bool:
        """Check if entry has expired."""
        if self.expires_at is None:
            return False
        return time.time() > self.expires_at

    @property
    def ttl_remaining(self) -> float | None:
        """Get remaining TTL in seconds, or None if no expiration."""
        if self.expires_at is None:
            return None
        remaining = self.expires_at - time.time()
        return max(0.0, remaining)


@dataclass
class StorageStats:
    """Statistics for storage operations."""

    saves: int = 0
    loads: int = 0
    hits: int = 0
    misses: int = 0
    deletes: int = 0
    evictions: int = 0
    rotations: int = 0


@dataclass
class StorageLimits:
    """Configuration for storage limits."""

    max_entries: int | None = None
    max_memory_bytes: int | None = None
    rotation_size: int | None = None  # For rotation mode: keep last N entries


# =============================================================================
# Exceptions
# =============================================================================


class JsonRedisStorageError(Exception):
    """Base exception for all JSON Redis storage errors."""

    def __init__(
        self,
        message: str = "",
        operation: str | None = None,
        key: str | None = None,
        original_error: BaseException | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.operation = operation
        self.key = key
        self.original_error = original_error
        self.traceback_str = traceback.format_exc()

    def __str__(self) -> str:
        return self.message


class JsonRedisStorageReadError(JsonRedisStorageError):
    """Error reading from Redis storage."""

    pass


class JsonRedisStorageWriteError(JsonRedisStorageError):
    """Error writing to Redis storage."""

    pass


class JsonRedisStorageSerializationError(JsonRedisStorageError):
    """Error serializing or deserializing JSON data."""

    pass


class JsonRedisStorageConnectionError(JsonRedisStorageError):
    """Error connecting to Redis."""

    pass


# =============================================================================
# Main Storage Class
# =============================================================================


class JsonRedisStorage:
    """
    Redis-based JSON storage with size limits and eviction policies.

    This class provides a high-level interface for storing JSON data in Redis
    with support for:
    - Size limits (by entry count or memory usage)
    - TTL (time-to-live) for automatic expiration
    - Multiple eviction policies (FIFO, LRU, LFU)
    - Rotation mode for log/token storage
    - Key prefix namespacing

    Args:
        redis_client: Async Redis client instance (shared across packages)
        key_prefix: Prefix for all Redis keys (default: "jrs:")
        hash_keys: Keys to use for generating storage keys from data
        ttl: Default TTL in seconds for stored entries
        eviction_policy: Policy for evicting entries when limits reached (default: FIFO)
        max_entries: Maximum number of entries to store
        max_memory_bytes: Maximum memory usage in bytes
        rotation_size: For rotation mode, keep only last N entries
        debug: Enable debug logging
        max_error_history: Maximum number of errors to retain

    Example:
        ```python
        import redis.asyncio as redis

        client = redis.Redis(host='localhost', port=6379)
        storage = JsonRedisStorage(
            redis_client=client,
            key_prefix="myapp:cache:",
            max_entries=1000,
            ttl=3600,
        )

        # Save data
        key = await storage.save({"user_id": "123", "action": "login"})

        # Load data
        data = await storage.load({"user_id": "123", "action": "login"})
        ```
    """

    def __init__(
        self,
        redis_client: RedisClientProtocol,
        key_prefix: str = "jrs:",
        hash_keys: list[str] | None = None,
        ttl: float | None = None,
        eviction_policy: EvictionPolicy = EvictionPolicy.FIFO,
        max_entries: int | None = None,
        max_memory_bytes: int | None = None,
        rotation_size: int | None = None,
        debug: bool = False,
        max_error_history: int = 100,
    ) -> None:
        self._client = redis_client
        self._key_prefix = key_prefix
        self._hash_keys = hash_keys or []
        self._ttl = ttl
        self._eviction_policy = eviction_policy
        self._limits = StorageLimits(
            max_entries=max_entries,
            max_memory_bytes=max_memory_bytes,
            rotation_size=rotation_size,
        )
        self._debug = debug
        self._max_error_history = max_error_history

        self._error_history: list[ErrorRecord] = []
        self._last_error: ErrorRecord | None = None
        self._stats = StorageStats()
        self._closed = False

        # Internal keys for metadata
        self._meta_key = f"{key_prefix}_meta"
        self._order_key = f"{key_prefix}_order"  # For FIFO ordering
        self._access_key = f"{key_prefix}_access"  # For LRU tracking
        self._freq_key = f"{key_prefix}_freq"  # For LFU tracking

        if debug:
            logging.basicConfig(level=logging.DEBUG)
            logger.setLevel(logging.DEBUG)

        logger.info(
            "JsonRedisStorage initialized",
            extra={
                "key_prefix": key_prefix,
                "eviction_policy": eviction_policy.value,
                "max_entries": max_entries,
                "max_memory_bytes": max_memory_bytes,
            },
        )

    # -------------------------------------------------------------------------
    # Key Generation
    # -------------------------------------------------------------------------

    def generate_key(self, data: dict[str, Any]) -> str:
        """
        Generate a storage key from data.

        If hash_keys is specified, only those keys are used in order.
        Otherwise, all keys are used sorted alphabetically.

        Args:
            data: Dictionary to generate key from

        Returns:
            Generated key string (pipe-separated key:value pairs)
        """
        if self._hash_keys:
            parts = [f"{k}:{data.get(k, '')}" for k in self._hash_keys]
        else:
            parts = [f"{k}:{data.get(k, '')}" for k in sorted(data.keys())]

        key = "|".join(parts)
        logger.debug(f"Generated key: {key}")
        return key

    def _key_to_redis_key(self, key: str) -> str:
        """Convert a storage key to a Redis key with prefix and hash."""
        key_hash = hashlib.sha256(key.encode()).hexdigest()[:16]
        return f"{self._key_prefix}{key_hash}"

    # -------------------------------------------------------------------------
    # Error Handling
    # -------------------------------------------------------------------------

    def _record_error(
        self,
        error: BaseException,
        operation: str,
        key: str | None = None,
    ) -> ErrorRecord:
        """Record an error in the error history."""
        record = ErrorRecord(
            timestamp=datetime.now().isoformat(),
            operation=operation,
            error_type=type(error).__name__,
            error_message=str(error),
            traceback=traceback.format_exc(),
            key=key,
        )

        self._error_history.append(record)
        self._last_error = record

        # Trim history if needed
        if len(self._error_history) > self._max_error_history:
            self._error_history = self._error_history[-self._max_error_history :]

        logger.error(f"Error in {operation}: {error}", extra={"key": key})
        return record

    def get_errors(self) -> list[dict[str, Any]]:
        """Get all error records as dictionaries."""
        return [e.to_dict() for e in self._error_history]

    def get_last_error(self) -> dict[str, Any] | None:
        """Get the last error record as a dictionary."""
        return self._last_error.to_dict() if self._last_error else None

    def clear_errors(self) -> None:
        """Clear all error records."""
        self._error_history.clear()
        self._last_error = None

    # -------------------------------------------------------------------------
    # Eviction Logic
    # -------------------------------------------------------------------------

    async def _get_entry_count(self) -> int:
        """Get current number of stored entries."""
        pattern = f"{self._key_prefix}*"
        count = 0
        cursor = 0

        while True:
            cursor, keys = await self._client.scan(cursor, match=pattern, count=100)
            # Exclude metadata keys
            count += sum(
                1
                for k in keys
                if not self._is_metadata_key(k.decode() if isinstance(k, bytes) else k)
            )
            if cursor == 0:
                break

        return count

    def _is_metadata_key(self, key: str) -> bool:
        """Check if a key is an internal metadata key."""
        return key in (self._meta_key, self._order_key, self._access_key, self._freq_key)

    async def _get_total_memory(self) -> int:
        """Get total memory usage of stored entries."""
        pattern = f"{self._key_prefix}*"
        total = 0
        cursor = 0

        while True:
            cursor, keys = await self._client.scan(cursor, match=pattern, count=100)
            for key in keys:
                key_str = key.decode() if isinstance(key, bytes) else key
                if not self._is_metadata_key(key_str):
                    mem = await self._client.memory_usage(key_str)
                    if mem:
                        total += mem
            if cursor == 0:
                break

        return total

    async def _should_evict(self) -> bool:
        """Check if eviction is needed based on limits."""
        if self._limits.max_entries is not None:
            count = await self._get_entry_count()
            if count >= self._limits.max_entries:
                return True

        if self._limits.max_memory_bytes is not None:
            memory = await self._get_total_memory()
            if memory >= self._limits.max_memory_bytes:
                return True

        return False

    async def _evict_one(self) -> bool:
        """Evict one entry based on the eviction policy."""
        key_to_evict: str | None = None

        if self._eviction_policy == EvictionPolicy.FIFO:
            # Get oldest entry from order list
            order_data = await self._client.get(self._order_key)
            if order_data:
                order_str = order_data.decode() if isinstance(order_data, bytes) else order_data
                order_list: list[str] = json.loads(order_str)
                if order_list:
                    key_to_evict = order_list[0]

        elif self._eviction_policy == EvictionPolicy.LRU:
            # Find least recently accessed
            access_data = await self._client.get(self._access_key)
            if access_data:
                access_str = access_data.decode() if isinstance(access_data, bytes) else access_data
                access_times: dict[str, float] = json.loads(access_str)
                if access_times:
                    key_to_evict = min(access_times, key=lambda k: access_times[k])

        elif self._eviction_policy == EvictionPolicy.LFU:
            # Find least frequently used
            freq_data = await self._client.get(self._freq_key)
            if freq_data:
                freq_str = freq_data.decode() if isinstance(freq_data, bytes) else freq_data
                frequencies: dict[str, int] = json.loads(freq_str)
                if frequencies:
                    key_to_evict = min(frequencies, key=lambda k: frequencies[k])

        if key_to_evict:
            await self._delete_internal(key_to_evict, is_eviction=True)
            self._stats.evictions += 1
            logger.debug(f"Evicted key: {key_to_evict}")
            return True

        return False

    async def _evict_until_within_limits(self) -> int:
        """Evict entries until within limits. Returns count of evicted entries."""
        evicted = 0
        while await self._should_evict():
            if await self._evict_one():
                evicted += 1
            else:
                break  # No more entries to evict
        return evicted

    # -------------------------------------------------------------------------
    # Metadata Management
    # -------------------------------------------------------------------------

    async def _add_to_order(self, redis_key: str) -> None:
        """Add key to FIFO order list."""
        order_data = await self._client.get(self._order_key)
        if order_data:
            order_str = order_data.decode() if isinstance(order_data, bytes) else order_data
            order_list: list[str] = json.loads(order_str)
        else:
            order_list = []

        if redis_key not in order_list:
            order_list.append(redis_key)
            await self._client.set(self._order_key, json.dumps(order_list))

    async def _remove_from_order(self, redis_key: str) -> None:
        """Remove key from FIFO order list."""
        order_data = await self._client.get(self._order_key)
        if order_data:
            order_str = order_data.decode() if isinstance(order_data, bytes) else order_data
            order_list: list[str] = json.loads(order_str)
            if redis_key in order_list:
                order_list.remove(redis_key)
                await self._client.set(self._order_key, json.dumps(order_list))

    async def _update_access_time(self, redis_key: str) -> None:
        """Update LRU access time for key."""
        access_data = await self._client.get(self._access_key)
        if access_data:
            access_str = access_data.decode() if isinstance(access_data, bytes) else access_data
            access_times: dict[str, float] = json.loads(access_str)
        else:
            access_times = {}

        access_times[redis_key] = time.time()
        await self._client.set(self._access_key, json.dumps(access_times))

    async def _remove_access_time(self, redis_key: str) -> None:
        """Remove key from LRU tracking."""
        access_data = await self._client.get(self._access_key)
        if access_data:
            access_str = access_data.decode() if isinstance(access_data, bytes) else access_data
            access_times: dict[str, float] = json.loads(access_str)
            if redis_key in access_times:
                del access_times[redis_key]
                await self._client.set(self._access_key, json.dumps(access_times))

    async def _increment_frequency(self, redis_key: str) -> None:
        """Increment LFU frequency counter for key."""
        freq_data = await self._client.get(self._freq_key)
        if freq_data:
            freq_str = freq_data.decode() if isinstance(freq_data, bytes) else freq_data
            frequencies: dict[str, int] = json.loads(freq_str)
        else:
            frequencies = {}

        frequencies[redis_key] = frequencies.get(redis_key, 0) + 1
        await self._client.set(self._freq_key, json.dumps(frequencies))

    async def _remove_frequency(self, redis_key: str) -> None:
        """Remove key from LFU tracking."""
        freq_data = await self._client.get(self._freq_key)
        if freq_data:
            freq_str = freq_data.decode() if isinstance(freq_data, bytes) else freq_data
            frequencies: dict[str, int] = json.loads(freq_str)
            if redis_key in frequencies:
                del frequencies[redis_key]
                await self._client.set(self._freq_key, json.dumps(frequencies))

    # -------------------------------------------------------------------------
    # Core Operations
    # -------------------------------------------------------------------------

    async def save(
        self,
        data: dict[str, Any],
        ttl: float | None = None,
        custom_key: str | None = None,
    ) -> str:
        """
        Save JSON data to Redis.

        Args:
            data: Dictionary to store
            ttl: TTL in seconds (overrides default)
            custom_key: Custom key to use instead of generating from data

        Returns:
            The storage key used

        Raises:
            JsonRedisStorageWriteError: If write fails
            JsonRedisStorageSerializationError: If JSON serialization fails
        """
        if self._closed:
            raise JsonRedisStorageError("Storage is closed", operation="save")

        key = custom_key or self.generate_key(data)
        redis_key = self._key_to_redis_key(key)
        effective_ttl = ttl if ttl is not None else self._ttl

        try:
            # Evict if needed before saving
            await self._evict_until_within_limits()

            # Handle rotation mode
            if self._limits.rotation_size is not None:
                count = await self._get_entry_count()
                while count >= self._limits.rotation_size:
                    if await self._evict_one():
                        self._stats.rotations += 1
                        count -= 1
                    else:
                        break

            # Create entry
            now = time.time()
            entry = StorageEntry(
                key=key,
                data=data,
                created_at=now,
                expires_at=(now + effective_ttl) if effective_ttl else None,
                access_count=0,
                last_accessed_at=now,
            )

            # Serialize
            try:
                entry_dict = {
                    "key": entry.key,
                    "data": entry.data,
                    "created_at": entry.created_at,
                    "expires_at": entry.expires_at,
                    "access_count": entry.access_count,
                    "last_accessed_at": entry.last_accessed_at,
                }
                json_data = json.dumps(entry_dict)
            except (TypeError, ValueError) as e:
                self._record_error(e, "save", key)
                raise JsonRedisStorageSerializationError(
                    f"Failed to serialize data: {e}",
                    operation="save",
                    key=key,
                    original_error=e,
                ) from e

            # Save to Redis
            ttl_seconds = int(effective_ttl) if effective_ttl else None
            await self._client.set(redis_key, json_data, ex=ttl_seconds)

            # Update metadata for eviction tracking
            await self._add_to_order(redis_key)
            await self._update_access_time(redis_key)
            await self._increment_frequency(redis_key)

            self._stats.saves += 1
            logger.debug(f"Saved key: {key} -> {redis_key}")
            return key

        except JsonRedisStorageError:
            raise
        except Exception as e:
            self._record_error(e, "save", key)
            raise JsonRedisStorageWriteError(
                f"Failed to save data: {e}",
                operation="save",
                key=key,
                original_error=e,
            ) from e

    async def load(
        self,
        data_or_key: dict[str, Any] | str,
        ignore_expiry: bool = False,
    ) -> dict[str, Any] | None:
        """
        Load JSON data from Redis.

        Args:
            data_or_key: Dictionary to generate key from, or key string directly
            ignore_expiry: If True, return data even if expired

        Returns:
            Stored data dictionary, or None if not found/expired

        Raises:
            JsonRedisStorageReadError: If read fails
            JsonRedisStorageSerializationError: If JSON deserialization fails
        """
        if self._closed:
            raise JsonRedisStorageError("Storage is closed", operation="load")

        key = data_or_key if isinstance(data_or_key, str) else self.generate_key(data_or_key)
        redis_key = self._key_to_redis_key(key)

        try:
            self._stats.loads += 1

            # Get from Redis
            raw_data = await self._client.get(redis_key)
            if raw_data is None:
                self._stats.misses += 1
                logger.debug(f"Key not found: {key}")
                return None

            # Deserialize
            try:
                data_str = raw_data.decode() if isinstance(raw_data, bytes) else raw_data
                entry_dict = json.loads(data_str)
            except (json.JSONDecodeError, UnicodeDecodeError) as e:
                self._record_error(e, "load", key)
                raise JsonRedisStorageSerializationError(
                    f"Failed to deserialize data: {e}",
                    operation="load",
                    key=key,
                    original_error=e,
                ) from e

            # Check expiration (backup check - Redis TTL should handle this)
            expires_at = entry_dict.get("expires_at")
            if expires_at and not ignore_expiry and time.time() > expires_at:
                await self.delete(key)
                self._stats.misses += 1
                logger.debug(f"Key expired: {key}")
                return None

            # Update access tracking for LRU/LFU
            await self._update_access_time(redis_key)
            await self._increment_frequency(redis_key)

            self._stats.hits += 1
            logger.debug(f"Loaded key: {key}")
            return entry_dict.get("data")

        except JsonRedisStorageError:
            raise
        except Exception as e:
            self._record_error(e, "load", key)
            raise JsonRedisStorageReadError(
                f"Failed to load data: {e}",
                operation="load",
                key=key,
                original_error=e,
            ) from e

    async def exists(self, data_or_key: dict[str, Any] | str) -> bool:
        """
        Check if an entry exists and is not expired.

        Args:
            data_or_key: Dictionary to generate key from, or key string directly

        Returns:
            True if entry exists and is not expired
        """
        return await self.load(data_or_key) is not None

    async def delete(self, data_or_key: dict[str, Any] | str) -> bool:
        """
        Delete an entry from storage.

        Args:
            data_or_key: Dictionary to generate key from, or key string directly

        Returns:
            True if entry was deleted, False if not found
        """
        key = data_or_key if isinstance(data_or_key, str) else self.generate_key(data_or_key)
        return await self._delete_internal(key, is_eviction=False)

    async def _delete_internal(self, key: str, is_eviction: bool = False) -> bool:
        """Internal delete method."""
        if self._closed:
            raise JsonRedisStorageError("Storage is closed", operation="delete")

        redis_key = self._key_to_redis_key(key)

        try:
            result = await self._client.delete(redis_key)

            if result > 0:
                # Clean up metadata
                await self._remove_from_order(redis_key)
                await self._remove_access_time(redis_key)
                await self._remove_frequency(redis_key)

                if not is_eviction:
                    self._stats.deletes += 1
                logger.debug(f"Deleted key: {key}")
                return True

            return False

        except Exception as e:
            self._record_error(e, "delete", key)
            raise JsonRedisStorageError(
                f"Failed to delete data: {e}",
                operation="delete",
                key=key,
                original_error=e,
            ) from e

    # -------------------------------------------------------------------------
    # Batch Operations
    # -------------------------------------------------------------------------

    async def clear(self) -> int:
        """
        Remove all entries from storage.

        Returns:
            Number of entries deleted
        """
        if self._closed:
            raise JsonRedisStorageError("Storage is closed", operation="clear")

        pattern = f"{self._key_prefix}*"
        deleted = 0
        cursor = 0

        try:
            while True:
                cursor, keys = await self._client.scan(cursor, match=pattern, count=100)
                if keys:
                    # Delete all keys including metadata
                    key_strs = [k.decode() if isinstance(k, bytes) else k for k in keys]
                    result = await self._client.delete(*key_strs)
                    deleted += result
                if cursor == 0:
                    break

            logger.info(f"Cleared {deleted} entries")
            return deleted

        except Exception as e:
            self._record_error(e, "clear")
            raise JsonRedisStorageError(
                f"Failed to clear storage: {e}",
                operation="clear",
                original_error=e,
            ) from e

    async def list_keys(self) -> list[str]:
        """
        List all stored keys.

        Returns:
            List of storage keys (not Redis keys)
        """
        if self._closed:
            raise JsonRedisStorageError("Storage is closed", operation="list_keys")

        pattern = f"{self._key_prefix}*"
        keys: list[str] = []
        cursor = 0

        try:
            while True:
                cursor, redis_keys = await self._client.scan(cursor, match=pattern, count=100)
                for redis_key in redis_keys:
                    key_str = redis_key.decode() if isinstance(redis_key, bytes) else redis_key
                    if self._is_metadata_key(key_str):
                        continue

                    # Read entry to get original key
                    raw_data = await self._client.get(key_str)
                    if raw_data:
                        try:
                            data_str = raw_data.decode() if isinstance(raw_data, bytes) else raw_data
                            entry = json.loads(data_str)
                            if "key" in entry:
                                keys.append(entry["key"])
                        except (json.JSONDecodeError, UnicodeDecodeError):
                            continue

                if cursor == 0:
                    break

            return keys

        except Exception as e:
            self._record_error(e, "list_keys")
            raise JsonRedisStorageError(
                f"Failed to list keys: {e}",
                operation="list_keys",
                original_error=e,
            ) from e

    async def cleanup_expired(self) -> int:
        """
        Remove all expired entries.

        Note: Redis handles TTL-based expiration automatically, but this
        method can clean up entries with soft expiration (expires_at field).

        Returns:
            Number of entries deleted
        """
        if self._closed:
            raise JsonRedisStorageError("Storage is closed", operation="cleanup_expired")

        pattern = f"{self._key_prefix}*"
        deleted = 0
        cursor = 0
        now = time.time()

        try:
            while True:
                cursor, redis_keys = await self._client.scan(cursor, match=pattern, count=100)
                for redis_key in redis_keys:
                    key_str = redis_key.decode() if isinstance(redis_key, bytes) else redis_key
                    if self._is_metadata_key(key_str):
                        continue

                    raw_data = await self._client.get(key_str)
                    if raw_data:
                        try:
                            data_str = raw_data.decode() if isinstance(raw_data, bytes) else raw_data
                            entry = json.loads(data_str)
                            expires_at = entry.get("expires_at")
                            if expires_at and now > expires_at and entry.get("key"):
                                await self._delete_internal(entry["key"], is_eviction=False)
                                deleted += 1
                        except (json.JSONDecodeError, UnicodeDecodeError):
                            continue

                if cursor == 0:
                    break

            logger.info(f"Cleaned up {deleted} expired entries")
            return deleted

        except Exception as e:
            self._record_error(e, "cleanup_expired")
            raise JsonRedisStorageError(
                f"Failed to cleanup expired entries: {e}",
                operation="cleanup_expired",
                original_error=e,
            ) from e

    # -------------------------------------------------------------------------
    # Lifecycle
    # -------------------------------------------------------------------------

    async def close(self) -> None:
        """Mark storage as closed."""
        self._closed = True
        logger.info("JsonRedisStorage closed")

    # -------------------------------------------------------------------------
    # Diagnostics
    # -------------------------------------------------------------------------

    async def debug_info(self) -> dict[str, Any]:
        """
        Get comprehensive debug information.

        Returns:
            Dictionary with storage state and statistics
        """
        entry_count = await self._get_entry_count()
        memory_usage = 0
        if self._limits.max_memory_bytes is not None:
            memory_usage = await self._get_total_memory()

        return {
            "key_prefix": self._key_prefix,
            "hash_keys": self._hash_keys,
            "ttl": self._ttl,
            "eviction_policy": self._eviction_policy.value,
            "limits": {
                "max_entries": self._limits.max_entries,
                "max_memory_bytes": self._limits.max_memory_bytes,
                "rotation_size": self._limits.rotation_size,
            },
            "entry_count": entry_count,
            "memory_usage_bytes": memory_usage,
            "stats": {
                "saves": self._stats.saves,
                "loads": self._stats.loads,
                "hits": self._stats.hits,
                "misses": self._stats.misses,
                "deletes": self._stats.deletes,
                "evictions": self._stats.evictions,
                "rotations": self._stats.rotations,
            },
            "error_count": len(self._error_history),
            "last_error": self.get_last_error(),
            "errors": self.get_errors()[-10:],
            "closed": self._closed,
        }
