"""Exception hierarchy for fetch_http_cache_response."""


class FetchCacheError(Exception):
    """Base exception for all fetch-cache errors."""

    def __init__(self, message: str, cause: Exception | None = None):
        super().__init__(message)
        self.__cause__ = cause


class FetchCacheConfigError(FetchCacheError):
    """Invalid configuration."""


class FetchCacheAuthError(FetchCacheError):
    """Token refresh or auth failure."""


class FetchCacheNetworkError(FetchCacheError):
    """HTTP transport error (wraps httpx/undici errors)."""


class FetchCacheStorageError(FetchCacheError):
    """S3 read/write failure."""


class FetchCacheTimeoutError(FetchCacheError):
    """Request timeout."""
