"""
Raw Content Endpoint

Fetches file contents using the raw media type header
(application/vnd.github.v3.raw) to avoid Base64 encoding overhead.

Uses client._http.get() directly to override the default Accept header.
"""

from __future__ import annotations

import logging

from github_api.sdk.client import GitHubClient

__all__ = ["fetch_raw_content"]

logger = logging.getLogger("github_sdk_api_component_usage_audit.sdk.raw_content")

RAW_ACCEPT = "application/vnd.github.v3.raw"


async def fetch_raw_content(
    client: GitHubClient,
    *,
    owner: str,
    repo: str,
    path: str,
    ref: str | None = None,
) -> str:
    """Fetch raw file content from GitHub.

    Args:
        client: Authenticated GitHubClient instance.
        owner: Repository owner.
        repo: Repository name.
        path: File path within the repository.
        ref: Git ref (branch, tag, SHA). Defaults to default branch.

    Returns:
        Raw file content as a string.
    """
    url = f"/repos/{owner}/{repo}/contents/{path}"
    params = {}
    if ref:
        params["ref"] = ref

    # Go through the underlying HTTP client to override the Accept header
    response = await client._http.get(
        url,
        params=params if params else None,
        headers={"Accept": RAW_ACCEPT},
    )

    logger.debug("raw-content: %s/%s/%s length=%d", owner, repo, path, len(response.text))

    if response.status_code >= 400:
        from github_api.sdk.errors import map_response_to_error

        body = response.json() if response.headers.get("content-type", "").startswith("application/json") else {}
        raise map_response_to_error(response.status_code, body, dict(response.headers))

    return response.text
