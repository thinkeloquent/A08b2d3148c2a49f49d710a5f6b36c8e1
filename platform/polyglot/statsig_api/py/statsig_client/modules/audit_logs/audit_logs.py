"""Audit logs domain module for the Statsig Console API.

Provides async methods for listing audit log entries that record changes
made to Statsig resources.
"""

from __future__ import annotations

from typing import Any

from .logger import logger

__all__ = ["AuditLogsModule"]

log = logger("statsig-audit_logs", __file__)


class AuditLogsModule:
    """Async wrapper around the ``/audit_logs`` endpoint of the Statsig Console API.

    Attributes:
        client: The underlying :class:`StatsigClient` used for HTTP transport.
    """

    def __init__(self, client: Any) -> None:
        self.client = client

    async def list(self, **options: Any) -> list:
        """List audit log entries with automatic pagination.

        Args:
            **options: Query parameters forwarded to the API.  Common keys
                include ``limit``, ``page``, ``startDate``, ``endDate``,
                ``entityType``, and ``action``.

        Returns:
            A list of audit log entry objects.
        """
        log.debug("list audit_logs", {"options": options})
        try:
            return await self.client.list("/audit_logs", **options)
        except Exception as exc:
            log.error("failed to list audit_logs", {"error": str(exc)})
            raise
