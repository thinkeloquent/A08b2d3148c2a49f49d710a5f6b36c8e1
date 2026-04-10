"""
Exception Hierarchy for AWS S3 Client

Provides typed exceptions for specific error conditions.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class ErrorContext:
    """Context information for errors."""

    operation: str
    key: str | None = None
    s3_key: str | None = None
    extra: dict[str, Any] = field(default_factory=dict)


class JsonS3StorageError(Exception):
    """Base exception for all storage errors."""

    def __init__(self, message: str, context: ErrorContext | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.context = context

    def __str__(self) -> str:
        if self.context:
            return f"{self.message} (operation={self.context.operation}, key={self.context.key})"
        return self.message


class JsonS3StorageConfigError(JsonS3StorageError):
    """Raised when configuration is invalid."""

    def __init__(self, message: str) -> None:
        super().__init__(message, None)


class JsonS3StorageAuthError(JsonS3StorageError):
    """Raised when access is denied (403)."""

    pass


class JsonS3StorageReadError(JsonS3StorageError):
    """Raised when a read operation fails."""

    pass


class JsonS3StorageWriteError(JsonS3StorageError):
    """Raised when a write operation fails."""

    pass


class JsonS3StorageSerializationError(JsonS3StorageError):
    """Raised when JSON serialization/deserialization fails."""

    pass


class JsonS3StorageClosedError(JsonS3StorageError):
    """Raised when an operation is attempted on a closed storage instance."""

    def __init__(self, operation: str) -> None:
        super().__init__(
            f"Cannot perform '{operation}' on closed storage",
            ErrorContext(operation=operation),
        )
