"""
Users Module — Sauce Labs API Client

Retrieve user account details and concurrency/usage statistics.

Endpoints:
    GET /rest/v1.2/users/{username}              - User info
    GET /rest/v1.2/users/{username}/concurrency   - Concurrency stats
"""

from __future__ import annotations

from typing import Any

from ..errors import SaucelabsValidationError
from ..logger import create_logger

log = create_logger("saucelabs_api", "users")


class UsersModule:
    """Retrieve Sauce Labs user info and usage statistics."""

    def __init__(self, client: Any) -> None:
        self._client = client
        self._logger = log

    async def get_user(self, username: str | None = None) -> dict[str, Any]:
        """Get user account information.

        Parameters
        ----------
        username:
            Username to query. Defaults to the configured username.
        """
        user = username or self._client.username
        if not user:
            raise SaucelabsValidationError("username is required to get user info")

        self._logger.debug("getting user info", {"username": user})
        return await self._client.get(f"/rest/v1.2/users/{user}")

    async def get_concurrency(self, username: str | None = None) -> dict[str, Any]:
        """Get concurrency and usage statistics.

        Parameters
        ----------
        username:
            Username to query. Defaults to the configured username.
        """
        user = username or self._client.username
        if not user:
            raise SaucelabsValidationError("username is required to get concurrency")

        self._logger.debug("getting concurrency", {"username": user})
        return await self._client.get(f"/rest/v1.2/users/{user}/concurrency")
