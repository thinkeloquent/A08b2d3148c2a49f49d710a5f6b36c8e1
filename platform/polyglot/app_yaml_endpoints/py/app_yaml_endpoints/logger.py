"""
Logger Module - Defensive programming logging with package/file context.

Usage:
    logger = LoggerFactory.create('app_yaml_endpoints', __file__)
    logger.info('Message', {'key': 'value'})
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Protocol


class LogHandler(Protocol):
    """Protocol for custom log handlers."""
    def __call__(self, level: str, msg: str, data: dict | None, ctx: dict) -> None: ...


class Logger:
    """Logger with package and file context."""

    LEVELS = {"trace": 5, "debug": 10, "info": 20, "warn": 30, "error": 40}

    def __init__(
        self,
        package: str,
        filename: str,
        handler: LogHandler | None = None,
        level: str = "info",
        json_output: bool = False,
    ) -> None:
        self._pkg = package
        self._file = Path(filename).name
        self._handler = handler or self._default_handler
        self._level = self.LEVELS.get(level.lower(), 20)
        self._json = json_output

    def _default_handler(self, level: str, msg: str, data: dict | None, ctx: dict) -> None:
        ts = datetime.now(timezone.utc).isoformat(timespec="milliseconds")
        lvl = level.upper().ljust(5)
        if self._json:
            out = {"ts": ts, "level": level, "pkg": self._pkg, "file": self._file, "msg": msg}
            if data:
                out["data"] = data
            print(json.dumps(out), file=sys.stderr if level in ("warn", "error") else sys.stdout)
        else:
            prefix = f"[{ts}] [{lvl}] [{self._pkg}:{self._file}]"
            line = f"{prefix} {msg}" + (f" {json.dumps(data)}" if data else "")
            print(line, file=sys.stderr if level in ("warn", "error") else sys.stdout)

    def _log(self, level: str, msg: str, data: dict | None = None) -> None:
        if self.LEVELS.get(level, 0) >= self._level:
            self._handler(level, msg, data, {"pkg": self._pkg, "file": self._file})

    def trace(self, msg: str, data: dict | None = None) -> None:
        self._log("trace", msg, data)

    def debug(self, msg: str, data: dict | None = None) -> None:
        self._log("debug", msg, data)

    def info(self, msg: str, data: dict | None = None) -> None:
        self._log("info", msg, data)

    def warn(self, msg: str, data: dict | None = None) -> None:
        self._log("warn", msg, data)

    def error(self, msg: str, data: dict | None = None) -> None:
        self._log("error", msg, data)


class LoggerFactory:
    """Factory for creating loggers with consistent defaults."""

    _level = os.environ.get("LOG_LEVEL", "info")
    _json = os.environ.get("LOG_JSON", "").lower() == "true"

    @classmethod
    def create(
        cls,
        package: str,
        filename: str,
        handler: LogHandler | None = None,
        level: str | None = None,
        json_output: bool | None = None,
    ) -> Logger:
        return Logger(
            package,
            filename,
            handler,
            level or cls._level,
            json_output if json_output is not None else cls._json,
        )
