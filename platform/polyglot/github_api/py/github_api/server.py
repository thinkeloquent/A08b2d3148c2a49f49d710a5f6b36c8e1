"""
FastAPI application factory for the GitHub API server.

Creates and configures the FastAPI app with CORS, routes,
error handlers, and the SDK client.
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from github_api.config import Config
from github_api.middleware.error_handler import register_error_handlers
from github_api.routes import create_router
from github_api.sdk.client import GitHubClient

__all__ = ["create_app"]

logger = logging.getLogger("github_api.server")


def create_app(config: Config | None = None) -> FastAPI:
    """Create and configure the FastAPI application.

    Args:
        config: Server configuration. If None, loads from environment.

    Returns:
        Configured FastAPI application instance.
    """
    if config is None:
        config = Config.from_env()

    # Configure logging
    logging.basicConfig(
        level=getattr(logging, config.log_level.upper(), logging.INFO),
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    app = FastAPI(
        title="GitHub API SDK Server",
        version="1.0.0",
        description=(
            "GitHub API SDK — Polyglot Common Interface (Python). "
            "Provides a REST API proxy to the GitHub API with rate limiting, "
            "error handling, and input validation."
        ),
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register error handlers
    register_error_handlers(app)

    # Register routes
    api_router = create_router()
    app.include_router(api_router)

    # Create and store the SDK client
    @app.on_event("startup")
    async def startup() -> None:
        """Initialize the GitHub SDK client on server startup."""
        logger.info(
            "Starting GitHub API server (host=%s, port=%d)",
            config.host,
            config.port,
        )
        client = GitHubClient(
            token=config.github_token or None,
            base_url=config.base_url,
            rate_limit_auto_wait=config.rate_limit_auto_wait,
            rate_limit_threshold=config.rate_limit_threshold,
        )
        app.state.github_client = client
        logger.info("GitHub SDK client initialized")

    @app.on_event("shutdown")
    async def shutdown() -> None:
        """Close the GitHub SDK client on server shutdown."""
        client: GitHubClient | None = getattr(app.state, "github_client", None)
        if client:
            await client.close()
            logger.info("GitHub SDK client closed")

    return app
