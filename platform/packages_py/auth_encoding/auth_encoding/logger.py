import os
import logging
from typing import Optional, Any, Literal

LogLevel = Literal['debug', 'info', 'warn', 'error']

class Logger:
    """Standard logging interface with package/file context."""

    LOG_LEVELS = {'debug': logging.DEBUG, 'info': logging.INFO, 'warn': logging.WARNING, 'error': logging.ERROR}

    def __init__(self, package_name: str, filename: str, level: Optional[str] = None):
        self.level = level or os.environ.get('LOG_LEVEL', 'debug')
        self.prefix = f"[{package_name}:{filename}]"
        self._logger = logging.getLogger(f"{package_name}.{filename}")
        self._logger.setLevel(self.LOG_LEVELS.get(self.level, logging.DEBUG))

        if not self._logger.handlers:
            handler = logging.StreamHandler()
            handler.setFormatter(logging.Formatter('%(message)s'))
            self._logger.addHandler(handler)

    def debug(self, message: str, *args: Any) -> None:
        self._logger.debug(f"{self.prefix} DEBUG: {message}", *args)

    def info(self, message: str, *args: Any) -> None:
        self._logger.info(f"{self.prefix} INFO: {message}", *args)

    def warn(self, message: str, *args: Any) -> None:
        self._logger.warning(f"{self.prefix} WARN: {message}", *args)

    def error(self, message: str, *args: Any) -> None:
        self._logger.error(f"{self.prefix} ERROR: {message}", *args)


def create_logger(package_name: str, filename: str, level: Optional[str] = None) -> Logger:
    return Logger(package_name, filename, level)


# Convenience factory
logger = type('logger', (), {'create': staticmethod(create_logger)})()
