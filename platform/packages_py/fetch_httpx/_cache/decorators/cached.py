"""
Cache Decorators

Higher-order functions and decorators for caching.
"""

from __future__ import annotations

import functools
from collections.abc import Callable
from typing import TYPE_CHECKING, Any, TypeVar

from ..core import CacheManager
from ..types import CacheConfig

if TYPE_CHECKING:
    from collections.abc import Awaitable

F = TypeVar("F", bound=Callable[..., Any])


def with_cache(
    fetch_fn: Callable[..., Awaitable[Any]],
    config: CacheConfig | None = None,
) -> Callable[..., Awaitable[Any]]:
    """
    Higher-order function that wraps any async fetch function with caching.

    The wrapped function expects (method, url, **kwargs) signature.

    Example:
        async def my_fetch(method: str, url: str, **kwargs) -> Response:
            async with AsyncClient() as client:
                return await client.request(method, url, **kwargs)

        cached_fetch = with_cache(my_fetch, CacheConfig(ttl=60.0))

        # First call fetches from network
        response = await cached_fetch("GET", "https://api.example.com/users")

        # Second call returns from cache
        response = await cached_fetch("GET", "https://api.example.com/users")

    Args:
        fetch_fn: Async function with signature (method, url, **kwargs) -> Response
        config: Cache configuration

    Returns:
        Cached wrapper function
    """
    cache_manager = CacheManager(config)

    async def wrapper(method: str, url: str, **kwargs: Any) -> Any:
        # Extract cache-relevant data from kwargs
        headers = kwargs.get("headers")
        params = kwargs.get("params")
        body = kwargs.get("json") or kwargs.get("data")

        headers_dict = dict(headers.items()) if hasattr(headers, "items") and headers else None
        params_dict = dict(params) if params else None

        # Generate cache key
        cache_key = cache_manager.generate_key(method, url, headers_dict, body, params_dict)

        # Check if should cache
        if not cache_manager.should_cache(method):
            return await fetch_fn(method, url, **kwargs)

        # Try cache
        entry = await cache_manager.get(cache_key)
        if entry:
            return cache_manager.create_response_from_cache(entry)

        # Fetch from network
        response = await fetch_fn(method, url, **kwargs)

        # Cache successful responses
        if hasattr(response, "is_success") and response.is_success:
            await cache_manager.set(cache_key, response)
        elif hasattr(response, "status_code") and 200 <= response.status_code < 300:
            await cache_manager.set(cache_key, response)

        return response

    # Attach cache manager for manual operations
    wrapper.cache = cache_manager  # type: ignore

    return wrapper


def cached(
    ttl: float | None = None,
    config: CacheConfig | None = None,
    key_fn: Callable[..., str] | None = None,
) -> Callable[[F], F]:
    """
    Decorator for caching async functions.

    Can be used on methods that return Response-like objects
    or any serializable data.

    Example:
        class UserService:
            def __init__(self, client: AsyncClient):
                self.client = client

            @cached(ttl=60.0)
            async def get_users(self, page: int = 1) -> Response:
                return await self.client.get(
                    "https://api.example.com/users",
                    params={"page": page}
                )

        # Or with custom key function
        @cached(ttl=120.0, key_fn=lambda page: f"users:page:{page}")
        async def get_users(page: int = 1) -> dict:
            async with AsyncClient() as client:
                response = await client.get(
                    "https://api.example.com/users",
                    params={"page": page}
                )
                return response.json()

    Args:
        ttl: Cache TTL in seconds (overrides config.ttl)
        config: Cache configuration
        key_fn: Custom function to generate cache key from arguments

    Returns:
        Decorator function
    """
    effective_config = config or CacheConfig()
    if ttl is not None:
        effective_config = CacheConfig(
            ttl=ttl,
            storage=effective_config.storage,
            key_strategy=effective_config.key_strategy,
            methods=effective_config.methods,
            max_entries=effective_config.max_entries,
            stale_while_revalidate=effective_config.stale_while_revalidate,
            stale_grace_period=effective_config.stale_grace_period,
        )

    cache_manager = CacheManager(effective_config)

    def decorator(fn: F) -> F:
        @functools.wraps(fn)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            # Generate cache key
            if key_fn:
                # Use custom key function
                cache_key = key_fn(*args, **kwargs)
            else:
                # Generate key from function name and arguments
                key_parts = [fn.__name__]
                key_parts.extend(str(arg) for arg in args)
                key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
                cache_key = ":".join(key_parts)

            # Try cache
            entry = await cache_manager.get(cache_key)
            if entry:
                # Return cached data directly for non-Response types
                return entry.data

            # Call function
            result = await fn(*args, **kwargs)

            # Cache the result
            # For Response objects, extract data
            if hasattr(result, "json"):
                try:
                    data = result.json()
                except Exception:
                    data = result.text if hasattr(result, "text") else result
            else:
                data = result

            # Create a minimal entry for caching
            import time

            from ..types import CacheEntry, CacheEntryMetadata

            entry = CacheEntry(
                key=cache_key,
                data=data,
                created_at=time.time(),
                expires_at=time.time() + effective_config.ttl,
                metadata=CacheEntryMetadata(
                    status_code=getattr(result, "status_code", 200),
                    headers=dict(getattr(result, "headers", {}) or {}),
                    url=str(getattr(result, "url", "")),
                    method="GET",
                ),
            )

            await cache_manager._storage.set(cache_key, entry)

            return result

        # Attach cache manager for manual operations
        wrapper.cache = cache_manager  # type: ignore

        return wrapper  # type: ignore

    return decorator
