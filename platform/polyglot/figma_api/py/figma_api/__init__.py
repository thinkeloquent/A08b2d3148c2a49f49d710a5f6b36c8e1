"""
Figma API SDK — Main Package Export (Python)

Unified export for all SDK modules.

Usage:
    from figma_api import FigmaClient, ProjectsClient

    async with FigmaClient(token="your-token") as client:
        projects = ProjectsClient(client)
        result = await projects.get_team_projects("team-id")
"""

from .config import DEFAULTS, Config
from .logger import SDKLogger, create_logger

# Middleware
from .middleware import register_error_handlers

# SDK exports
from .sdk import (
    # Errors
    ApiError,
    AuthenticationError,
    # Auth
    AuthError,
    AuthorizationError,
    CommentsClient,
    ComponentsClient,
    ConfigurationError,
    DevResourcesClient,
    # Core
    FigmaClient,
    FigmaError,
    FilesClient,
    LibraryAnalyticsClient,
    NetworkError,
    NotFoundError,
    # Domain clients
    ProjectsClient,
    RateLimitError,
    # Rate limiting
    RateLimitInfo,
    RateLimitOptions,
    # Cache
    RequestCache,
    ServerError,
    TimeoutError,
    TokenInfo,
    ValidationError,
    VariablesClient,
    WebhooksClient,
    # Retry
    calculate_backoff,
    handle_rate_limit,
    is_retryable,
    map_response_to_error,
    mask_token,
    parse_rate_limit_headers,
    resolve_token,
    should_auto_wait,
    wait_for_retry_after,
    with_retry,
)

# Server
from .server import create_app

__version__ = "1.0.0"

__all__ = [
    # Logger
    "SDKLogger",
    "create_logger",
    # Config
    "Config",
    "DEFAULTS",
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
    # Middleware
    "register_error_handlers",
    # Server
    "create_app",
]
