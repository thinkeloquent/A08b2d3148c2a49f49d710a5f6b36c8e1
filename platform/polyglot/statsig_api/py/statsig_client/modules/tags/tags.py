"""Tags domain module for the Statsig Console API.

Provides async methods for managing tags used to organize and categorize
Statsig resources such as gates, experiments, and metrics.
"""

from __future__ import annotations

from typing import Any

from .logger import logger

__all__ = ["TagsModule"]

log = logger("statsig-tags", __file__)


class TagsModule:
    """Async wrapper around the ``/tags`` family of Statsig Console API endpoints.

    Attributes:
        client: The underlying :class:`StatsigClient` used for HTTP transport.
    """

    def __init__(self, client: Any) -> None:
        self.client = client

    # ------------------------------------------------------------------
    # CRUD
    # ------------------------------------------------------------------

    async def list(self, **options: Any) -> list:
        """List tags with automatic pagination.

        Args:
            **options: Query parameters forwarded to the API (e.g. ``limit``,
                ``page``).

        Returns:
            A list of tag objects.
        """
        log.debug("list tags", {"options": options})
        try:
            return await self.client.list("/tags", **options)
        except Exception as exc:
            log.error("failed to list tags", {"error": str(exc)})
            raise

    async def create(self, data: dict) -> dict:
        """Create a new tag.

        Args:
            data: Tag configuration payload (e.g. ``{"name": "core-metrics"}``).

        Returns:
            The newly created tag object.
        """
        log.debug("create tag", {"data_keys": list(data.keys())})
        try:
            return await self.client.post("/tags", json=data)
        except Exception as exc:
            log.error("failed to create tag", {"error": str(exc)})
            raise

    async def get(self, id: str) -> dict:
        """Retrieve a single tag by ID.

        Args:
            id: The tag identifier.

        Returns:
            The tag object.
        """
        log.debug("get tag", {"id": id})
        try:
            return await self.client.get(f"/tags/{id}")
        except Exception as exc:
            log.error("failed to get tag", {"id": id, "error": str(exc)})
            raise

    async def update(self, id: str, data: dict) -> dict:
        """Update a tag (PATCH).

        Args:
            id: The tag identifier.
            data: Fields to update.

        Returns:
            The updated tag object.
        """
        log.debug("update tag", {"id": id})
        try:
            return await self.client.patch(f"/tags/{id}", json=data)
        except Exception as exc:
            log.error("failed to update tag", {"id": id, "error": str(exc)})
            raise

    async def remove(self, id: str) -> dict:
        """Delete a tag.

        Args:
            id: The tag identifier.

        Returns:
            Confirmation payload from the API.
        """
        log.debug("remove tag", {"id": id})
        try:
            return await self.client.delete(f"/tags/{id}")
        except Exception as exc:
            log.error("failed to remove tag", {"id": id, "error": str(exc)})
            raise
