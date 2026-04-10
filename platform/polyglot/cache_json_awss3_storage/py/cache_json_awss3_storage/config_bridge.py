"""
Config Bridge — AppYamlConfig / env → ClientConfig

Bridges the three-tier config resolution from aws_s3_client (config_from_env)
into a ClientConfig suitable for ClientAsync / ClientSync.

Works both in server context (pass YAML section) and CLI (auto-resolve from env).

Example (Server context)::

    yaml = app.state.config.get_nested('storage', 's3')
    config = get_client_factory_from_app_config(yaml)
    async with ClientAsync(config) as client:
        storage = create_storage(client, config.bucket_name, ttl=config.ttl)

Example (CLI / direct call)::

    config = get_client_factory_from_app_config()
    async with ClientAsync(config) as client:
        storage = create_storage(client, config.bucket_name, ttl=config.ttl)
"""

from __future__ import annotations

from typing import Any

from cache_json_awss3_storage.logger import create as create_logger
from cache_json_awss3_storage.models import ClientConfig

_logger = create_logger("cache_json_awss3_storage", __file__)


def get_client_factory_from_app_config(
    yaml_config: dict[str, Any] | None = None,
    **overrides: Any,
) -> ClientConfig:
    """
    Create a ClientConfig by resolving configuration from three tiers:

        1. Explicit overrides (highest priority)
        2. YAML config from AppYamlConfig (storage.s3 section)
        3. Environment variables (lowest priority)

    Args:
        yaml_config: YAML storage.s3 dict from AppYamlConfig.get_nested('storage', 's3').
                     Pass None to skip YAML tier (CLI mode — env only).
        **overrides: Explicit overrides in ClientConfig naming convention:
            bucket_name, region_name, endpoint_url, aws_access_key_id,
            aws_secret_access_key, proxy_url, addressing_style,
            connection_timeout, read_timeout, retries_max_attempts,
            verify, ttl.

    Returns:
        ClientConfig ready for use with ClientAsync or ClientSync.

    Example::

        # Server: pass YAML section from AppYamlConfig
        yaml = app.state.config.get_nested('storage', 's3')
        config = get_client_factory_from_app_config(yaml)

        # CLI: auto-resolve from environment variables
        config = get_client_factory_from_app_config()

        async with ClientAsync(config) as client:
            storage = create_storage(client, config.bucket_name, ttl=config.ttl)
    """
    try:
        from aws_s3_client import config_from_env
    except ImportError as exc:
        raise ImportError(
            "get_client_factory_from_app_config requires the 'aws-s3-client' package. "
            "Install it with: pip install cache_json_awss3_storage[appconfig]"
        ) from exc

    # Map overrides from ClientConfig naming → config_from_env naming
    sdk_overrides: dict[str, Any] = {}
    if "bucket_name" in overrides:
        sdk_overrides["bucket_name"] = overrides["bucket_name"]
    if "region_name" in overrides:
        sdk_overrides["region"] = overrides["region_name"]
    if "endpoint_url" in overrides:
        sdk_overrides["endpoint_url"] = overrides["endpoint_url"]
    if "aws_access_key_id" in overrides:
        sdk_overrides["aws_access_key_id"] = overrides["aws_access_key_id"]
    if "aws_secret_access_key" in overrides:
        sdk_overrides["aws_secret_access_key"] = overrides["aws_secret_access_key"]
    if "proxy_url" in overrides:
        sdk_overrides["proxy_url"] = overrides["proxy_url"]
    if "addressing_style" in overrides:
        sdk_overrides["force_path_style"] = overrides["addressing_style"] == "path"

    # Resolve via three-tier: overrides → YAML → env
    resolved = config_from_env(yaml_config=yaml_config, **sdk_overrides)

    config = ClientConfig(
        bucket_name=resolved["bucket_name"],
        region_name=resolved.get("region"),
        endpoint_url=resolved.get("endpoint_url"),
        aws_access_key_id=resolved.get("aws_access_key_id"),
        aws_secret_access_key=resolved.get("aws_secret_access_key"),
        proxy_url=resolved.get("proxy_url"),
        addressing_style="path" if resolved.get("force_path_style") else "virtual",
        connection_timeout=overrides.get(
            "connection_timeout", resolved.get("connect_timeout", 20)
        ),
        read_timeout=overrides.get("read_timeout", resolved.get("read_timeout", 60)),
        retries_max_attempts=overrides.get(
            "retries_max_attempts", resolved.get("max_retries", 3)
        ),
        type="s3",
        verify=overrides.get("verify", resolved.get("verify_ssl", True)),
        ttl=overrides.get("ttl", resolved.get("ttl") or 600.0),
    )

    _logger.info(
        f"get_client_factory_from_app_config: resolved "
        f"bucket={config.bucket_name}, region={config.region_name}, "
        f"endpoint={config.endpoint_url}, ttl={config.ttl}"
    )

    return config
