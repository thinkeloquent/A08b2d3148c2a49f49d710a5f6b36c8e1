"""SDK factory functions and convenience methods (Story 4)."""

from __future__ import annotations

import time
from typing import Any

from .client import FetchHttpCacheClient, _generate_cache_key
from .exceptions import FetchCacheConfigError
from .logger import create as create_logger
from .token_manager import create_token_manager
from .types import CacheResponseConfig, FetchResult, SDKConfig

logger = create_logger(__name__)


# ─── SDK Factory Functions ────────────────────────────────────────────────────


def create_fetch_cache_sdk(config: SDKConfig) -> FetchHttpCacheClient:
    """Create a FetchHttpCacheClient from SDKConfig."""
    token_manager = None
    if config.auth is not None:
        token_manager = create_token_manager(config.auth)

    return FetchHttpCacheClient(
        config=config,
        token_manager=token_manager,
    )


def create_fetch_cache_sdk_from_yaml(
    yaml_section: dict[str, Any],
    **overrides: Any,
) -> FetchHttpCacheClient:
    """Create SDK from YAML config section with three-tier resolution."""
    config = SDKConfig.from_env(yaml_config=yaml_section, **overrides)
    return create_fetch_cache_sdk(config)


def create_fetch_cache_sdk_from_env(**overrides: Any) -> FetchHttpCacheClient:
    """Create SDK from environment variables only."""
    config = SDKConfig.from_env(**overrides)
    return create_fetch_cache_sdk(config)


# ─── Convenience Functions ────────────────────────────────────────────────────


async def fetch_cached(
    url: str,
    method: str = "GET",
    headers: dict[str, str] | None = None,
    body: Any = None,
    config: SDKConfig | None = None,
    **overrides: Any,
) -> FetchResult[Any]:
    """One-shot stateless fetch with caching."""
    if config is None:
        config = SDKConfig.from_env(**overrides)

    async with create_fetch_cache_sdk(config) as client:
        return await client.request(method, url, headers=headers, body=body)


async def invalidate_cache(
    key_or_url: str,
    config: SDKConfig | None = None,
    **overrides: Any,
) -> None:
    """Manual cache invalidation by key or URL."""
    if config is None:
        config = SDKConfig.from_env(**overrides)

    # If it looks like a URL, generate the key
    if key_or_url.startswith(("http://", "https://")):
        key = _generate_cache_key(
            method="GET",
            url=key_or_url,
            key_strategy=config.cache.key_strategy,
            key_prefix=config.cache.key_prefix,
        )
    else:
        key = key_or_url

    async with create_fetch_cache_sdk(config) as client:
        await client.invalidate_cache(key)
