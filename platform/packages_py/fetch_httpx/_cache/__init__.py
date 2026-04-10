"""
Cache Module for fetch_httpx

Provides caching middleware for HTTP responses.

Quick Start:
    # Wrapper pattern (recommended)
    from fetch_httpx._cache import CachingClient, CacheConfig

    async with CachingClient(
        base_url="https://api.example.com",
        cache=CacheConfig(ttl=60.0)
    ) as client:
        response = await client.get("/users")

    # Decorator pattern
    from fetch_httpx._cache import cached

    @cached(ttl=60.0)
    async def get_users(client):
        return await client.get("/users")

    # Higher-order function pattern
    from fetch_httpx._cache import with_cache, CacheConfig

    cached_fetch = with_cache(my_fetch_fn, CacheConfig(ttl=60.0))
    response = await cached_fetch("GET", "/users")

Custom Key Strategies:
    from fetch_httpx._cache import (
        CacheConfig,
        CachingClient,
        create_dot_notation_key_strategy,
        create_hashed_key_strategy,
    )

    # Include Authorization header and page param in cache key
    key_strategy = create_dot_notation_key_strategy([
        "headers.Authorization",
        "params.page",
    ])

    async with CachingClient(
        cache=CacheConfig(ttl=60.0, key_strategy=key_strategy)
    ) as client:
        response = await client.get("/users", params={"page": 1})
"""

# Types
# Core
from .core import (
    CacheManager,
    combine_key_strategies,
    create_dot_notation_key_strategy,
    create_hashed_key_strategy,
    default_key_strategy,
)

# Decorators
from .decorators import cached, with_cache

# Middleware
from .middleware import create_cache_aware_client, create_cache_hooks

# Storage
from .storage import MemoryStorage
from .types import (
    CacheConfig,
    CacheEntry,
    CacheEntryMetadata,
    CacheKeyStrategy,
    CacheStats,
    CacheStorage,
    RequestCacheOptions,
)

# Wrapper
from .wrapper import CachingClient

__all__ = [
    # Types
    "CacheConfig",
    "CacheEntry",
    "CacheEntryMetadata",
    "CacheKeyStrategy",
    "CacheStats",
    "CacheStorage",
    "RequestCacheOptions",
    # Core
    "CacheManager",
    "default_key_strategy",
    "create_dot_notation_key_strategy",
    "create_hashed_key_strategy",
    "combine_key_strategies",
    # Storage
    "MemoryStorage",
    # Wrapper
    "CachingClient",
    # Decorators
    "cached",
    "with_cache",
    # Middleware
    "create_cache_hooks",
    "create_cache_aware_client",
]
