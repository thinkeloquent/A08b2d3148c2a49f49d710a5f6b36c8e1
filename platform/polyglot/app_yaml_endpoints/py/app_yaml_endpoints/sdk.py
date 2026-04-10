"""
EndpointConfigSDK — class-based wrapper around the module-level config functions.

Adds query methods (get_by_name, get_by_tag, get_all) and refresh capability
while delegating to the existing bare functions for core operations.
"""

from __future__ import annotations

from typing import Any

from app_yaml_endpoints.config import (
    load_config as _load_config,
    load_config_from_file as _load_config_from_file,
    get_config,
    list_endpoints,
    get_endpoint,
    resolve_intent as _resolve_intent,
    get_fetch_config as _get_fetch_config,
)
from app_yaml_endpoints.models import EndpointConfig, FetchConfig


class EndpointConfigSDK:
    """Class-based SDK wrapper for endpoint configuration."""

    def __init__(self, file_path: str | None = None):
        """
        Args:
            file_path: Path to endpoint YAML for refresh support.
        """
        self._file_path = file_path

    def properties(self, path: str, default: Any = None) -> Any:
        """Dot-path property getter on the raw config object.

        Args:
            path: Dot-separated path (e.g. "endpoints.llm001.timeout")
            default: Value returned when path is not found

        Returns:
            The value at the path, or default.
        """
        config = get_config()
        current: Any = config

        for part in path.split("."):
            if not isinstance(current, dict):
                return default
            current = current.get(part)
            if current is None:
                return default

        return current

    def get_by_key(self, key: str) -> EndpointConfig | None:
        """Get an endpoint by its key (service ID)."""
        return get_endpoint(key)

    def resolve_intent(self, intent: str) -> dict[str, Any]:
        """Resolve an intent to an endpoint.

        Returns:
            Dict with "key" and "endpoint" fields.
        """
        key = _resolve_intent(intent)
        endpoint = get_endpoint(key)
        return {"key": key, "endpoint": endpoint}

    def load_config(self, config_obj: dict[str, Any]) -> dict[str, Any]:
        """Load configuration from a dictionary object."""
        return _load_config(config_obj)

    def refresh_config(self) -> dict[str, Any]:
        """Re-read YAML from stored file_path.

        Raises:
            RuntimeError: If no file_path was provided.
        """
        if not self._file_path:
            raise RuntimeError("Cannot refresh: no file_path configured. Use load_from_file() first.")
        return _load_config_from_file(self._file_path)

    def get_by_name(self, name: str) -> EndpointConfig | None:
        """Find an endpoint by its human-friendly name (case-sensitive)."""
        for ep in self.get_all():
            if ep.name == name:
                return ep
        return None

    def get_all(self) -> list[EndpointConfig]:
        """Get all endpoint configs as a list."""
        keys = list_endpoints()
        results = []
        for key in keys:
            ep = get_endpoint(key)
            if ep is not None:
                results.append(ep)
        return results

    def get_by_tag(self, tag: str) -> list[EndpointConfig]:
        """Filter endpoints by tag."""
        return [ep for ep in self.get_all() if tag in ep.tags]

    def load_from_file(self, file_path: str) -> dict[str, Any]:
        """Load from a YAML file and store the path for future refreshes."""
        self._file_path = file_path
        return _load_config_from_file(file_path)

    def list_keys(self) -> list[str]:
        """List all endpoint keys (service IDs)."""
        return list_endpoints()

    def get_fetch_config(
        self,
        service_id: str,
        payload: Any,
        custom_headers: dict[str, str] | None = None,
    ) -> FetchConfig:
        """Get a complete fetch configuration for a service ID."""
        return _get_fetch_config(service_id, payload, custom_headers)


def create_endpoint_config_sdk(file_path: str | None = None) -> EndpointConfigSDK:
    """Factory function to create an EndpointConfigSDK instance."""
    return EndpointConfigSDK(file_path=file_path)
