"""
Color scheme service for Confluence Data Center REST API v9.2.3.

Provides operations for managing global and space-level color schemes
including retrieval, updates, and resets to default.
"""

from __future__ import annotations

from typing import Any

from confluence_api.logger import create_logger

log = create_logger("confluence_api", __file__)


class ColorSchemeService:
    """Service for Confluence color scheme operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    # ── Global Color Scheme ──────────────────────────────────────────────

    def get_default_color_scheme(self) -> dict:
        """Retrieve the system default color scheme."""
        log.debug("get_default_color_scheme called")
        result = self._client.get("settings/lookandfeel/default")
        log.info("get_default_color_scheme succeeded")
        return result

    def get_global_color_scheme(self) -> dict:
        """Retrieve the current global (custom) color scheme."""
        log.debug("get_global_color_scheme called")
        result = self._client.get("settings/lookandfeel/custom")
        log.info("get_global_color_scheme succeeded")
        return result

    def update_global_color_scheme(self, data: dict) -> dict:
        """
        Update the global color scheme.

        Args:
            data: Color scheme configuration dict containing color values.

        Returns:
            Updated color scheme dict.
        """
        log.debug("update_global_color_scheme called")
        result = self._client.put("settings/lookandfeel/custom", json_data=data)
        log.info("update_global_color_scheme succeeded")
        return result

    def reset_global_color_scheme(self) -> dict:
        """Reset the global color scheme to the system default."""
        log.debug("reset_global_color_scheme called")
        result = self._client.delete("settings/lookandfeel/custom")
        log.info("reset_global_color_scheme succeeded")
        return result

    # ── Space Color Scheme ───────────────────────────────────────────────

    def get_space_color_scheme_type(self, space_key: str) -> dict:
        """
        Retrieve the color scheme type for a space (default or custom).

        Args:
            space_key: The space key.

        Returns:
            Dict indicating whether the space uses default or custom scheme.
        """
        log.debug("get_space_color_scheme_type called", {"space_key": space_key})
        result = self._client.get(f"settings/lookandfeel/space/{space_key}/type")
        log.info("get_space_color_scheme_type succeeded", {"space_key": space_key})
        return result

    def set_space_color_scheme_type(self, space_key: str, data: dict) -> dict:
        """
        Set the color scheme type for a space (default or custom).

        Args:
            space_key: The space key.
            data: Dict with the type setting (e.g. {"colorSchemeType": "custom"}).

        Returns:
            Updated type setting dict.
        """
        log.debug("set_space_color_scheme_type called", {"space_key": space_key})
        result = self._client.put(
            f"settings/lookandfeel/space/{space_key}/type", json_data=data
        )
        log.info("set_space_color_scheme_type succeeded", {"space_key": space_key})
        return result

    def get_space_color_scheme(self, space_key: str) -> dict:
        """Retrieve the custom color scheme for a space."""
        log.debug("get_space_color_scheme called", {"space_key": space_key})
        result = self._client.get(f"settings/lookandfeel/space/{space_key}/custom")
        log.info("get_space_color_scheme succeeded", {"space_key": space_key})
        return result

    def update_space_color_scheme(self, space_key: str, data: dict) -> dict:
        """
        Update the custom color scheme for a space.

        Args:
            space_key: The space key.
            data: Color scheme configuration dict containing color values.

        Returns:
            Updated color scheme dict.
        """
        log.debug("update_space_color_scheme called", {"space_key": space_key})
        result = self._client.put(
            f"settings/lookandfeel/space/{space_key}/custom", json_data=data
        )
        log.info("update_space_color_scheme succeeded", {"space_key": space_key})
        return result

    def reset_space_color_scheme(self, space_key: str) -> dict:
        """Reset the space color scheme back to the global default."""
        log.debug("reset_space_color_scheme called", {"space_key": space_key})
        result = self._client.delete(
            f"settings/lookandfeel/space/{space_key}/custom"
        )
        log.info("reset_space_color_scheme succeeded", {"space_key": space_key})
        return result


class AsyncColorSchemeService:
    """Async service for Confluence color scheme operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    # ── Global Color Scheme ──────────────────────────────────────────────

    async def get_default_color_scheme(self) -> dict:
        """Retrieve the system default color scheme."""
        log.debug("get_default_color_scheme called")
        result = await self._client.get("settings/lookandfeel/default")
        log.info("get_default_color_scheme succeeded")
        return result

    async def get_global_color_scheme(self) -> dict:
        """Retrieve the current global (custom) color scheme."""
        log.debug("get_global_color_scheme called")
        result = await self._client.get("settings/lookandfeel/custom")
        log.info("get_global_color_scheme succeeded")
        return result

    async def update_global_color_scheme(self, data: dict) -> dict:
        """Update the global color scheme."""
        log.debug("update_global_color_scheme called")
        result = await self._client.put("settings/lookandfeel/custom", json_data=data)
        log.info("update_global_color_scheme succeeded")
        return result

    async def reset_global_color_scheme(self) -> dict:
        """Reset the global color scheme to the system default."""
        log.debug("reset_global_color_scheme called")
        result = await self._client.delete("settings/lookandfeel/custom")
        log.info("reset_global_color_scheme succeeded")
        return result

    # ── Space Color Scheme ───────────────────────────────────────────────

    async def get_space_color_scheme_type(self, space_key: str) -> dict:
        """Retrieve the color scheme type for a space (default or custom)."""
        log.debug("get_space_color_scheme_type called", {"space_key": space_key})
        result = await self._client.get(f"settings/lookandfeel/space/{space_key}/type")
        log.info("get_space_color_scheme_type succeeded", {"space_key": space_key})
        return result

    async def set_space_color_scheme_type(self, space_key: str, data: dict) -> dict:
        """Set the color scheme type for a space (default or custom)."""
        log.debug("set_space_color_scheme_type called", {"space_key": space_key})
        result = await self._client.put(
            f"settings/lookandfeel/space/{space_key}/type", json_data=data
        )
        log.info("set_space_color_scheme_type succeeded", {"space_key": space_key})
        return result

    async def get_space_color_scheme(self, space_key: str) -> dict:
        """Retrieve the custom color scheme for a space."""
        log.debug("get_space_color_scheme called", {"space_key": space_key})
        result = await self._client.get(f"settings/lookandfeel/space/{space_key}/custom")
        log.info("get_space_color_scheme succeeded", {"space_key": space_key})
        return result

    async def update_space_color_scheme(self, space_key: str, data: dict) -> dict:
        """Update the custom color scheme for a space."""
        log.debug("update_space_color_scheme called", {"space_key": space_key})
        result = await self._client.put(
            f"settings/lookandfeel/space/{space_key}/custom", json_data=data
        )
        log.info("update_space_color_scheme succeeded", {"space_key": space_key})
        return result

    async def reset_space_color_scheme(self, space_key: str) -> dict:
        """Reset the space color scheme back to the global default."""
        log.debug("reset_space_color_scheme called", {"space_key": space_key})
        result = await self._client.delete(
            f"settings/lookandfeel/space/{space_key}/custom"
        )
        log.info("reset_space_color_scheme succeeded", {"space_key": space_key})
        return result
