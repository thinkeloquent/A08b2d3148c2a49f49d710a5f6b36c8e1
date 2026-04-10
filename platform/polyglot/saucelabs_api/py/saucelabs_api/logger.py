"""
Structured logger factory for the Sauce Labs API client.

Produces lightweight logger objects with debug/info/warning/error methods.
Output format: [package_name:filename] LEVEL message {context}
Respects LOG_LEVEL env var (DEBUG, INFO, WARNING, ERROR, SILENT). Default: INFO.
Auto-redacts sensitive keys in context dicts.
"""

from __future__ import annotations

import os
import re
from datetime import datetime, timezone
from typing import Any, Callable, Protocol


# ---------------------------------------------------------------------------
# Redaction
# ---------------------------------------------------------------------------

_REDACT_KEYS: re.Pattern[str] = re.compile(
    r"(token|secret|password|key|auth|credential|access_key|api_key)", re.IGNORECASE
)


def _redact_context(ctx: dict[str, Any] | None) -> dict[str, Any] | None:
    """Return a shallow copy of *ctx* with sensitive values replaced by ``'[REDACTED]'``."""
    if ctx is None:
        return None

    redacted: dict[str, Any] = {}
    for k, v in ctx.items():
        if _REDACT_KEYS.search(k):
            redacted[k] = "[REDACTED]"
        elif isinstance(v, dict):
            redacted[k] = _redact_context(v)
        else:
            redacted[k] = v
    return redacted


# ---------------------------------------------------------------------------
# Level constants
# ---------------------------------------------------------------------------

_LEVELS: dict[str, int] = {
    "DEBUG": 10,
    "INFO": 20,
    "WARNING": 30,
    "ERROR": 40,
    "SILENT": 100,
}


# ---------------------------------------------------------------------------
# Logger protocol
# ---------------------------------------------------------------------------

class LoggerProtocol(Protocol):
    """Structural type that any custom logger must satisfy."""

    def debug(self, message: str, context: dict[str, Any] | None = None) -> None: ...
    def info(self, message: str, context: dict[str, Any] | None = None) -> None: ...
    def warning(self, message: str, context: dict[str, Any] | None = None) -> None: ...
    def error(self, message: str, context: dict[str, Any] | None = None) -> None: ...


# ---------------------------------------------------------------------------
# Internal logger implementation
# ---------------------------------------------------------------------------

class _Logger:
    """Lightweight structured logger produced by :func:`create_logger`."""

    __slots__ = ("_prefix", "_level", "_print_fn")

    def __init__(
        self,
        prefix: str,
        level: int,
        print_fn: Callable[..., None] = print,
    ) -> None:
        self._prefix = prefix
        self._level = level
        self._print_fn = print_fn

    def _emit(self, level_name: str, level_value: int, message: str, context: dict[str, Any] | None) -> None:
        if level_value < self._level:
            return
        ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
        parts = [f"[{self._prefix}]", level_name, message]
        safe_ctx = _redact_context(context)
        if safe_ctx:
            parts.append(str(safe_ctx))
        self._print_fn(f"{ts} {' '.join(parts)}")

    def debug(self, message: str, context: dict[str, Any] | None = None) -> None:
        self._emit("DEBUG", _LEVELS["DEBUG"], message, context)

    def info(self, message: str, context: dict[str, Any] | None = None) -> None:
        self._emit("INFO", _LEVELS["INFO"], message, context)

    def warning(self, message: str, context: dict[str, Any] | None = None) -> None:
        self._emit("WARNING", _LEVELS["WARNING"], message, context)

    def error(self, message: str, context: dict[str, Any] | None = None) -> None:
        self._emit("ERROR", _LEVELS["ERROR"], message, context)


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------

def create_logger(package_name: str, filename: str) -> _Logger:
    """Create a structured logger namespaced to *package_name* and *filename*."""
    env_level = os.environ.get("LOG_LEVEL", "INFO").upper()
    level = _LEVELS.get(env_level, _LEVELS["INFO"])
    prefix = f"{package_name}:{filename}"
    return _Logger(prefix=prefix, level=level)
