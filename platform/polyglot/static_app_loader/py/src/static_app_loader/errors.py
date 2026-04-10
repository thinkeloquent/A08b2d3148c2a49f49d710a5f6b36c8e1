"""Custom exceptions for static app loader."""

from typing import List


class StaticAppLoaderError(Exception):
    """Base error class for static app loader errors."""

    code: str = "STATIC_APP_LOADER_ERROR"

    def __init__(self, message: str, code: str | None = None) -> None:
        super().__init__(message)
        if code:
            self.code = code


class StaticPathNotFoundError(StaticAppLoaderError):
    """Error thrown when the static root directory does not exist."""

    code = "STATIC_PATH_NOT_FOUND"

    def __init__(self, path: str) -> None:
        self.path = path
        super().__init__(f"Static root directory does not exist: {path}")


class UnsupportedTemplateEngineError(StaticAppLoaderError):
    """Error thrown when an unsupported template engine is specified."""

    code = "UNSUPPORTED_TEMPLATE_ENGINE"

    def __init__(self, engine: str) -> None:
        self.engine = engine
        super().__init__(
            f"Unsupported template engine: '{engine}'. "
            "Supported engines: mustache, liquid, edge, none"
        )


class RouteCollisionError(StaticAppLoaderError):
    """Error thrown when route prefix collision is detected."""

    code = "ROUTE_COLLISION"

    def __init__(self, route_prefix: str, conflicting_apps: list[str]) -> None:
        self.route_prefix = route_prefix
        self.conflicting_apps = conflicting_apps
        super().__init__(
            f"Route prefix collision detected for '{route_prefix}': "
            f"{', '.join(conflicting_apps)}"
        )


class ConfigValidationError(StaticAppLoaderError):
    """Error thrown when configuration validation fails."""

    code = "CONFIG_VALIDATION_ERROR"

    def __init__(self, errors: list[str]) -> None:
        self.validation_errors = errors
        super().__init__(f"Configuration validation failed:\n{chr(10).join(errors)}")


class IndexNotFoundError(StaticAppLoaderError):
    """Error thrown when index.html is not found in the root path."""

    code = "INDEX_NOT_FOUND"

    def __init__(self, root_path: str) -> None:
        self.root_path = root_path
        super().__init__(f"index.html not found in root path: {root_path}")
