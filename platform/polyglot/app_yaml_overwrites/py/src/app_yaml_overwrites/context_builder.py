
import os
from typing import Dict, Any, Optional, List, Callable, Awaitable, Protocol, runtime_checkable
from .logger import ILogger, create
from .shared_context import SharedContext, create_shared_context


@runtime_checkable
class RequestLike(Protocol):
    """Generic request type for framework-agnostic usage."""
    headers: Optional[Dict[str, Any]]


ContextExtender = Callable[[Dict[str, Any], Optional[Any]], Awaitable[Dict[str, Any]]]

class ContextBuilder:
    def __init__(self, logger: ILogger = None):
        self._logger = logger or create("app_yaml_overwrites", "context_builder.py")
        self._ctx = {
             "env": dict(os.environ),
             "config": {},
             "app": {},
             "state": {},
             "request": None,
             "shared": None  # Will be set per resolution pass
        }
        self.extenders: List[ContextExtender] = []
        self._shared_context: Optional[SharedContext] = None

    def with_config(self, config: Dict[str, Any]) -> 'ContextBuilder':
        self._ctx["config"] = config
        return self

    def with_env(self, env: Dict[str, str]) -> 'ContextBuilder':
        self._ctx["env"] = env
        return self

    def with_app_config(self, app_config: Dict[str, Any]) -> 'ContextBuilder':
        self._ctx["app"] = app_config
        return self

    def with_state(self, state: Dict[str, Any]) -> 'ContextBuilder':
        self._ctx["state"] = state
        return self

    def with_request(self, request: Any) -> 'ContextBuilder':
        self._ctx["request"] = request
        return self

    def with_shared_context(self, shared: SharedContext = None) -> 'ContextBuilder':
        """
        Set shared context for resolution pass.
        If not provided, creates a new SharedContext.

        The shared context allows computed functions to share state
        during a single resolution pass (Option 5 pattern).

        Args:
            shared: Optional existing SharedContext, or creates new one

        Returns:
            Self for chaining
        """
        self._shared_context = shared or create_shared_context()
        return self

    def add_extender(self, extender: ContextExtender) -> 'ContextBuilder':
        self.extenders.append(extender)
        return self

    async def build(self) -> Dict[str, Any]:
        self._logger.debug("Building context", data={"keys": list(self._ctx.keys())})

        context = self._ctx.copy()

        # Always provide a shared context for computed functions
        context["shared"] = self._shared_context or create_shared_context()

        # Apply extenders
        if self.extenders:
            for extender in self.extenders:
                try:
                    partial = await extender(context, context["request"])
                    context.update(partial)
                except Exception as e:
                    self._logger.warn(f"Context extender failed: {e}")

        return context

    @staticmethod
    async def build_static(
        options: Dict[str, Any],
        extenders: List[ContextExtender] = None,
        logger: ILogger = None,
        shared: SharedContext = None
    ) -> Dict[str, Any]:
        """
        Static convenience method for backward compatibility / easy usage.

        Args:
            options: Context options (config, env, app, state, request)
            extenders: Optional list of context extenders
            logger: Optional logger instance
            shared: Optional shared context for computed functions

        Returns:
            Built context dictionary with shared context included
        """
        builder = ContextBuilder(logger)

        if "config" in options: builder.with_config(options["config"])
        if "env" in options: builder.with_env(options["env"])
        if "app" in options: builder.with_app_config(options["app"])
        if "state" in options: builder.with_state(options["state"])
        if "request" in options: builder.with_request(options["request"])
        if shared: builder.with_shared_context(shared)

        if extenders:
            for ext in extenders:
                builder.add_extender(ext)

        return await builder.build()
