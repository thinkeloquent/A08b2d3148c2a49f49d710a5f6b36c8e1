"""
Variables Module — Figma API SDK

Wraps variable retrieval and creation endpoints (Enterprise only).
"""
from typing import Any, Dict, List, Optional

from ...logger import create_logger

log = create_logger("figma-api", __file__)


class VariablesClient:
    """Client for Figma Variables API endpoints (Enterprise)."""

    def __init__(self, client, *, logger=None):
        self._client = client
        self._log = logger or log

    async def get_local_variables(self, file_key: str) -> Dict[str, Any]:
        """Get all local variables in a file.

        GET /v1/files/{file_key}/variables/local
        """
        self._log.info("fetching local variables", file_key=file_key)
        result = await self._client.get(
            f"/v1/files/{file_key}/variables/local"
        )
        variable_count = len(
            result.get("meta", {}).get("variables", {})
        )
        self._log.debug(
            "local variables fetched",
            file_key=file_key,
            variable_count=variable_count,
        )
        return result

    async def get_published_variables(self, file_key: str) -> Dict[str, Any]:
        """Get all published variables in a file.

        GET /v1/files/{file_key}/variables/published
        """
        self._log.info("fetching published variables", file_key=file_key)
        result = await self._client.get(
            f"/v1/files/{file_key}/variables/published"
        )
        variable_count = len(
            result.get("meta", {}).get("variables", {})
        )
        self._log.debug(
            "published variables fetched",
            file_key=file_key,
            variable_count=variable_count,
        )
        return result

    async def create_variables(
        self,
        file_key: str,
        payload: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Create or update variables in a file.

        POST /v1/files/{file_key}/variables
        """
        self._log.info("creating variables", file_key=file_key)
        result = await self._client.post(
            f"/v1/files/{file_key}/variables", payload
        )
        self._log.debug(
            "variables created",
            file_key=file_key,
            status=result.get("status"),
        )
        return result
