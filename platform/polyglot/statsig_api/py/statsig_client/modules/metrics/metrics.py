"""Metrics domain module for the Statsig Console API.

Provides async methods for managing metrics, including CRUD operations,
SQL definitions, experiment associations, archival, metric sources, and values.
"""

from __future__ import annotations

from typing import Any

from .logger import logger

__all__ = ["MetricsModule"]

log = logger("statsig-metrics", __file__)


class MetricsModule:
    """Async wrapper around the ``/metrics`` family of Statsig Console API endpoints.

    Attributes:
        client: The underlying :class:`StatsigClient` used for HTTP transport.
    """

    def __init__(self, client: Any) -> None:
        self.client = client

    # ------------------------------------------------------------------
    # CRUD
    # ------------------------------------------------------------------

    async def get(self, id: str, date: str) -> dict:
        """Retrieve a metric by ID for a given date.

        Args:
            id: The metric identifier.
            date: Date string for which to retrieve the metric value (YYYY-MM-DD).

        Returns:
            The metric object with values for the specified date.
        """
        log.debug("get metric", {"id": id, "date": date})
        try:
            return await self.client.get(f"/metrics/{id}", params={"date": date})
        except Exception as exc:
            log.error("failed to get metric", {"id": id, "date": date, "error": str(exc)})
            raise

    async def create(self, data: dict) -> dict:
        """Create a new metric definition.

        Args:
            data: Metric configuration payload.

        Returns:
            The newly created metric object.
        """
        log.debug("create metric", {"data_keys": list(data.keys())})
        try:
            return await self.client.post("/metrics", json=data)
        except Exception as exc:
            log.error("failed to create metric", {"error": str(exc)})
            raise

    async def list(self, **options: Any) -> list:
        """List metrics with automatic pagination.

        Args:
            **options: Query parameters forwarded to the API (e.g. ``limit``,
                ``page``, ``tags``, ``type``).

        Returns:
            A list of metric objects.
        """
        log.debug("list metrics", {"options": options})
        try:
            return await self.client.list("/metrics", **options)
        except Exception as exc:
            log.error("failed to list metrics", {"error": str(exc)})
            raise

    async def get_by_id(self, id: str) -> dict:
        """Retrieve a metric by its unique identifier (without date filter).

        Args:
            id: The metric identifier.

        Returns:
            The metric object.
        """
        log.debug("get_by_id metric", {"id": id})
        try:
            return await self.client.get(f"/metrics/{id}")
        except Exception as exc:
            log.error("failed to get_by_id metric", {"id": id, "error": str(exc)})
            raise

    async def modify(self, id: str, data: dict) -> dict:
        """Modify an existing metric via POST.

        Args:
            id: The metric identifier.
            data: Modification payload.

        Returns:
            The modified metric object.
        """
        log.debug("modify metric", {"id": id})
        try:
            return await self.client.post(f"/metrics/{id}", json=data)
        except Exception as exc:
            log.error("failed to modify metric", {"id": id, "error": str(exc)})
            raise

    async def remove(self, id: str) -> dict:
        """Delete a metric.

        Args:
            id: The metric identifier.

        Returns:
            Confirmation payload from the API.
        """
        log.debug("remove metric", {"id": id})
        try:
            return await self.client.delete(f"/metrics/{id}")
        except Exception as exc:
            log.error("failed to remove metric", {"id": id, "error": str(exc)})
            raise

    # ------------------------------------------------------------------
    # Experiments / SQL / reload
    # ------------------------------------------------------------------

    async def get_experiments(self, id: str) -> dict:
        """Retrieve experiments associated with a metric.

        Args:
            id: The metric identifier.

        Returns:
            Payload listing associated experiments.
        """
        log.debug("get_experiments metric", {"id": id})
        try:
            return await self.client.get(f"/metrics/{id}/experiments")
        except Exception as exc:
            log.error("failed to get_experiments metric", {"id": id, "error": str(exc)})
            raise

    async def get_sql(self, id: str) -> dict:
        """Retrieve the SQL definition for a metric.

        Args:
            id: The metric identifier.

        Returns:
            The SQL definition payload.
        """
        log.debug("get_sql metric", {"id": id})
        try:
            return await self.client.get(f"/metrics/{id}/sql")
        except Exception as exc:
            log.error("failed to get_sql metric", {"id": id, "error": str(exc)})
            raise

    async def reload(self, id: str) -> dict:
        """Trigger a reload of a metric's data pipeline.

        Args:
            id: The metric identifier.

        Returns:
            Confirmation payload from the API.
        """
        log.debug("reload metric", {"id": id})
        try:
            return await self.client.post(f"/metrics/{id}/reload")
        except Exception as exc:
            log.error("failed to reload metric", {"id": id, "error": str(exc)})
            raise

    # ------------------------------------------------------------------
    # Archival
    # ------------------------------------------------------------------

    async def schedule_archive(self, id: str) -> dict:
        """Schedule a metric for archival.

        Args:
            id: The metric identifier.

        Returns:
            Confirmation payload with archive schedule.
        """
        log.debug("schedule_archive metric", {"id": id})
        try:
            return await self.client.put(f"/metrics/{id}/schedule_archive")
        except Exception as exc:
            log.error("failed to schedule_archive metric", {"id": id, "error": str(exc)})
            raise

    async def cancel_archive(self, id: str) -> dict:
        """Cancel a pending metric archival.

        Args:
            id: The metric identifier.

        Returns:
            Confirmation payload.
        """
        log.debug("cancel_archive metric", {"id": id})
        try:
            return await self.client.put(f"/metrics/{id}/cancel_archive")
        except Exception as exc:
            log.error("failed to cancel_archive metric", {"id": id, "error": str(exc)})
            raise

    async def unarchive(self, id: str) -> dict:
        """Unarchive a previously archived metric.

        Args:
            id: The metric identifier.

        Returns:
            Updated metric object.
        """
        log.debug("unarchive metric", {"id": id})
        try:
            return await self.client.put(f"/metrics/{id}/unarchive")
        except Exception as exc:
            log.error("failed to unarchive metric", {"id": id, "error": str(exc)})
            raise

    # ------------------------------------------------------------------
    # Name + type lookup
    # ------------------------------------------------------------------

    async def get_by_name_and_type(self, name: str, type: str) -> dict:
        """Retrieve a metric by its name and type.

        Args:
            name: The metric name.
            type: The metric type (e.g. ``"event_count"``, ``"ratio"``).

        Returns:
            The matching metric object.
        """
        log.debug("get_by_name_and_type metric", {"name": name, "type": type})
        try:
            return await self.client.get(f"/metrics/{name}/{type}")
        except Exception as exc:
            log.error("failed to get_by_name_and_type metric", {"name": name, "type": type, "error": str(exc)})
            raise

    # ------------------------------------------------------------------
    # Metric sources
    # ------------------------------------------------------------------

    async def create_source(self, data: dict) -> dict:
        """Create a new metric source.

        Args:
            data: Metric source configuration payload.

        Returns:
            The created metric source object.
        """
        log.debug("create_source metric", {"data_keys": list(data.keys())})
        try:
            return await self.client.post("/metrics/sources", json=data)
        except Exception as exc:
            log.error("failed to create_source metric", {"error": str(exc)})
            raise

    async def get_source(self, name: str) -> dict:
        """Retrieve a specific metric source by name.

        Args:
            name: The metric source name.

        Returns:
            The metric source object.
        """
        log.debug("get_source metric", {"name": name})
        try:
            return await self.client.get(f"/metrics/sources/{name}")
        except Exception as exc:
            log.error("failed to get_source metric", {"name": name, "error": str(exc)})
            raise

    async def update_source(self, name: str, data: dict) -> dict:
        """Update an existing metric source.

        Args:
            name: The metric source name.
            data: Fields to update.

        Returns:
            The updated metric source object.
        """
        log.debug("update_source metric", {"name": name})
        try:
            return await self.client.patch(f"/metrics/sources/{name}", json=data)
        except Exception as exc:
            log.error("failed to update_source metric", {"name": name, "error": str(exc)})
            raise

    async def delete_source(self, name: str) -> dict:
        """Delete a metric source.

        Args:
            name: The metric source name.

        Returns:
            Confirmation payload from the API.
        """
        log.debug("delete_source metric", {"name": name})
        try:
            return await self.client.delete(f"/metrics/sources/{name}")
        except Exception as exc:
            log.error("failed to delete_source metric", {"name": name, "error": str(exc)})
            raise

    async def list_source_metrics(self, name: str) -> dict:
        """List all metrics derived from a specific source.

        Args:
            name: The metric source name.

        Returns:
            Payload listing metrics from the source.
        """
        log.debug("list_source_metrics metric", {"name": name})
        try:
            return await self.client.get(f"/metrics/sources/{name}/metrics")
        except Exception as exc:
            log.error("failed to list_source_metrics metric", {"name": name, "error": str(exc)})
            raise

    async def list_sources(self, **options: Any) -> list:
        """List all metric sources.

        Args:
            **options: Optional query parameters.

        Returns:
            A list of metric source objects.
        """
        log.debug("list_sources metrics", {"options": options})
        try:
            return await self.client.get("/metrics/sources", params=options or None)
        except Exception as exc:
            log.error("failed to list_sources metrics", {"error": str(exc)})
            raise

    async def get_values(self, **options: Any) -> dict:
        """Retrieve aggregated metric values.

        Args:
            **options: Query parameters such as date ranges and metric filters.

        Returns:
            Aggregated metric values payload.
        """
        log.debug("get_values metrics", {"options": options})
        try:
            return await self.client.get("/metrics/values", params=options or None)
        except Exception as exc:
            log.error("failed to get_values metrics", {"error": str(exc)})
            raise
