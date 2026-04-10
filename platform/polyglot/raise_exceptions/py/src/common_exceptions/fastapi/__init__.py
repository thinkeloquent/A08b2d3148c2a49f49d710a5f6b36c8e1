"""
FastAPI adapter for common_exceptions.

Provides exception handler registration and request ID middleware.

Usage:
    from fastapi import FastAPI
    from common_exceptions.fastapi import register_exception_handlers

    app = FastAPI()
    register_exception_handlers(app)
"""

from .handlers import (
    base_http_exception_handler,
    generic_exception_handler,
    http_exception_handler,
    register_exception_handlers,
    validation_exception_handler,
)
from .middleware import RequestIdMiddleware
from .normalizers import normalize_pydantic_errors

__all__ = [
    "register_exception_handlers",
    "base_http_exception_handler",
    "validation_exception_handler",
    "http_exception_handler",
    "generic_exception_handler",
    "normalize_pydantic_errors",
    "RequestIdMiddleware",
]
