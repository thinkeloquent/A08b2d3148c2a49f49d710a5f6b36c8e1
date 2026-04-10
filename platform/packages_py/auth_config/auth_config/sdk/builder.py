from __future__ import annotations
import logging
import os
from typing import TYPE_CHECKING
from ..logger import create_logger

if TYPE_CHECKING:
    from . import FetchAuthConfigSDK

class FetchAuthConfigSDKBuilder:
    def __init__(self):
        self._logger: logging.Logger | None = None
        self._log_level: str | None = None
        
    def with_logger(self, logger: logging.Logger) -> FetchAuthConfigSDKBuilder:
        self._logger = logger
        return self
        
    def with_log_level(self, level: str) -> FetchAuthConfigSDKBuilder:
        self._log_level = level
        return self
        
    def build(self) -> 'FetchAuthConfigSDK':
        from . import FetchAuthConfigSDK
        
        # Configure logging if changed
        if self._log_level:
            os.environ['LOG_LEVEL'] = self._log_level
            
        sdk_logger = self._logger or create_logger('fetch_auth_config.sdk', __file__)
        return FetchAuthConfigSDK(logger=sdk_logger)
