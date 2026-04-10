"""
Standardized error codes for common_exceptions.

Provides ErrorCode enum with 22 standardized codes across categories:
- Authentication & Authorization (AUTH_*, AUTHZ_*)
- Request Errors (BAD_REQUEST, NOT_FOUND, etc.)
- Network Errors (NETWORK_*)
- Upstream Errors (UPSTREAM_*)
- Internal Errors (INTERNAL_*, SERVICE_*, BAD_GATEWAY)
"""

from enum import Enum
from typing import Dict

from .logger import create

logger = create("common_exceptions", __file__)


class ErrorCode(str, Enum):
    """
    Standardized error codes for cross-framework exception handling.

    All codes follow the pattern: CATEGORY_SPECIFIC_ERROR
    Values are identical strings in Python and TypeScript for parity.
    """

    # Authentication & Authorization
    AUTH_NOT_AUTHENTICATED = "AUTH_NOT_AUTHENTICATED"
    AUTH_TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED"
    AUTH_TOKEN_INVALID = "AUTH_TOKEN_INVALID"
    AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS"
    AUTHZ_FORBIDDEN = "AUTHZ_FORBIDDEN"
    AUTHZ_INSUFFICIENT_SCOPE = "AUTHZ_INSUFFICIENT_SCOPE"

    # Request Errors
    BAD_REQUEST = "BAD_REQUEST"
    NOT_FOUND = "NOT_FOUND"
    CONFLICT = "CONFLICT"
    VALIDATION_FAILED = "VALIDATION_FAILED"
    TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS"

    # Network Errors
    NETWORK_ERROR = "NETWORK_ERROR"
    NETWORK_CONNECT_TIMEOUT = "NETWORK_CONNECT_TIMEOUT"
    NETWORK_READ_TIMEOUT = "NETWORK_READ_TIMEOUT"
    NETWORK_WRITE_TIMEOUT = "NETWORK_WRITE_TIMEOUT"
    NETWORK_CONNECTION_REFUSED = "NETWORK_CONNECTION_REFUSED"
    NETWORK_DNS_FAILURE = "NETWORK_DNS_FAILURE"

    # Upstream Errors
    UPSTREAM_SERVICE_ERROR = "UPSTREAM_SERVICE_ERROR"
    UPSTREAM_TIMEOUT = "UPSTREAM_TIMEOUT"
    UPSTREAM_INVALID_RESPONSE = "UPSTREAM_INVALID_RESPONSE"

    # Internal Errors
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    BAD_GATEWAY = "BAD_GATEWAY"


# Error code to HTTP status mapping
_CODE_TO_STATUS: Dict[ErrorCode, int] = {
    # Auth errors -> 401
    ErrorCode.AUTH_NOT_AUTHENTICATED: 401,
    ErrorCode.AUTH_TOKEN_EXPIRED: 401,
    ErrorCode.AUTH_TOKEN_INVALID: 401,
    ErrorCode.AUTH_INVALID_CREDENTIALS: 401,
    # Authz errors -> 403
    ErrorCode.AUTHZ_FORBIDDEN: 403,
    ErrorCode.AUTHZ_INSUFFICIENT_SCOPE: 403,
    # Request errors
    ErrorCode.BAD_REQUEST: 400,
    ErrorCode.NOT_FOUND: 404,
    ErrorCode.CONFLICT: 409,
    ErrorCode.VALIDATION_FAILED: 422,
    ErrorCode.TOO_MANY_REQUESTS: 429,
    # Network errors -> 503 (connect) or 504 (read/write)
    ErrorCode.NETWORK_ERROR: 503,
    ErrorCode.NETWORK_CONNECT_TIMEOUT: 503,
    ErrorCode.NETWORK_READ_TIMEOUT: 504,
    ErrorCode.NETWORK_WRITE_TIMEOUT: 504,
    ErrorCode.NETWORK_CONNECTION_REFUSED: 503,
    ErrorCode.NETWORK_DNS_FAILURE: 503,
    # Upstream errors
    ErrorCode.UPSTREAM_SERVICE_ERROR: 502,
    ErrorCode.UPSTREAM_TIMEOUT: 504,
    ErrorCode.UPSTREAM_INVALID_RESPONSE: 502,
    # Internal errors
    ErrorCode.INTERNAL_SERVER_ERROR: 500,
    ErrorCode.SERVICE_UNAVAILABLE: 503,
    ErrorCode.BAD_GATEWAY: 502,
}


def get_status_for_code(code: ErrorCode) -> int:
    """
    Get the HTTP status code for a given error code.

    Args:
        code: ErrorCode enum value

    Returns:
        HTTP status code (400-599)

    Example:
        status = get_status_for_code(ErrorCode.NOT_FOUND)  # Returns 404
    """
    status = _CODE_TO_STATUS.get(code, 500)
    logger.debug(f"Mapped {code.value} to HTTP {status}")
    return status


def get_code_category(code: ErrorCode) -> str:
    """
    Get the category of an error code.

    Args:
        code: ErrorCode enum value

    Returns:
        Category string (auth, authz, request, network, upstream, internal)
    """
    code_str = code.value
    if code_str.startswith("AUTH_"):
        return "auth"
    elif code_str.startswith("AUTHZ_"):
        return "authz"
    elif code_str.startswith("NETWORK_"):
        return "network"
    elif code_str.startswith("UPSTREAM_"):
        return "upstream"
    elif code_str in ("INTERNAL_SERVER_ERROR", "SERVICE_UNAVAILABLE", "BAD_GATEWAY"):
        return "internal"
    else:
        return "request"


# Log enum initialization
logger.debug(f"ErrorCode enum initialized with {len(ErrorCode)} codes")
