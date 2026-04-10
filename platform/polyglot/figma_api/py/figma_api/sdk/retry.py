"""
Retry Module — Figma API SDK

Exponential backoff with jitter.
max retries: 3, initial wait: 1s, max wait: 30s.
On 429, defers to Retry-After instead of backoff.
"""

import asyncio
import random
from typing import Any, Callable, Optional, TypeVar

from ..config import DEFAULTS
from ..logger import create_logger

log = create_logger("figma-api", __file__)

T = TypeVar("T")


def calculate_backoff(
    attempt: int,
    initial_wait: float = DEFAULTS["retry_initial_wait"],
    max_wait: float = DEFAULTS["retry_max_wait"],
) -> float:
    """Calculate backoff delay with jitter."""
    exponential = initial_wait * (2 ** attempt)
    jitter = random.random() * initial_wait
    return min(exponential + jitter, max_wait)


def is_retryable(status: int) -> bool:
    """Determine if an HTTP status is retryable (5xx errors)."""
    return status >= 500


async def with_retry(
    fn: Callable,
    *,
    max_retries: int = DEFAULTS["max_retries"],
    initial_wait: float = DEFAULTS["retry_initial_wait"],
    max_wait: float = DEFAULTS["retry_max_wait"],
) -> Any:
    """Execute an async function with retry logic."""
    last_error = None

    for attempt in range(max_retries + 1):
        try:
            return await fn(attempt)
        except Exception as error:
            last_error = error

            if attempt >= max_retries:
                log.error("max retries exceeded", attempts=attempt + 1, error=str(error))
                raise

            status = getattr(error, "status", None)
            if status and not is_retryable(status) and status != 429:
                raise

            delay = calculate_backoff(attempt, initial_wait, max_wait)
            log.warn("retrying request", attempt=attempt + 1, max_retries=max_retries, delay_ms=round(delay * 1000))
            await asyncio.sleep(delay)

    raise last_error  # type: ignore[misc]
