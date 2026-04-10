"""
Request ID middleware for FastAPI.

Extracts X-Request-Id from headers or generates UUID.
"""

import uuid
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from ..logger import create

logger = create("common_exceptions", __file__)


class RequestIdMiddleware(BaseHTTPMiddleware):
    """
    Middleware to extract or generate request ID.

    Looks for X-Request-Id header, or generates UUID if not present.
    Stores in request.state.request_id for use by exception handlers.
    """

    async def dispatch(
        self, request: Request, call_next: Callable
    ) -> Response:
        # Extract from header or generate
        request_id = request.headers.get("x-request-id")
        if not request_id:
            request_id = str(uuid.uuid4())
            logger.debug(f"Generated request ID: {request_id}")
        else:
            logger.debug(f"Using request ID from header: {request_id}")

        # Store in request state
        request.state.request_id = request_id

        # Process request
        response = await call_next(request)

        # Add to response headers
        response.headers["x-request-id"] = request_id

        return response


def add_request_id_middleware(app) -> None:
    """
    Add RequestIdMiddleware to a FastAPI app.

    Args:
        app: FastAPI application instance
    """
    app.add_middleware(RequestIdMiddleware)
    logger.info("Request ID middleware added")


logger.debug("Request ID middleware initialized")
