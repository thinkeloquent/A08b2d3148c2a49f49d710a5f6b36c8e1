"""
Configuration Management for AWS S3 Client SDK

Provides configuration types, validation, and environment variable support.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from aws_s3_client.exceptions import JsonS3StorageConfigError
from aws_s3_client.logger import create as create_logger
from env_resolver import resolve_aws_s3_env

logger = create_logger("aws_s3_client", __file__)


def _y(v: Any) -> Any:
    """Treat None as unset so YAML nulls fall through the resolution chain."""
    return v if v is not None else _UNSET


_UNSET = object()


def _first(*values: Any) -> Any:
    """Return the first value that is not _UNSET and not None."""
    for v in values:
        if v is not _UNSET and v is not None:
            return v
    return None


@dataclass
class SDKConfig:
    """
    SDK configuration with environment variable fallback.

    Attributes:
        bucket_name: S3 bucket name (required)
        region: AWS region (default: us-east-1)
        key_prefix: Object key prefix (default: jss3:)
        ttl: Default TTL in seconds (None = no expiration)
        debug: Enable debug logging
        hash_keys: Specific fields for key generation
    """

    bucket_name: str
    region: str = "us-east-1"
    key_prefix: str = "jss3:"
    ttl: int | None = None
    debug: bool = False
    hash_keys: list[str] | None = None
    aws_access_key_id: str | None = None
    aws_secret_access_key: str | None = None
    endpoint_url: str | None = None
    proxy_url: str | None = None
    force_path_style: bool = False
    connect_timeout: int = 10
    read_timeout: int = 60
    max_retries: int = 3
    verify_ssl: bool = False

    def __post_init__(self) -> None:
        """Validate configuration after initialization."""
        if not self.bucket_name:
            raise JsonS3StorageConfigError("bucket_name is required")

    @classmethod
    def from_env(
        cls,
        yaml_config: dict[str, Any] | None = None,
        **overrides: Any,
    ) -> SDKConfig:
        """
        Create configuration with three-tier resolution: ARG → YamlConfig → ENV.

        Resolution order (highest priority first):
            1. Explicit overrides (keyword arguments)
            2. YAML config (yamlConfig.storage.s3)
            3. Environment variables
            4. Defaults

        Environment variables:
            AWS_S3_BUCKET / AWS_S3_BUCKETNAME: Bucket name
            AWS_S3_REGION / AWS_REGION / AWS_DEFAULT_REGION: AWS region
            AWS_S3_KEY_PREFIX: Key prefix
            AWS_S3_TTL: Default TTL in seconds
            AWS_S3_DEBUG: Enable debug logging (true/false)
            AWS_S3_ACCESS_KEY / AWS_ACCESS_KEY_ID: AWS access key
            AWS_S3_SECRET_KEY / AWS_SECRET_ACCESS_KEY: AWS secret key
            AWS_S3_ENDPOINT / AWS_ENDPOINT_URL: Custom endpoint URL

        Args:
            yaml_config: YAML storage.s3 config dict (from server.dev.yaml)
            **overrides: Explicit values that override everything

        Returns:
            Configured SDKConfig instance
        """
        yc = yaml_config or {}
        env = resolve_aws_s3_env()

        bucket_name = (
            overrides.get("bucket_name")
            or _first(_y(yc.get("bucket_name")))
            or env.bucket
            or ""
        )
        region = (
            overrides.get("region")
            or _first(_y(yc.get("region_name")))
            or env.region
        )
        key_prefix = overrides.get("key_prefix") or env.key_prefix

        ttl = overrides.get("ttl") or (int(env.ttl) if env.ttl else None)

        debug = overrides.get("debug", env.debug)

        logger.debug(f"from_env: bucket={bucket_name}, region={region}, debug={debug}")

        # When yaml_config is explicitly provided, its proxy_url (even None)
        # takes precedence — do NOT fall through to system env vars.
        # This lets AppYamlConfig `proxy_url: null` mean "no proxy".
        if overrides.get("proxy_url"):
            proxy_url = overrides["proxy_url"]
        elif yaml_config is not None and "proxy_url" in yc:
            proxy_url = yc.get("proxy_url") or None
        else:
            proxy_url = env.proxy

        yaml_fps = yc.get("force_path_style")
        force_path_style = overrides.get(
            "force_path_style",
            yaml_fps if yaml_fps is not None else env.force_path_style,
        )

        connect_timeout = overrides.get("connect_timeout") or env.connect_timeout

        read_timeout = overrides.get("read_timeout") or env.read_timeout

        max_retries = overrides.get("max_retries") or env.max_retries

        yaml_vs = yc.get("verify_ssl")
        verify_ssl = overrides.get(
            "verify_ssl",
            yaml_vs if yaml_vs is not None else env.verify_ssl,
        )

        return cls(
            bucket_name=bucket_name,
            region=region,
            key_prefix=key_prefix,
            ttl=ttl,
            debug=debug,
            hash_keys=overrides.get("hash_keys"),
            aws_access_key_id=(
                overrides.get("aws_access_key_id")
                or _first(_y(yc.get("access_key_id")))
                or env.access_key
            ),
            aws_secret_access_key=(
                overrides.get("aws_secret_access_key")
                or _first(_y(yc.get("secret_access_key")))
                or env.secret_key
            ),
            endpoint_url=(
                overrides.get("endpoint_url")
                or _first(_y(yc.get("endpoint_url")))
                or env.endpoint
            ),
            proxy_url=proxy_url,
            force_path_style=force_path_style,
            connect_timeout=connect_timeout,
            read_timeout=read_timeout,
            max_retries=max_retries,
            verify_ssl=verify_ssl,
        )

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary (excluding secrets)."""
        return {
            "bucket_name": self.bucket_name,
            "region": self.region,
            "key_prefix": self.key_prefix,
            "ttl": self.ttl,
            "debug": self.debug,
            "hash_keys": self.hash_keys,
            "endpoint_url": self.endpoint_url,
            "proxy_url": self.proxy_url,
            "force_path_style": self.force_path_style,
            "connect_timeout": self.connect_timeout,
            "read_timeout": self.read_timeout,
            "max_retries": self.max_retries,
            "verify_ssl": self.verify_ssl,
            # Exclude credentials
        }


def config_from_env(
    yaml_config: dict[str, Any] | None = None,
    **overrides: Any,
) -> dict[str, Any]:
    """
    Read S3 configuration with three-tier resolution: ARG → YamlConfig → ENV.

    Mirrors the JS ``configFromEnv`` — returns a plain dict and does NOT
    raise when ``bucket_name`` is empty, making it suitable for health-check
    endpoints that only need connectivity (e.g. ListBuckets).

    Args:
        yaml_config: YAML storage.s3 config dict (from server.dev.yaml)
        **overrides: Explicit values that override everything

    Returns:
        dict with keys: bucket_name, region, key_prefix, ttl, debug,
        hash_keys, aws_access_key_id, aws_secret_access_key, endpoint_url
    """
    yc = yaml_config or {}
    env = resolve_aws_s3_env()

    bucket_name = (
        overrides.get("bucket_name")
        or _first(_y(yc.get("bucket_name")))
        or env.bucket
        or ""
    )
    region = (
        overrides.get("region")
        or _first(_y(yc.get("region_name")))
        or env.region
    )
    key_prefix = overrides.get("key_prefix") or env.key_prefix

    ttl = overrides.get("ttl") or (int(env.ttl) if env.ttl else None)

    debug = overrides.get("debug", env.debug)

    # When yaml_config is explicitly provided, its proxy_url (even None)
    # takes precedence — do NOT fall through to system env vars.
    # This lets AppYamlConfig `proxy_url: null` mean "no proxy".
    if overrides.get("proxy_url"):
        proxy_url = overrides["proxy_url"]
    elif yaml_config is not None and "proxy_url" in yc:
        proxy_url = yc.get("proxy_url") or None
    else:
        proxy_url = env.proxy

    yaml_fps = yc.get("force_path_style")
    force_path_style = overrides.get(
        "force_path_style",
        yaml_fps if yaml_fps is not None else env.force_path_style,
    )

    connect_timeout = overrides.get("connect_timeout") or env.connect_timeout

    read_timeout = overrides.get("read_timeout") or env.read_timeout

    max_retries = overrides.get("max_retries") or env.max_retries

    yaml_vs = yc.get("verify_ssl")
    verify_ssl = overrides.get(
        "verify_ssl",
        yaml_vs if yaml_vs is not None else env.verify_ssl,
    )

    logger.debug(f"config_from_env: bucket={bucket_name}, region={region}, debug={debug}")

    return {
        "bucket_name": bucket_name,
        "region": region,
        "key_prefix": key_prefix,
        "ttl": ttl,
        "debug": debug,
        "hash_keys": overrides.get("hash_keys"),
        "aws_access_key_id": (
            overrides.get("aws_access_key_id")
            or _first(_y(yc.get("access_key_id")))
            or env.access_key
        ),
        "aws_secret_access_key": (
            overrides.get("aws_secret_access_key")
            or _first(_y(yc.get("secret_access_key")))
            or env.secret_key
        ),
        "endpoint_url": (
            overrides.get("endpoint_url")
            or _first(_y(yc.get("endpoint_url")))
            or env.endpoint
        ),
        "proxy_url": proxy_url,
        "force_path_style": force_path_style,
        "connect_timeout": connect_timeout,
        "read_timeout": read_timeout,
        "max_retries": max_retries,
        "verify_ssl": verify_ssl,
    }


def validate_config(config: SDKConfig) -> list[str]:
    """
    Validate configuration and return list of issues.

    Args:
        config: Configuration to validate

    Returns:
        List of validation error messages (empty if valid)
    """
    issues: list[str] = []

    if not config.bucket_name:
        issues.append("bucket_name is required")

    if not config.region:
        issues.append("region is required")

    if config.ttl is not None and config.ttl < 0:
        issues.append("ttl must be non-negative")

    return issues
