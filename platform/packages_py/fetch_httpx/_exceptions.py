"""
Exception Hierarchy for fetch_httpx package.

This module defines all exceptions that can be raised by the HTTP client,
organized in a hierarchy that allows for fine-grained or broad exception handling.

Exception Hierarchy:
    HTTPError
    ├── RequestError
    │   ├── TransportError
    │   │   ├── TimeoutException
    │   │   │   ├── ConnectTimeout
    │   │   │   ├── ReadTimeout
    │   │   │   ├── WriteTimeout
    │   │   │   └── PoolTimeout
    │   │   ├── NetworkError
    │   │   │   ├── ConnectError
    │   │   │   ├── ReadError
    │   │   │   └── WriteError
    │   │   ├── ProtocolError
    │   │   └── ProxyError
    │   ├── DecodingError
    │   └── TooManyRedirects
    ├── HTTPStatusError
    ├── StreamError
    │   ├── StreamConsumed
    │   ├── StreamClosed
    │   └── ResponseNotRead
    ├── CacheError
    │   ├── CacheStorageError
    │   │   ├── CacheReadError
    │   │   └── CacheWriteError
    │   ├── CacheSerializationError
    │   └── CacheKeyError
    ├── InvalidURL
    └── CookieConflict
"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ._models import Request, Response


# =============================================================================
# Base Exception
# =============================================================================

class HTTPError(Exception):
    """
    Base exception for all HTTP-related errors.

    All exceptions raised by fetch_httpx inherit from this class,
    allowing for broad exception handling when needed.
    """

    def __init__(self, message: str = "") -> None:
        super().__init__(message)
        self.message = message

    def __str__(self) -> str:
        return self.message

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}({self.message!r})"


# =============================================================================
# Request Errors
# =============================================================================

class RequestError(HTTPError):
    """
    Base exception for errors that occur while making a request.

    Includes the request object that was being sent when the error occurred.
    """

    def __init__(
        self,
        message: str = "",
        *,
        request: Request | None = None,
    ) -> None:
        super().__init__(message)
        self._request = request

    @property
    def request(self) -> Request | None:
        """The request that was being sent."""
        return self._request

    @request.setter
    def request(self, value: Request) -> None:
        self._request = value


# =============================================================================
# Transport Errors
# =============================================================================

class TransportError(RequestError):
    """
    Base exception for transport-level errors.

    These errors occur at the network layer, before an HTTP response is received.
    """
    pass


class TimeoutException(TransportError):
    """
    Base exception for timeout errors.

    Raised when an operation times out without completing.
    """
    pass


class ConnectTimeout(TimeoutException):
    """
    Raised when a connection cannot be established within the timeout period.

    This indicates the server is unreachable or not responding.
    """
    pass


class ReadTimeout(TimeoutException):
    """
    Raised when no data is received within the read timeout period.

    The connection was established, but the server is not sending data fast enough.
    """
    pass


class WriteTimeout(TimeoutException):
    """
    Raised when data cannot be sent within the write timeout period.

    The connection was established, but data cannot be written fast enough.
    """
    pass


class PoolTimeout(TimeoutException):
    """
    Raised when no connection becomes available within the pool timeout period.

    All connections in the pool are busy and a new connection cannot be created.
    """
    pass


class NetworkError(TransportError):
    """
    Base exception for network-level errors.

    These errors indicate problems with the network connection.
    """
    pass


class ConnectError(NetworkError):
    """
    Raised when a connection cannot be established.

    This may be due to DNS resolution failure, connection refused, etc.
    """
    pass


class ReadError(NetworkError):
    """
    Raised when an error occurs while reading from the network.

    The connection was lost or reset while receiving data.
    """
    pass


class WriteError(NetworkError):
    """
    Raised when an error occurs while writing to the network.

    The connection was lost or reset while sending data.
    """
    pass


class ProtocolError(TransportError):
    """
    Raised when a protocol-level error occurs.

    This indicates malformed HTTP data or protocol violations.
    """
    pass


class ProxyError(TransportError):
    """
    Raised when an error occurs while connecting through a proxy.

    The proxy server rejected the connection or is misconfigured.
    """
    pass


# =============================================================================
# Other Request Errors
# =============================================================================

class DecodingError(RequestError):
    """
    Raised when response content cannot be decoded.

    This may occur when parsing JSON, decoding text with wrong charset, etc.
    """
    pass


class TooManyRedirects(RequestError):
    """
    Raised when the maximum number of redirects is exceeded.

    This prevents infinite redirect loops.
    """
    pass


# =============================================================================
# HTTP Status Errors
# =============================================================================

class HTTPStatusError(HTTPError):
    """
    Raised when Response.raise_for_status() is called on a 4xx or 5xx response.

    Includes both the request and response objects for inspection.

    Attributes:
        request: The request that was sent
        response: The response that was received
    """

    def __init__(
        self,
        message: str = "",
        *,
        request: Request | None = None,
        response: Response | None = None,
    ) -> None:
        super().__init__(message)
        self._request = request
        self._response = response

    @property
    def request(self) -> Request | None:
        """The request that was sent."""
        return self._request

    @property
    def response(self) -> Response | None:
        """The error response that was received."""
        return self._response

    def __str__(self) -> str:
        if self._response is not None:
            status = self._response.status_code
            reason = getattr(self._response, 'reason_phrase', '')
            if reason:
                return f"{status} {reason}: {self.message}"
            return f"{status}: {self.message}"
        return self.message


# =============================================================================
# Stream Errors
# =============================================================================

class StreamError(HTTPError):
    """
    Base exception for stream-related errors.

    These errors occur when working with streaming responses.
    """
    pass


class StreamConsumed(StreamError):
    """
    Raised when attempting to read a stream that has already been consumed.

    Streams can only be iterated once. Create a new request to read again.
    """

    def __init__(self, message: str = "Stream has already been consumed") -> None:
        super().__init__(message)


class StreamClosed(StreamError):
    """
    Raised when attempting to read from a closed stream.

    The stream was closed before all data was read.
    """

    def __init__(self, message: str = "Stream has been closed") -> None:
        super().__init__(message)


class ResponseNotRead(StreamError):
    """
    Raised when accessing response content before the stream is read.

    For streaming responses, content must be explicitly read before accessing.
    """

    def __init__(self, message: str = "Response content has not been read") -> None:
        super().__init__(message)


# =============================================================================
# Standalone Exceptions
# =============================================================================

class InvalidURL(HTTPError):
    """
    Raised when a URL is malformed or invalid.

    This is raised during URL parsing, before any request is made.
    """
    pass


class CookieConflict(HTTPError):
    """
    Raised when there are conflicting cookies.

    This may occur when cookies with the same name but different attributes
    are set in a way that creates ambiguity.
    """
    pass


# =============================================================================
# Cache Exceptions
# =============================================================================

class CacheError(HTTPError):
    """
    Base exception for cache-related errors.

    All cache exceptions inherit from this class, allowing for broad
    cache error handling when needed.

    Attributes:
        operation: The cache operation that failed (get, set, delete, etc.)
        key: The cache key involved (if applicable)
        original_error: The underlying exception that caused this error
    """

    def __init__(
        self,
        message: str = "",
        *,
        operation: str | None = None,
        key: str | None = None,
        original_error: BaseException | None = None,
    ) -> None:
        super().__init__(message)
        self.operation = operation
        self.key = key
        self.original_error = original_error

    def __str__(self) -> str:
        parts = [self.message]
        if self.operation:
            parts.append(f"operation={self.operation}")
        if self.key:
            key_display = self.key[:50] + "..." if len(self.key) > 50 else self.key
            parts.append(f"key={key_display}")
        if self.original_error:
            parts.append(f"caused_by={type(self.original_error).__name__}: {self.original_error}")
        return " | ".join(parts)


class CacheStorageError(CacheError):
    """
    Raised when a cache storage operation fails.

    This indicates problems with the underlying storage backend
    (memory, file, Redis, etc.).
    """
    pass


class CacheReadError(CacheStorageError):
    """
    Raised when reading from cache storage fails.

    The cache entry may exist but cannot be retrieved.
    """
    pass


class CacheWriteError(CacheStorageError):
    """
    Raised when writing to cache storage fails.

    The response could not be stored in the cache.
    """
    pass


class CacheSerializationError(CacheError):
    """
    Raised when serializing or deserializing cache data fails.

    This may occur when converting response data to/from JSON,
    or when the cached data is corrupted.
    """
    pass


class CacheKeyError(CacheError):
    """
    Raised when cache key generation fails.

    This may occur when the request data cannot be hashed or
    the key strategy encounters invalid input.
    """
    pass


# =============================================================================
# Exception Mapping Utilities
# =============================================================================

def map_exception(exc: Exception, request: Request | None = None) -> HTTPError:
    """
    Map an exception from the underlying HTTP library to our exception hierarchy.

    This is used to normalize exceptions from httpx, aiohttp, or other backends.

    Args:
        exc: The original exception
        request: Optional request that was being made when error occurred

    Returns:
        An HTTPError subclass instance with request context if available
    """
    exc_type = type(exc).__name__
    exc_message = str(exc)

    # Build a detailed message if the original is empty
    if not exc_message:
        exc_message = f"{exc_type}: {repr(exc)}"
        # Try to extract more context from the exception
        if hasattr(exc, "__cause__") and exc.__cause__:
            exc_message = f"{exc_type}: {exc.__cause__}"
        elif hasattr(exc, "args") and exc.args:
            exc_message = f"{exc_type}: {exc.args}"

    # Helper to create exception with request context
    def create_request_error(error_class: type[RequestError], message: str) -> RequestError:
        error = error_class(message, request=request)
        return error

    # Timeout exceptions
    if "timeout" in exc_type.lower() or "timeout" in exc_message.lower():
        if "connect" in exc_message.lower():
            return create_request_error(ConnectTimeout, exc_message)
        if "read" in exc_message.lower():
            return create_request_error(ReadTimeout, exc_message)
        if "write" in exc_message.lower():
            return create_request_error(WriteTimeout, exc_message)
        if "pool" in exc_message.lower():
            return create_request_error(PoolTimeout, exc_message)
        return create_request_error(TimeoutException, exc_message)

    # Read/Write errors (check before generic network)
    if "readerror" in exc_type.lower() or "read" in exc_type.lower():
        return create_request_error(ReadError, exc_message)

    if "writeerror" in exc_type.lower() or "write" in exc_type.lower():
        return create_request_error(WriteError, exc_message)

    # Connection exceptions
    if "connect" in exc_type.lower() or "connection" in exc_type.lower():
        return create_request_error(ConnectError, exc_message)

    # Generic network exceptions
    if "network" in exc_type.lower() or "socket" in exc_type.lower():
        return create_request_error(NetworkError, exc_message)

    # Protocol exceptions
    if "protocol" in exc_type.lower() or "http" in exc_type.lower():
        return create_request_error(ProtocolError, exc_message)

    # Proxy exceptions
    if "proxy" in exc_type.lower():
        return create_request_error(ProxyError, exc_message)

    # Default to generic transport error with original exception info
    return create_request_error(TransportError, exc_message)


__all__ = [
    # Base
    "HTTPError",
    # Request errors
    "RequestError",
    "TransportError",
    "DecodingError",
    "TooManyRedirects",
    # Timeout errors
    "TimeoutException",
    "ConnectTimeout",
    "ReadTimeout",
    "WriteTimeout",
    "PoolTimeout",
    # Network errors
    "NetworkError",
    "ConnectError",
    "ReadError",
    "WriteError",
    # Other transport errors
    "ProtocolError",
    "ProxyError",
    # Status errors
    "HTTPStatusError",
    # Stream errors
    "StreamError",
    "StreamConsumed",
    "StreamClosed",
    "ResponseNotRead",
    # Standalone
    "InvalidURL",
    "CookieConflict",
    # Cache errors
    "CacheError",
    "CacheStorageError",
    "CacheReadError",
    "CacheWriteError",
    "CacheSerializationError",
    "CacheKeyError",
    # Utilities
    "map_exception",
]
