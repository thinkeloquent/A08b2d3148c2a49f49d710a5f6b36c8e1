"""
Core async HTTP client for the Sauce Labs REST API.

Provides typed methods for every HTTP verb, integrated rate-limit handling,
automatic error mapping, HTTP Basic Auth, and async context-manager support.
"""

from __future__ import annotations

import base64
import os
from typing import Any, Awaitable, Callable

import httpx

from .config import resolve_config
from .errors import SaucelabsError, create_error_from_response
from .logger import _Logger, create_logger
from .rate_limiter import RateLimiter
from .types import DEFAULT_TIMEOUT, RateLimitInfo


class SaucelabsClient:
    """Async client for the Sauce Labs REST API.

    Usage::

        async with SaucelabsClient(username="demo", api_key="xxx") as client:
            jobs = await client.get("/rest/v1/demo/jobs", params={"limit": 5})
    """

    __slots__ = (
        "_username",
        "_api_key",
        "_base_url",
        "_mobile_base_url",
        "_http",
        "_mobile_http",
        "_rate_limiter",
        "_logger",
        "jobs",
        "platform",
        "users",
        "upload",
    )

    def __init__(self, **kwargs: Any) -> None:
        config = resolve_config(**kwargs)

        self._username: str = config["username"]
        self._api_key: str = config["api_key"]
        self._base_url: str = config["base_url"]
        self._mobile_base_url: str = config["mobile_base_url"]
        self._logger: Any = config["logger"] or create_logger("saucelabs_api", "client")

        # Build Basic Auth header
        auth_header = ""
        if self._username and self._api_key:
            encoded = base64.b64encode(f"{self._username}:{self._api_key}".encode()).decode()
            auth_header = f"Basic {encoded}"

        # Core Automation HTTP client
        core_headers: dict[str, str] = {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
        if auth_header:
            core_headers["Authorization"] = auth_header

        transport_kwargs: dict[str, Any] = {}
        if config.get("proxy"):
            transport_kwargs["proxy"] = config["proxy"]

        self._http: httpx.AsyncClient = httpx.AsyncClient(
            base_url=self._base_url,
            headers=core_headers,
            timeout=httpx.Timeout(config["timeout"]),
            verify=config["verify_ssl"],
            **transport_kwargs,
        )

        # Mobile Distribution HTTP client (separate base URL)
        mobile_headers: dict[str, str] = {"Accept": "application/json"}
        if auth_header:
            mobile_headers["Authorization"] = auth_header

        self._mobile_http: httpx.AsyncClient = httpx.AsyncClient(
            base_url=self._mobile_base_url,
            headers=mobile_headers,
            timeout=httpx.Timeout(config["timeout"]),
            verify=config["verify_ssl"],
            **transport_kwargs,
        )

        self._rate_limiter = RateLimiter(
            auto_wait=config["rate_limit_auto_wait"],
            max_retries=5,
            on_rate_limit=config.get("on_rate_limit"),
            logger=self._logger,
        )

        self._logger.info("client initialized", {
            "base_url": self._base_url,
            "mobile_base_url": self._mobile_base_url,
            "has_username": bool(self._username),
            "has_api_key": bool(self._api_key),
        })

    @property
    def username(self) -> str:
        return self._username

    @property
    def last_rate_limit(self) -> RateLimitInfo | None:
        return self._rate_limiter.last_rate_limit

    async def __aenter__(self) -> SaucelabsClient:
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        await self.close()

    async def close(self) -> None:
        """Close the underlying HTTP transports."""
        await self._http.aclose()
        await self._mobile_http.aclose()

    async def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        json: Any | None = None,
        data: Any | None = None,
        files: Any | None = None,
        headers: dict[str, str] | None = None,
        mobile: bool = False,
    ) -> Any:
        """Issue an HTTP request with rate-limit handling and error mapping."""
        http = self._mobile_http if mobile else self._http
        url = path if path.startswith("http") else path

        self._logger.debug(f"{method} {url}", {"params": params} if params else None)

        req_kwargs: dict[str, Any] = {"method": method, "url": url}
        if params is not None:
            req_kwargs["params"] = params
        if json is not None:
            req_kwargs["json"] = json
        if data is not None:
            req_kwargs["data"] = data
        if files is not None:
            req_kwargs["files"] = files
        if headers is not None:
            req_kwargs["headers"] = headers

        async def _do_request() -> httpx.Response:
            return await http.request(**req_kwargs)

        response = await _do_request()

        # Handle 429 via rate limiter
        response = await self._rate_limiter.handle_response(response, _do_request)

        # Map non-2xx to typed errors
        if response.status_code < 200 or response.status_code >= 300:
            try:
                body = response.json()
            except Exception:
                body = response.text
            err = create_error_from_response(response.status_code, body, dict(response.headers))
            err.endpoint = path
            err.method = method
            raise err

        self._logger.debug(f"{method} {url} -> {response.status_code}")

        if response.status_code == 204 or not response.content:
            return {}

        try:
            return response.json()
        except Exception:
            return response.text

    async def get(self, path: str, *, params: dict[str, Any] | None = None, headers: dict[str, str] | None = None, mobile: bool = False) -> Any:
        return await self._request("GET", path, params=params, headers=headers, mobile=mobile)

    async def post(self, path: str, *, json: Any | None = None, data: Any | None = None, files: Any | None = None, headers: dict[str, str] | None = None, mobile: bool = False) -> Any:
        return await self._request("POST", path, json=json, data=data, files=files, headers=headers, mobile=mobile)

    async def put(self, path: str, *, json: Any | None = None, headers: dict[str, str] | None = None, mobile: bool = False) -> Any:
        return await self._request("PUT", path, json=json, headers=headers, mobile=mobile)

    async def patch(self, path: str, *, json: Any | None = None, headers: dict[str, str] | None = None, mobile: bool = False) -> Any:
        return await self._request("PATCH", path, json=json, headers=headers, mobile=mobile)

    async def delete(self, path: str, *, headers: dict[str, str] | None = None, mobile: bool = False) -> Any:
        return await self._request("DELETE", path, headers=headers, mobile=mobile)

    async def get_raw(self, path: str, *, params: dict[str, Any] | None = None, headers: dict[str, str] | None = None, mobile: bool = False) -> httpx.Response:
        http = self._mobile_http if mobile else self._http
        return await http.request("GET", path, params=params, headers=headers or {})
