"""
Reactive rate limiter for the Sauce Labs API client.

Handles HTTP 429 responses by parsing ``Retry-After``, optionally sleeping
with exponential backoff, and retrying the original request.
"""

from __future__ import annotations

import asyncio
import inspect
import math
import random
from datetime import datetime, timezone
from typing import Any, Awaitable, Callable

from .errors import SaucelabsRateLimitError, create_error_from_response
from .logger import _Logger, create_logger
from .types import RateLimitInfo


class RateLimiter:
    """Reactive rate limiter for the Sauce Labs REST API.

    Parameters
    ----------
    auto_wait:
        If ``True``, the limiter sleeps and retries on HTTP 429.
    max_retries:
        Maximum consecutive retries before raising.
    on_rate_limit:
        Optional callback invoked with :class:`RateLimitInfo` on 429.
    logger:
        Custom logger instance.
    """

    __slots__ = (
        "_auto_wait",
        "_max_retries",
        "_on_rate_limit",
        "_logger",
        "_last_rate_limit",
    )

    def __init__(
        self,
        *,
        auto_wait: bool = True,
        max_retries: int = 5,
        on_rate_limit: (
            Callable[[RateLimitInfo], Awaitable[bool]]
            | Callable[[RateLimitInfo], bool]
            | None
        ) = None,
        logger: _Logger | Any | None = None,
    ) -> None:
        self._auto_wait = auto_wait
        self._max_retries = max_retries
        self._on_rate_limit = on_rate_limit
        self._logger: Any = logger or create_logger("saucelabs_api", "rate_limiter")
        self._last_rate_limit: RateLimitInfo | None = None

    @property
    def last_rate_limit(self) -> RateLimitInfo | None:
        return self._last_rate_limit

    @staticmethod
    def _parse_retry_after(headers: dict[str, str]) -> float:
        raw = headers.get("retry-after") or headers.get("Retry-After", "")
        try:
            return max(float(raw), 0.1)
        except (ValueError, TypeError):
            return 1.0

    @staticmethod
    def _calculate_backoff(retry_count: int, base_delay: float = 1.0, max_delay: float = 60.0) -> float:
        exponential = base_delay * math.pow(2, retry_count)
        jitter = random.random() * base_delay
        return min(exponential + jitter, max_delay)

    def _build_info(self, headers: dict[str, str]) -> RateLimitInfo:
        retry_after = self._parse_retry_after(headers)
        remaining_raw = headers.get("x-ratelimit-remaining")
        limit_raw = headers.get("x-ratelimit-limit")
        return RateLimitInfo(
            retry_after=retry_after,
            remaining=int(remaining_raw) if remaining_raw else None,
            limit=int(limit_raw) if limit_raw else None,
            reset_at=headers.get("x-ratelimit-reset"),
            timestamp=datetime.now(timezone.utc).isoformat(),
        )

    async def handle_response(
        self,
        response: Any,
        retry_fn: Callable[[], Awaitable[Any]],
        retry_count: int = 0,
    ) -> Any:
        """Process an HTTP response and handle 429 status codes."""
        if response.status_code != 429:
            return response

        headers = dict(response.headers)
        info = self._build_info(headers)
        self._last_rate_limit = info

        self._logger.warning(
            f"Rate limited (429). Retry-After: {info.retry_after}s",
            {"retry_count": retry_count, "retry_after": info.retry_after},
        )

        if self._on_rate_limit is not None:
            result = self._on_rate_limit(info)
            if inspect.isawaitable(result):
                result = await result
            if result is False:
                body = response.text if hasattr(response, "text") else ""
                raise create_error_from_response(429, body, headers)

        if not self._auto_wait:
            body = response.text if hasattr(response, "text") else ""
            raise create_error_from_response(429, body, headers)

        if retry_count >= self._max_retries:
            body = response.text if hasattr(response, "text") else ""
            raise create_error_from_response(429, body, headers)

        wait_seconds = info.retry_after if info.retry_after > 0 else self._calculate_backoff(retry_count)

        self._logger.info(
            f"Waiting {wait_seconds}s before retry {retry_count + 1}/{self._max_retries}",
        )
        await asyncio.sleep(wait_seconds)

        new_response = await retry_fn()
        return await self.handle_response(new_response, retry_fn, retry_count + 1)
