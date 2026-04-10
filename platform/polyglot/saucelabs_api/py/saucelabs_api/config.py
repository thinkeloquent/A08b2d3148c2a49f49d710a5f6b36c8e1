"""
Configuration resolver for the Sauce Labs API client.

Priority chain: constructor args > environment variables > defaults.
"""

from __future__ import annotations

import os
from typing import Any

from env_resolver import resolve_saucelabs_env

from .logger import create_logger
from .types import (
    CORE_REGIONS,
    DEFAULT_BASE_URL,
    DEFAULT_MOBILE_BASE_URL,
    DEFAULT_TIMEOUT,
    MOBILE_REGIONS,
)

log = create_logger("saucelabs_api", "config")


def resolve_core_base_url(region: str = "us-west-1", base_url_override: str | None = None) -> str:
    """Resolve the Core Automation base URL from region or explicit override."""
    if base_url_override:
        return base_url_override.rstrip("/")
    return CORE_REGIONS.get(region, DEFAULT_BASE_URL).rstrip("/")


def resolve_mobile_base_url(mobile_region: str = "us-east", mobile_base_url_override: str | None = None) -> str:
    """Resolve the Mobile Distribution base URL from region or explicit override."""
    if mobile_base_url_override:
        return mobile_base_url_override.rstrip("/")
    return MOBILE_REGIONS.get(mobile_region, DEFAULT_MOBILE_BASE_URL).rstrip("/")


def resolve_config(**kwargs: Any) -> dict[str, Any]:
    """Resolve a complete configuration dict from kwargs, env vars, and defaults.

    Priority: kwargs > env vars > defaults.
    """
    _saucelabs_env = resolve_saucelabs_env()

    username = (
        kwargs.get("username")
        or _saucelabs_env.username
        or ""
    )

    api_key = (
        kwargs.get("api_key")
        or _saucelabs_env.access_key
        or ""
    )

    if not username:
        log.warning("no Sauce Labs username found — set SAUCE_USERNAME env var or pass username")

    if not api_key:
        log.warning("no Sauce Labs access key found — set SAUCE_ACCESS_KEY env var or pass api_key")

    region = kwargs.get("region", "us-west-1")
    mobile_region = kwargs.get("mobile_region", "us-east")

    config = {
        "username": username,
        "api_key": api_key,
        "base_url": resolve_core_base_url(region, kwargs.get("base_url")),
        "mobile_base_url": resolve_mobile_base_url(mobile_region, kwargs.get("mobile_base_url")),
        "region": region,
        "mobile_region": mobile_region,
        "rate_limit_auto_wait": kwargs.get("rate_limit_auto_wait", True),
        "rate_limit_threshold": kwargs.get("rate_limit_threshold", 0),
        "on_rate_limit": kwargs.get("on_rate_limit"),
        "logger": kwargs.get("logger"),
        "timeout": kwargs.get("timeout", DEFAULT_TIMEOUT),
        "proxy": kwargs.get("proxy") or os.environ.get("HTTPS_PROXY") or os.environ.get("HTTP_PROXY"),
        "verify_ssl": kwargs.get("verify_ssl", True),
    }

    log.debug("configuration resolved", {
        "base_url": config["base_url"],
        "mobile_base_url": config["mobile_base_url"],
        "region": config["region"],
        "has_username": bool(config["username"]),
        "has_api_key": bool(config["api_key"]),
    })

    return config
