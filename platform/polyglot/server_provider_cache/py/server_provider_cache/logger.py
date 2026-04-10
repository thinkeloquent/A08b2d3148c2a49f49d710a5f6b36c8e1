"""
Logger module for server_provider_cache package.

Provides defensive programming logging with consistent format:
[{LEVEL}] [{package}:{filename}] {message}

Child loggers include instance name:
[{LEVEL}] [{package}:{filename}] [{instance}] {message}

Usage:
    from .logger import create as create_logger
    logger = create_logger("server_provider_cache", __name__)
    logger.info("Factory initialized")
    child = logger.child("providers")
    child.debug("Cache hit: oauth:google")
"""

import os
from typing import Protocol, Optional, Callable

# Log levels
DEBUG = 10
INFO = 20
WARN = 30
ERROR = 40

# Default log level (can be overridden via environment variable)
_DEFAULT_LEVEL = DEBUG
_LOG_LEVEL = int(os.getenv("CACHE_LOG_LEVEL", _DEFAULT_LEVEL))


class LoggerProtocol(Protocol):
    """Protocol defining the logger interface."""

    def debug(self, message: str) -> None: ...
    def info(self, message: str) -> None: ...
    def warn(self, message: str) -> None: ...
    def error(self, message: str) -> None: ...
    def child(self, instance_name: str) -> "LoggerProtocol": ...


class Logger:
    """Logger instance with package/filename context and child logger support."""

    def __init__(
        self,
        package_name: str,
        filename: str,
        instance: Optional[str] = None,
        level: int = _LOG_LEVEL,
        output: Optional[Callable[[str], None]] = None,
    ):
        self._package = package_name
        self._filename = self._extract_filename(filename)
        self._instance = instance
        self._level = level
        self._output = output or print

    def _extract_filename(self, filename: str) -> str:
        """Extract clean filename from module path."""
        # Handle __name__ style (e.g., "server_provider_cache.factory")
        if "." in filename:
            filename = filename.split(".")[-1]
        # Remove .py extension if present
        if filename.endswith(".py"):
            filename = filename[:-3]
        return filename

    def _log(self, level: str, level_value: int, message: str) -> None:
        """Internal log method with level check."""
        if level_value >= self._level:
            if self._instance:
                prefix = f"[{level}] [{self._package}:{self._filename}] [{self._instance}]"
            else:
                prefix = f"[{level}] [{self._package}:{self._filename}]"
            formatted = f"{prefix} {message}"
            self._output(formatted)

    def debug(self, message: str) -> None:
        """Log debug message (detailed internal state)."""
        self._log("DEBUG", DEBUG, message)

    def info(self, message: str) -> None:
        """Log info message (normal operations)."""
        self._log("INFO", INFO, message)

    def warn(self, message: str) -> None:
        """Log warning message (recoverable issues)."""
        self._log("WARN", WARN, message)

    def error(self, message: str) -> None:
        """Log error message (failures requiring attention)."""
        self._log("ERROR", ERROR, message)

    def child(self, instance_name: str) -> "Logger":
        """Create a child logger with instance name prefix.

        Args:
            instance_name: Instance identifier (e.g., "providers", "config")

        Returns:
            Child logger with instance prefix
        """
        return Logger(
            package_name=self._package,
            filename=f"{self._filename}:{self._instance or ''}",
            instance=instance_name,
            level=self._level,
            output=self._output,
        )


def create(
    package_name: str,
    filename: str,
    level: Optional[int] = None,
    output: Optional[Callable[[str], None]] = None,
) -> Logger:
    """
    Create a logger instance for the given package and file.

    Args:
        package_name: Package identifier (e.g., "server_provider_cache")
        filename: Source file identifier (e.g., __name__)
        level: Optional log level override
        output: Optional output function override (default: print)

    Returns:
        Logger instance

    Example:
        logger = create("server_provider_cache", __name__)
        logger.info("Factory created")
        child = logger.child("providers")
        child.debug("cache hit: oauth:google")
    """
    return Logger(
        package_name=package_name,
        filename=filename,
        instance=None,
        level=level if level is not None else _LOG_LEVEL,
        output=output,
    )


# Expose log level constants for external configuration
__all__ = ["create", "Logger", "LoggerProtocol", "DEBUG", "INFO", "WARN", "ERROR"]
