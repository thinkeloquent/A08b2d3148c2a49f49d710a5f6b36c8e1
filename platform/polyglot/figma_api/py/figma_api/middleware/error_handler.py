"""
Error Handler Middleware — Figma API SDK

Maps SDK error types to FastAPI HTTP error responses.
"""

import math

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from ..logger import create_logger
from ..sdk.errors import (
    AuthenticationError,
    AuthorizationError,
    FigmaError,
    NotFoundError,
    RateLimitError,
    ValidationError,
)

log = create_logger("figma-api", __file__)


def register_error_handlers(app: FastAPI) -> None:
    """Register exception handlers on the FastAPI app."""

    @app.exception_handler(RateLimitError)
    async def rate_limit_handler(request: Request, exc: RateLimitError):
        log.error(
            "rate limit error",
            method=request.method,
            url=str(request.url),
            error=str(exc),
        )
        retry_after = 60
        context = {}
        if exc.rate_limit_info:
            info = exc.rate_limit_info
            retry_after = info.get("retry_after", 60) if isinstance(info, dict) else getattr(info, "retry_after", 60)
            plan_tier = info.get("plan_tier") if isinstance(info, dict) else getattr(info, "plan_tier", None)
            rate_limit_type = info.get("rate_limit_type") if isinstance(info, dict) else getattr(info, "rate_limit_type", None)
            context = {
                "retry_after": retry_after,
                "retry_after_ms": math.ceil(retry_after * 1000),
                "retry_after_seconds": math.ceil(retry_after),
                "retry_after_minutes": round(retry_after / 60, 2),
                "plan_tier": plan_tier,
                "rate_limit_type": rate_limit_type,
            }
        return JSONResponse(
            status_code=429,
            content={"error": True, "message": str(exc), "type": "RateLimitError", "context": context},
            headers={"Retry-After": str(retry_after)},
        )

    @app.exception_handler(ValidationError)
    async def validation_handler(request: Request, exc: ValidationError):
        log.error("validation error", method=request.method, url=str(request.url), error=str(exc))
        return JSONResponse(
            status_code=400,
            content={"error": True, "message": str(exc), "type": "ValidationError", "context": exc.meta},
        )

    @app.exception_handler(AuthenticationError)
    async def auth_handler(request: Request, exc: AuthenticationError):
        log.error("authentication error", method=request.method, url=str(request.url))
        return JSONResponse(
            status_code=401,
            content={"error": True, "message": str(exc), "type": "AuthenticationError", "context": {}},
        )

    @app.exception_handler(AuthorizationError)
    async def forbidden_handler(request: Request, exc: AuthorizationError):
        log.error("authorization error", method=request.method, url=str(request.url))
        return JSONResponse(
            status_code=403,
            content={"error": True, "message": str(exc), "type": "AuthorizationError", "context": {}},
        )

    @app.exception_handler(NotFoundError)
    async def not_found_handler(request: Request, exc: NotFoundError):
        log.error("not found error", method=request.method, url=str(request.url))
        return JSONResponse(
            status_code=404,
            content={"error": True, "message": str(exc), "type": "NotFoundError", "context": exc.meta},
        )

    @app.exception_handler(FigmaError)
    async def figma_error_handler(request: Request, exc: FigmaError):
        log.error("figma error", method=request.method, url=str(request.url), error=str(exc))
        return JSONResponse(
            status_code=exc.status or 500,
            content={"error": True, "message": str(exc), "type": exc.name, "context": exc.meta},
        )

    @app.exception_handler(Exception)
    async def generic_handler(request: Request, exc: Exception):
        log.error("unhandled error", method=request.method, url=str(request.url), error=str(exc))
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": "Internal server error", "type": "InternalError", "context": {}},
        )
