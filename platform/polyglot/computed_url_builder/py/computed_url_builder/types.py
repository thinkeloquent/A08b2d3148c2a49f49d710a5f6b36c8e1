"""
Type definitions for computed-url-builder package.

This module defines the type aliases and protocols used throughout
the package for type safety and documentation.
"""

from __future__ import annotations

from collections.abc import Callable
from typing import Any, Dict, List, Optional, Protocol, Union, runtime_checkable

# Type alias for URL function - takes context dict, returns URL string
UrlFunction = Callable[[dict[str, Any]], str]

# Type alias for URL value - can be string, list, or function
UrlValue = Union[str, list[str], UrlFunction]

# Type alias for URL keys configuration
# Each key maps to a string (host), list of strings (URL parts), or function (computed URL)
UrlKeys = dict[str, UrlValue]


@runtime_checkable
class Logger(Protocol):
    """Protocol defining the logger interface."""

    def debug(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log a debug message."""
        ...

    def info(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log an info message."""
        ...

    def warn(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log a warning message."""
        ...

    def error(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log an error message."""
        ...


@runtime_checkable
class BuilderInstance(Protocol):
    """Protocol defining the URL builder instance interface."""

    @property
    def env(self) -> UrlKeys:
        """Get the environment URL configuration."""
        ...

    @property
    def base_path(self) -> str:
        """Get the base path."""
        ...

    def build(self, key: str, context: dict[str, Any] | None = None) -> str:
        """Build a URL for the specified environment key with optional context."""
        ...

    def to_dict(self) -> dict[str, Any]:
        """Serialize builder state to dictionary."""
        ...
