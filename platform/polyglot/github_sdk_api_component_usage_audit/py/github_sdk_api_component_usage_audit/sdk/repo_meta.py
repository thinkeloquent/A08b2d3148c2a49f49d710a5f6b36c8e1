"""
Repository Metadata Endpoint

Fetches /repos/{owner}/{repo} with an in-memory cache keyed by "owner/repo".
Validates stargazers_count and archived status.
"""

from __future__ import annotations

import logging
from typing import Any

from github_api.sdk.client import GitHubClient

__all__ = ["fetch_repo_meta"]

logger = logging.getLogger("github_sdk_api_component_usage_audit.sdk.repo_meta")


async def fetch_repo_meta(
    client: GitHubClient,
    *,
    owner: str,
    repo: str,
    min_stars: int,
    cache: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    """Fetch and validate repository metadata.

    Args:
        client: Authenticated GitHubClient instance.
        owner: Repository owner.
        repo: Repository name.
        min_stars: Minimum stargazer count.
        cache: In-memory cache dict keyed by "owner/repo".

    Returns:
        Dict with ``valid`` bool and optional ``repo`` data.
    """
    cache_key = f"{owner}/{repo}"

    if cache_key in cache:
        return cache[cache_key]

    data = await client.get(f"/repos/{owner}/{repo}")

    logger.debug(
        "repo-meta: %s/%s stars=%d archived=%s",
        owner,
        repo,
        data.get("stargazers_count", 0),
        data.get("archived", False),
    )

    valid = (
        data.get("stargazers_count", 0) >= min_stars
        and data.get("archived") is False
    )

    result = {"valid": valid, "repo": data}
    cache[cache_key] = result

    return result
