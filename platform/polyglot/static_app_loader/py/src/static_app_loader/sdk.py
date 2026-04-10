"""SDK interface for static app loader with builder pattern."""

from collections.abc import Callable
from typing import Any, Dict, List, Optional, Union

from fastapi import FastAPI
from pydantic import ValidationError

from .errors import ConfigValidationError
from .fastapi import register_multiple_apps, register_static_app
from .types import (
    CollisionStrategy,
    ILogger,
    MultiAppOptions,
    RegisterResult,
    StaticLoaderOptions,
    TemplateEngine,
)


class StaticAppLoaderBuilder:
    """Builder class for creating static app loader configurations with method chaining.

    Example:
        >>> loader = (
        ...     create_static_app_loader()
        ...     .app_name('dashboard')
        ...     .root_path('/var/www/dashboard/dist')
        ...     .spa_mode(True)
        ...     .template_engine('liquid')
        ...     .build()
        ... )
        >>>
        >>> register_static_app(app, loader)
    """

    def __init__(self) -> None:
        self._config: dict[str, Any] = {}

    def app_name(self, name: str) -> "StaticAppLoaderBuilder":
        """Set the app name (required)."""
        self._config["app_name"] = name
        return self

    def root_path(self, path: str) -> "StaticAppLoaderBuilder":
        """Set the root path to the frontend dist directory (required)."""
        self._config["root_path"] = path
        return self

    def base_path(self, path: str) -> "StaticAppLoaderBuilder":
        """Set the base path prefix combined with app_name to form the route prefix."""
        self._config["base_path"] = path
        return self

    def template_engine(self, engine: TemplateEngine) -> "StaticAppLoaderBuilder":
        """Set the template engine for SSR rendering."""
        self._config["template_engine"] = engine
        return self

    def url_prefix(self, prefix: str) -> "StaticAppLoaderBuilder":
        """Set the URL prefix for static assets."""
        self._config["url_prefix"] = prefix
        return self

    def default_context(self, context: dict[str, Any]) -> "StaticAppLoaderBuilder":
        """Set the default context for template rendering."""
        self._config["default_context"] = context
        return self

    def spa_mode(self, enabled: bool) -> "StaticAppLoaderBuilder":
        """Enable or disable SPA mode (catch-all routing)."""
        self._config["spa_mode"] = enabled
        return self

    def max_age(self, seconds: int) -> "StaticAppLoaderBuilder":
        """Set the cache max-age in seconds."""
        self._config["max_age"] = seconds
        return self

    def logger(self, log: ILogger) -> "StaticAppLoaderBuilder":
        """Set a custom logger instance."""
        self._config["logger"] = log
        return self

    def build(self) -> StaticLoaderOptions:
        """Validate and build the configuration object.

        Raises:
            ConfigValidationError: If validation fails
        """
        try:
            return StaticLoaderOptions(**self._config)
        except ValidationError as e:
            errors = [f"{'.'.join(str(loc) for loc in err['loc'])}: {err['msg']}" for err in e.errors()]
            raise ConfigValidationError(errors)

    def to_dict(self) -> dict[str, Any]:
        """Get the raw configuration without validation."""
        return dict(self._config)


class MultiAppBuilder:
    """Builder class for multi-app registration."""

    def __init__(self) -> None:
        self._apps: list[dict[str, Any]] = []
        self._collision_strategy: CollisionStrategy = "error"
        self._shared_logger: ILogger | None = None

    def add_app(
        self, builder_fn: Callable[[StaticAppLoaderBuilder], StaticAppLoaderBuilder]
    ) -> "MultiAppBuilder":
        """Add an app configuration using the builder pattern."""
        builder = StaticAppLoaderBuilder()
        builder_fn(builder)
        self._apps.append(builder.to_dict())
        return self

    def add_app_config(self, config: StaticLoaderOptions | dict[str, Any]) -> "MultiAppBuilder":
        """Add an app configuration from an object or dict."""
        if isinstance(config, StaticLoaderOptions):
            self._apps.append(config.model_dump())
        else:
            self._apps.append(config)
        return self

    def on_collision(self, strategy: CollisionStrategy) -> "MultiAppBuilder":
        """Set the collision handling strategy."""
        self._collision_strategy = strategy
        return self

    def logger(self, log: ILogger) -> "MultiAppBuilder":
        """Set a shared logger for all apps."""
        self._shared_logger = log
        return self

    def build(self) -> MultiAppOptions:
        """Validate and build the multi-app configuration."""
        apps = [StaticLoaderOptions(**app_config) for app_config in self._apps]
        return MultiAppOptions(
            apps=apps,
            collision_strategy=self._collision_strategy,
            logger=self._shared_logger,
        )

    async def register(self, app: FastAPI) -> list[RegisterResult]:
        """Register all apps with a FastAPI instance."""
        return register_multiple_apps(app, self.build())


def create_static_app_loader() -> StaticAppLoaderBuilder:
    """Create a new static app loader configuration builder.

    Example:
        >>> from static_app_loader import create_static_app_loader
        >>>
        >>> config = (
        ...     create_static_app_loader()
        ...     .app_name('dashboard')
        ...     .root_path('/var/www/dashboard/dist')
        ...     .spa_mode(True)
        ...     .build()
        ... )
    """
    return StaticAppLoaderBuilder()


def create_multi_app_loader() -> MultiAppBuilder:
    """Create a new multi-app registration builder.

    Example:
        >>> from static_app_loader import create_multi_app_loader
        >>>
        >>> results = await (
        ...     create_multi_app_loader()
        ...     .add_app(lambda b: b.app_name('dashboard').root_path('/var/www/dashboard/dist'))
        ...     .add_app(lambda b: b.app_name('admin').root_path('/var/www/admin/dist'))
        ...     .on_collision('warn')
        ...     .register(app)
        ... )
    """
    return MultiAppBuilder()


def validate_config(
    config: dict[str, Any]
) -> dict[str, bool | StaticLoaderOptions] | dict[str, bool | list[str]]:
    """Validate a configuration object without registering.

    Args:
        config: The configuration to validate

    Returns:
        Dict with 'success' and either 'data' or 'errors'
    """
    try:
        data = StaticLoaderOptions(**config)
        return {"success": True, "data": data}
    except ValidationError as e:
        errors = [f"{'.'.join(str(loc) for loc in err['loc'])}: {err['msg']}" for err in e.errors()]
        return {"success": False, "errors": errors}
