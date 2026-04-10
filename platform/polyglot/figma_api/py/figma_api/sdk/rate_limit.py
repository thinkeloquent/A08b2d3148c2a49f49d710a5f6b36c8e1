"""
Rate Limit Module — Figma API SDK

Figma-specific reactive rate limiting.
Figma uses a leaky bucket algorithm and signals rate limiting
exclusively via HTTP 429 + Retry-After header.
"""

import asyncio
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Callable, Dict, Optional

from ..logger import create_logger

log = create_logger("figma-api", __file__)


@dataclass
class RateLimitInfo:
    """Parsed rate limit information from a 429 response."""

    retry_after: float = 60.0
    retry_after_minutes: float = 1.0
    plan_tier: Optional[str] = None
    rate_limit_type: Optional[str] = None
    upgrade_link: Optional[str] = None
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class RateLimitOptions:
    """User-configurable rate limit options."""

    auto_wait: bool = True
    threshold: int = 0
    max_retry_after: float = 60.0
    on_rate_limit: Optional[Callable[[RateLimitInfo], Optional[bool]]] = None


def parse_rate_limit_headers(headers: Dict[str, str]) -> RateLimitInfo:
    """Parse rate limit headers from a 429 response."""
    retry_after = float(headers.get("retry-after", "60"))

    return RateLimitInfo(
        retry_after=retry_after,
        retry_after_minutes=round(retry_after / 60, 2),
        plan_tier=headers.get("x-figma-plan-tier"),
        rate_limit_type=headers.get("x-figma-rate-limit-type"),
        upgrade_link=headers.get("x-figma-upgrade-link"),
        timestamp=datetime.now(timezone.utc),
    )


async def wait_for_retry_after(seconds: float) -> None:
    """Wait for the specified Retry-After duration."""
    log.warn("rate limited, waiting", retry_after_seconds=seconds)
    await asyncio.sleep(seconds)


def should_auto_wait(
    rate_limit_info: RateLimitInfo,
    options: Optional[RateLimitOptions] = None,
) -> bool:
    """Determine whether to auto-wait on rate limit."""
    if options is None:
        return True

    if options.on_rate_limit:
        result = options.on_rate_limit(rate_limit_info)
        if result is False:
            log.info("on_rate_limit callback returned False, skipping auto-wait")
            return False

    if not options.auto_wait:
        return False

    if rate_limit_info.retry_after > options.max_retry_after:
        log.warn(
            "retry_after exceeds max_retry_after, skipping auto-wait",
            retry_after=rate_limit_info.retry_after,
            max_retry_after=options.max_retry_after,
        )
        return False

    return True


async def handle_rate_limit(
    headers: Dict[str, str],
    options: Optional[RateLimitOptions] = None,
) -> Dict[str, Any]:
    """Handle a 429 rate limit response. Returns dict with retry bool and info."""
    info = parse_rate_limit_headers(headers)

    log.warn(
        "rate limited by Figma API",
        retry_after=info.retry_after,
        plan_tier=info.plan_tier,
        rate_limit_type=info.rate_limit_type,
    )

    if should_auto_wait(info, options):
        await wait_for_retry_after(info.retry_after)
        return {"retry": True, "rate_limit_info": info}

    return {"retry": False, "rate_limit_info": info}
