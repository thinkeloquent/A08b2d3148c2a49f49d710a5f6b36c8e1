"""
Data Models for JSON S3 Storage

Provides structured data types for storage entries, statistics, configuration,
and client protocol definitions.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Protocol, runtime_checkable


class StorageClass(str, Enum):
    """S3 storage class options."""

    STANDARD = "STANDARD"
    STANDARD_IA = "STANDARD_IA"
    ONEZONE_IA = "ONEZONE_IA"
    INTELLIGENT_TIERING = "INTELLIGENT_TIERING"
    GLACIER = "GLACIER"
    GLACIER_IR = "GLACIER_IR"
    DEEP_ARCHIVE = "DEEP_ARCHIVE"


class EncryptionType(str, Enum):
    """Server-side encryption types."""

    SSE_S3 = "SSE-S3"
    SSE_KMS = "SSE-KMS"
    SSE_C = "SSE-C"


@dataclass
class StorageEntry:
    """
    Metadata wrapper for stored JSON data.

    Attributes:
        key: Generated storage key (SHA256 hash)
        data: User's JSON payload
        created_at: Unix timestamp of creation
        expires_at: Unix timestamp of expiration (None = never expires)
    """

    key: str
    data: dict[str, Any]
    created_at: float
    expires_at: float | None = None

    @property
    def ttl_remaining(self) -> float | None:
        """Calculate remaining TTL in seconds, or None if no expiration."""
        if self.expires_at is None:
            return None
        remaining = self.expires_at - time.time()
        return max(0.0, remaining)

    @property
    def is_expired(self) -> bool:
        """Check if entry has expired."""
        if self.expires_at is None:
            return False
        return time.time() > self.expires_at

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "key": self.key,
            "data": self.data,
            "created_at": self.created_at,
            "expires_at": self.expires_at,
        }

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> StorageEntry:
        """Create StorageEntry from dictionary."""
        return cls(
            key=d["key"],
            data=d["data"],
            created_at=d["created_at"],
            expires_at=d.get("expires_at"),
        )


@dataclass
class ErrorRecord:
    """
    Error tracking record for diagnostics.

    Attributes:
        timestamp: ISO 8601 timestamp when error occurred
        operation: Operation that failed (save, load, delete, etc.)
        error_type: Exception class name
        error_message: Exception message
        traceback: Full stack trace
        key: Storage key if available
        s3_key: Full S3 object key if available
    """

    timestamp: str
    operation: str
    error_type: str
    error_message: str
    traceback: str
    key: str | None = None
    s3_key: str | None = None

    def to_dict(self) -> dict[str, str | None]:
        """Convert to dictionary for JSON serialization."""
        return {
            "timestamp": self.timestamp,
            "operation": self.operation,
            "error_type": self.error_type,
            "error_message": self.error_message,
            "traceback": self.traceback,
            "key": self.key,
            "s3_key": self.s3_key,
        }


@dataclass
class StorageStats:
    """
    Operation statistics for monitoring.

    Tracks counts of all storage operations for observability.
    """

    saves: int = 0
    loads: int = 0
    hits: int = 0
    misses: int = 0
    deletes: int = 0
    errors: int = 0

    def to_dict(self) -> dict[str, int]:
        """Convert to dictionary for JSON serialization."""
        return {
            "saves": self.saves,
            "loads": self.loads,
            "hits": self.hits,
            "misses": self.misses,
            "deletes": self.deletes,
            "errors": self.errors,
        }


@dataclass
class RetryConfig:
    """
    Retry behavior configuration for transient failures.

    Implements exponential backoff with optional jitter.
    """

    max_retries: int = 3
    base_delay_ms: int = 100
    max_delay_ms: int = 5000
    exponential_base: float = 2.0
    jitter: bool = True

    def calculate_delay(self, attempt: int) -> float:
        """Calculate delay in seconds for a given retry attempt."""
        import random

        delay_ms = min(
            self.base_delay_ms * (self.exponential_base**attempt),
            self.max_delay_ms,
        )

        if self.jitter:
            delay_ms = delay_ms * (0.5 + random.random())

        return delay_ms / 1000.0


@dataclass
class EncryptionConfig:
    """
    Server-side encryption configuration.

    Supports SSE-S3 (AES-256), SSE-KMS, and SSE-C encryption types.
    """

    type: EncryptionType = EncryptionType.SSE_S3
    kms_key_id: str | None = None
    customer_key: str | None = None

    def to_s3_params(self) -> dict[str, str]:
        """Convert to S3 PUT parameters."""
        params: dict[str, str] = {}

        if self.type == EncryptionType.SSE_S3:
            params["ServerSideEncryption"] = "AES256"
        elif self.type == EncryptionType.SSE_KMS:
            params["ServerSideEncryption"] = "aws:kms"
            if self.kms_key_id:
                params["SSEKMSKeyId"] = self.kms_key_id
        elif self.type == EncryptionType.SSE_C:
            if self.customer_key:
                params["SSECustomerAlgorithm"] = "AES256"
                params["SSECustomerKey"] = self.customer_key

        return params


@dataclass
class JsonS3StorageConfig:
    """
    Configuration for JsonS3Storage.

    Consolidates all configuration options for the storage class.
    """

    bucket_name: str
    key_prefix: str = "jss3:"
    hash_keys: list[str] | None = None
    ttl: float | None = None
    region: str | None = None
    storage_class: StorageClass = StorageClass.STANDARD
    encryption: EncryptionConfig | None = None
    content_type: str = "application/json"
    retry_config: RetryConfig | None = None
    debug: bool = False
    max_error_history: int = 100


@runtime_checkable
class S3ClientProtocol(Protocol):
    """
    Protocol defining required S3 client interface.

    Compatible with aiobotocore and boto3 clients.
    """

    async def put_object(
        self,
        *,
        Bucket: str,
        Key: str,
        Body: bytes,
        ContentType: str | None = None,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Put an object to S3."""
        ...

    async def get_object(
        self,
        *,
        Bucket: str,
        Key: str,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Get an object from S3."""
        ...

    async def delete_object(
        self,
        *,
        Bucket: str,
        Key: str,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Delete an object from S3."""
        ...

    async def head_object(
        self,
        *,
        Bucket: str,
        Key: str,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Get object metadata from S3."""
        ...

    async def list_objects_v2(
        self,
        *,
        Bucket: str,
        Prefix: str | None = None,
        ContinuationToken: str | None = None,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """List objects in S3 bucket."""
        ...

    async def delete_objects(
        self,
        *,
        Bucket: str,
        Delete: dict[str, Any],
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Delete multiple objects from S3."""
        ...


@dataclass
class ClientConfig:
    """
    Configuration for S3 client creation via get_client_factory.

    Used by ClientAsync (aiobotocore) and ClientSync (boto3) to build
    fully-configured S3 clients from a single config object.
    """

    bucket_name: str
    proxy_url: str | None = None
    endpoint_url: str | None = None
    aws_secret_access_key: str | None = None
    aws_access_key_id: str | None = None
    region_name: str | None = None
    addressing_style: str = "path"
    connection_timeout: int = 20
    read_timeout: int = 60
    retries_max_attempts: int = 3
    type: str = "s3"
    verify: bool = True
    ttl: float = 600.0


@dataclass
class DebugInfo:
    """
    Comprehensive debug information for troubleshooting.

    Returned by the debug_info() method.
    """

    bucket_name: str
    key_prefix: str
    hash_keys: list[str] | None
    ttl: float | None
    region: str | None
    storage_class: str
    encryption: dict[str, Any] | None
    object_count: int
    stats: dict[str, int]
    error_count: int
    last_error: dict[str, str | None] | None
    errors: list[dict[str, str | None]]
    closed: bool = False

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "bucket_name": self.bucket_name,
            "key_prefix": self.key_prefix,
            "hash_keys": self.hash_keys,
            "ttl": self.ttl,
            "region": self.region,
            "storage_class": self.storage_class,
            "encryption": self.encryption,
            "object_count": self.object_count,
            "stats": self.stats,
            "error_count": self.error_count,
            "last_error": self.last_error,
            "errors": self.errors,
            "closed": self.closed,
        }
