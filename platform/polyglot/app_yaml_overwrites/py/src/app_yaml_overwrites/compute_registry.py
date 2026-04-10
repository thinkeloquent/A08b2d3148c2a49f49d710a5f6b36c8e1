"""
Compute Registry Module for app_yaml_overwrites package.
Provides registration and execution of compute functions with scope management.
"""

import re
import asyncio
import inspect
from typing import Callable, Dict, Optional, Any, List
from dataclasses import dataclass

from .logger import create as create_logger, ILogger
from .options import ComputeScope
from .errors import ComputeFunctionError, ErrorCode

# Create module-level logger
logger = create_logger("app_yaml_overwrites", "compute_registry.py")

# Type alias for compute functions
ComputeFunction = Callable[..., Any]


@dataclass
class RegisteredFunction:
    """
    Represents a registered compute function with its scope.
    """
    fn: ComputeFunction
    scope: ComputeScope


class ComputeRegistry:
    """
    Registry for compute functions that can be called via {{fn:name}}.

    Features:
    - Function registration with STARTUP or REQUEST scope
    - Name validation (^[a-zA-Z_][a-zA-Z0-9_]*$)
    - STARTUP scope results are cached
    - REQUEST scope functions are executed per-call
    - Supports both sync and async functions
    """

    NAME_PATTERN = re.compile(r'^[a-zA-Z_][a-zA-Z0-9_]*$')

    def __init__(self, logger_instance: Optional[ILogger] = None):
        self._logger = logger_instance or logger
        self._functions: Dict[str, RegisteredFunction] = {}
        self._cache: Dict[str, Any] = {}
        self._logger.debug("ComputeRegistry initialized")

    def register(
        self,
        name: str,
        fn: ComputeFunction,
        scope: ComputeScope = ComputeScope.REQUEST
    ) -> None:
        """
        Register a compute function with the given scope.

        Args:
            name: Function name (must match ^[a-zA-Z_][a-zA-Z0-9_]*$)
            fn: The function to register
            scope: ComputeScope.STARTUP (cached) or ComputeScope.REQUEST (per-call) or ComputeScope.GLOBAL (both, never cached)

        Raises:
            ValueError: If name is invalid
        """
        self._validate_name(name)
        self._logger.debug(f"Registering function: {name} with scope: {scope.value}")
        self._functions[name] = RegisteredFunction(fn=fn, scope=scope)
        self._logger.info(f"Function registered: {name}")

    def unregister(self, name: str) -> bool:
        """
        Unregister a compute function.

        Args:
            name: Function name to unregister

        Returns:
            True if function was unregistered, False if not found
        """
        if name in self._functions:
            self._logger.debug(f"Unregistering function: {name}")
            del self._functions[name]
            # Also remove from cache if present
            self._cache.pop(name, None)
            self._logger.info(f"Function unregistered: {name}")
            return True
        return False

    def has(self, name: str) -> bool:
        """
        Check if a function is registered.

        Args:
            name: Function name to check

        Returns:
            True if function is registered
        """
        return name in self._functions

    def list(self) -> List[str]:
        """
        List all registered function names.

        Returns:
            List of function names
        """
        return list(self._functions.keys())

    def get_scope(self, name: str) -> Optional[ComputeScope]:
        """
        Get the scope of a registered function.

        Args:
            name: Function name

        Returns:
            ComputeScope if found, None otherwise
        """
        if name in self._functions:
            return self._functions[name].scope
        return None

    def clear(self) -> None:
        """
        Clear all registered functions and cache.
        """
        self._logger.debug("Clearing registry")
        self._functions.clear()
        self._cache.clear()

    def clear_cache(self) -> None:
        """
        Clear only the result cache (keep registrations).
        """
        self._logger.debug("Clearing result cache")
        self._cache.clear()

    async def resolve(
        self,
        name: str,
        context: Optional[Dict[str, Any]] = None,
        property_path: Optional[str] = None
    ) -> Any:
        """
        Resolve (execute) a compute function.

        Args:
            name: Function name to execute
            context: Optional context dict passed to the function
            property_path: The path to the property being computed (e.g., "providers.gemini_openai.api_key")

        Returns:
            The function's return value

        Raises:
            ComputeFunctionError: If function not found or execution fails
        """
        self._logger.debug(f"Resolving function: {name}", property_path=property_path)

        if name not in self._functions:
            self._logger.warn(f"Compute function not found: {name}")
            raise ComputeFunctionError(
                f"Compute function not found: {name}",
                ErrorCode.COMPUTE_FUNCTION_NOT_FOUND,
                {"name": name}
            )

        reg_fn = self._functions[name]

        # Check cache for STARTUP functions (cache key includes property_path for uniqueness)
        cache_key = f"{name}:{property_path}" if property_path else name
        if reg_fn.scope == ComputeScope.STARTUP and cache_key in self._cache:
            self._logger.debug(f"Returning cached value for: {cache_key}")
            return self._cache[cache_key]

        try:
            result = await self._execute_function(reg_fn.fn, context, property_path)

            # Cache result if STARTUP scope
            if reg_fn.scope == ComputeScope.STARTUP:
                self._cache[cache_key] = result
                self._logger.debug(f"Cached result for STARTUP function: {cache_key}")

            return result

        except Exception as e:
            self._logger.error(f"Function execution failed: {name}, error: {str(e)}")
            raise ComputeFunctionError(
                f"Compute function failed: {name}",
                ErrorCode.COMPUTE_FUNCTION_FAILED,
                {"name": name, "original_error": str(e)}
            ) from e

    def _get_required_param_count(self, fn: ComputeFunction) -> int:
        """
        Get the number of required parameters for a function using inspect.

        Returns:
            Number of required parameters (parameters without defaults)
        """
        try:
            sig = inspect.signature(fn)
            required = 0
            for param in sig.parameters.values():
                # Count parameters that don't have defaults and aren't *args/**kwargs
                if param.default is inspect.Parameter.empty and \
                   param.kind not in (inspect.Parameter.VAR_POSITIONAL, inspect.Parameter.VAR_KEYWORD):
                    required += 1
            return required
        except (ValueError, TypeError):
            # If we can't inspect, assume it takes context
            return 1

    async def _execute_function(
        self,
        fn: ComputeFunction,
        context: Optional[Dict[str, Any]],
        property_path: Optional[str] = None
    ) -> Any:
        """
        Execute a function, handling both sync and async functions.
        Uses inspect to determine correct function signature instead of catching TypeError.

        Function signatures supported:
        - fn(ctx) - Legacy: context only
        - fn(ctx, property_path) - New: context and property path
        - fn() - No arguments (fallback)

        Args:
            fn: The compute function to execute
            context: Context dict with env, config, request, etc.
            property_path: Path to the property being computed (e.g., "providers.gemini_openai.api_key")
        """
        # Use inspect to determine parameter count - avoids catching internal TypeErrors
        param_count = self._get_required_param_count(fn)

        if asyncio.iscoroutinefunction(fn):
            if param_count >= 2:
                return await fn(context, property_path)
            elif param_count == 1:
                return await fn(context)
            else:
                return await fn()
        else:
            if param_count >= 2:
                result = fn(context, property_path)
            elif param_count == 1:
                result = fn(context)
            else:
                result = fn()

            if asyncio.iscoroutine(result):
                return await result
            return result

    def _validate_name(self, name: str) -> None:
        """
        Validate a function name.

        Args:
            name: Function name to validate

        Raises:
            ValueError: If name is invalid
        """
        if not name:
            raise ValueError("Function name cannot be empty")
        if not self.NAME_PATTERN.match(name):
            raise ValueError(
                f"Invalid function name: {name}. "
                f"Must match pattern: ^[a-zA-Z_][a-zA-Z0-9_]*$"
            )


def create_registry(logger_instance: Optional[ILogger] = None) -> ComputeRegistry:
    """
    Factory function to create a ComputeRegistry instance.

    Args:
        logger_instance: Optional custom logger

    Returns:
        ComputeRegistry instance
    """
    return ComputeRegistry(logger_instance)
