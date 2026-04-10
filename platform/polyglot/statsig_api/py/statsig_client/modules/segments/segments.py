"""Segments domain module for the Statsig Console API.

Provides async methods for managing segments, including CRUD operations,
ID list management, conditional rules, and archival.
"""

from __future__ import annotations

from typing import Any

from .logger import logger

__all__ = ["SegmentsModule"]

log = logger("statsig-segments", __file__)


class SegmentsModule:
    """Async wrapper around the ``/segments`` family of Statsig Console API endpoints.

    Attributes:
        client: The underlying :class:`StatsigClient` used for HTTP transport.
    """

    def __init__(self, client: Any) -> None:
        self.client = client

    # ------------------------------------------------------------------
    # CRUD
    # ------------------------------------------------------------------

    async def list(self, **options: Any) -> list:
        """List segments with automatic pagination.

        Args:
            **options: Query parameters forwarded to the API (e.g. ``limit``,
                ``page``, ``tags``).

        Returns:
            A list of segment objects.
        """
        log.debug("list segments", {"options": options})
        try:
            return await self.client.list("/segments", **options)
        except Exception as exc:
            log.error("failed to list segments", {"error": str(exc)})
            raise

    async def create(self, data: dict) -> dict:
        """Create a new segment.

        Args:
            data: Segment configuration payload.

        Returns:
            The newly created segment object.
        """
        log.debug("create segment", {"data_keys": list(data.keys())})
        try:
            return await self.client.post("/segments", json=data)
        except Exception as exc:
            log.error("failed to create segment", {"error": str(exc)})
            raise

    async def get(self, id: str) -> dict:
        """Retrieve a single segment by ID.

        Args:
            id: The segment identifier.

        Returns:
            The segment object.
        """
        log.debug("get segment", {"id": id})
        try:
            return await self.client.get(f"/segments/{id}")
        except Exception as exc:
            log.error("failed to get segment", {"id": id, "error": str(exc)})
            raise

    async def update(self, id: str, data: dict) -> dict:
        """Partially update a segment (PATCH).

        Args:
            id: The segment identifier.
            data: Fields to update.

        Returns:
            The updated segment object.
        """
        log.debug("update segment", {"id": id})
        try:
            return await self.client.patch(f"/segments/{id}", json=data)
        except Exception as exc:
            log.error("failed to update segment", {"id": id, "error": str(exc)})
            raise

    async def modify(self, id: str, data: dict) -> dict:
        """Modify a segment via POST.

        Args:
            id: The segment identifier.
            data: Modification payload.

        Returns:
            The modified segment object.
        """
        log.debug("modify segment", {"id": id})
        try:
            return await self.client.post(f"/segments/{id}", json=data)
        except Exception as exc:
            log.error("failed to modify segment", {"id": id, "error": str(exc)})
            raise

    async def remove(self, id: str) -> dict:
        """Delete a segment.

        Args:
            id: The segment identifier.

        Returns:
            Confirmation payload from the API.
        """
        log.debug("remove segment", {"id": id})
        try:
            return await self.client.delete(f"/segments/{id}")
        except Exception as exc:
            log.error("failed to remove segment", {"id": id, "error": str(exc)})
            raise

    # ------------------------------------------------------------------
    # ID list management
    # ------------------------------------------------------------------

    async def get_id_list(self, id: str) -> dict:
        """Retrieve the ID list for a segment.

        Args:
            id: The segment identifier.

        Returns:
            The ID list payload.
        """
        log.debug("get_id_list segment", {"id": id})
        try:
            return await self.client.get(f"/segments/{id}/id_list")
        except Exception as exc:
            log.error("failed to get_id_list segment", {"id": id, "error": str(exc)})
            raise

    async def add_ids(self, id: str, data: dict) -> dict:
        """Add IDs to a segment's ID list.

        Args:
            id: The segment identifier.
            data: Payload containing IDs to add (e.g. ``{"ids": ["u1", "u2"]}``).

        Returns:
            Confirmation payload from the API.
        """
        log.debug("add_ids segment", {"id": id})
        try:
            return await self.client.post(f"/segments/{id}/id_list/add", json=data)
        except Exception as exc:
            log.error("failed to add_ids segment", {"id": id, "error": str(exc)})
            raise

    async def remove_ids(self, id: str, data: dict) -> dict:
        """Remove IDs from a segment's ID list.

        Args:
            id: The segment identifier.
            data: Payload containing IDs to remove (e.g. ``{"ids": ["u1", "u2"]}``).

        Returns:
            Confirmation payload from the API.
        """
        log.debug("remove_ids segment", {"id": id})
        try:
            return await self.client.post(f"/segments/{id}/id_list/remove", json=data)
        except Exception as exc:
            log.error("failed to remove_ids segment", {"id": id, "error": str(exc)})
            raise

    async def reset_id_list(self, id: str) -> dict:
        """Reset (clear) the entire ID list for a segment.

        Args:
            id: The segment identifier.

        Returns:
            Confirmation payload from the API.
        """
        log.debug("reset_id_list segment", {"id": id})
        try:
            return await self.client.post(f"/segments/{id}/id_list/reset")
        except Exception as exc:
            log.error("failed to reset_id_list segment", {"id": id, "error": str(exc)})
            raise

    # ------------------------------------------------------------------
    # Conditional rules / archival
    # ------------------------------------------------------------------

    async def update_conditional(self, id: str, data: dict) -> dict:
        """Update the conditional rules for a segment.

        Args:
            id: The segment identifier.
            data: Conditional rule configuration payload.

        Returns:
            Updated segment object with new conditional rules.
        """
        log.debug("update_conditional segment", {"id": id})
        try:
            return await self.client.patch(f"/segments/{id}/conditional", json=data)
        except Exception as exc:
            log.error("failed to update_conditional segment", {"id": id, "error": str(exc)})
            raise

    async def archive(self, id: str) -> dict:
        """Archive a segment.

        Args:
            id: The segment identifier.

        Returns:
            Updated segment object.
        """
        log.debug("archive segment", {"id": id})
        try:
            return await self.client.put(f"/segments/{id}/archive")
        except Exception as exc:
            log.error("failed to archive segment", {"id": id, "error": str(exc)})
            raise
