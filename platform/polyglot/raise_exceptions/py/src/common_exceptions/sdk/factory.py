"""
Exception factory for SDK usage.

Provides factory functions to create exceptions programmatically.
"""

from typing import Any, Dict, Optional, Union

from ..base import BaseHttpException
from ..codes import ErrorCode, get_status_for_code
from ..inbound import (
    BadRequestException,
    ConflictException,
    NotAuthenticatedException,
    NotAuthorizedException,
    NotFoundException,
    TooManyRequestsException,
    ValidationException,
)
from ..internal import (
    BadGatewayException,
    InternalServerException,
    ServiceUnavailableException,
)
from ..logger import create
from ..outbound import (
    ConnectTimeoutException,
    NetworkException,
    ReadTimeoutException,
    UpstreamServiceException,
    UpstreamTimeoutException,
    WriteTimeoutException,
)

logger = create("common_exceptions", __file__)


# Map error codes to exception classes
_CODE_TO_EXCEPTION: Dict[ErrorCode, type] = {
    # Auth
    ErrorCode.AUTH_NOT_AUTHENTICATED: NotAuthenticatedException,
    ErrorCode.AUTH_TOKEN_EXPIRED: NotAuthenticatedException,
    ErrorCode.AUTH_TOKEN_INVALID: NotAuthenticatedException,
    ErrorCode.AUTH_INVALID_CREDENTIALS: NotAuthenticatedException,
    # Authz
    ErrorCode.AUTHZ_FORBIDDEN: NotAuthorizedException,
    ErrorCode.AUTHZ_INSUFFICIENT_SCOPE: NotAuthorizedException,
    # Request
    ErrorCode.BAD_REQUEST: BadRequestException,
    ErrorCode.NOT_FOUND: NotFoundException,
    ErrorCode.CONFLICT: ConflictException,
    ErrorCode.VALIDATION_FAILED: ValidationException,
    ErrorCode.TOO_MANY_REQUESTS: TooManyRequestsException,
    # Network
    ErrorCode.NETWORK_ERROR: NetworkException,
    ErrorCode.NETWORK_CONNECT_TIMEOUT: ConnectTimeoutException,
    ErrorCode.NETWORK_READ_TIMEOUT: ReadTimeoutException,
    ErrorCode.NETWORK_WRITE_TIMEOUT: WriteTimeoutException,
    ErrorCode.NETWORK_CONNECTION_REFUSED: NetworkException,
    ErrorCode.NETWORK_DNS_FAILURE: NetworkException,
    # Upstream
    ErrorCode.UPSTREAM_SERVICE_ERROR: UpstreamServiceException,
    ErrorCode.UPSTREAM_TIMEOUT: UpstreamTimeoutException,
    ErrorCode.UPSTREAM_INVALID_RESPONSE: BadGatewayException,
    # Internal
    ErrorCode.INTERNAL_SERVER_ERROR: InternalServerException,
    ErrorCode.SERVICE_UNAVAILABLE: ServiceUnavailableException,
    ErrorCode.BAD_GATEWAY: BadGatewayException,
}


def create_exception(
    code: Union[ErrorCode, str],
    message: str,
    details: Optional[Dict[str, Any]] = None,
    request_id: Optional[str] = None,
) -> BaseHttpException:
    """
    Create an exception instance from code and message.

    Factory function for programmatic exception creation.

    Args:
        code: ErrorCode enum or string code
        message: Error message
        details: Optional additional context
        request_id: Optional correlation ID

    Returns:
        Appropriate exception subclass instance

    Example:
        exc = create_exception("NOT_FOUND", "User not found", {"userId": "123"})
    """
    # Normalize code to ErrorCode
    if isinstance(code, str):
        try:
            error_code = ErrorCode(code)
        except ValueError:
            logger.warning(f"Unknown error code: {code}, using INTERNAL_SERVER_ERROR")
            error_code = ErrorCode.INTERNAL_SERVER_ERROR
    else:
        error_code = code

    # Get exception class
    exc_class = _CODE_TO_EXCEPTION.get(error_code, BaseHttpException)

    logger.debug(f"Creating exception: {error_code.value} -> {exc_class.__name__}")

    # Create instance
    if exc_class == BaseHttpException:
        return BaseHttpException(
            code=error_code,
            message=message,
            details=details,
            request_id=request_id,
        )

    # Handle special cases with extra fields
    if exc_class == ValidationException and details and "errors" in details:
        return ValidationException(
            message=message,
            details=details,
            request_id=request_id,
        )

    if exc_class in (ConnectTimeoutException, ReadTimeoutException, WriteTimeoutException):
        service = details.get("service") if details else None
        timeout_ms = details.get("timeoutMs") if details else None
        return exc_class(
            message=message,
            service=service,
            timeout_ms=timeout_ms,
            details=details,
            request_id=request_id,
        )

    if exc_class == UpstreamServiceException:
        service = details.get("service") if details else None
        upstream_status = details.get("upstreamStatus") if details else None
        return exc_class(
            message=message,
            service=service,
            upstream_status=upstream_status,
            details=details,
            request_id=request_id,
        )

    if exc_class == NetworkException:
        service = details.get("service") if details else None
        original_error = details.get("originalError") if details else None
        return exc_class(
            message=message,
            service=service,
            original_error=original_error,
            code=error_code,
            details=details,
            request_id=request_id,
        )

    # Default construction
    return exc_class(
        message=message,
        details=details,
        request_id=request_id,
    )


def parse_error_response(
    json_data: Dict[str, Any],
) -> BaseHttpException:
    """
    Parse an error response JSON and reconstruct the exception.

    Useful for client-side error handling.

    Args:
        json_data: Error response dict {"error": {...}}

    Returns:
        Reconstructed exception instance

    Example:
        response = await client.get("/users/123")
        if response.status_code >= 400:
            exc = parse_error_response(response.json())
            raise exc
    """
    error = json_data.get("error", json_data)

    code = error.get("code", "INTERNAL_SERVER_ERROR")
    message = error.get("message", "Unknown error")
    details = error.get("details")
    request_id = error.get("requestId")

    logger.debug(f"Parsing error response: {code}")

    return create_exception(
        code=code,
        message=message,
        details=details,
        request_id=request_id,
    )


def is_common_exception(error: Exception) -> bool:
    """
    Check if an exception is a common exception.

    Type guard for exception handling.

    Args:
        error: Exception to check

    Returns:
        True if error is a BaseHttpException or subclass
    """
    return isinstance(error, BaseHttpException)


logger.debug("SDK factory initialized")
