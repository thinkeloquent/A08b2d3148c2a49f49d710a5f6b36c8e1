"""Preflight checks for HTTP/2 support with Python httpx."""

from __future__ import annotations

import logging
import socket
import ssl
from dataclasses import dataclass, field

logger = logging.getLogger("can_use_http2")


@dataclass(frozen=True)
class Http2CheckResult:
    """Result of an HTTP/2 preflight check."""

    h2_installed: bool
    httpx_installed: bool
    httpx_version: str | None = None
    alpn_negotiated: str | None = None
    probe_url: str | None = None
    probe_error: str | None = None
    errors: list[str] = field(default_factory=list)

    @property
    def ok(self) -> bool:
        """True when all prerequisites are met and no errors occurred."""
        return self.h2_installed and self.httpx_installed and not self.errors


def check_h2_installed() -> bool:
    """Check whether the h2 package (HTTP/2 protocol library) is importable."""
    try:
        import h2  # noqa: F401
        return True
    except ImportError:
        return False


def check_httpx_installed() -> tuple[bool, str | None]:
    """Check whether httpx is importable and return its version."""
    try:
        import httpx
        return True, httpx.__version__
    except ImportError:
        return False, None


def probe_alpn(host: str, port: int = 443, timeout: float = 5.0) -> str | None:
    """
    Open a TLS connection to *host:port* and return the ALPN protocol
    negotiated by the server (e.g. ``"h2"`` or ``"http/1.1"``).

    Returns ``None`` if ALPN is not supported or the connection fails.
    """
    ctx = ssl.create_default_context()
    ctx.set_alpn_protocols(["h2", "http/1.1"])

    with socket.create_connection((host, port), timeout=timeout) as sock, \
         ctx.wrap_socket(sock, server_hostname=host) as tls:
        return tls.selected_alpn_protocol()


def check(
    url: str | None = None,
    *,
    timeout: float = 5.0,
) -> Http2CheckResult:
    """
    Run all HTTP/2 preflight checks and return a structured result.

    Args:
        url: Optional HTTPS URL to probe for ALPN. Only the host is used.
             Defaults to ``None`` (skip the network probe).
        timeout: Socket timeout in seconds for the ALPN probe.

    Returns:
        An :class:`Http2CheckResult` summarising what was found.
    """
    errors: list[str] = []

    h2_installed = check_h2_installed()
    if not h2_installed:
        errors.append("h2 package is not installed (pip install h2)")

    httpx_installed, httpx_version = check_httpx_installed()
    if not httpx_installed:
        errors.append("httpx package is not installed (pip install httpx)")

    alpn_negotiated: str | None = None
    probe_url: str | None = None
    probe_error: str | None = None

    if url is not None:
        probe_url = url
        host = _extract_host(url)
        try:
            alpn_negotiated = probe_alpn(host, timeout=timeout)
            if alpn_negotiated != "h2":
                errors.append(
                    f"Server {host} negotiated {alpn_negotiated!r} instead of 'h2'"
                )
        except Exception as exc:
            probe_error = f"{type(exc).__name__}: {exc}"
            errors.append(f"ALPN probe to {host} failed: {probe_error}")

    result = Http2CheckResult(
        h2_installed=h2_installed,
        httpx_installed=httpx_installed,
        httpx_version=httpx_version,
        alpn_negotiated=alpn_negotiated,
        probe_url=probe_url,
        probe_error=probe_error,
        errors=errors,
    )

    if result.ok:
        logger.info("HTTP/2 preflight passed")
    else:
        logger.warning("HTTP/2 preflight failed: %s", "; ".join(errors))

    return result


def _extract_host(url: str) -> str:
    """Pull the hostname out of a URL string without importing urllib."""
    # strip scheme
    if "://" in url:
        url = url.split("://", 1)[1]
    # strip path / query / fragment
    host = url.split("/", 1)[0]
    # strip port
    if ":" in host:
        host = host.rsplit(":", 1)[0]
    # strip userinfo
    if "@" in host:
        host = host.split("@", 1)[1]
    return host
