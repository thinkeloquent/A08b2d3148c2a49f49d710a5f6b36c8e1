"""
SharedContext Module for app_yaml_overwrites package.

Provides a mutable state container for computed functions to share data
during a single resolution pass (either STARTUP or REQUEST scope).

Enhanced Features:
- Unified .get(key, default) - handles values, functions, objects
- Async support via .get_async() for async factories
- Parent context support - REQUEST can access STARTUP-registered values
- .register() for explicit utility registration at STARTUP

Usage:
    # Simple get with callable default (auto-caches result)
    timestamp = ctx['shared'].get('timestamp', lambda: time.time())

    # Register utilities at STARTUP
    ctx['shared'].register('token_generator', TokenGenerator())

    # Access at REQUEST time (if parent context set)
    generator = ctx['shared'].get('token_generator')
"""

import asyncio
import inspect
from threading import Lock
from typing import Any, Callable, Dict, List, Optional, TypeVar, Union, overload

T = TypeVar('T')


class SharedContext:
    """
    Thread-safe shared state container for resolution lifecycle.

    Features:
    - Unified get(key, default) - callable defaults are invoked and cached
    - Async support via get_async() for async factories
    - Parent context - REQUEST context can inherit from STARTUP context
    - register() for explicit utility/value registration
    - get_or_set() maintained for backwards compatibility

    Example:
        # Simplified API - callable default is invoked and cached
        timestamp = ctx['shared'].get('ts', lambda: int(time.time()))

        # Same result on subsequent calls (cached)
        timestamp = ctx['shared'].get('ts', lambda: int(time.time()))

        # Register utilities at STARTUP
        ctx['shared'].register('utils', MyUtilityClass())

        # Access registered utilities
        utils = ctx['shared'].get('utils')
    """

    def __init__(self, parent: Optional['SharedContext'] = None):
        """
        Initialize shared context.

        Args:
            parent: Optional parent context (e.g., STARTUP context for REQUEST)
                    Allows REQUEST scope to access STARTUP-registered values.
        """
        self._data: Dict[str, Any] = {}
        self._utils: Dict[str, Any] = {}  # Registered utilities
        self._lock = Lock()
        self._parent = parent

    def get(self, key: str, default: Union[T, Callable[[], T], None] = None) -> Optional[T]:
        """
        Get a value from shared context with smart default handling.

        If default is callable, it will be invoked and the result cached.
        This provides a unified API for all use cases:
        - .get('key') - returns value or None
        - .get('key', 'default') - returns value or 'default'
        - .get('key', lambda: time.time()) - returns value or calls factory
        - .get('key', MyClass()) - returns value or the object instance

        Args:
            key: The key to retrieve
            default: Default value, factory function, or object

        Returns:
            The stored value, computed value, or default
        """
        with self._lock:
            # Check local data first
            if key in self._data:
                return self._data[key]

            # Check utilities
            if key in self._utils:
                return self._utils[key]

            # Check parent context if available
            if self._parent is not None:
                parent_value = self._parent._get_from_parent(key)
                if parent_value is not None:
                    return parent_value

            # Handle default
            if default is None:
                return None

            # If callable, invoke and cache
            if callable(default) and not isinstance(default, type):
                # Don't call if it's a class (type) - treat as object
                # But do call if it's a function/lambda
                if inspect.isfunction(default) or inspect.ismethod(default) or hasattr(default, '__call__') and not isinstance(default, type):
                    try:
                        value = default()
                        self._data[key] = value  # Cache the result
                        return value
                    except TypeError:
                        # If calling fails, return as-is
                        return default

            return default

    async def get_async(self, key: str, default: Union[T, Callable[[], T], None] = None) -> Optional[T]:
        """
        Async version of get() for async factories.

        Handles both sync and async callables as defaults.

        Args:
            key: The key to retrieve
            default: Default value, factory function (sync or async), or object

        Returns:
            The stored value, computed value, or default
        """
        with self._lock:
            # Check local data first
            if key in self._data:
                return self._data[key]

            # Check utilities
            if key in self._utils:
                return self._utils[key]

            # Check parent context if available
            if self._parent is not None:
                parent_value = self._parent._get_from_parent(key)
                if parent_value is not None:
                    return parent_value

        # Handle default outside lock for async operations
        if default is None:
            return None

        # If callable, invoke and cache
        if callable(default) and not isinstance(default, type):
            try:
                if asyncio.iscoroutinefunction(default):
                    value = await default()
                else:
                    value = default()
                with self._lock:
                    self._data[key] = value
                return value
            except TypeError:
                return default

        return default

    def _get_from_parent(self, key: str) -> Optional[Any]:
        """Get value from this context (used by child contexts)."""
        if key in self._data:
            return self._data[key]
        if key in self._utils:
            return self._utils[key]
        if self._parent is not None:
            return self._parent._get_from_parent(key)
        return None

    def set(self, key: str, value: T) -> T:
        """
        Set a value in shared context.

        Args:
            key: The key to set
            value: The value to store

        Returns:
            The stored value (for chaining)
        """
        with self._lock:
            self._data[key] = value
            return value

    def register(
        self,
        key: str,
        value: Union[T, Callable[[], T]],
        lazy: bool = False
    ) -> 'SharedContext':
        """
        Register a utility, class instance, or computed value.

        Use this at STARTUP to register utilities that will be
        accessible at REQUEST time via child contexts.

        Args:
            key: The key to register under
            value: The value, class instance, or factory function
            lazy: If True and value is callable, defer execution until first access

        Returns:
            Self for chaining

        Example:
            # Register at STARTUP
            ctx['shared'].register('token_gen', TokenGenerator())
            ctx['shared'].register('timestamp', lambda: time.time(), lazy=True)

            # Access at REQUEST
            gen = ctx['shared'].get('token_gen')
        """
        with self._lock:
            if lazy and callable(value) and not isinstance(value, type):
                # Store as lazy factory - will be called on first access
                self._data[key] = _LazyValue(value)
            else:
                self._utils[key] = value
        return self

    def register_util(self, key: str, util: Any) -> 'SharedContext':
        """
        Register a utility class or object.

        Alias for register() for semantic clarity.

        Args:
            key: The key to register under
            util: The utility class instance or object

        Returns:
            Self for chaining
        """
        return self.register(key, util)

    def get_util(self, key: str, default: Any = None) -> Any:
        """
        Get a registered utility.

        Args:
            key: The utility key
            default: Default if not found

        Returns:
            The registered utility or default
        """
        with self._lock:
            if key in self._utils:
                return self._utils[key]
            if self._parent is not None:
                return self._parent.get_util(key, default)
            return default

    def get_utils(self) -> Dict[str, Any]:
        """
        Get all registered utilities.

        Returns:
            Dictionary of all registered utilities (including parent's)
        """
        with self._lock:
            utils = {}
            if self._parent is not None:
                utils.update(self._parent.get_utils())
            utils.update(self._utils)
            return utils

    def get_or_set(self, key: str, factory: Callable[[], T]) -> T:
        """
        Get existing value or set from factory if not present.

        DEPRECATED: Use .get(key, factory) instead.

        Maintained for backwards compatibility.

        Args:
            key: The key to get or set
            factory: Callable that returns the value to set

        Returns:
            The existing or newly created value
        """
        with self._lock:
            if key not in self._data:
                self._data[key] = factory()
            return self._data[key]

    def has(self, key: str) -> bool:
        """Check if a key exists in shared context (including parent)."""
        with self._lock:
            if key in self._data or key in self._utils:
                return True
            if self._parent is not None:
                return self._parent.has(key)
            return False

    def delete(self, key: str) -> bool:
        """
        Delete a key from shared context.

        Returns:
            True if key existed and was deleted, False otherwise
        """
        with self._lock:
            deleted = False
            if key in self._data:
                del self._data[key]
                deleted = True
            if key in self._utils:
                del self._utils[key]
                deleted = True
            return deleted

    def keys(self) -> List[str]:
        """Get all keys in shared context (including parent)."""
        with self._lock:
            all_keys = set(self._data.keys()) | set(self._utils.keys())
            if self._parent is not None:
                all_keys |= set(self._parent.keys())
            return list(all_keys)

    def values(self) -> List[Any]:
        """Get all values in shared context."""
        with self._lock:
            return list(self._data.values()) + list(self._utils.values())

    def items(self) -> List[tuple]:
        """Get all key-value pairs in shared context."""
        with self._lock:
            all_items = list(self._data.items()) + list(self._utils.items())
            return all_items

    def clear(self) -> None:
        """Clear all shared context data (does not affect parent)."""
        with self._lock:
            self._data.clear()
            self._utils.clear()

    def update(self, data: Dict[str, Any]) -> None:
        """Update shared context with multiple key-value pairs."""
        with self._lock:
            self._data.update(data)

    def with_parent(self, parent: 'SharedContext') -> 'SharedContext':
        """
        Set parent context and return self for chaining.

        Args:
            parent: Parent context to inherit from

        Returns:
            Self for chaining
        """
        self._parent = parent
        return self

    def create_child(self) -> 'SharedContext':
        """
        Create a child context that inherits from this one.

        Useful for creating REQUEST context from STARTUP context.

        Returns:
            New SharedContext with this as parent
        """
        return SharedContext(parent=self)

    def __contains__(self, key: str) -> bool:
        """Support 'in' operator."""
        return self.has(key)

    def __getitem__(self, key: str) -> Any:
        """Support bracket notation for getting values."""
        with self._lock:
            if key in self._data:
                return self._data[key]
            if key in self._utils:
                return self._utils[key]
            if self._parent is not None:
                return self._parent[key]
            raise KeyError(key)

    def __setitem__(self, key: str, value: Any) -> None:
        """Support bracket notation for setting values."""
        with self._lock:
            self._data[key] = value

    def __len__(self) -> int:
        """Return number of items in shared context."""
        with self._lock:
            return len(self._data) + len(self._utils)

    def __repr__(self) -> str:
        with self._lock:
            parent_info = f", parent={self._parent is not None}" if self._parent else ""
            return f"SharedContext(data={list(self._data.keys())}, utils={list(self._utils.keys())}{parent_info})"


class _LazyValue:
    """Wrapper for lazy-evaluated values."""

    def __init__(self, factory: Callable[[], Any]):
        self._factory = factory
        self._value = None
        self._evaluated = False

    def get(self) -> Any:
        if not self._evaluated:
            self._value = self._factory()
            self._evaluated = True
        return self._value


def create_shared_context(parent: Optional[SharedContext] = None) -> SharedContext:
    """
    Factory function to create a new SharedContext.

    Args:
        parent: Optional parent context for inheritance

    Returns:
        New SharedContext instance
    """
    return SharedContext(parent=parent)
