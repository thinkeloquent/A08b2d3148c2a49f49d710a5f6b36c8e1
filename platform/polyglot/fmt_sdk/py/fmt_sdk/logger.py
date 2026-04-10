"""
Logger factory for the fmt_sdk package.

Usage:
    from fmt_sdk import logger
    log = logger.create("fmt-sdk", __file__)
    log.info("Formatting started")
"""

import json
import os
import sys
import traceback
from collections.abc import Callable
from datetime import UTC, datetime, timezone
from pathlib import Path
from typing import Any, Optional

LOG_LEVELS = {
    "error": 0,
    "warn": 1,
    "info": 2,
    "debug": 3,
    "trace": 4,
}


def _extract_filename(filepath: str) -> str:
    if not filepath:
        return "unknown"
    return Path(filepath).name


class Logger:
    """Scoped logger instance for a specific package/module."""

    def __init__(
        self,
        package_name: str,
        filename: str,
        handler: Callable[[dict], None] | None = None,
    ):
        self.package_name = package_name
        self.filename = _extract_filename(filename)
        self._handler = handler
        env_level = os.getenv("LOG_LEVEL", "info").lower()
        self._threshold = LOG_LEVELS.get(env_level, LOG_LEVELS["info"])

    def _emit(self, level: str, message: str, data: dict[str, Any] | None = None, error: Exception | None = None) -> None:
        level_priority = LOG_LEVELS.get(level, LOG_LEVELS["info"])
        if level_priority > self._threshold:
            return

        entry = {
            "ts": datetime.now(UTC).isoformat(),
            "pkg": self.package_name,
            "file": self.filename,
            "level": level,
            "msg": message,
        }
        if data:
            entry["ctx"] = data
        if error:
            entry["error"] = {
                "message": str(error),
                "type": type(error).__name__,
                "traceback": "".join(traceback.format_exception(type(error), error, error.__traceback__)),
            }

        if self._handler:
            self._handler(entry)
        else:
            output = json.dumps(entry, default=str)
            if level in ("error", "warn"):
                print(output, file=sys.stderr)
            else:
                print(output)

    def info(self, message: str, data: dict[str, Any] | None = None, error: Exception | None = None) -> None:
        self._emit("info", message, data, error)

    def warn(self, message: str, data: dict[str, Any] | None = None, error: Exception | None = None) -> None:
        self._emit("warn", message, data, error)

    def error(self, message: str, data: dict[str, Any] | None = None, error: Exception | None = None) -> None:
        self._emit("error", message, data, error)

    def debug(self, message: str, data: dict[str, Any] | None = None, error: Exception | None = None) -> None:
        self._emit("debug", message, data, error)

    def trace(self, message: str, data: dict[str, Any] | None = None, error: Exception | None = None) -> None:
        self._emit("trace", message, data, error)


def create(package_name: str, filename: str, handler: Callable[[dict], None] | None = None) -> Logger:
    """Create a scoped logger instance.

    Args:
        package_name: Package name (e.g. 'fmt-sdk')
        filename: Source file (use __file__)
        handler: Optional custom output handler for DI
    """
    return Logger(package_name, filename, handler)
