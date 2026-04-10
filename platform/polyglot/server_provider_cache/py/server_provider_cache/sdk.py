"""
SDK module for server_provider_cache.

Provides convenience functions for standalone usage without framework dependencies.
Use this module for CLI tools, LLM agents, and development utilities.

Usage:
    from server_provider_cache import create_cache_factory, create_cache, CacheNames

    # Multi-instance usage
    factory = create_cache_factory()
    factory.create(CacheNames.PROVIDERS, default_ttl=600)
    providers = factory.get(CacheNames.PROVIDERS)

    # Single cache convenience
    cache = create_cache('my-cache', default_ttl=300)
"""

from typing import Optional

from .factory import CacheFactory, create_cache_factory
from .service import CacheService, create_cache_service
from .constants import CacheNames, DefaultTTLs, DEFAULT_TTL, DEFAULT_BACKEND


def create_cache(
    name: str,
    default_ttl: Optional[int] = None,
    backend: Optional[str] = None,
    namespace: Optional[str] = None,
) -> CacheService:
    """Create a single cache instance for simple use cases.

    This is a convenience function that creates a standalone cache.
    For multi-cache scenarios, use create_cache_factory() directly.

    Args:
        name: Cache name
        default_ttl: Default TTL in seconds
        backend: Backend type ('memory' | 'redis')
        namespace: Key namespace prefix

    Returns:
        CacheService instance

    Example:
        cache = create_cache('api-cache', default_ttl=600)
        await cache.set('user:123', user_data)
        user = await cache.get_or_set('user:456', fetch_user, 300)
    """
    return create_cache_service(
        name=name,
        default_ttl=default_ttl if default_ttl is not None else DEFAULT_TTL,
        backend=backend if backend is not None else DEFAULT_BACKEND,
        namespace=namespace or "",
    )


# Re-export everything for SDK consumers
__all__ = [
    # Factory
    "CacheFactory",
    "create_cache_factory",
    # Service
    "CacheService",
    "create_cache_service",
    # Convenience
    "create_cache",
    # Constants
    "CacheNames",
    "DefaultTTLs",
    "DEFAULT_TTL",
    "DEFAULT_BACKEND",
]
