"""
Reactive rate limiter for the Statsig Console API client.

Handles HTTP 429 responses by parsing ``Retry-After``, optionally sleeping,
and retrying the original request.  Invokes an optional callback so callers
can implement custom back-off or circuit-breaker logic.
"""

from __future__ import annotations

import asyncio
import inspect
from datetime import datetime, timezone
from typing import Any, Awaitable, Callable

from .errors import RateLimitError, create_error_from_response
from .logger import _Logger, create_logger
from .types import RateLimitInfo


class RateLimiter:
    """Reactive rate limiter that responds to HTTP 429 status codes.

    Parameters
    ----------
    auto_wait:
        If ``True``, the limiter will ``asyncio.sleep`` for the duration
        indicated by the ``Retry-After`` header and then invoke *retry_fn*.
    max_retries:
        Maximum number of consecutive retries on 429 before raising
        :class:`~statsig_client.errors.RateLimitError`.
    on_rate_limit:
        Optional callback invoked with a :class:`RateLimitInfo` each time a
        429 is received.  May be sync or async.  If it returns ``False``, the
        request is aborted with a :class:`RateLimitError` regardless of
        *auto_wait*.
    logger:
        Custom logger instance.  Defaults to the package logger.
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
        max_retries: int = 3,
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
        self._logger: Any = logger or create_logger("statsig_client", "rate_limiter")
        self._last_rate_limit: RateLimitInfo | None = None

    # -- public properties -------------------------------------------------

    @property
    def last_rate_limit(self) -> RateLimitInfo | None:
        """The most recent :class:`RateLimitInfo`, or ``None`` if no 429 has been seen."""
        return self._last_rate_limit

    # -- helpers -----------------------------------------------------------

    @staticmethod
    def _parse_retry_after(headers: dict[str, str]) -> float:
        """Extract ``Retry-After`` as a float (seconds). Default ``1.0``."""
        raw = headers.get("retry-after") or headers.get("Retry-After", "")
        try:
            return max(float(raw), 0.1)
        except (ValueError, TypeError):
            return 1.0

    @staticmethod
    def _parse_optional_int(headers: dict[str, str], key: str) -> int | None:
        raw = headers.get(key)
        if raw is None:
            return None
        try:
            return int(raw)
        except (ValueError, TypeError):
            return None

    def _build_info(self, headers: dict[str, str]) -> RateLimitInfo:
        """Construct a :class:`RateLimitInfo` from response headers."""
        return RateLimitInfo(
            retry_after=self._parse_retry_after(headers),
            remaining=self._parse_optional_int(headers, "x-ratelimit-remaining"),
            limit=self._parse_optional_int(headers, "x-ratelimit-limit"),
            reset_at=headers.get("x-ratelimit-reset"),
            timestamp=datetime.now(timezone.utc).isoformat(),
        )

    # -- core logic --------------------------------------------------------

    async def handle_response(
        self,
        response: Any,
        retry_fn: Callable[[], Awaitable[Any]],
        retry_count: int = 0,
    ) -> Any:
        """Process an HTTP response and handle 429 status codes.

        Parameters
        ----------
        response:
            An ``httpx.Response``-like object with ``.status_code`` and
            ``.headers`` attributes.
        retry_fn:
            An async callable that re-issues the original request and returns
            a new response.
        retry_count:
            Current retry attempt number (0-indexed on first call).

        Returns
        -------
        Any
            The original *response* if its status is not 429, or the response
            from a successful retry.

        Raises
        ------
        RateLimitError
            If max retries are exhausted, auto_wait is ``False``, or the
            *on_rate_limit* callback returns ``False``.
        """
        if response.status_code != 429:
            return response

        # -- 429 handling --------------------------------------------------
        headers = dict(response.headers)
        info = self._build_info(headers)
        self._last_rate_limit = info

        self._logger.warning(
            f"Rate limited (429). Retry-After: {info.retry_after}s",
            {"retry_count": retry_count, "retry_after": info.retry_after},
        )

        # Invoke user callback if provided.
        if self._on_rate_limit is not None:
            result = self._on_rate_limit(info)
            if inspect.isawaitable(result):
                result = await result
            if result is False:
                body = response.text if hasattr(response, "text") else ""
                raise create_error_from_response(429, body, headers)

        # Decide whether to wait and retry.
        if not self._auto_wait:
            body = response.text if hasattr(response, "text") else ""
            raise create_error_from_response(429, body, headers)

        if retry_count >= self._max_retries:
            body = response.text if hasattr(response, "text") else ""
            raise create_error_from_response(429, body, headers)

        self._logger.info(
            f"Waiting {info.retry_after}s before retry {retry_count + 1}/{self._max_retries}",
        )
        await asyncio.sleep(info.retry_after)

        new_response = await retry_fn()
        return await self.handle_response(new_response, retry_fn, retry_count + 1)
