"""
Cache Middleware

Event hooks integration for caching.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from ..._client import AsyncClient
from ..core import CacheManager
from ..types import CacheConfig

if TYPE_CHECKING:
    from ..._models import Request, Response


def create_cache_hooks(
    config: CacheConfig | None = None,
) -> dict[str, Any]:
    """
    Create event hooks for caching responses.

    Note: Event hooks in httpx/fetch_httpx cannot short-circuit requests
    (they can't return cached responses directly). This middleware stores
    responses in cache for future use with CachingClient or with_cache.

    For full caching functionality, use CachingClient or with_cache instead.

    Example:
        hooks = create_cache_hooks(CacheConfig(ttl=60.0))

        # The hooks will cache responses but won't serve from cache
        # Use the returned cache_manager for cache operations
        cache_manager = hooks["cache_manager"]

        client = AsyncClient(event_hooks={
            "request": hooks["request"],
            "response": hooks["response"],
        })

        # Check cache manually before requests
        entry = await cache_manager.get("GET:https://api.example.com/users")
        if entry:
            response = cache_manager.create_response_from_cache(entry)
        else:
            response = await client.get("https://api.example.com/users")

    Args:
        config: Cache configuration

    Returns:
        Dict with request hooks, response hooks, and cache_manager
    """
    cache_manager = CacheManager(config)

    # Track request info for cache key generation
    pending_requests: dict[int, dict[str, Any]] = {}

    async def request_hook(request: Request) -> None:
        """Store request info for cache key generation."""
        request_id = id(request)

        # Extract headers as dict
        headers_dict = dict(request.headers.items()) if request.headers else None

        # Parse query params from URL
        params_dict = None
        if request.url.query:
            from urllib.parse import parse_qs

            params_dict = {k: v[0] if len(v) == 1 else v for k, v in parse_qs(request.url.query).items()}

        # Store request context
        pending_requests[request_id] = {
            "method": request.method,
            "url": str(request.url),
            "headers": headers_dict,
            "params": params_dict,
        }

    async def response_hook(response: Response) -> None:
        """Cache successful responses."""
        if not response.request:
            return

        request_id = id(response.request)
        request_info = pending_requests.pop(request_id, None)

        if not request_info:
            return

        method = request_info["method"]

        # Check if should cache
        if not cache_manager.should_cache(method):
            return

        # Only cache successful responses
        if not response.is_success:
            return

        # Generate cache key
        cache_key = cache_manager.generate_key(
            request_info["method"],
            request_info["url"],
            request_info["headers"],
            None,  # body not available in hook
            request_info["params"],
        )

        # Cache the response
        await cache_manager.set(cache_key, response)

    return {
        "request": [request_hook],
        "response": [response_hook],
        "cache_manager": cache_manager,
    }


def create_cache_aware_client(
    config: CacheConfig | None = None,
    **client_kwargs: Any,
) -> tuple[AsyncClient, CacheManager]:
    """
    Create an AsyncClient with cache hooks pre-configured.

    Returns both the client and the cache manager for manual cache operations.

    Note: This doesn't provide automatic cache lookup on requests (event hooks
    can't short-circuit). Use CachingClient for full caching support, or
    manually check the cache before requests.

    Example:
        client, cache_manager = create_cache_aware_client(
            CacheConfig(ttl=60.0),
            base_url="https://api.example.com",
        )

        # Manual cache-first pattern
        async def cached_get(url: str) -> Response:
            cache_key = cache_manager.generate_key("GET", url)
            entry = await cache_manager.get(cache_key)
            if entry:
                return cache_manager.create_response_from_cache(entry)
            return await client.get(url)

        async with client:
            response = await cached_get("/users")

    Args:
        config: Cache configuration
        **client_kwargs: Arguments passed to AsyncClient

    Returns:
        Tuple of (AsyncClient, CacheManager)
    """
    hooks = create_cache_hooks(config)
    cache_manager: CacheManager = hooks["cache_manager"]

    # Merge with existing event hooks
    existing_hooks = client_kwargs.pop("event_hooks", {})
    merged_hooks: dict[str, list[Any]] = {
        "request": list(existing_hooks.get("request", [])) + hooks["request"],
        "response": list(existing_hooks.get("response", [])) + hooks["response"],
    }

    client = AsyncClient(event_hooks=merged_hooks, **client_kwargs)

    return client, cache_manager
