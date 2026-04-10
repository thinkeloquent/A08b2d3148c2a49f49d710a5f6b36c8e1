"""
Response processing hooks for GitHub API responses.

These hooks extract metadata from httpx.Response objects for use
by the SDK client and middleware layers.
"""

from __future__ import annotations

from typing import Any

import httpx

from github_api.sdk.rate_limit import RateLimitInfo, parse_rate_limit_headers

__all__ = [
    "response_204_hook",
    "json_fallback_hook",
    "request_id_hook",
    "rate_limit_hook",
]


def response_204_hook(response: httpx.Response) -> dict[str, Any]:
    """Handle 204 No Content responses by returning an empty dict.

    Args:
        response: The httpx response object.

    Returns:
        Empty dict for 204 responses, or None for other status codes.
    """
    if response.status_code == 204:
        return {}
    return {}


def json_fallback_hook(response: httpx.Response) -> dict[str, Any]:
    """Safely parse JSON from a response, falling back to text wrapper.

    Args:
        response: The httpx response object.

    Returns:
        Parsed JSON dict, or {"data": text} on parse failure.
    """
    try:
        data = response.json()
        if isinstance(data, dict):
            return data
        return {"data": data}
    except Exception:
        text = response.text
        return {"data": text} if text else {}


def request_id_hook(response: httpx.Response) -> str | None:
    """Extract the x-github-request-id header from a response.

    Args:
        response: The httpx response object.

    Returns:
        The request ID string, or None if not present.
    """
    return response.headers.get("x-github-request-id")


def rate_limit_hook(response: httpx.Response) -> RateLimitInfo | None:
    """Extract rate limit information from response headers.

    Args:
        response: The httpx response object.

    Returns:
        RateLimitInfo if rate limit headers are present, None otherwise.
    """
    return parse_rate_limit_headers(response.headers)
