"""
Core Confluence Data Center REST API v9.2.3 client using HTTPX.

Provides a synchronous HTTP client with:
- Basic Auth (username + API token)
- Automatic rate-limit handling with Retry-After
- Exponential backoff for server errors
- Multipart file upload support
- Context manager protocol
"""

from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass
from typing import Any
from urllib.parse import urljoin

import httpx

from confluence_api.exceptions import (
    ConfluenceAPIError,
    ConfluenceAuthenticationError,
    ConfluenceConfigurationError,
    ConfluenceConflictError,
    ConfluenceNetworkError,
    ConfluenceNotFoundError,
    ConfluencePermissionError,
    ConfluenceRateLimitError,
    ConfluenceServerError,
    ConfluenceTimeoutError,
    ConfluenceValidationError,
    create_error_from_response,
)
from confluence_api.logger import ILogger, create_logger, null_logger


@dataclass
class RateLimitInfo:
    """Stores information about the most recent rate-limit response."""

    retry_after: float | None
    timestamp: float
    endpoint: str


class ConfluenceClient:
    """
    Core HTTP client for the Confluence Data Center REST API v9.2.3.

    Usage:
        with ConfluenceClient(
            base_url='https://confluence.example.com',
            username='user@example.com',
            api_token='your-api-token',
        ) as client:
            spaces = client.get('space')
            page = client.get('content/12345', params={'expand': 'body.storage'})
    """

    def __init__(
        self,
        base_url: str,
        username: str,
        api_token: str,
        timeout: float = 30.0,
        rate_limit_auto_wait: bool = True,
        max_retries: int = 3,
        logger: ILogger | None = None,
    ) -> None:
        """
        Initialize the Confluence API client.

        Args:
            base_url: Confluence Data Center base URL (e.g. 'https://confluence.example.com').
            username: Username for Basic Auth.
            api_token: API token / password for Basic Auth.
            timeout: Request timeout in seconds (default 30.0).
            rate_limit_auto_wait: If True, automatically wait and retry on 429 responses.
            max_retries: Maximum number of retries for 5xx server errors (default 3).
            logger: Optional custom logger implementing ILogger protocol.

        Raises:
            ConfluenceConfigurationError: If base_url is invalid.
        """
        if not base_url or not base_url.startswith(("http://", "https://")):
            raise ConfluenceConfigurationError("Base URL must start with http:// or https://")

        if not username:
            raise ConfluenceConfigurationError("Username is required")

        if not api_token:
            raise ConfluenceConfigurationError("API token is required")

        # Normalize: ensure trailing slash before urljoin
        normalized_base = base_url.rstrip("/") + "/"
        self.base_url = urljoin(normalized_base, "rest/api/")

        self.username = username
        self.api_token = api_token
        self.timeout = timeout
        self.rate_limit_auto_wait = rate_limit_auto_wait
        self.max_retries = max_retries
        self.last_rate_limit: RateLimitInfo | None = None

        self._log: ILogger = logger or create_logger("confluence-api", __file__)

        self._client = httpx.Client(
            auth=(username, api_token),
            timeout=timeout,
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Atlassian-Token": "no-check",
            },
        )

        self._log.debug("ConfluenceClient initialized", {"base_url": self.base_url})

    def __enter__(self) -> ConfluenceClient:
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        self.close()

    def close(self) -> None:
        """Close the underlying HTTP client."""
        self._client.close()
        self._log.debug("ConfluenceClient closed")

    def _make_request(
        self,
        method: str,
        endpoint: str,
        params: dict[str, Any] | None = None,
        json_data: dict[str, Any] | Any | None = None,
        files: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Core HTTP request method with error handling, rate-limit support, and retries.

        Args:
            method: HTTP method (GET, POST, PUT, DELETE, PATCH).
            endpoint: API endpoint relative to base_url (e.g. 'content/12345').
            params: Query parameters dict.
            json_data: JSON request body.
            files: Multipart file upload dict (httpx-compatible format).

        Returns:
            Parsed JSON response as dict, or empty dict for 204/empty responses.

        Raises:
            ConfluenceValidationError: On 400 responses.
            ConfluenceAuthenticationError: On 401 responses.
            ConfluencePermissionError: On 403 responses.
            ConfluenceNotFoundError: On 404 responses.
            ConfluenceConflictError: On 409 responses.
            ConfluenceRateLimitError: On 429 responses (if auto-wait is disabled).
            ConfluenceServerError: On 5xx responses after retries exhausted.
            ConfluenceNetworkError: On connection/DNS failures.
            ConfluenceTimeoutError: On request timeouts.
        """
        url = urljoin(self.base_url, endpoint)

        self._log.debug("request", {"method": method, "url": url, "params": params})

        retries_remaining = self.max_retries
        backoff_base = 1.0

        while True:
            try:
                # Build request kwargs
                request_kwargs: dict[str, Any] = {
                    "method": method,
                    "url": url,
                    "params": params,
                }

                if files is not None:
                    # Multipart upload: do NOT set Content-Type (httpx handles boundary)
                    request_kwargs["files"] = files
                    # Add form data if json_data is a dict (used for comment, minorEdit etc.)
                    if json_data is not None and isinstance(json_data, dict):
                        request_kwargs["data"] = json_data
                    # Remove Content-Type header for this request so httpx can set multipart boundary
                    headers = dict(self._client.headers)
                    headers.pop("Content-Type", None)
                    request_kwargs["headers"] = headers
                else:
                    request_kwargs["json"] = json_data

                response = self._client.request(**request_kwargs)

            except httpx.TimeoutException as exc:
                raise ConfluenceTimeoutError(
                    f"Request timed out: {method} {url}",
                    url=url,
                    method=method,
                ) from exc
            except httpx.RequestError as exc:
                raise ConfluenceNetworkError(
                    f"Network error: {exc}",
                    url=url,
                    method=method,
                ) from exc

            status = response.status_code

            # --- Success ---
            if 200 <= status < 300:
                if status == 204 or not response.content:
                    return {}
                try:
                    return response.json()
                except Exception as exc:
                    raise ConfluenceAPIError(
                        f"Failed to parse response JSON: {exc}",
                        status_code=status,
                        url=url,
                        method=method,
                    ) from exc

            # --- Parse error body ---
            error_body: dict[str, Any] | None = None
            try:
                error_body = response.json()
            except Exception:
                error_body = None

            # --- Rate Limit (429) ---
            if status == 429:
                retry_after_raw = response.headers.get("Retry-After")
                retry_after: float | None = None
                if retry_after_raw:
                    try:
                        retry_after = float(retry_after_raw)
                    except (ValueError, TypeError):
                        retry_after = None

                self.last_rate_limit = RateLimitInfo(
                    retry_after=retry_after,
                    timestamp=time.time(),
                    endpoint=endpoint,
                )

                if self.rate_limit_auto_wait and retry_after is not None and retry_after > 0:
                    self._log.warning("rate limited, auto-waiting", {
                        "retry_after": retry_after,
                        "endpoint": endpoint,
                    })
                    time.sleep(retry_after)
                    continue

                raise ConfluenceRateLimitError(
                    _extract_error_message(error_body, status),
                    retry_after=retry_after,
                    response_data=error_body,
                    url=url,
                    method=method,
                )

            # --- Server Errors (5xx) with retry ---
            if status >= 500:
                if retries_remaining > 0:
                    retries_remaining -= 1
                    wait_time = backoff_base * (2 ** (self.max_retries - retries_remaining - 1))
                    self._log.warning("server error, retrying", {
                        "status": status,
                        "retries_remaining": retries_remaining,
                        "wait_seconds": wait_time,
                        "endpoint": endpoint,
                    })
                    time.sleep(wait_time)
                    backoff_base *= 1.0  # keep base stable, exponential via power
                    continue

                raise ConfluenceServerError(
                    _extract_error_message(error_body, status),
                    status_code=status,
                    response_data=error_body,
                    url=url,
                    method=method,
                )

            # --- Client Errors ---
            if status == 400:
                raise ConfluenceValidationError(
                    _extract_error_message(error_body, status),
                    response_data=error_body,
                    url=url,
                    method=method,
                )

            if status == 401:
                raise ConfluenceAuthenticationError(
                    _extract_error_message(error_body, status),
                    response_data=error_body,
                    url=url,
                    method=method,
                )

            if status == 403:
                raise ConfluencePermissionError(
                    _extract_error_message(error_body, status),
                    response_data=error_body,
                    url=url,
                    method=method,
                )

            if status == 404:
                raise ConfluenceNotFoundError(
                    _extract_error_message(error_body, status),
                    response_data=error_body,
                    url=url,
                    method=method,
                )

            if status == 409:
                raise ConfluenceConflictError(
                    _extract_error_message(error_body, status),
                    response_data=error_body,
                    url=url,
                    method=method,
                )

            # --- Catch-all for other 4xx ---
            raise ConfluenceAPIError(
                _extract_error_message(error_body, status),
                status_code=status,
                response_data=error_body,
                url=url,
                method=method,
            )

    def get_raw(self, endpoint: str, params: dict[str, Any] | None = None) -> httpx.Response:
        """
        Perform a GET request and return the raw httpx.Response (for binary downloads).

        Args:
            endpoint: API endpoint relative to base_url.
            params: Query parameters dict.

        Returns:
            Raw httpx.Response object.

        Raises:
            ConfluenceNetworkError: On connection failures.
            ConfluenceTimeoutError: On request timeout.
            ConfluenceAPIError: On non-2xx responses.
        """
        url = urljoin(self.base_url, endpoint)
        self._log.debug("get_raw request", {"url": url, "params": params})

        try:
            response = self._client.request(method="GET", url=url, params=params)
        except httpx.TimeoutException as exc:
            raise ConfluenceTimeoutError(
                f"Request timed out: GET {url}",
                url=url,
                method="GET",
            ) from exc
        except httpx.RequestError as exc:
            raise ConfluenceNetworkError(
                f"Network error: {exc}",
                url=url,
                method="GET",
            ) from exc

        if response.status_code >= 400:
            error_body: dict[str, Any] | None = None
            try:
                error_body = response.json()
            except Exception:
                error_body = None
            raise create_error_from_response(
                status=response.status_code,
                body=error_body,
                url=url,
                method="GET",
            )

        return response

    # ── Convenience Methods ──────────────────────────────────────────────

    def get(self, endpoint: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        """Perform a GET request and return parsed JSON."""
        return self._make_request("GET", endpoint, params=params)

    def post(
        self,
        endpoint: str,
        json_data: dict[str, Any] | Any | None = None,
        params: dict[str, Any] | None = None,
        files: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Perform a POST request and return parsed JSON."""
        return self._make_request("POST", endpoint, params=params, json_data=json_data, files=files)

    def put(
        self,
        endpoint: str,
        json_data: dict[str, Any] | Any | None = None,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Perform a PUT request and return parsed JSON."""
        return self._make_request("PUT", endpoint, params=params, json_data=json_data)

    def delete(self, endpoint: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        """Perform a DELETE request and return parsed JSON (or empty dict for 204)."""
        return self._make_request("DELETE", endpoint, params=params)

    def patch(
        self,
        endpoint: str,
        json_data: dict[str, Any] | Any | None = None,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Perform a PATCH request and return parsed JSON."""
        return self._make_request("PATCH", endpoint, params=params, json_data=json_data)


def _extract_error_message(body: dict[str, Any] | None, status: int) -> str:
    """Extract a human-readable error message from a Confluence error response body."""
    if not body:
        return f"HTTP {status}"

    # Confluence Data Center error format: {"statusCode": 404, "message": "..."}
    if "message" in body:
        return body["message"]

    # Some endpoints use errorMessages array
    if "errorMessages" in body and isinstance(body["errorMessages"], list):
        return "; ".join(body["errorMessages"])

    # Fallback
    return f"HTTP {status}"


class AsyncConfluenceClient:
    """
    Async core HTTP client for the Confluence Data Center REST API v9.2.3.

    Usage:
        async with AsyncConfluenceClient(
            base_url='https://confluence.example.com',
            username='user@example.com',
            api_token='your-api-token',
        ) as client:
            spaces = await client.get('space')
            page = await client.get('content/12345', params={'expand': 'body.storage'})
    """

    def __init__(
        self,
        base_url: str,
        username: str,
        api_token: str,
        timeout: float = 30.0,
        rate_limit_auto_wait: bool = True,
        max_retries: int = 3,
        logger: ILogger | None = None,
    ) -> None:
        """
        Initialize the async Confluence API client.

        Args:
            base_url: Confluence Data Center base URL (e.g. 'https://confluence.example.com').
            username: Username for Basic Auth.
            api_token: API token / password for Basic Auth.
            timeout: Request timeout in seconds (default 30.0).
            rate_limit_auto_wait: If True, automatically wait and retry on 429 responses.
            max_retries: Maximum number of retries for 5xx server errors (default 3).
            logger: Optional custom logger implementing ILogger protocol.

        Raises:
            ConfluenceConfigurationError: If base_url is invalid.
        """
        if not base_url or not base_url.startswith(("http://", "https://")):
            raise ConfluenceConfigurationError("Base URL must start with http:// or https://")

        if not username:
            raise ConfluenceConfigurationError("Username is required")

        if not api_token:
            raise ConfluenceConfigurationError("API token is required")

        # Normalize: ensure trailing slash before urljoin
        normalized_base = base_url.rstrip("/") + "/"
        self.base_url = urljoin(normalized_base, "rest/api/")

        self.username = username
        self.api_token = api_token
        self.timeout = timeout
        self.rate_limit_auto_wait = rate_limit_auto_wait
        self.max_retries = max_retries
        self.last_rate_limit: RateLimitInfo | None = None

        self._log: ILogger = logger or create_logger("confluence-api", __file__)

        self._client = httpx.AsyncClient(
            auth=(username, api_token),
            timeout=timeout,
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Atlassian-Token": "no-check",
            },
        )

        self._log.debug("AsyncConfluenceClient initialized", {"base_url": self.base_url})

    async def __aenter__(self) -> AsyncConfluenceClient:
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        await self.aclose()

    async def aclose(self) -> None:
        """Close the underlying async HTTP client."""
        await self._client.aclose()
        self._log.debug("AsyncConfluenceClient closed")

    async def _make_request(
        self,
        method: str,
        endpoint: str,
        params: dict[str, Any] | None = None,
        json_data: dict[str, Any] | Any | None = None,
        files: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Core async HTTP request method with error handling, rate-limit support, and retries.

        Args:
            method: HTTP method (GET, POST, PUT, DELETE, PATCH).
            endpoint: API endpoint relative to base_url (e.g. 'content/12345').
            params: Query parameters dict.
            json_data: JSON request body.
            files: Multipart file upload dict (httpx-compatible format).

        Returns:
            Parsed JSON response as dict, or empty dict for 204/empty responses.

        Raises:
            ConfluenceValidationError: On 400 responses.
            ConfluenceAuthenticationError: On 401 responses.
            ConfluencePermissionError: On 403 responses.
            ConfluenceNotFoundError: On 404 responses.
            ConfluenceConflictError: On 409 responses.
            ConfluenceRateLimitError: On 429 responses (if auto-wait is disabled).
            ConfluenceServerError: On 5xx responses after retries exhausted.
            ConfluenceNetworkError: On connection/DNS failures.
            ConfluenceTimeoutError: On request timeouts.
        """
        url = urljoin(self.base_url, endpoint)

        self._log.debug("request", {"method": method, "url": url, "params": params})

        retries_remaining = self.max_retries
        backoff_base = 1.0

        while True:
            try:
                # Build request kwargs
                request_kwargs: dict[str, Any] = {
                    "method": method,
                    "url": url,
                    "params": params,
                }

                if files is not None:
                    # Multipart upload: do NOT set Content-Type (httpx handles boundary)
                    request_kwargs["files"] = files
                    # Add form data if json_data is a dict (used for comment, minorEdit etc.)
                    if json_data is not None and isinstance(json_data, dict):
                        request_kwargs["data"] = json_data
                    # Remove Content-Type header for this request so httpx can set multipart boundary
                    headers = dict(self._client.headers)
                    headers.pop("Content-Type", None)
                    request_kwargs["headers"] = headers
                else:
                    request_kwargs["json"] = json_data

                response = await self._client.request(**request_kwargs)

            except httpx.TimeoutException as exc:
                raise ConfluenceTimeoutError(
                    f"Request timed out: {method} {url}",
                    url=url,
                    method=method,
                ) from exc
            except httpx.RequestError as exc:
                raise ConfluenceNetworkError(
                    f"Network error: {exc}",
                    url=url,
                    method=method,
                ) from exc

            status = response.status_code

            # --- Success ---
            if 200 <= status < 300:
                if status == 204 or not response.content:
                    return {}
                try:
                    return response.json()
                except Exception as exc:
                    raise ConfluenceAPIError(
                        f"Failed to parse response JSON: {exc}",
                        status_code=status,
                        url=url,
                        method=method,
                    ) from exc

            # --- Parse error body ---
            error_body: dict[str, Any] | None = None
            try:
                error_body = response.json()
            except Exception:
                error_body = None

            # --- Rate Limit (429) ---
            if status == 429:
                retry_after_raw = response.headers.get("Retry-After")
                retry_after: float | None = None
                if retry_after_raw:
                    try:
                        retry_after = float(retry_after_raw)
                    except (ValueError, TypeError):
                        retry_after = None

                self.last_rate_limit = RateLimitInfo(
                    retry_after=retry_after,
                    timestamp=time.time(),
                    endpoint=endpoint,
                )

                if self.rate_limit_auto_wait and retry_after is not None and retry_after > 0:
                    self._log.warning("rate limited, auto-waiting", {
                        "retry_after": retry_after,
                        "endpoint": endpoint,
                    })
                    await asyncio.sleep(retry_after)
                    continue

                raise ConfluenceRateLimitError(
                    _extract_error_message(error_body, status),
                    retry_after=retry_after,
                    response_data=error_body,
                    url=url,
                    method=method,
                )

            # --- Server Errors (5xx) with retry ---
            if status >= 500:
                if retries_remaining > 0:
                    retries_remaining -= 1
                    wait_time = backoff_base * (2 ** (self.max_retries - retries_remaining - 1))
                    self._log.warning("server error, retrying", {
                        "status": status,
                        "retries_remaining": retries_remaining,
                        "wait_seconds": wait_time,
                        "endpoint": endpoint,
                    })
                    await asyncio.sleep(wait_time)
                    backoff_base *= 1.0  # keep base stable, exponential via power
                    continue

                raise ConfluenceServerError(
                    _extract_error_message(error_body, status),
                    status_code=status,
                    response_data=error_body,
                    url=url,
                    method=method,
                )

            # --- Client Errors ---
            if status == 400:
                raise ConfluenceValidationError(
                    _extract_error_message(error_body, status),
                    response_data=error_body,
                    url=url,
                    method=method,
                )

            if status == 401:
                raise ConfluenceAuthenticationError(
                    _extract_error_message(error_body, status),
                    response_data=error_body,
                    url=url,
                    method=method,
                )

            if status == 403:
                raise ConfluencePermissionError(
                    _extract_error_message(error_body, status),
                    response_data=error_body,
                    url=url,
                    method=method,
                )

            if status == 404:
                raise ConfluenceNotFoundError(
                    _extract_error_message(error_body, status),
                    response_data=error_body,
                    url=url,
                    method=method,
                )

            if status == 409:
                raise ConfluenceConflictError(
                    _extract_error_message(error_body, status),
                    response_data=error_body,
                    url=url,
                    method=method,
                )

            # --- Catch-all for other 4xx ---
            raise ConfluenceAPIError(
                _extract_error_message(error_body, status),
                status_code=status,
                response_data=error_body,
                url=url,
                method=method,
            )

    async def get_raw(self, endpoint: str, params: dict[str, Any] | None = None) -> httpx.Response:
        """
        Perform an async GET request and return the raw httpx.Response (for binary downloads).

        Args:
            endpoint: API endpoint relative to base_url.
            params: Query parameters dict.

        Returns:
            Raw httpx.Response object.

        Raises:
            ConfluenceNetworkError: On connection failures.
            ConfluenceTimeoutError: On request timeout.
            ConfluenceAPIError: On non-2xx responses.
        """
        url = urljoin(self.base_url, endpoint)
        self._log.debug("get_raw request", {"url": url, "params": params})

        try:
            response = await self._client.request(method="GET", url=url, params=params)
        except httpx.TimeoutException as exc:
            raise ConfluenceTimeoutError(
                f"Request timed out: GET {url}",
                url=url,
                method="GET",
            ) from exc
        except httpx.RequestError as exc:
            raise ConfluenceNetworkError(
                f"Network error: {exc}",
                url=url,
                method="GET",
            ) from exc

        if response.status_code >= 400:
            error_body: dict[str, Any] | None = None
            try:
                error_body = response.json()
            except Exception:
                error_body = None
            raise create_error_from_response(
                status=response.status_code,
                body=error_body,
                url=url,
                method="GET",
            )

        return response

    # ── Convenience Methods ──────────────────────────────────────────────

    async def get(self, endpoint: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        """Perform an async GET request and return parsed JSON."""
        return await self._make_request("GET", endpoint, params=params)

    async def post(
        self,
        endpoint: str,
        json_data: dict[str, Any] | Any | None = None,
        params: dict[str, Any] | None = None,
        files: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Perform an async POST request and return parsed JSON."""
        return await self._make_request("POST", endpoint, params=params, json_data=json_data, files=files)

    async def put(
        self,
        endpoint: str,
        json_data: dict[str, Any] | Any | None = None,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Perform an async PUT request and return parsed JSON."""
        return await self._make_request("PUT", endpoint, params=params, json_data=json_data)

    async def delete(self, endpoint: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        """Perform an async DELETE request and return parsed JSON (or empty dict for 204)."""
        return await self._make_request("DELETE", endpoint, params=params)

    async def patch(
        self,
        endpoint: str,
        json_data: dict[str, Any] | Any | None = None,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Perform an async PATCH request and return parsed JSON."""
        return await self._make_request("PATCH", endpoint, params=params, json_data=json_data)
