"""
CacheFactory - Multi-instance cache factory for server_provider_cache.

Creates and manages multiple named cache instances with independent configurations.
Each cache instance is isolated with its own TTL, backend, and namespace.

Usage:
    factory = create_cache_factory(defaults={'default_ttl': 300})
    factory.create(CacheNames.PROVIDERS, default_ttl=600)
    providers = factory.get(CacheNames.PROVIDERS)
    await providers.set('oauth:google', token_data)
"""

from typing import Any, Optional

from .logger import create as create_logger
from .service import CacheService
from .constants import DEFAULT_TTL, DEFAULT_BACKEND

PKG = "server_provider_cache"


class CacheFactory:
    """Factory for creating and managing multiple named cache instances."""

    def __init__(
        self,
        defaults: Optional[dict[str, Any]] = None,
        logger: Optional[Any] = None,
    ):
        """Create a new cache factory.

        Args:
            defaults: Default options for all cache instances
                - default_ttl: Default TTL in seconds
                - backend: Default backend type
            logger: Custom logger instance
        """
        defaults = defaults or {}

        self._registry: dict[str, CacheService] = {}
        self._defaults = {
            "default_ttl": defaults.get("default_ttl", DEFAULT_TTL),
            "backend": defaults.get("backend", DEFAULT_BACKEND),
        }
        self._logger = logger or create_logger(PKG, "factory")

        self._logger.info(
            f"initialized: default_ttl={self._defaults['default_ttl']}s, "
            f"backend={self._defaults['backend']}"
        )

    def create(
        self,
        name: str,
        default_ttl: Optional[int] = None,
        backend: Optional[str] = None,
        namespace: Optional[str] = None,
    ) -> CacheService:
        """Create a new named cache instance.

        Args:
            name: Cache instance name (e.g., CacheNames.PROVIDERS)
            default_ttl: TTL override for this instance
            backend: Backend override for this instance
            namespace: Key namespace for this instance

        Returns:
            The created cache instance

        Raises:
            ValueError: If a cache with this name already exists
        """
        if name in self._registry:
            raise ValueError(f"Cache '{name}' already exists. Use get() to retrieve it.")

        merged_options = {
            "name": name,
            "default_ttl": default_ttl if default_ttl is not None else self._defaults["default_ttl"],
            "backend": backend if backend is not None else self._defaults["backend"],
            "namespace": namespace or "",
        }

        cache = CacheService(**merged_options)
        self._registry[name] = cache

        self._logger.info(
            f"created cache: {name} (ttl={merged_options['default_ttl']}s, "
            f"backend={merged_options['backend']})"
        )

        return cache

    def get(self, name: str) -> CacheService:
        """Get an existing cache instance by name.

        Args:
            name: Cache instance name

        Returns:
            The cache instance

        Raises:
            KeyError: If no cache with this name exists
        """
        cache = self._registry.get(name)
        if cache is None:
            raise KeyError(f"Cache '{name}' not found. Create it first with factory.create('{name}')")
        return cache

    def has(self, name: str) -> bool:
        """Check if a cache instance exists.

        Args:
            name: Cache instance name

        Returns:
            True if cache exists
        """
        return name in self._registry

    async def destroy(self, name: str) -> None:
        """Destroy a cache instance and remove it from the registry.

        Args:
            name: Cache instance name
        """
        cache = self._registry.get(name)
        if cache:
            await cache.destroy()
            del self._registry[name]
            self._logger.info(f"destroyed cache: {name}")

    async def destroy_all(self) -> None:
        """Destroy all cache instances."""
        names = list(self._registry.keys())
        for name in names:
            await self.destroy(name)
        self._logger.info(f"destroyed all caches ({len(names)} instances)")

    def get_names(self) -> list[str]:
        """Get the names of all registered cache instances.

        Returns:
            List of cache names
        """
        return list(self._registry.keys())

    def get_count(self) -> int:
        """Get the number of registered cache instances.

        Returns:
            Number of cache instances
        """
        return len(self._registry)


def create_cache_factory(
    defaults: Optional[dict[str, Any]] = None,
    logger: Optional[Any] = None,
) -> CacheFactory:
    """Create a new CacheFactory instance.

    Args:
        defaults: Default options for all cache instances
            - default_ttl: Default TTL in seconds
            - backend: Default backend type ('memory' | 'redis')
        logger: Custom logger instance

    Returns:
        CacheFactory instance

    Example:
        factory = create_cache_factory(
            defaults={'backend': 'memory', 'default_ttl': 300}
        )
        factory.create(CacheNames.PROVIDERS, default_ttl=600)
        providers = factory.get(CacheNames.PROVIDERS)
    """
    return CacheFactory(defaults=defaults, logger=logger)


__all__ = ["CacheFactory", "create_cache_factory"]
