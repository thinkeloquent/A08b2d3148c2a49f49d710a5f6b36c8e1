"""
Platform Module — Sauce Labs API Client

Check service status and supported configurations.

Endpoints:
    GET /rest/v1/info/status                        - Service status
    GET /rest/v1/info/platforms/{automation_api}     - Supported platforms
"""

from __future__ import annotations

from typing import Any

from ..errors import SaucelabsValidationError
from ..logger import create_logger
from ..types import AUTOMATION_API_VALUES

log = create_logger("saucelabs_api", "platform")


class PlatformModule:
    """Query Sauce Labs platform status and capabilities."""

    def __init__(self, client: Any) -> None:
        self._client = client
        self._logger = log

    async def get_status(self) -> dict[str, Any]:
        """Get current Sauce Labs service status (public, no auth required)."""
        self._logger.debug("checking service status")
        return await self._client.get("/rest/v1/info/status")

    async def get_platforms(self, automation_api: str = "all") -> list[dict[str, Any]]:
        """Get supported platforms filtered by automation backend.

        Parameters
        ----------
        automation_api:
            Filter: 'all', 'appium', or 'webdriver'.
        """
        if automation_api not in AUTOMATION_API_VALUES:
            raise SaucelabsValidationError(
                f"automation_api must be one of: {', '.join(AUTOMATION_API_VALUES)} — got '{automation_api}'"
            )

        self._logger.debug("getting platforms", {"automation_api": automation_api})
        return await self._client.get(f"/rest/v1/info/platforms/{automation_api}")
