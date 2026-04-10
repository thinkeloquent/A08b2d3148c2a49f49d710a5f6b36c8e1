"""
Configuration resolution module for the Confluence API client.

Priority: app.state.config (server mode) -> environment variables -> graceful None.
"""

from __future__ import annotations

from typing import Any

from env_resolver import resolve_confluence_env
from confluence_api.logger import create_logger

log = create_logger("confluence-api", __file__)


def load_config_from_env() -> dict[str, Any]:
    """
    Load Confluence configuration from environment variables.

    Reads:
        CONFLUENCE_BASE_URL  - Confluence Data Center base URL
        CONFLUENCE_USERNAME  - Username for Basic Auth
        CONFLUENCE_API_TOKEN - API token / password for Basic Auth

    Returns:
        Dict with base_url, username, api_token keys (values may be None).
    """
    _confluence_env = resolve_confluence_env()
    base_url = _confluence_env.base_url or None
    username = _confluence_env.username or None
    api_token = _confluence_env.api_token or None

    if not base_url:
        log.warning("CONFLUENCE_BASE_URL not set in environment")
    if not username:
        log.warning("CONFLUENCE_USERNAME not set in environment")
    if not api_token:
        log.warning("CONFLUENCE_API_TOKEN not set in environment")

    return {
        "base_url": base_url,
        "username": username,
        "api_token": api_token,
    }


def get_server_config(app_state: Any) -> dict[str, Any]:
    """
    Read Confluence configuration from app.state.config (FastAPI server mode).

    Expects app_state.config to have a get_nested() method or dict-like access
    at path providers -> confluence -> {base_url, username, api_token}.

    Args:
        app_state: FastAPI app.state object.

    Returns:
        Dict with base_url, username, api_token keys (values may be None).
    """
    result: dict[str, Any] = {
        "base_url": None,
        "username": None,
        "api_token": None,
    }

    try:
        config = getattr(app_state, "config", None)
        if config is None:
            log.warning("app.state.config not found, skipping server config")
            return result

        # Support get_nested() method (common in polyglot configs)
        if hasattr(config, "get_nested"):
            result["base_url"] = config.get_nested("providers", "confluence", "base_url")
            result["username"] = config.get_nested("providers", "confluence", "username")
            result["api_token"] = config.get_nested("providers", "confluence", "api_token")
        # Fallback: dict-like access
        elif isinstance(config, dict):
            providers = config.get("providers", {})
            confluence = providers.get("confluence", {}) if isinstance(providers, dict) else {}
            if isinstance(confluence, dict):
                result["base_url"] = confluence.get("base_url")
                result["username"] = confluence.get("username")
                result["api_token"] = confluence.get("api_token")
        else:
            log.warning("app.state.config has unknown type, cannot extract confluence settings")

    except Exception as exc:
        log.warning("failed to read server config", {"error": str(exc)})

    return result


def get_config(app_state: Any = None) -> dict[str, Any]:
    """
    Resolve Confluence configuration with priority:
        1. app.state.config (if app_state provided)
        2. Environment variables

    Args:
        app_state: Optional FastAPI app.state object.

    Returns:
        Dict with base_url, username, api_token keys (values may be None if not found).
    """
    # Try server config first if app_state is provided
    if app_state is not None:
        server_cfg = get_server_config(app_state)
        if server_cfg["base_url"] and server_cfg["username"] and server_cfg["api_token"]:
            log.debug("config resolved from app.state.config")
            return server_cfg

    # Fall back to environment variables
    env_cfg = load_config_from_env()
    if env_cfg["base_url"] and env_cfg["username"] and env_cfg["api_token"]:
        log.debug("config resolved from environment variables")
    else:
        log.warning("incomplete Confluence configuration; some values are None")

    return env_cfg
