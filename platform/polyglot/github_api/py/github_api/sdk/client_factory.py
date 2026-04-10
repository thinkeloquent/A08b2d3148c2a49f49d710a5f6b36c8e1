"""Factory for creating the HTTP client used by GitHubClient."""

from __future__ import annotations

import fetch_httpx


def create_http_client(
    *,
    base_url: str,
    token: str,
    accept: str,
    api_version: str,
    user_agent: str = "github-api-sdk-python/1.0.0",
    timeout: float = 30.0,
) -> fetch_httpx.AsyncClient:
    """Create a configured AsyncClient for GitHub API requests.

    Args:
        base_url: GitHub API base URL.
        token: Bearer token for authentication.
        accept: Accept header value.
        api_version: X-GitHub-Api-Version header value.
        user_agent: User-Agent header value.
        timeout: Request timeout in seconds.

    Returns:
        A configured fetch_httpx.AsyncClient instance.
    """
    return fetch_httpx.AsyncClient(
        base_url=base_url,
        headers={
            "Accept": accept,
            "Authorization": f"Bearer {token}",
            "X-GitHub-Api-Version": api_version,
            "User-Agent": user_agent,
        },
        timeout=fetch_httpx.Timeout(timeout),
    )
