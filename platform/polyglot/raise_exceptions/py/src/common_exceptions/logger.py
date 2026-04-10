"""
Package logger interface for common_exceptions.

Provides defensive programming style logging with verbose output.
Default LOG_LEVEL=debug with env.LOG_LEVEL override.

Usage:
    from common_exceptions.logger import create
    logger = create("common_exceptions", __file__)
    logger.debug("Exception raised")
"""

import logging
import os
import sys
from pathlib import Path
from typing import Any, Optional, Protocol, Union


class LoggerProtocol(Protocol):
    """Protocol for logger interface - allows custom logger injection."""

    def debug(self, msg: str, *args: Any, **kwargs: Any) -> None: ...
    def info(self, msg: str, *args: Any, **kwargs: Any) -> None: ...
    def warning(self, msg: str, *args: Any, **kwargs: Any) -> None: ...
    def error(self, msg: str, *args: Any, **kwargs: Any) -> None: ...


LOG_LEVELS = {
    "debug": logging.DEBUG,
    "info": logging.INFO,
    "warning": logging.WARNING,
    "warn": logging.WARNING,
    "error": logging.ERROR,
}

_DEFAULT_LOG_LEVEL = "debug"
_loggers: dict[str, logging.Logger] = {}


class PackageLogger:
    """
    Package-scoped logger with context injection.

    Attributes:
        package_name: Name of the package
        filename: Source filename for context
        _logger: Underlying Python logger instance
    """

    def __init__(
        self,
        package_name: str,
        filename: str,
        level: Optional[str] = None,
        custom_logger: Optional[LoggerProtocol] = None,
    ):
        self.package_name = package_name
        self.filename = Path(filename).stem if filename else "unknown"
        self._custom_logger = custom_logger

        if custom_logger is None:
            self._logger = self._create_logger(package_name, self.filename, level)
        else:
            self._logger = None

    def _create_logger(
        self, package_name: str, filename: str, level: Optional[str]
    ) -> logging.Logger:
        """Create or retrieve a configured logger instance."""
        logger_name = f"{package_name}.{filename}"

        if logger_name in _loggers:
            return _loggers[logger_name]

        # Determine log level from env or default
        log_level_str = level or os.environ.get("LOG_LEVEL", _DEFAULT_LOG_LEVEL).lower()
        log_level = LOG_LEVELS.get(log_level_str, logging.DEBUG)

        logger = logging.getLogger(logger_name)
        logger.setLevel(log_level)

        # Avoid duplicate handlers
        if not logger.handlers:
            handler = logging.StreamHandler(sys.stderr)
            handler.setLevel(log_level)
            formatter = logging.Formatter(
                "[%(levelname)s] %(name)s: %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)

        # Prevent propagation to root logger
        logger.propagate = False

        _loggers[logger_name] = logger
        return logger

    def _format_message(self, msg: str) -> str:
        """Format message with context."""
        return msg

    def debug(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log debug message."""
        if self._custom_logger:
            self._custom_logger.debug(self._format_message(msg), *args, **kwargs)
        elif self._logger:
            self._logger.debug(self._format_message(msg), *args, **kwargs)

    def info(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log info message."""
        if self._custom_logger:
            self._custom_logger.info(self._format_message(msg), *args, **kwargs)
        elif self._logger:
            self._logger.info(self._format_message(msg), *args, **kwargs)

    def warning(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log warning message."""
        if self._custom_logger:
            self._custom_logger.warning(self._format_message(msg), *args, **kwargs)
        elif self._logger:
            self._logger.warning(self._format_message(msg), *args, **kwargs)

    def warn(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Alias for warning."""
        self.warning(msg, *args, **kwargs)

    def error(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log error message."""
        if self._custom_logger:
            self._custom_logger.error(self._format_message(msg), *args, **kwargs)
        elif self._logger:
            self._logger.error(self._format_message(msg), *args, **kwargs)


def create(
    package_name: str,
    filename: str,
    level: Optional[str] = None,
    custom_logger: Optional[LoggerProtocol] = None,
) -> PackageLogger:
    """
    Create a package-scoped logger.

    Args:
        package_name: Name of the package (e.g., "common_exceptions")
        filename: Source filename, typically __file__
        level: Optional log level override (debug, info, warning, error)
        custom_logger: Optional custom logger implementing LoggerProtocol

    Returns:
        PackageLogger instance

    Example:
        logger = create("common_exceptions", __file__)
        logger.debug("Exception raised: AUTH_NOT_AUTHENTICATED")
    """
    return PackageLogger(package_name, filename, level, custom_logger)


# Module-level default logger
default_logger = create("common_exceptions", __file__)
