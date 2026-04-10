"""
02_create_shared_context.py

Creates and stores SharedContext on app.state before context resolver runs.
This allows other plugins/modules to pre-configure the shared context.

SharedContext Features:
- .get(key, default) - get value, callable defaults are invoked and cached
- .set(key, value) - set a value
- .register(key, value) - register utilities accessible by child contexts
- .create_child() - create REQUEST context that inherits from STARTUP context

Per-request child contexts:
    Use a FastAPI dependency to get a child context per request:

    from fastapi import Depends, Request

    def get_request_context(request: Request):
        shared = request.app.state.sharedContext
        return shared.create_child() if shared else None

    @app.get("/example")
    async def example(ctx = Depends(get_request_context)):
        value = ctx.get('some_key', lambda: 'default')
        ...
"""

import logging
from fastapi import FastAPI

logger = logging.getLogger("lifecycle:create_shared_context")

try:
    from app_yaml_overwrites import create_shared_context
    HAS_SHARED_CONTEXT = True
except ImportError:
    HAS_SHARED_CONTEXT = False


async def onStartup(app: FastAPI, config: dict):
    """Create and store SharedContext on app.state."""
    logger.info("Starting create_shared_context lifecycle hook...")
    try:
        logger.debug(
            "02_create_shared_context.py onStartup called. HAS_SHARED_CONTEXT=%s",
            HAS_SHARED_CONTEXT,
        )

        if not HAS_SHARED_CONTEXT:
            logger.warning("create_shared_context not available. Skipping SharedContext setup.")
            return

        # Check if sharedContext already exists
        existing = getattr(app.state, 'sharedContext', None)
        if existing is not None:
            logger.info("SharedContext already exists on app.state, skipping creation")
            return

        # Create and store shared context
        shared_context = create_shared_context()
        app.state.sharedContext = shared_context
        logger.info("Created and stored SharedContext on app.state")

        # ==========================================================================
        # EXAMPLES: Register utilities at STARTUP
        # ==========================================================================

        # Example 1: Register a simple value
        # import time
        # shared_context.set('app_start_time', time.time())

        # Example 2: Register a utility class instance
        # class TokenGenerator:
        #     def generate(self):
        #         import uuid
        #         return f"token_{uuid.uuid4().hex}"
        # shared_context.register('token_generator', TokenGenerator())

        # Example 3: Register a lazy-computed value (computed on first access)
        # shared_context.register('db_connection', lambda: create_db_connection(), lazy=True)

        # Example 4: Access values later with callable default (auto-cached)
        # import time
        # timestamp = shared_context.get('timestamp', lambda: time.time())
        # same_timestamp = shared_context.get('timestamp', lambda: time.time())  # Returns cached value

        logger.info("create_shared_context lifecycle hook completed successfully")
    except Exception as exc:
        logger.error("create_shared_context lifecycle hook failed: %s", exc, exc_info=True)
        raise
