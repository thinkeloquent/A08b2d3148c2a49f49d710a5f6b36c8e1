"""
Server integration modules for app_yaml_overwrites.
"""

from .fastapi import (
    # Modern API
    create_config_lifespan,
    ConfigResolutionMiddleware,
    ConfigIntegrationOptions,
    get_config_sdk,
    get_config,
    get_resolved_config,
    resolve_template_dependency,
    setup_config_integration,
    # Legacy aliases
    FastAPIConfigMiddleware,
    setup_config_sdk,
)

__all__ = [
    # Modern API
    "create_config_lifespan",
    "ConfigResolutionMiddleware",
    "ConfigIntegrationOptions",
    "get_config_sdk",
    "get_config",
    "get_resolved_config",
    "resolve_template_dependency",
    "setup_config_integration",
    # Legacy aliases
    "FastAPIConfigMiddleware",
    "setup_config_sdk",
]
