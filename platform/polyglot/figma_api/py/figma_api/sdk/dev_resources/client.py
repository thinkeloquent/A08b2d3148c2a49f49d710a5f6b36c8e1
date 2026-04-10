"""
Dev Resources Module — Figma API SDK

Wraps developer resource CRUD endpoints for files.
"""
from typing import Any, Dict, List, Optional

from ...logger import create_logger

log = create_logger("figma-api", __file__)


class DevResourcesClient:
    """Client for Figma Dev Resources API endpoints."""

    def __init__(self, client, *, logger=None):
        self._client = client
        self._log = logger or log

    async def list_dev_resources(
        self,
        file_key: str,
        *,
        node_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """List dev resources for a file.

        GET /v1/files/{file_key}/dev_resources
        """
        self._log.info(
            "listing dev resources",
            file_key=file_key,
            node_id=node_id,
        )
        params: Dict[str, Any] = {}
        if node_id is not None:
            params["node_id"] = node_id

        result = await self._client.get(
            f"/v1/files/{file_key}/dev_resources", params=params or None
        )
        resource_count = len(result.get("dev_resources", []))
        self._log.debug(
            "dev resources listed",
            file_key=file_key,
            resource_count=resource_count,
        )
        return result

    async def create_dev_resources(
        self,
        file_key: str,
        dev_resources: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Create dev resources in a file.

        POST /v1/files/{file_key}/dev_resources
        """
        self._log.info(
            "creating dev resources",
            file_key=file_key,
            count=len(dev_resources),
        )
        body = {"dev_resources": dev_resources}
        result = await self._client.post(
            f"/v1/files/{file_key}/dev_resources", body
        )
        self._log.debug(
            "dev resources created",
            file_key=file_key,
        )
        return result

    async def update_dev_resources(
        self,
        file_key: str,
        dev_resources: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Update dev resources in a file.

        PUT /v1/files/{file_key}/dev_resources
        """
        self._log.info(
            "updating dev resources",
            file_key=file_key,
            count=len(dev_resources),
        )
        body = {"dev_resources": dev_resources}
        result = await self._client.put(
            f"/v1/files/{file_key}/dev_resources", body
        )
        self._log.debug(
            "dev resources updated",
            file_key=file_key,
        )
        return result

    async def delete_dev_resource(
        self,
        file_key: str,
        dev_resource_id: str,
    ) -> Dict[str, Any]:
        """Delete a dev resource from a file.

        DELETE /v1/files/{file_key}/dev_resources/{dev_resource_id}
        """
        self._log.info(
            "deleting dev resource",
            file_key=file_key,
            dev_resource_id=dev_resource_id,
        )
        result = await self._client.delete(
            f"/v1/files/{file_key}/dev_resources/{dev_resource_id}"
        )
        self._log.debug(
            "dev resource deleted",
            file_key=file_key,
            dev_resource_id=dev_resource_id,
        )
        return result
