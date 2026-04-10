"""
Utility functions for app_yaml_static_config package.
Provides helper functions for retrieving configuration from framework app state.
"""

from typing import Any, Dict, Optional
from .logger import create as create_logger

logger = create_logger("app_yaml_static_config", "utils.py")


def get_config_from_app_state(
    app_state: Any,
    resolved_attr: str = "resolved_config",
    raw_attr: str = "config"
) -> Dict[str, Any]:
    """
    Get configuration from app state object.

    Tries to get pre-resolved config first (values resolved by context resolver),
    then falls back to raw config if resolved not available.

    Args:
        app_state: The app state object (e.g., request.app.state for FastAPI)
        resolved_attr: Attribute name for resolved config (default: "resolved_config")
        raw_attr: Attribute name for raw config (default: "config")

    Returns:
        Configuration dictionary, or empty dict if not found

    Example:
        # FastAPI usage
        config = get_config_from_app_state(request.app.state)

        # With custom attribute names
        config = get_config_from_app_state(app.state, "my_resolved", "my_config")
    """
    # Try resolved config first
    resolved_config = getattr(app_state, resolved_attr, None)
    if resolved_config is not None:
        return resolved_config

    # Fallback to raw config
    app_config = getattr(app_state, raw_attr, None)
    if app_config is None:
        logger.warn(f"{raw_attr} not found on app state")
        return {}

    # If app_config has get_all method (AppYamlConfig instance), use it
    if hasattr(app_config, "get_all"):
        return app_config.get_all()

    # If app_config has to_dict method, use it
    if hasattr(app_config, "to_dict"):
        return app_config.to_dict()

    # If it's already a dict, return it
    if isinstance(app_config, dict):
        return app_config

    logger.warn(f"Unable to convert {raw_attr} to dictionary")
    return {}
