"""
FastAPI server factory and error handler for the Confluence API package.

Provides a standalone FastAPI application for Confluence API operations,
along with a reusable error handler that maps ConfluenceAPIError subclasses
to appropriate JSON responses.

Usage:
    from confluence_api.server import create_app, create_error_handler

    app = create_app()
    handler = create_error_handler()
"""

from __future__ import annotations

from typing import Any


def create_app() -> Any:
    """
    Create and configure a FastAPI application for Confluence API operations.

    Returns:
        A FastAPI application instance with CORS enabled and health endpoint.
    """
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware

    app = FastAPI(
        title="Confluence API",
        version="1.0.0",
        description="Confluence Data Center REST API v9.2.3 Proxy Server",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok", "service": "confluence-api-server"}

    return app


def create_error_handler() -> Any:
    """
    Create an error handler that maps ConfluenceAPIError exceptions to JSONResponse.

    Returns:
        An async exception handler function suitable for FastAPI.
    """
    from fastapi.responses import JSONResponse

    from confluence_api.exceptions import ConfluenceAPIError

    async def handler(request: Any, exc: Exception) -> Any:
        if isinstance(exc, ConfluenceAPIError):
            return JSONResponse(
                status_code=exc.status_code or 500,
                content={
                    "error": True,
                    "message": str(exc),
                    "type": type(exc).__name__,
                },
            )
        raise exc

    return handler
