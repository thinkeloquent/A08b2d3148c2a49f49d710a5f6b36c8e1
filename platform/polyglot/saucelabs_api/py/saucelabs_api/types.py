"""
Shared type definitions for the Sauce Labs API client.

All public types are plain :mod:`dataclasses` so they can be created,
inspected, and serialised without third-party dependencies.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Awaitable, Callable

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

DEFAULT_BASE_URL: str = "https://api.us-west-1.saucelabs.com"
DEFAULT_MOBILE_BASE_URL: str = "https://mobile.saucelabs.com"
DEFAULT_TIMEOUT: float = 30.0

CORE_REGIONS: dict[str, str] = {
    "us-west-1": "https://api.us-west-1.saucelabs.com",
    "us-east-4": "https://api.us-east-4.saucelabs.com",
    "eu-central-1": "https://api.eu-central-1.saucelabs.com",
}

MOBILE_REGIONS: dict[str, str] = {
    "us-east": "https://mobile.saucelabs.com",
    "eu-central-1": "https://mobile.eu-central-1.saucelabs.com",
}

VENDOR: str = "saucelabs_api"
VENDOR_VERSION: str = "v1"

AUTOMATION_API_VALUES: list[str] = ["all", "appium", "webdriver"]
VALID_UPLOAD_EXTENSIONS: list[str] = [".apk", ".ipa", ".aab"]


# ---------------------------------------------------------------------------
# Rate-limit info
# ---------------------------------------------------------------------------

@dataclass(frozen=True, slots=True)
class RateLimitInfo:
    """Snapshot of rate-limit state extracted from a 429 response."""

    retry_after: float
    remaining: int | None = None
    limit: int | None = None
    reset_at: str | None = None
    timestamp: str = ""


# ---------------------------------------------------------------------------
# Client options
# ---------------------------------------------------------------------------

@dataclass(slots=True)
class SaucelabsClientOptions:
    """Configuration dataclass accepted by :func:`create_saucelabs_client`."""

    api_key: str | None = None
    username: str | None = None
    base_url: str = DEFAULT_BASE_URL
    mobile_base_url: str = DEFAULT_MOBILE_BASE_URL
    region: str = "us-west-1"
    mobile_region: str = "us-east"
    rate_limit_auto_wait: bool = True
    rate_limit_threshold: int = 0
    on_rate_limit: Callable[[RateLimitInfo], Awaitable[bool]] | Callable[[RateLimitInfo], bool] | None = None
    logger: Any = None
    timeout: float = DEFAULT_TIMEOUT
    proxy: str | None = None
    verify_ssl: bool = True
