"""
Rate limit parsing, detection, and wait logic for the GitHub API.

Handles both primary rate limits (x-ratelimit-* headers) and
secondary rate limits (403/429 with Retry-After).
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any, Mapping

from pydantic import BaseModel, Field

__all__ = [
    "RateLimitInfo",
    "parse_rate_limit_headers",
    "should_wait_for_rate_limit",
    "wait_for_rate_limit",
    "is_secondary_rate_limit",
]


class RateLimitInfo(BaseModel):
    """Parsed rate limit information from GitHub API response headers."""

    limit: int = Field(description="Maximum number of requests per window")
    remaining: int = Field(description="Requests remaining in current window")
    reset: int = Field(description="Unix timestamp when the window resets")
    used: int = Field(default=0, description="Requests used in current window")
    resource: str = Field(default="core", description="Rate limit resource category")

    @property
    def reset_at(self) -> datetime:
        """Return reset time as a datetime object (UTC)."""
        return datetime.fromtimestamp(self.reset, tz=timezone.utc)

    @property
    def seconds_until_reset(self) -> float:
        """Seconds until the rate limit window resets."""
        now = datetime.now(tz=timezone.utc).timestamp()
        return max(0, self.reset - now)

    @property
    def is_exhausted(self) -> bool:
        """Whether the rate limit is exhausted."""
        return self.remaining == 0


def parse_rate_limit_headers(
    headers: Mapping[str, str],
) -> RateLimitInfo | None:
    """Parse rate limit info from GitHub API response headers.

    Args:
        headers: HTTP response headers (case-insensitive mapping).

    Returns:
        RateLimitInfo if rate limit headers are present, None otherwise.
    """
    limit_str = headers.get("x-ratelimit-limit")
    remaining_str = headers.get("x-ratelimit-remaining")
    reset_str = headers.get("x-ratelimit-reset")

    if limit_str is None or remaining_str is None or reset_str is None:
        return None

    try:
        limit = int(limit_str)
        remaining = int(remaining_str)
        reset = int(reset_str)
    except (ValueError, TypeError):
        return None

    used_str = headers.get("x-ratelimit-used", "0")
    try:
        used = int(used_str)
    except (ValueError, TypeError):
        used = limit - remaining

    resource = headers.get("x-ratelimit-resource", "core")

    return RateLimitInfo(
        limit=limit,
        remaining=remaining,
        reset=reset,
        used=used,
        resource=resource,
    )


def should_wait_for_rate_limit(
    info: RateLimitInfo,
    *,
    auto_wait: bool = True,
    threshold: int = 0,
) -> bool:
    """Determine if the client should wait before making another request.

    Args:
        info: Current rate limit information.
        auto_wait: Whether auto-wait is enabled.
        threshold: Remaining count threshold below which to wait.

    Returns:
        True if the client should wait.
    """
    if not auto_wait:
        return False
    return info.remaining <= threshold


async def wait_for_rate_limit(
    info: RateLimitInfo,
    logger: logging.Logger | None = None,
) -> None:
    """Sleep until the rate limit window resets.

    Args:
        info: Rate limit information containing the reset timestamp.
        logger: Optional logger for status messages.
    """
    wait_seconds = info.seconds_until_reset + 1  # 1s buffer
    if wait_seconds <= 0:
        return

    if logger:
        logger.warning(
            "Rate limit exhausted. Waiting %.1f seconds until reset at %s.",
            wait_seconds,
            info.reset_at.isoformat(),
        )

    await asyncio.sleep(wait_seconds)


def is_secondary_rate_limit(
    status: int,
    body: dict[str, Any] | None = None,
) -> bool:
    """Detect if a response indicates a secondary (abuse) rate limit.

    Secondary rate limits return 403 or 429 with a message about
    rate limiting or abuse detection.

    Args:
        status: HTTP response status code.
        body: Parsed JSON response body.

    Returns:
        True if the response is a secondary rate limit.
    """
    if status not in (403, 429):
        return False

    if body is None:
        return False

    message = body.get("message", "").lower()
    secondary_indicators = [
        "rate limit",
        "abuse detection",
        "secondary rate",
        "retry later",
        "you have exceeded a secondary rate limit",
    ]

    return any(indicator in message for indicator in secondary_indicators)
