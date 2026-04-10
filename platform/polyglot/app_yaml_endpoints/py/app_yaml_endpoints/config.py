"""
Configuration loading and fetch config generation.

Provides functions to:
- Load configuration from YAML file or dict
- Get fetch configuration for a service ID
- Resolve intents to service IDs
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import yaml

from app_yaml_endpoints.logger import LoggerFactory
from app_yaml_endpoints.models import EndpointConfig, FetchConfig

logger = LoggerFactory.create("app_yaml_endpoints", __file__)

# Module-level config storage
_config: dict[str, Any] | None = None


class ConfigError(Exception):
    """Configuration error."""

    def __init__(self, message: str, service_id: str | None = None, available: list[str] | None = None):
        super().__init__(message)
        self.message = message
        self.service_id = service_id
        self.available = available or []


def load_config_from_file(file_path: str | Path) -> dict[str, Any]:
    """
    Load configuration from a YAML file.

    Args:
        file_path: Path to endpoint.yaml file

    Returns:
        Configuration dictionary

    Raises:
        ConfigError: If file cannot be loaded
    """
    global _config
    path = Path(file_path)
    logger.debug("Loading config from file", {"path": str(path)})

    if not path.exists():
        logger.warn("Config file not found", {"path": str(path)})
        _config = {"endpoints": {}, "intent_mapping": {}}
        return _config

    try:
        with open(path, "r", encoding="utf-8") as f:
            _config = yaml.safe_load(f) or {}
        logger.info("Config loaded", {"endpoints": len(_config.get("endpoints", {}))})
        return _config
    except yaml.YAMLError as e:
        logger.error("Failed to parse YAML", {"error": str(e)})
        raise ConfigError(f"Failed to parse YAML: {e}") from e


def load_config(config: dict[str, Any]) -> dict[str, Any]:
    """
    Load configuration from a dictionary object.

    Args:
        config: Configuration dictionary with 'endpoints' key

    Returns:
        The same configuration dictionary (stored for later use)
    """
    global _config
    logger.debug("Loading config from object", {"endpoints": len(config.get("endpoints", {}))})
    _config = config
    return _config


def get_config() -> dict[str, Any]:
    """Get current configuration, raise if not loaded."""
    if _config is None:
        raise ConfigError("Configuration not loaded. Call load_config() or load_config_from_file() first.")
    return _config


def list_endpoints() -> list[str]:
    """
    List all available endpoint service IDs.

    Returns:
        List of service ID strings
    """
    config = get_config()
    return list(config.get("endpoints", {}).keys())


def get_endpoint(service_id: str) -> EndpointConfig | None:
    """
    Get endpoint configuration for a service ID.

    Args:
        service_id: Service ID (e.g., 'llm001', 'endpoints.storybook001')

    Returns:
        EndpointConfig or None if not found
    """
    clean_id = service_id.replace("endpoints.", "")
    logger.debug("get_endpoint", {"service_id": clean_id})

    config = get_config()
    endpoint = config.get("endpoints", {}).get(clean_id)

    if endpoint is None:
        logger.debug("Endpoint not found", {"service_id": clean_id})
        return None

    return EndpointConfig.from_dict(endpoint, clean_id)


def resolve_intent(intent: str) -> str:
    """
    Resolve an intent to a service ID.

    Args:
        intent: Intent string (e.g., 'storybook', 'agent')

    Returns:
        Resolved service ID
    """
    logger.debug("resolve_intent", {"intent": intent})
    config = get_config()
    mapping = config.get("intent_mapping", {})
    mappings = mapping.get("mappings", {})
    default = mapping.get("default_intent", "llm001")

    result = mappings.get(intent, default)
    logger.debug("Intent resolved", {"intent": intent, "service_id": result})
    return result


def get_fetch_config(
    service_id: str,
    payload: Any,
    custom_headers: dict[str, str] | None = None,
) -> FetchConfig:
    """
    Get complete fetch configuration for a service ID.

    Args:
        service_id: Target service ID
        payload: Request payload (will be JSON serialized)
        custom_headers: Optional headers to merge with endpoint defaults

    Returns:
        FetchConfig ready for HTTP client

    Raises:
        ConfigError: If service ID not found
    """
    clean_id = service_id.replace("endpoints.", "")
    logger.debug("get_fetch_config", {"service_id": clean_id})

    endpoint = get_endpoint(clean_id)
    if endpoint is None:
        available = list_endpoints()
        logger.warn("Service not found", {"service_id": clean_id, "available": available})
        raise ConfigError(f"Service '{clean_id}' not found", clean_id, available)

    # Merge headers: default -> endpoint -> custom
    headers = {"Content-Type": "application/json"}
    headers.update(endpoint.headers)
    if custom_headers:
        headers.update(custom_headers)

    # Serialize body
    if endpoint.body_type == "text":
        body = str(payload)
    else:
        body = json.dumps(payload, default=str)

    result = FetchConfig(
        service_id=clean_id,
        url=endpoint.base_url,
        method=endpoint.method,
        headers=headers,
        body=body,
        timeout=endpoint.timeout,
    )

    logger.debug("Fetch config created", {
        "url": result.url,
        "method": result.method,
        "headers_count": len(result.headers),
    })

    return result
