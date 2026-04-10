"""
Space permission service for Confluence Data Center REST API v9.2.3.

Provides operations for managing space permissions including anonymous,
group-based, and user-based permission grants and revocations.
"""

from __future__ import annotations

from typing import Any

from confluence_api.logger import create_logger

log = create_logger("confluence_api", __file__)


class SpacePermissionService:
    """Service for Confluence space permission operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    def get_permissions(self, space_key: str) -> dict:
        """Retrieve all permissions for a space."""
        log.debug("get_permissions called", {"space_key": space_key})
        result = self._client.get(f"space/{space_key}/permission")
        log.info("get_permissions succeeded", {"space_key": space_key})
        return result

    def add_permission(self, space_key: str, data: dict) -> dict:
        """Add a permission to a space."""
        log.debug("add_permission called", {"space_key": space_key})
        result = self._client.post(f"space/{space_key}/permission", json_data=data)
        log.info("add_permission succeeded", {"space_key": space_key})
        return result

    def get_anonymous_permissions(self, space_key: str) -> dict:
        """Retrieve anonymous permissions for a space."""
        log.debug("get_anonymous_permissions called", {"space_key": space_key})
        result = self._client.get(f"space/{space_key}/permission/anonymous")
        log.info("get_anonymous_permissions succeeded", {"space_key": space_key})
        return result

    def get_group_permissions(self, space_key: str, group_name: str) -> dict:
        """Retrieve permissions for a specific group in a space."""
        log.debug("get_group_permissions called", {
            "space_key": space_key,
            "group_name": group_name,
        })
        result = self._client.get(
            f"space/{space_key}/permission/group/{group_name}"
        )
        log.info("get_group_permissions succeeded", {
            "space_key": space_key,
            "group_name": group_name,
        })
        return result

    def get_user_permissions(self, space_key: str, user_key: str) -> dict:
        """Retrieve permissions for a specific user in a space."""
        log.debug("get_user_permissions called", {
            "space_key": space_key,
            "user_key": user_key,
        })
        result = self._client.get(
            f"space/{space_key}/permission/user/{user_key}"
        )
        log.info("get_user_permissions succeeded", {
            "space_key": space_key,
            "user_key": user_key,
        })
        return result

    def grant_anonymous(self, space_key: str, data: dict) -> dict:
        """Grant anonymous permissions for a space."""
        log.debug("grant_anonymous called", {"space_key": space_key})
        result = self._client.post(
            f"space/{space_key}/permission/anonymous", json_data=data
        )
        log.info("grant_anonymous succeeded", {"space_key": space_key})
        return result

    def grant_group(self, space_key: str, group_name: str, data: dict) -> dict:
        """Grant permissions for a group in a space."""
        log.debug("grant_group called", {
            "space_key": space_key,
            "group_name": group_name,
        })
        result = self._client.post(
            f"space/{space_key}/permission/group/{group_name}", json_data=data
        )
        log.info("grant_group succeeded", {
            "space_key": space_key,
            "group_name": group_name,
        })
        return result

    def grant_user(self, space_key: str, user_key: str, data: dict) -> dict:
        """Grant permissions for a user in a space."""
        log.debug("grant_user called", {
            "space_key": space_key,
            "user_key": user_key,
        })
        result = self._client.post(
            f"space/{space_key}/permission/user/{user_key}", json_data=data
        )
        log.info("grant_user succeeded", {
            "space_key": space_key,
            "user_key": user_key,
        })
        return result

    def revoke_anonymous(self, space_key: str, data: dict) -> dict:
        """Revoke anonymous permissions for a space."""
        log.debug("revoke_anonymous called", {"space_key": space_key})
        result = self._client.delete(
            f"space/{space_key}/permission/anonymous",
            params={"operation": data.get("operation"), "type": data.get("type")},
        )
        log.info("revoke_anonymous succeeded", {"space_key": space_key})
        return result

    def revoke_group(self, space_key: str, group_name: str, data: dict) -> dict:
        """Revoke permissions for a group in a space."""
        log.debug("revoke_group called", {
            "space_key": space_key,
            "group_name": group_name,
        })
        result = self._client.delete(
            f"space/{space_key}/permission/group/{group_name}",
            params={"operation": data.get("operation"), "type": data.get("type")},
        )
        log.info("revoke_group succeeded", {
            "space_key": space_key,
            "group_name": group_name,
        })
        return result

    def revoke_user(self, space_key: str, user_key: str, data: dict) -> dict:
        """Revoke permissions for a user in a space."""
        log.debug("revoke_user called", {
            "space_key": space_key,
            "user_key": user_key,
        })
        result = self._client.delete(
            f"space/{space_key}/permission/user/{user_key}",
            params={"operation": data.get("operation"), "type": data.get("type")},
        )
        log.info("revoke_user succeeded", {
            "space_key": space_key,
            "user_key": user_key,
        })
        return result


class AsyncSpacePermissionService:
    """Async service for Confluence space permission operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    async def get_permissions(self, space_key: str) -> dict:
        """Retrieve all permissions for a space."""
        log.debug("get_permissions called", {"space_key": space_key})
        result = await self._client.get(f"space/{space_key}/permission")
        log.info("get_permissions succeeded", {"space_key": space_key})
        return result

    async def add_permission(self, space_key: str, data: dict) -> dict:
        """Add a permission to a space."""
        log.debug("add_permission called", {"space_key": space_key})
        result = await self._client.post(f"space/{space_key}/permission", json_data=data)
        log.info("add_permission succeeded", {"space_key": space_key})
        return result

    async def get_anonymous_permissions(self, space_key: str) -> dict:
        """Retrieve anonymous permissions for a space."""
        log.debug("get_anonymous_permissions called", {"space_key": space_key})
        result = await self._client.get(f"space/{space_key}/permission/anonymous")
        log.info("get_anonymous_permissions succeeded", {"space_key": space_key})
        return result

    async def get_group_permissions(self, space_key: str, group_name: str) -> dict:
        """Retrieve permissions for a specific group in a space."""
        log.debug("get_group_permissions called", {
            "space_key": space_key,
            "group_name": group_name,
        })
        result = await self._client.get(
            f"space/{space_key}/permission/group/{group_name}"
        )
        log.info("get_group_permissions succeeded", {
            "space_key": space_key,
            "group_name": group_name,
        })
        return result

    async def get_user_permissions(self, space_key: str, user_key: str) -> dict:
        """Retrieve permissions for a specific user in a space."""
        log.debug("get_user_permissions called", {
            "space_key": space_key,
            "user_key": user_key,
        })
        result = await self._client.get(
            f"space/{space_key}/permission/user/{user_key}"
        )
        log.info("get_user_permissions succeeded", {
            "space_key": space_key,
            "user_key": user_key,
        })
        return result

    async def grant_anonymous(self, space_key: str, data: dict) -> dict:
        """Grant anonymous permissions for a space."""
        log.debug("grant_anonymous called", {"space_key": space_key})
        result = await self._client.post(
            f"space/{space_key}/permission/anonymous", json_data=data
        )
        log.info("grant_anonymous succeeded", {"space_key": space_key})
        return result

    async def grant_group(self, space_key: str, group_name: str, data: dict) -> dict:
        """Grant permissions for a group in a space."""
        log.debug("grant_group called", {
            "space_key": space_key,
            "group_name": group_name,
        })
        result = await self._client.post(
            f"space/{space_key}/permission/group/{group_name}", json_data=data
        )
        log.info("grant_group succeeded", {
            "space_key": space_key,
            "group_name": group_name,
        })
        return result

    async def grant_user(self, space_key: str, user_key: str, data: dict) -> dict:
        """Grant permissions for a user in a space."""
        log.debug("grant_user called", {
            "space_key": space_key,
            "user_key": user_key,
        })
        result = await self._client.post(
            f"space/{space_key}/permission/user/{user_key}", json_data=data
        )
        log.info("grant_user succeeded", {
            "space_key": space_key,
            "user_key": user_key,
        })
        return result

    async def revoke_anonymous(self, space_key: str, data: dict) -> dict:
        """Revoke anonymous permissions for a space."""
        log.debug("revoke_anonymous called", {"space_key": space_key})
        result = await self._client.delete(
            f"space/{space_key}/permission/anonymous",
            params={"operation": data.get("operation"), "type": data.get("type")},
        )
        log.info("revoke_anonymous succeeded", {"space_key": space_key})
        return result

    async def revoke_group(self, space_key: str, group_name: str, data: dict) -> dict:
        """Revoke permissions for a group in a space."""
        log.debug("revoke_group called", {
            "space_key": space_key,
            "group_name": group_name,
        })
        result = await self._client.delete(
            f"space/{space_key}/permission/group/{group_name}",
            params={"operation": data.get("operation"), "type": data.get("type")},
        )
        log.info("revoke_group succeeded", {
            "space_key": space_key,
            "group_name": group_name,
        })
        return result

    async def revoke_user(self, space_key: str, user_key: str, data: dict) -> dict:
        """Revoke permissions for a user in a space."""
        log.debug("revoke_user called", {
            "space_key": space_key,
            "user_key": user_key,
        })
        result = await self._client.delete(
            f"space/{space_key}/permission/user/{user_key}",
            params={"operation": data.get("operation"), "type": data.get("type")},
        )
        log.info("revoke_user succeeded", {
            "space_key": space_key,
            "user_key": user_key,
        })
        return result
