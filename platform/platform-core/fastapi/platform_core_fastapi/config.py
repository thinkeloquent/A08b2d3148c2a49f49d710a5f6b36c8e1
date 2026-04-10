"""
Platform Core FastAPI — Default Configuration

Provides sensible defaults for the FastAPI server.
User configs are merged on top of these defaults in bootstrap.py.
"""

import os
from dataclasses import dataclass, field


@dataclass
class PlatformConfig:
    """Default platform configuration. Reads from environment with fallbacks."""
    port: int = int(os.getenv('PLATFORM_PORT', os.getenv('PORT', '52000')))
    host: str = os.getenv('PLATFORM_HOST', '0.0.0.0')
    log_level: str = os.getenv('LOG_LEVEL', 'info')
    title: str = 'Platform Core FastAPI'
    profile: str = os.getenv('PLATFORM_PROFILE', 'dev')
    paths: dict = field(default_factory=lambda: {
        # Core lifecycle/route/plugin files are extracted here but many have
        # unresolved imports that only resolve from the original server location.
        # Server packages provide all lifecycle/route/plugin paths until
        # core file imports are updated.
    })
    initial_state: dict = field(default_factory=lambda: {
        'mode': 'idle',
        'context': {},
    })
