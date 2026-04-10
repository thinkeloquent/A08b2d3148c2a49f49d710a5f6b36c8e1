"""fetch_http_cache_response — Polyglot HTTP client with S3 response caching."""

from .types import (
    AuthRefreshConfig,
    CacheResponseConfig,
    CachedHttpResponse,
    FetchResult,
    HttpFetchConfig,
    RetryConfig,
    SDKConfig,
)
from .exceptions import (
    FetchCacheAuthError,
    FetchCacheConfigError,
    FetchCacheError,
    FetchCacheNetworkError,
    FetchCacheStorageError,
    FetchCacheTimeoutError,
)
from .token_manager import (
    CallableTokenStrategy,
    ComputedTokenStrategy,
    StaticTokenStrategy,
    TokenRefreshManager,
    TokenStrategy,
    create_token_manager,
    create_token_strategy,
)
from .client import FetchHttpCacheClient
from .sdk import (
    create_fetch_cache_sdk,
    create_fetch_cache_sdk_from_env,
    create_fetch_cache_sdk_from_yaml,
    fetch_cached,
    invalidate_cache,
)
from .adapters import create_computed_provider, create_fastapi_adapter

__version__ = "1.0.0"

__all__ = [
    # Types & Config
    "HttpFetchConfig",
    "AuthRefreshConfig",
    "CacheResponseConfig",
    "RetryConfig",
    "SDKConfig",
    # Response types
    "CachedHttpResponse",
    "FetchResult",
    # Exceptions
    "FetchCacheError",
    "FetchCacheConfigError",
    "FetchCacheAuthError",
    "FetchCacheNetworkError",
    "FetchCacheStorageError",
    "FetchCacheTimeoutError",
    # Token management
    "TokenStrategy",
    "StaticTokenStrategy",
    "CallableTokenStrategy",
    "ComputedTokenStrategy",
    "TokenRefreshManager",
    "create_token_strategy",
    "create_token_manager",
    # Client
    "FetchHttpCacheClient",
    # SDK
    "create_fetch_cache_sdk",
    "create_fetch_cache_sdk_from_yaml",
    "create_fetch_cache_sdk_from_env",
    "fetch_cached",
    "invalidate_cache",
    # Adapters
    "create_fastapi_adapter",
    "create_computed_provider",
]
