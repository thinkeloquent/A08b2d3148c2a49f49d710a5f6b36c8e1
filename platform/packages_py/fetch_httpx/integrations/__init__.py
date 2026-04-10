"""
Server Framework Integrations for fetch_httpx package.

Provides integration with popular Python web frameworks:
- fastapi: FastAPI dependency injection integration

Usage:
    from fetch_httpx.integrations.fastapi import HTTPClientDependency
"""

from .fastapi import (
    HTTPClientDependency,
    create_correlation_middleware,
    get_http_client,
)

__all__ = [
    "HTTPClientDependency",
    "get_http_client",
    "create_correlation_middleware",
]
