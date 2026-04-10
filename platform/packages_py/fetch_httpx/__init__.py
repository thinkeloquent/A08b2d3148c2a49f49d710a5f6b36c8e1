"""
fetch_httpx - A feature-complete HTTP client package.

A polyglot HTTP client library providing:
- Async and sync HTTP clients
- Connection pooling and keep-alive
- Authentication (Basic, Digest, Bearer)
- TLS/SSL with client certificates (mTLS)
- Proxy support
- Timeout configuration
- Redirect handling
- Streaming support
- Framework integrations (FastAPI)
- SDK utilities for building API clients
- AI agent integration utilities

Quick Start:
    # Async usage
    from fetch_httpx import AsyncClient

    async with AsyncClient() as client:
        response = await client.get("https://httpbin.org/get")
        print(response.json())

    # Sync usage
    from fetch_httpx import Client

    with Client(
        base_url="https://api.example.com",
        auth=BasicAuth("*****", "*****"),
        timeout=Timeout(connect=5.0, read=30.0),
    ) as client:
        response = client.get("https://httpbin.org/get")
        print(response.json())

    # With configuration
    from fetch_httpx import AsyncClient, Timeout, BasicAuth

    async with AsyncClient(
        base_url="https://api.example.com",
        auth=BasicAuth("*****", "*****"),
        timeout=Timeout(connect=5.0, read=30.0),
    ) as client:
        response = await client.post("/users", json={"name": "John"})
        response.raise_for_status()
        data = response.json()

Environment Variables:
    LOG_LEVEL: TRACE, DEBUG, INFO, WARN, ERROR, SILENT (default: INFO)
    LOG_FORMAT: json, pretty (default: pretty in dev, json in prod)
    PYTHON_ENV: development, production (default: development)
    HTTP_PROXY: HTTP proxy URL
    HTTPS_PROXY: HTTPS proxy URL
    NO_PROXY: Comma-separated hosts to bypass proxy
"""

__version__ = "1.0.0"
__author__ = "fetch_httpx contributors"

# =============================================================================
# Core Imports
# =============================================================================

# Client
# Authentication
from ._auth import (
    Auth,
    BasicAuth,
    BearerAuth,
    DigestAuth,
)

# Cache
from ._cache import (
    CacheConfig,
    CacheEntry,
    CacheEntryMetadata,
    CacheKeyStrategy,
    CacheManager,
    CacheStats,
    CacheStorage,
    CachingClient,
    MemoryStorage,
    RequestCacheOptions,
    cached,
    combine_key_strategies,
    create_cache_aware_client,
    create_cache_hooks,
    create_dot_notation_key_strategy,
    create_hashed_key_strategy,
    default_key_strategy,
    with_cache,
)
from ._client import (
    IDEMPOTENT_METHODS,
    SAFE_METHODS,
    AsyncClient,
    CircuitBreaker,
    CircuitBreakerConfig,
    CircuitOpenError,
    CircuitState,
    Client,
    JitterStrategy,
    RetryConfig,
)

# Configuration
from ._config import (
    DEFAULT_LIMITS,
    DEFAULT_TIMEOUT,
    Limits,
    Proxy,
    Timeout,
)

# Exceptions
from ._exceptions import (
    CacheError,
    CacheKeyError,
    CacheReadError,
    CacheSerializationError,
    CacheStorageError,
    CacheWriteError,
    ConnectError,
    ConnectTimeout,
    CookieConflict,
    DecodingError,
    HTTPError,
    HTTPStatusError,
    InvalidURL,
    NetworkError,
    PoolTimeout,
    ProtocolError,
    ProxyError,
    ReadError,
    ReadTimeout,
    RequestError,
    ResponseNotRead,
    StreamClosed,
    StreamConsumed,
    StreamError,
    TimeoutException,
    TooManyRedirects,
    TransportError,
    WriteError,
    WriteTimeout,
)

# Models
from ._models import (
    URL,
    Cookies,
    Headers,
    QueryParams,
    Request,
    Response,
)

# TLS
from ._tls import (
    SSLContextBuilder,
    create_ssl_context,
    load_ca_bundle,
    load_client_cert,
)

# Transports
from ._transports import (
    AsyncBaseTransport,
    AsyncHTTPTransport,
    BaseTransport,
    HTTPTransport,
    MountRouter,
)

# Logger
from .logger import (
    Logger,
    LogLevel,
)
from .logger import (
    create as create_logger,
)

# =============================================================================
# Public API
# =============================================================================

__all__ = [
    # Version
    "__version__",
    # Client
    "AsyncClient",
    "Client",
    # Retry & Resilience
    "RetryConfig",
    "JitterStrategy",
    "CircuitBreaker",
    "CircuitBreakerConfig",
    "CircuitState",
    "CircuitOpenError",
    "SAFE_METHODS",
    "IDEMPOTENT_METHODS",
    # Models
    "URL",
    "Headers",
    "QueryParams",
    "Cookies",
    "Request",
    "Response",
    # Configuration
    "Timeout",
    "Limits",
    "Proxy",
    "DEFAULT_TIMEOUT",
    "DEFAULT_LIMITS",
    # Authentication
    "Auth",
    "BasicAuth",
    "DigestAuth",
    "BearerAuth",
    # Exceptions - Base
    "HTTPError",
    "RequestError",
    "TransportError",
    # Exceptions - Timeout
    "TimeoutException",
    "ConnectTimeout",
    "ReadTimeout",
    "WriteTimeout",
    "PoolTimeout",
    # Exceptions - Network
    "NetworkError",
    "ConnectError",
    "ReadError",
    "WriteError",
    # Exceptions - Other
    "ProtocolError",
    "ProxyError",
    "DecodingError",
    "TooManyRedirects",
    "HTTPStatusError",
    # Exceptions - Stream
    "StreamError",
    "StreamConsumed",
    "StreamClosed",
    "ResponseNotRead",
    # Exceptions - Standalone
    "InvalidURL",
    "CookieConflict",
    # Exceptions - Cache
    "CacheError",
    "CacheStorageError",
    "CacheReadError",
    "CacheWriteError",
    "CacheSerializationError",
    "CacheKeyError",
    # Logger
    "LogLevel",
    "Logger",
    "create_logger",
    # TLS
    "SSLContextBuilder",
    "create_ssl_context",
    "load_ca_bundle",
    "load_client_cert",
    # Transports
    "BaseTransport",
    "AsyncBaseTransport",
    "HTTPTransport",
    "AsyncHTTPTransport",
    "MountRouter",
    # Cache
    "CacheConfig",
    "CacheEntry",
    "CacheEntryMetadata",
    "CacheKeyStrategy",
    "CacheManager",
    "CacheStats",
    "CacheStorage",
    "CachingClient",
    "MemoryStorage",
    "RequestCacheOptions",
    "cached",
    "with_cache",
    "create_cache_hooks",
    "create_cache_aware_client",
    "default_key_strategy",
    "create_dot_notation_key_strategy",
    "create_hashed_key_strategy",
    "combine_key_strategies",
]


# =============================================================================
# Convenience Function Imports
# =============================================================================

def get(url: str, **kwargs) -> Response:
    """
    Send a GET request (convenience function).

    Creates a temporary client for the request.
    For multiple requests, use Client context manager instead.

    Args:
        url: Request URL
        **kwargs: Additional arguments for request

    Returns:
        Response object
    """
    with Client() as client:
        return client.get(url, **kwargs)


def post(url: str, **kwargs) -> Response:
    """Send a POST request (convenience function)."""
    with Client() as client:
        return client.post(url, **kwargs)


def put(url: str, **kwargs) -> Response:
    """Send a PUT request (convenience function)."""
    with Client() as client:
        return client.put(url, **kwargs)


def patch(url: str, **kwargs) -> Response:
    """Send a PATCH request (convenience function)."""
    with Client() as client:
        return client.patch(url, **kwargs)


def delete(url: str, **kwargs) -> Response:
    """Send a DELETE request (convenience function)."""
    with Client() as client:
        return client.delete(url, **kwargs)


def head(url: str, **kwargs) -> Response:
    """Send a HEAD request (convenience function)."""
    with Client() as client:
        return client.head(url, **kwargs)


def options(url: str, **kwargs) -> Response:
    """Send an OPTIONS request (convenience function)."""
    with Client() as client:
        return client.options(url, **kwargs)


# Add convenience functions to exports
__all__.extend([
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "head",
    "options",
])

