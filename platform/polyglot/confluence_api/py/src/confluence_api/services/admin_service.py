"""
Admin service for Confluence Data Center REST API v9.2.3.

Provides administrative operations for user and group management
including creation, deletion, enable/disable, and password resets.
"""

from __future__ import annotations

from typing import Any

from confluence_api.logger import create_logger

log = create_logger("confluence_api", __file__)


class AdminService:
    """Service for Confluence administrative operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    # ── Admin User ───────────────────────────────────────────────────────

    def create_user(self, data: dict) -> dict:
        """
        Create a new user.

        POST /rest/api/admin/user

        Args:
            data: User creation payload containing username, email, fullName, etc.

        Returns:
            Created user data dict.
        """
        log.debug("create_user called", {"username": data.get("username")})
        result = self._client.post("admin/user", json_data=data)
        log.info("create_user succeeded", {"username": data.get("username")})
        return result

    def delete_user(self, username: str) -> dict:
        """Delete a user by username."""
        log.debug("delete_user called", {"username": username})
        result = self._client.delete("admin/user", params={"username": username})
        log.info("delete_user succeeded", {"username": username})
        return result

    def disable_user(self, username: str) -> dict:
        """Disable a user account."""
        log.debug("disable_user called", {"username": username})
        result = self._client.post(
            "admin/user/disable", json_data={"username": username}
        )
        log.info("disable_user succeeded", {"username": username})
        return result

    def enable_user(self, username: str) -> dict:
        """Enable a previously disabled user account."""
        log.debug("enable_user called", {"username": username})
        result = self._client.post(
            "admin/user/enable", json_data={"username": username}
        )
        log.info("enable_user succeeded", {"username": username})
        return result

    def set_user_password(self, username: str, password: str) -> dict:
        """Set a user's password (admin operation)."""
        log.debug("set_user_password called", {"username": username})
        result = self._client.post(
            "admin/user/password",
            json_data={"username": username, "password": password},
        )
        log.info("set_user_password succeeded", {"username": username})
        return result

    # ── Admin Group ──────────────────────────────────────────────────────

    def create_group(self, name: str) -> dict:
        """Create a new group."""
        log.debug("create_group called", {"name": name})
        result = self._client.post("admin/group", json_data={"name": name})
        log.info("create_group succeeded", {"name": name})
        return result

    def delete_group(self, group_name: str) -> dict:
        """Delete a group by name."""
        log.debug("delete_group called", {"group_name": group_name})
        result = self._client.delete(
            "admin/group", params={"name": group_name}
        )
        log.info("delete_group succeeded", {"group_name": group_name})
        return result


class AsyncAdminService:
    """Async service for Confluence administrative operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    # ── Admin User ───────────────────────────────────────────────────────

    async def create_user(self, data: dict) -> dict:
        """Create a new user."""
        log.debug("create_user called", {"username": data.get("username")})
        result = await self._client.post("admin/user", json_data=data)
        log.info("create_user succeeded", {"username": data.get("username")})
        return result

    async def delete_user(self, username: str) -> dict:
        """Delete a user by username."""
        log.debug("delete_user called", {"username": username})
        result = await self._client.delete("admin/user", params={"username": username})
        log.info("delete_user succeeded", {"username": username})
        return result

    async def disable_user(self, username: str) -> dict:
        """Disable a user account."""
        log.debug("disable_user called", {"username": username})
        result = await self._client.post(
            "admin/user/disable", json_data={"username": username}
        )
        log.info("disable_user succeeded", {"username": username})
        return result

    async def enable_user(self, username: str) -> dict:
        """Enable a previously disabled user account."""
        log.debug("enable_user called", {"username": username})
        result = await self._client.post(
            "admin/user/enable", json_data={"username": username}
        )
        log.info("enable_user succeeded", {"username": username})
        return result

    async def set_user_password(self, username: str, password: str) -> dict:
        """Set a user's password (admin operation)."""
        log.debug("set_user_password called", {"username": username})
        result = await self._client.post(
            "admin/user/password",
            json_data={"username": username, "password": password},
        )
        log.info("set_user_password succeeded", {"username": username})
        return result

    # ── Admin Group ──────────────────────────────────────────────────────

    async def create_group(self, name: str) -> dict:
        """Create a new group."""
        log.debug("create_group called", {"name": name})
        result = await self._client.post("admin/group", json_data={"name": name})
        log.info("create_group succeeded", {"name": name})
        return result

    async def delete_group(self, group_name: str) -> dict:
        """Delete a group by name."""
        log.debug("delete_group called", {"group_name": group_name})
        result = await self._client.delete(
            "admin/group", params={"name": group_name}
        )
        log.info("delete_group succeeded", {"group_name": group_name})
        return result
