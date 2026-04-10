"""
saucelabs_api -- Async Python client for the Sauce Labs REST API.

Quick start::

    from saucelabs_api import SaucelabsClient

    async with SaucelabsClient(username="demo", api_key="xxx") as client:
        jobs = await client.get("/rest/v1/demo/jobs", params={"limit": 5})

Or via the convenience factory::

    from saucelabs_api import create_saucelabs_client

    client = create_saucelabs_client(username="demo", api_key="xxx")
"""

from __future__ import annotations

from typing import Any

# -- Core client -----------------------------------------------------------
from .client import SaucelabsClient

# -- Error hierarchy -------------------------------------------------------
from .errors import (
    SaucelabsAuthError,
    SaucelabsConfigError,
    SaucelabsError,
    SaucelabsNotFoundError,
    SaucelabsRateLimitError,
    SaucelabsServerError,
    SaucelabsValidationError,
    create_error_from_response,
)

# -- Rate limiter ----------------------------------------------------------
from .rate_limiter import RateLimiter

# -- Logger factory --------------------------------------------------------
from .logger import create_logger

# -- Types and constants ---------------------------------------------------
from .types import (
    AUTOMATION_API_VALUES,
    CORE_REGIONS,
    DEFAULT_BASE_URL,
    DEFAULT_MOBILE_BASE_URL,
    DEFAULT_TIMEOUT,
    MOBILE_REGIONS,
    VALID_UPLOAD_EXTENSIONS,
    VENDOR,
    VENDOR_VERSION,
    RateLimitInfo,
    SaucelabsClientOptions,
)

# -- Config ----------------------------------------------------------------
from .config import resolve_config, resolve_core_base_url, resolve_mobile_base_url

# -- Domain modules --------------------------------------------------------
from .modules import (
    JobsModule,
    PlatformModule,
    UploadModule,
    UsersModule,
)


# -- Convenience factory ---------------------------------------------------

def create_saucelabs_client(
    options: SaucelabsClientOptions | None = None,
    **kwargs: Any,
) -> SaucelabsClient:
    """Create a :class:`SaucelabsClient` with all domain modules attached.

    Parameters
    ----------
    options:
        Optional configuration dataclass.
    **kwargs:
        Keyword overrides (username, api_key, region, etc.).

    Returns
    -------
    SaucelabsClient
        A configured (but not yet entered) async client instance with
        ``.jobs``, ``.platform``, ``.users``, and ``.upload`` modules.
    """
    merged: dict[str, Any] = {}
    if options is not None:
        from dataclasses import asdict
        merged.update(asdict(options))
    merged.update({k: v for k, v in kwargs.items() if v is not None})

    client = SaucelabsClient(**merged)
    client.jobs = JobsModule(client)  # type: ignore[attr-defined]
    client.platform = PlatformModule(client)  # type: ignore[attr-defined]
    client.users = UsersModule(client)  # type: ignore[attr-defined]
    client.upload = UploadModule(client)  # type: ignore[attr-defined]

    return client


__version__ = "1.0.0"

__all__ = [
    # Core
    "SaucelabsClient",
    "create_saucelabs_client",
    # Errors
    "SaucelabsError",
    "SaucelabsAuthError",
    "SaucelabsNotFoundError",
    "SaucelabsRateLimitError",
    "SaucelabsValidationError",
    "SaucelabsServerError",
    "SaucelabsConfigError",
    "create_error_from_response",
    # Rate limiter
    "RateLimiter",
    # Logger
    "create_logger",
    # Config
    "resolve_config",
    "resolve_core_base_url",
    "resolve_mobile_base_url",
    # Types
    "RateLimitInfo",
    "SaucelabsClientOptions",
    "DEFAULT_BASE_URL",
    "DEFAULT_MOBILE_BASE_URL",
    "DEFAULT_TIMEOUT",
    "CORE_REGIONS",
    "MOBILE_REGIONS",
    "VENDOR",
    "VENDOR_VERSION",
    "AUTOMATION_API_VALUES",
    "VALID_UPLOAD_EXTENSIONS",
    # Domain modules
    "JobsModule",
    "PlatformModule",
    "UsersModule",
    "UploadModule",
]
