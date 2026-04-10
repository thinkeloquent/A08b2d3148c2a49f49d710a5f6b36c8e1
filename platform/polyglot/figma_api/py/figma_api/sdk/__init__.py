"""
SDK barrel exports — Figma API SDK
"""

# Core client
# Auth
from .auth import AuthError, TokenInfo, mask_token, resolve_token

# Cache
from .cache import RequestCache
from .client import FigmaClient
from .comments import CommentsClient
from .components import ComponentsClient
from .dev_resources import DevResourcesClient

# Errors
from .errors import (
    ApiError,
    AuthenticationError,
    AuthorizationError,
    ConfigurationError,
    FigmaError,
    NetworkError,
    NotFoundError,
    RateLimitError,
    ServerError,
    TimeoutError,
    ValidationError,
    map_response_to_error,
)
from .files import FilesClient
from .library_analytics import LibraryAnalyticsClient

# Domain clients
from .projects import ProjectsClient

# Rate limiting
from .rate_limit import (
    RateLimitInfo,
    RateLimitOptions,
    handle_rate_limit,
    parse_rate_limit_headers,
    should_auto_wait,
    wait_for_retry_after,
)

# Retry
from .retry import calculate_backoff, is_retryable, with_retry
from .variables import VariablesClient
from .webhooks import WebhooksClient

__all__ = [
    # Core
    "FigmaClient",
    # Auth
    "AuthError",
    "TokenInfo",
    "mask_token",
    "resolve_token",
    # Errors
    "ApiError",
    "AuthenticationError",
    "AuthorizationError",
    "ConfigurationError",
    "FigmaError",
    "NetworkError",
    "NotFoundError",
    "RateLimitError",
    "ServerError",
    "TimeoutError",
    "ValidationError",
    "map_response_to_error",
    # Rate limiting
    "RateLimitInfo",
    "RateLimitOptions",
    "handle_rate_limit",
    "parse_rate_limit_headers",
    "should_auto_wait",
    "wait_for_retry_after",
    # Cache
    "RequestCache",
    # Retry
    "calculate_backoff",
    "is_retryable",
    "with_retry",
    # Domain clients
    "ProjectsClient",
    "FilesClient",
    "CommentsClient",
    "ComponentsClient",
    "VariablesClient",
    "DevResourcesClient",
    "LibraryAnalyticsClient",
    "WebhooksClient",
]
