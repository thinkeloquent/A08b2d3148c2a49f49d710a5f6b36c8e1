"""
Pagination utilities for the Confluence Data Center REST API.

Supports two pagination strategies:
- Offset-based: standard /content, /space endpoints (start/limit/size)
- Cursor-based: /content/scan endpoint (cursor token in _links.next)
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from typing import Any

from confluence_api.logger import create_logger

log = create_logger("confluence-api", __file__)


async def paginate_offset(
    client: Any,
    endpoint: str,
    params: dict[str, Any] | None = None,
    start: int = 0,
    limit: int = 25,
) -> AsyncIterator[dict[str, Any]]:
    """
    Async generator that yields individual items from offset-based paginated endpoints.

    Confluence offset pagination uses:
        - start: 0-based offset
        - limit: page size
        - size: number of results in current page
        - results: array of items

    The generator automatically fetches subsequent pages until all results are consumed.

    Args:
        client: ConfluenceClient instance (must have .get() method).
        endpoint: API endpoint path (e.g. 'content', 'space').
        params: Additional query parameters to include in each request.
        start: Initial offset (default 0).
        limit: Page size (default 25, Confluence max is typically 250).

    Yields:
        Individual result dicts from each page.
    """
    current_start = start
    base_params = dict(params) if params else {}

    while True:
        page_params = {**base_params, "start": current_start, "limit": limit}
        log.debug("paginate_offset fetching page", {"endpoint": endpoint, "start": current_start, "limit": limit})

        response = client.get(endpoint, params=page_params)

        results: list[dict[str, Any]] = response.get("results", [])
        if not results:
            break

        for item in results:
            yield item

        # Check if there are more pages
        page_size = response.get("size", len(results))
        total_size = response.get("totalSize")

        # If the page returned fewer items than the limit, we are done
        if page_size < limit:
            break

        # If we know total size and have fetched everything, stop
        if total_size is not None and (current_start + page_size) >= total_size:
            break

        # Also check _links.next — Confluence includes it when more pages exist
        links = response.get("_links", {})
        if not links.get("next"):
            break

        current_start += page_size


async def paginate_cursor(
    client: Any,
    endpoint: str,
    params: dict[str, Any] | None = None,
    limit: int = 25,
) -> AsyncIterator[dict[str, Any]]:
    """
    Async generator that yields individual items from cursor-based paginated endpoints.

    Used by /content/scan which returns a cursor token in _links.next rather than
    offset-based navigation. This is more efficient for large result sets.

    Args:
        client: ConfluenceClient instance (must have .get() method).
        endpoint: API endpoint path (e.g. 'content/scan').
        params: Additional query parameters to include in each request.
        limit: Page size (default 25).

    Yields:
        Individual result dicts from each page.
    """
    base_params = dict(params) if params else {}
    cursor: str | None = None

    while True:
        page_params = {**base_params, "limit": limit}
        if cursor is not None:
            page_params["cursor"] = cursor

        log.debug("paginate_cursor fetching page", {"endpoint": endpoint, "cursor": cursor, "limit": limit})

        response = client.get(endpoint, params=page_params)

        results: list[dict[str, Any]] = response.get("results", [])
        if not results:
            break

        for item in results:
            yield item

        # Extract cursor from _links.next
        links = response.get("_links", {})
        next_link: str | None = links.get("next")

        if not next_link:
            break

        # Parse cursor from the next URL query string
        cursor = _extract_cursor(next_link)
        if cursor is None:
            break


def _extract_cursor(next_link: str) -> str | None:
    """
    Extract the cursor parameter from a Confluence _links.next URL.

    The next link is typically a relative URL like:
        /rest/api/content/scan?cursor=...&limit=25

    Args:
        next_link: The next URL from _links.next.

    Returns:
        The cursor value, or None if not found.
    """
    from urllib.parse import parse_qs, urlparse

    try:
        parsed = urlparse(next_link)
        qs = parse_qs(parsed.query)
        cursor_values = qs.get("cursor", [])
        return cursor_values[0] if cursor_values else None
    except Exception:
        log.warning("failed to extract cursor from next link", {"next_link": next_link})
        return None


def build_expand(fields: list[str]) -> str:
    """
    Build an expand parameter value by joining field names with commas.

    Confluence uses the ?expand= query parameter to request additional data
    in responses. Multiple fields are comma-separated.

    Args:
        fields: List of field names to expand (e.g. ['body.storage', 'version', 'ancestors']).

    Returns:
        Comma-separated string suitable for the expand parameter.

    Example:
        >>> build_expand(['body.storage', 'version', 'ancestors'])
        'body.storage,version,ancestors'
    """
    return ",".join(fields)
