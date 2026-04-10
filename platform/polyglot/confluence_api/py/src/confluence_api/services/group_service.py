"""
Group service for Confluence Data Center REST API v9.2.3.

Provides operations for retrieving groups and group members.
"""

from __future__ import annotations

from typing import Any

from confluence_api.logger import create_logger

log = create_logger("confluence_api", __file__)


class GroupService:
    """Service for Confluence group operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    def get_group(self, group_name: str) -> dict:
        """Retrieve a single group by name."""
        log.debug("get_group called", {"group_name": group_name})
        result = self._client.get(f"group/{group_name}")
        log.info("get_group succeeded", {"group_name": group_name})
        return result

    def get_groups(self, start: int = 0, limit: int = 25) -> dict:
        """Retrieve a paginated list of groups."""
        log.debug("get_groups called", {"start": start, "limit": limit})
        params: dict[str, Any] = {"start": start, "limit": limit}
        result = self._client.get("group", params=params)
        log.info("get_groups succeeded", {"start": start, "limit": limit})
        return result

    def get_group_members(
        self,
        group_name: str,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """Retrieve a paginated list of members in a group."""
        log.debug("get_group_members called", {
            "group_name": group_name,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"start": start, "limit": limit}
        result = self._client.get(f"group/{group_name}/member", params=params)
        log.info("get_group_members succeeded", {"group_name": group_name})
        return result


class AsyncGroupService:
    """Async service for Confluence group operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    async def get_group(self, group_name: str) -> dict:
        """Retrieve a single group by name."""
        log.debug("get_group called", {"group_name": group_name})
        result = await self._client.get(f"group/{group_name}")
        log.info("get_group succeeded", {"group_name": group_name})
        return result

    async def get_groups(self, start: int = 0, limit: int = 25) -> dict:
        """Retrieve a paginated list of groups."""
        log.debug("get_groups called", {"start": start, "limit": limit})
        params: dict[str, Any] = {"start": start, "limit": limit}
        result = await self._client.get("group", params=params)
        log.info("get_groups succeeded", {"start": start, "limit": limit})
        return result

    async def get_group_members(
        self,
        group_name: str,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """Retrieve a paginated list of members in a group."""
        log.debug("get_group_members called", {
            "group_name": group_name,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"start": start, "limit": limit}
        result = await self._client.get(f"group/{group_name}/member", params=params)
        log.info("get_group_members succeeded", {"group_name": group_name})
        return result
