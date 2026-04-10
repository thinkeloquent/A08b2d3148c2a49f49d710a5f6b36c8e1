"""
HTTPX error wrappers for common_exceptions.

Provides decorator and utilities to wrap HTTPX exceptions.
"""

import functools
from typing import Any, Callable, Optional, TypeVar, Union
from urllib.parse import urlparse

from ..base import BaseHttpException
from ..codes import ErrorCode
from ..inbound import BadRequestException
from ..internal import BadGatewayException
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

# Type variable for generic function wrapping
F = TypeVar("F", bound=Callable[..., Any])


def extract_service_from_url(url: Union[str, Any]) -> str:
    """
    Extract service name from URL.

    Args:
        url: URL string or httpx URL object

    Returns:
        Service name (hostname)
    """
    try:
        url_str = str(url)
        parsed = urlparse(url_str)
        return parsed.netloc or parsed.path.split("/")[0] or "unknown"
    except Exception:
        return "unknown"


def httpx_error_to_exception(
    error: Exception,
    service: Optional[str] = None,
    operation: Optional[str] = None,
) -> BaseHttpException:
    """
    Convert an HTTPX exception to a common exception.

    Args:
        error: HTTPX exception
        service: Optional service name override
        operation: Optional operation name

    Returns:
        Appropriate BaseHttpException subclass
    """
    # Import httpx here to avoid hard dependency
    try:
        import httpx
    except ImportError:
        logger.error("httpx not installed, cannot convert error")
        return NetworkException(
            message=str(error),
            service=service,
            original_error=type(error).__name__,
        )

    error_type = type(error).__name__
    logger.debug(f"Converting HTTPX error: {error_type}")

    # Extract service from error if available
    if service is None and hasattr(error, "request") and error.request:
        service = extract_service_from_url(error.request.url)

    # Map HTTPX exceptions to common exceptions
    if isinstance(error, httpx.ConnectTimeout):
        return ConnectTimeoutException(
            service=service,
            timeout_ms=_extract_timeout(error),
        )

    if isinstance(error, httpx.ReadTimeout):
        return ReadTimeoutException(
            service=service,
            timeout_ms=_extract_timeout(error),
        )

    if isinstance(error, httpx.WriteTimeout):
        return WriteTimeoutException(
            service=service,
            timeout_ms=_extract_timeout(error),
        )

    if isinstance(error, httpx.PoolTimeout):
        # Pool exhaustion treated as connect timeout
        return ConnectTimeoutException(
            message="Connection pool exhausted",
            service=service,
            timeout_ms=_extract_timeout(error),
        )

    if isinstance(error, httpx.TimeoutException):
        # Generic timeout
        return UpstreamTimeoutException(
            service=service,
            operation=operation,
            timeout_ms=_extract_timeout(error),
        )

    if isinstance(error, httpx.HTTPStatusError):
        return UpstreamServiceException(
            service=service,
            operation=operation,
            upstream_status=error.response.status_code,
        )

    if isinstance(error, httpx.ConnectError):
        return NetworkException(
            message="Connection refused",
            service=service,
            original_error=str(error),
            code=ErrorCode.NETWORK_CONNECTION_REFUSED,
        )

    if isinstance(error, httpx.RemoteProtocolError):
        return BadGatewayException(
            message="Invalid response from upstream",
            details={"service": service, "error": str(error)} if service else None,
        )

    if isinstance(error, (httpx.InvalidURL, httpx.UnsupportedProtocol)):
        return BadRequestException(
            message=f"Invalid URL: {error}",
        )

    if isinstance(error, (httpx.ReadError, httpx.WriteError)):
        return NetworkException(
            message=str(error),
            service=service,
            original_error=error_type,
        )

    if isinstance(error, httpx.ProxyError):
        return NetworkException(
            message="Proxy error",
            service=service,
            original_error=str(error),
        )

    # Generic network error for other HTTPX errors
    if isinstance(error, (httpx.HTTPError, httpx.RequestError)):
        return NetworkException(
            message=str(error),
            service=service,
            original_error=error_type,
        )

    # Unknown error type
    return NetworkException(
        message=str(error),
        service=service,
        original_error=error_type,
    )


def _extract_timeout(error: Exception) -> Optional[int]:
    """Extract timeout value from error if available."""
    # HTTPX doesn't expose timeout value directly on exceptions
    # Return None to indicate unknown
    return None


def wrap_httpx_errors(
    service: Optional[str] = None,
    operation: Optional[str] = None,
) -> Callable[[F], F]:
    """
    Decorator to wrap HTTPX errors as common exceptions.

    Args:
        service: Optional service name (extracted from URL if not provided)
        operation: Optional operation name for context

    Returns:
        Decorated function that converts HTTPX errors

    Example:
        @wrap_httpx_errors(service="user-service")
        async def get_user(user_id: str):
            async with httpx.AsyncClient() as client:
                response = await client.get(f"/users/{user_id}")
                response.raise_for_status()
                return response.json()
    """
    try:
        import httpx
        httpx_available = True
    except ImportError:
        httpx_available = False

    def decorator(func: F) -> F:
        @functools.wraps(func)
        async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
            if not httpx_available:
                return await func(*args, **kwargs)

            try:
                return await func(*args, **kwargs)
            except httpx.HTTPError as e:
                logger.debug(f"Caught HTTPX error in {func.__name__}: {type(e).__name__}")
                raise httpx_error_to_exception(e, service, operation) from e

        @functools.wraps(func)
        def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
            if not httpx_available:
                return func(*args, **kwargs)

            try:
                return func(*args, **kwargs)
            except httpx.HTTPError as e:
                logger.debug(f"Caught HTTPX error in {func.__name__}: {type(e).__name__}")
                raise httpx_error_to_exception(e, service, operation) from e

        # Return appropriate wrapper based on function type
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper  # type: ignore
        return sync_wrapper  # type: ignore

    return decorator


logger.debug("HTTPX wrappers initialized")
