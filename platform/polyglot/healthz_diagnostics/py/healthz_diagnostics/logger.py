"""
Logger module for healthz_diagnostics package.

Provides defensive programming logging with consistent format:
[{LEVEL}] [{package}:{filename}] {message}

Usage:
    from .logger import create as create_logger
    logger = create_logger("healthz_diagnostics", __name__)
    logger.info("Operation completed")
"""

import os
from typing import Protocol, Optional, Callable

# Log levels
DEBUG = 10
INFO = 20
WARN = 30
ERROR = 40

# Default log level (can be overridden via environment variable)
_DEFAULT_LEVEL = INFO
_LOG_LEVEL = int(os.getenv("HEALTHZ_DIAGNOSTICS_LOG_LEVEL", _DEFAULT_LEVEL))


class LoggerProtocol(Protocol):
    """Protocol defining the logger interface."""
    def debug(self, message: str) -> None: ...
    def info(self, message: str) -> None: ...
    def warn(self, message: str) -> None: ...
    def error(self, message: str) -> None: ...


class Logger:
    """Logger instance with package/filename context."""

    def __init__(
        self,
        package_name: str,
        filename: str,
        level: int = _LOG_LEVEL,
        output: Optional[Callable[[str], None]] = None
    ):
        self._package = package_name
        self._filename = self._extract_filename(filename)
        self._level = level
        self._output = output or print

    def _extract_filename(self, filename: str) -> str:
        """Extract clean filename from module path."""
        # Handle __name__ style (e.g., "healthz_diagnostics.config_store")
        if "." in filename:
            filename = filename.split(".")[-1]
        # Remove .py extension if present
        if filename.endswith(".py"):
            filename = filename[:-3]
        return filename

    def _log(self, level: str, level_value: int, message: str) -> None:
        """Internal log method with level check."""
        if level_value >= self._level:
            formatted = f"[{level}] [{self._package}:{self._filename}] {message}"
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


def create(
    package_name: str,
    filename: str,
    level: Optional[int] = None,
    output: Optional[Callable[[str], None]] = None
) -> Logger:
    """
    Create a logger instance for the given package and file.

    Args:
        package_name: Package identifier (e.g., "healthz_diagnostics")
        filename: Source file identifier (e.g., __name__)
        level: Optional log level override
        output: Optional output function override (default: print)

    Returns:
        Logger instance

    Example:
        logger = create("healthz_diagnostics", __name__)
        logger.info("Config loaded successfully")
    """
    return Logger(
        package_name=package_name,
        filename=filename,
        level=level if level is not None else _LOG_LEVEL,
        output=output
    )


# Expose log level constants for external configuration
__all__ = ["create", "Logger", "LoggerProtocol", "DEBUG", "INFO", "WARN", "ERROR"]
