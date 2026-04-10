"""
GitHub API pagination utilities.

Follows Link header rel="next" to traverse paginated API responses,
with configurable page limits and parameter forwarding.
"""

from __future__ import annotations

import re
from typing import TYPE_CHECKING, Any, AsyncGenerator

if TYPE_CHECKING:
    from github_api.sdk.client import GitHubClient

__all__ = [
    "paginate",
    "paginate_all",
]

_LINK_NEXT_RE = re.compile(r'<([^>]+)>;\s*rel="next"')
_DEFAULT_MAX_PAGES = 1000


async def paginate(
    client: GitHubClient,
    path: str,
    *,
    params: dict[str, Any] | None = None,
    per_page: int = 100,
    max_pages: int = _DEFAULT_MAX_PAGES,
) -> AsyncGenerator[list[Any], None]:
    """Async generator that yields pages of results from a paginated endpoint.

    Follows the Link header rel="next" URL to fetch subsequent pages.

    Args:
        client: GitHubClient instance for making requests.
        path: API endpoint path (e.g., '/repos/{owner}/{repo}/issues').
        params: Additional query parameters.
        per_page: Number of items per page (max 100).
        max_pages: Maximum number of pages to fetch (default 1000).

    Yields:
        Lists of items from each page.
    """
    params = dict(params or {})
    params["per_page"] = min(per_page, 100)

    current_url: str | None = path
    page_count = 0

    while current_url and page_count < max_pages:
        response = await client.get_raw(current_url, params=params if page_count == 0 else None)
        page_count += 1

        data = response.json()
        if isinstance(data, list):
            if not data:
                break
            yield data
        else:
            yield [data]

        # Parse Link header for next page
        link_header = response.headers.get("link", "")
        match = _LINK_NEXT_RE.search(link_header)
        if match:
            current_url = match.group(1)
            # Next URL is absolute — clear params so we don't double-apply them
            params = {}
        else:
            current_url = None


async def paginate_all(
    client: GitHubClient,
    path: str,
    *,
    params: dict[str, Any] | None = None,
    per_page: int = 100,
    max_pages: int = _DEFAULT_MAX_PAGES,
) -> list[Any]:
    """Collect all items from a paginated endpoint into a single list.

    Args:
        client: GitHubClient instance for making requests.
        path: API endpoint path.
        params: Additional query parameters.
        per_page: Number of items per page (max 100).
        max_pages: Maximum number of pages to fetch (default 1000).

    Returns:
        A flat list of all items across all pages.
    """
    items: list[Any] = []
    async for page in paginate(
        client,
        path,
        params=params,
        per_page=per_page,
        max_pages=max_pages,
    ):
        items.extend(page)
    return items
