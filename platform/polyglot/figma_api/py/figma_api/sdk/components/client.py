"""
Components Module — Figma API SDK

Wraps component, component set, and style retrieval endpoints.
"""
from typing import Any, Dict, List, Optional

from ...logger import create_logger

log = create_logger("figma-api", __file__)


class ComponentsClient:
    """Client for Figma Components, Component Sets, and Styles API endpoints."""

    def __init__(self, client, *, logger=None):
        self._client = client
        self._log = logger or log

    async def get_component(self, key: str) -> Dict[str, Any]:
        """Get a component by key.

        GET /v1/components/{key}
        """
        self._log.info("fetching component", key=key)
        result = await self._client.get(f"/v1/components/{key}")
        self._log.debug(
            "component fetched",
            key=key,
            name=result.get("meta", {}).get("name"),
        )
        return result

    async def get_file_components(self, file_key: str) -> Dict[str, Any]:
        """Get all components in a file.

        GET /v1/files/{file_key}/components
        """
        self._log.info("fetching file components", file_key=file_key)
        result = await self._client.get(f"/v1/files/{file_key}/components")
        component_count = len(result.get("meta", {}).get("components", []))
        self._log.debug(
            "file components fetched",
            file_key=file_key,
            component_count=component_count,
        )
        return result

    async def get_team_components(
        self,
        team_id: str,
        *,
        page_size: Optional[int] = None,
        cursor: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get published components for a team.

        GET /v1/teams/{team_id}/components
        """
        self._log.info(
            "fetching team components",
            team_id=team_id,
            page_size=page_size,
        )
        params: Dict[str, Any] = {}
        if page_size is not None:
            params["page_size"] = page_size
        if cursor is not None:
            params["after"] = cursor

        result = await self._client.get(
            f"/v1/teams/{team_id}/components", params=params or None
        )
        component_count = len(result.get("meta", {}).get("components", []))
        self._log.debug(
            "team components fetched",
            team_id=team_id,
            component_count=component_count,
        )
        return result

    async def get_component_set(self, key: str) -> Dict[str, Any]:
        """Get a component set by key.

        GET /v1/component_sets/{key}
        """
        self._log.info("fetching component set", key=key)
        result = await self._client.get(f"/v1/component_sets/{key}")
        self._log.debug(
            "component set fetched",
            key=key,
            name=result.get("meta", {}).get("name"),
        )
        return result

    async def get_team_component_sets(
        self,
        team_id: str,
        *,
        page_size: Optional[int] = None,
        cursor: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get published component sets for a team.

        GET /v1/teams/{team_id}/component_sets
        """
        self._log.info(
            "fetching team component sets",
            team_id=team_id,
            page_size=page_size,
        )
        params: Dict[str, Any] = {}
        if page_size is not None:
            params["page_size"] = page_size
        if cursor is not None:
            params["after"] = cursor

        result = await self._client.get(
            f"/v1/teams/{team_id}/component_sets", params=params or None
        )
        set_count = len(result.get("meta", {}).get("component_sets", []))
        self._log.debug(
            "team component sets fetched",
            team_id=team_id,
            set_count=set_count,
        )
        return result

    async def get_team_styles(
        self,
        team_id: str,
        *,
        page_size: Optional[int] = None,
        cursor: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get published styles for a team.

        GET /v1/teams/{team_id}/styles
        """
        self._log.info(
            "fetching team styles",
            team_id=team_id,
            page_size=page_size,
        )
        params: Dict[str, Any] = {}
        if page_size is not None:
            params["page_size"] = page_size
        if cursor is not None:
            params["after"] = cursor

        result = await self._client.get(
            f"/v1/teams/{team_id}/styles", params=params or None
        )
        style_count = len(result.get("meta", {}).get("styles", []))
        self._log.debug(
            "team styles fetched",
            team_id=team_id,
            style_count=style_count,
        )
        return result

    async def get_style(self, key: str) -> Dict[str, Any]:
        """Get a style by key.

        GET /v1/styles/{key}
        """
        self._log.info("fetching style", key=key)
        result = await self._client.get(f"/v1/styles/{key}")
        self._log.debug(
            "style fetched",
            key=key,
            name=result.get("meta", {}).get("name"),
        )
        return result
