"""Server integration adapters for FastAPI and computed functions (Story 5)."""

from __future__ import annotations

from typing import Any

from .client import FetchHttpCacheClient
from .logger import create as create_logger
from .sdk import create_fetch_cache_sdk
from .types import SDKConfig

logger = create_logger(__name__)


# ─── FastAPI Adapter ──────────────────────────────────────────────────────────


def create_fastapi_adapter(
    app: Any,
    yaml_config: dict[str, Any] | None = None,
    **overrides: Any,
) -> Any:
    """
    Create FastAPI lifecycle adapter using closure-based DI.

    Usage:
        from fetch_http_cache_response.adapters import create_fastapi_adapter

        adapter = create_fastapi_adapter(app, yaml_config=config)
        # Client available via: app.state.fetch_cache_client
    """
    config = SDKConfig.from_env(yaml_config=yaml_config, **overrides)
    client: FetchHttpCacheClient | None = None

    async def startup() -> None:
        nonlocal client
        client = create_fetch_cache_sdk(config)
        app.state.fetch_cache_client = client
        logger.info("FastAPI adapter initialized")

    async def shutdown() -> None:
        nonlocal client
        if client is not None:
            await client.close()
            client = None
        logger.info("FastAPI adapter shutdown")

    app.add_event_handler("startup", startup)
    app.add_event_handler("shutdown", shutdown)

    def get_fetch_cache_client() -> FetchHttpCacheClient:
        """FastAPI dependency for accessing the client."""
        if client is None:
            raise RuntimeError("FetchHttpCacheClient not initialized")
        return client

    return get_fetch_cache_client


# ─── Computed Function Provider ───────────────────────────────────────────────


def create_computed_provider(
    service_name: str,
    config: SDKConfig,
) -> Any:
    """
    Create a computed function provider for overwrite_from_context.

    Registers as {{fn:fetch_cache.<service_name>}} pattern.

    Usage:
        provider = create_computed_provider("github_api", config)
        registry.register(f"fetch_cache.{service_name}", provider, ComputeScope.REQUEST)
    """
    client: FetchHttpCacheClient | None = None

    async def computed_fn(context: dict[str, Any] | None = None) -> Any:
        nonlocal client
        if client is None:
            client = create_fetch_cache_sdk(config)

        url = config.http.base_url
        if context and "url" in context:
            url = context["url"]
        if not url:
            raise ValueError(f"No URL configured for fetch_cache.{service_name}")

        result = await client.get(url)
        if result.success:
            return result.data
        raise RuntimeError(
            f"fetch_cache.{service_name} failed: {result.error}"
        )

    return computed_fn
