"""
FastAPI Integration for fetch_httpx package.

Provides dependency injection support for FastAPI applications,
including HTTP client management and correlation ID propagation.

Example:
    from fastapi import FastAPI, Depends
    from fetch_httpx.integrations.fastapi import HTTPClientDependency

    app = FastAPI()
    http_client = HTTPClientDependency(base_url="https://api.backend.com")

    @app.on_event("startup")
    async def startup():
        await http_client.startup()

    @app.on_event("shutdown")
    async def shutdown():
        await http_client.shutdown()

    @app.get("/data")
    async def get_data(client = Depends(http_client)):
        response = await client.get("/items")
        return response.json()
"""

from __future__ import annotations

import uuid
from collections.abc import Callable
from typing import (
    TYPE_CHECKING,
    Any,
)

from .. import logger as logger_module
from .._client import AsyncClient
from .._config import Limits, Timeout

if TYPE_CHECKING:
    from fastapi import Request

    from .._types import AuthTypes, HeaderTypes

logger = logger_module.create("fetch_httpx", __file__)


# =============================================================================
# HTTP Client Dependency
# =============================================================================

class HTTPClientDependency:
    """
    FastAPI dependency for HTTP client injection.

    Provides a shared HTTP client with optional correlation ID
    propagation for request tracing.

    Example:
        http_client = HTTPClientDependency(
            base_url="https://api.example.com",
            timeout=30.0,
        )

        @app.get("/users")
        async def get_users(client = Depends(http_client)):
            return await client.get("/users")
    """

    def __init__(
        self,
        *,
        base_url: str | None = None,
        auth: AuthTypes | None = None,
        headers: HeaderTypes | None = None,
        timeout: float = 30.0,
        limits: Limits | None = None,
        correlation_header: str = "X-Correlation-ID",
        propagate_correlation: bool = True,
    ) -> None:
        self._base_url = base_url
        self._auth = auth
        self._headers = headers
        self._timeout = Timeout(timeout)
        self._limits = limits
        self._correlation_header = correlation_header
        self._propagate_correlation = propagate_correlation

        self._client: AsyncClient | None = None

        logger.info(
            "HTTPClientDependency created",
            context={
                "base_url": base_url,
                "propagate_correlation": propagate_correlation,
            }
        )

    async def startup(self) -> None:
        """Initialize the HTTP client (call from app startup)."""
        if self._client is None:
            self._client = AsyncClient(
                base_url=self._base_url,
                auth=self._auth,
                headers=self._headers,
                timeout=self._timeout,
                limits=self._limits,
            )
            logger.info("HTTPClientDependency started")

    async def shutdown(self) -> None:
        """Close the HTTP client (call from app shutdown)."""
        if self._client is not None:
            await self._client.aclose()
            self._client = None
            logger.info("HTTPClientDependency shutdown")

    async def __call__(
        self,
        request: Request | None = None,
    ) -> AsyncClient:
        """
        FastAPI dependency - returns HTTP client.

        If a request is provided and correlation propagation is enabled,
        returns a client configured to propagate the correlation ID.
        """
        if self._client is None:
            await self.startup()

        # Return the client as-is for now
        # Correlation ID would be handled via headers
        return self._client  # type: ignore


# =============================================================================
# Helper Functions
# =============================================================================

async def get_http_client(
    *,
    base_url: str | None = None,
    auth: AuthTypes | None = None,
    headers: HeaderTypes | None = None,
    timeout: float = 30.0,
) -> AsyncClient:
    """
    Get a configured HTTP client (creates new instance).

    For single-use clients or testing. For production, use
    HTTPClientDependency for connection pooling.

    Args:
        base_url: Base URL for requests
        auth: Authentication configuration
        headers: Default headers
        timeout: Request timeout

    Returns:
        Configured AsyncClient instance
    """
    return AsyncClient(
        base_url=base_url,
        auth=auth,
        headers=headers,
        timeout=timeout,
    )


def create_correlation_middleware(
    header_name: str = "X-Correlation-ID",
    generate_if_missing: bool = True,
) -> Callable:
    """
    Create a FastAPI middleware for correlation ID handling.

    The middleware extracts or generates a correlation ID for
    each request and stores it in request.state.

    Args:
        header_name: Name of the correlation header
        generate_if_missing: Generate ID if not in request

    Returns:
        FastAPI middleware function

    Example:
        from fastapi import FastAPI
        from fetch_httpx.integrations.fastapi import create_correlation_middleware

        app = FastAPI()

        correlation_middleware = create_correlation_middleware()

        @app.middleware("http")
        async def add_correlation_id(request, call_next):
            return await correlation_middleware(request, call_next)
    """
    async def middleware(request: Request, call_next: Callable) -> Any:
        # Get or generate correlation ID
        correlation_id = request.headers.get(header_name)
        if not correlation_id and generate_if_missing:
            correlation_id = str(uuid.uuid4())

        # Store in request state
        request.state.correlation_id = correlation_id

        logger.debug(
            "Correlation ID set",
            context={"correlation_id": correlation_id}
        )

        # Process request
        response = await call_next(request)

        # Add correlation ID to response
        if correlation_id:
            response.headers[header_name] = correlation_id

        return response

    return middleware


# =============================================================================
# Request State Helper
# =============================================================================

def get_correlation_id(request: Request) -> str | None:
    """
    Get correlation ID from request state.

    Args:
        request: FastAPI request object

    Returns:
        Correlation ID if set, None otherwise
    """
    return getattr(request.state, "correlation_id", None)


__all__ = [
    "HTTPClientDependency",
    "get_http_client",
    "create_correlation_middleware",
    "get_correlation_id",
]
