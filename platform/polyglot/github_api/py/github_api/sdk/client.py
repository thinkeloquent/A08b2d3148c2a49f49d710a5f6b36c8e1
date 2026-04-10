"""
Core GitHub HTTP client.

Provides the base GitHubClient class that handles authentication,
rate limiting, error mapping, and HTTP request/response processing
for all GitHub API interactions.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any, Callable, Awaitable

import fetch_httpx

from env_resolver import resolve_github_env
from github_api.sdk.auth import TokenInfo, mask_token, resolve_token
from github_api.sdk.client_factory import create_http_client
from github_api.sdk.errors import GitHubError, map_response_to_error
from github_api.sdk.rate_limit import (
    RateLimitInfo,
    is_secondary_rate_limit,
    parse_rate_limit_headers,
    should_wait_for_rate_limit,
    wait_for_rate_limit,
)

__all__ = ["GitHubClient"]

_DEFAULT_BASE_URL = resolve_github_env().base_api_url
_DEFAULT_ACCEPT = "application/vnd.github+json"
_API_VERSION_HEADER = "2022-11-28"


class GitHubClient:
    """Async HTTP client for the GitHub REST API.

    Handles authentication, rate limit tracking and auto-wait,
    error mapping, and JSON parsing for all GitHub API requests.

    Usage::

        async with GitHubClient(token="ghp_...") as client:
            repo = await client.get("/repos/octocat/Hello-World")
    """

    def __init__(
        self,
        token: str | None = None,
        *,
        base_url: str = _DEFAULT_BASE_URL,
        rate_limit_auto_wait: bool = True,
        rate_limit_threshold: int = 0,
        on_rate_limit: Callable[[RateLimitInfo], Awaitable[None]] | None = None,
        logger: logging.Logger | None = None,
    ) -> None:
        """Initialize the GitHub client.

        Args:
            token: GitHub personal access token. If None, resolved from env.
            base_url: GitHub API base URL.
            rate_limit_auto_wait: Automatically sleep when rate limit is exhausted.
            rate_limit_threshold: Remaining count at which to trigger wait.
            on_rate_limit: Optional callback when rate limit info is updated.
            logger: Logger instance; defaults to module logger.
        """
        token_info: TokenInfo = resolve_token(token)
        self._token = token_info.token
        self._token_info = token_info
        self._base_url = base_url.rstrip("/")
        self._rate_limit_auto_wait = rate_limit_auto_wait
        self._rate_limit_threshold = rate_limit_threshold
        self._on_rate_limit = on_rate_limit
        self._logger = logger or logging.getLogger("github_api.sdk.client")
        self._last_rate_limit: RateLimitInfo | None = None

        self._http = create_http_client(
            base_url=self._base_url,
            token=self._token,
            accept=_DEFAULT_ACCEPT,
            api_version=_API_VERSION_HEADER,
        )

        self._logger.debug(
            "GitHubClient initialized (token=%s, source=%s, type=%s, base_url=%s)",
            mask_token(self._token),
            self._token_info.source,
            self._token_info.type,
            self._base_url,
        )

    # -- Async context manager --

    async def __aenter__(self) -> GitHubClient:
        """Enter async context manager."""
        return self

    async def __aexit__(self, exc_type: type | None, exc: BaseException | None, tb: Any) -> None:
        """Exit async context manager and close the underlying HTTP client."""
        await self.close()

    async def close(self) -> None:
        """Close the underlying HTTP client."""
        await self._http.aclose()

    # -- Properties --

    @property
    def token_info(self) -> TokenInfo:
        """Return the resolved token information."""
        return self._token_info

    @property
    def last_rate_limit(self) -> RateLimitInfo | None:
        """Return the most recently parsed rate limit info."""
        return self._last_rate_limit

    # -- HTTP methods --

    async def get(self, path: str, *, params: dict[str, Any] | None = None) -> dict[str, Any]:
        """Send a GET request.

        Args:
            path: API endpoint path.
            params: Optional query parameters.

        Returns:
            Parsed JSON response body.
        """
        return await self._request("GET", path, params=params)

    async def post(self, path: str, *, json: dict[str, Any] | None = None) -> dict[str, Any]:
        """Send a POST request.

        Args:
            path: API endpoint path.
            json: Request body as a dictionary.

        Returns:
            Parsed JSON response body.
        """
        return await self._request("POST", path, json=json)

    async def put(self, path: str, *, json: dict[str, Any] | None = None) -> dict[str, Any]:
        """Send a PUT request.

        Args:
            path: API endpoint path.
            json: Request body as a dictionary.

        Returns:
            Parsed JSON response body.
        """
        return await self._request("PUT", path, json=json)

    async def patch(self, path: str, *, json: dict[str, Any] | None = None) -> dict[str, Any]:
        """Send a PATCH request.

        Args:
            path: API endpoint path.
            json: Request body as a dictionary.

        Returns:
            Parsed JSON response body.
        """
        return await self._request("PATCH", path, json=json)

    async def delete(self, path: str, *, params: dict[str, Any] | None = None) -> dict[str, Any]:
        """Send a DELETE request.

        Args:
            path: API endpoint path.
            params: Optional query parameters.

        Returns:
            Parsed JSON response body (empty dict for 204).
        """
        return await self._request("DELETE", path, params=params)

    # -- Raw response access (for pagination) --

    async def get_raw(
        self,
        url: str,
        *,
        params: dict[str, Any] | None = None,
    ) -> fetch_httpx.Response:
        """Send a GET request and return the raw fetch_httpx.Response.

        Used by pagination to access Link headers.

        Args:
            url: Full URL or relative path.
            params: Optional query parameters.

        Returns:
            The raw fetch_httpx.Response object.
        """
        response = await self._http.get(url, params=params)
        self._process_rate_limit(response)

        if response.status_code >= 400:
            body = self._safe_json(response)
            raise map_response_to_error(
                response.status_code,
                body,
                dict(response.headers),
            )

        return response

    # -- Rate limit endpoint --

    async def get_rate_limit(self) -> dict[str, Any]:
        """Fetch the current rate limit status from GET /rate_limit.

        Returns:
            Parsed rate limit response body.
        """
        return await self.get("/rate_limit")

    # -- Internal request engine --

    async def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        json: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Execute an HTTP request with rate limit handling and error mapping.

        Args:
            method: HTTP method.
            path: API endpoint path.
            params: Query parameters.
            json: JSON request body.

        Returns:
            Parsed JSON response body.

        Raises:
            GitHubError: On any non-2xx response.
        """
        self._logger.debug("%s %s", method, path)

        response = await self._http.request(
            method,
            path,
            params=params,
            json=json,
        )

        # Extract rate limit info
        rate_limit = self._process_rate_limit(response)

        # Extract request ID
        request_id = response.headers.get("x-github-request-id")
        if request_id:
            self._logger.debug("x-github-request-id: %s", request_id)

        # Handle rate limit auto-wait
        if rate_limit and should_wait_for_rate_limit(
            rate_limit,
            auto_wait=self._rate_limit_auto_wait,
            threshold=self._rate_limit_threshold,
        ):
            await wait_for_rate_limit(rate_limit, self._logger)

        # Handle secondary rate limit (403/429 with Retry-After)
        if response.status_code in (403, 429):
            body = self._safe_json(response)
            if is_secondary_rate_limit(response.status_code, body):
                retry_after_str = response.headers.get("retry-after")
                if retry_after_str:
                    try:
                        retry_seconds = int(retry_after_str)
                    except ValueError:
                        retry_seconds = 60
                    self._logger.warning(
                        "Secondary rate limit hit. Retrying after %d seconds.",
                        retry_seconds,
                    )
                    await asyncio.sleep(retry_seconds)
                    # Retry the request once
                    response = await self._http.request(
                        method,
                        path,
                        params=params,
                        json=json,
                    )
                    self._process_rate_limit(response)

        # Error handling
        if response.status_code >= 400:
            body = self._safe_json(response)
            raise map_response_to_error(
                response.status_code,
                body,
                dict(response.headers),
            )

        # 204 No Content
        if response.status_code == 204:
            return {}

        # Parse JSON
        return self._safe_json(response)

    def _process_rate_limit(self, response: fetch_httpx.Response) -> RateLimitInfo | None:
        """Parse and store rate limit info from response headers."""
        rate_limit = parse_rate_limit_headers(response.headers)
        if rate_limit:
            self._last_rate_limit = rate_limit
            self._logger.debug(
                "Rate limit: %d/%d remaining (resets at %s)",
                rate_limit.remaining,
                rate_limit.limit,
                rate_limit.reset_at.isoformat(),
            )
        return rate_limit

    @staticmethod
    def _safe_json(response: fetch_httpx.Response) -> dict[str, Any]:
        """Safely parse JSON from a response, falling back to text wrapper."""
        try:
            data = response.json()
            if isinstance(data, dict):
                return data
            return {"data": data}
        except Exception:
            text = response.text
            return {"data": text} if text else {}
