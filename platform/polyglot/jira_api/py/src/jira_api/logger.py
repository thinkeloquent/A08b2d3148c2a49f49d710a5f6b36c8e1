"""
Structured, scoped logger factory for the jira-api package.

Usage:
    from jira_api.logger import create_logger
    log = create_logger('jira-api', __file__)
    log.info('fetching issue', {'issue_key': 'PROJ-123'})

- Respects LOG_LEVEL env var: DEBUG | INFO | WARNING | ERROR | CRITICAL | SILENT
- Auto-redacts sensitive keys (token, secret, password, auth, credential, api_token)
- Override via constructor: JiraClient(logger=custom_logger)
"""

from __future__ import annotations

import json
import os
import re
import sys
from datetime import UTC, datetime, timezone
from typing import Any, Protocol

_REDACT_PATTERN = re.compile(r"token|secret|password|auth|credential|api_key", re.IGNORECASE)
_REDACT_VALUE = "***REDACTED***"

_LEVELS: dict[str, int] = {
    "DEBUG": 10,
    "INFO": 20,
    "WARNING": 30,
    "ERROR": 40,
    "CRITICAL": 50,
    "SILENT": 100,
}


class ILogger(Protocol):
    """Logger interface contract."""

    def debug(self, message: str, context: dict[str, Any] | None = None) -> None: ...
    def info(self, message: str, context: dict[str, Any] | None = None) -> None: ...
    def warning(self, message: str, context: dict[str, Any] | None = None) -> None: ...
    def error(self, message: str, context: dict[str, Any] | None = None) -> None: ...
    def critical(self, message: str, context: dict[str, Any] | None = None) -> None: ...


def _redact_context(ctx: dict[str, Any] | None) -> dict[str, Any] | None:
    """Deep-clone and redact sensitive values from a context dict."""
    if not ctx or not isinstance(ctx, dict):
        return ctx
    out: dict[str, Any] = {}
    for key, value in ctx.items():
        if _REDACT_PATTERN.search(key):
            out[key] = _REDACT_VALUE
        elif isinstance(value, dict):
            out[key] = _redact_context(value)
        else:
            out[key] = value
    return out


def _short_filename(filename: str) -> str:
    """Extract short filename from a path."""
    if not filename:
        return "unknown"
    return os.path.basename(filename)


class _Logger:
    """Structured logger instance."""

    def __init__(self, package_name: str, filename: str, threshold: int) -> None:
        self._package_name = package_name
        self._file = _short_filename(filename)
        self._threshold = threshold

    def _emit(self, level: str, level_num: int, message: str, context: dict[str, Any] | None = None) -> None:
        if level_num < self._threshold:
            return
        entry: dict[str, Any] = {
            "ts": datetime.now(UTC).isoformat(),
            "pkg": self._package_name,
            "file": self._file,
            "level": level,
            "msg": message,
        }
        if context:
            entry["ctx"] = _redact_context(context)
        print(json.dumps(entry), file=sys.stderr)

    def debug(self, message: str, context: dict[str, Any] | None = None) -> None:
        self._emit("debug", _LEVELS["DEBUG"], message, context)

    def info(self, message: str, context: dict[str, Any] | None = None) -> None:
        self._emit("info", _LEVELS["INFO"], message, context)

    def warning(self, message: str, context: dict[str, Any] | None = None) -> None:
        self._emit("warning", _LEVELS["WARNING"], message, context)

    def error(self, message: str, context: dict[str, Any] | None = None) -> None:
        self._emit("error", _LEVELS["ERROR"], message, context)

    def critical(self, message: str, context: dict[str, Any] | None = None) -> None:
        self._emit("critical", _LEVELS["CRITICAL"], message, context)


class _NullLogger:
    """No-op logger for when logging is disabled."""

    def debug(self, message: str, context: dict[str, Any] | None = None) -> None:
        pass

    def info(self, message: str, context: dict[str, Any] | None = None) -> None:
        pass

    def warning(self, message: str, context: dict[str, Any] | None = None) -> None:
        pass

    def error(self, message: str, context: dict[str, Any] | None = None) -> None:
        pass

    def critical(self, message: str, context: dict[str, Any] | None = None) -> None:
        pass


null_logger = _NullLogger()


def create_logger(package_name: str, filename: str) -> _Logger:
    """
    Create a scoped, structured logger instance.

    Args:
        package_name: Package name (e.g. 'jira-api')
        filename: Source file (__file__)

    Returns:
        Logger instance with debug/info/warning/error/critical methods.
    """
    env_level = os.environ.get("LOG_LEVEL", "INFO").upper()
    threshold = _LEVELS.get(env_level, _LEVELS["INFO"])
    return _Logger(package_name, filename, threshold)
