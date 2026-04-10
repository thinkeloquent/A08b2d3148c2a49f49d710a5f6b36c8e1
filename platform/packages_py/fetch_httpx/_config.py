"""
Configuration Classes for fetch_httpx package.

This module implements configuration classes:
- Timeout: Granular timeout configuration
- Limits: Connection pool limits
- Proxy: Proxy configuration

Based on httpx configuration patterns with logging support.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Any

from . import logger as logger_module
from ._models import URL

logger = logger_module.create("fetch_httpx", __file__)


# =============================================================================
# Timeout Class
# =============================================================================

@dataclass
class Timeout:
    """
    Granular timeout configuration for HTTP operations.

    Allows separate timeouts for different phases:
    - connect: Time to establish connection
    - read: Time to receive response data
    - write: Time to send request data
    - pool: Time to wait for connection from pool

    Example:
        # Uniform timeout
        timeout = Timeout(30.0)

        # Granular timeout
        timeout = Timeout(connect=5.0, read=30.0, write=10.0, pool=5.0)

        # Disable timeouts
        timeout = Timeout(None)
    """

    connect: float | None = 5.0
    read: float | None = 5.0
    write: float | None = 5.0
    pool: float | None = 5.0

    def __init__(
        self,
        timeout: float | None | Timeout | tuple[float | None, ...] = 5.0,
        *,
        connect: float | None = None,
        read: float | None = None,
        write: float | None = None,
        pool: float | None = None,
    ) -> None:
        """
        Initialize timeout configuration.

        Args:
            timeout: Uniform timeout for all operations, or None to disable.
                    Can also be a Timeout instance to copy.
            connect: Override connect timeout
            read: Override read timeout
            write: Override write timeout
            pool: Override pool timeout
        """
        if isinstance(timeout, Timeout):
            # Copy from another Timeout
            self.connect = timeout.connect if connect is None else connect
            self.read = timeout.read if read is None else read
            self.write = timeout.write if write is None else write
            self.pool = timeout.pool if pool is None else pool
        elif isinstance(timeout, tuple):
            # Tuple of (connect, read, write, pool)
            self.connect = timeout[0] if len(timeout) > 0 and connect is None else connect
            self.read = timeout[1] if len(timeout) > 1 and read is None else read
            self.write = timeout[2] if len(timeout) > 2 and write is None else write
            self.pool = timeout[3] if len(timeout) > 3 and pool is None else pool
        elif timeout is None:
            # Disable all timeouts
            self.connect = connect
            self.read = read
            self.write = write
            self.pool = pool
        else:
            # Uniform timeout (single float)
            self.connect = connect if connect is not None else timeout
            self.read = read if read is not None else timeout
            self.write = write if write is not None else timeout
            self.pool = pool if pool is not None else timeout

        logger.trace(
            "Timeout configured",
            context={
                "connect": self.connect,
                "read": self.read,
                "write": self.write,
                "pool": self.pool,
            }
        )

    def as_dict(self) -> dict[str, float | None]:
        """Return timeout values as dictionary."""
        return {
            "connect": self.connect,
            "read": self.read,
            "write": self.write,
            "pool": self.pool,
        }

    def __repr__(self) -> str:
        return (
            f"Timeout(connect={self.connect}, read={self.read}, "
            f"write={self.write}, pool={self.pool})"
        )


# Default timeout instance
DEFAULT_TIMEOUT = Timeout(5.0)


# =============================================================================
# Limits Class
# =============================================================================

@dataclass
class Limits:
    """
    Connection pool limits.

    Controls resource usage for connection pooling:
    - max_connections: Maximum total connections
    - max_keepalive_connections: Maximum idle connections to keep
    - keepalive_expiry: Seconds before idle connection expires

    Example:
        limits = Limits(
            max_connections=100,
            max_keepalive_connections=20,
            keepalive_expiry=30.0,
        )
    """

    max_connections: int | None = 100
    max_keepalive_connections: int | None = 20
    keepalive_expiry: float | None = 5.0

    def __post_init__(self) -> None:
        logger.trace(
            "Limits configured",
            context={
                "max_connections": self.max_connections,
                "max_keepalive_connections": self.max_keepalive_connections,
                "keepalive_expiry": self.keepalive_expiry,
            }
        )

    def as_dict(self) -> dict[str, Any]:
        """Return limits as dictionary."""
        return {
            "max_connections": self.max_connections,
            "max_keepalive_connections": self.max_keepalive_connections,
            "keepalive_expiry": self.keepalive_expiry,
        }


# Default limits instance
DEFAULT_LIMITS = Limits()


# =============================================================================
# Proxy Class
# =============================================================================

@dataclass
class Proxy:
    """
    Proxy configuration.

    Supports HTTP/HTTPS proxies with optional authentication.

    Example:
        # Simple proxy
        proxy = Proxy("http://proxy.example.com:8080")

        # Proxy with auth
        proxy = Proxy(
            "http://proxy.example.com:8080",
            auth=("*****", "*****"),
        )

        # Proxy with custom headers
        proxy = Proxy(
            "http://proxy.example.com:8080",
            headers={"Proxy-Authorization": "Bearer *****"},
        )
    """

    url: URL = field(default_factory=lambda: URL(""))
    auth: tuple[str, str] | None = None
    headers: dict[str, str] | None = None

    def __init__(
        self,
        url: str | URL = "",
        *,
        auth: tuple[str, str] | None = None,
        headers: dict[str, str] | None = None,
    ) -> None:
        self.url = url if isinstance(url, URL) else URL(url)
        self.auth = auth
        self.headers = headers

        logger.debug(
            "Proxy configured",
            context={
                "url": str(self.url),
                "has_auth": auth is not None,
                "has_headers": headers is not None,
            }
        )

    def __repr__(self) -> str:
        return f"Proxy(url={str(self.url)!r}, auth={'***' if self.auth else None})"


# =============================================================================
# Environment-based Proxy Detection
# =============================================================================

def get_proxy_from_env() -> dict[str, Proxy] | None:
    """
    Get proxy configuration from environment variables.

    Checks:
    - HTTP_PROXY / http_proxy
    - HTTPS_PROXY / https_proxy
    - NO_PROXY / no_proxy

    Returns:
        Dictionary mapping scheme to Proxy, or None if no proxies configured.
    """
    proxies: dict[str, Proxy] = {}

    http_proxy = os.environ.get("HTTP_PROXY") or os.environ.get("http_proxy")
    https_proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    no_proxy = os.environ.get("NO_PROXY") or os.environ.get("no_proxy")

    if http_proxy:
        proxies["http://"] = Proxy(http_proxy)
        logger.debug("HTTP proxy from environment", context={"proxy": http_proxy})

    if https_proxy:
        proxies["https://"] = Proxy(https_proxy)
        logger.debug("HTTPS proxy from environment", context={"proxy": https_proxy})

    if no_proxy:
        logger.debug("NO_PROXY configured", context={"hosts": no_proxy})
        # NO_PROXY handling would be done in transport layer

    return proxies if proxies else None


def should_bypass_proxy(url: URL, no_proxy: str | None = None) -> bool:
    """
    Check if a URL should bypass the proxy.

    Args:
        url: The target URL
        no_proxy: Comma-separated list of hosts to bypass

    Returns:
        True if proxy should be bypassed for this URL
    """
    if no_proxy is None:
        no_proxy = os.environ.get("NO_PROXY") or os.environ.get("no_proxy") or ""

    if not no_proxy:
        return False

    host = url.host.lower()
    bypass_hosts = [h.strip().lower() for h in no_proxy.split(",")]

    for bypass in bypass_hosts:
        if bypass == "*":
            return True
        if bypass.startswith("."):
            # Domain suffix match
            if host.endswith(bypass) or host == bypass[1:]:
                return True
        elif host == bypass:
            return True

    return False


__all__ = [
    "Timeout",
    "DEFAULT_TIMEOUT",
    "Limits",
    "DEFAULT_LIMITS",
    "Proxy",
    "get_proxy_from_env",
    "should_bypass_proxy",
]
