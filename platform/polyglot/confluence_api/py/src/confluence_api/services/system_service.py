"""
System service for Confluence Data Center REST API v9.2.3.

Provides operations for retrieving server information, instance metrics,
access mode, and long-running task management.
"""

from __future__ import annotations

from typing import Any

from confluence_api.logger import create_logger

log = create_logger("confluence_api", __file__)


class SystemService:
    """Service for Confluence system operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    def get_server_info(self) -> dict:
        """Retrieve Confluence server information (version, build number, etc.)."""
        log.debug("get_server_info called")
        result = self._client.get("settings/systemInfo")
        log.info("get_server_info succeeded")
        return result

    def get_instance_metrics(self) -> dict:
        """Retrieve instance-level metrics."""
        log.debug("get_instance_metrics called")
        result = self._client.get("settings/metrics")
        log.info("get_instance_metrics succeeded")
        return result

    def get_access_mode(self) -> dict:
        """Retrieve the current access mode of the Confluence instance."""
        log.debug("get_access_mode called")
        result = self._client.get("accessmode")
        log.info("get_access_mode succeeded")
        return result

    def get_long_task(self, task_id: str) -> dict:
        """Retrieve the status of a specific long-running task."""
        log.debug("get_long_task called", {"task_id": task_id})
        result = self._client.get(f"longtask/{task_id}")
        log.info("get_long_task succeeded", {"task_id": task_id})
        return result

    def get_long_tasks(self, start: int = 0, limit: int = 25) -> dict:
        """Retrieve a paginated list of long-running tasks."""
        log.debug("get_long_tasks called", {"start": start, "limit": limit})
        params: dict[str, Any] = {"start": start, "limit": limit}
        result = self._client.get("longtask", params=params)
        log.info("get_long_tasks succeeded", {"start": start, "limit": limit})
        return result


class AsyncSystemService:
    """Async service for Confluence system operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    async def get_server_info(self) -> dict:
        """Retrieve Confluence server information (version, build number, etc.)."""
        log.debug("get_server_info called")
        result = await self._client.get("settings/systemInfo")
        log.info("get_server_info succeeded")
        return result

    async def get_instance_metrics(self) -> dict:
        """Retrieve instance-level metrics."""
        log.debug("get_instance_metrics called")
        result = await self._client.get("settings/metrics")
        log.info("get_instance_metrics succeeded")
        return result

    async def get_access_mode(self) -> dict:
        """Retrieve the current access mode of the Confluence instance."""
        log.debug("get_access_mode called")
        result = await self._client.get("accessmode")
        log.info("get_access_mode succeeded")
        return result

    async def get_long_task(self, task_id: str) -> dict:
        """Retrieve the status of a specific long-running task."""
        log.debug("get_long_task called", {"task_id": task_id})
        result = await self._client.get(f"longtask/{task_id}")
        log.info("get_long_task succeeded", {"task_id": task_id})
        return result

    async def get_long_tasks(self, start: int = 0, limit: int = 25) -> dict:
        """Retrieve a paginated list of long-running tasks."""
        log.debug("get_long_tasks called", {"start": start, "limit": limit})
        params: dict[str, Any] = {"start": start, "limit": limit}
        result = await self._client.get("longtask", params=params)
        log.info("get_long_tasks succeeded", {"start": start, "limit": limit})
        return result
