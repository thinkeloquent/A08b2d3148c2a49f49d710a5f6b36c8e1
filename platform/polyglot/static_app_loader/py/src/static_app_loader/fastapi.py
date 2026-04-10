"""FastAPI module for static app loader."""

import mimetypes
import os
from pathlib import Path
from typing import Dict, List, Optional, Set

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, HTMLResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError

from . import logger as logger_module
from .errors import (
    ConfigValidationError,
    IndexNotFoundError,
    RouteCollisionError,
    StaticPathNotFoundError,
)
from .path_rewriter import clear_cache, rewrite_html_paths_cached
from .template_resolver import inject_initial_state, resolve_template_engine
from .types import (
    ILogger,
    MultiAppOptions,
    PathRewriteOptions,
    RegisterResult,
    StaticLoaderOptions,
)

_registered_prefixes: dict[str, str] = {}


def _compute_route_prefix(base_path: str, app_name: str) -> str:
    """Compute the full route prefix from base_path and app_name."""
    base = base_path if base_path.startswith("/") else f"/{base_path}"
    normalized_base = base if base.endswith("/") else f"{base}/"
    return f"{normalized_base}{app_name}"


def register_static_app(
    app: FastAPI,
    options: StaticLoaderOptions,
) -> None:
    """Register a single static app with FastAPI.

    Args:
        app: The FastAPI application instance
        options: Static app loader options

    Raises:
        StaticPathNotFoundError: If root_path doesn't exist
        IndexNotFoundError: If index.html not found in SPA mode
        RouteCollisionError: If route prefix already registered

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
    """
    log = options.logger or logger_module.create("static-app-loader", "fastapi.py")

    log.info(
        f"Registering static app: {options.app_name}",
        {
            "root_path": options.root_path,
            "spa_mode": options.spa_mode,
            "template_engine": options.template_engine,
        },
    )

    # Validate root path exists
    root_path = Path(options.root_path)
    if not root_path.exists():
        raise StaticPathNotFoundError(options.root_path)

    # Validate index.html exists for SPA mode
    index_path = root_path / "index.html"
    if options.spa_mode and not index_path.exists():
        raise IndexNotFoundError(options.root_path)

    route_prefix = _compute_route_prefix(options.base_path, options.app_name)

    # Check for route collision
    existing_app = _registered_prefixes.get(route_prefix)
    if existing_app:
        raise RouteCollisionError(route_prefix, [existing_app, options.app_name])
    _registered_prefixes[route_prefix] = options.app_name

    if options.spa_mode:
        # SPA mode: use custom route handlers that handle both static files
        # and SPA routing with path rewriting
        _register_spa_routes(app, options, root_path, index_path, route_prefix, log)
        log.debug(f"SPA routes registered at {route_prefix}")
    else:
        # Non-SPA mode: just mount static files directly
        app.mount(
            route_prefix,
            StaticFiles(directory=str(root_path)),
            name=f"{options.app_name.replace('/', '_')}_static",
        )
        log.debug(f"Static files mounted at {route_prefix}")

    log.info(f"Static app registered successfully: {options.app_name}")


def _register_spa_routes(
    app: FastAPI,
    options: StaticLoaderOptions,
    root_path: Path,
    index_path: Path,
    route_prefix: str,
    log: ILogger,
) -> None:
    """Register SPA routes that handle both static files and SPA navigation."""
    is_production = os.environ.get("PYTHON_ENV") == "production"

    def _serve_index_html() -> HTMLResponse:
        """Serve index.html with path rewriting and optional context injection."""
        html = index_path.read_text(encoding="utf-8")

        # Rewrite asset paths
        html = rewrite_html_paths_cached(
            html,
            str(index_path),
            PathRewriteOptions(
                app_name=options.app_name,
                url_prefix=options.url_prefix,
                base_path=options.base_path,
                enable_cache=is_production,
            ),
        )

        # Inject initial state if default context is provided
        if options.default_context:
            html = inject_initial_state(html, options.default_context)

        return HTMLResponse(content=html)

    async def spa_root_handler(request: Request) -> HTMLResponse:
        """Handle requests to the app root."""
        log.trace(f"SPA request: {request.url.path}")
        try:
            return _serve_index_html()
        except Exception as e:
            log.error(
                "Failed to serve SPA index",
                {"error": str(e), "path": request.url.path},
            )
            raise

    async def spa_wildcard_handler(request: Request, path: str) -> Response:
        """Handle wildcard requests - serve static files or index.html for SPA routes."""
        log.trace(f"SPA wildcard request: {request.url.path}, path={path}")

        try:
            # Check if this is a static file request
            file_path = root_path / path
            if file_path.exists() and file_path.is_file():
                # Serve the static file
                media_type, _ = mimetypes.guess_type(str(file_path))
                return FileResponse(
                    file_path,
                    media_type=media_type,
                )

            # Not a static file - serve index.html for SPA routing
            return _serve_index_html()
        except Exception as e:
            log.error(
                "Failed to serve SPA request",
                {"error": str(e), "path": request.url.path},
            )
            raise

    # Exact route for app root
    app.get(route_prefix, response_class=HTMLResponse)(spa_root_handler)

    # Wildcard route for SPA navigation and static files
    app.get(f"{route_prefix}/{{path:path}}")(spa_wildcard_handler)


def register_multiple_apps(
    app: FastAPI,
    options: MultiAppOptions,
) -> list[RegisterResult]:
    """Register multiple static apps with collision detection.

    Args:
        app: The FastAPI application instance
        options: Multi-app registration options

    Returns:
        List of registration results

    Raises:
        RouteCollisionError: If collision_strategy is 'error' and collision detected
    """
    log = options.logger or logger_module.create("static-app-loader", "fastapi.py")
    results: list[RegisterResult] = []

    # Pre-check for collisions within the batch
    prefix_map: dict[str, list[str]] = {}
    for app_opts in options.apps:
        prefix = _compute_route_prefix(app_opts.base_path, app_opts.app_name)
        if prefix not in prefix_map:
            prefix_map[prefix] = []
        prefix_map[prefix].append(app_opts.app_name)

    # Check for collisions within the batch
    for prefix, apps in prefix_map.items():
        if len(apps) > 1:
            if options.collision_strategy == "error":
                raise RouteCollisionError(prefix, apps)
            elif options.collision_strategy == "warn":
                log.warn(f"Route collision detected: {prefix}", {"apps": apps})
            elif options.collision_strategy == "skip":
                log.info(
                    f"Skipping duplicate apps for prefix: {prefix}",
                    {"apps": apps[1:]},
                )

    # Register each app
    processed_prefixes: set[str] = set()
    for app_opts in options.apps:
        prefix = _compute_route_prefix(app_opts.base_path, app_opts.app_name)

        # Skip duplicates based on strategy
        if prefix in processed_prefixes and options.collision_strategy == "skip":
            results.append(
                RegisterResult(
                    app_name=app_opts.app_name,
                    success=False,
                    error=f"Skipped: duplicate route prefix {prefix}",
                    route_prefix=prefix,
                    root_path=app_opts.root_path,
                )
            )
            continue

        try:
            # Use shared logger if provided
            if options.logger and not app_opts.logger:
                app_opts = StaticLoaderOptions(
                    **{**app_opts.model_dump(), "logger": options.logger}
                )

            register_static_app(app, app_opts)
            processed_prefixes.add(prefix)
            results.append(
                RegisterResult(
                    app_name=app_opts.app_name,
                    success=True,
                    route_prefix=prefix,
                    root_path=app_opts.root_path,
                )
            )
        except Exception as e:
            results.append(
                RegisterResult(
                    app_name=app_opts.app_name,
                    success=False,
                    error=str(e),
                    route_prefix=prefix,
                    root_path=app_opts.root_path,
                )
            )

            if options.collision_strategy == "error":
                raise

    success_count = sum(1 for r in results if r.success)
    log.info(f"Multi-app registration complete: {success_count}/{len(results)} succeeded")

    return results


def clear_path_cache() -> None:
    """Clear the path rewriter cache.

    Useful for development mode or manual cache invalidation.
    """
    clear_cache()


def get_registered_prefixes() -> dict[str, str]:
    """Get the currently registered route prefixes.

    Useful for debugging and collision detection.
    """
    return dict(_registered_prefixes)


def reset_registered_prefixes() -> None:
    """Reset all registered prefixes.

    Primarily for testing purposes.
    """
    _registered_prefixes.clear()
