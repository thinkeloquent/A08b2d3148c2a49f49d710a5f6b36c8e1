"""
04_state_machine.py

Implements the State Machine Pattern for Request State (REQ0002).
Initializes request.state with a StateContainer that holds 'mode' and 'context'.
"""

import logging
import copy
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("lifecycle:state_machine")


class AttributeDict(dict):
    """
    Dictionary that supports attribute access.
    Required to satisfy REQ0001 (dot access) and REQ0002 (dict data bag).
    """
    def __getattr__(self, key):
        try:
            return self[key]
        except KeyError:
            # Return None or raise AttributeError?
            # REQ0001 validation uses hasattr() which catches AttributeError.
            raise AttributeError(key)

    def __setattr__(self, key, value):
        self[key] = value

    def __deepcopy__(self, memo):
        return AttributeDict(copy.deepcopy(dict(self), memo))


class StateContainer:
    """
    State container with mode, context, and utilities.
    """
    def __init__(self, mode: str, context: dict):
        self._mode = mode
        # Convert context to AttributeDict for dot access
        self._context = AttributeDict(context)

    def get_mode(self):
        return self._mode

    def set_mode(self, mode):
        self._mode = mode

    def get_context(self, key=None):
        return self._context.get(key) if key else self._context

    def set_context(self, key, value):
        self._context[key] = value

    def transition(self, mode, updates=None):
        self._mode = mode
        if updates:
            self._context.update(updates)

    @property
    def mode(self):
        return self._mode

    @mode.setter
    def mode(self, value):
        self._mode = value

    @property
    def context(self):
        return self._context


class StateMachineMiddleware(BaseHTTPMiddleware):
    """Middleware to initialize request.state with StateContainer."""

    def __init__(self, app, initial_state: dict):
        super().__init__(app)
        self.initial_state = initial_state

    async def dispatch(self, request: Request, call_next):
        # Deep copy initial state to ensure isolation properly
        # We need to handle the fact that initial_state might be shared
        template_mode = self.initial_state.get("mode", "idle")
        template_context = self.initial_state.get("context", {})

        # Deep copy the context
        context = copy.deepcopy(template_context)

        # Populate request.state (cannot replace it due to _CachedRequest)
        container = StateContainer(template_mode, context)
        request.state.state_container = container
        request.state.mode = container.mode
        request.state.context = container.context

        return await call_next(request)


async def onStartup(app: FastAPI, config: dict):
    """
    Initialize State Machine on startup.

    NOTE: This hook does NOT add middleware (can't add middleware after app starts).
    Instead, it stores configuration on app.state. The actual middleware is
    registered in polyglot_server/server.py BEFORE the lifespan starts.

    This hook is kept for:
    1. Logging/debugging
    2. Future extensibility
    3. Storing StateContainer and AttributeDict classes on app.state for use by server.py
    """
    logger.info("Starting state_machine lifecycle hook...")
    try:
        logger.info("Initializing State Machine")

        initial_state = config.get("initial_state")
        logger.debug(
            "Checking initial_state in config: %s",
            "found" if initial_state else "not found",
        )
        if not initial_state:
            logger.warning("'initial_state' not found in config. State Machine disabled.")
            return

        # Store initial_state on app.state for reference
        app.state.initial_state = initial_state

        # Store StateContainer class for server.py middleware to use
        app.state.StateContainerClass = StateContainer
        app.state.AttributeDictClass = AttributeDict

        logger.info("State Machine configured (middleware registered in server.py)")
        logger.info("state_machine lifecycle hook completed successfully")
    except Exception as exc:
        logger.error("state_machine lifecycle hook failed: %s", exc, exc_info=True)
        raise
