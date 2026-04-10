"""
Error Handler Middleware -- Sauce Labs API SDK

Maps SDK error types to FastAPI HTTP error responses.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from ..logger import create_logger
from ..errors import (
    SaucelabsAuthError,
    SaucelabsError,
    SaucelabsNotFoundError,
    SaucelabsRateLimitError,
    SaucelabsServerError,
    SaucelabsValidationError,
)

log = create_logger("saucelabs-api", __file__)


def register_error_handlers(app: FastAPI) -> None:
    """Register exception handlers on the FastAPI app."""

    @app.exception_handler(SaucelabsRateLimitError)
    async def rate_limit_handler(request: Request, exc: SaucelabsRateLimitError):
        log.error("rate limit error", {
            "method": request.method,
            "url": str(request.url),
            "error": str(exc),
        })
        retry_after = exc.retry_after or 60
        return JSONResponse(
            status_code=429,
            content={
                "error": True,
                "message": str(exc),
                "type": "SaucelabsRateLimitError",
                "context": {"retry_after": retry_after},
            },
            headers={"Retry-After": str(retry_after)},
        )

    @app.exception_handler(SaucelabsValidationError)
    async def validation_handler(request: Request, exc: SaucelabsValidationError):
        log.error("validation error", {
            "method": request.method,
            "url": str(request.url),
            "error": str(exc),
        })
        return JSONResponse(
            status_code=exc.status_code or 400,
            content={
                "error": True,
                "message": str(exc),
                "type": "SaucelabsValidationError",
                "context": {},
            },
        )

    @app.exception_handler(SaucelabsAuthError)
    async def auth_handler(request: Request, exc: SaucelabsAuthError):
        log.error("authentication error", {
            "method": request.method,
            "url": str(request.url),
        })
        return JSONResponse(
            status_code=401,
            content={
                "error": True,
                "message": str(exc),
                "type": "SaucelabsAuthError",
                "context": {},
            },
        )

    @app.exception_handler(SaucelabsNotFoundError)
    async def not_found_handler(request: Request, exc: SaucelabsNotFoundError):
        log.error("not found error", {
            "method": request.method,
            "url": str(request.url),
        })
        return JSONResponse(
            status_code=404,
            content={
                "error": True,
                "message": str(exc),
                "type": "SaucelabsNotFoundError",
                "context": {},
            },
        )

    @app.exception_handler(SaucelabsServerError)
    async def server_error_handler(request: Request, exc: SaucelabsServerError):
        log.error("server error", {
            "method": request.method,
            "url": str(request.url),
            "error": str(exc),
        })
        return JSONResponse(
            status_code=exc.status_code or 500,
            content={
                "error": True,
                "message": str(exc),
                "type": "SaucelabsServerError",
                "context": {},
            },
        )

    @app.exception_handler(SaucelabsError)
    async def saucelabs_error_handler(request: Request, exc: SaucelabsError):
        log.error("saucelabs error", {
            "method": request.method,
            "url": str(request.url),
            "error": str(exc),
        })
        return JSONResponse(
            status_code=exc.status_code or 500,
            content={
                "error": True,
                "message": str(exc),
                "type": type(exc).__name__,
                "context": {},
            },
        )
