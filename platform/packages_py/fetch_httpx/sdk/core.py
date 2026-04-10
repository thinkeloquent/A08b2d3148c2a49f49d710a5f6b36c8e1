"""
Core SDK Functionality for fetch_httpx package.

Provides high-level SDK abstraction for building API clients
with automatic retry, pagination, and error handling.

Implements industry-standard retry patterns:
- Capped exponential backoff with jitter
- Retry-After header support
- Idempotency-aware retry (safe methods only by default)
- Circuit breaker pattern
"""

from __future__ import annotations

import random
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import (
    TYPE_CHECKING,
    Any,
    TypeVar,
)

from .. import logger as logger_module
from .._client import AsyncClient
from .._config import DEFAULT_TIMEOUT, Timeout
from .._exceptions import HTTPError
from .._models import Response

if TYPE_CHECKING:
    from .._types import AuthTypes, HeaderTypes

logger = logger_module.create("fetch_httpx", __file__)

T = TypeVar("T")

# HTTP methods considered safe/idempotent for retry
SAFE_METHODS = frozenset({"GET", "HEAD", "OPTIONS", "TRACE"})
IDEMPOTENT_METHODS = frozenset({"GET", "HEAD", "OPTIONS", "TRACE", "PUT", "DELETE"})


# =============================================================================
# Jitter Strategies
# =============================================================================

class JitterStrategy(Enum):
    """Jitter strategies for retry backoff."""

    NONE = "none"          # No jitter: delay = base * (backoff ^ attempt)
    FULL = "full"          # Full jitter: delay = random(0, calculated_delay)
    EQUAL = "equal"        # Equal jitter: delay = calculated_delay/2 + random(0, calculated_delay/2)
    DECORRELATED = "decorrelated"  # Decorrelated: delay = random(base, previous_delay * 3)


# =============================================================================
# Circuit Breaker
# =============================================================================

class CircuitState(Enum):
    """Circuit breaker states."""

    CLOSED = "closed"      # Normal operation, requests allowed
    OPEN = "open"          # Circuit tripped, requests blocked
    HALF_OPEN = "half_open"  # Testing if service recovered


@dataclass
class CircuitBreakerConfig:
    """
    Circuit breaker configuration.

    Prevents cascading failures by stopping requests to failing services.

    Args:
        failure_threshold: Failures before opening circuit (default: 5)
        success_threshold: Successes in half-open before closing (default: 2)
        timeout: Seconds before half-open attempt (default: 30)
        enabled: Whether circuit breaker is active (default: True)
    """

    failure_threshold: int = 5
    success_threshold: int = 2
    timeout: float = 30.0
    enabled: bool = True


class CircuitBreaker:
    """
    Circuit breaker implementation.

    States:
    - CLOSED: Normal operation, tracking failures
    - OPEN: Blocking requests, waiting for timeout
    - HALF_OPEN: Allowing test requests to check recovery

    Example:
        breaker = CircuitBreaker(CircuitBreakerConfig(failure_threshold=5))

        if breaker.allow_request():
            try:
                response = await make_request()
                breaker.record_success()
            except Exception:
                breaker.record_failure()
        else:
            raise CircuitOpenError("Circuit is open")
    """

    def __init__(self, config: CircuitBreakerConfig | None = None) -> None:
        self._config = config or CircuitBreakerConfig()
        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._success_count = 0
        self._last_failure_time: float = 0
        self._last_state_change: float = time.monotonic()

        logger.debug(
            "CircuitBreaker initialized",
            context={
                "failure_threshold": self._config.failure_threshold,
                "timeout": self._config.timeout,
            }
        )

    @property
    def state(self) -> CircuitState:
        """Current circuit state."""
        return self._state

    @property
    def is_open(self) -> bool:
        """Check if circuit is open (blocking requests)."""
        return self._state == CircuitState.OPEN

    def allow_request(self) -> bool:
        """
        Check if a request should be allowed.

        Returns:
            True if request is allowed, False if circuit is open
        """
        if not self._config.enabled:
            return True

        if self._state == CircuitState.CLOSED:
            return True

        if self._state == CircuitState.OPEN:
            # Check if timeout has elapsed for half-open attempt
            elapsed = time.monotonic() - self._last_failure_time
            if elapsed >= self._config.timeout:
                self._transition_to(CircuitState.HALF_OPEN)
                logger.info(
                    "Circuit transitioning to half-open",
                    context={"elapsed": elapsed}
                )
                return True
            return False

        # HALF_OPEN: allow limited requests
        return True

    def record_success(self) -> None:
        """Record a successful request."""
        if not self._config.enabled:
            return

        if self._state == CircuitState.HALF_OPEN:
            self._success_count += 1
            if self._success_count >= self._config.success_threshold:
                self._transition_to(CircuitState.CLOSED)
                logger.info(
                    "Circuit closed after recovery",
                    context={"successes": self._success_count}
                )
        elif self._state == CircuitState.CLOSED:
            # Reset failure count on success
            self._failure_count = 0

    def record_failure(self) -> None:
        """Record a failed request."""
        if not self._config.enabled:
            return

        self._last_failure_time = time.monotonic()

        if self._state == CircuitState.HALF_OPEN:
            # Immediate trip back to open on failure during half-open
            self._transition_to(CircuitState.OPEN)
            logger.warn(
                "Circuit re-opened after half-open failure",
            )
        elif self._state == CircuitState.CLOSED:
            self._failure_count += 1
            if self._failure_count >= self._config.failure_threshold:
                self._transition_to(CircuitState.OPEN)
                logger.warn(
                    "Circuit opened due to failures",
                    context={"failures": self._failure_count}
                )

    def _transition_to(self, state: CircuitState) -> None:
        """Transition to a new state."""
        old_state = self._state
        self._state = state
        self._last_state_change = time.monotonic()

        if state == CircuitState.CLOSED:
            self._failure_count = 0
            self._success_count = 0
        elif state == CircuitState.HALF_OPEN:
            self._success_count = 0

        logger.debug(
            "Circuit state changed",
            context={"from": old_state.value, "to": state.value}
        )

    def reset(self) -> None:
        """Reset circuit breaker to initial state."""
        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._success_count = 0
        self._last_failure_time = 0
        logger.debug("Circuit breaker reset")


# =============================================================================
# Circuit Open Exception
# =============================================================================

class CircuitOpenError(HTTPError):
    """Raised when circuit breaker is open and blocking requests."""

    def __init__(self, message: str = "Circuit breaker is open") -> None:
        super().__init__(message)


# =============================================================================
# SDK Configuration
# =============================================================================

@dataclass
class SDKConfig:
    """
    SDK configuration options.

    Provides a structured way to configure SDK behavior including
    retry logic, timeouts, and custom handling.

    Retry Configuration:
        max_retries: Maximum retry attempts (default: 3)
        retry_delay: Initial delay in seconds (default: 0.5)
        retry_backoff: Backoff multiplier (default: 2.0)
        max_retry_delay: Maximum delay cap in seconds (default: 30.0)
        jitter: Jitter strategy for backoff (default: FULL)
        retry_on_status: HTTP status codes to retry (default: [429, 500, 502, 503, 504])
        respect_retry_after_header: Honor Retry-After header (default: True)
        retry_methods: Methods to retry, None = safe methods only (default: None)

    Circuit Breaker:
        circuit_breaker: Circuit breaker config, None to disable (default: enabled)
    """

    base_url: str = ""
    auth: AuthTypes | None = None
    headers: HeaderTypes | None = None
    timeout: Timeout = field(default_factory=lambda: DEFAULT_TIMEOUT)

    # Retry configuration
    max_retries: int = 3
    retry_delay: float = 0.5  # 500ms base delay (industry standard)
    retry_backoff: float = 2.0
    max_retry_delay: float = 30.0  # Cap at 30 seconds
    jitter: JitterStrategy = JitterStrategy.FULL
    retry_on_status: list[int] = field(default_factory=lambda: [429, 500, 502, 503, 504])
    respect_retry_after_header: bool = True
    retry_methods: list[str] | None = None  # None = IDEMPOTENT_METHODS only

    # Circuit breaker
    circuit_breaker: CircuitBreakerConfig | None = field(
        default_factory=CircuitBreakerConfig
    )

    raise_on_error: bool = True

    def __post_init__(self) -> None:
        logger.debug(
            "SDKConfig created",
            context={
                "base_url": self.base_url,
                "max_retries": self.max_retries,
                "jitter": self.jitter.value,
                "max_retry_delay": self.max_retry_delay,
                "circuit_breaker_enabled": self.circuit_breaker is not None,
            }
        )


# =============================================================================
# SDK Class
# =============================================================================

class SDK:
    """
    High-level SDK for building API clients.

    Provides automatic retry with industry-standard patterns:
    - Capped exponential backoff with jitter
    - Retry-After header support
    - Idempotency-aware retry (safe methods only by default)
    - Circuit breaker pattern

    Example:
        config = SDKConfig(
            base_url="https://api.example.com/v1",
            auth=("api_key", "secret"),
            max_retries=5,
            jitter=JitterStrategy.FULL,
            circuit_breaker=CircuitBreakerConfig(failure_threshold=5),
        )

        async with SDK(config) as sdk:
            # Make requests with automatic retry + circuit breaker
            users = await sdk.get("/users", response_type=list)

            # POST with idempotency key enables retry
            order = await sdk.post(
                "/orders",
                json={"item": "widget"},
                headers={"Idempotency-Key": "unique-key-123"},
            )
    """

    def __init__(
        self,
        config: SDKConfig | None = None,
        *,
        client: AsyncClient | None = None,
    ) -> None:
        self._config = config or SDKConfig()
        self._client: AsyncClient | None = client
        self._owns_client = client is None

        # Initialize circuit breaker
        self._circuit_breaker: CircuitBreaker | None = None
        if self._config.circuit_breaker:
            self._circuit_breaker = CircuitBreaker(self._config.circuit_breaker)

        # Track last delay for decorrelated jitter
        self._last_delay: float = self._config.retry_delay

        logger.info(
            "SDK initialized",
            context={
                "base_url": self._config.base_url,
                "circuit_breaker": self._circuit_breaker is not None,
            }
        )

    @property
    def circuit_breaker(self) -> CircuitBreaker | None:
        """Access the circuit breaker instance."""
        return self._circuit_breaker

    async def _ensure_client(self) -> AsyncClient:
        """Lazily create the HTTP client."""
        if self._client is None:
            self._client = AsyncClient(
                base_url=self._config.base_url,
                auth=self._config.auth,
                headers=self._config.headers,
                timeout=self._config.timeout,
            )
        return self._client

    def _should_retry_method(self, method: str, headers: dict | None = None) -> bool:
        """
        Check if method should be retried based on idempotency.

        Args:
            method: HTTP method
            headers: Request headers (check for Idempotency-Key)

        Returns:
            True if method is safe to retry
        """
        method_upper = method.upper()

        # If explicit retry_methods configured, use that
        if self._config.retry_methods is not None:
            return method_upper in [m.upper() for m in self._config.retry_methods]

        # Default: retry idempotent methods
        if method_upper in IDEMPOTENT_METHODS:
            return True

        # POST/PATCH with Idempotency-Key header is safe to retry
        if headers:
            idempotency_key = (
                headers.get("Idempotency-Key")
                or headers.get("idempotency-key")
                or headers.get("X-Idempotency-Key")
                or headers.get("x-idempotency-key")
            )
            if idempotency_key:
                return True

        return False

    def _calculate_delay(
        self,
        attempt: int,
        base_delay: float,
        backoff: float,
        max_delay: float,
    ) -> float:
        """
        Calculate retry delay with jitter.

        Args:
            attempt: Current attempt number (0-indexed)
            base_delay: Base delay in seconds
            backoff: Backoff multiplier
            max_delay: Maximum delay cap

        Returns:
            Delay in seconds with jitter applied
        """
        # Calculate exponential delay
        calculated = base_delay * (backoff ** attempt)

        # Apply cap
        capped = min(calculated, max_delay)

        # Apply jitter strategy
        jitter = self._config.jitter

        if jitter == JitterStrategy.NONE:
            delay = capped
        elif jitter == JitterStrategy.FULL:
            # Full jitter: random between 0 and calculated delay
            delay = random.uniform(0, capped)
        elif jitter == JitterStrategy.EQUAL:
            # Equal jitter: half fixed + half random
            delay = (capped / 2) + random.uniform(0, capped / 2)
        elif jitter == JitterStrategy.DECORRELATED:
            # Decorrelated jitter: based on previous delay
            delay = random.uniform(base_delay, self._last_delay * 3)
            delay = min(delay, max_delay)
            self._last_delay = delay
        else:
            delay = capped

        return delay

    def _parse_retry_after(self, response: Response) -> float | None:
        """
        Parse Retry-After header from response.

        Supports both:
        - Seconds: "Retry-After: 120"
        - HTTP-date: "Retry-After: Wed, 21 Oct 2024 07:28:00 GMT"

        Returns:
            Delay in seconds, or None if not present/parseable
        """
        retry_after = response.headers.get("Retry-After")
        if not retry_after:
            return None

        # Try parsing as seconds
        try:
            return float(retry_after)
        except ValueError:
            pass

        # Try parsing as HTTP-date
        try:
            from email.utils import parsedate_to_datetime

            retry_date = parsedate_to_datetime(retry_after)
            from datetime import UTC, datetime

            now = datetime.now(UTC)
            delta = (retry_date - now).total_seconds()
            return max(0, delta)
        except (ValueError, TypeError):
            pass

        logger.warn(
            "Could not parse Retry-After header",
            context={"value": retry_after}
        )
        return None

    async def _request_with_retry(
        self,
        method: str,
        path: str,
        **kwargs: Any,
    ) -> Response:
        """Make a request with automatic retry and circuit breaker."""
        import asyncio

        # Check circuit breaker
        if self._circuit_breaker and not self._circuit_breaker.allow_request():
            raise CircuitOpenError(
                f"Circuit breaker is open, request to {path} blocked"
            )

        # Check if method is safe to retry
        can_retry = self._should_retry_method(method, kwargs.get("headers"))

        client = await self._ensure_client()
        last_error: Exception | None = None

        # Reset decorrelated jitter tracking
        self._last_delay = self._config.retry_delay

        for attempt in range(self._config.max_retries + 1):
            try:
                response = await client.request(method, path, **kwargs)

                # Check if we should retry based on status
                should_retry_status = (
                    response.status_code in self._config.retry_on_status
                    and attempt < self._config.max_retries
                    and can_retry
                )

                if should_retry_status:
                    # Calculate delay
                    delay = self._calculate_delay(
                        attempt,
                        self._config.retry_delay,
                        self._config.retry_backoff,
                        self._config.max_retry_delay,
                    )

                    # Check Retry-After header for 429/503
                    if self._config.respect_retry_after_header:
                        retry_after = self._parse_retry_after(response)
                        if retry_after is not None:
                            # Cap Retry-After to max_retry_delay
                            delay = min(retry_after, self._config.max_retry_delay)
                            logger.info(
                                "Using Retry-After header",
                                context={"retry_after": retry_after, "capped_to": delay}
                            )

                    logger.warn(
                        "Retrying request",
                        context={
                            "status_code": response.status_code,
                            "attempt": attempt + 1,
                            "delay": round(delay, 3),
                            "method": method,
                            "path": path,
                        }
                    )

                    # Record failure for circuit breaker
                    if self._circuit_breaker:
                        self._circuit_breaker.record_failure()

                    await asyncio.sleep(delay)
                    continue

                # Success - record for circuit breaker
                if self._circuit_breaker and response.is_success:
                    self._circuit_breaker.record_success()

                # Raise on error if configured
                if self._config.raise_on_error and response.is_error:
                    if self._circuit_breaker:
                        self._circuit_breaker.record_failure()
                    response.raise_for_status()

                return response

            except CircuitOpenError:
                # Don't retry circuit open errors
                raise

            except HTTPError as e:
                last_error = e

                # Record failure for circuit breaker
                if self._circuit_breaker:
                    self._circuit_breaker.record_failure()

                # Only retry if method is idempotent/safe
                if not can_retry:
                    logger.warn(
                        "Not retrying non-idempotent request",
                        context={"method": method, "error": str(e)}
                    )
                    raise

                if attempt < self._config.max_retries:
                    delay = self._calculate_delay(
                        attempt,
                        self._config.retry_delay,
                        self._config.retry_backoff,
                        self._config.max_retry_delay,
                    )

                    logger.warn(
                        "Request failed, retrying",
                        context={
                            "error": str(e),
                            "attempt": attempt + 1,
                            "delay": round(delay, 3),
                            "method": method,
                        }
                    )
                    await asyncio.sleep(delay)
                else:
                    raise

        # Should never reach here, but for type safety
        if last_error:
            raise last_error
        raise HTTPError("Unexpected error in retry loop")

    async def get(
        self,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        response_type: type[T] | None = None,
        **kwargs: Any,
    ) -> Response | T:
        """Make a GET request."""
        response = await self._request_with_retry("GET", path, params=params, **kwargs)

        if response_type is not None:
            return response.json()
        return response

    async def post(
        self,
        path: str,
        *,
        json: Any | None = None,
        data: dict[str, Any] | None = None,
        response_type: type[T] | None = None,
        **kwargs: Any,
    ) -> Response | T:
        """Make a POST request."""
        response = await self._request_with_retry(
            "POST", path, json=json, data=data, **kwargs
        )

        if response_type is not None:
            return response.json()
        return response

    async def put(
        self,
        path: str,
        *,
        json: Any | None = None,
        data: dict[str, Any] | None = None,
        response_type: type[T] | None = None,
        **kwargs: Any,
    ) -> Response | T:
        """Make a PUT request."""
        response = await self._request_with_retry(
            "PUT", path, json=json, data=data, **kwargs
        )

        if response_type is not None:
            return response.json()
        return response

    async def patch(
        self,
        path: str,
        *,
        json: Any | None = None,
        data: dict[str, Any] | None = None,
        response_type: type[T] | None = None,
        **kwargs: Any,
    ) -> Response | T:
        """Make a PATCH request."""
        response = await self._request_with_retry(
            "PATCH", path, json=json, data=data, **kwargs
        )

        if response_type is not None:
            return response.json()
        return response

    async def delete(
        self,
        path: str,
        *,
        response_type: type[T] | None = None,
        **kwargs: Any,
    ) -> Response | T:
        """Make a DELETE request."""
        response = await self._request_with_retry("DELETE", path, **kwargs)

        if response_type is not None:
            return response.json()
        return response

    async def aclose(self) -> None:
        """Close the SDK and release resources."""
        if self._owns_client and self._client:
            await self._client.aclose()
            self._client = None

        logger.debug("SDK closed")

    async def __aenter__(self) -> SDK:
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        await self.aclose()


# =============================================================================
# Factory Function
# =============================================================================

def create_sdk(
    base_url: str,
    *,
    auth: AuthTypes | None = None,
    headers: HeaderTypes | None = None,
    timeout: Timeout | None = None,
    max_retries: int = 3,
    jitter: JitterStrategy = JitterStrategy.FULL,
    circuit_breaker: CircuitBreakerConfig | None = None,
    **kwargs: Any,
) -> SDK:
    """
    Factory function to create an SDK instance.

    Args:
        base_url: Base URL for API requests
        auth: Authentication configuration
        headers: Default headers
        timeout: Request timeout
        max_retries: Maximum retry attempts
        jitter: Jitter strategy for backoff
        circuit_breaker: Circuit breaker config (None to use defaults)
        **kwargs: Additional SDKConfig options

    Returns:
        Configured SDK instance
    """
    config = SDKConfig(
        base_url=base_url,
        auth=auth,
        headers=headers,
        timeout=timeout or DEFAULT_TIMEOUT,
        max_retries=max_retries,
        jitter=jitter,
        circuit_breaker=circuit_breaker if circuit_breaker is not None else CircuitBreakerConfig(),
        **kwargs,
    )
    return SDK(config)


__all__ = [
    "SDK",
    "SDKConfig",
    "create_sdk",
    "JitterStrategy",
    "CircuitBreaker",
    "CircuitBreakerConfig",
    "CircuitState",
    "CircuitOpenError",
    "SAFE_METHODS",
    "IDEMPOTENT_METHODS",
]
