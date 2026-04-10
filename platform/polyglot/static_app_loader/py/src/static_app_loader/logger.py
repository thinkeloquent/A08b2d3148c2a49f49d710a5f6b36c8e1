"""Logger factory for consistent structured logging."""

import json
import sys
from typing import Any, Dict, Optional

from .types import ILogger


class DefaultLogger:
    """Default logger implementation with structured output.

    Format: [package:filename] LEVEL: message
    """

    def __init__(self, package_name: str, filename: str) -> None:
        """Initialize logger with package and filename prefix.

        Args:
            package_name: The package name (e.g., 'static-app-loader')
            filename: The source filename (e.g., 'fastapi.py')
        """
        self._prefix = f"[{package_name}:{filename}]"

    def _log(
        self, level: str, message: str, context: dict[str, Any] | None = None
    ) -> None:
        """Internal logging method."""
        context_str = f" {json.dumps(context)}" if context else ""
        output = f"{self._prefix} {level}: {message}{context_str}"

        if level == "ERROR":
            print(output, file=sys.stderr)
        else:
            print(output)

    def info(self, message: str, context: dict[str, Any] | None = None) -> None:
        """Log an info message."""
        self._log("INFO", message, context)

    def warn(self, message: str, context: dict[str, Any] | None = None) -> None:
        """Log a warning message."""
        self._log("WARN", message, context)

    def error(self, message: str, context: dict[str, Any] | None = None) -> None:
        """Log an error message."""
        self._log("ERROR", message, context)

    def debug(self, message: str, context: dict[str, Any] | None = None) -> None:
        """Log a debug message."""
        self._log("DEBUG", message, context)

    def trace(self, message: str, context: dict[str, Any] | None = None) -> None:
        """Log a trace message."""
        self._log("TRACE", message, context)


class SilentLogger:
    """No-op logger for testing or silent operation."""

    def info(self, message: str, context: dict[str, Any] | None = None) -> None:
        """No-op."""
        pass

    def warn(self, message: str, context: dict[str, Any] | None = None) -> None:
        """No-op."""
        pass

    def error(self, message: str, context: dict[str, Any] | None = None) -> None:
        """No-op."""
        pass

    def debug(self, message: str, context: dict[str, Any] | None = None) -> None:
        """No-op."""
        pass

    def trace(self, message: str, context: dict[str, Any] | None = None) -> None:
        """No-op."""
        pass


def create(package_name: str, filename: str) -> ILogger:
    """Create a logger instance with the standard package:filename prefix.

    Args:
        package_name: The package name (e.g., 'static-app-loader')
        filename: The source filename (e.g., 'fastapi.py')

    Returns:
        ILogger instance

    Example:
        >>> from . import logger
        >>> log = logger.create('static-app-loader', 'fastapi.py')
        >>> log.info('Registering app: dashboard')
        [static-app-loader:fastapi.py] INFO: Registering app: dashboard
    """
    return DefaultLogger(package_name, filename)


def create_silent() -> ILogger:
    """Create a no-op logger for testing or silent operation."""
    return SilentLogger()
