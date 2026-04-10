from typing import Protocol, Any, Dict, List, Optional
from dataclasses import dataclass, field


class ILogger(Protocol):
    def info(self, message: str, *args: Any) -> None: ...
    def warn(self, message: str, *args: Any) -> None: ...
    def error(self, message: str, *args: Any) -> None: ...
    def debug(self, message: str, *args: Any) -> None: ...
    def trace(self, message: str, *args: Any) -> None: ...


@dataclass
class InitOptions:
    files: List[str]
    config_dir: str
    app_env: Optional[str] = None
    logger: Optional[ILogger] = None

    def __post_init__(self):
        if self.app_env:
            self.app_env = self.app_env.lower()
