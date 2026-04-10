"""
JSON S3 Storage Implementation

Main storage class providing CRUD operations for JSON data in AWS S3.
"""

from __future__ import annotations

import asyncio
import json
import time
import traceback
from datetime import UTC, datetime, timezone
from typing import Any, TypeVar

from cache_json_awss3_storage.exceptions import (
    JsonS3StorageAuthError,
    JsonS3StorageClosedError,
    JsonS3StorageConfigError,
    JsonS3StorageError,
    JsonS3StorageReadError,
    JsonS3StorageSerializationError,
    JsonS3StorageWriteError,
)
from cache_json_awss3_storage.key_generator import generate_key
from cache_json_awss3_storage.logger import LoggerProtocol, NullLogger
from cache_json_awss3_storage.logger import create as create_logger
from cache_json_awss3_storage.models import (
    DebugInfo,
    EncryptionConfig,
    ErrorRecord,
    RetryConfig,
    S3ClientProtocol,
    StorageClass,
    StorageEntry,
    StorageStats,
)

T = TypeVar("T", bound=dict[str, Any])


class JsonS3Storage:
    """
    AWS S3-backed JSON storage with TTL support.

    Provides a unified interface for saving and loading JSON data to Amazon S3
    with automatic key generation, TTL expiration, and comprehensive logging.

    Example:
        async with create_storage(s3_client, bucket_name="my-bucket") as storage:
            key = await storage.save({"user_id": 123, "name": "Alice"})
            data = await storage.load(key)
    """

    def __init__(
        self,
        s3_client: S3ClientProtocol,
        bucket_name: str,
        *,
        key_prefix: str = "jss3:",
        hash_keys: list[str] | None = None,
        ttl: float | None = None,
        region: str | None = None,
        storage_class: StorageClass = StorageClass.STANDARD,
        encryption: EncryptionConfig | None = None,
        content_type: str = "application/json",
        retry_config: RetryConfig | None = None,
        debug: bool = False,
        max_error_history: int = 100,
        logger: LoggerProtocol | None = None,
    ) -> None:
        """
        Initialize the storage instance.

        Args:
            s3_client: AWS S3 client instance (aiobotocore or boto3)
            bucket_name: Target S3 bucket name
            key_prefix: Prefix for all object keys (default: "jss3:")
            hash_keys: Specific data fields to use for key generation
            ttl: Default TTL in seconds (None = no expiration)
            region: AWS region (uses client default if not specified)
            storage_class: S3 storage class (default: STANDARD)
            encryption: Server-side encryption configuration
            content_type: Content-Type header (default: "application/json")
            retry_config: Retry configuration for transient failures
            debug: Enable debug logging
            max_error_history: Maximum number of errors to retain
            logger: Custom logger instance (default: package logger)
        """
        if not bucket_name:
            raise JsonS3StorageConfigError("bucket_name is required")

        self._s3_client = s3_client
        self._bucket_name = bucket_name
        self._key_prefix = key_prefix
        self._hash_keys = hash_keys
        self._ttl = ttl
        self._region = region
        self._storage_class = storage_class
        self._encryption = encryption
        self._content_type = content_type
        self._retry_config = retry_config or RetryConfig()
        self._debug = debug
        self._max_error_history = max_error_history

        # Initialize logger
        if logger is None:
            self._logger = create_logger("cache_json_awss3_storage", __file__)
        elif debug is False and isinstance(logger, type(None)):
            self._logger = NullLogger()
        else:
            self._logger = logger

        # Initialize state
        self._stats = StorageStats()
        self._errors: list[ErrorRecord] = []
        self._closed = False

        self._logger.debug(
            f"Initialized storage: bucket={bucket_name}, prefix={key_prefix}, "
            f"ttl={ttl}, storage_class={storage_class.value}, debug={debug}"
        )

    def _build_s3_key(self, key: str) -> str:
        """Build full S3 object key from storage key."""
        return f"{self._key_prefix}{key}"

    def _check_closed(self, operation: str) -> None:
        """Check if storage is closed and raise if so."""
        if self._closed:
            raise JsonS3StorageClosedError(operation)

    def _record_error(
        self,
        operation: str,
        error: Exception,
        key: str | None = None,
    ) -> None:
        """Record an error to the error history."""
        s3_key = self._build_s3_key(key) if key else None
        record = ErrorRecord(
            timestamp=datetime.now(UTC).isoformat(timespec="milliseconds"),
            operation=operation,
            error_type=type(error).__name__,
            error_message=str(error),
            traceback=traceback.format_exc(),
            key=key,
            s3_key=s3_key,
        )

        self._errors.append(record)
        if len(self._errors) > self._max_error_history:
            self._errors.pop(0)  # FIFO eviction

        self._stats.errors += 1
        self._logger.warn(
            f"Error recorded: operation={operation}, type={record.error_type}, "
            f"key={key}"
        )

    async def _with_retry(
        self,
        operation: str,
        func: Any,
        *args: Any,
        **kwargs: Any,
    ) -> Any:
        """Execute a function with retry logic for transient failures."""
        last_error: Exception | None = None
        config = self._retry_config

        for attempt in range(config.max_retries + 1):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                last_error = e
                error_name = type(e).__name__

                # Check if retryable (5xx errors, timeouts, connection errors)
                is_retryable = any(
                    term in error_name.lower() or term in str(e).lower()
                    for term in ["timeout", "connection", "throttl", "5"]
                )

                if not is_retryable or attempt >= config.max_retries:
                    raise

                delay = config.calculate_delay(attempt)
                self._logger.warn(
                    f"Retry attempt {attempt + 1}/{config.max_retries} for {operation} "
                    f"after {delay:.2f}s: {error_name}"
                )
                await asyncio.sleep(delay)

        # Should not reach here, but just in case
        if last_error:
            raise last_error

    async def save(
        self,
        key: str,
        data: dict[str, Any],
        *,
        ttl: float | None = None,
    ) -> str:
        """
        Save JSON data to S3.

        Args:
            key: Storage key (use generate_key() to create from object)
            data: Dictionary of data to save
            ttl: Optional TTL override in seconds

        Returns:
            Storage key

        Raises:
            JsonS3StorageSerializationError: Data not JSON-serializable
            JsonS3StorageWriteError: S3 PUT operation failed
            JsonS3StorageAuthError: Access denied

        Example:
            # With custom key
            await storage.save("my-key", {"name": "Alice"})

            # With generated key from object
            key = generate_key({"user_id": 123, "action": "login"})
            await storage.save(key, {"name": "Alice"})
        """
        self._check_closed("save")

        start_time = time.time()
        s3_key = self._build_s3_key(key)

        self._logger.debug(f"save: key={key}, s3_key={s3_key}")

        # Calculate expiration
        effective_ttl = ttl if ttl is not None else self._ttl
        expires_at = time.time() + effective_ttl if effective_ttl else None

        # Build storage entry
        entry = StorageEntry(
            key=key,
            data=data,
            created_at=time.time(),
            expires_at=expires_at,
        )

        # Serialize to JSON
        try:
            body = json.dumps(entry.to_dict(), separators=(",", ":")).encode("utf-8")
        except (TypeError, ValueError) as e:
            self._record_error("save", e, key)
            raise JsonS3StorageSerializationError(
                f"Failed to serialize data: {e}",
                operation="save",
                key=key,
                s3_key=s3_key,
            ) from e

        # Build S3 parameters
        s3_params: dict[str, Any] = {
            "Bucket": self._bucket_name,
            "Key": s3_key,
            "Body": body,
            "ContentType": self._content_type,
            "StorageClass": self._storage_class.value,
        }

        # Add encryption if configured
        if self._encryption:
            s3_params.update(self._encryption.to_s3_params())

        # PUT to S3 with retry
        try:
            await self._with_retry(
                "save",
                self._s3_client.put_object,
                **s3_params,
            )
        except Exception as e:
            self._record_error("save", e, key)
            error_str = str(e).lower()

            if "accessdenied" in error_str or "403" in error_str:
                raise JsonS3StorageAuthError(
                    f"Access denied writing to S3: {e}",
                    operation="save",
                    key=key,
                    s3_key=s3_key,
                ) from e

            raise JsonS3StorageWriteError(
                f"Failed to write to S3: {e}",
                operation="save",
                key=key,
                s3_key=s3_key,
            ) from e

        self._stats.saves += 1
        elapsed = (time.time() - start_time) * 1000

        self._logger.info(f"save: completed key={key} in {elapsed:.1f}ms")
        return key

    async def load(
        self,
        key: str,
        *,
        ignore_expiry: bool = False,
    ) -> dict[str, Any] | None:
        """
        Load JSON data from S3.

        Args:
            key: Storage key (use generate_key() to create from object)
            ignore_expiry: If True, return data even if expired

        Returns:
            Stored data object or None if not found/expired

        Raises:
            JsonS3StorageReadError: S3 GET operation failed
            JsonS3StorageSerializationError: Invalid JSON in object

        Example:
            # With custom key
            data = await storage.load("my-key")

            # With generated key from object
            key = generate_key({"user_id": 123, "action": "login"})
            data = await storage.load(key)
        """
        self._check_closed("load")

        start_time = time.time()
        self._stats.loads += 1

        self._logger.debug(f"load: key={key}")
        s3_key = self._build_s3_key(key)

        # GET from S3
        try:
            response = await self._with_retry(
                "load",
                self._s3_client.get_object,
                Bucket=self._bucket_name,
                Key=s3_key,
            )
        except Exception as e:
            error_str = str(e).lower()

            # Handle not found
            if "nosuchkey" in error_str or "404" in error_str or "not found" in error_str:
                self._stats.misses += 1
                elapsed = (time.time() - start_time) * 1000
                self._logger.info(f"load: miss key={key} (not found) in {elapsed:.1f}ms")
                return None

            self._record_error("load", e, key)

            if "accessdenied" in error_str or "403" in error_str:
                raise JsonS3StorageAuthError(
                    f"Access denied reading from S3: {e}",
                    operation="load",
                    key=key,
                    s3_key=s3_key,
                ) from e

            raise JsonS3StorageReadError(
                f"Failed to read from S3: {e}",
                operation="load",
                key=key,
                s3_key=s3_key,
            ) from e

        # Read and parse response body
        try:
            body = response["Body"]
            if hasattr(body, "read"):
                content = await body.read()
            else:
                content = body

            entry_data = json.loads(content)
            entry = StorageEntry.from_dict(entry_data)
        except (json.JSONDecodeError, KeyError, TypeError) as e:
            self._record_error("load", e, key)
            raise JsonS3StorageSerializationError(
                f"Failed to deserialize data: {e}",
                operation="load",
                key=key,
                s3_key=s3_key,
            ) from e

        # Check expiration
        if not ignore_expiry and entry.is_expired:
            self._logger.debug(f"load: entry expired, deleting key={key}")
            # Lazy cleanup: delete expired entry
            try:
                await self._s3_client.delete_object(
                    Bucket=self._bucket_name,
                    Key=s3_key,
                )
            except Exception as e:
                self._logger.warn(f"load: failed to delete expired entry: {e}")

            self._stats.misses += 1
            elapsed = (time.time() - start_time) * 1000
            self._logger.info(f"load: miss key={key} (expired) in {elapsed:.1f}ms")
            return None

        self._stats.hits += 1
        elapsed = (time.time() - start_time) * 1000
        self._logger.info(f"load: hit key={key} in {elapsed:.1f}ms")
        return entry.data

    async def delete(self, key: str) -> bool:
        """
        Delete object from S3.

        Args:
            key: Storage key (use generate_key() to create from object)

        Returns:
            True (S3 DELETE is idempotent)

        Raises:
            JsonS3StorageWriteError: S3 DELETE operation failed
        """
        self._check_closed("delete")

        start_time = time.time()

        self._logger.debug(f"delete: key={key}")
        s3_key = self._build_s3_key(key)

        # DELETE from S3
        try:
            await self._with_retry(
                "delete",
                self._s3_client.delete_object,
                Bucket=self._bucket_name,
                Key=s3_key,
            )
        except Exception as e:
            self._record_error("delete", e, key)
            raise JsonS3StorageWriteError(
                f"Failed to delete from S3: {e}",
                operation="delete",
                key=key,
                s3_key=s3_key,
            ) from e

        self._stats.deletes += 1
        elapsed = (time.time() - start_time) * 1000
        self._logger.info(f"delete: completed key={key} in {elapsed:.1f}ms")
        return True

    async def exists(self, key: str) -> bool:
        """
        Check if object exists in S3.

        Uses HEAD request for efficiency (no body download).

        Args:
            key: Storage key (use generate_key() to create from object)

        Returns:
            True if exists, False otherwise
        """
        self._check_closed("exists")

        s3_key = self._build_s3_key(key)
        self._logger.debug(f"exists: checking key={key}")

        try:
            await self._s3_client.head_object(
                Bucket=self._bucket_name,
                Key=s3_key,
            )
            self._logger.debug(f"exists: key={key} exists")
            return True
        except Exception as e:
            error_str = str(e).lower()
            if "404" in error_str or "not found" in error_str or "nosuchkey" in error_str:
                self._logger.debug(f"exists: key={key} does not exist")
                return False
            # Re-raise other errors
            self._record_error("exists", e, key)
            raise JsonS3StorageReadError(
                f"Failed to check existence in S3: {e}",
                operation="exists",
                key=key,
                s3_key=s3_key,
            ) from e

    async def list_keys(self) -> list[str]:
        """
        List all storage keys.

        Returns:
            List of storage keys (prefix stripped)
        """
        self._check_closed("list_keys")

        self._logger.info(f"list_keys: listing objects with prefix={self._key_prefix}")

        keys: list[str] = []
        continuation_token: str | None = None
        page_count = 0

        while True:
            # Build request params
            params: dict[str, Any] = {
                "Bucket": self._bucket_name,
                "Prefix": self._key_prefix,
            }
            if continuation_token:
                params["ContinuationToken"] = continuation_token

            try:
                response = await self._with_retry(
                    "list_keys",
                    self._s3_client.list_objects_v2,
                    **params,
                )
            except Exception as e:
                self._record_error("list_keys", e)
                raise JsonS3StorageReadError(
                    f"Failed to list objects: {e}",
                    operation="list_keys",
                ) from e

            # Extract keys
            contents = response.get("Contents", [])
            for obj in contents:
                s3_key = obj.get("Key", "")
                if s3_key.startswith(self._key_prefix):
                    key = s3_key[len(self._key_prefix) :]
                    keys.append(key)

            page_count += 1
            self._logger.debug(
                f"list_keys: page {page_count}, found {len(contents)} objects"
            )

            # Check for more pages
            if response.get("IsTruncated"):
                continuation_token = response.get("NextContinuationToken")
            else:
                break

        self._logger.info(f"list_keys: found {len(keys)} keys in {page_count} pages")
        return keys

    async def clear(self) -> int:
        """
        Delete all objects with configured prefix.

        Returns:
            Count of deleted objects
        """
        self._check_closed("clear")

        self._logger.warn(
            f"clear: deleting all objects with prefix={self._key_prefix} "
            f"in bucket={self._bucket_name}"
        )

        keys = await self.list_keys()
        if not keys:
            self._logger.info("clear: no objects to delete")
            return 0

        # Delete in batches of 1000 (S3 limit)
        deleted_count = 0
        batch_size = 1000

        for i in range(0, len(keys), batch_size):
            batch = keys[i : i + batch_size]
            delete_objects = {
                "Objects": [{"Key": self._build_s3_key(k)} for k in batch],
            }

            try:
                await self._with_retry(
                    "clear",
                    self._s3_client.delete_objects,
                    Bucket=self._bucket_name,
                    Delete=delete_objects,
                )
                deleted_count += len(batch)
                self._logger.info(
                    f"clear: deleted batch {i // batch_size + 1}, "
                    f"total={deleted_count}/{len(keys)}"
                )
            except Exception as e:
                self._record_error("clear", e)
                raise JsonS3StorageWriteError(
                    f"Failed to delete objects: {e}",
                    operation="clear",
                ) from e

        self._logger.info(f"clear: deleted {deleted_count} objects")
        return deleted_count

    async def cleanup_expired(self) -> int:
        """
        Delete all expired objects.

        Returns:
            Count of deleted expired entries
        """
        self._check_closed("cleanup_expired")

        self._logger.info("cleanup_expired: scanning for expired entries")

        keys = await self.list_keys()
        expired_keys: list[str] = []

        for key in keys:
            s3_key = self._build_s3_key(key)

            try:
                response = await self._s3_client.get_object(
                    Bucket=self._bucket_name,
                    Key=s3_key,
                )

                body = response["Body"]
                if hasattr(body, "read"):
                    content = await body.read()
                else:
                    content = body

                entry_data = json.loads(content)
                entry = StorageEntry.from_dict(entry_data)

                if entry.is_expired:
                    expired_keys.append(key)
                    self._logger.debug(f"cleanup_expired: found expired key={key}")

            except Exception as e:
                self._logger.warn(f"cleanup_expired: failed to check key={key}: {e}")
                continue

        if not expired_keys:
            self._logger.info("cleanup_expired: no expired entries found")
            return 0

        # Delete expired entries in batches
        deleted_count = 0
        batch_size = 1000

        for i in range(0, len(expired_keys), batch_size):
            batch = expired_keys[i : i + batch_size]
            delete_objects = {
                "Objects": [{"Key": self._build_s3_key(k)} for k in batch],
            }

            try:
                await self._s3_client.delete_objects(
                    Bucket=self._bucket_name,
                    Delete=delete_objects,
                )
                deleted_count += len(batch)
            except Exception as e:
                self._logger.warn(f"cleanup_expired: failed to delete batch: {e}")
                continue

        self._logger.info(f"cleanup_expired: deleted {deleted_count} expired entries")
        return deleted_count

    async def close(self) -> None:
        """
        Close storage and mark instance as closed.

        Subsequent operations will raise JsonS3StorageClosedError.
        """
        if self._closed:
            self._logger.debug("close: already closed")
            return

        self._closed = True
        self._logger.info("close: storage closed")

    def get_stats(self) -> StorageStats:
        """Get operation statistics."""
        return self._stats

    def get_errors(self) -> list[ErrorRecord]:
        """Get error history."""
        return list(self._errors)

    def get_last_error(self) -> ErrorRecord | None:
        """Get most recent error."""
        return self._errors[-1] if self._errors else None

    def clear_errors(self) -> None:
        """Clear error history."""
        self._errors.clear()
        self._logger.debug("clear_errors: error history cleared")

    async def debug_info(self) -> DebugInfo:
        """Get comprehensive debug information."""
        object_count = len(await self.list_keys())

        return DebugInfo(
            bucket_name=self._bucket_name,
            key_prefix=self._key_prefix,
            hash_keys=self._hash_keys,
            ttl=self._ttl,
            region=self._region,
            storage_class=self._storage_class.value,
            encryption=self._encryption.to_s3_params() if self._encryption else None,
            object_count=object_count,
            stats=self._stats.to_dict(),
            error_count=len(self._errors),
            last_error=self._errors[-1].to_dict() if self._errors else None,
            errors=[e.to_dict() for e in self._errors[-10:]],
            closed=self._closed,
        )

    # Context manager support
    async def __aenter__(self) -> JsonS3Storage:
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        await self.close()


def create_storage(
    s3_client: S3ClientProtocol,
    bucket_name: str,
    **kwargs: Any,
) -> JsonS3Storage:
    """
    Factory function to create a JsonS3Storage instance.

    This is the recommended way to create storage instances.

    Args:
        s3_client: AWS S3 client instance
        bucket_name: Target S3 bucket name
        **kwargs: Additional configuration options

    Returns:
        Configured JsonS3Storage instance

    Example:
        storage = create_storage(s3_client, "my-bucket", ttl=3600)
    """
    return JsonS3Storage(s3_client, bucket_name, **kwargs)
