"""
Label service for Confluence Data Center REST API v9.2.3.

Provides operations for retrieving related labels and recently used labels.
"""

from __future__ import annotations

from typing import Any

from confluence_api.logger import create_logger

log = create_logger("confluence_api", __file__)


class LabelService:
    """Service for Confluence label operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    def get_related_labels(self, label_name: str) -> dict:
        """Retrieve labels related to a given label."""
        log.debug("get_related_labels called", {"label_name": label_name})
        result = self._client.get(f"label/{label_name}/related")
        log.info("get_related_labels succeeded", {"label_name": label_name})
        return result

    def get_recent_labels(self) -> dict:
        """Retrieve recently used labels."""
        log.debug("get_recent_labels called")
        result = self._client.get("label/recent")
        log.info("get_recent_labels succeeded")
        return result


class AsyncLabelService:
    """Async service for Confluence label operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    async def get_related_labels(self, label_name: str) -> dict:
        """Retrieve labels related to a given label."""
        log.debug("get_related_labels called", {"label_name": label_name})
        result = await self._client.get(f"label/{label_name}/related")
        log.info("get_related_labels succeeded", {"label_name": label_name})
        return result

    async def get_recent_labels(self) -> dict:
        """Retrieve recently used labels."""
        log.debug("get_recent_labels called")
        result = await self._client.get("label/recent")
        log.info("get_recent_labels succeeded")
        return result
