"""
Mount Router for fetch_httpx package.

Provides URL-pattern based transport routing for multi-service architectures.
Allows different transport configurations for different backend services.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from .. import logger as logger_module
from .._models import URL
from ._base import AsyncBaseTransport, BaseTransport

if TYPE_CHECKING:
    pass

logger = logger_module.create("fetch_httpx", __file__)


class MountRouter:
    """
    URL pattern-based transport router.

    Routes requests to different transports based on URL pattern matching.
    Supports scheme, host, and path-based routing.

    Pattern matching priority (most specific wins):
    1. "https://host/path/" - Exact scheme + host + path prefix
    2. "https://host/" - Scheme + host
    3. "https://" - Scheme only
    4. "all://" - Fallback for any URL

    Example:
        router = MountRouter({
            "https://api.internal.corp/": AsyncHTTPTransport(
                cert=("/path/to/cert.pem", "/path/to/key.pem"),
                retries=3,
            ),
            "https://api.external.com/": AsyncHTTPTransport(
                http2=True,
                retries=2,
            ),
            "https://": AsyncHTTPTransport(),  # Default for HTTPS
            "all://": AsyncHTTPTransport(),    # Fallback
        })

        # Get transport for a URL
        transport = router.get_transport(URL("https://api.internal.corp/users"))
    """

    def __init__(
        self,
        mounts: dict[str, AsyncBaseTransport],
    ) -> None:
        # Sort mounts by specificity (longest pattern first)
        self._mounts: list[tuple[str, AsyncBaseTransport]] = sorted(
            mounts.items(),
            key=lambda x: self._pattern_specificity(x[0]),
            reverse=True,
        )

        logger.info(
            "MountRouter created",
            context={"mount_count": len(self._mounts)}
        )

        for pattern, _ in self._mounts:
            logger.debug("Mount registered", context={"pattern": pattern})

    @staticmethod
    def _pattern_specificity(pattern: str) -> tuple[int, int, int]:
        """
        Calculate pattern specificity for sorting.

        Returns tuple of (scheme_score, host_score, path_score)
        Higher scores = more specific = higher priority
        """
        # "all://" is least specific
        if pattern == "all://":
            return (0, 0, 0)

        parts = pattern.rstrip("/").replace("://", " ").split(" ", 1)
        scheme = parts[0] if parts else ""
        rest = parts[1] if len(parts) > 1 else ""

        # Split rest into host and path
        if "/" in rest:
            host, path = rest.split("/", 1)
            path = "/" + path
        else:
            host = rest
            path = ""

        scheme_score = 1 if scheme and scheme != "all" else 0
        host_score = len(host) if host else 0
        path_score = len(path) if path else 0

        return (scheme_score, host_score, path_score)

    def _matches_pattern(self, pattern: str, url: URL) -> bool:
        """Check if a URL matches a pattern."""
        # "all://" matches everything
        if pattern == "all://":
            return True

        # Parse pattern
        pattern = pattern.rstrip("/")

        # Check scheme match
        if pattern.startswith("https://"):
            if url.scheme != "https":
                return False
            pattern = pattern[8:]  # Remove "https://"
        elif pattern.startswith("http://"):
            if url.scheme != "http":
                return False
            pattern = pattern[7:]  # Remove "http://"
        elif pattern.endswith("://"):
            # Scheme-only pattern (e.g., "https://")
            return url.scheme == pattern[:-3]

        if not pattern:
            return True

        # Parse host and path from pattern
        if "/" in pattern:
            pattern_host, pattern_path = pattern.split("/", 1)
            pattern_path = "/" + pattern_path
        else:
            pattern_host = pattern
            pattern_path = ""

        # Check host match
        url_host = url.host.lower()
        pattern_host = pattern_host.lower()

        # Handle port in pattern
        if ":" in pattern_host:
            pattern_host, pattern_port = pattern_host.rsplit(":", 1)
            if url.port and str(url.port) != pattern_port:
                return False

        if pattern_host and url_host != pattern_host:
            return False

        # Check path prefix match
        if pattern_path:
            url_path = url.path or "/"
            if not url_path.startswith(pattern_path):
                return False

        return True

    def get_transport(
        self, url: URL
    ) -> AsyncBaseTransport | None:
        """
        Get the transport for a URL.

        Args:
            url: The target URL

        Returns:
            The matching transport, or None if no match
        """
        for pattern, transport in self._mounts:
            if self._matches_pattern(pattern, url):
                logger.debug(
                    "Transport matched",
                    context={
                        "pattern": pattern,
                        "url": str(url),
                    }
                )
                return transport

        logger.debug(
            "No transport matched",
            context={"url": str(url)}
        )
        return None

    def get_all_transports(self) -> list[AsyncBaseTransport]:
        """Get all registered transports."""
        return [transport for _, transport in self._mounts]

    async def aclose_all(self) -> None:
        """Close all transports."""
        for pattern, transport in self._mounts:
            try:
                await transport.aclose()
                logger.debug("Transport closed", context={"pattern": pattern})
            except Exception as e:
                logger.error(
                    "Error closing transport",
                    context={"pattern": pattern, "error": str(e)}
                )


class SyncMountRouter:
    """
    Synchronous version of MountRouter.

    Routes requests to different sync transports based on URL patterns.
    """

    def __init__(
        self,
        mounts: dict[str, BaseTransport],
    ) -> None:
        self._mounts: list[tuple[str, BaseTransport]] = sorted(
            mounts.items(),
            key=lambda x: MountRouter._pattern_specificity(x[0]),
            reverse=True,
        )

        logger.info(
            "SyncMountRouter created",
            context={"mount_count": len(self._mounts)}
        )

    def get_transport(self, url: URL) -> BaseTransport | None:
        """Get the transport for a URL."""
        for pattern, transport in self._mounts:
            if MountRouter._matches_pattern(MountRouter, pattern, url):
                logger.debug(
                    "Sync transport matched",
                    context={"pattern": pattern, "url": str(url)}
                )
                return transport
        return None

    def close_all(self) -> None:
        """Close all transports."""
        for pattern, transport in self._mounts:
            try:
                transport.close()
                logger.debug("Sync transport closed", context={"pattern": pattern})
            except Exception as e:
                logger.error(
                    "Error closing sync transport",
                    context={"pattern": pattern, "error": str(e)}
                )


__all__ = [
    "MountRouter",
    "SyncMountRouter",
]
