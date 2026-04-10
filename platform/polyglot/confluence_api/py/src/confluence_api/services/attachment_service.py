"""
Attachment service for Confluence Data Center REST API v9.2.3.

Provides operations for managing file attachments on content: listing,
uploading, updating data/metadata, moving, and deleting attachments.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from confluence_api.logger import create_logger
from confluence_api.multipart import _guess_content_type, build_multipart_data

log = create_logger("confluence_api", __file__)


class AttachmentService:
    """Service for Confluence attachment operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    def get_attachments(
        self,
        content_id: str,
        expand: str | None = None,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """Retrieve attachments for a piece of content."""
        log.debug("get_attachments called", {
            "content_id": content_id,
            "expand": expand,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"start": start, "limit": limit}
        if expand is not None:
            params["expand"] = expand
        result = self._client.get(
            f"content/{content_id}/child/attachment", params=params
        )
        log.info("get_attachments succeeded", {"content_id": content_id})
        return result

    def create_attachment(
        self,
        content_id: str,
        file_path: str,
        comment: str | None = None,
        minor_edit: bool = False,
    ) -> dict:
        """
        Upload a new attachment to a piece of content.

        Uses multipart form upload. The file is read from disk at file_path.

        Args:
            content_id: The content ID to attach the file to.
            file_path: Path to the file on disk.
            comment: Optional comment for the attachment version.
            minor_edit: If True, marks as a minor edit (suppresses notifications).

        Returns:
            Created attachment metadata dict.
        """
        log.debug("create_attachment called", {
            "content_id": content_id,
            "file_path": file_path,
            "comment": comment,
            "minor_edit": minor_edit,
        })
        path = Path(file_path)
        file_bytes = path.read_bytes()
        content_type = _guess_content_type(path.name)

        files_dict, data_dict = build_multipart_data(
            file_content=file_bytes,
            filename=path.name,
            content_type=content_type,
            comment=comment,
            minor_edit=minor_edit,
        )
        result = self._client.post(
            f"content/{content_id}/child/attachment",
            json_data=data_dict or None,
            files=files_dict,
        )
        log.info("create_attachment succeeded", {
            "content_id": content_id,
            "filename": path.name,
        })
        return result

    def update_attachment_data(
        self,
        content_id: str,
        attachment_id: str,
        file_path: str,
        comment: str | None = None,
        minor_edit: bool = False,
    ) -> dict:
        """
        Update the binary data of an existing attachment.

        Args:
            content_id: The parent content ID.
            attachment_id: The attachment ID to update.
            file_path: Path to the new file on disk.
            comment: Optional comment for the new version.
            minor_edit: If True, marks as a minor edit.

        Returns:
            Updated attachment metadata dict.
        """
        log.debug("update_attachment_data called", {
            "content_id": content_id,
            "attachment_id": attachment_id,
            "file_path": file_path,
        })
        path = Path(file_path)
        file_bytes = path.read_bytes()
        content_type = _guess_content_type(path.name)

        files_dict, data_dict = build_multipart_data(
            file_content=file_bytes,
            filename=path.name,
            content_type=content_type,
            comment=comment,
            minor_edit=minor_edit,
        )
        result = self._client.post(
            f"content/{content_id}/child/attachment/{attachment_id}/data",
            json_data=data_dict or None,
            files=files_dict,
        )
        log.info("update_attachment_data succeeded", {
            "content_id": content_id,
            "attachment_id": attachment_id,
        })
        return result

    def update_attachment_metadata(
        self,
        content_id: str,
        attachment_id: str,
        data: dict,
    ) -> dict:
        """Update the metadata (title, media type, etc.) of an attachment."""
        log.debug("update_attachment_metadata called", {
            "content_id": content_id,
            "attachment_id": attachment_id,
        })
        result = self._client.put(
            f"content/{content_id}/child/attachment/{attachment_id}",
            json_data=data,
        )
        log.info("update_attachment_metadata succeeded", {
            "content_id": content_id,
            "attachment_id": attachment_id,
        })
        return result

    def move_attachment(
        self,
        content_id: str,
        attachment_id: str,
        new_content_id: str,
    ) -> dict:
        """Move an attachment to a different piece of content."""
        log.debug("move_attachment called", {
            "content_id": content_id,
            "attachment_id": attachment_id,
            "new_content_id": new_content_id,
        })
        data = {"id": attachment_id, "container": {"id": new_content_id, "type": "page"}}
        result = self._client.put(
            f"content/{content_id}/child/attachment/{attachment_id}",
            json_data=data,
        )
        log.info("move_attachment succeeded", {
            "attachment_id": attachment_id,
            "new_content_id": new_content_id,
        })
        return result

    def delete_attachment(self, content_id: str, attachment_id: str) -> dict:
        """Delete an attachment from a piece of content."""
        log.debug("delete_attachment called", {
            "content_id": content_id,
            "attachment_id": attachment_id,
        })
        result = self._client.delete(
            f"content/{content_id}/child/attachment/{attachment_id}"
        )
        log.info("delete_attachment succeeded", {
            "content_id": content_id,
            "attachment_id": attachment_id,
        })
        return result

    def delete_attachment_version(
        self,
        content_id: str,
        attachment_id: str,
        version: int,
    ) -> dict:
        """Delete a specific version of an attachment."""
        log.debug("delete_attachment_version called", {
            "content_id": content_id,
            "attachment_id": attachment_id,
            "version": version,
        })
        result = self._client.delete(
            f"content/{content_id}/child/attachment/{attachment_id}/version/{version}"
        )
        log.info("delete_attachment_version succeeded", {
            "content_id": content_id,
            "attachment_id": attachment_id,
            "version": version,
        })
        return result


class AsyncAttachmentService:
    """Async service for Confluence attachment operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    async def get_attachments(
        self,
        content_id: str,
        expand: str | None = None,
        start: int = 0,
        limit: int = 25,
    ) -> dict:
        """Retrieve attachments for a piece of content."""
        log.debug("get_attachments called", {
            "content_id": content_id,
            "expand": expand,
            "start": start,
            "limit": limit,
        })
        params: dict[str, Any] = {"start": start, "limit": limit}
        if expand is not None:
            params["expand"] = expand
        result = await self._client.get(
            f"content/{content_id}/child/attachment", params=params
        )
        log.info("get_attachments succeeded", {"content_id": content_id})
        return result

    async def create_attachment(
        self,
        content_id: str,
        file_path: str,
        comment: str | None = None,
        minor_edit: bool = False,
    ) -> dict:
        """
        Upload a new attachment to a piece of content.

        Uses multipart form upload. The file is read from disk at file_path.

        Args:
            content_id: The content ID to attach the file to.
            file_path: Path to the file on disk.
            comment: Optional comment for the attachment version.
            minor_edit: If True, marks as a minor edit (suppresses notifications).

        Returns:
            Created attachment metadata dict.
        """
        log.debug("create_attachment called", {
            "content_id": content_id,
            "file_path": file_path,
            "comment": comment,
            "minor_edit": minor_edit,
        })
        path = Path(file_path)
        file_bytes = path.read_bytes()
        content_type = _guess_content_type(path.name)

        files_dict, data_dict = build_multipart_data(
            file_content=file_bytes,
            filename=path.name,
            content_type=content_type,
            comment=comment,
            minor_edit=minor_edit,
        )
        result = await self._client.post(
            f"content/{content_id}/child/attachment",
            json_data=data_dict or None,
            files=files_dict,
        )
        log.info("create_attachment succeeded", {
            "content_id": content_id,
            "filename": path.name,
        })
        return result

    async def update_attachment_data(
        self,
        content_id: str,
        attachment_id: str,
        file_path: str,
        comment: str | None = None,
        minor_edit: bool = False,
    ) -> dict:
        """
        Update the binary data of an existing attachment.

        Args:
            content_id: The parent content ID.
            attachment_id: The attachment ID to update.
            file_path: Path to the new file on disk.
            comment: Optional comment for the new version.
            minor_edit: If True, marks as a minor edit.

        Returns:
            Updated attachment metadata dict.
        """
        log.debug("update_attachment_data called", {
            "content_id": content_id,
            "attachment_id": attachment_id,
            "file_path": file_path,
        })
        path = Path(file_path)
        file_bytes = path.read_bytes()
        content_type = _guess_content_type(path.name)

        files_dict, data_dict = build_multipart_data(
            file_content=file_bytes,
            filename=path.name,
            content_type=content_type,
            comment=comment,
            minor_edit=minor_edit,
        )
        result = await self._client.post(
            f"content/{content_id}/child/attachment/{attachment_id}/data",
            json_data=data_dict or None,
            files=files_dict,
        )
        log.info("update_attachment_data succeeded", {
            "content_id": content_id,
            "attachment_id": attachment_id,
        })
        return result

    async def update_attachment_metadata(
        self,
        content_id: str,
        attachment_id: str,
        data: dict,
    ) -> dict:
        """Update the metadata (title, media type, etc.) of an attachment."""
        log.debug("update_attachment_metadata called", {
            "content_id": content_id,
            "attachment_id": attachment_id,
        })
        result = await self._client.put(
            f"content/{content_id}/child/attachment/{attachment_id}",
            json_data=data,
        )
        log.info("update_attachment_metadata succeeded", {
            "content_id": content_id,
            "attachment_id": attachment_id,
        })
        return result

    async def move_attachment(
        self,
        content_id: str,
        attachment_id: str,
        new_content_id: str,
    ) -> dict:
        """Move an attachment to a different piece of content."""
        log.debug("move_attachment called", {
            "content_id": content_id,
            "attachment_id": attachment_id,
            "new_content_id": new_content_id,
        })
        data = {"id": attachment_id, "container": {"id": new_content_id, "type": "page"}}
        result = await self._client.put(
            f"content/{content_id}/child/attachment/{attachment_id}",
            json_data=data,
        )
        log.info("move_attachment succeeded", {
            "attachment_id": attachment_id,
            "new_content_id": new_content_id,
        })
        return result

    async def delete_attachment(self, content_id: str, attachment_id: str) -> dict:
        """Delete an attachment from a piece of content."""
        log.debug("delete_attachment called", {
            "content_id": content_id,
            "attachment_id": attachment_id,
        })
        result = await self._client.delete(
            f"content/{content_id}/child/attachment/{attachment_id}"
        )
        log.info("delete_attachment succeeded", {
            "content_id": content_id,
            "attachment_id": attachment_id,
        })
        return result

    async def delete_attachment_version(
        self,
        content_id: str,
        attachment_id: str,
        version: int,
    ) -> dict:
        """Delete a specific version of an attachment."""
        log.debug("delete_attachment_version called", {
            "content_id": content_id,
            "attachment_id": attachment_id,
            "version": version,
        })
        result = await self._client.delete(
            f"content/{content_id}/child/attachment/{attachment_id}/version/{version}"
        )
        log.info("delete_attachment_version succeeded", {
            "content_id": content_id,
            "attachment_id": attachment_id,
            "version": version,
        })
        return result
