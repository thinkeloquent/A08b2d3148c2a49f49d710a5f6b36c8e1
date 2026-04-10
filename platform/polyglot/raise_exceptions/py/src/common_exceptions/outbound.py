"""
Outbound/Network exception classes for common_exceptions.

Provides exception classes for handling outgoing HTTP call errors:
- ConnectTimeoutException (503)
- ReadTimeoutException (504)
- WriteTimeoutException (504)
- NetworkException (503)
- UpstreamServiceException (502)
- UpstreamTimeoutException (504)
"""

from typing import Any, Dict, Optional

from .base import BaseHttpException
from .codes import ErrorCode
from .logger import LoggerProtocol, create

logger = create("common_exceptions", __file__)


class ConnectTimeoutException(BaseHttpException):
    """
    Exception for connection establishment timeout.

    HTTP Status: 503 Service Unavailable
    Default Code: NETWORK_CONNECT_TIMEOUT

    Use when:
    - Failed to establish TCP connection within timeout
    - DNS resolution took too long
    - TLS handshake timed out

    Attributes:
        service: Name of the upstream service
        timeout_ms: Timeout duration in milliseconds
    """

    def __init__(
        self,
        message: str = "Connection timeout",
        service: Optional[str] = None,
        timeout_ms: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
        custom_logger: Optional[LoggerProtocol] = None,
    ):
        self.service = service
        self.timeout_ms = timeout_ms

        # Build details with service context
        full_details = details or {}
        if service:
            full_details["service"] = service
        if timeout_ms is not None:
            full_details["timeoutMs"] = timeout_ms

        # Enhance message with context
        if service and "service" not in message.lower():
            message = f"Connection to '{service}' timed out"
            if timeout_ms:
                message += f" after {timeout_ms}ms"

        super().__init__(
            code=ErrorCode.NETWORK_CONNECT_TIMEOUT,
            message=message,
            status=503,
            details=full_details if full_details else None,
            request_id=request_id,
            custom_logger=custom_logger,
        )


class ReadTimeoutException(BaseHttpException):
    """
    Exception for response read timeout.

    HTTP Status: 504 Gateway Timeout
    Default Code: NETWORK_READ_TIMEOUT

    Use when:
    - Timed out waiting for response headers
    - Timed out receiving response body
    - Upstream service is slow to respond

    Attributes:
        service: Name of the upstream service
        timeout_ms: Timeout duration in milliseconds
    """

    def __init__(
        self,
        message: str = "Read timeout",
        service: Optional[str] = None,
        timeout_ms: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
        custom_logger: Optional[LoggerProtocol] = None,
    ):
        self.service = service
        self.timeout_ms = timeout_ms

        # Build details with service context
        full_details = details or {}
        if service:
            full_details["service"] = service
        if timeout_ms is not None:
            full_details["timeoutMs"] = timeout_ms

        # Enhance message with context
        if service and "service" not in message.lower():
            message = f"Read timeout from '{service}'"
            if timeout_ms:
                message += f" after {timeout_ms}ms"

        super().__init__(
            code=ErrorCode.NETWORK_READ_TIMEOUT,
            message=message,
            status=504,
            details=full_details if full_details else None,
            request_id=request_id,
            custom_logger=custom_logger,
        )


class WriteTimeoutException(BaseHttpException):
    """
    Exception for request write timeout.

    HTTP Status: 504 Gateway Timeout
    Default Code: NETWORK_WRITE_TIMEOUT

    Use when:
    - Timed out sending request body
    - Upload took too long
    - Network congestion during write

    Attributes:
        service: Name of the upstream service
        timeout_ms: Timeout duration in milliseconds
    """

    def __init__(
        self,
        message: str = "Write timeout",
        service: Optional[str] = None,
        timeout_ms: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
        custom_logger: Optional[LoggerProtocol] = None,
    ):
        self.service = service
        self.timeout_ms = timeout_ms

        # Build details with service context
        full_details = details or {}
        if service:
            full_details["service"] = service
        if timeout_ms is not None:
            full_details["timeoutMs"] = timeout_ms

        super().__init__(
            code=ErrorCode.NETWORK_WRITE_TIMEOUT,
            message=message,
            status=504,
            details=full_details if full_details else None,
            request_id=request_id,
            custom_logger=custom_logger,
        )


class NetworkException(BaseHttpException):
    """
    Exception for general network failures.

    HTTP Status: 503 Service Unavailable
    Default Code: NETWORK_ERROR

    Use when:
    - DNS resolution failed
    - Connection refused
    - Connection reset
    - Socket errors

    Attributes:
        service: Name of the upstream service
        original_error: Original error message or type
    """

    def __init__(
        self,
        message: str = "Network error",
        service: Optional[str] = None,
        original_error: Optional[str] = None,
        code: ErrorCode = ErrorCode.NETWORK_ERROR,
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
        custom_logger: Optional[LoggerProtocol] = None,
    ):
        self.service = service
        self.original_error = original_error

        # Build details with service context
        full_details = details or {}
        if service:
            full_details["service"] = service
        if original_error:
            full_details["originalError"] = original_error

        super().__init__(
            code=code,
            message=message,
            status=503,
            details=full_details if full_details else None,
            request_id=request_id,
            custom_logger=custom_logger,
        )


class UpstreamServiceException(BaseHttpException):
    """
    Exception for upstream service returning error status.

    HTTP Status: 502 Bad Gateway
    Default Code: UPSTREAM_SERVICE_ERROR

    Use when:
    - Upstream service returned 4xx/5xx
    - Upstream response indicates failure
    - Upstream service is unhealthy

    Attributes:
        service: Name of the upstream service
        operation: Operation being performed
        upstream_status: HTTP status from upstream
    """

    def __init__(
        self,
        message: str = "Upstream service error",
        service: Optional[str] = None,
        operation: Optional[str] = None,
        upstream_status: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
        custom_logger: Optional[LoggerProtocol] = None,
    ):
        self.service = service
        self.operation = operation
        self.upstream_status = upstream_status

        # Build details with upstream context
        full_details = details or {}
        if service:
            full_details["service"] = service
        if operation:
            full_details["operation"] = operation
        if upstream_status is not None:
            full_details["upstreamStatus"] = upstream_status

        # Enhance message with context
        if service and "service" not in message.lower():
            message = f"Upstream service '{service}' returned error"
            if upstream_status:
                message += f" ({upstream_status})"

        super().__init__(
            code=ErrorCode.UPSTREAM_SERVICE_ERROR,
            message=message,
            status=502,
            details=full_details if full_details else None,
            request_id=request_id,
            custom_logger=custom_logger,
        )


class UpstreamTimeoutException(BaseHttpException):
    """
    Exception for upstream service timeout (catch-all).

    HTTP Status: 504 Gateway Timeout
    Default Code: UPSTREAM_TIMEOUT

    Use when:
    - Generic upstream timeout
    - Combined connect + read timeout
    - Operation-level timeout

    Attributes:
        service: Name of the upstream service
        operation: Operation being performed
        timeout_ms: Timeout duration in milliseconds
    """

    def __init__(
        self,
        message: str = "Upstream service timeout",
        service: Optional[str] = None,
        operation: Optional[str] = None,
        timeout_ms: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
        custom_logger: Optional[LoggerProtocol] = None,
    ):
        self.service = service
        self.operation = operation
        self.timeout_ms = timeout_ms

        # Build details with upstream context
        full_details = details or {}
        if service:
            full_details["service"] = service
        if operation:
            full_details["operation"] = operation
        if timeout_ms is not None:
            full_details["timeoutMs"] = timeout_ms

        # Enhance message with context
        if service and "service" not in message.lower():
            message = f"Upstream service '{service}' timed out"
            if operation:
                message = f"Upstream service '{service}' timed out during '{operation}'"
            if timeout_ms:
                message += f" after {timeout_ms}ms"

        super().__init__(
            code=ErrorCode.UPSTREAM_TIMEOUT,
            message=message,
            status=504,
            details=full_details if full_details else None,
            request_id=request_id,
            custom_logger=custom_logger,
        )


logger.debug("Outbound exception classes initialized")
