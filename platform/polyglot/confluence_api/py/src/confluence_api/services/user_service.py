"""
User service for Confluence Data Center REST API v9.2.3.

Provides operations for user retrieval, current user management, group
membership, password changes, content/space watch management, and
content watcher lookups.
"""

from __future__ import annotations

from typing import Any

from confluence_api.logger import create_logger

log = create_logger("confluence_api", __file__)


class UserService:
    """Service for Confluence user operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    # ── User Retrieval ───────────────────────────────────────────────────

    def get_user(
        self,
        username: str | None = None,
        user_key: str | None = None,
        expand: str | None = None,
    ) -> dict:
        """
        Retrieve a user by username or user key.

        At least one of username or user_key must be provided.

        Args:
            username: The username to look up.
            user_key: The user key to look up.
            expand: Comma-separated list of properties to expand.

        Returns:
            User data dict.
        """
        log.debug("get_user called", {
            "username": username,
            "user_key": user_key,
            "expand": expand,
        })
        params: dict[str, Any] = {}
        if username is not None:
            params["username"] = username
        if user_key is not None:
            params["key"] = user_key
        if expand is not None:
            params["expand"] = expand
        result = self._client.get("user", params=params)
        log.info("get_user succeeded", {"username": username, "user_key": user_key})
        return result

    def get_current_user(self, expand: str | None = None) -> dict:
        """Retrieve the currently authenticated user."""
        log.debug("get_current_user called", {"expand": expand})
        params: dict[str, Any] = {}
        if expand is not None:
            params["expand"] = expand
        result = self._client.get("user/current", params=params or None)
        log.info("get_current_user succeeded")
        return result

    def get_anonymous_user(self) -> dict:
        """Retrieve the anonymous user representation."""
        log.debug("get_anonymous_user called")
        result = self._client.get("user/anonymous")
        log.info("get_anonymous_user succeeded")
        return result

    def get_user_groups(
        self,
        username: str,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """
        Retrieve groups the user belongs to.

        GET /rest/api/user/memberof
        """
        log.debug("get_user_groups called", {
            "username": username,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {
            "username": username,
            "start": start,
            "limit": limit,
        }
        result = self._client.get("user/memberof", params=params)
        log.info("get_user_groups succeeded", {"username": username})
        return result

    def list_users(self, start: int = 0, limit: int = 25) -> dict:
        """
        List all users with pagination.

        GET /rest/api/user/list
        """
        log.debug("list_users called", {"start": start, "limit": limit})
        params: dict[str, Any] = {"start": start, "limit": limit}
        result = self._client.get("user/list", params=params)
        log.info("list_users succeeded", {"start": start, "limit": limit})
        return result

    def change_current_user_password(self, old_password: str, new_password: str) -> dict:
        """Change the password of the currently authenticated user."""
        log.debug("change_current_user_password called")
        data = {"oldPassword": old_password, "newPassword": new_password}
        result = self._client.post("user/current/password", json_data=data)
        log.info("change_current_user_password succeeded")
        return result

    # ── User Watch ───────────────────────────────────────────────────────

    def is_watching_content(self, content_id: str, username: str | None = None) -> dict:
        """Check if the current user (or specified user) is watching a piece of content."""
        log.debug("is_watching_content called", {
            "content_id": content_id,
            "username": username,
        })
        params: dict[str, Any] = {}
        if username is not None:
            params["username"] = username
        result = self._client.get(
            f"user/watch/content/{content_id}", params=params or None
        )
        log.info("is_watching_content succeeded", {"content_id": content_id})
        return result

    def watch_content(self, content_id: str, username: str | None = None) -> dict:
        """Start watching a piece of content."""
        log.debug("watch_content called", {
            "content_id": content_id,
            "username": username,
        })
        params: dict[str, Any] = {}
        if username is not None:
            params["username"] = username
        result = self._client.post(
            f"user/watch/content/{content_id}", params=params or None
        )
        log.info("watch_content succeeded", {"content_id": content_id})
        return result

    def unwatch_content(self, content_id: str, username: str | None = None) -> dict:
        """Stop watching a piece of content."""
        log.debug("unwatch_content called", {
            "content_id": content_id,
            "username": username,
        })
        params: dict[str, Any] = {}
        if username is not None:
            params["username"] = username
        result = self._client.delete(
            f"user/watch/content/{content_id}", params=params or None
        )
        log.info("unwatch_content succeeded", {"content_id": content_id})
        return result

    def is_watching_space(self, space_key: str, username: str | None = None) -> dict:
        """Check if the current user (or specified user) is watching a space."""
        log.debug("is_watching_space called", {
            "space_key": space_key,
            "username": username,
        })
        params: dict[str, Any] = {}
        if username is not None:
            params["username"] = username
        result = self._client.get(
            f"user/watch/space/{space_key}", params=params or None
        )
        log.info("is_watching_space succeeded", {"space_key": space_key})
        return result

    def watch_space(self, space_key: str, username: str | None = None) -> dict:
        """Start watching a space."""
        log.debug("watch_space called", {
            "space_key": space_key,
            "username": username,
        })
        params: dict[str, Any] = {}
        if username is not None:
            params["username"] = username
        result = self._client.post(
            f"user/watch/space/{space_key}", params=params or None
        )
        log.info("watch_space succeeded", {"space_key": space_key})
        return result

    def unwatch_space(self, space_key: str, username: str | None = None) -> dict:
        """Stop watching a space."""
        log.debug("unwatch_space called", {
            "space_key": space_key,
            "username": username,
        })
        params: dict[str, Any] = {}
        if username is not None:
            params["username"] = username
        result = self._client.delete(
            f"user/watch/space/{space_key}", params=params or None
        )
        log.info("unwatch_space succeeded", {"space_key": space_key})
        return result

    # ── Content Watchers ─────────────────────────────────────────────────

    def get_content_watchers(self, content_id: str) -> dict:
        """Retrieve the list of watchers for a piece of content."""
        log.debug("get_content_watchers called", {"content_id": content_id})
        result = self._client.get(f"content/{content_id}/notification/child-created")
        log.info("get_content_watchers succeeded", {"content_id": content_id})
        return result


class AsyncUserService:
    """Async service for Confluence user operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    # ── User Retrieval ───────────────────────────────────────────────────

    async def get_user(
        self,
        username: str | None = None,
        user_key: str | None = None,
        expand: str | None = None,
    ) -> dict:
        """Retrieve a user by username or user key."""
        log.debug("get_user called", {
            "username": username,
            "user_key": user_key,
            "expand": expand,
        })
        params: dict[str, Any] = {}
        if username is not None:
            params["username"] = username
        if user_key is not None:
            params["key"] = user_key
        if expand is not None:
            params["expand"] = expand
        result = await self._client.get("user", params=params)
        log.info("get_user succeeded", {"username": username, "user_key": user_key})
        return result

    async def get_current_user(self, expand: str | None = None) -> dict:
        """Retrieve the currently authenticated user."""
        log.debug("get_current_user called", {"expand": expand})
        params: dict[str, Any] = {}
        if expand is not None:
            params["expand"] = expand
        result = await self._client.get("user/current", params=params or None)
        log.info("get_current_user succeeded")
        return result

    async def get_anonymous_user(self) -> dict:
        """Retrieve the anonymous user representation."""
        log.debug("get_anonymous_user called")
        result = await self._client.get("user/anonymous")
        log.info("get_anonymous_user succeeded")
        return result

    async def get_user_groups(
        self,
        username: str,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """Retrieve groups the user belongs to."""
        log.debug("get_user_groups called", {
            "username": username,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {
            "username": username,
            "start": start,
            "limit": limit,
        }
        result = await self._client.get("user/memberof", params=params)
        log.info("get_user_groups succeeded", {"username": username})
        return result

    async def list_users(self, start: int = 0, limit: int = 25) -> dict:
        """List all users with pagination."""
        log.debug("list_users called", {"start": start, "limit": limit})
        params: dict[str, Any] = {"start": start, "limit": limit}
        result = await self._client.get("user/list", params=params)
        log.info("list_users succeeded", {"start": start, "limit": limit})
        return result

    async def change_current_user_password(self, old_password: str, new_password: str) -> dict:
        """Change the password of the currently authenticated user."""
        log.debug("change_current_user_password called")
        data = {"oldPassword": old_password, "newPassword": new_password}
        result = await self._client.post("user/current/password", json_data=data)
        log.info("change_current_user_password succeeded")
        return result

    # ── User Watch ───────────────────────────────────────────────────────

    async def is_watching_content(self, content_id: str, username: str | None = None) -> dict:
        """Check if the current user (or specified user) is watching a piece of content."""
        log.debug("is_watching_content called", {
            "content_id": content_id,
            "username": username,
        })
        params: dict[str, Any] = {}
        if username is not None:
            params["username"] = username
        result = await self._client.get(
            f"user/watch/content/{content_id}", params=params or None
        )
        log.info("is_watching_content succeeded", {"content_id": content_id})
        return result

    async def watch_content(self, content_id: str, username: str | None = None) -> dict:
        """Start watching a piece of content."""
        log.debug("watch_content called", {
            "content_id": content_id,
            "username": username,
        })
        params: dict[str, Any] = {}
        if username is not None:
            params["username"] = username
        result = await self._client.post(
            f"user/watch/content/{content_id}", params=params or None
        )
        log.info("watch_content succeeded", {"content_id": content_id})
        return result

    async def unwatch_content(self, content_id: str, username: str | None = None) -> dict:
        """Stop watching a piece of content."""
        log.debug("unwatch_content called", {
            "content_id": content_id,
            "username": username,
        })
        params: dict[str, Any] = {}
        if username is not None:
            params["username"] = username
        result = await self._client.delete(
            f"user/watch/content/{content_id}", params=params or None
        )
        log.info("unwatch_content succeeded", {"content_id": content_id})
        return result

    async def is_watching_space(self, space_key: str, username: str | None = None) -> dict:
        """Check if the current user (or specified user) is watching a space."""
        log.debug("is_watching_space called", {
            "space_key": space_key,
            "username": username,
        })
        params: dict[str, Any] = {}
        if username is not None:
            params["username"] = username
        result = await self._client.get(
            f"user/watch/space/{space_key}", params=params or None
        )
        log.info("is_watching_space succeeded", {"space_key": space_key})
        return result

    async def watch_space(self, space_key: str, username: str | None = None) -> dict:
        """Start watching a space."""
        log.debug("watch_space called", {
            "space_key": space_key,
            "username": username,
        })
        params: dict[str, Any] = {}
        if username is not None:
            params["username"] = username
        result = await self._client.post(
            f"user/watch/space/{space_key}", params=params or None
        )
        log.info("watch_space succeeded", {"space_key": space_key})
        return result

    async def unwatch_space(self, space_key: str, username: str | None = None) -> dict:
        """Stop watching a space."""
        log.debug("unwatch_space called", {
            "space_key": space_key,
            "username": username,
        })
        params: dict[str, Any] = {}
        if username is not None:
            params["username"] = username
        result = await self._client.delete(
            f"user/watch/space/{space_key}", params=params or None
        )
        log.info("unwatch_space succeeded", {"space_key": space_key})
        return result

    # ── Content Watchers ─────────────────────────────────────────────────

    async def get_content_watchers(self, content_id: str) -> dict:
        """Retrieve the list of watchers for a piece of content."""
        log.debug("get_content_watchers called", {"content_id": content_id})
        result = await self._client.get(f"content/{content_id}/notification/child-created")
        log.info("get_content_watchers succeeded", {"content_id": content_id})
        return result
