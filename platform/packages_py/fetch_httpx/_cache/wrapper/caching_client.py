"""
Caching Client Wrapper

AsyncClient wrapper with built-in caching support.
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from ..._client import AsyncClient
from ..._exceptions import CacheError, CacheWriteError
from ..core import CacheManager
from ..types import CacheConfig, RequestCacheOptions

logger = logging.getLogger("fetch_httpx.cache")

if TYPE_CHECKING:
    from ..._models import Response
    from ..._types import (
        AuthTypes,
        CookieTypes,
        HeaderTypes,
        QueryParamTypes,
        RequestContent,
        RequestData,
        RequestFiles,
        TimeoutTypes,
        URLTypes,
    )


class CachingClient:
    """
    AsyncClient wrapper with caching support.

    Wraps an AsyncClient and adds caching functionality
    for GET/HEAD requests (configurable).

    Example:
        async with CachingClient(
            base_url="https://api.example.com",
            cache=CacheConfig(ttl=60.0)
        ) as client:
            # First request fetches from network
            response = await client.get("/users")

            # Second request returns from cache
            response = await client.get("/users")

            # Manual cache operations
            await client.cache.invalidate("GET:https://api.example.com/users")
            await client.cache.clear()

        # Custom key strategy with dot notation
        from fetch_httpx._cache import create_dot_notation_key_strategy

        key_strategy = create_dot_notation_key_strategy([
            "headers.Authorization",
            "params.page",
        ])

        async with CachingClient(
            base_url="https://api.example.com",
            cache=CacheConfig(ttl=60.0, key_strategy=key_strategy)
        ) as client:
            response = await client.get("/users", params={"page": 1})
    """

    def __init__(
        self,
        cache: CacheConfig | None = None,
        **client_kwargs: Any,
    ) -> None:
        """
        Initialize a caching client.

        Args:
            cache: Cache configuration (ttl, storage, key_strategy, etc.)
            **client_kwargs: Arguments passed to AsyncClient
        """
        self._client = AsyncClient(**client_kwargs)
        self._cache_manager = CacheManager(cache)
        self._closed = False

    @property
    def cache(self) -> CacheManager:
        """Access the cache manager for manual operations."""
        return self._cache_manager

    async def request(
        self,
        method: str,
        url: URLTypes,
        *,
        content: RequestContent | None = None,
        data: RequestData | None = None,
        files: RequestFiles | None = None,
        json: Any | None = None,
        params: QueryParamTypes | None = None,
        headers: HeaderTypes | None = None,
        cookies: CookieTypes | None = None,
        auth: AuthTypes | None = None,
        follow_redirects: bool | None = None,
        timeout: TimeoutTypes | None = None,
        cache_options: RequestCacheOptions | None = None,
    ) -> Response:
        """
        Send an HTTP request with caching support.

        Args:
            method: HTTP method
            url: Request URL
            content: Raw request body
            data: Form data
            files: Files to upload
            json: JSON data
            params: Query parameters
            headers: Request headers
            cookies: Request cookies
            auth: Authentication
            follow_redirects: Follow redirects
            timeout: Request timeout
            cache_options: Per-request cache options

        Returns:
            Response object (from cache or network)
        """
        # Convert to dict for key generation
        headers_dict = dict(headers.items()) if hasattr(headers, "items") and headers else None
        params_dict = dict(params) if params else None
        body_data = json if json is not None else data

        # Build full URL for cache key
        full_url = str(url)
        if self._client._base_url:
            full_url = str(self._client._base_url.join(full_url))

        # Generate cache key
        cache_key = (
            cache_options.cache_key
            if cache_options and cache_options.cache_key
            else self._cache_manager.generate_key(
                method, full_url, headers_dict, body_data, params_dict
            )
        )

        # Check if should cache
        should_cache = self._cache_manager.should_cache(method, cache_options)
        force_refresh = cache_options.force_refresh if cache_options else False

        logger.debug(
            "Cache decision",
            extra={
                "method": method,
                "url": full_url[:100],
                "cache_key": cache_key[:50],
                "should_cache": should_cache,
                "force_refresh": force_refresh,
            },
        )

        # Try to get from cache
        if should_cache and not force_refresh:
            if self._cache_manager.stale_while_revalidate_enabled:
                entry, is_stale = await self._cache_manager.get_stale(cache_key)
                if entry:
                    response = self._cache_manager.create_response_from_cache(entry)
                    if is_stale:
                        # Refresh in background (fire and forget)
                        import asyncio

                        asyncio.create_task(
                            self._fetch_and_cache(
                                method,
                                url,
                                cache_key,
                                cache_options,
                                content=content,
                                data=data,
                                files=files,
                                json=json,
                                params=params,
                                headers=headers,
                                cookies=cookies,
                                auth=auth,
                                follow_redirects=follow_redirects,
                                timeout=timeout,
                            )
                        )
                    return response
            else:
                entry = await self._cache_manager.get(cache_key)
                if entry:
                    return self._cache_manager.create_response_from_cache(entry)

        # Fetch from network
        response = await self._client.request(
            method,
            url,
            content=content,
            data=data,
            files=files,
            json=json,
            params=params,
            headers=headers,
            cookies=cookies,
            auth=auth,
            follow_redirects=follow_redirects,
            timeout=timeout,
        )

        # Cache successful responses
        if should_cache and response.is_success:
            ttl = cache_options.ttl if cache_options else None
            logger.info(
                "Caching response",
                extra={
                    "cache_key": cache_key[:50],
                    "status_code": response.status_code,
                    "ttl": ttl,
                },
            )
            try:
                await self._cache_manager.set(cache_key, response, ttl)
                logger.info(
                    "Response cached successfully",
                    extra={"cache_key": cache_key[:50]},
                )
            except Exception as e:
                logger.error(
                    "Failed to cache response",
                    extra={
                        "cache_key": cache_key[:50],
                        "error": str(e),
                        "error_type": type(e).__name__,
                    },
                )
                raise
        elif should_cache and not response.is_success:
            logger.debug(
                "Not caching - response not successful",
                extra={
                    "cache_key": cache_key[:50],
                    "status_code": response.status_code,
                },
            )
        elif not should_cache:
            logger.debug(
                "Not caching - caching disabled for this request",
                extra={"method": method},
            )

        return response

    async def _fetch_and_cache(
        self,
        method: str,
        url: URLTypes,
        cache_key: str,
        cache_options: RequestCacheOptions | None,
        **kwargs: Any,
    ) -> None:
        """
        Fetch and cache a response (for stale-while-revalidate).

        Errors are logged but not raised since this runs in background.
        """
        try:
            response = await self._client.request(method, url, **kwargs)
            if response.is_success:
                ttl = cache_options.ttl if cache_options else None
                try:
                    await self._cache_manager.set(cache_key, response, ttl)
                except Exception as cache_err:
                    logger.warning(
                        "Background cache update failed",
                        extra={
                            "cache_key": cache_key[:50],
                            "error": str(cache_err),
                            "error_type": type(cache_err).__name__,
                        },
                    )
        except Exception as fetch_err:
            logger.warning(
                "Background cache revalidation failed",
                extra={
                    "url": str(url),
                    "method": method,
                    "cache_key": cache_key[:50],
                    "error": str(fetch_err),
                    "error_type": type(fetch_err).__name__,
                },
            )

    # Convenience methods
    async def get(
        self,
        url: URLTypes,
        *,
        params: QueryParamTypes | None = None,
        headers: HeaderTypes | None = None,
        cookies: CookieTypes | None = None,
        auth: AuthTypes | None = None,
        follow_redirects: bool | None = None,
        timeout: TimeoutTypes | None = None,
        cache_options: RequestCacheOptions | None = None,
    ) -> Response:
        """Send a GET request with caching."""
        return await self.request(
            "GET",
            url,
            params=params,
            headers=headers,
            cookies=cookies,
            auth=auth,
            follow_redirects=follow_redirects,
            timeout=timeout,
            cache_options=cache_options,
        )

    async def head(
        self,
        url: URLTypes,
        *,
        params: QueryParamTypes | None = None,
        headers: HeaderTypes | None = None,
        cookies: CookieTypes | None = None,
        auth: AuthTypes | None = None,
        follow_redirects: bool | None = None,
        timeout: TimeoutTypes | None = None,
        cache_options: RequestCacheOptions | None = None,
    ) -> Response:
        """Send a HEAD request with caching."""
        return await self.request(
            "HEAD",
            url,
            params=params,
            headers=headers,
            cookies=cookies,
            auth=auth,
            follow_redirects=follow_redirects,
            timeout=timeout,
            cache_options=cache_options,
        )

    async def post(
        self,
        url: URLTypes,
        *,
        content: RequestContent | None = None,
        data: RequestData | None = None,
        files: RequestFiles | None = None,
        json: Any | None = None,
        params: QueryParamTypes | None = None,
        headers: HeaderTypes | None = None,
        cookies: CookieTypes | None = None,
        auth: AuthTypes | None = None,
        follow_redirects: bool | None = None,
        timeout: TimeoutTypes | None = None,
        cache_options: RequestCacheOptions | None = None,
    ) -> Response:
        """Send a POST request with optional caching."""
        return await self.request(
            "POST",
            url,
            content=content,
            data=data,
            files=files,
            json=json,
            params=params,
            headers=headers,
            cookies=cookies,
            auth=auth,
            follow_redirects=follow_redirects,
            timeout=timeout,
            cache_options=cache_options,
        )

    async def put(
        self,
        url: URLTypes,
        *,
        content: RequestContent | None = None,
        data: RequestData | None = None,
        files: RequestFiles | None = None,
        json: Any | None = None,
        params: QueryParamTypes | None = None,
        headers: HeaderTypes | None = None,
        cookies: CookieTypes | None = None,
        auth: AuthTypes | None = None,
        follow_redirects: bool | None = None,
        timeout: TimeoutTypes | None = None,
        cache_options: RequestCacheOptions | None = None,
    ) -> Response:
        """Send a PUT request with optional caching."""
        return await self.request(
            "PUT",
            url,
            content=content,
            data=data,
            files=files,
            json=json,
            params=params,
            headers=headers,
            cookies=cookies,
            auth=auth,
            follow_redirects=follow_redirects,
            timeout=timeout,
            cache_options=cache_options,
        )

    async def patch(
        self,
        url: URLTypes,
        *,
        content: RequestContent | None = None,
        data: RequestData | None = None,
        files: RequestFiles | None = None,
        json: Any | None = None,
        params: QueryParamTypes | None = None,
        headers: HeaderTypes | None = None,
        cookies: CookieTypes | None = None,
        auth: AuthTypes | None = None,
        follow_redirects: bool | None = None,
        timeout: TimeoutTypes | None = None,
        cache_options: RequestCacheOptions | None = None,
    ) -> Response:
        """Send a PATCH request with optional caching."""
        return await self.request(
            "PATCH",
            url,
            content=content,
            data=data,
            files=files,
            json=json,
            params=params,
            headers=headers,
            cookies=cookies,
            auth=auth,
            follow_redirects=follow_redirects,
            timeout=timeout,
            cache_options=cache_options,
        )

    async def delete(
        self,
        url: URLTypes,
        *,
        params: QueryParamTypes | None = None,
        headers: HeaderTypes | None = None,
        cookies: CookieTypes | None = None,
        auth: AuthTypes | None = None,
        follow_redirects: bool | None = None,
        timeout: TimeoutTypes | None = None,
        cache_options: RequestCacheOptions | None = None,
    ) -> Response:
        """Send a DELETE request with optional caching."""
        return await self.request(
            "DELETE",
            url,
            params=params,
            headers=headers,
            cookies=cookies,
            auth=auth,
            follow_redirects=follow_redirects,
            timeout=timeout,
            cache_options=cache_options,
        )

    async def aclose(self) -> None:
        """Close the client and cache resources."""
        if self._closed:
            return
        self._closed = True
        await self._cache_manager.close()
        await self._client.aclose()

    async def __aenter__(self) -> CachingClient:
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        await self.aclose()
