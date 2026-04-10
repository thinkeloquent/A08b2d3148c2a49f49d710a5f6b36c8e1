"""
FastAPI exception handlers for GitHub API errors.

Registers handlers that map GitHubError subclasses to appropriate
HTTP responses with JSON error bodies.
"""

from __future__ import annotations

from typing import Any

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from github_api.sdk.errors import (
    AuthError,
    ConflictError,
    ForbiddenError,
    GitHubError,
    NotFoundError,
    RateLimitError,
    ServerError,
    ValidationError,
)

__all__ = ["register_error_handlers"]


def register_error_handlers(app: FastAPI) -> None:
    """Register exception handlers for all GitHub error types.

    Maps each error class to its appropriate HTTP status code and
    returns a structured JSON error response.

    Args:
        app: The FastAPI application instance.
    """

    @app.exception_handler(ValidationError)
    async def validation_error_handler(
        request: Request, exc: ValidationError
    ) -> JSONResponse:
        """Handle input validation errors (400)."""
        return JSONResponse(
            status_code=400,
            content=exc.to_dict(),
        )

    @app.exception_handler(AuthError)
    async def auth_error_handler(
        request: Request, exc: AuthError
    ) -> JSONResponse:
        """Handle authentication errors (401)."""
        return JSONResponse(
            status_code=401,
            content=exc.to_dict(),
        )

    @app.exception_handler(ForbiddenError)
    async def forbidden_error_handler(
        request: Request, exc: ForbiddenError
    ) -> JSONResponse:
        """Handle forbidden errors (403)."""
        return JSONResponse(
            status_code=403,
            content=exc.to_dict(),
        )

    @app.exception_handler(NotFoundError)
    async def not_found_error_handler(
        request: Request, exc: NotFoundError
    ) -> JSONResponse:
        """Handle not found errors (404)."""
        return JSONResponse(
            status_code=404,
            content=exc.to_dict(),
        )

    @app.exception_handler(ConflictError)
    async def conflict_error_handler(
        request: Request, exc: ConflictError
    ) -> JSONResponse:
        """Handle conflict errors (409)."""
        return JSONResponse(
            status_code=409,
            content=exc.to_dict(),
        )

    @app.exception_handler(RateLimitError)
    async def rate_limit_error_handler(
        request: Request, exc: RateLimitError
    ) -> JSONResponse:
        """Handle rate limit errors (429)."""
        headers: dict[str, str] = {}
        if exc.retry_after is not None:
            headers["Retry-After"] = str(exc.retry_after)
        return JSONResponse(
            status_code=429,
            content=exc.to_dict(),
            headers=headers,
        )

    @app.exception_handler(ServerError)
    async def server_error_handler(
        request: Request, exc: ServerError
    ) -> JSONResponse:
        """Handle upstream server errors (502)."""
        return JSONResponse(
            status_code=502,
            content=exc.to_dict(),
        )

    @app.exception_handler(GitHubError)
    async def github_error_handler(
        request: Request, exc: GitHubError
    ) -> JSONResponse:
        """Handle all other GitHub errors with their original status."""
        status_code = exc.status or 500
        return JSONResponse(
            status_code=status_code,
            content=exc.to_dict(),
        )
