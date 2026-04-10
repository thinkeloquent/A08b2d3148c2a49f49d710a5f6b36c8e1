"""
Logger Module — Figma API SDK

Structured logging factory with sensitive data redaction.
Each package creates a scoped logger via `create_logger(package_name, __file__)`.

Usage:
    from .logger import create_logger
    log = create_logger("figma-api", __file__)
    log.info("fetching projects", team_id="123")
"""

import logging
import os
import sys
from pathlib import Path
from typing import Any, Optional

REDACT_KEYS = {"token", "secret", "password", "auth", "credential",
               "authorization", "apikey", "api_key", "accesstoken", "access_token"}

LEVELS = {
    "TRACE": 5,
    "DEBUG": logging.DEBUG,
    "INFO": logging.INFO,
    "WARN": logging.WARNING,
    "WARNING": logging.WARNING,
    "ERROR": logging.ERROR,
    "CRITICAL": logging.CRITICAL,
    "SILENT": 100,
}


def _redact_value(key: str, value: Any) -> Any:
    if isinstance(key, str) and key.lower() in REDACT_KEYS:
        if isinstance(value, str) and len(value) > 8:
            return value[:8] + "***"
        return "***"
    return value


def _format_kwargs(**kwargs: Any) -> str:
    if not kwargs:
        return ""
    parts = []
    for k, v in kwargs.items():
        v = _redact_value(k, v)
        parts.append(f"{k}={v!r}")
    return " " + " ".join(parts)


class SDKLogger:
    """SDK Logger with defensive programming patterns and credential redaction."""

    def __init__(
        self,
        package_name: str,
        filename: str,
        logger_instance: Optional[logging.Logger] = None,
    ):
        self.package_name = package_name
        self.filename = Path(filename).stem if filename else "unknown"
        self.prefix = f"[{package_name}:{self.filename}]"

        if logger_instance:
            self._logger = logger_instance
        else:
            self._logger = self._create_default_logger()

    def _create_default_logger(self) -> logging.Logger:
        logger = logging.getLogger(f"{self.package_name}.{self.filename}")
        if not logger.handlers:
            handler = logging.StreamHandler(sys.stderr)
            formatter = logging.Formatter(
                "%(asctime)s %(levelname)-5s %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)

        level_name = os.environ.get("LOG_LEVEL", "INFO").upper()
        level = LEVELS.get(level_name, logging.INFO)
        logger.setLevel(level)
        return logger

    def _format(self, msg: str, **kwargs: Any) -> str:
        return f"{self.prefix} {msg}{_format_kwargs(**kwargs)}"

    def trace(self, msg: str, **kwargs: Any) -> None:
        self._logger.log(5, self._format(msg, **kwargs))

    def debug(self, msg: str, **kwargs: Any) -> None:
        self._logger.debug(self._format(msg, **kwargs))

    def info(self, msg: str, **kwargs: Any) -> None:
        self._logger.info(self._format(msg, **kwargs))

    def warn(self, msg: str, **kwargs: Any) -> None:
        self._logger.warning(self._format(msg, **kwargs))

    def warning(self, msg: str, **kwargs: Any) -> None:
        self.warn(msg, **kwargs)

    def error(self, msg: str, **kwargs: Any) -> None:
        self._logger.error(self._format(msg, **kwargs))

    def critical(self, msg: str, **kwargs: Any) -> None:
        self._logger.critical(self._format(msg, **kwargs))

    def set_level(self, level: str) -> None:
        level_value = LEVELS.get(level.upper(), logging.INFO)
        self._logger.setLevel(level_value)


def create_logger(
    package_name: str,
    filename: str,
    logger_instance: Optional[logging.Logger] = None,
) -> SDKLogger:
    """Create a logger instance for a module."""
    return SDKLogger(package_name, filename, logger_instance)
