"""
100_on_request_decorators.py

Attaches platform tools to request.context for route access.
Equivalent to Fastify's 100-on-request-decorators.mjs.

This middleware runs on every request and sets up request.context with:
- sharedContext (creates child context per request)
- context_registry
- config_sdk (from app.state.sdk)

Note: request.context is SEPARATE from request.state (State Machine).
- request.state = State Machine (serializable mode + context data)
- request.context = Platform Tools (non-serializable functions, class instances)

Usage in routes:
    from fastapi import Request

    @router.get("/")
    async def home(request: Request):
        # Platform tools via request.context
        shared_context = request.context.sharedContext
        registry = request.context.context_registry
        sdk = request.context.config_sdk

        # State machine via request.state
        mode = request.state.mode
        user_tier = request.state.context.user_tier

        return {"message": "Hello"}
"""

import logging
from types import SimpleNamespace
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("lifecycle:on_request_decorators")


class RequestDecoratorsMiddleware(BaseHTTPMiddleware):
    """Middleware to attach platform tools to request.context (separate from request.state)."""

    async def dispatch(self, request: Request, call_next):
        app = request.app

        # Initialize request.context as a SimpleNamespace for platform tools
        # This is SEPARATE from request.state (State Machine)
        request.context = SimpleNamespace()

        # Create child SharedContext for this request
        shared_context = getattr(app.state, 'sharedContext', None)
        if shared_context and hasattr(shared_context, 'create_child'):
            request.context.sharedContext = shared_context.create_child()
        else:
            request.context.sharedContext = shared_context

        # Copy context_registry to request.context
        context_registry = getattr(app.state, 'context_registry', None)
        if context_registry:
            request.context.context_registry = context_registry

        # Copy sdk to request.context (as config_sdk for consistency with Fastify)
        sdk = getattr(app.state, 'sdk', None)
        if sdk:
            request.context.config_sdk = sdk

        # Copy endpoint config SDK to request.context
        endpoint_config_sdk = getattr(app.state, 'endpoint_config_sdk', None)
        if endpoint_config_sdk:
            request.context.endpoint_config = endpoint_config_sdk

        response = await call_next(request)
        return response


async def onStartup(app: FastAPI, config: dict):
    """
    Configure request context decorators.

    NOTE: This hook does NOT add middleware (can't add middleware after app starts).
    Instead, it stores the middleware class on app.state. The actual middleware is
    registered in polyglot_server/server.py BEFORE the lifespan starts.
    """
    logger.info("Starting on_request_decorators lifecycle hook...")
    try:
        logger.info("Configuring RequestDecoratorsMiddleware")

        # Store middleware class for server.py to use
        app.state.RequestDecoratorsMiddlewareClass = RequestDecoratorsMiddleware

        logger.info("RequestDecoratorsMiddleware configured (registered in server.py)")
        logger.info("on_request_decorators lifecycle hook completed successfully")
    except Exception as exc:
        logger.error("on_request_decorators lifecycle hook failed: %s", exc, exc_info=True)
        raise
