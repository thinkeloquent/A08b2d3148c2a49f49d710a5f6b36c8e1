"""Events domain module for the Statsig Console API.

Provides async methods for listing events, retrieving event details,
and fetching metrics associated with a specific event.
"""

from __future__ import annotations

from typing import Any
from urllib.parse import quote

from .logger import logger

__all__ = ["EventsModule"]

log = logger("statsig-events", __file__)


class EventsModule:
    """Async wrapper around the ``/events`` family of Statsig Console API endpoints.

    Attributes:
        client: The underlying :class:`StatsigClient` used for HTTP transport.
    """

    def __init__(self, client: Any) -> None:
        self.client = client

    # ------------------------------------------------------------------
    # Endpoints
    # ------------------------------------------------------------------

    async def list(self, **options: Any) -> list:
        """List events with automatic pagination.

        Args:
            **options: Query parameters forwarded to the API (e.g. ``limit``,
                ``page``).

        Returns:
            A list of event objects.
        """
        log.debug("list events", {"options": options})
        try:
            return await self.client.list("/events", **options)
        except Exception as exc:
            log.error("failed to list events", {"error": str(exc)})
            raise

    async def get(self, event_name: str) -> dict:
        """Retrieve a single event by name.

        The *event_name* is URL-encoded before inclusion in the request path
        to handle special characters safely.

        Args:
            event_name: The event name (will be URL-encoded).

        Returns:
            The event object.
        """
        encoded_name = quote(event_name, safe="")
        log.debug("get event", {"event_name": event_name, "encoded": encoded_name})
        try:
            return await self.client.get(f"/events/{encoded_name}")
        except Exception as exc:
            log.error("failed to get event", {"event_name": event_name, "error": str(exc)})
            raise

    async def get_metrics(self, event_name: str) -> dict:
        """Retrieve metrics associated with a specific event.

        The *event_name* is URL-encoded before inclusion in the request path
        to handle special characters safely.

        Args:
            event_name: The event name (will be URL-encoded).

        Returns:
            Payload listing metrics derived from or associated with the event.
        """
        encoded_name = quote(event_name, safe="")
        log.debug("get_metrics event", {"event_name": event_name, "encoded": encoded_name})
        try:
            return await self.client.get(f"/events/{encoded_name}/metrics")
        except Exception as exc:
            log.error("failed to get_metrics event", {"event_name": event_name, "error": str(exc)})
            raise
