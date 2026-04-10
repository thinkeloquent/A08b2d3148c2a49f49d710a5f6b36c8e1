"""
Error Handler Middleware — Statsig Console API

Maps SDK error types to FastAPI HTTP error responses.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from ..logger import create_logger
from ..errors import (
    AuthenticationError,
    NotFoundError,
    RateLimitError,
    ServerError,
    StatsigError,
    ValidationError,
)

log = create_logger("statsig-api", __file__)


def register_error_handlers(app: FastAPI) -> None:
    """Register exception handlers on the FastAPI app."""

    @app.exception_handler(RateLimitError)
    async def rate_limit_handler(request: Request, exc: RateLimitError):
        log.error(
            "rate limit error",
            {"method": request.method, "url": str(request.url), "error": str(exc)},
        )
        retry_after = exc.retry_after if hasattr(exc, "retry_after") else 1.0
        return JSONResponse(
            status_code=429,
            content={
                "error": True,
                "message": str(exc),
                "type": "RateLimitError",
                "context": {"retry_after": retry_after},
            },
            headers={"Retry-After": str(retry_after)},
        )

    @app.exception_handler(ValidationError)
    async def validation_handler(request: Request, exc: ValidationError):
        log.error(
            "validation error",
            {"method": request.method, "url": str(request.url), "error": str(exc)},
        )
        return JSONResponse(
            status_code=exc.status_code or 400,
            content={
                "error": True,
                "message": str(exc),
                "type": "ValidationError",
                "context": {"response_body": exc.response_body},
            },
        )

    @app.exception_handler(AuthenticationError)
    async def auth_handler(request: Request, exc: AuthenticationError):
        log.error(
            "authentication error",
            {"method": request.method, "url": str(request.url)},
        )
        return JSONResponse(
            status_code=401,
            content={
                "error": True,
                "message": str(exc),
                "type": "AuthenticationError",
                "context": {},
            },
        )

    @app.exception_handler(NotFoundError)
    async def not_found_handler(request: Request, exc: NotFoundError):
        log.error(
            "not found error",
            {"method": request.method, "url": str(request.url)},
        )
        return JSONResponse(
            status_code=404,
            content={
                "error": True,
                "message": str(exc),
                "type": "NotFoundError",
                "context": {"response_body": exc.response_body},
            },
        )

    @app.exception_handler(ServerError)
    async def server_error_handler(request: Request, exc: ServerError):
        log.error(
            "server error",
            {"method": request.method, "url": str(request.url), "error": str(exc)},
        )
        return JSONResponse(
            status_code=exc.status_code or 502,
            content={
                "error": True,
                "message": str(exc),
                "type": "ServerError",
                "context": {},
            },
        )

    @app.exception_handler(StatsigError)
    async def statsig_error_handler(request: Request, exc: StatsigError):
        log.error(
            "statsig error",
            {"method": request.method, "url": str(request.url), "error": str(exc)},
        )
        return JSONResponse(
            status_code=exc.status_code or 500,
            content={
                "error": True,
                "message": str(exc),
                "type": type(exc).__name__,
                "context": {},
            },
        )

    @app.exception_handler(Exception)
    async def generic_handler(request: Request, exc: Exception):
        log.error(
            "unhandled error",
            {"method": request.method, "url": str(request.url), "error": str(exc)},
        )
        return JSONResponse(
            status_code=500,
            content={
                "error": True,
                "message": "Internal server error",
                "type": "InternalError",
                "context": {},
            },
        )
