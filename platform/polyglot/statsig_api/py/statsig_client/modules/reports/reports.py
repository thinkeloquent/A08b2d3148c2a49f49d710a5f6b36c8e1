"""Reports domain module for the Statsig Console API.

Provides async methods for retrieving Statsig reports by type and date.
"""

from __future__ import annotations

import re
from typing import Any

from .logger import logger

__all__ = ["ReportsModule"]

log = logger("statsig-reports", __file__)

_VALID_REPORT_TYPES: frozenset[str] = frozenset({
    "first_exposures",
    "pulse",
    "warehouse_native",
})
"""Supported report type enum values."""

_DATE_PATTERN: re.Pattern[str] = re.compile(r"^\d{4}-\d{2}-\d{2}$")
"""Expected date format: YYYY-MM-DD."""


class ReportsModule:
    """Async wrapper around the ``/reports`` endpoint of the Statsig Console API.

    Attributes:
        client: The underlying :class:`StatsigClient` used for HTTP transport.
    """

    def __init__(self, client: Any) -> None:
        self.client = client

    async def list(self, **options: Any) -> list:
        """List reports with automatic pagination.

        Args:
            **options: Query parameters forwarded to the API (e.g. ``limit``,
                ``page``).

        Returns:
            A list of report objects.
        """
        log.debug("list reports", {"options": options})
        try:
            return await self.client.list("/reports", **options)
        except Exception as exc:
            log.error("failed to list reports", {"error": str(exc)})
            raise

    async def get(self, type: str, date: str) -> dict:
        """Retrieve a report by type and date.

        Args:
            type: The report type.  Must be one of ``"first_exposures"``,
                ``"pulse"``, or ``"warehouse_native"``.
            date: The report date in ``YYYY-MM-DD`` format.

        Returns:
            The report payload.

        Raises:
            ValueError: If *type* is not a recognized report type or *date*
                does not match the ``YYYY-MM-DD`` format.
        """
        if type not in _VALID_REPORT_TYPES:
            raise ValueError(
                f"Invalid report type {type!r}. "
                f"Must be one of: {', '.join(sorted(_VALID_REPORT_TYPES))}"
            )
        if not _DATE_PATTERN.match(date):
            raise ValueError(
                f"Invalid date format {date!r}. Expected YYYY-MM-DD."
            )

        log.debug("get report", {"type": type, "date": date})
        try:
            return await self.client.get(f"/reports/{type}", params={"date": date})
        except Exception as exc:
            log.error("failed to get report", {"type": type, "date": date, "error": str(exc)})
            raise
