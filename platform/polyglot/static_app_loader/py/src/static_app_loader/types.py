"""Type definitions and Pydantic models for static app loader."""

from typing import Any, Dict, Literal, Optional, Protocol, runtime_checkable

from pydantic import BaseModel, Field


@runtime_checkable
class ILogger(Protocol):
    """Logger interface for consistent structured logging across the module.

    Implementations must support all log levels with contextual output.
    """

    def info(self, message: str, context: dict[str, Any] | None = None) -> None:
        """Log an info message."""
        ...

    def warn(self, message: str, context: dict[str, Any] | None = None) -> None:
        """Log a warning message."""
        ...

    def error(self, message: str, context: dict[str, Any] | None = None) -> None:
        """Log an error message."""
        ...

    def debug(self, message: str, context: dict[str, Any] | None = None) -> None:
        """Log a debug message."""
        ...

    def trace(self, message: str, context: dict[str, Any] | None = None) -> None:
        """Log a trace message."""
        ...


TemplateEngine = Literal["mustache", "liquid", "edge", "none"]
CollisionStrategy = Literal["error", "warn", "skip"]


class StaticLoaderOptions(BaseModel):
    """Configuration options for static app loader.

    Attributes:
        app_name: Required unique app identifier used in route prefix.
        root_path: Required absolute path to frontend dist/ directory.
        template_engine: Template engine to use for index.html. Default: 'none'.
        url_prefix: URL prefix for static assets. Default: '/assets'.
        default_context: Default context data for template rendering. Default: {}.
        spa_mode: Enable SPA catch-all routing. Default: True.
        max_age: Cache max-age in seconds. Default: 86400 (1 day).
        logger: Optional custom logger instance.
    """

    app_name: str = Field(..., min_length=1, description="Unique app identifier")
    root_path: str = Field(..., min_length=1, description="Absolute path to frontend dist/")
    base_path: str = Field(default="/apps/", description="Base path prefix combined with app_name to form the route prefix")
    template_engine: TemplateEngine = Field(
        default="none", description="Template engine for index.html"
    )
    url_prefix: str = Field(default="/assets", description="URL prefix for static assets")
    default_context: dict[str, Any] = Field(
        default_factory=dict, description="Default template context"
    )
    spa_mode: bool = Field(default=True, description="Enable SPA catch-all routing")
    max_age: int = Field(default=86400, ge=0, description="Cache max-age in seconds")
    logger: Any | None = Field(default=None, exclude=True, description="Custom logger")

    model_config = {"arbitrary_types_allowed": True}


class MultiAppOptions(BaseModel):
    """Options for registering multiple static apps.

    Attributes:
        apps: Array of app configurations.
        collision_strategy: How to handle route prefix collisions. Default: 'error'.
        logger: Optional shared logger for all apps.
    """

    apps: list[StaticLoaderOptions]
    collision_strategy: CollisionStrategy = Field(
        default="error", description="Collision handling strategy"
    )
    logger: Any | None = Field(default=None, exclude=True, description="Shared logger")

    model_config = {"arbitrary_types_allowed": True}


class RegisterResult(BaseModel):
    """Result of a single app registration.

    Attributes:
        app_name: App name that was registered.
        success: Whether registration succeeded.
        error: Error message if registration failed.
        route_prefix: Route prefix for the app.
        root_path: Absolute path to root directory.
    """

    app_name: str
    success: bool
    error: str | None = None
    route_prefix: str
    root_path: str


class RenderContext(BaseModel):
    """Context data for template rendering.

    Attributes:
        request: Request-specific data.
        config: Static configuration data.
    """

    request: dict[str, Any] | None = None
    config: dict[str, Any] | None = None

    model_config = {"extra": "allow"}


class PathRewriteOptions(BaseModel):
    """Options for HTML path rewriting.

    Attributes:
        app_name: App name for route prefix.
        url_prefix: URL prefix for assets.
        enable_cache: Enable caching of rewritten HTML.
        cache_ttl: Cache TTL in seconds. Default: 60.
    """

    app_name: str
    url_prefix: str
    base_path: str = "/apps/"
    enable_cache: bool = True
    cache_ttl: float = 60.0  # seconds
