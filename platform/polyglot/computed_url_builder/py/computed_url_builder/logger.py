"""
Logger module for computed-url-builder package.

Provides a factory function for creating logger instances with
defensive programming patterns and structured output.

Usage:
    from computed_url_builder.logger import create

    logger = create('computed_url_builder', __file__)
    logger.debug('Operation started')
"""

from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Protocol, runtime_checkable


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

    def warning(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log a warning message (alias for warn)."""
        ...

    def error(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log an error message."""
        ...


class PackageLogger:
    """
    Custom logger implementation for defensive programming.

    Provides structured logging with package name, filename, and timestamp.
    """

    def __init__(
        self,
        package_name: str,
        filename: str,
        level: int = logging.DEBUG,
        enabled: bool = True,
    ) -> None:
        """
        Initialize the package logger.

        Args:
            package_name: Name of the package for log prefix
            filename: Source filename for log prefix
            level: Logging level (default: DEBUG)
            enabled: Whether logging is enabled (default: True)
        """
        self.package_name = package_name
        self.filename = Path(filename).name if filename else "unknown"
        self.level = level
        self.enabled = enabled

        # Create underlying Python logger
        self._logger = logging.getLogger(f"{package_name}:{self.filename}")
        self._logger.setLevel(level)

        # Add handler if not already present
        if not self._logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                "[%(asctime)s] [%(name)s] %(levelname)s: %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S"
            )
            handler.setFormatter(formatter)
            self._logger.addHandler(handler)
            # Prevent propagation to root logger
            self._logger.propagate = False

    def _should_log(self, level: int) -> bool:
        """Check if logging should occur for the given level."""
        return self.enabled and level >= self.level

    def _format_message(self, msg: str, *args: Any) -> str:
        """Format the log message with arguments."""
        if args:
            try:
                return msg % args
            except (TypeError, ValueError):
                return f"{msg} {args}"
        return msg

    def debug(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log a debug message."""
        if self._should_log(logging.DEBUG):
            self._logger.debug(self._format_message(msg, *args), **kwargs)

    def info(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log an info message."""
        if self._should_log(logging.INFO):
            self._logger.info(self._format_message(msg, *args), **kwargs)

    def warn(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log a warning message."""
        if self._should_log(logging.WARNING):
            self._logger.warning(self._format_message(msg, *args), **kwargs)

    def warning(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log a warning message (alias for warn)."""
        self.warn(msg, *args, **kwargs)

    def error(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log an error message."""
        if self._should_log(logging.ERROR):
            self._logger.error(self._format_message(msg, *args), **kwargs)


class NullLogger:
    """
    Null logger that discards all messages.

    Useful for disabling logging in tests or production.
    """

    def debug(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Discard debug message."""
        pass

    def info(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Discard info message."""
        pass

    def warn(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Discard warning message."""
        pass

    def warning(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Discard warning message."""
        pass

    def error(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Discard error message."""
        pass


def create(
    package_name: str,
    filename: str,
    level: int | None = None,
    enabled: bool | None = None,
) -> PackageLogger:
    """
    Create a logger instance for defensive programming.

    Args:
        package_name: Name of the package (e.g., 'computed_url_builder')
        filename: Source filename (typically __file__)
        level: Logging level (default: from LOG_LEVEL env or DEBUG)
        enabled: Whether logging is enabled (default: from LOG_ENABLED env or True)

    Returns:
        PackageLogger instance

    Example:
        >>> logger = create('computed_url_builder', __file__)
        >>> logger.debug('Operation started')
        [2026-01-19 12:00:00] [computed_url_builder:module.py] DEBUG: Operation started
    """
    # Determine level from environment or default
    if level is None:
        env_level = os.environ.get("LOG_LEVEL", "DEBUG").upper()
        level_map = {
            "DEBUG": logging.DEBUG,
            "INFO": logging.INFO,
            "WARN": logging.WARNING,
            "WARNING": logging.WARNING,
            "ERROR": logging.ERROR,
            "CRITICAL": logging.CRITICAL,
        }
        level = level_map.get(env_level, logging.DEBUG)

    # Determine enabled from environment or default
    if enabled is None:
        env_enabled = os.environ.get("LOG_ENABLED", "true").lower()
        enabled = env_enabled in ("true", "1", "yes", "on")

    return PackageLogger(
        package_name=package_name,
        filename=filename,
        level=level,
        enabled=enabled,
    )


def create_null() -> NullLogger:
    """
    Create a null logger that discards all messages.

    Useful for disabling logging in tests or when not needed.

    Returns:
        NullLogger instance
    """
    return NullLogger()


# Module-level default logger for internal use
_default_logger: PackageLogger | None = None


def get_default_logger() -> PackageLogger:
    """Get or create the default module logger."""
    global _default_logger
    if _default_logger is None:
        _default_logger = create("computed_url_builder", __file__)
    return _default_logger
