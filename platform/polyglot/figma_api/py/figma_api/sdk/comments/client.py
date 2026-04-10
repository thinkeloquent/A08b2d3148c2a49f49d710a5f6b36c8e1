"""
Comments Module — Figma API SDK

Wraps file comment listing, creation, and deletion endpoints.
"""
from typing import Any, Dict, List, Optional

from ...logger import create_logger

log = create_logger("figma-api", __file__)


class CommentsClient:
    """Client for Figma Comments API endpoints."""

    def __init__(self, client, *, logger=None):
        self._client = client
        self._log = logger or log

    async def list_comments(
        self,
        file_key: str,
        *,
        as_md: Optional[bool] = None,
    ) -> Dict[str, Any]:
        """List all comments on a file.

        GET /v1/files/{file_key}/comments
        """
        self._log.info("listing comments", file_key=file_key, as_md=as_md)
        params: Dict[str, Any] = {}
        if as_md is not None:
            params["as_md"] = str(as_md).lower()

        result = await self._client.get(
            f"/v1/files/{file_key}/comments", params=params or None
        )
        comment_count = len(result.get("comments", []))
        self._log.debug(
            "comments listed",
            file_key=file_key,
            comment_count=comment_count,
        )
        return result

    async def add_comment(
        self,
        file_key: str,
        *,
        message: str,
        client_meta: Optional[Dict[str, Any]] = None,
        comment_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Add a comment to a file.

        POST /v1/files/{file_key}/comments
        """
        self._log.info(
            "adding comment",
            file_key=file_key,
            reply_to=comment_id,
        )
        body: Dict[str, Any] = {"message": message}
        if client_meta is not None:
            body["client_meta"] = client_meta
        if comment_id is not None:
            body["comment_id"] = comment_id

        result = await self._client.post(
            f"/v1/files/{file_key}/comments", body
        )
        self._log.debug(
            "comment added",
            file_key=file_key,
            comment_id=result.get("id"),
        )
        return result

    async def delete_comment(
        self,
        file_key: str,
        comment_id: str,
    ) -> Dict[str, Any]:
        """Delete a comment from a file.

        DELETE /v1/files/{file_key}/comments/{comment_id}
        """
        self._log.info(
            "deleting comment",
            file_key=file_key,
            comment_id=comment_id,
        )
        result = await self._client.delete(
            f"/v1/files/{file_key}/comments/{comment_id}"
        )
        self._log.debug(
            "comment deleted",
            file_key=file_key,
            comment_id=comment_id,
        )
        return result
