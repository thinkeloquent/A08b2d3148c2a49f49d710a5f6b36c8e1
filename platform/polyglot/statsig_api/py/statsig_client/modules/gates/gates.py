"""Gates domain module for the Statsig Console API.

Provides async methods for managing feature gates, including CRUD operations,
rules, overrides, and enable/disable toggles.
"""

from __future__ import annotations

from typing import Any

from .logger import logger

__all__ = ["GatesModule"]

log = logger("statsig-gates", __file__)


class GatesModule:
    """Async wrapper around the ``/gates`` family of Statsig Console API endpoints.

    Attributes:
        client: The underlying :class:`StatsigClient` used for HTTP transport.
    """

    def __init__(self, client: Any) -> None:
        self.client = client

    # ------------------------------------------------------------------
    # CRUD
    # ------------------------------------------------------------------

    async def list(self, **options: Any) -> list:
        """List feature gates with automatic pagination."""
        log.debug("list gates", {"options": options})
        try:
            return await self.client.list("/gates", **options)
        except Exception as exc:
            log.error("failed to list gates", {"error": str(exc)})
            raise

    async def get(self, id: str) -> dict:
        """Retrieve a single feature gate by ID."""
        log.debug("get gate", {"id": id})
        try:
            return await self.client.get(f"/gates/{id}")
        except Exception as exc:
            log.error("failed to get gate", {"id": id, "error": str(exc)})
            raise

    async def create(self, data: dict) -> dict:
        """Create a new feature gate."""
        log.debug("create gate", {"data_keys": list(data.keys())})
        try:
            return await self.client.post("/gates", json=data)
        except Exception as exc:
            log.error("failed to create gate", {"error": str(exc)})
            raise

    async def update(self, id: str, data: dict) -> dict:
        """Fully update a feature gate (PUT)."""
        log.debug("update gate", {"id": id})
        try:
            return await self.client.put(f"/gates/{id}", json=data)
        except Exception as exc:
            log.error("failed to update gate", {"id": id, "error": str(exc)})
            raise

    async def patch(self, id: str, data: dict) -> dict:
        """Partially update a feature gate (PATCH)."""
        log.debug("patch gate", {"id": id})
        try:
            return await self.client.patch(f"/gates/{id}", json=data)
        except Exception as exc:
            log.error("failed to patch gate", {"id": id, "error": str(exc)})
            raise

    async def delete(self, id: str) -> dict:
        """Delete a feature gate."""
        log.debug("delete gate", {"id": id})
        try:
            return await self.client.delete(f"/gates/{id}")
        except Exception as exc:
            log.error("failed to delete gate", {"id": id, "error": str(exc)})
            raise

    # ------------------------------------------------------------------
    # Enable / Disable
    # ------------------------------------------------------------------

    async def enable(self, id: str) -> dict:
        """Enable a feature gate."""
        log.debug("enable gate", {"id": id})
        try:
            return await self.client.put(f"/gates/{id}/enable")
        except Exception as exc:
            log.error("failed to enable gate", {"id": id, "error": str(exc)})
            raise

    async def disable(self, id: str) -> dict:
        """Disable a feature gate."""
        log.debug("disable gate", {"id": id})
        try:
            return await self.client.put(f"/gates/{id}/disable")
        except Exception as exc:
            log.error("failed to disable gate", {"id": id, "error": str(exc)})
            raise

    # ------------------------------------------------------------------
    # Overrides
    # ------------------------------------------------------------------

    async def get_overrides(self, id: str) -> dict:
        """Retrieve gate overrides."""
        log.debug("get_overrides gate", {"id": id})
        try:
            return await self.client.get(f"/gates/{id}/overrides")
        except Exception as exc:
            log.error("failed to get_overrides gate", {"id": id, "error": str(exc)})
            raise

    async def update_overrides(self, id: str, data: dict) -> dict:
        """Update gate overrides."""
        log.debug("update_overrides gate", {"id": id})
        try:
            return await self.client.put(f"/gates/{id}/overrides", json=data)
        except Exception as exc:
            log.error("failed to update_overrides gate", {"id": id, "error": str(exc)})
            raise

    # ------------------------------------------------------------------
    # Rules
    # ------------------------------------------------------------------

    async def get_rules(self, id: str) -> list:
        """Retrieve rules for a feature gate."""
        log.debug("get_rules gate", {"id": id})
        try:
            return await self.client.get(f"/gates/{id}/rules")
        except Exception as exc:
            log.error("failed to get_rules gate", {"id": id, "error": str(exc)})
            raise

    async def update_rules(self, id: str, data: dict) -> dict:
        """Update rules for a feature gate."""
        log.debug("update_rules gate", {"id": id})
        try:
            return await self.client.put(f"/gates/{id}/rules", json=data)
        except Exception as exc:
            log.error("failed to update_rules gate", {"id": id, "error": str(exc)})
            raise

    # ------------------------------------------------------------------
    # Archival
    # ------------------------------------------------------------------

    async def archive(self, id: str) -> dict:
        """Archive a feature gate."""
        log.debug("archive gate", {"id": id})
        try:
            return await self.client.put(f"/gates/{id}/archive")
        except Exception as exc:
            log.error("failed to archive gate", {"id": id, "error": str(exc)})
            raise
