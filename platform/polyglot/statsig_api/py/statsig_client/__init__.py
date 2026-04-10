"""
statsig_client -- Async Python client for the Statsig Console API.

Quick start::

    from statsig_client import StatsigClient

    async with StatsigClient(api_key="console-xxx") as client:
        gates = await client.get("/gates")

Or via the convenience factory::

    from statsig_client import create_statsig_client, StatsigClientOptions

    options = StatsigClientOptions(api_key="console-xxx")
    client = create_statsig_client(options)
"""

from __future__ import annotations

from typing import Any

# -- Core client -----------------------------------------------------------
from .client import StatsigClient

# -- Error hierarchy -------------------------------------------------------
from .errors import (
    AuthenticationError,
    NotFoundError,
    RateLimitError,
    ServerError,
    StatsigError,
    ValidationError,
    create_error_from_response,
)

# -- Rate limiter ----------------------------------------------------------
from .rate_limiter import RateLimiter

# -- Pagination helpers ----------------------------------------------------
from .pagination import list_all, paginate

# -- Logger factory --------------------------------------------------------
from .logger import create_logger

# -- Types and constants ---------------------------------------------------
from .types import (
    DEFAULT_BASE_URL,
    DEFAULT_TIMEOUT,
    RateLimitInfo,
    StatsigClientOptions,
)

# -- Domain modules --------------------------------------------------------
from .modules import (
    AuditLogsModule,
    EventsModule,
    ExperimentsModule,
    GatesModule,
    LayersModule,
    MetricsModule,
    ReportsModule,
    SegmentsModule,
    TagsModule,
)


# -- Convenience factory ---------------------------------------------------


def create_statsig_client(options: StatsigClientOptions | None = None, **kwargs: Any) -> StatsigClient:
    """Create a :class:`StatsigClient` from a :class:`StatsigClientOptions` dataclass.

    This is a thin convenience wrapper so callers can pass a config object
    instead of individual keyword arguments::

        opts = StatsigClientOptions(api_key="console-xxx", timeout=60)
        client = create_statsig_client(opts)

    Any extra *kwargs* override fields from *options*.

    Parameters
    ----------
    options:
        Optional configuration dataclass. If ``None``, all settings must be
        provided via *kwargs* (or the ``STATSIG_API_KEY`` environment variable).
    **kwargs:
        Keyword overrides that take precedence over *options* fields.

    Returns
    -------
    StatsigClient
        A configured (but not yet entered) async client instance.
    """
    merged: dict[str, Any] = {}
    if options is not None:
        from dataclasses import asdict
        merged.update(asdict(options))
    merged.update({k: v for k, v in kwargs.items() if v is not None})
    return StatsigClient(**merged)


__all__ = [
    # Core
    "StatsigClient",
    "create_statsig_client",
    # Errors
    "StatsigError",
    "AuthenticationError",
    "NotFoundError",
    "RateLimitError",
    "ValidationError",
    "ServerError",
    "create_error_from_response",
    # Rate limiter
    "RateLimiter",
    # Pagination
    "paginate",
    "list_all",
    # Logger
    "create_logger",
    # Types
    "RateLimitInfo",
    "StatsigClientOptions",
    "DEFAULT_BASE_URL",
    "DEFAULT_TIMEOUT",
    # Domain modules
    "AuditLogsModule",
    "EventsModule",
    "ExperimentsModule",
    "GatesModule",
    "LayersModule",
    "MetricsModule",
    "ReportsModule",
    "SegmentsModule",
    "TagsModule",
]
