"""
Library Analytics Module — Figma API SDK

Wraps library analytics actions and usages endpoints.
"""
from typing import Any, Dict, List, Optional

from ...logger import create_logger

log = create_logger("figma-api", __file__)


class LibraryAnalyticsClient:
    """Client for Figma Library Analytics API endpoints."""

    def __init__(self, client, *, logger=None):
        self._client = client
        self._log = logger or log

    async def get_actions(
        self,
        team_id: str,
        *,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        group_by: Optional[str] = None,
        order: Optional[str] = None,
        cursor: Optional[str] = None,
        page_size: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Get library analytics actions for a team.

        GET /v1/analytics/libraries/{team_id}/actions
        """
        self._log.info(
            "fetching library analytics actions",
            team_id=team_id,
            start_date=start_date,
            end_date=end_date,
        )
        params: Dict[str, Any] = {}
        if start_date is not None:
            params["start_date"] = start_date
        if end_date is not None:
            params["end_date"] = end_date
        if group_by is not None:
            params["group_by"] = group_by
        if order is not None:
            params["order"] = order
        if cursor is not None:
            params["cursor"] = cursor
        if page_size is not None:
            params["page_size"] = page_size

        result = await self._client.get(
            f"/v1/analytics/libraries/{team_id}/actions",
            params=params or None,
        )
        row_count = len(result.get("rows", []))
        self._log.debug(
            "library analytics actions fetched",
            team_id=team_id,
            row_count=row_count,
        )
        return result

    async def get_usages(
        self,
        team_id: str,
        *,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        group_by: Optional[str] = None,
        order: Optional[str] = None,
        cursor: Optional[str] = None,
        page_size: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Get library analytics usages for a team.

        GET /v1/analytics/libraries/{team_id}/usages
        """
        self._log.info(
            "fetching library analytics usages",
            team_id=team_id,
            start_date=start_date,
            end_date=end_date,
        )
        params: Dict[str, Any] = {}
        if start_date is not None:
            params["start_date"] = start_date
        if end_date is not None:
            params["end_date"] = end_date
        if group_by is not None:
            params["group_by"] = group_by
        if order is not None:
            params["order"] = order
        if cursor is not None:
            params["cursor"] = cursor
        if page_size is not None:
            params["page_size"] = page_size

        result = await self._client.get(
            f"/v1/analytics/libraries/{team_id}/usages",
            params=params or None,
        )
        row_count = len(result.get("rows", []))
        self._log.debug(
            "library analytics usages fetched",
            team_id=team_id,
            row_count=row_count,
        )
        return result
