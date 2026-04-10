"""
Space service for Confluence Data Center REST API v9.2.3.

Provides CRUD operations for spaces, space content retrieval, space properties,
space labels, space watchers, and category management.
"""

from __future__ import annotations

from typing import Any

from confluence_api.logger import create_logger

log = create_logger("confluence_api", __file__)


class SpaceService:
    """Service for Confluence space operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    # ── Space CRUD ───────────────────────────────────────────────────────

    def get_spaces(
        self,
        type: str | None = None,
        status: str | None = None,
        label: str | None = None,
        expand: str | None = None,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """Retrieve a paginated list of spaces."""
        log.debug("get_spaces called", {
            "type": type,
            "status": status,
            "label": label,
            "expand": expand,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"start": start, "limit": limit}
        if type is not None:
            params["type"] = type
        if status is not None:
            params["status"] = status
        if label is not None:
            params["label"] = label
        if expand is not None:
            params["expand"] = expand
        result = self._client.get("space", params=params)
        log.info("get_spaces succeeded", {"start": start, "limit": limit})
        return result

    def create_space(self, data: dict) -> dict:
        """Create a new space."""
        log.debug("create_space called", {
            "key": data.get("key"),
            "name": data.get("name"),
        })
        result = self._client.post("space", json_data=data)
        log.info("create_space succeeded", {"key": data.get("key")})
        return result

    def get_space(self, space_key: str, expand: str | None = None) -> dict:
        """Retrieve a single space by key."""
        log.debug("get_space called", {"space_key": space_key, "expand": expand})
        params: dict[str, Any] = {}
        if expand is not None:
            params["expand"] = expand
        result = self._client.get(f"space/{space_key}", params=params or None)
        log.info("get_space succeeded", {"space_key": space_key})
        return result

    def update_space(self, space_key: str, data: dict) -> dict:
        """Update an existing space."""
        log.debug("update_space called", {"space_key": space_key})
        result = self._client.put(f"space/{space_key}", json_data=data)
        log.info("update_space succeeded", {"space_key": space_key})
        return result

    def delete_space(self, space_key: str) -> dict:
        """
        Delete a space. Returns a long task submission (HTTP 202).

        The returned dict contains the task ID for polling the deletion progress.
        """
        log.debug("delete_space called", {"space_key": space_key})
        result = self._client.delete(f"space/{space_key}")
        log.info("delete_space succeeded", {"space_key": space_key})
        return result

    def archive_space(self, space_key: str) -> dict:
        """Archive a space."""
        log.debug("archive_space called", {"space_key": space_key})
        result = self._client.put(f"space/{space_key}/archive")
        log.info("archive_space succeeded", {"space_key": space_key})
        return result

    def restore_space(self, space_key: str) -> dict:
        """Restore an archived space."""
        log.debug("restore_space called", {"space_key": space_key})
        result = self._client.put(f"space/{space_key}/restore")
        log.info("restore_space succeeded", {"space_key": space_key})
        return result

    def create_private_space(self, data: dict) -> dict:
        """Create a private space (POST /space/_private)."""
        log.debug("create_private_space called", {
            "key": data.get("key"),
            "name": data.get("name"),
        })
        result = self._client.post("space/_private", json_data=data)
        log.info("create_private_space succeeded", {"key": data.get("key")})
        return result

    # ── Space Content ────────────────────────────────────────────────────

    def get_space_content(
        self,
        space_key: str,
        depth: str | None = None,
        expand: str | None = None,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """Retrieve content within a space."""
        log.debug("get_space_content called", {
            "space_key": space_key,
            "depth": depth,
            "expand": expand,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"start": start, "limit": limit}
        if depth is not None:
            params["depth"] = depth
        if expand is not None:
            params["expand"] = expand
        result = self._client.get(f"space/{space_key}/content", params=params)
        log.info("get_space_content succeeded", {"space_key": space_key})
        return result

    def get_space_content_by_type(
        self,
        space_key: str,
        content_type: str,
        depth: str | None = None,
        expand: str | None = None,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """Retrieve content of a specific type within a space."""
        log.debug("get_space_content_by_type called", {
            "space_key": space_key,
            "content_type": content_type,
            "depth": depth,
            "expand": expand,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"start": start, "limit": limit}
        if depth is not None:
            params["depth"] = depth
        if expand is not None:
            params["expand"] = expand
        result = self._client.get(
            f"space/{space_key}/content/{content_type}", params=params
        )
        log.info("get_space_content_by_type succeeded", {
            "space_key": space_key,
            "content_type": content_type,
        })
        return result

    # ── Space Properties ─────────────────────────────────────────────────

    def get_space_properties(
        self,
        space_key: str,
        expand: str | None = None,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """Retrieve all properties for a space."""
        log.debug("get_space_properties called", {
            "space_key": space_key,
            "expand": expand,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"start": start, "limit": limit}
        if expand is not None:
            params["expand"] = expand
        result = self._client.get(f"space/{space_key}/property", params=params)
        log.info("get_space_properties succeeded", {"space_key": space_key})
        return result

    def create_space_property(self, space_key: str, data: dict) -> dict:
        """Create a new space property."""
        log.debug("create_space_property called", {
            "space_key": space_key,
            "key": data.get("key"),
        })
        result = self._client.post(f"space/{space_key}/property", json_data=data)
        log.info("create_space_property succeeded", {"space_key": space_key})
        return result

    def get_space_property(
        self,
        space_key: str,
        key: str,
        expand: str | None = None,
    ) -> dict:
        """Retrieve a specific space property by key."""
        log.debug("get_space_property called", {
            "space_key": space_key,
            "key": key,
            "expand": expand,
        })
        params: dict[str, Any] = {}
        if expand is not None:
            params["expand"] = expand
        result = self._client.get(
            f"space/{space_key}/property/{key}", params=params or None
        )
        log.info("get_space_property succeeded", {"space_key": space_key, "key": key})
        return result

    def update_space_property(self, space_key: str, key: str, data: dict) -> dict:
        """Update an existing space property."""
        log.debug("update_space_property called", {"space_key": space_key, "key": key})
        result = self._client.put(
            f"space/{space_key}/property/{key}", json_data=data
        )
        log.info("update_space_property succeeded", {"space_key": space_key, "key": key})
        return result

    def create_space_property_for_key(self, space_key: str, key: str, data: dict) -> dict:
        """Create a space property for a specific key (POST to keyed endpoint)."""
        log.debug("create_space_property_for_key called", {
            "space_key": space_key,
            "key": key,
        })
        result = self._client.post(
            f"space/{space_key}/property/{key}", json_data=data
        )
        log.info("create_space_property_for_key succeeded", {
            "space_key": space_key,
            "key": key,
        })
        return result

    def delete_space_property(self, space_key: str, key: str) -> dict:
        """Delete a space property by key."""
        log.debug("delete_space_property called", {"space_key": space_key, "key": key})
        result = self._client.delete(f"space/{space_key}/property/{key}")
        log.info("delete_space_property succeeded", {"space_key": space_key, "key": key})
        return result

    # ── Space Labels ─────────────────────────────────────────────────────

    def get_space_labels(
        self,
        expand: str | None = None,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """Retrieve all space labels (GET /labels)."""
        log.debug("get_space_labels called", {
            "expand": expand,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"start": start, "limit": limit}
        if expand is not None:
            params["expand"] = expand
        result = self._client.get("labels", params=params)
        log.info("get_space_labels succeeded", {"start": start, "limit": limit})
        return result

    def get_popular_space_labels(self) -> dict:
        """Retrieve popular space labels."""
        log.debug("get_popular_space_labels called")
        result = self._client.get("labels/popular")
        log.info("get_popular_space_labels succeeded")
        return result

    def get_recent_space_labels(self) -> dict:
        """Retrieve recently used space labels."""
        log.debug("get_recent_space_labels called")
        result = self._client.get("labels/recent")
        log.info("get_recent_space_labels succeeded")
        return result

    def get_related_space_labels(self, label_name: str) -> dict:
        """Retrieve labels related to a given label."""
        log.debug("get_related_space_labels called", {"label_name": label_name})
        result = self._client.get(f"labels/{label_name}/related")
        log.info("get_related_space_labels succeeded", {"label_name": label_name})
        return result

    # ── Space Watchers ───────────────────────────────────────────────────

    def get_space_watchers(self, space_key: str) -> dict:
        """Retrieve the list of watchers for a space."""
        log.debug("get_space_watchers called", {"space_key": space_key})
        result = self._client.get(f"space/{space_key}/watch")
        log.info("get_space_watchers succeeded", {"space_key": space_key})
        return result

    # ── Category ─────────────────────────────────────────────────────────

    def delete_category(self, space_key: str, category_name: str) -> dict:
        """Delete a category from a space."""
        log.debug("delete_category called", {
            "space_key": space_key,
            "category_name": category_name,
        })
        result = self._client.delete(
            f"space/{space_key}/label", params={"name": category_name}
        )
        log.info("delete_category succeeded", {
            "space_key": space_key,
            "category_name": category_name,
        })
        return result


class AsyncSpaceService:
    """Async service for Confluence space operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    # ── Space CRUD ───────────────────────────────────────────────────────

    async def get_spaces(
        self,
        type: str | None = None,
        status: str | None = None,
        label: str | None = None,
        expand: str | None = None,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """Retrieve a paginated list of spaces."""
        log.debug("get_spaces called", {
            "type": type,
            "status": status,
            "label": label,
            "expand": expand,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"start": start, "limit": limit}
        if type is not None:
            params["type"] = type
        if status is not None:
            params["status"] = status
        if label is not None:
            params["label"] = label
        if expand is not None:
            params["expand"] = expand
        result = await self._client.get("space", params=params)
        log.info("get_spaces succeeded", {"start": start, "limit": limit})
        return result

    async def create_space(self, data: dict) -> dict:
        """Create a new space."""
        log.debug("create_space called", {
            "key": data.get("key"),
            "name": data.get("name"),
        })
        result = await self._client.post("space", json_data=data)
        log.info("create_space succeeded", {"key": data.get("key")})
        return result

    async def get_space(self, space_key: str, expand: str | None = None) -> dict:
        """Retrieve a single space by key."""
        log.debug("get_space called", {"space_key": space_key, "expand": expand})
        params: dict[str, Any] = {}
        if expand is not None:
            params["expand"] = expand
        result = await self._client.get(f"space/{space_key}", params=params or None)
        log.info("get_space succeeded", {"space_key": space_key})
        return result

    async def update_space(self, space_key: str, data: dict) -> dict:
        """Update an existing space."""
        log.debug("update_space called", {"space_key": space_key})
        result = await self._client.put(f"space/{space_key}", json_data=data)
        log.info("update_space succeeded", {"space_key": space_key})
        return result

    async def delete_space(self, space_key: str) -> dict:
        """Delete a space. Returns a long task submission (HTTP 202)."""
        log.debug("delete_space called", {"space_key": space_key})
        result = await self._client.delete(f"space/{space_key}")
        log.info("delete_space succeeded", {"space_key": space_key})
        return result

    async def archive_space(self, space_key: str) -> dict:
        """Archive a space."""
        log.debug("archive_space called", {"space_key": space_key})
        result = await self._client.put(f"space/{space_key}/archive")
        log.info("archive_space succeeded", {"space_key": space_key})
        return result

    async def restore_space(self, space_key: str) -> dict:
        """Restore an archived space."""
        log.debug("restore_space called", {"space_key": space_key})
        result = await self._client.put(f"space/{space_key}/restore")
        log.info("restore_space succeeded", {"space_key": space_key})
        return result

    async def create_private_space(self, data: dict) -> dict:
        """Create a private space (POST /space/_private)."""
        log.debug("create_private_space called", {
            "key": data.get("key"),
            "name": data.get("name"),
        })
        result = await self._client.post("space/_private", json_data=data)
        log.info("create_private_space succeeded", {"key": data.get("key")})
        return result

    # ── Space Content ────────────────────────────────────────────────────

    async def get_space_content(
        self,
        space_key: str,
        depth: str | None = None,
        expand: str | None = None,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """Retrieve content within a space."""
        log.debug("get_space_content called", {
            "space_key": space_key,
            "depth": depth,
            "expand": expand,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"start": start, "limit": limit}
        if depth is not None:
            params["depth"] = depth
        if expand is not None:
            params["expand"] = expand
        result = await self._client.get(f"space/{space_key}/content", params=params)
        log.info("get_space_content succeeded", {"space_key": space_key})
        return result

    async def get_space_content_by_type(
        self,
        space_key: str,
        content_type: str,
        depth: str | None = None,
        expand: str | None = None,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """Retrieve content of a specific type within a space."""
        log.debug("get_space_content_by_type called", {
            "space_key": space_key,
            "content_type": content_type,
            "depth": depth,
            "expand": expand,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"start": start, "limit": limit}
        if depth is not None:
            params["depth"] = depth
        if expand is not None:
            params["expand"] = expand
        result = await self._client.get(
            f"space/{space_key}/content/{content_type}", params=params
        )
        log.info("get_space_content_by_type succeeded", {
            "space_key": space_key,
            "content_type": content_type,
        })
        return result

    # ── Space Properties ─────────────────────────────────────────────────

    async def get_space_properties(
        self,
        space_key: str,
        expand: str | None = None,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """Retrieve all properties for a space."""
        log.debug("get_space_properties called", {
            "space_key": space_key,
            "expand": expand,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"start": start, "limit": limit}
        if expand is not None:
            params["expand"] = expand
        result = await self._client.get(f"space/{space_key}/property", params=params)
        log.info("get_space_properties succeeded", {"space_key": space_key})
        return result

    async def create_space_property(self, space_key: str, data: dict) -> dict:
        """Create a new space property."""
        log.debug("create_space_property called", {
            "space_key": space_key,
            "key": data.get("key"),
        })
        result = await self._client.post(f"space/{space_key}/property", json_data=data)
        log.info("create_space_property succeeded", {"space_key": space_key})
        return result

    async def get_space_property(
        self,
        space_key: str,
        key: str,
        expand: str | None = None,
    ) -> dict:
        """Retrieve a specific space property by key."""
        log.debug("get_space_property called", {
            "space_key": space_key,
            "key": key,
            "expand": expand,
        })
        params: dict[str, Any] = {}
        if expand is not None:
            params["expand"] = expand
        result = await self._client.get(
            f"space/{space_key}/property/{key}", params=params or None
        )
        log.info("get_space_property succeeded", {"space_key": space_key, "key": key})
        return result

    async def update_space_property(self, space_key: str, key: str, data: dict) -> dict:
        """Update an existing space property."""
        log.debug("update_space_property called", {"space_key": space_key, "key": key})
        result = await self._client.put(
            f"space/{space_key}/property/{key}", json_data=data
        )
        log.info("update_space_property succeeded", {"space_key": space_key, "key": key})
        return result

    async def create_space_property_for_key(self, space_key: str, key: str, data: dict) -> dict:
        """Create a space property for a specific key (POST to keyed endpoint)."""
        log.debug("create_space_property_for_key called", {
            "space_key": space_key,
            "key": key,
        })
        result = await self._client.post(
            f"space/{space_key}/property/{key}", json_data=data
        )
        log.info("create_space_property_for_key succeeded", {
            "space_key": space_key,
            "key": key,
        })
        return result

    async def delete_space_property(self, space_key: str, key: str) -> dict:
        """Delete a space property by key."""
        log.debug("delete_space_property called", {"space_key": space_key, "key": key})
        result = await self._client.delete(f"space/{space_key}/property/{key}")
        log.info("delete_space_property succeeded", {"space_key": space_key, "key": key})
        return result

    # ── Space Labels ─────────────────────────────────────────────────────

    async def get_space_labels(
        self,
        expand: str | None = None,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """Retrieve all space labels (GET /labels)."""
        log.debug("get_space_labels called", {
            "expand": expand,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"start": start, "limit": limit}
        if expand is not None:
            params["expand"] = expand
        result = await self._client.get("labels", params=params)
        log.info("get_space_labels succeeded", {"start": start, "limit": limit})
        return result

    async def get_popular_space_labels(self) -> dict:
        """Retrieve popular space labels."""
        log.debug("get_popular_space_labels called")
        result = await self._client.get("labels/popular")
        log.info("get_popular_space_labels succeeded")
        return result

    async def get_recent_space_labels(self) -> dict:
        """Retrieve recently used space labels."""
        log.debug("get_recent_space_labels called")
        result = await self._client.get("labels/recent")
        log.info("get_recent_space_labels succeeded")
        return result

    async def get_related_space_labels(self, label_name: str) -> dict:
        """Retrieve labels related to a given label."""
        log.debug("get_related_space_labels called", {"label_name": label_name})
        result = await self._client.get(f"labels/{label_name}/related")
        log.info("get_related_space_labels succeeded", {"label_name": label_name})
        return result

    # ── Space Watchers ───────────────────────────────────────────────────

    async def get_space_watchers(self, space_key: str) -> dict:
        """Retrieve the list of watchers for a space."""
        log.debug("get_space_watchers called", {"space_key": space_key})
        result = await self._client.get(f"space/{space_key}/watch")
        log.info("get_space_watchers succeeded", {"space_key": space_key})
        return result

    # ── Category ─────────────────────────────────────────────────────────

    async def delete_category(self, space_key: str, category_name: str) -> dict:
        """Delete a category from a space."""
        log.debug("delete_category called", {
            "space_key": space_key,
            "category_name": category_name,
        })
        result = await self._client.delete(
            f"space/{space_key}/label", params={"name": category_name}
        )
        log.info("delete_category succeeded", {
            "space_key": space_key,
            "category_name": category_name,
        })
        return result
