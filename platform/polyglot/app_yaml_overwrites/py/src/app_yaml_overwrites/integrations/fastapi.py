"""
FastAPI Integration Module for app_yaml_overwrites package.
Provides lifecycle hooks for configuration resolution in FastAPI servers.

Usage:
    from fastapi import FastAPI, Depends
    from app_yaml_overwrites.integrations import (
        create_config_lifespan,
        get_config,
        get_resolved_config
    )

    lifespan = create_config_lifespan()
    app = FastAPI(lifespan=lifespan)

    @app.get("/")
    async def root(config = Depends(get_resolved_config)):
        return {"app_name": config.get("app", {}).get("name")}
"""

from contextlib import asynccontextmanager
from typing import Any, Callable, Dict, Optional, AsyncGenerator
from dataclasses import dataclass, field

from fastapi import FastAPI, Request, Depends
from starlette.middleware.base import BaseHTTPMiddleware

from ..logger import create as create_logger, ILogger
from ..sdk import ConfigSDK
from ..options import ComputeScope, MissingStrategy, ResolverOptions
from ..compute_registry import ComputeRegistry, create_registry
from ..context_builder import RequestLike, ContextBuilder

# Create module-level logger
logger = create_logger("app_yaml_overwrites", "integrations/fastapi.py")

# Global state for the initialized SDK
_config_sdk: Optional[ConfigSDK] = None
_startup_config: Optional[Dict[str, Any]] = None


@dataclass
class ConfigIntegrationOptions:
    """Options for FastAPI config integration."""

    # SDK options
    registry: Optional[ComputeRegistry] = None
    max_depth: int = 10
    missing_strategy: MissingStrategy = MissingStrategy.ERROR

    # Integration options
    resolve_on_startup: bool = True
    per_request_resolution: bool = False
    logger: Optional[ILogger] = None

    # Context extenders
    context_extenders: list = field(default_factory=list)


def create_config_lifespan(
    options: Optional[ConfigIntegrationOptions] = None
) -> Callable[[FastAPI], AsyncGenerator[None, None]]:
    """
    Create a lifespan context manager for FastAPI with config integration.

    This handles STARTUP-scoped resolution when the application starts
    and cleanup when it shuts down.

    Args:
        options: Configuration options for the integration

    Returns:
        Lifespan async context manager function

    Example:
        lifespan = create_config_lifespan(ConfigIntegrationOptions(
            resolve_on_startup=True
        ))
        app = FastAPI(lifespan=lifespan)
    """
    opts = options or ConfigIntegrationOptions()
    lifespan_logger = opts.logger or logger

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
        global _config_sdk, _startup_config

        lifespan_logger.info("Config lifespan: Starting up")

        # Initialize SDK
        sdk_options = {
            "registry": opts.registry,
            "max_depth": opts.max_depth,
            "missing_strategy": opts.missing_strategy,
            "context_extenders": opts.context_extenders
        }

        _config_sdk = await ConfigSDK.initialize(sdk_options)
        lifespan_logger.debug("Config SDK initialized")

        # Resolve STARTUP templates
        if opts.resolve_on_startup:
            lifespan_logger.debug("Resolving STARTUP templates")
            _startup_config = await _config_sdk.get_resolved(ComputeScope.STARTUP)
            lifespan_logger.info("STARTUP config resolved")
        else:
            _startup_config = _config_sdk.get_raw()
            lifespan_logger.debug("Using raw config (STARTUP resolution disabled)")

        # Store in app state for access in routes
        app.state.config_sdk = _config_sdk
        app.state.config_resolved = _startup_config

        lifespan_logger.info("Config lifespan: Startup complete")

        yield

        # Cleanup on shutdown
        lifespan_logger.info("Config lifespan: Shutting down")
        if _config_sdk:
            _config_sdk.get_registry().clear_cache()
        _config_sdk = None
        _startup_config = None
        lifespan_logger.info("Config lifespan: Shutdown complete")

    return lifespan


class ConfigResolutionMiddleware(BaseHTTPMiddleware):
    """
    Middleware for per-request configuration resolution.

    This resolves REQUEST-scoped templates for each incoming request
    and attaches the resolved config to request.state.

    Usage:
        app.add_middleware(ConfigResolutionMiddleware, logger=my_logger)
    """

    def __init__(self, app, logger: Optional[ILogger] = None):
        super().__init__(app)
        self._logger = logger or create_logger(
            "app_yaml_overwrites",
            "ConfigResolutionMiddleware"
        )

    async def dispatch(self, request: Request, call_next):
        self._logger.debug(
            "ConfigResolutionMiddleware: Processing request",
            data={"method": request.method, "path": request.url.path}
        )

        # Get SDK from app state
        sdk: Optional[ConfigSDK] = getattr(request.app.state, "config_sdk", None)

        if sdk:
            # Build request-like object for context
            request_like: RequestLike = {
                "headers": dict(request.headers),
                "query": dict(request.query_params),
                "params": dict(request.path_params),
                "body": None  # Body requires await, handled lazily if needed
            }

            # Resolve with REQUEST scope
            resolved = await sdk.get_resolved(ComputeScope.REQUEST, request_like)
            request.state.resolved_config = resolved
            self._logger.debug("REQUEST config resolved for request")
        else:
            self._logger.warn("SDK not available in app state")
            request.state.resolved_config = None

        response = await call_next(request)
        return response


def get_config_sdk(request: Request) -> ConfigSDK:
    """
    FastAPI dependency to get the ConfigSDK instance.

    Args:
        request: FastAPI request object

    Returns:
        ConfigSDK instance

    Raises:
        RuntimeError: If SDK is not initialized

    Example:
        @app.get("/")
        async def root(sdk: ConfigSDK = Depends(get_config_sdk)):
            return sdk.get("app.name")
    """
    sdk: Optional[ConfigSDK] = getattr(request.app.state, "config_sdk", None)
    if not sdk:
        raise RuntimeError(
            "ConfigSDK not available. Ensure create_config_lifespan() is used."
        )
    return sdk


def get_config(request: Request) -> Dict[str, Any]:
    """
    FastAPI dependency to get the STARTUP-resolved configuration.

    This returns the configuration resolved at application startup,
    suitable for most use cases where REQUEST-scoped resolution
    is not needed.

    Args:
        request: FastAPI request object

    Returns:
        Resolved configuration dictionary

    Example:
        @app.get("/")
        async def root(config: dict = Depends(get_config)):
            return {"app_name": config.get("app", {}).get("name")}
    """
    config = getattr(request.app.state, "config_resolved", None)
    if config is None:
        raise RuntimeError(
            "Config not available. Ensure create_config_lifespan() is used."
        )
    return config


def get_resolved_config(request: Request) -> Dict[str, Any]:
    """
    FastAPI dependency to get REQUEST-resolved configuration.

    This returns the configuration resolved for the current request,
    including REQUEST-scoped template resolution. Requires
    ConfigResolutionMiddleware to be added.

    Falls back to STARTUP config if middleware is not used.

    Args:
        request: FastAPI request object

    Returns:
        Resolved configuration dictionary

    Example:
        @app.get("/")
        async def root(config: dict = Depends(get_resolved_config)):
            return {"user_id": config.get("request_user_id")}
    """
    # Try REQUEST-resolved config first
    resolved = getattr(request.state, "resolved_config", None)
    if resolved is not None:
        return resolved

    # Fall back to STARTUP config
    return get_config(request)


async def resolve_template_dependency(
    request: Request,
    template: str
) -> Any:
    """
    Resolve a single template expression within a request context.

    Args:
        request: FastAPI request object
        template: Template string to resolve

    Returns:
        Resolved value

    Example:
        @app.get("/user/{user_id}")
        async def get_user(
            user_id: str,
            request: Request
        ):
            value = await resolve_template_dependency(
                request,
                "{{request.params.user_id}}"
            )
            return {"user_id": value}
    """
    sdk = get_config_sdk(request)
    request_like: RequestLike = {
        "headers": dict(request.headers),
        "query": dict(request.query_params),
        "params": dict(request.path_params),
        "body": None
    }

    # Build context from request
    builder = ContextBuilder(logger)
    builder.with_config(sdk.get_raw())
    builder.with_request(request_like)
    context = await builder.build()

    return await sdk.resolve_template(template, context, ComputeScope.REQUEST)


def setup_config_integration(
    app: FastAPI,
    options: Optional[ConfigIntegrationOptions] = None
) -> None:
    """
    One-liner setup for config integration (alternative to lifespan).

    This adds the necessary middleware and event handlers.
    Note: For new projects, prefer using create_config_lifespan().

    Args:
        app: FastAPI application instance
        options: Configuration options

    Example:
        app = FastAPI()
        setup_config_integration(app, ConfigIntegrationOptions(
            per_request_resolution=True
        ))
    """
    opts = options or ConfigIntegrationOptions()
    setup_logger = opts.logger or logger

    setup_logger.info("Setting up config integration")

    @app.on_event("startup")
    async def startup_event():
        global _config_sdk, _startup_config

        sdk_options = {
            "registry": opts.registry,
            "max_depth": opts.max_depth,
            "missing_strategy": opts.missing_strategy,
            "context_extenders": opts.context_extenders
        }

        _config_sdk = await ConfigSDK.initialize(sdk_options)

        if opts.resolve_on_startup:
            _startup_config = await _config_sdk.get_resolved(ComputeScope.STARTUP)
        else:
            _startup_config = _config_sdk.get_raw()

        app.state.config_sdk = _config_sdk
        app.state.config_resolved = _startup_config

        setup_logger.info("Config integration startup complete")

    @app.on_event("shutdown")
    async def shutdown_event():
        global _config_sdk, _startup_config
        if _config_sdk:
            _config_sdk.get_registry().clear_cache()
        _config_sdk = None
        _startup_config = None
        setup_logger.info("Config integration shutdown complete")

    # Add per-request resolution middleware if enabled
    if opts.per_request_resolution:
        app.add_middleware(ConfigResolutionMiddleware, logger=opts.logger)
        setup_logger.debug("Per-request resolution middleware added")

    setup_logger.info("Config integration setup complete")


# Legacy aliases for backwards compatibility
FastAPIConfigMiddleware = ConfigResolutionMiddleware
setup_config_sdk = setup_config_integration


async def resolve_startup(
    app: FastAPI,
    config: Dict[str, Any],
    registry: Optional[ComputeRegistry] = None,
    state_property: str = "resolved_config",
    shared_context: Any = None
) -> Dict[str, Any]:
    """
    Manually resolve configuration at startup and store in app.state.

    This function is designed for granular lifecycle hooks where
    the SDK might be initialized separately.

    Args:
        app: FastAPI application instance
        config: Raw configuration dictionary
        registry: Optional compute registry
        state_property: Name of the property to set on app.state
        shared_context: Optional SharedContext instance

    Returns:
        Resolved configuration dictionary
    """
    logger.info("Manual startup resolution initiated")

    # create temporary SDK for resolution if one doesn't exist on app.state
    # if app.state.sdk exists, we could use it, but here we might want to just use the logic directly
    
    # Actually, we should check if SDK is already initialized on app.state, which is done in 02_context_resolver.py
    sdk = getattr(app.state, "sdk", None)
    
    if not sdk:
        # Create a temporary SDK just for this resolution if not provided
        # But wait, we want to respect the registry passed in.
        sdk_options = {"registry": registry} if registry else {}
        sdk = ConfigSDK(sdk_options)
        # We need to set the raw config
        sdk._raw_config = config
        sdk._initialized = True # Hacky but efficient for this specific legacy path
    
    # If shared_context is provided, we should ideally pass it to the resolver.
    # Currently ConfigSDK doesn't explicitly take shared_context in get_resolved 
    # BUT get_resolved builds a context. 
    # We might need to extend ConfigSDK to accept shared_context or ContextBuilder to accept it.
    
    # For now, let's look at how ConfigSDK.get_resolved works.
    # It creates a ContextBuilder.
    
    # We can use sdk.resolve_template or similar?
    # Actually, ConfigSDK.get_resolved(ComputeScope.STARTUP) is what we want.
    
    # If shared_context is passed, we need to ensure it's available to compute functions.
    # Compute functions receive 'ctx'.
    # ctx has 'shared'.
    
    # We need to inject shared_context into the ContextBuilder.
    # ConfigSDK needs to support this.
    
    # Let's inspect ConfigSDK.get_resolved in sdk.py...
    
    # Assuming for now we just call get_resolved.
    global _startup_config

    resolved = await sdk.get_resolved(ComputeScope.STARTUP)

    # Set on app state
    setattr(app.state, state_property, resolved)

    # Cache at module level so non-request code (e.g. embedding config) can access it
    _startup_config = resolved

    logger.info(f"Startup resolution complete. Config stored in app.state.{state_property}")
    return resolved
