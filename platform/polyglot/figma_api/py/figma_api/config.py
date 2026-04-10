"""
Config Module — Figma API SDK

Environment-based configuration loader.
"""

import os
from dataclasses import dataclass, field

from env_resolver import resolve_figma_env

DEFAULTS = {
    "base_url": "https://api.figma.com",
    "timeout": 30,
    "max_retries": 3,
    "retry_initial_wait": 1.0,
    "retry_max_wait": 30.0,
    "cache_max_size": 100,
    "cache_ttl": 300,
    "rate_limit_auto_wait": True,
    "rate_limit_threshold": 0,
    "max_retry_after": 60,
}


@dataclass(frozen=True)
class Config:
    """Application configuration loaded from environment variables."""

    figma_token: str = ""
    base_url: str = DEFAULTS["base_url"]
    log_level: str = "INFO"
    port: int = 3108
    host: str = "0.0.0.0"
    rate_limit_auto_wait: bool = DEFAULTS["rate_limit_auto_wait"]
    rate_limit_threshold: int = DEFAULTS["rate_limit_threshold"]
    timeout: int = DEFAULTS["timeout"]
    cache_max_size: int = DEFAULTS["cache_max_size"]
    cache_ttl: int = DEFAULTS["cache_ttl"]
    max_retries: int = DEFAULTS["max_retries"]

    @classmethod
    def from_env(cls) -> "Config":
        """Construct configuration from environment variables."""
        _figma_env = resolve_figma_env()
        return cls(
            figma_token=_figma_env.token or "",
            base_url=_figma_env.api_base_url,
            log_level=os.environ.get("LOG_LEVEL", "INFO"),
            port=int(os.environ.get("PORT", "3108")),
            host=os.environ.get("HOST", "0.0.0.0"),
            rate_limit_auto_wait=os.environ.get("RATE_LIMIT_AUTO_WAIT", "true").lower() != "false",
            rate_limit_threshold=int(os.environ.get("RATE_LIMIT_THRESHOLD", "0")),
            timeout=_figma_env.timeout,
            cache_max_size=int(os.environ.get("CACHE_MAX_SIZE", str(DEFAULTS["cache_max_size"]))),
            cache_ttl=int(os.environ.get("CACHE_TTL", str(DEFAULTS["cache_ttl"]))),
            max_retries=int(os.environ.get("MAX_RETRIES", str(DEFAULTS["max_retries"]))),
        )
