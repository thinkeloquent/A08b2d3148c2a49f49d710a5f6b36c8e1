"""
Core async HTTP client for the Statsig Console API.

Provides typed methods for every HTTP verb, integrated rate-limit handling,
automatic error mapping, and context-manager support.
"""

from __future__ import annotations

from typing import Any, Awaitable, Callable

import httpx

from env_resolver import resolve_statsig_env
from .errors import StatsigError, create_error_from_response
from .logger import _Logger, create_logger
from .pagination import list_all as _list_all
from .rate_limiter import RateLimiter
from .types import DEFAULT_BASE_URL, DEFAULT_TIMEOUT, RateLimitInfo


class StatsigClient:
    """Async client for the Statsig Console API (v1).

    Usage::

        async with StatsigClient(api_key="console-xxx") as client:
            gates = await client.get("/gates")

    Parameters
    ----------
    api_key:
        Statsig Console API key.  Falls back to the ``STATSIG_API_KEY``
        environment variable.
    base_url:
        Override the default API base URL.
    rate_limit_auto_wait:
        When ``True`` (default), the client automatically sleeps and retries
        on HTTP 429.
    rate_limit_threshold:
        Reserved for future proactive throttling.  Currently unused.
    on_rate_limit:
        Optional callback ``(RateLimitInfo) -> bool | Awaitable[bool]``.
        Return ``False`` to abort the retry.
    logger:
        Custom logger conforming to the logger protocol.
    timeout:
        HTTP timeout in seconds.
    proxy:
        Optional HTTP(S) proxy URL.
    verify_ssl:
        Whether to verify TLS certificates.  Default ``True``.
    """

    __slots__ = (
        "_api_key",
        "_base_url",
        "_http",
        "_rate_limiter",
        "_logger",
    )

    def __init__(
        self,
        *,
        api_key: str | None = None,
        base_url: str = DEFAULT_BASE_URL,
        rate_limit_auto_wait: bool = True,
        rate_limit_threshold: int = 0,
        on_rate_limit: (
            Callable[[RateLimitInfo], Awaitable[bool]]
            | Callable[[RateLimitInfo], bool]
            | None
        ) = None,
        logger: _Logger | Any | None = None,
        timeout: float = DEFAULT_TIMEOUT,
        proxy: str | None = None,
        verify_ssl: bool = True,
    ) -> None:
        # Resolve API key: constructor param > environment variable.
        self._api_key: str = api_key or resolve_statsig_env().api_key or ""
        if not self._api_key:
            raise ValueError(
                "A Statsig API key is required. Pass api_key= or set the "
                "STATSIG_API_KEY environment variable."
            )

        self._base_url: str = base_url.rstrip("/")
        self._logger: Any = logger or create_logger("statsig_client", "client")

        # Build the underlying httpx async client.
        transport_kwargs: dict[str, Any] = {}
        if proxy:
            transport_kwargs["proxy"] = proxy

        self._http: httpx.AsyncClient = httpx.AsyncClient(
            base_url=self._base_url,
            headers={
                "STATSIG-API-KEY": self._api_key,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            timeout=httpx.Timeout(timeout),
            verify=verify_ssl,
            **transport_kwargs,
        )

        # Rate limiter.
        self._rate_limiter = RateLimiter(
            auto_wait=rate_limit_auto_wait,
            on_rate_limit=on_rate_limit,
            logger=self._logger,
        )

    # -- context manager ---------------------------------------------------

    async def __aenter__(self) -> StatsigClient:
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        await self.close()

    async def close(self) -> None:
        """Close the underlying HTTP transport."""
        await self._http.aclose()

    # -- properties --------------------------------------------------------

    @property
    def last_rate_limit(self) -> RateLimitInfo | None:
        """Most recent rate-limit info, or ``None``."""
        return self._rate_limiter.last_rate_limit

    # -- internal request engine -------------------------------------------

    async def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        json: Any | None = None,
        headers: dict[str, str] | None = None,
        raw: bool = False,
    ) -> Any:
        """Issue an HTTP request with rate-limit handling and error mapping.

        Parameters
        ----------
        method:
            HTTP method verb (``GET``, ``POST``, etc.).
        path:
            API resource path (e.g. ``"/gates"``).
        params:
            Optional query-string parameters.
        json:
            Optional JSON request body.
        headers:
            Optional extra headers merged with defaults.
        raw:
            If ``True``, return the raw ``httpx.Response`` instead of parsed
            JSON.

        Returns
        -------
        Any
            Parsed JSON (usually ``dict``) or raw ``httpx.Response``.
        """
        url = path if path.startswith("http") else path
        self._logger.debug(
            f"{method} {url}",
            {"params": params} if params else None,
        )

        # Build keyword arguments for httpx.
        req_kwargs: dict[str, Any] = {"method": method, "url": url}
        if params is not None:
            req_kwargs["params"] = params
        if json is not None:
            req_kwargs["json"] = json
        if headers is not None:
            req_kwargs["headers"] = headers

        async def _do_request() -> httpx.Response:
            return await self._http.request(**req_kwargs)

        response = await _do_request()

        # Let the rate limiter handle 429s (may sleep + retry).
        response = await self._rate_limiter.handle_response(
            response, _do_request
        )

        # Map non-2xx to typed errors.
        if response.status_code < 200 or response.status_code >= 300:
            try:
                body = response.json()
            except Exception:
                body = response.text
            raise create_error_from_response(
                response.status_code, body, dict(response.headers)
            )

        self._logger.debug(
            f"{method} {url} -> {response.status_code}",
            {"status": response.status_code},
        )

        if raw:
            return response

        # Return parsed JSON, or empty dict for 204 No Content.
        if response.status_code == 204 or not response.content:
            return {}

        try:
            return response.json()
        except Exception:
            return response.text

    # -- public HTTP verbs -------------------------------------------------

    async def get(
        self,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> Any:
        """Send a ``GET`` request and return parsed JSON."""
        return await self._request("GET", path, params=params, headers=headers)

    async def post(
        self,
        path: str,
        *,
        json: Any | None = None,
        headers: dict[str, str] | None = None,
    ) -> Any:
        """Send a ``POST`` request and return parsed JSON."""
        return await self._request("POST", path, json=json, headers=headers)

    async def put(
        self,
        path: str,
        *,
        json: Any | None = None,
        headers: dict[str, str] | None = None,
    ) -> Any:
        """Send a ``PUT`` request and return parsed JSON."""
        return await self._request("PUT", path, json=json, headers=headers)

    async def patch(
        self,
        path: str,
        *,
        json: Any | None = None,
        headers: dict[str, str] | None = None,
    ) -> Any:
        """Send a ``PATCH`` request and return parsed JSON."""
        return await self._request("PATCH", path, json=json, headers=headers)

    async def delete(
        self,
        path: str,
        *,
        headers: dict[str, str] | None = None,
    ) -> Any:
        """Send a ``DELETE`` request and return parsed JSON."""
        return await self._request("DELETE", path, headers=headers)

    async def get_raw(
        self,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> httpx.Response:
        """Send a ``GET`` request and return the raw ``httpx.Response``."""
        return await self._request("GET", path, params=params, headers=headers, raw=True)

    # -- pagination convenience -------------------------------------------

    async def list(self, path: str, **options: Any) -> list[Any]:
        """Fetch all pages for a paginated endpoint and return a flat list.

        Delegates to :func:`~statsig_client.pagination.list_all`.
        """
        return await _list_all(self, path, **options)
