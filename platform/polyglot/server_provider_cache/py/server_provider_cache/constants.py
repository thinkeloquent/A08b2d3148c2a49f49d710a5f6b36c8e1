"""
Cache name constants for server_provider_cache package.

Pre-defined cache names ensure consistency across the codebase.
Use these constants when creating or accessing cache instances.

Usage:
    from .constants import CacheNames
    factory.create(CacheNames.PROVIDERS, default_ttl=600)
"""

from typing import Final

from env_resolver import resolve_redis_env


class CacheNames:
    """Pre-defined cache instance names."""

    # OAuth tokens, API credentials - suggested TTL: 600s
    PROVIDERS: Final[str] = "providers"

    # Service discovery, health checks - suggested TTL: 300s
    SERVICES: Final[str] = "services"

    # Feature flags, application settings - suggested TTL: 3600s
    CONFIG: Final[str] = "config"

    # User sessions, auth state - suggested TTL: 1800s
    SESSIONS: Final[str] = "sessions"

    # JWT tokens, refresh tokens - suggested TTL: 900s
    TOKENS: Final[str] = "tokens"


class DefaultTTLs:
    """Default TTL values for each cache type (in seconds)."""

    PROVIDERS: Final[int] = 600
    SERVICES: Final[int] = 300
    CONFIG: Final[int] = 3600
    SESSIONS: Final[int] = 1800
    TOKENS: Final[int] = 900


# Default cache backend
DEFAULT_BACKEND: Final[str] = "memory"

# Default TTL in seconds
DEFAULT_TTL: Final[int] = resolve_redis_env().cache_default_ttl


__all__ = ["CacheNames", "DefaultTTLs", "DEFAULT_BACKEND", "DEFAULT_TTL"]
