"""Logger module for fetch_http_cache_response."""

import os
from typing import Callable, Optional, Protocol

DEBUG = 10
INFO = 20
WARN = 30
ERROR = 40

_LOG_LEVEL = int(os.getenv("FETCH_CACHE_LOG_LEVEL", str(DEBUG)))

PACKAGE_NAME = "fetch_http_cache_response"


class LoggerProtocol(Protocol):
    def debug(self, message: str) -> None: ...
    def info(self, message: str) -> None: ...
    def warn(self, message: str) -> None: ...
    def error(self, message: str) -> None: ...
    def child(self, instance_name: str) -> "LoggerProtocol": ...


class Logger:
    def __init__(
        self,
        package_name: str,
        filename: str,
        instance: str | None = None,
        level: int = _LOG_LEVEL,
        output: Callable[[str], None] | None = None,
    ):
        self._package = package_name
        self._filename = self._extract_filename(filename)
        self._instance = instance
        self._level = level
        self._output = output or print

    def _extract_filename(self, filename: str) -> str:
        if "." in filename:
            filename = filename.rsplit(".", 1)[-1]
        if filename.endswith(".py"):
            filename = filename[:-3]
        return filename

    def _log(self, level: str, level_value: int, message: str) -> None:
        if level_value >= self._level:
            if self._instance:
                prefix = f"[{level}] [{self._package}:{self._filename}] [{self._instance}]"
            else:
                prefix = f"[{level}] [{self._package}:{self._filename}]"
            self._output(f"{prefix} {message}")

    def debug(self, message: str) -> None:
        self._log("DEBUG", DEBUG, message)

    def info(self, message: str) -> None:
        self._log("INFO", INFO, message)

    def warn(self, message: str) -> None:
        self._log("WARN", WARN, message)

    def error(self, message: str) -> None:
        self._log("ERROR", ERROR, message)

    def child(self, instance_name: str) -> "Logger":
        return Logger(
            package_name=self._package,
            filename=f"{self._filename}:{self._instance or ''}",
            instance=instance_name,
            level=self._level,
            output=self._output,
        )


def create(
    filename: str,
    level: Optional[int] = None,
    output: Optional[Callable[[str], None]] = None,
) -> Logger:
    return Logger(
        package_name=PACKAGE_NAME,
        filename=filename,
        instance=None,
        level=level if level is not None else _LOG_LEVEL,
        output=output,
    )
