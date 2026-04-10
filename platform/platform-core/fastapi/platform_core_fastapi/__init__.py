"""
Platform Core FastAPI

Public API for the platform-core-fastapi package.
Re-exports bootstrap factory, config, and contract utilities.
"""

from platform_core_fastapi.bootstrap import setup, create_app, shutdown, main
from platform_core_fastapi.config import PlatformConfig

__all__ = [
    'setup',
    'create_app',
    'shutdown',
    'main',
    'PlatformConfig',
]
