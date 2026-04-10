
from typing import Protocol, Any, runtime_checkable
import sys
import json
from datetime import datetime
import os

@runtime_checkable
class ILogger(Protocol):
    """
    Unified Logger Protocol for App Yaml Overwrites.
    Expected output format: [package:filename] LEVEL: message
    """
    def debug(self, message: str, **kwargs: Any) -> None: ...
    def info(self, message: str, **kwargs: Any) -> None: ...
    def warn(self, message: str, **kwargs: Any) -> None: ...
    def error(self, message: str, **kwargs: Any) -> None: ...
    def trace(self, message: str, **kwargs: Any) -> None: ...

class ConsoleLogger:
    """
    Default implementation of ILogger using standard print (sdtout/stderr).
    Mimics the interface required by the plan.
    """
    def __init__(self, package_name: str, filename: str):
        self.prefix = f"[{package_name}:{filename}]"
        # Simple level mapping
        self.levels = {'trace': 0, 'debug': 1, 'info': 2, 'warn': 3, 'error': 4}
        self.current_level = self.levels.get(os.environ.get('LOG_LEVEL', 'info').lower(), 2)

    def _log(self, level_name: str, message: str, **kwargs: Any):
        if self.levels[level_name] < self.current_level:
            return

        timestamp = datetime.now().isoformat()
        # Format: [package:filename] LEVEL: message {data}
        # If kwargs are present, append them as JSON string
        extra = f" {json.dumps(kwargs)}" if kwargs else ""
        log_line = f"{self.prefix} {level_name.upper()}: {message}{extra}"
        
        # In a real app we might use sys.stderr for error/warn
        print(log_line, file=sys.stdout, flush=True)

    def debug(self, message: str, **kwargs: Any) -> None:
        self._log('debug', message, **kwargs)

    def info(self, message: str, **kwargs: Any) -> None:
        self._log('info', message, **kwargs)

    def warn(self, message: str, **kwargs: Any) -> None:
        self._log('warn', message, **kwargs)

    def error(self, message: str, **kwargs: Any) -> None:
        self._log('error', message, **kwargs)

    def trace(self, message: str, **kwargs: Any) -> None:
        self._log('trace', message, **kwargs)

def create(package_name: str, filename: str) -> ILogger:
    """
    Factory to create a logger instance with standardized context.
    """
    return ConsoleLogger(package_name, filename)
