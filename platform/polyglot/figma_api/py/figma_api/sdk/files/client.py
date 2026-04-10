"""
Files Module — Figma API SDK

Wraps file retrieval, node queries, image export, and version history endpoints.
"""
from typing import Any, Dict, List, Optional, Union

from ...logger import create_logger

log = create_logger("figma-api", __file__)


class FilesClient:
    """Client for Figma Files API endpoints."""

    def __init__(self, client, *, logger=None):
        self._client = client
        self._log = logger or log

    async def get_file(
        self,
        file_key: str,
        *,
        version: Optional[str] = None,
        ids: Optional[List[str]] = None,
        depth: Optional[int] = None,
        geometry: Optional[str] = None,
        plugin_data: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get a full Figma file.

        GET /v1/files/{file_key}
        """
        self._log.info("fetching file", file_key=file_key, version=version)
        params: Dict[str, Any] = {}
        if version is not None:
            params["version"] = version
        if ids is not None:
            params["ids"] = ",".join(ids)
        if depth is not None:
            params["depth"] = depth
        if geometry is not None:
            params["geometry"] = geometry
        if plugin_data is not None:
            params["plugin_data"] = plugin_data

        result = await self._client.get(
            f"/v1/files/{file_key}", params=params or None
        )
        self._log.debug(
            "file fetched",
            file_key=file_key,
            name=result.get("name"),
            version=result.get("version"),
        )
        return result

    async def get_file_nodes(
        self,
        file_key: str,
        ids: Union[str, List[str]],
        *,
        version: Optional[str] = None,
        depth: Optional[int] = None,
        geometry: Optional[str] = None,
        plugin_data: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get specific nodes from a file.

        GET /v1/files/{file_key}/nodes
        """
        ids_str = ids if isinstance(ids, str) else ",".join(ids)
        self._log.info(
            "fetching file nodes",
            file_key=file_key,
            ids=ids_str,
        )
        params: Dict[str, Any] = {"ids": ids_str}
        if version is not None:
            params["version"] = version
        if depth is not None:
            params["depth"] = depth
        if geometry is not None:
            params["geometry"] = geometry
        if plugin_data is not None:
            params["plugin_data"] = plugin_data

        result = await self._client.get(
            f"/v1/files/{file_key}/nodes", params=params
        )
        node_count = len(result.get("nodes", {}))
        self._log.debug(
            "file nodes fetched",
            file_key=file_key,
            node_count=node_count,
        )
        return result

    async def get_images(
        self,
        file_key: str,
        ids: Union[str, List[str]],
        *,
        scale: Optional[float] = None,
        format: Optional[str] = None,
        svg_options: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Export images from a file.

        GET /v1/images/{file_key}
        """
        ids_str = ids if isinstance(ids, str) else ",".join(ids)
        self._log.info(
            "exporting images",
            file_key=file_key,
            ids=ids_str,
            scale=scale,
            format=format,
        )
        params: Dict[str, Any] = {"ids": ids_str}
        if scale is not None:
            params["scale"] = scale
        if format is not None:
            params["format"] = format
        if svg_options is not None:
            for k, v in svg_options.items():
                params[k] = v

        result = await self._client.get(
            f"/v1/images/{file_key}", params=params
        )
        image_count = len(result.get("images", {}))
        self._log.debug(
            "images exported",
            file_key=file_key,
            image_count=image_count,
        )
        return result

    async def get_image_fills(self, file_key: str) -> Dict[str, Any]:
        """Get image fill URLs for a file.

        GET /v1/files/{file_key}/images
        """
        self._log.info("fetching image fills", file_key=file_key)
        result = await self._client.get(f"/v1/files/{file_key}/images")
        self._log.debug(
            "image fills fetched",
            file_key=file_key,
            has_images=bool(result.get("images")),
        )
        return result

    async def get_file_versions(self, file_key: str) -> Dict[str, Any]:
        """Get version history for a file.

        GET /v1/files/{file_key}/versions
        """
        self._log.info("fetching file versions", file_key=file_key)
        result = await self._client.get(f"/v1/files/{file_key}/versions")
        version_count = len(result.get("versions", []))
        self._log.debug(
            "file versions fetched",
            file_key=file_key,
            version_count=version_count,
        )
        return result
