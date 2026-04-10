"""
Client Module — Figma API SDK

Core HTTP client wrapping httpx for Figma API communication.
Integrates rate limiting, caching, retry, and error mapping.
"""

from typing import Any, Callable, Dict, Optional
from urllib.parse import urlencode

import httpx

from ..config import DEFAULTS
from ..logger import create_logger
from .auth import mask_token, resolve_token
from .cache import RequestCache
from .errors import (
    FigmaError,
    NetworkError,
    RateLimitError,
    TimeoutError,
    map_response_to_error,
)
from .rate_limit import (
    RateLimitInfo,
    RateLimitOptions,
    handle_rate_limit,
    parse_rate_limit_headers,
)
from .retry import is_retryable, with_retry

log = create_logger("figma-api", __file__)


class FigmaClient:
    """
    Async HTTP client for the Figma API.

    Args:
        token: Figma API token (falls back to FIGMA_TOKEN env var)
        base_url: Base API URL (default: https://api.figma.com)
        rate_limit_auto_wait: Auto-sleep on 429 (default: True)
        rate_limit_threshold: Reserved for future proactive throttling
        on_rate_limit: Callback receiving RateLimitInfo; return False to skip auto-wait
        logger: Custom logger instance
        timeout: Request timeout in seconds (default: 30)
        max_retries: Max retry attempts (default: 3)
        cache_max_size: LRU cache max entries (default: 100)
        cache_ttl: Cache TTL in seconds (default: 300)
    """

    def __init__(
        self,
        token: Optional[str] = None,
        base_url: str = DEFAULTS["base_url"],
        rate_limit_auto_wait: bool = DEFAULTS["rate_limit_auto_wait"],
        rate_limit_threshold: int = DEFAULTS["rate_limit_threshold"],
        on_rate_limit: Optional[Callable[[RateLimitInfo], Optional[bool]]] = None,
        max_retry_after: float = DEFAULTS.get("max_retry_after", 60),
        logger: Optional[Any] = None,
        timeout: int = DEFAULTS["timeout"],
        max_retries: int = DEFAULTS["max_retries"],
        cache_max_size: int = DEFAULTS["cache_max_size"],
        cache_ttl: int = DEFAULTS["cache_ttl"],
    ):
        token_info = resolve_token(token)
        self._token = token_info.token
        self._token_source = token_info.source
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout
        self._max_retries = max_retries
        self._rate_limit_options = RateLimitOptions(
            auto_wait=rate_limit_auto_wait,
            threshold=rate_limit_threshold,
            max_retry_after=max_retry_after,
            on_rate_limit=on_rate_limit,
        )
        self._log = logger or log
        self._cache = RequestCache(max_size=cache_max_size, ttl=cache_ttl)
        self._last_rate_limit: Optional[RateLimitInfo] = None
        self._client: Optional[httpx.AsyncClient] = None

        self._stats = {
            "requests_made": 0,
            "requests_failed": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "rate_limit_hits": 0,
            "rate_limit_waits": 0,
            "rate_limit_total_wait_seconds": 0.0,
        }

        self._log.info(
            "client initialized",
            base_url=self._base_url,
            token_source=self._token_source,
            token=mask_token(self._token),
        )

    @property
    def last_rate_limit(self) -> Optional[RateLimitInfo]:
        return self._last_rate_limit

    @property
    def stats(self) -> Dict[str, Any]:
        return {**self._stats, "cache": self._cache.stats}

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=self._timeout)
        return self._client

    def _build_url(self, path: str, params: Optional[Dict[str, Any]] = None) -> str:
        url = path if path.startswith("http") else f"{self._base_url}{path}"
        if params:
            filtered = {k: str(v) for k, v in params.items() if v is not None}
            if filtered:
                url = f"{url}?{urlencode(filtered)}"
        return url

    def _build_headers(self) -> Dict[str, str]:
        return {
            "X-Figma-Token": self._token,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def _request(
        self,
        method: str,
        path: str,
        *,
        params: Optional[Dict[str, Any]] = None,
        body: Optional[Any] = None,
        skip_cache: bool = False,
    ) -> Any:
        url = self._build_url(path, params)
        cache_key = url if method == "GET" else None

        # Check cache for GET
        if cache_key and not skip_cache:
            cached = self._cache.get(cache_key)
            if cached is not None:
                self._stats["cache_hits"] += 1
                self._log.debug("cache hit", url=url)
                return cached
            self._stats["cache_misses"] += 1

        self._stats["requests_made"] += 1
        short_url = url.replace(self._base_url, "")
        self._log.debug("request", method=method, url=short_url)

        async def attempt_request(attempt: int) -> Any:
            client = await self._get_client()

            try:
                if body is not None and method != "GET":
                    response = await client.request(
                        method, url, headers=self._build_headers(), json=body
                    )
                else:
                    response = await client.request(method, url, headers=self._build_headers())
            except httpx.TimeoutException as exc:
                raise TimeoutError(
                    f"Request timed out: {method} {path}", meta={"url": url, "method": method}
                ) from exc
            except httpx.ConnectError as exc:
                raise NetworkError(
                    f"Network error: {exc}", meta={"url": url, "method": method}
                ) from exc

            headers = dict(response.headers)

            # Handle 429
            if response.status_code == 429:
                info = parse_rate_limit_headers(headers)
                self._last_rate_limit = info
                self._stats["rate_limit_hits"] += 1

                result = await handle_rate_limit(headers, self._rate_limit_options)
                if not result["retry"]:
                    raise RateLimitError("Rate limit exceeded", rate_limit_info=info)

                # Auto-wait happened — track actual wait
                self._stats["rate_limit_waits"] += 1
                self._stats["rate_limit_total_wait_seconds"] += info.retry_after

                err = RateLimitError("Rate limit exceeded (retrying)", rate_limit_info=info)
                err.status = 429
                raise err

            if response.status_code >= 400:
                self._stats["requests_failed"] += 1
                try:
                    parsed_body = response.json()
                except Exception:
                    parsed_body = response.text
                raise map_response_to_error(response.status_code, parsed_body, headers)

            try:
                data = response.json() if response.text else {}
            except Exception:
                data = response.text

            self._log.debug("response", status=response.status_code, url=short_url)
            return data

        result = await with_retry(attempt_request, max_retries=self._max_retries)

        if cache_key:
            self._cache.set(cache_key, result)

        return result

    async def get(self, path: str, *, params: Optional[Dict[str, Any]] = None) -> Any:
        return await self._request("GET", path, params=params)

    async def post(self, path: str, body: Optional[Any] = None, **kwargs: Any) -> Any:
        return await self._request("POST", path, body=body, **kwargs)

    async def put(self, path: str, body: Optional[Any] = None, **kwargs: Any) -> Any:
        return await self._request("PUT", path, body=body, **kwargs)

    async def patch(self, path: str, body: Optional[Any] = None, **kwargs: Any) -> Any:
        return await self._request("PATCH", path, body=body, **kwargs)

    async def delete(self, path: str, **kwargs: Any) -> Any:
        return await self._request("DELETE", path, **kwargs)

    async def get_raw(self, path: str, *, params: Optional[Dict[str, Any]] = None) -> httpx.Response:
        """Get raw httpx response (for pagination)."""
        client = await self._get_client()
        url = self._build_url(path, params)
        self._stats["requests_made"] += 1
        return await client.get(url, headers=self._build_headers())

    async def close(self) -> None:
        """Close the underlying HTTP client."""
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    async def __aenter__(self) -> "FigmaClient":
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        await self.close()
