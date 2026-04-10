"""
Auto-pagination utilities for the Statsig Console API.

The API returns paginated responses with a ``pagination.nextPage`` field
containing the full URL of the next page.  These helpers abstract away the
cursor chasing so callers receive a clean async stream of records.
"""

from __future__ import annotations

from typing import Any, AsyncGenerator, TYPE_CHECKING
from urllib.parse import urlparse

from .logger import create_logger

if TYPE_CHECKING:
    from .client import StatsigClient


_logger = create_logger("statsig_client", "pagination")


def _extract_relative_path(url: str, base_url: str) -> str:
    """Convert an absolute ``nextPage`` URL into a path relative to *base_url*.

    If *url* is already relative it is returned unchanged.

    Examples
    --------
    >>> _extract_relative_path(
    ...     "https://statsigapi.net/console/v1/gates?page=2",
    ...     "https://statsigapi.net/console/v1",
    ... )
    '/gates?page=2'
    """
    if url.startswith("http://") or url.startswith("https://"):
        parsed = urlparse(url)
        path = parsed.path
        if parsed.query:
            path = f"{path}?{parsed.query}"
        # Strip the base URL path prefix so we get a relative resource path.
        base_path = urlparse(base_url).path.rstrip("/")
        if path.startswith(base_path):
            path = path[len(base_path):]
        return path
    return url


async def paginate(
    client: StatsigClient,
    path: str,
    **options: Any,
) -> AsyncGenerator[list[Any], None]:
    """Async generator that yields each page's ``data`` list.

    Parameters
    ----------
    client:
        An initialised :class:`~statsig_client.client.StatsigClient`.
    path:
        The initial API resource path (e.g. ``"/gates"``).
    **options:
        Extra keyword arguments forwarded to ``client.get`` as ``params``.

    Yields
    ------
    list[Any]
        The ``data`` array from each successive page.
    """
    params: dict[str, Any] = dict(options.get("params", {})) if "params" in options else {}
    headers: dict[str, str] | None = options.get("headers")
    current_path: str | None = path

    page_number = 0
    while current_path is not None:
        page_number += 1
        _logger.debug(f"Fetching page {page_number}", {"path": current_path})

        response = await client.get(current_path, params=params if page_number == 1 else None, headers=headers)

        data = response.get("data", []) if isinstance(response, dict) else []
        yield data

        # Follow pagination link if present.
        pagination = response.get("pagination", {}) if isinstance(response, dict) else {}
        next_page_url: str | None = pagination.get("nextPage")

        if next_page_url:
            current_path = _extract_relative_path(next_page_url, client._base_url)
        else:
            current_path = None


async def list_all(
    client: StatsigClient,
    path: str,
    **options: Any,
) -> list[Any]:
    """Convenience wrapper that collects every page into a single flat list.

    Parameters
    ----------
    client:
        An initialised :class:`~statsig_client.client.StatsigClient`.
    path:
        The initial API resource path.
    **options:
        Forwarded to :func:`paginate`.

    Returns
    -------
    list[Any]
        All records from all pages concatenated.
    """
    items: list[Any] = []
    async for page_data in paginate(client, path, **options):
        items.extend(page_data)
    return items
