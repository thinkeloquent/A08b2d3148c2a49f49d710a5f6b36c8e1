"""Static App Loader - Polyglot module for FastAPI with SPA routing and template engines.

This module provides a unified interface for serving static frontend applications
with FastAPI, supporting SPA routing, template engines, and multi-app registration.

Example:
    >>> from fastapi import FastAPI
    >>> from static_app_loader import register_static_app, StaticLoaderOptions
    >>>
    >>> app = FastAPI()
    >>> register_static_app(app, StaticLoaderOptions(
    ...     app_name='dashboard',
    ...     root_path='/var/www/dashboard/dist',
    ...     spa_mode=True,
    ... ))

Example with SDK builder:
    >>> from static_app_loader import create_static_app_loader, register_static_app
    >>>
    >>> config = (
    ...     create_static_app_loader()
    ...     .app_name('dashboard')
    ...     .root_path('/var/www/dashboard/dist')
    ...     .spa_mode(True)
    ...     .build()
    ... )
    >>> register_static_app(app, config)
"""

__version__ = "1.0.0"

# Export FastAPI registration functions
# Export logger utilities
from . import logger

# Export errors
from .errors import (
    ConfigValidationError,
    IndexNotFoundError,
    RouteCollisionError,
    StaticAppLoaderError,
    StaticPathNotFoundError,
    UnsupportedTemplateEngineError,
)
from .fastapi import (
    clear_path_cache,
    get_registered_prefixes,
    register_multiple_apps,
    register_static_app,
    reset_registered_prefixes,
)

# Export path rewriter utilities
from .path_rewriter import (
    clear_cache,
    get_cache_size,
    rewrite_html_paths,
    rewrite_html_paths_cached,
)

# Export SDK builders
from .sdk import (
    MultiAppBuilder,
    StaticAppLoaderBuilder,
    create_multi_app_loader,
    create_static_app_loader,
    validate_config,
)

# Export template utilities
from .template_resolver import (
    inject_initial_state,
    render_template,
    resolve_template_engine,
)

# Export types and models
from .types import (
    CollisionStrategy,
    ILogger,
    MultiAppOptions,
    PathRewriteOptions,
    RegisterResult,
    RenderContext,
    StaticLoaderOptions,
    TemplateEngine,
)

__all__ = [
    # Version
    "__version__",
    # FastAPI functions
    "register_static_app",
    "register_multiple_apps",
    "clear_path_cache",
    "get_registered_prefixes",
    "reset_registered_prefixes",
    # Types
    "StaticLoaderOptions",
    "MultiAppOptions",
    "RegisterResult",
    "RenderContext",
    "PathRewriteOptions",
    "ILogger",
    "TemplateEngine",
    "CollisionStrategy",
    # Errors
    "StaticAppLoaderError",
    "StaticPathNotFoundError",
    "UnsupportedTemplateEngineError",
    "RouteCollisionError",
    "ConfigValidationError",
    "IndexNotFoundError",
    # Logger
    "logger",
    # Path rewriter
    "rewrite_html_paths",
    "rewrite_html_paths_cached",
    "clear_cache",
    "get_cache_size",
    # Template utilities
    "resolve_template_engine",
    "render_template",
    "inject_initial_state",
    # SDK
    "create_static_app_loader",
    "create_multi_app_loader",
    "validate_config",
    "StaticAppLoaderBuilder",
    "MultiAppBuilder",
]
