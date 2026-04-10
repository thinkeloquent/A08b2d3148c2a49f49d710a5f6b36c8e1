"""Redis connection factory with managed lifecycle."""

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import redis
from redis.asyncio import Redis as AsyncRedis

from .config import RedisConfig
from .exceptions import RedisConnectionError

logger = logging.getLogger(__name__)


class RedisConnectionFactory:
    """Managed Redis connection factory.

    Handles connection lifecycle, health checks, and graceful shutdown.
    Clients are created lazily on first access and reused until ``dispose()``
    is called.

    Usage::

        factory = RedisConnectionFactory(config)

        # Long-lived client (lazy, reused)
        client = factory.async_client
        await client.set("key", "value")

        # Scoped connection via context manager
        async with factory.connection() as client:
            await client.get("key")

        # Full lifecycle via async-with
        async with RedisConnectionFactory(config) as factory:
            await factory.async_client.ping()
    """

    def __init__(self, config: RedisConfig | None = None):
        self.config = config or RedisConfig()
        self._async_client: AsyncRedis | None = None
        self._sync_client: redis.Redis | None = None

    # --- lazy clients ---

    def _make_async(self) -> AsyncRedis:
        """Create an async client using ``from_url`` (avoids raw ssl kwarg issues)."""
        url = self.config.get_url()
        kwargs = self.config.get_from_url_kwargs()
        return AsyncRedis.from_url(url, **kwargs)

    def _make_sync(self) -> redis.Redis:
        """Create a sync client using ``from_url``."""
        url = self.config.get_url()
        kwargs = self.config.get_from_url_kwargs()
        return redis.Redis.from_url(url, **kwargs)

    @property
    def async_client(self) -> AsyncRedis:
        """Lazy-initialise and return the async Redis client.

        Uses ``from_url`` internally so that the ``rediss://`` scheme
        drives connection-class selection — no raw ``ssl`` kwarg is
        passed to ``AbstractConnection.__init__()``.
        """
        if self._async_client is None:
            logger.info("Creating async Redis client for %s:%s", self.config.host, self.config.port)
            self._async_client = self._make_async()
        return self._async_client

    @property
    def sync_client(self) -> redis.Redis:
        """Lazy-initialise and return the sync Redis client."""
        if self._sync_client is None:
            logger.info("Creating sync Redis client for %s:%s", self.config.host, self.config.port)
            self._sync_client = self._make_sync()
        return self._sync_client

    # --- scoped connection ---

    @asynccontextmanager
    async def connection(self) -> AsyncGenerator[AsyncRedis, None]:
        """Yield a short-lived async Redis connection that closes on exit."""
        client = self._make_async()
        try:
            yield client
        finally:
            await client.aclose()

    # --- health check ---

    async def ping(self) -> bool:
        """Send PING and return True on PONG."""
        try:
            return await self.async_client.ping()
        except Exception as e:
            logger.error("Redis ping failed: %s", e)
            return False

    # --- lifecycle ---

    async def dispose(self) -> None:
        """Close all managed connections and release resources."""
        if self._async_client:
            await self._async_client.aclose()
            self._async_client = None
        if self._sync_client:
            self._sync_client.close()
            self._sync_client = None

    async def __aenter__(self) -> "RedisConnectionFactory":
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        await self.dispose()


# --- global singleton ---

_redis_factory: RedisConnectionFactory | None = None


def get_redis_factory(config: RedisConfig | None = None) -> RedisConnectionFactory:
    """Get or create the global RedisConnectionFactory instance."""
    global _redis_factory
    if _redis_factory is None:
        _redis_factory = RedisConnectionFactory(config)
    return _redis_factory


def reset_redis_factory() -> None:
    """Reset global factory (useful for tests)."""
    global _redis_factory
    _redis_factory = None
