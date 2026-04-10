"""
Internal server exception classes for common_exceptions.

Provides exception classes for internal server errors:
- InternalServerException (500)
- ServiceUnavailableException (503)
- BadGatewayException (502)
"""

from typing import Any, Dict, Optional

from .base import BaseHttpException
from .codes import ErrorCode
from .logger import LoggerProtocol, create

logger = create("common_exceptions", __file__)


class InternalServerException(BaseHttpException):
    """
    Exception for unhandled internal server errors.

    HTTP Status: 500 Internal Server Error
    Default Code: INTERNAL_SERVER_ERROR

    Use when:
    - Unhandled exception occurred
    - Programming error detected
    - Unexpected state encountered

    Note: This exception sanitizes the message for client responses
    to avoid leaking implementation details. Full details are logged.
    """

    # Generic message for client response
    _SAFE_MESSAGE = "An internal error occurred"

    def __init__(
        self,
        message: str = "Internal server error",
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
        custom_logger: Optional[LoggerProtocol] = None,
        expose_message: bool = False,
    ):
        """
        Initialize InternalServerException.

        Args:
            message: Error message (logged but may be sanitized in response)
            details: Optional additional context (logged but not exposed)
            request_id: Optional correlation ID
            custom_logger: Optional custom logger
            expose_message: If True, expose actual message to client (dev mode)
        """
        self._internal_message = message
        self._internal_details = details
        self._expose_message = expose_message

        # Use custom logger or default - log at ERROR level
        _logger = custom_logger or logger
        _logger.error(f"Internal error: {message}")
        if details:
            _logger.error(f"Internal error details: {details}")

        # Call parent with sanitized message for client
        super().__init__(
            code=ErrorCode.INTERNAL_SERVER_ERROR,
            message=message if expose_message else self._SAFE_MESSAGE,
            status=500,
            details=None,  # Never expose internal details
            request_id=request_id,
            custom_logger=custom_logger,
        )

    def to_log_entry(self) -> Dict[str, Any]:
        """
        Convert to log entry with full internal details.

        Returns:
            Dict with full error context for logging
        """
        entry = super().to_log_entry()
        # Include internal details in log (not in response)
        entry["error"]["internal_message"] = self._internal_message
        entry["error"]["internal_details"] = self._internal_details
        return entry


class ServiceUnavailableException(BaseHttpException):
    """
    Exception for service temporarily unavailable.

    HTTP Status: 503 Service Unavailable
    Default Code: SERVICE_UNAVAILABLE

    Use when:
    - Server is overloaded
    - Service is in maintenance mode
    - Temporary capacity issue
    - Circuit breaker is open

    Attributes:
        retry_after_ms: Suggested wait time in milliseconds before retry
    """

    def __init__(
        self,
        message: str = "Service temporarily unavailable",
        retry_after_ms: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
        custom_logger: Optional[LoggerProtocol] = None,
    ):
        self.retry_after_ms = retry_after_ms

        # Include retry info in details
        full_details = details or {}
        if retry_after_ms is not None:
            full_details["retryAfterMs"] = retry_after_ms

        super().__init__(
            code=ErrorCode.SERVICE_UNAVAILABLE,
            message=message,
            status=503,
            details=full_details if full_details else None,
            request_id=request_id,
            custom_logger=custom_logger,
        )


class BadGatewayException(BaseHttpException):
    """
    Exception for invalid response from upstream server.

    HTTP Status: 502 Bad Gateway
    Default Code: BAD_GATEWAY

    Use when:
    - Upstream returned malformed response
    - Protocol error from upstream
    - Upstream response couldn't be parsed
    """

    def __init__(
        self,
        message: str = "Bad gateway",
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
        custom_logger: Optional[LoggerProtocol] = None,
    ):
        super().__init__(
            code=ErrorCode.BAD_GATEWAY,
            message=message,
            status=502,
            details=details,
            request_id=request_id,
            custom_logger=custom_logger,
        )


logger.debug("Internal exception classes initialized")
