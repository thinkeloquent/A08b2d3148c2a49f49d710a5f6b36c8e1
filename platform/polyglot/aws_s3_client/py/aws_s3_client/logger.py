"""
Polyglot Logger Interface

Provides a unified logging interface for defensive programming with verbose output.
Logger instances can be injected via constructor for testing and customization.

Usage:
    from aws_s3_client.logger import create
    logger = create("aws_s3_client", __file__)
    logger.debug("Operation started")
    logger.info("Operation completed successfully")
    logger.warn("Approaching limit")
    logger.error("Operation failed")
"""

from __future__ import annotations

import logging
import os
import sys
from abc import abstractmethod
from datetime import UTC, datetime, timezone
from typing import Protocol, runtime_checkable


@runtime_checkable
class LoggerProtocol(Protocol):
    """Protocol defining the logger interface for dependency injection."""

    @abstractmethod
    def debug(self, message: str) -> None:
        """Log a debug message."""
        ...

    @abstractmethod
    def info(self, message: str) -> None:
        """Log an info message."""
        ...

    @abstractmethod
    def warn(self, message: str) -> None:
        """Log a warning message."""
        ...

    @abstractmethod
    def error(self, message: str) -> None:
        """Log an error message."""
        ...


class DefaultLogger:
    """
    Default logger implementation with structured output format.

    Format: [timestamp] [level] [package:filename] message

    Supports standard log levels: DEBUG, INFO, WARN, ERROR
    """

    def __init__(
        self,
        package_name: str,
        filename: str,
        *,
        level: int = logging.DEBUG,
        stream: object | None = None,
    ) -> None:
        """
        Initialize the logger.

        Args:
            package_name: Name of the package for log prefix
            filename: Source filename for log prefix
            level: Minimum log level (default: DEBUG)
            stream: Output stream (default: sys.stderr)
        """
        self._package_name = package_name
        self._filename = os.path.basename(filename) if filename else "unknown"
        self._level = level
        self._stream = stream or sys.stderr

    def _format_message(self, level: str, message: str) -> str:
        """Format a log message with timestamp, level, and context."""
        timestamp = datetime.now(UTC).isoformat(timespec="milliseconds")
        return f"[{timestamp}] [{level}] [{self._package_name}:{self._filename}] {message}"

    def _log(self, level: str, level_int: int, message: str) -> None:
        """Internal log method."""
        if level_int >= self._level:
            formatted = self._format_message(level, message)
            print(formatted, file=self._stream)  # type: ignore[arg-type]

    def debug(self, message: str) -> None:
        """Log a debug message."""
        self._log("DEBUG", logging.DEBUG, message)

    def info(self, message: str) -> None:
        """Log an info message."""
        self._log("INFO", logging.INFO, message)

    def warn(self, message: str) -> None:
        """Log a warning message."""
        self._log("WARN", logging.WARNING, message)

    def error(self, message: str) -> None:
        """Log an error message."""
        self._log("ERROR", logging.ERROR, message)


class NullLogger:
    """A logger that does nothing. Useful for testing or disabling logging."""

    def debug(self, message: str) -> None:
        pass

    def info(self, message: str) -> None:
        pass

    def warn(self, message: str) -> None:
        pass

    def error(self, message: str) -> None:
        pass


def create(
    package_name: str,
    filename: str,
    *,
    level: int = logging.DEBUG,
    stream: object | None = None,
) -> DefaultLogger:
    """
    Factory function to create a logger instance.

    This is the primary way to create loggers in the package.

    Args:
        package_name: Name of the package (e.g., "aws_s3_client")
        filename: Source filename, typically __file__
        level: Minimum log level (default: DEBUG)
        stream: Output stream (default: sys.stderr)

    Returns:
        A configured DefaultLogger instance

    Example:
        logger = create("aws_s3_client", __file__)
        logger.info("Storage initialized")
    """
    return DefaultLogger(package_name, filename, level=level, stream=stream)
