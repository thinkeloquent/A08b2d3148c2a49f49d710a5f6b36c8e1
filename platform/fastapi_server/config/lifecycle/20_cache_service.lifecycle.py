"""
Cache Service Lifecycle Hook for FastAPI

Initializes the multi-instance cache factory and stores it in app.state
for use in routes and dependencies.

Loading Order: 20 (after config, before business logic)

Usage in routes:
    from fastapi import Request, Depends
    from typing import Annotated

    # Direct access
    @app.get('/token')
    async def get_token(request: Request):
        providers = request.app.state.cache.get(CacheNames.PROVIDERS)
        token = await providers.get_or_set('oauth:google', fetch_token, 600)
        return {'token': token}

    # Or with dependency injection
    def get_providers_cache(request: Request):
        return request.app.state.cache.get(CacheNames.PROVIDERS)

    @app.get('/token')
    async def get_token(cache: Annotated[ICacheService, Depends(get_providers_cache)]):
        token = await cache.get_or_set('oauth:google', fetch_token, 600)
        return {'token': token}
"""

import logging
import sys
from pathlib import Path
from typing import Any
from fastapi import FastAPI

logger = logging.getLogger("lifecycle:cache_service")

# Add polyglot package to path
polyglot_path = Path(__file__).parent.parent.parent.parent / "polyglot" / "server_provider_cache" / "py"
if str(polyglot_path) not in sys.path:
    sys.path.insert(0, str(polyglot_path))

from server_provider_cache import (
    create_cache_factory,
    CacheNames,
    DefaultTTLs,
)
from env_resolver import resolve_redis_env


def get_cache_config(app: FastAPI) -> dict[str, Any]:
    """
    Get cache configuration from app config or environment variables.

    Args:
        app: FastAPI application instance

    Returns:
        Cache configuration dictionary
    """
    # Try to get from app config first
    cache_config: dict[str, Any] = {}

    if hasattr(app.state, 'config') and hasattr(app.state.config, 'get'):
        try:
            cache_config = app.state.config.get('cache') or {}
            logger.debug("Loaded cache config from app.state.config")
        except Exception:
            logger.warning("No cache config in app config, using defaults")

    default_ttl = cache_config.get('defaultTtl') or cache_config.get('default_ttl')
    if default_ttl is None:
        _redis_env = resolve_redis_env()
        default_ttl = _redis_env.cache_default_ttl
        logger.debug("Using CACHE_DEFAULT_TTL from env: %d", default_ttl)

    return {
        'default_ttl': default_ttl,
        'backend': cache_config.get('backend') or resolve_redis_env().cache_backend,
        # Per-cache TTL overrides
        'ttls': {
            'providers': cache_config.get('ttls', {}).get('providers', DefaultTTLs.PROVIDERS),
            'services': cache_config.get('ttls', {}).get('services', DefaultTTLs.SERVICES),
            'config': cache_config.get('ttls', {}).get('config', DefaultTTLs.CONFIG),
            'sessions': cache_config.get('ttls', {}).get('sessions', DefaultTTLs.SESSIONS),
            'tokens': cache_config.get('ttls', {}).get('tokens', DefaultTTLs.TOKENS),
        },
    }


async def onStartup(app: FastAPI, config: dict[str, Any]) -> None:
    """
    Startup hook - Initialize cache factory and create default cache instances.

    Args:
        app: FastAPI application instance
        config: Bootstrap config (may be overridden by app config)
    """
    logger.info("Starting cache_service lifecycle hook...")
    try:
        logger.info("Initializing Cache Service...")

        cache_config = get_cache_config(app)

        logger.info(
            "Cache configuration: default_ttl=%d, backend=%s",
            cache_config["default_ttl"], cache_config["backend"],
        )
        logger.debug("Cache TTLs: %s", cache_config["ttls"])

        # Create the factory with defaults
        factory = create_cache_factory(
            defaults={
                'backend': cache_config['backend'],
                'default_ttl': cache_config['default_ttl'],
            }
        )
        logger.debug("Cache factory created")

        # Create default cache instances based on CacheNames
        # These can be customized via app config
        factory.create(CacheNames.PROVIDERS, default_ttl=cache_config['ttls']['providers'])
        factory.create(CacheNames.SERVICES, default_ttl=cache_config['ttls']['services'])
        factory.create(CacheNames.CONFIG, default_ttl=cache_config['ttls']['config'])
        factory.create(CacheNames.SESSIONS, default_ttl=cache_config['ttls']['sessions'])
        factory.create(CacheNames.TOKENS, default_ttl=cache_config['ttls']['tokens'])

        # Store in app state
        app.state.cache = factory
        app.state.CacheNames = CacheNames

        logger.info(
            "Cache service initialized: %s (%d instances)",
            factory.get_names(), factory.get_count(),
        )
        logger.info("cache_service lifecycle hook completed successfully")
    except Exception as exc:
        logger.error("cache_service lifecycle hook failed: %s", exc, exc_info=True)
        raise


async def onShutdown(app: FastAPI, config: dict[str, Any]) -> None:
    """
    Shutdown hook - Cleanup cache resources.

    Args:
        app: FastAPI application instance
        config: Server configuration dictionary
    """
    logger.info("Starting cache_service shutdown...")
    try:
        if hasattr(app.state, 'cache') and hasattr(app.state.cache, 'destroy_all'):
            logger.info("Shutting down cache service...")
            await app.state.cache.destroy_all()
            logger.info("Cache service shut down successfully")
        else:
            logger.debug("No cache service to shut down")
    except Exception as exc:
        logger.error("cache_service shutdown failed: %s", exc, exc_info=True)
        raise
