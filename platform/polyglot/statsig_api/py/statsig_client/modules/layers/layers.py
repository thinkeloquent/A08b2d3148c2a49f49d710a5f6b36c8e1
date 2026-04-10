"""Layers domain module for the Statsig Console API.

Provides async methods for managing layers, including CRUD operations,
experiment associations, and overrides.
"""

from __future__ import annotations

from typing import Any

from .logger import logger

__all__ = ["LayersModule"]

log = logger("statsig-layers", __file__)


class LayersModule:
    """Async wrapper around the ``/layers`` family of Statsig Console API endpoints.

    Attributes:
        client: The underlying :class:`StatsigClient` used for HTTP transport.
    """

    def __init__(self, client: Any) -> None:
        self.client = client

    # ------------------------------------------------------------------
    # CRUD
    # ------------------------------------------------------------------

    async def list(self, **options: Any) -> list:
        """List layers with automatic pagination.

        Args:
            **options: Query parameters forwarded to the API (e.g. ``limit``,
                ``page``, ``tags``).

        Returns:
            A list of layer objects.
        """
        log.debug("list layers", {"options": options})
        try:
            return await self.client.list("/layers", **options)
        except Exception as exc:
            log.error("failed to list layers", {"error": str(exc)})
            raise

    async def create(self, data: dict) -> dict:
        """Create a new layer.

        Args:
            data: Layer configuration payload.

        Returns:
            The newly created layer object.
        """
        log.debug("create layer", {"data_keys": list(data.keys())})
        try:
            return await self.client.post("/layers", json=data)
        except Exception as exc:
            log.error("failed to create layer", {"error": str(exc)})
            raise

    async def get(self, id: str) -> dict:
        """Retrieve a single layer by ID.

        Args:
            id: The layer identifier.

        Returns:
            The layer object.
        """
        log.debug("get layer", {"id": id})
        try:
            return await self.client.get(f"/layers/{id}")
        except Exception as exc:
            log.error("failed to get layer", {"id": id, "error": str(exc)})
            raise

    async def update(self, id: str, data: dict) -> dict:
        """Partially update a layer (PATCH).

        Args:
            id: The layer identifier.
            data: Fields to update.

        Returns:
            The updated layer object.
        """
        log.debug("update layer", {"id": id})
        try:
            return await self.client.patch(f"/layers/{id}", json=data)
        except Exception as exc:
            log.error("failed to update layer", {"id": id, "error": str(exc)})
            raise

    async def modify(self, id: str, data: dict) -> dict:
        """Modify a layer via POST.

        Args:
            id: The layer identifier.
            data: Modification payload.

        Returns:
            The modified layer object.
        """
        log.debug("modify layer", {"id": id})
        try:
            return await self.client.post(f"/layers/{id}", json=data)
        except Exception as exc:
            log.error("failed to modify layer", {"id": id, "error": str(exc)})
            raise

    async def remove(self, id: str) -> dict:
        """Delete a layer.

        Args:
            id: The layer identifier.

        Returns:
            Confirmation payload from the API.
        """
        log.debug("remove layer", {"id": id})
        try:
            return await self.client.delete(f"/layers/{id}")
        except Exception as exc:
            log.error("failed to remove layer", {"id": id, "error": str(exc)})
            raise

    # ------------------------------------------------------------------
    # Experiments / overrides
    # ------------------------------------------------------------------

    async def get_experiments(self, id: str) -> dict:
        """Retrieve experiments associated with a layer.

        Args:
            id: The layer identifier.

        Returns:
            Payload listing experiments in this layer.
        """
        log.debug("get_experiments layer", {"id": id})
        try:
            return await self.client.get(f"/layers/{id}/experiments")
        except Exception as exc:
            log.error("failed to get_experiments layer", {"id": id, "error": str(exc)})
            raise

    async def list_overrides(self, id: str) -> dict:
        """List overrides for a layer.

        Args:
            id: The layer identifier.

        Returns:
            Overrides list payload.
        """
        log.debug("list_overrides layer", {"id": id})
        try:
            return await self.client.get(f"/layers/{id}/overrides")
        except Exception as exc:
            log.error("failed to list_overrides layer", {"id": id, "error": str(exc)})
            raise

    async def create_override(self, id: str, data: dict) -> dict:
        """Create an override for a layer.

        Args:
            id: The layer identifier.
            data: Override specification.

        Returns:
            The created override object.
        """
        log.debug("create_override layer", {"id": id})
        try:
            return await self.client.post(f"/layers/{id}/overrides", json=data)
        except Exception as exc:
            log.error("failed to create_override layer", {"id": id, "error": str(exc)})
            raise
