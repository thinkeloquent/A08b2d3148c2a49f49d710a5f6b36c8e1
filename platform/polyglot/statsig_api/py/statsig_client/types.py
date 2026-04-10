"""
Shared type definitions for the Statsig Console API client.

All public types are plain :mod:`dataclasses` so they can be created,
inspected, and serialised without third-party dependencies.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable, Awaitable

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

DEFAULT_BASE_URL: str = "https://statsigapi.net/console/v1"
"""Default Statsig Console API v1 base URL."""

DEFAULT_TIMEOUT: float = 30.0
"""Default HTTP request timeout in seconds."""


# ---------------------------------------------------------------------------
# Rate-limit info
# ---------------------------------------------------------------------------

@dataclass(frozen=True, slots=True)
class RateLimitInfo:
    """Snapshot of rate-limit state extracted from a 429 response.

    Attributes
    ----------
    retry_after:
        Number of seconds the server asks us to wait before retrying.
    remaining:
        Remaining requests in the current window (if provided by the API).
    limit:
        Maximum requests allowed in the current window (if provided).
    reset_at:
        ISO-8601 timestamp when the window resets (if provided).
    timestamp:
        ISO-8601 timestamp of when this info was captured.
    """

    retry_after: float
    remaining: int | None = None
    limit: int | None = None
    reset_at: str | None = None
    timestamp: str = ""


# ---------------------------------------------------------------------------
# Client options
# ---------------------------------------------------------------------------

@dataclass(slots=True)
class StatsigClientOptions:
    """Configuration dataclass accepted by :func:`create_statsig_client`.

    Every field mirrors a keyword argument on
    :class:`~statsig_client.client.StatsigClient.__init__`.

    Attributes
    ----------
    api_key:
        Statsig Console API key.  Falls back to ``STATSIG_API_KEY`` env var.
    base_url:
        Override the default Statsig Console API base URL.
    rate_limit_auto_wait:
        When ``True`` (default), the client sleeps and retries on HTTP 429.
    rate_limit_threshold:
        Reserved for future proactive throttling. Currently unused.
    on_rate_limit:
        Optional async callback ``(RateLimitInfo) -> bool``.  Return ``False``
        to abort instead of waiting.
    logger:
        Custom logger object conforming to the logger protocol.
    timeout:
        HTTP request timeout in seconds.
    proxy:
        Optional HTTP(S) proxy URL string.
    verify_ssl:
        Whether to verify TLS certificates.  Default ``True``.
    """

    api_key: str | None = None
    base_url: str = DEFAULT_BASE_URL
    rate_limit_auto_wait: bool = True
    rate_limit_threshold: int = 0
    on_rate_limit: Callable[[RateLimitInfo], Awaitable[bool]] | Callable[[RateLimitInfo], bool] | None = None
    logger: Any = None
    timeout: float = DEFAULT_TIMEOUT
    proxy: str | None = None
    verify_ssl: bool = True
