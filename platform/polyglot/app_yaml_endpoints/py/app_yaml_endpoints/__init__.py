"""
Smart Fetch Router - Configuration-driven endpoint routing SDK.

Provides functions to load endpoint configuration from YAML files or objects
and retrieve fetch configurations for specific service IDs.
"""

from app_yaml_endpoints.logger import Logger, LoggerFactory
from app_yaml_endpoints.config import (
    load_config,
    load_config_from_file,
    get_fetch_config,
    get_endpoint,
    list_endpoints,
    resolve_intent,
)
from app_yaml_endpoints.models import FetchConfig, EndpointConfig
from app_yaml_endpoints.sdk import EndpointConfigSDK, create_endpoint_config_sdk

__version__ = "1.1.0"
__all__ = [
    "Logger",
    "LoggerFactory",
    "load_config",
    "load_config_from_file",
    "get_fetch_config",
    "get_endpoint",
    "list_endpoints",
    "resolve_intent",
    "FetchConfig",
    "EndpointConfig",
    "EndpointConfigSDK",
    "create_endpoint_config_sdk",
]
