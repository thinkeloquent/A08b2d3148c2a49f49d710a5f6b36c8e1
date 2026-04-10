"""
Search service for Confluence Data Center REST API v9.2.3.

Provides CQL-based content search, site-wide search, and content scanning.
"""

from __future__ import annotations

from typing import Any

from confluence_api.logger import create_logger

log = create_logger("confluence_api", __file__)


class SearchService:
    """Service for Confluence search operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    def search_content(
        self,
        cql: str,
        cqlcontext: str | None = None,
        expand: str | None = None,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """
        Search content using CQL via the content search endpoint.

        GET /rest/api/content/search

        Args:
            cql: Confluence Query Language string.
            cqlcontext: Optional CQL context (JSON-encoded string for space/content scope).
            expand: Comma-separated list of properties to expand.
            start: Pagination start index.
            limit: Maximum number of results to return.

        Returns:
            Search results dict with results array and pagination info.
        """
        log.debug("search_content called", {
            "cql": cql,
            "cqlcontext": cqlcontext,
            "expand": expand,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"cql": cql, "start": start, "limit": limit}
        if cqlcontext is not None:
            params["cqlcontext"] = cqlcontext
        if expand is not None:
            params["expand"] = expand
        result = self._client.get("content/search", params=params)
        log.info("search_content succeeded", {"cql": cql, "start": start, "limit": limit})
        return result

    def search(
        self,
        cql: str,
        cqlcontext: str | None = None,
        excerpt: str | None = None,
        expand: str | None = None,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """
        Perform a site-wide search using CQL.

        GET /rest/api/search

        Args:
            cql: Confluence Query Language string.
            cqlcontext: Optional CQL context for scoping the search.
            excerpt: Excerpt strategy (highlight, indexed, none).
            expand: Comma-separated list of properties to expand.
            start: Pagination start index.
            limit: Maximum number of results to return.

        Returns:
            Search results dict with results array and pagination info.
        """
        log.debug("search called", {
            "cql": cql,
            "cqlcontext": cqlcontext,
            "excerpt": excerpt,
            "expand": expand,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"cql": cql, "start": start, "limit": limit}
        if cqlcontext is not None:
            params["cqlcontext"] = cqlcontext
        if excerpt is not None:
            params["excerpt"] = excerpt
        if expand is not None:
            params["expand"] = expand
        result = self._client.get("search", params=params)
        log.info("search succeeded", {"cql": cql, "start": start, "limit": limit})
        return result

    def scan_content(self, cursor: str | None = None, limit: int = 25) -> dict:
        """
        Scan content using cursor-based pagination.

        GET /rest/api/content/scan

        This endpoint is optimized for retrieving large volumes of content
        without the overhead of offset-based pagination.

        Args:
            cursor: Opaque cursor string from a previous scan response.
            limit: Maximum number of results per page.

        Returns:
            Scan results dict with content array and next cursor.
        """
        log.debug("scan_content called", {"cursor": cursor, "limit": limit})
        params: dict[str, Any] = {"limit": limit}
        if cursor is not None:
            params["cursor"] = cursor
        result = self._client.get("content/scan", params=params)
        log.info("scan_content succeeded", {"limit": limit})
        return result


class AsyncSearchService:
    """Async service for Confluence search operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    async def search_content(
        self,
        cql: str,
        cqlcontext: str | None = None,
        expand: str | None = None,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """
        Search content using CQL via the content search endpoint.

        GET /rest/api/content/search
        """
        log.debug("search_content called", {
            "cql": cql,
            "cqlcontext": cqlcontext,
            "expand": expand,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"cql": cql, "start": start, "limit": limit}
        if cqlcontext is not None:
            params["cqlcontext"] = cqlcontext
        if expand is not None:
            params["expand"] = expand
        result = await self._client.get("content/search", params=params)
        log.info("search_content succeeded", {"cql": cql, "start": start, "limit": limit})
        return result

    async def search(
        self,
        cql: str,
        cqlcontext: str | None = None,
        excerpt: str | None = None,
        expand: str | None = None,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """
        Perform a site-wide search using CQL.

        GET /rest/api/search
        """
        log.debug("search called", {
            "cql": cql,
            "cqlcontext": cqlcontext,
            "excerpt": excerpt,
            "expand": expand,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"cql": cql, "start": start, "limit": limit}
        if cqlcontext is not None:
            params["cqlcontext"] = cqlcontext
        if excerpt is not None:
            params["excerpt"] = excerpt
        if expand is not None:
            params["expand"] = expand
        result = await self._client.get("search", params=params)
        log.info("search succeeded", {"cql": cql, "start": start, "limit": limit})
        return result

    async def scan_content(self, cursor: str | None = None, limit: int = 25) -> dict:
        """
        Scan content using cursor-based pagination.

        GET /rest/api/content/scan
        """
        log.debug("scan_content called", {"cursor": cursor, "limit": limit})
        params: dict[str, Any] = {"limit": limit}
        if cursor is not None:
            params["cursor"] = cursor
        result = await self._client.get("content/scan", params=params)
        log.info("scan_content succeeded", {"limit": limit})
        return result
