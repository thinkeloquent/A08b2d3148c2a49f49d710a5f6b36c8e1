"""Experiments domain module for the Statsig Console API.

Provides async methods for managing experiments, including CRUD operations,
lifecycle transitions, overrides, and assignment sources.
"""

from __future__ import annotations

from typing import Any

from .logger import logger

__all__ = ["ExperimentsModule"]

log = logger("statsig-experiments", __file__)


class ExperimentsModule:
    """Async wrapper around the ``/experiments`` family of Statsig Console API endpoints.

    Attributes:
        client: The underlying :class:`StatsigClient` used for HTTP transport.
    """

    def __init__(self, client: Any) -> None:
        self.client = client

    # ------------------------------------------------------------------
    # CRUD
    # ------------------------------------------------------------------

    async def list(self, **options: Any) -> list:
        """List experiments with automatic pagination."""
        log.debug("list experiments", {"options": options})
        try:
            return await self.client.list("/experiments", **options)
        except Exception as exc:
            log.error("failed to list experiments", {"error": str(exc)})
            raise

    async def get(self, id: str) -> dict:
        """Retrieve a single experiment by ID."""
        log.debug("get experiment", {"id": id})
        try:
            return await self.client.get(f"/experiments/{id}")
        except Exception as exc:
            log.error("failed to get experiment", {"id": id, "error": str(exc)})
            raise

    async def create(self, data: dict) -> dict:
        """Create a new experiment."""
        log.debug("create experiment", {"data_keys": list(data.keys())})
        try:
            return await self.client.post("/experiments", json=data)
        except Exception as exc:
            log.error("failed to create experiment", {"error": str(exc)})
            raise

    async def update(self, id: str, data: dict) -> dict:
        """Fully update an experiment (PUT)."""
        log.debug("update experiment", {"id": id})
        try:
            return await self.client.put(f"/experiments/{id}", json=data)
        except Exception as exc:
            log.error("failed to update experiment", {"id": id, "error": str(exc)})
            raise

    async def patch(self, id: str, data: dict) -> dict:
        """Partially update an experiment (PATCH)."""
        log.debug("patch experiment", {"id": id})
        try:
            return await self.client.patch(f"/experiments/{id}", json=data)
        except Exception as exc:
            log.error("failed to patch experiment", {"id": id, "error": str(exc)})
            raise

    async def delete(self, id: str) -> dict:
        """Delete an experiment."""
        log.debug("delete experiment", {"id": id})
        try:
            return await self.client.delete(f"/experiments/{id}")
        except Exception as exc:
            log.error("failed to delete experiment", {"id": id, "error": str(exc)})
            raise

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def start(self, id: str) -> dict:
        """Start an experiment."""
        log.debug("start experiment", {"id": id})
        try:
            return await self.client.post(f"/experiments/{id}/start")
        except Exception as exc:
            log.error("failed to start experiment", {"id": id, "error": str(exc)})
            raise

    async def make_decision(self, id: str, data: dict) -> dict:
        """Ship or abandon an experiment (make decision)."""
        log.debug("make_decision experiment", {"id": id})
        try:
            return await self.client.post(f"/experiments/{id}/make_decision", json=data)
        except Exception as exc:
            log.error("failed to make_decision experiment", {"id": id, "error": str(exc)})
            raise

    async def reset(self, id: str) -> dict:
        """Reset an experiment."""
        log.debug("reset experiment", {"id": id})
        try:
            return await self.client.post(f"/experiments/{id}/reset")
        except Exception as exc:
            log.error("failed to reset experiment", {"id": id, "error": str(exc)})
            raise

    async def archive(self, id: str) -> dict:
        """Archive an experiment."""
        log.debug("archive experiment", {"id": id})
        try:
            return await self.client.put(f"/experiments/{id}/archive")
        except Exception as exc:
            log.error("failed to archive experiment", {"id": id, "error": str(exc)})
            raise

    # ------------------------------------------------------------------
    # Overrides
    # ------------------------------------------------------------------

    async def get_overrides(self, id: str) -> dict:
        """Retrieve experiment overrides."""
        log.debug("get_overrides experiment", {"id": id})
        try:
            return await self.client.get(f"/experiments/{id}/overrides")
        except Exception as exc:
            log.error("failed to get_overrides experiment", {"id": id, "error": str(exc)})
            raise

    async def update_overrides(self, id: str, data: dict) -> dict:
        """Update experiment overrides."""
        log.debug("update_overrides experiment", {"id": id})
        try:
            return await self.client.put(f"/experiments/{id}/overrides", json=data)
        except Exception as exc:
            log.error("failed to update_overrides experiment", {"id": id, "error": str(exc)})
            raise

    # ------------------------------------------------------------------
    # Pulse results
    # ------------------------------------------------------------------

    async def pulse_results(self, id: str, **options: Any) -> dict:
        """Retrieve pulse (metric lift) results for an experiment."""
        log.debug("pulse_results experiment", {"id": id, "options": options})
        try:
            return await self.client.get(f"/experiments/{id}/pulse_results", params=options or None)
        except Exception as exc:
            log.error("failed to pulse_results experiment", {"id": id, "error": str(exc)})
            raise

    # ------------------------------------------------------------------
    # Assignment sources
    # ------------------------------------------------------------------

    async def get_assignment_source(self, id: str) -> dict:
        """Retrieve the assignment source for an experiment."""
        log.debug("get_assignment_source experiment", {"id": id})
        try:
            return await self.client.get(f"/experiments/{id}/assignment_source")
        except Exception as exc:
            log.error("failed to get_assignment_source experiment", {"id": id, "error": str(exc)})
            raise
