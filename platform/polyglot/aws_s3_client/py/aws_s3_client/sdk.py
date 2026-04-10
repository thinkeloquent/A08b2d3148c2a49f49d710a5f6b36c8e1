"""
SDK Client for AWS S3 Storage

Provides a high-level SDK interface for CLI, LLM Agents, and programmatic access.
Wraps the storage implementation with configuration management and response envelopes.
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any, Generic, TypeVar

from aiobotocore.session import get_session
from botocore.config import Config as BotoConfig

from aws_s3_client.config import SDKConfig
from aws_s3_client.logger import LoggerProtocol, NullLogger
from aws_s3_client.logger import create as create_logger
from aws_s3_client.models import StorageStats
from aws_s3_client.storage import JsonS3Storage

T = TypeVar("T")

# Module-level logger
logger = create_logger("aws_s3_client", __file__)


@dataclass
class SDKResponse(Generic[T]):
    """
    Response envelope for SDK operations.

    Attributes:
        success: Whether the operation succeeded
        data: Result data (type depends on operation)
        key: Storage key if applicable
        elapsed_ms: Operation duration in milliseconds
        error: Error message if failed
    """

    success: bool
    data: T | None
    key: str | None
    elapsed_ms: float
    error: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "success": self.success,
            "data": self.data,
            "key": self.key,
            "elapsed_ms": self.elapsed_ms,
            "error": self.error,
        }


class S3StorageSDK:
    """
    High-level SDK client for AWS S3 storage.

    Provides a simplified interface for CLI, LLM Agents, and programmatic access.
    Handles S3 client instantiation, configuration, and response wrapping.

    Example:
        config = SDKConfig(bucket_name="my-bucket")
        sdk = create_sdk(config)
        response = await sdk.save({"user_id": 123})
        print(response.key)
        await sdk.close()
    """

    def __init__(
        self,
        config: SDKConfig,
        *,
        custom_logger: LoggerProtocol | None = None,
    ) -> None:
        """
        Initialize the SDK client.

        Args:
            config: SDK configuration
            custom_logger: Optional custom logger (default: package logger)
        """
        self._config = config
        self._session = get_session()
        self._s3_client: Any = None
        self._storage: JsonS3Storage | None = None
        self._closed = False

        # Initialize logger
        if custom_logger is not None:
            self._logger = custom_logger
        elif config.debug:
            self._logger = logger
        else:
            self._logger = NullLogger()

        self._logger.debug(f"SDK initialized: bucket={config.bucket_name}")

    async def _ensure_initialized(self) -> JsonS3Storage:
        """Ensure S3 client and storage are initialized."""
        if self._storage is not None:
            return self._storage

        # Build botocore Config with timeouts, retries, and proxy
        boto_kwargs: dict[str, Any] = {
            "connect_timeout": self._config.connect_timeout,
            "read_timeout": self._config.read_timeout,
            "retries": {"max_attempts": self._config.max_retries},
        }
        if self._config.proxy_url:
            boto_kwargs["proxies"] = {
                "http": self._config.proxy_url,
                "https": self._config.proxy_url,
            }
        boto_config = BotoConfig(**boto_kwargs)

        # Create S3 client configuration
        client_kwargs: dict[str, Any] = {
            "region_name": self._config.region,
            "config": boto_config,
            "verify": self._config.verify_ssl,
        }

        if self._config.endpoint_url:
            client_kwargs["endpoint_url"] = self._config.endpoint_url

        if self._config.aws_access_key_id and self._config.aws_secret_access_key:
            client_kwargs["aws_access_key_id"] = self._config.aws_access_key_id
            client_kwargs["aws_secret_access_key"] = self._config.aws_secret_access_key

        # Create S3 client
        self._s3_client = await self._session.create_client("s3", **client_kwargs).__aenter__()

        # Create storage instance
        self._storage = JsonS3Storage(
            self._s3_client,
            self._config.bucket_name,
            key_prefix=self._config.key_prefix,
            hash_keys=self._config.hash_keys,
            ttl=self._config.ttl,
            region=self._config.region,
            debug=self._config.debug,
            custom_logger=self._logger,
        )

        self._logger.info("SDK storage initialized")
        return self._storage

    async def save(
        self,
        data: dict[str, Any],
        *,
        ttl: int | None = None,
        custom_key: str | None = None,
    ) -> SDKResponse[str]:
        """
        Save JSON data to S3.

        Args:
            data: Dictionary of data to save
            ttl: Optional TTL override in seconds
            custom_key: Optional custom key to use instead of auto-generated hash key

        Returns:
            SDKResponse with storage key
        """
        start_time = time.time()
        self._logger.debug(f"save: data with {len(data)} fields")

        try:
            storage = await self._ensure_initialized()
            key = await storage.save(data, ttl=ttl, custom_key=custom_key)
            elapsed_ms = (time.time() - start_time) * 1000

            return SDKResponse(
                success=True,
                data=key,
                key=key,
                elapsed_ms=elapsed_ms,
            )
        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            self._logger.error(f"save failed: {e}")
            return SDKResponse(
                success=False,
                data=None,
                key=None,
                elapsed_ms=elapsed_ms,
                error=str(e),
            )

    async def load(
        self,
        key_or_data: str | dict[str, Any],
    ) -> SDKResponse[dict[str, Any]]:
        """
        Load JSON data from S3.

        Args:
            key_or_data: Storage key or data dict for key generation

        Returns:
            SDKResponse with loaded data or None
        """
        start_time = time.time()
        self._logger.debug(f"load: key_or_data type={type(key_or_data).__name__}")

        try:
            storage = await self._ensure_initialized()
            data = await storage.load(key_or_data)
            elapsed_ms = (time.time() - start_time) * 1000

            key = key_or_data if isinstance(key_or_data, str) else None

            return SDKResponse(
                success=True,
                data=data,
                key=key,
                elapsed_ms=elapsed_ms,
            )
        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            self._logger.error(f"load failed: {e}")
            return SDKResponse(
                success=False,
                data=None,
                key=None,
                elapsed_ms=elapsed_ms,
                error=str(e),
            )

    async def delete(
        self,
        key_or_data: str | dict[str, Any],
    ) -> SDKResponse[bool]:
        """
        Delete object from S3.

        Args:
            key_or_data: Storage key or data dict for key generation

        Returns:
            SDKResponse with True on success
        """
        start_time = time.time()
        self._logger.debug(f"delete: key_or_data type={type(key_or_data).__name__}")

        try:
            storage = await self._ensure_initialized()
            result = await storage.delete(key_or_data)
            elapsed_ms = (time.time() - start_time) * 1000

            key = key_or_data if isinstance(key_or_data, str) else None

            return SDKResponse(
                success=True,
                data=result,
                key=key,
                elapsed_ms=elapsed_ms,
            )
        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            self._logger.error(f"delete failed: {e}")
            return SDKResponse(
                success=False,
                data=False,
                key=None,
                elapsed_ms=elapsed_ms,
                error=str(e),
            )

    async def exists(
        self,
        key_or_data: str | dict[str, Any],
    ) -> SDKResponse[bool]:
        """
        Check if object exists in S3.

        Args:
            key_or_data: Storage key or data dict for key generation

        Returns:
            SDKResponse with existence boolean
        """
        start_time = time.time()
        self._logger.debug(f"exists: key_or_data type={type(key_or_data).__name__}")

        try:
            storage = await self._ensure_initialized()
            result = await storage.exists(key_or_data)
            elapsed_ms = (time.time() - start_time) * 1000

            key = key_or_data if isinstance(key_or_data, str) else None

            return SDKResponse(
                success=True,
                data=result,
                key=key,
                elapsed_ms=elapsed_ms,
            )
        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            self._logger.error(f"exists failed: {e}")
            return SDKResponse(
                success=False,
                data=False,
                key=None,
                elapsed_ms=elapsed_ms,
                error=str(e),
            )

    async def list_keys(self) -> SDKResponse[list[str]]:
        """
        List all storage keys.

        Returns:
            SDKResponse with list of keys
        """
        start_time = time.time()
        self._logger.debug("list_keys: listing all keys")

        try:
            storage = await self._ensure_initialized()
            keys = await storage.list_keys()
            elapsed_ms = (time.time() - start_time) * 1000

            return SDKResponse(
                success=True,
                data=keys,
                key=None,
                elapsed_ms=elapsed_ms,
            )
        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            self._logger.error(f"list_keys failed: {e}")
            return SDKResponse(
                success=False,
                data=[],
                key=None,
                elapsed_ms=elapsed_ms,
                error=str(e),
            )

    async def list_expired(self) -> SDKResponse[list[str]]:
        """
        List all expired storage keys.

        Returns:
            SDKResponse with list of expired keys
        """
        start_time = time.time()
        self._logger.debug("list_expired: listing expired keys")

        try:
            storage = await self._ensure_initialized()
            keys = await storage.list_expired()
            elapsed_ms = (time.time() - start_time) * 1000

            return SDKResponse(
                success=True,
                data=keys,
                key=None,
                elapsed_ms=elapsed_ms,
            )
        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            self._logger.error(f"list_expired failed: {e}")
            return SDKResponse(
                success=False,
                data=[],
                key=None,
                elapsed_ms=elapsed_ms,
                error=str(e),
            )

    async def cleanup_expired(self) -> SDKResponse[int]:
        """
        Delete all expired objects.

        Returns:
            SDKResponse with count of deleted expired entries
        """
        start_time = time.time()
        self._logger.debug("cleanup_expired: cleaning up expired entries")

        try:
            storage = await self._ensure_initialized()
            count = await storage.cleanup_expired()
            elapsed_ms = (time.time() - start_time) * 1000

            return SDKResponse(
                success=True,
                data=count,
                key=None,
                elapsed_ms=elapsed_ms,
            )
        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            self._logger.error(f"cleanup_expired failed: {e}")
            return SDKResponse(
                success=False,
                data=0,
                key=None,
                elapsed_ms=elapsed_ms,
                error=str(e),
            )

    async def clear(self) -> SDKResponse[int]:
        """
        Delete all objects with prefix.

        Returns:
            SDKResponse with count of deleted objects
        """
        start_time = time.time()
        self._logger.warn("clear: deleting all objects")

        try:
            storage = await self._ensure_initialized()
            count = await storage.clear()
            elapsed_ms = (time.time() - start_time) * 1000

            return SDKResponse(
                success=True,
                data=count,
                key=None,
                elapsed_ms=elapsed_ms,
            )
        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            self._logger.error(f"clear failed: {e}")
            return SDKResponse(
                success=False,
                data=0,
                key=None,
                elapsed_ms=elapsed_ms,
                error=str(e),
            )

    async def stats(self) -> SDKResponse[dict[str, int]]:
        """
        Get operation statistics.

        Returns:
            SDKResponse with stats dictionary
        """
        start_time = time.time()

        try:
            storage = await self._ensure_initialized()
            stats = storage.get_stats()
            elapsed_ms = (time.time() - start_time) * 1000

            return SDKResponse(
                success=True,
                data=stats.to_dict(),
                key=None,
                elapsed_ms=elapsed_ms,
            )
        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            self._logger.error(f"stats failed: {e}")
            return SDKResponse(
                success=False,
                data=None,
                key=None,
                elapsed_ms=elapsed_ms,
                error=str(e),
            )

    async def debug_info(self) -> SDKResponse[dict[str, Any]]:
        """
        Get comprehensive debug information.

        Returns:
            SDKResponse with debug info dictionary
        """
        start_time = time.time()

        try:
            storage = await self._ensure_initialized()
            info = await storage.debug_info()
            elapsed_ms = (time.time() - start_time) * 1000

            return SDKResponse(
                success=True,
                data=info.to_dict(),
                key=None,
                elapsed_ms=elapsed_ms,
            )
        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            self._logger.error(f"debug_info failed: {e}")
            return SDKResponse(
                success=False,
                data=None,
                key=None,
                elapsed_ms=elapsed_ms,
                error=str(e),
            )

    async def close(self) -> None:
        """Close SDK and release resources."""
        if self._closed:
            return

        if self._storage:
            await self._storage.close()

        if self._s3_client:
            await self._s3_client.__aexit__(None, None, None)

        self._closed = True
        self._logger.info("SDK closed")

    async def __aenter__(self) -> S3StorageSDK:
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        await self.close()


def create_sdk(
    config: SDKConfig,
    *,
    custom_logger: LoggerProtocol | None = None,
) -> S3StorageSDK:
    """
    Factory function to create an SDK client.

    This is the primary way to create SDK instances.

    Args:
        config: SDK configuration
        custom_logger: Optional custom logger

    Returns:
        Configured S3StorageSDK instance

    Example:
        config = SDKConfig(bucket_name="my-bucket")
        sdk = create_sdk(config)
        response = await sdk.save({"key": "value"})
    """
    return S3StorageSDK(config, custom_logger=custom_logger)
