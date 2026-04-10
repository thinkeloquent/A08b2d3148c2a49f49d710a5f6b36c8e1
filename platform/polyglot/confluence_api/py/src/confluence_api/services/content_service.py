"""
Content service for Confluence Data Center REST API v9.2.3.

Provides CRUD operations for content (pages, blog posts), child/descendant
traversal, labels, properties, restrictions, body conversion, versioning,
and blueprint publishing.
"""

from __future__ import annotations

from typing import Any

from confluence_api.logger import create_logger

log = create_logger("confluence_api", __file__)


class ContentService:
    """Service for Confluence content operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    # ── Content CRUD ─────────────────────────────────────────────────────

    def get_contents(
        self,
        type: str | None = None,
        space_key: str | None = None,
        title: str | None = None,
        status: str | None = None,
        expand: str | None = None,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """Retrieve a paginated list of content."""
        log.debug("get_contents called", {
            "type": type,
            "space_key": space_key,
            "title": title,
            "status": status,
            "expand": expand,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"start": start, "limit": limit}
        if type is not None:
            params["type"] = type
        if space_key is not None:
            params["spaceKey"] = space_key
        if title is not None:
            params["title"] = title
        if status is not None:
            params["status"] = status
        if expand is not None:
            params["expand"] = expand
        result = self._client.get("content", params=params)
        log.info("get_contents succeeded", {"start": start, "limit": limit})
        return result

    def create_content(self, data: dict) -> dict:
        """Create a new piece of content (page, blog post, comment, etc.)."""
        log.debug("create_content called", {"type": data.get("type"), "title": data.get("title")})
        result = self._client.post("content", json_data=data)
        log.info("create_content succeeded", {"id": result.get("id")})
        return result

    def get_content(self, content_id: str, expand: str | None = None) -> dict:
        """Retrieve a single piece of content by ID."""
        log.debug("get_content called", {"content_id": content_id, "expand": expand})
        params: dict[str, Any] = {}
        if expand is not None:
            params["expand"] = expand
        result = self._client.get(f"content/{content_id}", params=params or None)
        log.info("get_content succeeded", {"content_id": content_id})
        return result

    def update_content(self, content_id: str, data: dict) -> dict:
        """Update an existing piece of content."""
        log.debug("update_content called", {"content_id": content_id})
        result = self._client.put(f"content/{content_id}", json_data=data)
        log.info("update_content succeeded", {"content_id": content_id})
        return result

    def delete_content(self, content_id: str, status: str | None = None) -> dict:
        """Delete a piece of content. Optionally specify status (e.g. 'trashed')."""
        log.debug("delete_content called", {"content_id": content_id, "status": status})
        params: dict[str, Any] = {}
        if status is not None:
            params["status"] = status
        result = self._client.delete(f"content/{content_id}", params=params or None)
        log.info("delete_content succeeded", {"content_id": content_id})
        return result

    def get_content_history(self, content_id: str, expand: str | None = None) -> dict:
        """Retrieve the history of a piece of content."""
        log.debug("get_content_history called", {"content_id": content_id, "expand": expand})
        params: dict[str, Any] = {}
        if expand is not None:
            params["expand"] = expand
        result = self._client.get(f"content/{content_id}/history", params=params or None)
        log.info("get_content_history succeeded", {"content_id": content_id})
        return result

    def get_macro_by_id(self, content_id: str, version: int, macro_id: str) -> dict:
        """Retrieve a macro in a piece of content by macro ID and version."""
        log.debug("get_macro_by_id called", {
            "content_id": content_id,
            "version": version,
            "macro_id": macro_id,
        })
        result = self._client.get(
            f"content/{content_id}/history/{version}/macro/id/{macro_id}"
        )
        log.info("get_macro_by_id succeeded", {"content_id": content_id, "macro_id": macro_id})
        return result

    # ── Child Content & Descendants ──────────────────────────────────────

    def get_child_content(self, content_id: str, expand: str | None = None) -> dict:
        """Retrieve all child content for a given piece of content."""
        log.debug("get_child_content called", {"content_id": content_id, "expand": expand})
        params: dict[str, Any] = {}
        if expand is not None:
            params["expand"] = expand
        result = self._client.get(f"content/{content_id}/child", params=params or None)
        log.info("get_child_content succeeded", {"content_id": content_id})
        return result

    def get_child_content_by_type(
        self,
        content_id: str,
        child_type: str,
        expand: str | None = None,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """Retrieve child content of a specific type (page, comment, attachment)."""
        log.debug("get_child_content_by_type called", {
            "content_id": content_id,
            "child_type": child_type,
            "expand": expand,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"start": start, "limit": limit}
        if expand is not None:
            params["expand"] = expand
        result = self._client.get(
            f"content/{content_id}/child/{child_type}", params=params
        )
        log.info("get_child_content_by_type succeeded", {
            "content_id": content_id,
            "child_type": child_type,
        })
        return result

    def get_child_comments(
        self,
        content_id: str,
        expand: str | None = None,
        start: int = 0,
        limit: int = 25,
        depth: str | None = None,
        location: str | None = None,
    ) -> dict:
        """Retrieve child comments of a piece of content."""
        log.debug("get_child_comments called", {
            "content_id": content_id,
            "expand": expand,
            "start": start,
            "limit": limit,
            "depth": depth,
            "location": location,
        })
        params: dict[str, Any] = {"start": start, "limit": limit}
        if expand is not None:
            params["expand"] = expand
        if depth is not None:
            params["depth"] = depth
        if location is not None:
            params["location"] = location
        result = self._client.get(
            f"content/{content_id}/child/comment", params=params
        )
        log.info("get_child_comments succeeded", {"content_id": content_id})
        return result

    def get_descendants(self, content_id: str, expand: str | None = None) -> dict:
        """Retrieve all descendants of a piece of content."""
        log.debug("get_descendants called", {"content_id": content_id, "expand": expand})
        params: dict[str, Any] = {}
        if expand is not None:
            params["expand"] = expand
        result = self._client.get(
            f"content/{content_id}/descendant", params=params or None
        )
        log.info("get_descendants succeeded", {"content_id": content_id})
        return result

    def get_descendants_by_type(
        self,
        content_id: str,
        desc_type: str,
        expand: str | None = None,
    ) -> dict:
        """Retrieve descendants of a specific type."""
        log.debug("get_descendants_by_type called", {
            "content_id": content_id,
            "desc_type": desc_type,
            "expand": expand,
        })
        params: dict[str, Any] = {}
        if expand is not None:
            params["expand"] = expand
        result = self._client.get(
            f"content/{content_id}/descendant/{desc_type}", params=params or None
        )
        log.info("get_descendants_by_type succeeded", {
            "content_id": content_id,
            "desc_type": desc_type,
        })
        return result

    # ── Content Labels ───────────────────────────────────────────────────

    def get_labels(
        self,
        content_id: str,
        prefix: str | None = None,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """Retrieve labels for a piece of content."""
        log.debug("get_labels called", {
            "content_id": content_id,
            "prefix": prefix,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"start": start, "limit": limit}
        if prefix is not None:
            params["prefix"] = prefix
        result = self._client.get(f"content/{content_id}/label", params=params)
        log.info("get_labels succeeded", {"content_id": content_id})
        return result

    def add_labels(self, content_id: str, labels: list[dict]) -> dict:
        """Add labels to a piece of content."""
        log.debug("add_labels called", {"content_id": content_id, "count": len(labels)})
        result = self._client.post(f"content/{content_id}/label", json_data=labels)
        log.info("add_labels succeeded", {"content_id": content_id, "count": len(labels)})
        return result

    def delete_label_by_name(self, content_id: str, name: str) -> dict:
        """Delete a label from content by label name (query param)."""
        log.debug("delete_label_by_name called", {"content_id": content_id, "name": name})
        result = self._client.delete(
            f"content/{content_id}/label", params={"name": name}
        )
        log.info("delete_label_by_name succeeded", {"content_id": content_id, "name": name})
        return result

    def delete_label(self, content_id: str, label: str) -> dict:
        """Delete a label from content by label name (path param)."""
        log.debug("delete_label called", {"content_id": content_id, "label": label})
        result = self._client.delete(f"content/{content_id}/label/{label}")
        log.info("delete_label succeeded", {"content_id": content_id, "label": label})
        return result

    # ── Content Properties ───────────────────────────────────────────────

    def get_properties(self, content_id: str, expand: str | None = None) -> dict:
        """Retrieve all properties for a piece of content."""
        log.debug("get_properties called", {"content_id": content_id, "expand": expand})
        params: dict[str, Any] = {}
        if expand is not None:
            params["expand"] = expand
        result = self._client.get(
            f"content/{content_id}/property", params=params or None
        )
        log.info("get_properties succeeded", {"content_id": content_id})
        return result

    def create_property(self, content_id: str, data: dict) -> dict:
        """Create a new content property."""
        log.debug("create_property called", {
            "content_id": content_id,
            "key": data.get("key"),
        })
        result = self._client.post(f"content/{content_id}/property", json_data=data)
        log.info("create_property succeeded", {"content_id": content_id})
        return result

    def get_property(self, content_id: str, key: str, expand: str | None = None) -> dict:
        """Retrieve a specific content property by key."""
        log.debug("get_property called", {"content_id": content_id, "key": key, "expand": expand})
        params: dict[str, Any] = {}
        if expand is not None:
            params["expand"] = expand
        result = self._client.get(
            f"content/{content_id}/property/{key}", params=params or None
        )
        log.info("get_property succeeded", {"content_id": content_id, "key": key})
        return result

    def update_property(self, content_id: str, key: str, data: dict) -> dict:
        """Update an existing content property."""
        log.debug("update_property called", {"content_id": content_id, "key": key})
        result = self._client.put(
            f"content/{content_id}/property/{key}", json_data=data
        )
        log.info("update_property succeeded", {"content_id": content_id, "key": key})
        return result

    def create_property_for_key(self, content_id: str, key: str, data: dict) -> dict:
        """Create a content property for a specific key (POST to keyed endpoint)."""
        log.debug("create_property_for_key called", {"content_id": content_id, "key": key})
        result = self._client.post(
            f"content/{content_id}/property/{key}", json_data=data
        )
        log.info("create_property_for_key succeeded", {"content_id": content_id, "key": key})
        return result

    def delete_property(self, content_id: str, key: str) -> dict:
        """Delete a content property by key."""
        log.debug("delete_property called", {"content_id": content_id, "key": key})
        result = self._client.delete(f"content/{content_id}/property/{key}")
        log.info("delete_property succeeded", {"content_id": content_id, "key": key})
        return result

    # ── Content Restrictions ─────────────────────────────────────────────

    def get_restrictions_by_operation(self, content_id: str) -> dict:
        """Retrieve all restrictions grouped by operation for a piece of content."""
        log.debug("get_restrictions_by_operation called", {"content_id": content_id})
        result = self._client.get(f"content/{content_id}/restriction/byOperation")
        log.info("get_restrictions_by_operation succeeded", {"content_id": content_id})
        return result

    def get_restrictions_for_operation(self, content_id: str, operation_key: str) -> dict:
        """Retrieve restrictions for a specific operation (read, update, etc.)."""
        log.debug("get_restrictions_for_operation called", {
            "content_id": content_id,
            "operation_key": operation_key,
        })
        result = self._client.get(
            f"content/{content_id}/restriction/byOperation/{operation_key}"
        )
        log.info("get_restrictions_for_operation succeeded", {
            "content_id": content_id,
            "operation_key": operation_key,
        })
        return result

    def update_restrictions(self, content_id: str, data: list[dict]) -> dict:
        """Update restrictions for a piece of content."""
        log.debug("update_restrictions called", {"content_id": content_id})
        result = self._client.put(
            f"content/{content_id}/restriction", json_data=data
        )
        log.info("update_restrictions succeeded", {"content_id": content_id})
        return result

    # ── Content Body Conversion ──────────────────────────────────────────

    def convert_content_body(self, to_format: str, data: dict) -> dict:
        """Convert content body to a specified representation format."""
        log.debug("convert_content_body called", {"to_format": to_format})
        result = self._client.post(f"contentbody/convert/{to_format}", json_data=data)
        log.info("convert_content_body succeeded", {"to_format": to_format})
        return result

    # ── Content Version ──────────────────────────────────────────────────

    def delete_content_version(self, content_id: str, version_number: int) -> dict:
        """Delete a historical content version."""
        log.debug("delete_content_version called", {
            "content_id": content_id,
            "version_number": version_number,
        })
        result = self._client.delete(
            f"content/{content_id}/version/{version_number}"
        )
        log.info("delete_content_version succeeded", {
            "content_id": content_id,
            "version_number": version_number,
        })
        return result

    # ── Content Blueprint ────────────────────────────────────────────────

    def publish_shared_draft(self, draft_id: str, data: dict) -> dict:
        """Publish a shared draft created from a content blueprint."""
        log.debug("publish_shared_draft called", {"draft_id": draft_id})
        result = self._client.post(
            f"content/blueprint/instance/{draft_id}", json_data=data
        )
        log.info("publish_shared_draft succeeded", {"draft_id": draft_id})
        return result

    def publish_legacy_draft(self, draft_id: str, data: dict) -> dict:
        """Publish a legacy draft created from a content blueprint."""
        log.debug("publish_legacy_draft called", {"draft_id": draft_id})
        result = self._client.post(
            f"content/blueprint/instance/{draft_id}", json_data=data,
            params={"status": "draft"},
        )
        log.info("publish_legacy_draft succeeded", {"draft_id": draft_id})
        return result


class AsyncContentService:
    """Async service for Confluence content operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    # ── Content CRUD ─────────────────────────────────────────────────────

    async def get_contents(
        self,
        type: str | None = None,
        space_key: str | None = None,
        title: str | None = None,
        status: str | None = None,
        expand: str | None = None,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """Retrieve a paginated list of content."""
        log.debug("get_contents called", {
            "type": type,
            "space_key": space_key,
            "title": title,
            "status": status,
            "expand": expand,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"start": start, "limit": limit}
        if type is not None:
            params["type"] = type
        if space_key is not None:
            params["spaceKey"] = space_key
        if title is not None:
            params["title"] = title
        if status is not None:
            params["status"] = status
        if expand is not None:
            params["expand"] = expand
        result = await self._client.get("content", params=params)
        log.info("get_contents succeeded", {"start": start, "limit": limit})
        return result

    async def create_content(self, data: dict) -> dict:
        """Create a new piece of content (page, blog post, comment, etc.)."""
        log.debug("create_content called", {"type": data.get("type"), "title": data.get("title")})
        result = await self._client.post("content", json_data=data)
        log.info("create_content succeeded", {"id": result.get("id")})
        return result

    async def get_content(self, content_id: str, expand: str | None = None) -> dict:
        """Retrieve a single piece of content by ID."""
        log.debug("get_content called", {"content_id": content_id, "expand": expand})
        params: dict[str, Any] = {}
        if expand is not None:
            params["expand"] = expand
        result = await self._client.get(f"content/{content_id}", params=params or None)
        log.info("get_content succeeded", {"content_id": content_id})
        return result

    async def update_content(self, content_id: str, data: dict) -> dict:
        """Update an existing piece of content."""
        log.debug("update_content called", {"content_id": content_id})
        result = await self._client.put(f"content/{content_id}", json_data=data)
        log.info("update_content succeeded", {"content_id": content_id})
        return result

    async def delete_content(self, content_id: str, status: str | None = None) -> dict:
        """Delete a piece of content. Optionally specify status (e.g. 'trashed')."""
        log.debug("delete_content called", {"content_id": content_id, "status": status})
        params: dict[str, Any] = {}
        if status is not None:
            params["status"] = status
        result = await self._client.delete(f"content/{content_id}", params=params or None)
        log.info("delete_content succeeded", {"content_id": content_id})
        return result

    async def get_content_history(self, content_id: str, expand: str | None = None) -> dict:
        """Retrieve the history of a piece of content."""
        log.debug("get_content_history called", {"content_id": content_id, "expand": expand})
        params: dict[str, Any] = {}
        if expand is not None:
            params["expand"] = expand
        result = await self._client.get(f"content/{content_id}/history", params=params or None)
        log.info("get_content_history succeeded", {"content_id": content_id})
        return result

    async def get_macro_by_id(self, content_id: str, version: int, macro_id: str) -> dict:
        """Retrieve a macro in a piece of content by macro ID and version."""
        log.debug("get_macro_by_id called", {
            "content_id": content_id,
            "version": version,
            "macro_id": macro_id,
        })
        result = await self._client.get(
            f"content/{content_id}/history/{version}/macro/id/{macro_id}"
        )
        log.info("get_macro_by_id succeeded", {"content_id": content_id, "macro_id": macro_id})
        return result

    # ── Child Content & Descendants ──────────────────────────────────────

    async def get_child_content(self, content_id: str, expand: str | None = None) -> dict:
        """Retrieve all child content for a given piece of content."""
        log.debug("get_child_content called", {"content_id": content_id, "expand": expand})
        params: dict[str, Any] = {}
        if expand is not None:
            params["expand"] = expand
        result = await self._client.get(f"content/{content_id}/child", params=params or None)
        log.info("get_child_content succeeded", {"content_id": content_id})
        return result

    async def get_child_content_by_type(
        self,
        content_id: str,
        child_type: str,
        expand: str | None = None,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """Retrieve child content of a specific type (page, comment, attachment)."""
        log.debug("get_child_content_by_type called", {
            "content_id": content_id,
            "child_type": child_type,
            "expand": expand,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"start": start, "limit": limit}
        if expand is not None:
            params["expand"] = expand
        result = await self._client.get(
            f"content/{content_id}/child/{child_type}", params=params
        )
        log.info("get_child_content_by_type succeeded", {
            "content_id": content_id,
            "child_type": child_type,
        })
        return result

    async def get_child_comments(
        self,
        content_id: str,
        expand: str | None = None,
        start: int = 0,
        limit: int = 25,
        depth: str | None = None,
        location: str | None = None,
    ) -> dict:
        """Retrieve child comments of a piece of content."""
        log.debug("get_child_comments called", {
            "content_id": content_id,
            "expand": expand,
            "start": start,
            "limit": limit,
            "depth": depth,
            "location": location,
        })
        params: dict[str, Any] = {"start": start, "limit": limit}
        if expand is not None:
            params["expand"] = expand
        if depth is not None:
            params["depth"] = depth
        if location is not None:
            params["location"] = location
        result = await self._client.get(
            f"content/{content_id}/child/comment", params=params
        )
        log.info("get_child_comments succeeded", {"content_id": content_id})
        return result

    async def get_descendants(self, content_id: str, expand: str | None = None) -> dict:
        """Retrieve all descendants of a piece of content."""
        log.debug("get_descendants called", {"content_id": content_id, "expand": expand})
        params: dict[str, Any] = {}
        if expand is not None:
            params["expand"] = expand
        result = await self._client.get(
            f"content/{content_id}/descendant", params=params or None
        )
        log.info("get_descendants succeeded", {"content_id": content_id})
        return result

    async def get_descendants_by_type(
        self,
        content_id: str,
        desc_type: str,
        expand: str | None = None,
    ) -> dict:
        """Retrieve descendants of a specific type."""
        log.debug("get_descendants_by_type called", {
            "content_id": content_id,
            "desc_type": desc_type,
            "expand": expand,
        })
        params: dict[str, Any] = {}
        if expand is not None:
            params["expand"] = expand
        result = await self._client.get(
            f"content/{content_id}/descendant/{desc_type}", params=params or None
        )
        log.info("get_descendants_by_type succeeded", {
            "content_id": content_id,
            "desc_type": desc_type,
        })
        return result

    # ── Content Labels ───────────────────────────────────────────────────

    async def get_labels(
        self,
        content_id: str,
        prefix: str | None = None,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """Retrieve labels for a piece of content."""
        log.debug("get_labels called", {
            "content_id": content_id,
            "prefix": prefix,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"start": start, "limit": limit}
        if prefix is not None:
            params["prefix"] = prefix
        result = await self._client.get(f"content/{content_id}/label", params=params)
        log.info("get_labels succeeded", {"content_id": content_id})
        return result

    async def add_labels(self, content_id: str, labels: list[dict]) -> dict:
        """Add labels to a piece of content."""
        log.debug("add_labels called", {"content_id": content_id, "count": len(labels)})
        result = await self._client.post(f"content/{content_id}/label", json_data=labels)
        log.info("add_labels succeeded", {"content_id": content_id, "count": len(labels)})
        return result

    async def delete_label_by_name(self, content_id: str, name: str) -> dict:
        """Delete a label from content by label name (query param)."""
        log.debug("delete_label_by_name called", {"content_id": content_id, "name": name})
        result = await self._client.delete(
            f"content/{content_id}/label", params={"name": name}
        )
        log.info("delete_label_by_name succeeded", {"content_id": content_id, "name": name})
        return result

    async def delete_label(self, content_id: str, label: str) -> dict:
        """Delete a label from content by label name (path param)."""
        log.debug("delete_label called", {"content_id": content_id, "label": label})
        result = await self._client.delete(f"content/{content_id}/label/{label}")
        log.info("delete_label succeeded", {"content_id": content_id, "label": label})
        return result

    # ── Content Properties ───────────────────────────────────────────────

    async def get_properties(self, content_id: str, expand: str | None = None) -> dict:
        """Retrieve all properties for a piece of content."""
        log.debug("get_properties called", {"content_id": content_id, "expand": expand})
        params: dict[str, Any] = {}
        if expand is not None:
            params["expand"] = expand
        result = await self._client.get(
            f"content/{content_id}/property", params=params or None
        )
        log.info("get_properties succeeded", {"content_id": content_id})
        return result

    async def create_property(self, content_id: str, data: dict) -> dict:
        """Create a new content property."""
        log.debug("create_property called", {
            "content_id": content_id,
            "key": data.get("key"),
        })
        result = await self._client.post(f"content/{content_id}/property", json_data=data)
        log.info("create_property succeeded", {"content_id": content_id})
        return result

    async def get_property(self, content_id: str, key: str, expand: str | None = None) -> dict:
        """Retrieve a specific content property by key."""
        log.debug("get_property called", {"content_id": content_id, "key": key, "expand": expand})
        params: dict[str, Any] = {}
        if expand is not None:
            params["expand"] = expand
        result = await self._client.get(
            f"content/{content_id}/property/{key}", params=params or None
        )
        log.info("get_property succeeded", {"content_id": content_id, "key": key})
        return result

    async def update_property(self, content_id: str, key: str, data: dict) -> dict:
        """Update an existing content property."""
        log.debug("update_property called", {"content_id": content_id, "key": key})
        result = await self._client.put(
            f"content/{content_id}/property/{key}", json_data=data
        )
        log.info("update_property succeeded", {"content_id": content_id, "key": key})
        return result

    async def create_property_for_key(self, content_id: str, key: str, data: dict) -> dict:
        """Create a content property for a specific key (POST to keyed endpoint)."""
        log.debug("create_property_for_key called", {"content_id": content_id, "key": key})
        result = await self._client.post(
            f"content/{content_id}/property/{key}", json_data=data
        )
        log.info("create_property_for_key succeeded", {"content_id": content_id, "key": key})
        return result

    async def delete_property(self, content_id: str, key: str) -> dict:
        """Delete a content property by key."""
        log.debug("delete_property called", {"content_id": content_id, "key": key})
        result = await self._client.delete(f"content/{content_id}/property/{key}")
        log.info("delete_property succeeded", {"content_id": content_id, "key": key})
        return result

    # ── Content Restrictions ─────────────────────────────────────────────

    async def get_restrictions_by_operation(self, content_id: str) -> dict:
        """Retrieve all restrictions grouped by operation for a piece of content."""
        log.debug("get_restrictions_by_operation called", {"content_id": content_id})
        result = await self._client.get(f"content/{content_id}/restriction/byOperation")
        log.info("get_restrictions_by_operation succeeded", {"content_id": content_id})
        return result

    async def get_restrictions_for_operation(self, content_id: str, operation_key: str) -> dict:
        """Retrieve restrictions for a specific operation (read, update, etc.)."""
        log.debug("get_restrictions_for_operation called", {
            "content_id": content_id,
            "operation_key": operation_key,
        })
        result = await self._client.get(
            f"content/{content_id}/restriction/byOperation/{operation_key}"
        )
        log.info("get_restrictions_for_operation succeeded", {
            "content_id": content_id,
            "operation_key": operation_key,
        })
        return result

    async def update_restrictions(self, content_id: str, data: list[dict]) -> dict:
        """Update restrictions for a piece of content."""
        log.debug("update_restrictions called", {"content_id": content_id})
        result = await self._client.put(
            f"content/{content_id}/restriction", json_data=data
        )
        log.info("update_restrictions succeeded", {"content_id": content_id})
        return result

    # ── Content Body Conversion ──────────────────────────────────────────

    async def convert_content_body(self, to_format: str, data: dict) -> dict:
        """Convert content body to a specified representation format."""
        log.debug("convert_content_body called", {"to_format": to_format})
        result = await self._client.post(f"contentbody/convert/{to_format}", json_data=data)
        log.info("convert_content_body succeeded", {"to_format": to_format})
        return result

    # ── Content Version ──────────────────────────────────────────────────

    async def delete_content_version(self, content_id: str, version_number: int) -> dict:
        """Delete a historical content version."""
        log.debug("delete_content_version called", {
            "content_id": content_id,
            "version_number": version_number,
        })
        result = await self._client.delete(
            f"content/{content_id}/version/{version_number}"
        )
        log.info("delete_content_version succeeded", {
            "content_id": content_id,
            "version_number": version_number,
        })
        return result

    # ── Content Blueprint ────────────────────────────────────────────────

    async def publish_shared_draft(self, draft_id: str, data: dict) -> dict:
        """Publish a shared draft created from a content blueprint."""
        log.debug("publish_shared_draft called", {"draft_id": draft_id})
        result = await self._client.post(
            f"content/blueprint/instance/{draft_id}", json_data=data
        )
        log.info("publish_shared_draft succeeded", {"draft_id": draft_id})
        return result

    async def publish_legacy_draft(self, draft_id: str, data: dict) -> dict:
        """Publish a legacy draft created from a content blueprint."""
        log.debug("publish_legacy_draft called", {"draft_id": draft_id})
        result = await self._client.post(
            f"content/blueprint/instance/{draft_id}", json_data=data,
            params={"status": "draft"},
        )
        log.info("publish_legacy_draft succeeded", {"draft_id": draft_id})
        return result
