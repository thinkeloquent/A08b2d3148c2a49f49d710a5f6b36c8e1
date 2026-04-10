"""
Logger Module - Defensive Programming Style Logging

Provides a standardized logging factory with verbose output for tracing
execution flow across the SDK.

Usage:
    from .logger import create
    logger = create("gemini_openai_sdk", __file__)

    logger.debug("Processing message", message_id=123)
    logger.info("Request completed", status=200)
    logger.warn("Rate limit approaching", remaining=10)
    logger.error("API request failed", error=str(e))
"""

import logging
import os
import sys
from pathlib import Path
from typing import Any, Optional


class SDKLogger:
    """
    SDK Logger with defensive programming patterns.

    Features:
    - Prefix output with [package:filename] context
    - Support log levels via LOG_LEVEL env var
    - Standard Console/Print interface
    - Extensible for future enhancements
    """

    LEVELS = {
        "DEBUG": logging.DEBUG,
        "INFO": logging.INFO,
        "WARN": logging.WARNING,
        "WARNING": logging.WARNING,
        "ERROR": logging.ERROR,
    }

    def __init__(
        self,
        package_name: str,
        filename: str,
        logger_instance: Optional[logging.Logger] = None,
    ):
        """
        Initialize SDK logger.

        Args:
            package_name: Name of the package (e.g., "gemini_openai_sdk")
            filename: Source file path (__file__)
            logger_instance: Optional custom logger to use instead of default
        """
        self.package_name = package_name
        self.filename = Path(filename).stem if filename else "unknown"
        self.prefix = f"[{package_name}:{self.filename}]"

        if logger_instance:
            self._logger = logger_instance
        else:
            self._logger = self._create_default_logger()

    def _create_default_logger(self) -> logging.Logger:
        """Create default logger with console handler."""
        logger = logging.getLogger(f"{self.package_name}.{self.filename}")

        # Prevent duplicate handlers
        if not logger.handlers:
            handler = logging.StreamHandler(sys.stderr)
            formatter = logging.Formatter(
                "%(asctime)s %(levelname)s %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S"
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)

        # Set level from environment
        level_name = os.environ.get("LOG_LEVEL", "INFO").upper()
        level = self.LEVELS.get(level_name, logging.INFO)
        logger.setLevel(level)

        return logger

    def _format_message(self, msg: str, *args: Any, **kwargs: Any) -> str:
        """Format message with prefix and arguments."""
        formatted = f"{self.prefix} {msg}"

        # Handle positional args (printf-style)
        if args:
            try:
                formatted = formatted % args
            except (TypeError, ValueError):
                formatted = f"{formatted} {args}"

        # Handle keyword args
        if kwargs:
            kv_pairs = " ".join(f"{k}={v}" for k, v in kwargs.items())
            formatted = f"{formatted} {kv_pairs}"

        return formatted

    def debug(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log debug message."""
        self._logger.debug(self._format_message(msg, *args, **kwargs))

    def info(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log info message."""
        self._logger.info(self._format_message(msg, *args, **kwargs))

    def warn(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log warning message."""
        self._logger.warning(self._format_message(msg, *args, **kwargs))

    def warning(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log warning message (alias for warn)."""
        self.warn(msg, *args, **kwargs)

    def error(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log error message."""
        self._logger.error(self._format_message(msg, *args, **kwargs))

    def set_level(self, level: str) -> None:
        """Set log level dynamically."""
        level_value = self.LEVELS.get(level.upper(), logging.INFO)
        self._logger.setLevel(level_value)


def create(
    package_name: str,
    filename: str,
    logger_instance: Optional[logging.Logger] = None,
) -> SDKLogger:
    """
    Create a logger instance for a module.

    Args:
        package_name: Name of the package (e.g., "gemini_openai_sdk")
        filename: Source file path (use __file__)
        logger_instance: Optional custom logger to override default

    Returns:
        SDKLogger instance with defensive logging patterns

    Example:
        from .logger import create
        logger = create("gemini_openai_sdk", __file__)

        logger.debug("enter function", param1="value")
        logger.info("operation complete", result_count=5)
        logger.error("failed", error=str(e))
    """
    return SDKLogger(package_name, filename, logger_instance)
