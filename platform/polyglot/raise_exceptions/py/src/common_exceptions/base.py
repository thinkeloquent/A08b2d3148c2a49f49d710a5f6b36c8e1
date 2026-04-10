"""
Base exception class for common_exceptions.

Provides BaseHttpException with serialization, logging, and SDK-compatible interface.
All specific exception classes inherit from this base.
"""

import traceback
from datetime import datetime
from typing import Any, Dict, Optional, Union

from .codes import ErrorCode, get_status_for_code
from .logger import LoggerProtocol, create
from .response import serialize_error_response

logger = create("common_exceptions", __file__)


class BaseHttpException(Exception):
    """
    Base HTTP exception class with standardized serialization and logging.

    All exception subclasses inherit from this base class. Provides:
    - Consistent error response serialization via to_response()
    - Logger-compatible output via to_log_entry()
    - Debug logging on instantiation
    - Support for custom logger injection

    Attributes:
        code: ErrorCode enum value
        message: Human-readable error message
        status: HTTP status code
        details: Optional additional context dict
        request_id: Optional correlation ID
        timestamp: ISO8601 timestamp of exception creation

    Example:
        exc = BaseHttpException(
            code=ErrorCode.NOT_FOUND,
            message="User not found",
            details={"userId": "123"}
        )
        response = exc.to_response()
    """

    def __init__(
        self,
        code: Union[ErrorCode, str],
        message: str,
        status: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
        custom_logger: Optional[LoggerProtocol] = None,
    ):
        """
        Initialize BaseHttpException.

        Args:
            code: ErrorCode enum or string code
            message: Human-readable error message
            status: Optional HTTP status (derived from code if not provided)
            details: Optional additional context
            request_id: Optional correlation ID
            custom_logger: Optional custom logger implementing LoggerProtocol
        """
        super().__init__(message)

        # Normalize code to ErrorCode enum
        if isinstance(code, str):
            try:
                self.code = ErrorCode(code)
                self._code_str = self.code.value
            except ValueError:
                self.code = ErrorCode.INTERNAL_SERVER_ERROR
                self._code_str = code
        else:
            self.code = code
            self._code_str = code.value

        self.message = message
        self.status = status if status is not None else get_status_for_code(self.code)
        self.details = details or {}
        self.request_id = request_id
        self.timestamp = datetime.utcnow().isoformat() + "Z"

        # Store traceback for logging
        self._traceback = traceback.format_exc()

        # Use custom logger or default
        _logger = custom_logger or logger
        _logger.debug(f"Exception raised: {self._code_str} - {message}")

    def to_response(self) -> Dict[str, Any]:
        """
        Serialize exception to standardized error response format.

        Returns:
            Dict matching ErrorResponse schema:
            {
                "error": {
                    "code": "ERROR_CODE",
                    "message": "Error message",
                    "status": 400,
                    "details": {...},
                    "requestId": "req-123",
                    "timestamp": "2026-01-19T10:00:00.000Z"
                }
            }
        """
        return serialize_error_response(
            code=self.code,
            message=self.message,
            status=self.status,
            details=self.details if self.details else None,
            request_id=self.request_id,
        )

    def to_log_entry(self) -> Dict[str, Any]:
        """
        Convert exception to logger-compatible entry.

        Returns:
            Dict suitable for structured logging with error context
        """
        return {
            "level": "ERROR",
            "category": "exception",
            "message": self.message,
            "error": {
                "type": self.__class__.__name__,
                "code": self._code_str,
                "message": self.message,
                "status": self.status,
                "traceback": self._traceback if self._traceback != "NoneType: None\n" else None,
            },
            "context": {
                "details": self.details,
                "request_id": self.request_id,
            },
            "timestamp": self.timestamp,
        }

    def with_request_id(self, request_id: str) -> "BaseHttpException":
        """
        Return a copy of this exception with request_id set.

        Args:
            request_id: Correlation ID to set

        Returns:
            Self with request_id updated (mutates in place)
        """
        self.request_id = request_id
        return self

    def __str__(self) -> str:
        """String representation for debugging."""
        return f"{self.__class__.__name__}({self._code_str}): {self.message}"

    def __repr__(self) -> str:
        """Detailed representation for debugging."""
        return (
            f"{self.__class__.__name__}("
            f"code={self._code_str!r}, "
            f"message={self.message!r}, "
            f"status={self.status}, "
            f"details={self.details!r})"
        )


logger.debug("BaseHttpException initialized")
