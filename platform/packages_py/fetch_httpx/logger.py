"""
Logger Module - Defensive Programming Logging Interface

This module provides a standardized logging interface for the fetch_httpx package.
It supports structured logging with JSON and human-readable formats, log level filtering,
and can be overwritten via constructor arguments.

Usage:
    from . import logger as logger_module
    logger = logger_module.create("fetch_httpx", __file__)

    logger.info("Request started", context={"url": url, "method": method})
    logger.debug("Headers resolved", context={"headers": headers})
    logger.error("Request failed", context={"error": str(e)})

Environment Variables:
    LOG_LEVEL: TRACE, DEBUG, INFO, WARN, ERROR, SILENT (default: INFO)
    LOG_FORMAT: json, pretty (default: pretty in dev, json in prod)
    PYTHON_ENV: development, production (default: development)
"""

from __future__ import annotations

import json
import os
import sys
from collections.abc import Callable
from datetime import UTC, datetime
from enum import IntEnum
from pathlib import Path
from typing import Any


class LogLevel(IntEnum):
    """Log level enumeration with numeric values for comparison."""
    TRACE = 0
    DEBUG = 10
    INFO = 20
    WARN = 30
    ERROR = 40
    SILENT = 100


# Type aliases
LogFormatter = Callable[["LogEntry"], str]
LogOutput = Callable[[str], None]


class LogEntry:
    """Structured log entry containing all log metadata."""

    __slots__ = ("timestamp", "level", "package", "file", "message", "context", "correlation_id")

    def __init__(
        self,
        timestamp: str,
        level: str,
        package: str,
        file: str,
        message: str,
        context: dict[str, Any] | None = None,
        correlation_id: str | None = None,
    ) -> None:
        self.timestamp = timestamp
        self.level = level
        self.package = package
        self.file = file
        self.message = message
        self.context = context or {}
        self.correlation_id = correlation_id

    def to_dict(self) -> dict[str, Any]:
        """Convert log entry to dictionary representation."""
        result = {
            "timestamp": self.timestamp,
            "level": self.level,
            "package": self.package,
            "file": self.file,
            "message": self.message,
        }
        if self.context:
            result["context"] = self.context
        if self.correlation_id:
            result["correlation_id"] = self.correlation_id
        return result


class Logger:
    """
    Standard logging interface for fetch_httpx package.

    Provides defensive programming patterns with structured logging,
    configurable output format, and log level filtering.

    Args:
        package_name: Name of the package (e.g., "fetch_httpx")
        filename: Source filename (typically __file__)
        level: Minimum log level to output
        formatter: Custom formatter function (LogEntry -> str)
        output: Custom output function (str -> None)
        correlation_id: Optional correlation ID for request tracing
    """

    def __init__(
        self,
        package_name: str,
        filename: str,
        level: LogLevel = LogLevel.INFO,
        formatter: LogFormatter | None = None,
        output: LogOutput | None = None,
        correlation_id: str | None = None,
    ) -> None:
        self.package_name = package_name
        self.filename = self._extract_filename(filename)
        self.level = level
        self.formatter = formatter or self._get_default_formatter()
        self.output = output or self._default_output
        self.correlation_id = correlation_id

    @staticmethod
    def _extract_filename(filepath: str) -> str:
        """Extract just the filename from a full path."""
        return Path(filepath).name

    @staticmethod
    def _get_default_formatter() -> LogFormatter:
        """Get default formatter based on environment."""
        env = os.environ.get("PYTHON_ENV", "development").lower()
        log_format = os.environ.get("LOG_FORMAT", "").lower()

        if log_format == "json" or (env == "production" and log_format != "pretty"):
            return Logger._json_formatter
        return Logger._pretty_formatter

    @staticmethod
    def _json_formatter(entry: LogEntry) -> str:
        """Format log entry as JSON (production)."""
        return json.dumps(entry.to_dict(), separators=(",", ":"))

    @staticmethod
    def _pretty_formatter(entry: LogEntry) -> str:
        """Format log entry as human-readable (development)."""
        # Color codes for different log levels
        colors = {
            "TRACE": "\033[90m",   # Gray
            "DEBUG": "\033[36m",   # Cyan
            "INFO": "\033[32m",    # Green
            "WARN": "\033[33m",    # Yellow
            "ERROR": "\033[31m",   # Red
        }
        reset = "\033[0m"
        color = colors.get(entry.level, "")

        # Format: [TIMESTAMP] LEVEL [package:file] message {context}
        parts = [
            f"[{entry.timestamp}]",
            f"{color}{entry.level:5}{reset}",
            f"[{entry.package}:{entry.file}]",
            entry.message,
        ]

        if entry.correlation_id:
            parts.append(f"(cid:{entry.correlation_id})")

        if entry.context:
            ctx_str = " ".join(f"{k}={_format_value(v)}" for k, v in entry.context.items())
            parts.append(f"{{ {ctx_str} }}")

        return " ".join(parts)

    @staticmethod
    def _default_output(formatted: str) -> None:
        """Default output to stderr."""
        print(formatted, file=sys.stderr)

    def _create_entry(
        self,
        level: str,
        message: str,
        context: dict[str, Any] | None = None,
    ) -> LogEntry:
        """Create a log entry with current timestamp."""
        return LogEntry(
            timestamp=datetime.now(UTC).isoformat(timespec="milliseconds"),
            level=level,
            package=self.package_name,
            file=self.filename,
            message=message,
            context=context,
            correlation_id=self.correlation_id,
        )

    def _log(
        self,
        level: LogLevel,
        message: str,
        context: dict[str, Any] | None = None,
    ) -> None:
        """Internal log method with level checking."""
        if level < self.level:
            return

        entry = self._create_entry(level.name, message, context)
        formatted = self.formatter(entry)
        self.output(formatted)

    def trace(self, message: str, context: dict[str, Any] | None = None) -> None:
        """Log at TRACE level (most verbose)."""
        self._log(LogLevel.TRACE, message, context)

    def debug(self, message: str, context: dict[str, Any] | None = None) -> None:
        """Log at DEBUG level."""
        self._log(LogLevel.DEBUG, message, context)

    def info(self, message: str, context: dict[str, Any] | None = None) -> None:
        """Log at INFO level."""
        self._log(LogLevel.INFO, message, context)

    def warn(self, message: str, context: dict[str, Any] | None = None) -> None:
        """Log at WARN level."""
        self._log(LogLevel.WARN, message, context)

    def error(self, message: str, context: dict[str, Any] | None = None) -> None:
        """Log at ERROR level."""
        self._log(LogLevel.ERROR, message, context)

    def with_correlation_id(self, correlation_id: str) -> Logger:
        """Create a new logger instance with the specified correlation ID."""
        return Logger(
            package_name=self.package_name,
            filename=self.filename,
            level=self.level,
            formatter=self.formatter,
            output=self.output,
            correlation_id=correlation_id,
        )

    def child(self, filename: str) -> Logger:
        """Create a child logger for a different file in the same package."""
        return Logger(
            package_name=self.package_name,
            filename=filename,
            level=self.level,
            formatter=self.formatter,
            output=self.output,
            correlation_id=self.correlation_id,
        )


def _format_value(value: Any) -> str:
    """Format a value for pretty printing, handling special cases."""
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, str):
        # Truncate long strings
        if len(value) > 100:
            return f'"{value[:97]}..."'
        return f'"{value}"'
    if isinstance(value, dict | list):
        s = json.dumps(value, separators=(",", ":"))
        if len(s) > 100:
            return f"{s[:97]}..."
        return s
    return str(value)


def _get_level_from_env() -> LogLevel:
    """Get log level from environment variable."""
    level_str = os.environ.get("LOG_LEVEL", "INFO").upper()
    try:
        return LogLevel[level_str]
    except KeyError:
        return LogLevel.INFO


def create(
    package_name: str,
    filename: str,
    level: LogLevel | None = None,
    formatter: LogFormatter | None = None,
    output: LogOutput | None = None,
) -> Logger:
    """
    Factory function to create a logger instance.

    Args:
        package_name: Name of the package (e.g., "fetch_httpx")
        filename: Source filename (typically __file__)
        level: Override log level (default: from LOG_LEVEL env var)
        formatter: Custom formatter function
        output: Custom output function

    Returns:
        Configured Logger instance

    Example:
        logger = create("fetch_httpx", __file__)
        logger.info("Client created", context={"base_url": base_url})
    """
    resolved_level = level if level is not None else _get_level_from_env()
    return Logger(
        package_name=package_name,
        filename=filename,
        level=resolved_level,
        formatter=formatter,
        output=output,
    )


# Convenience: Create a default logger for this module
_module_logger = create("fetch_httpx", __file__)


def get_module_logger() -> Logger:
    """Get the default module logger."""
    return _module_logger


__all__ = [
    "LogLevel",
    "LogEntry",
    "Logger",
    "create",
    "get_module_logger",
]
