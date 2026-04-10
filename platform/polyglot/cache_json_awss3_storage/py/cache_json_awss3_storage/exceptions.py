"""
Exception Hierarchy for JSON S3 Storage

Provides typed exceptions for S3 storage operations with context information.
All exceptions inherit from JsonS3StorageError for catch-all handling.
"""

from __future__ import annotations


class JsonS3StorageError(Exception):
    """
    Base exception for all S3 storage errors.

    Attributes:
        message: Human-readable error message
        operation: The operation that failed (e.g., "save", "load", "delete")
        key: The storage key involved, if applicable
        s3_key: The full S3 object key, if applicable
    """

    def __init__(
        self,
        message: str,
        *,
        operation: str | None = None,
        key: str | None = None,
        s3_key: str | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.operation = operation
        self.key = key
        self.s3_key = s3_key

    def __str__(self) -> str:
        parts = [self.message]
        if self.operation:
            parts.append(f"operation={self.operation}")
        if self.key:
            parts.append(f"key={self.key}")
        if self.s3_key:
            parts.append(f"s3_key={self.s3_key}")
        return " | ".join(parts)

    def to_dict(self) -> dict[str, str | None]:
        """Convert exception to dictionary for logging/serialization."""
        return {
            "error_type": self.__class__.__name__,
            "message": self.message,
            "operation": self.operation,
            "key": self.key,
            "s3_key": self.s3_key,
        }


class JsonS3StorageReadError(JsonS3StorageError):
    """
    Failed to read from S3.

    Common causes:
    - Object not found (404)
    - Access denied (403)
    - Network timeout
    """

    pass


class JsonS3StorageWriteError(JsonS3StorageError):
    """
    Failed to write to S3.

    Common causes:
    - Access denied (403)
    - Bucket not found
    - Storage quota exceeded
    """

    pass


class JsonS3StorageSerializationError(JsonS3StorageError):
    """
    Failed to serialize/deserialize JSON.

    Common causes:
    - Non-serializable data type
    - Corrupted stored data
    - Encoding issues
    """

    pass


class JsonS3StorageAuthError(JsonS3StorageError):
    """
    Authentication/authorization failure.

    Common causes:
    - Invalid credentials
    - Expired credentials
    - Insufficient IAM permissions
    """

    pass


class JsonS3StorageConfigError(JsonS3StorageError):
    """
    Configuration error.

    Common causes:
    - Invalid bucket name
    - Invalid region
    - Missing required configuration
    """

    pass


class JsonS3StorageClosedError(JsonS3StorageError):
    """
    Storage instance has been closed.

    Raised when attempting to use a storage instance after close() has been called.
    """

    def __init__(self, operation: str) -> None:
        super().__init__(
            f"Storage is closed, cannot perform operation: {operation}",
            operation=operation,
        )
