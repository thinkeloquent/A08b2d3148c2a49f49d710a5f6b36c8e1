"""
GitHub Code Search Endpoint

Paginated /search/code with custom iteration for the search API
response shape ({ total_count, incomplete_results, items }).

Forks are excluded by default. Results capped at 1000 (10 pages x 100).
"""

from __future__ import annotations

import logging
from typing import Any, AsyncIterator

from github_api.sdk.client import GitHubClient

__all__ = ["search_code", "build_search_query"]

PER_PAGE = 100

logger = logging.getLogger("github_sdk_api_component_usage_audit.sdk.code_search")


async def search_code(
    client: GitHubClient,
    *,
    component_name: str,
    max_pages: int = 10,
    min_file_size: int = 1000,
) -> AsyncIterator[dict[str, Any]]:
    """Search GitHub code for component import patterns.

    Args:
        client: Authenticated GitHubClient instance.
        component_name: Component name to search for.
        max_pages: Maximum pages to fetch (1-10).
        min_file_size: Minimum file size filter.

    Yields:
        Individual search result items.
    """
    query = build_search_query(component_name, min_file_size)
    logger.info("Searching: %s", query)
    logger.info("Max pages: %d (%d results max)", max_pages, max_pages * PER_PAGE)

    for page in range(1, max_pages + 1):
        logger.info("Fetching page %d/%d...", page, max_pages)

        data = await client.get(
            "/search/code",
            params={
                "q": query,
                "per_page": PER_PAGE,
                "page": page,
            },
        )

        items = data.get("items", [])
        if not items:
            logger.info("No more results after page %d", page - 1)
            return

        for item in items:
            yield item

        # Stop if we've fetched all available results
        if len(items) < PER_PAGE:
            logger.info("All results fetched (%d page%s)", page, "s" if page > 1 else "")
            return


def build_search_query(component_name: str, min_file_size: int) -> str:
    """Build the GitHub code search query string.

    Args:
        component_name: Component name to search for.
        min_file_size: Minimum file size in bytes.

    Returns:
        Formatted search query.
    """
    import_pattern = f'"import {{ {component_name} }}"'
    return f"{import_pattern} extension:tsx extension:jsx size:>{min_file_size}"
