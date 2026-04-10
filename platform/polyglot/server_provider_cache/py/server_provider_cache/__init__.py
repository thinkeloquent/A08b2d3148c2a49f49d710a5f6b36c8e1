"""
server_provider_cache - Multi-instance cache factory for polyglot applications.

Entry point re-exporting all public API components.
"""

# SDK (includes factory, service, constants)
from .sdk import (
    CacheFactory,
    create_cache_factory,
    CacheService,
    create_cache_service,
    create_cache,
    CacheNames,
    DefaultTTLs,
    DEFAULT_TTL,
    DEFAULT_BACKEND,
)

# Logger (for advanced customization)
from .logger import create as create_logger, Logger, LoggerProtocol, DEBUG, INFO, WARN, ERROR

# Types (for type annotations)
from .types import IBackend, ICacheService, ICacheFactory, FetchFn

# Backends (for direct backend access)
from .backends import (
    MemoryBackend,
    create_memory_backend,
    RedisBackend,
    create_redis_backend,
)

__all__ = [
    # SDK
    "CacheFactory",
    "create_cache_factory",
    "CacheService",
    "create_cache_service",
    "create_cache",
    "CacheNames",
    "DefaultTTLs",
    "DEFAULT_TTL",
    "DEFAULT_BACKEND",
    # Logger
    "create_logger",
    "Logger",
    "LoggerProtocol",
    "DEBUG",
    "INFO",
    "WARN",
    "ERROR",
    # Types
    "IBackend",
    "ICacheService",
    "ICacheFactory",
    "FetchFn",
    # Backends
    "MemoryBackend",
    "create_memory_backend",
    "RedisBackend",
    "create_redis_backend",
]
