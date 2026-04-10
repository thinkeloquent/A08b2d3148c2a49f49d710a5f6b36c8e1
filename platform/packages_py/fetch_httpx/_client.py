"""
HTTP Client for fetch_httpx package.

Main client implementations:
- AsyncClient: Async HTTP client for use with asyncio
- Client: Sync HTTP client (wraps AsyncClient)

Feature-complete HTTP client with:
- Connection pooling
- Authentication
- Timeout configuration
- Proxy support
- Cookie handling
- Redirect following
- Event hooks
- Request/response logging
- Retry with exponential backoff + jitter
- Circuit breaker pattern
"""

from __future__ import annotations

import asyncio
import json
import random
import time
from collections.abc import Callable, Mapping
from enum import Enum
from typing import (
    TYPE_CHECKING,
    Any,
)

from . import logger as logger_module
from ._auth import build_auth
from ._config import (
    DEFAULT_LIMITS,
    DEFAULT_TIMEOUT,
    Limits,
    Proxy,
    Timeout,
)
from ._exceptions import (
    ConnectError,
    HTTPError,
    NetworkError,
    TimeoutException,
    TooManyRedirects,
    map_exception,
)
from ._models import (
    URL,
    Cookies,
    Headers,
    QueryParams,
    Request,
    Response,
    StreamingResponse,
)
from ._tls import create_ssl_context
from ._transports import AsyncHTTPTransport, MountRouter

if TYPE_CHECKING:
    from ._types import (
        AuthTypes,
        CertTypes,
        CookieTypes,
        EventHooks,
        HeaderTypes,
        ProxiesTypes,
        QueryParamTypes,
        RequestContent,
        RequestData,
        RequestFiles,
        TimeoutTypes,
        URLTypes,
        VerifyTypes,
    )

logger = logger_module.create("fetch_httpx", __file__)

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

    def __init__(
        self,
        *,
        failure_threshold: int = 5,
        success_threshold: int = 2,
        timeout: float = 30.0,
        enabled: bool = True,
    ) -> None:
        self.failure_threshold = failure_threshold
        self.success_threshold = success_threshold
        self.timeout = timeout
        self.enabled = enabled


class CircuitBreaker:
    """
    Circuit breaker implementation.

    States:
    - CLOSED: Normal operation, tracking failures
    - OPEN: Blocking requests, waiting for timeout
    - HALF_OPEN: Allowing test requests to check recovery
    """

    def __init__(self, config: CircuitBreakerConfig | None = None) -> None:
        self._config = config or CircuitBreakerConfig()
        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._success_count = 0
        self._last_failure_time: float = 0
        self._last_state_change: float = time.monotonic()

    @property
    def state(self) -> CircuitState:
        """Current circuit state."""
        return self._state

    @property
    def is_open(self) -> bool:
        """Check if circuit is open (blocking requests)."""
        return self._state == CircuitState.OPEN

    def allow_request(self) -> bool:
        """Check if a request should be allowed."""
        if not self._config.enabled:
            return True

        if self._state == CircuitState.CLOSED:
            return True

        if self._state == CircuitState.OPEN:
            elapsed = time.monotonic() - self._last_failure_time
            if elapsed >= self._config.timeout:
                self._transition_to(CircuitState.HALF_OPEN)
                return True
            return False

        return True  # HALF_OPEN

    def record_success(self) -> None:
        """Record a successful request."""
        if not self._config.enabled:
            return

        if self._state == CircuitState.HALF_OPEN:
            self._success_count += 1
            if self._success_count >= self._config.success_threshold:
                self._transition_to(CircuitState.CLOSED)
                logger.info("Circuit closed after recovery")
        elif self._state == CircuitState.CLOSED:
            self._failure_count = 0

    def record_failure(self) -> None:
        """Record a failed request."""
        if not self._config.enabled:
            return

        self._last_failure_time = time.monotonic()

        if self._state == CircuitState.HALF_OPEN:
            self._transition_to(CircuitState.OPEN)
            logger.warn("Circuit re-opened after half-open failure")
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
        self._state = state
        self._last_state_change = time.monotonic()

        if state == CircuitState.CLOSED:
            self._failure_count = 0
            self._success_count = 0
        elif state == CircuitState.HALF_OPEN:
            self._success_count = 0

    def reset(self) -> None:
        """Reset circuit breaker to initial state."""
        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._success_count = 0
        self._last_failure_time = 0


class CircuitOpenError(HTTPError):
    """Raised when circuit breaker is open and blocking requests."""

    def __init__(self, message: str = "Circuit breaker is open") -> None:
        super().__init__(message)


# =============================================================================
# Retry Configuration
# =============================================================================

class RetryConfig:
    """
    Retry configuration for AsyncClient.

    Industry-standard retry patterns:
    - Capped exponential backoff with jitter
    - Retry-After header support
    - Idempotency-aware retry

    Args:
        max_retries: Maximum retry attempts (default: 3)
        retry_delay: Initial delay in seconds (default: 0.5)
        retry_backoff: Backoff multiplier (default: 2.0)
        max_retry_delay: Maximum delay cap in seconds (default: 30.0)
        jitter: Jitter strategy (default: FULL)
        retry_on_status: HTTP status codes to retry (default: [429, 500, 502, 503, 504])
        retry_on_exception: Retry on connection/timeout errors (default: True)
        respect_retry_after_header: Honor Retry-After header (default: True)
        retry_methods: Methods to retry, None = idempotent only (default: None)
    """

    def __init__(
        self,
        *,
        max_retries: int = 3,
        retry_delay: float = 0.5,
        retry_backoff: float = 2.0,
        max_retry_delay: float = 30.0,
        jitter: JitterStrategy = JitterStrategy.FULL,
        retry_on_status: list[int] | None = None,
        retry_on_exception: bool = True,
        respect_retry_after_header: bool = True,
        retry_methods: list[str] | None = None,
    ) -> None:
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.retry_backoff = retry_backoff
        self.max_retry_delay = max_retry_delay
        self.jitter = jitter
        self.retry_on_status = retry_on_status or [429, 500, 502, 503, 504]
        self.retry_on_exception = retry_on_exception
        self.respect_retry_after_header = respect_retry_after_header
        self.retry_methods = retry_methods  # None = IDEMPOTENT_METHODS


# =============================================================================
# Async Stream Context Manager
# =============================================================================

class AsyncStreamContextManager:
    """Async context manager for streaming responses."""

    def __init__(self, client: AsyncClient, request_args: dict):
        self._client = client
        self._request_args = request_args
        self._response: StreamingResponse | None = None

    async def __aenter__(self) -> StreamingResponse:
        self._response = await self._client._stream_request(**self._request_args)
        return self._response

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        if self._response is not None:
            await self._response.aclose()


# =============================================================================
# Async Client
# =============================================================================

class AsyncClient:
    """
    Asynchronous HTTP client.

    Feature-complete HTTP client for making async HTTP requests with
    connection pooling, authentication, retry, and circuit breaker.

    Example:
        async with AsyncClient() as client:
            response = await client.get("https://api.example.com/users")
            data = response.json()

        # With retry configuration
        async with AsyncClient(
            base_url="https://api.example.com",
            retry=RetryConfig(
                max_retries=5,
                retry_delay=0.5,
                jitter=JitterStrategy.FULL,
            ),
            circuit_breaker=CircuitBreakerConfig(failure_threshold=5),
        ) as client:
            response = await client.get("/users")
    """

    def __init__(
        self,
        *,
        auth: AuthTypes | None = None,
        params: QueryParamTypes | None = None,
        headers: HeaderTypes | None = None,
        cookies: CookieTypes | None = None,
        verify: VerifyTypes = True,
        cert: CertTypes | None = None,
        http1: bool = True,
        http2: bool = False,
        proxies: ProxiesTypes | None = None,
        mounts: Mapping[str, AsyncHTTPTransport] | None = None,
        timeout: TimeoutTypes = DEFAULT_TIMEOUT,
        limits: Limits | None = None,
        max_redirects: int = 20,
        follow_redirects: bool = False,
        event_hooks: EventHooks | None = None,
        base_url: URLTypes | None = None,
        transport: AsyncHTTPTransport | None = None,
        trust_env: bool = True,
        default_encoding: str = "utf-8",
        # Retry configuration
        retry: RetryConfig | None = None,
        # Circuit breaker
        circuit_breaker: CircuitBreakerConfig | None = None,
    ) -> None:
        # Authentication
        self._auth = build_auth(auth)

        # Default parameters
        self._params = QueryParams(params)
        self._headers = Headers(headers)
        self._cookies = Cookies(cookies)

        # TLS configuration
        self._verify = verify
        self._cert = cert
        self._ssl_context = create_ssl_context(verify, cert)

        # HTTP version
        self._http1 = http1
        self._http2 = http2

        # Timeout and limits
        self._timeout = (
            timeout if isinstance(timeout, Timeout)
            else Timeout(timeout) if timeout is not None
            else DEFAULT_TIMEOUT
        )
        self._limits = limits or DEFAULT_LIMITS

        # Redirect handling
        self._max_redirects = max_redirects
        self._follow_redirects = follow_redirects

        # Event hooks
        self._event_hooks: dict[str, list[Callable]] = {
            "request": [],
            "response": [],
        }
        if event_hooks:
            for event, hooks in event_hooks.items():
                self._event_hooks[event].extend(hooks)

        # Base URL
        self._base_url = URL(base_url) if base_url else None

        # Default encoding
        self._default_encoding = default_encoding

        # Environment trust
        self._trust_env = trust_env

        # Transport
        if transport is not None:
            self._transport = transport
            self._transport_created = False
        else:
            self._transport = None
            self._transport_created = True

        # Mount router
        if mounts:
            self._mounts = MountRouter(dict(mounts))
        else:
            self._mounts = None

        # Proxies
        self._proxies = proxies

        # Retry configuration
        self._retry = retry

        # Circuit breaker
        self._circuit_breaker: CircuitBreaker | None = None
        if circuit_breaker:
            self._circuit_breaker = CircuitBreaker(circuit_breaker)

        # Track last delay for decorrelated jitter
        self._last_delay: float = retry.retry_delay if retry else 0.5

        # State
        self._closed = False

        # Log proxy configuration
        if proxies:
            logger.warn("Proxy configured", context={"proxies": self._format_proxies(proxies)})

        # Log client creation with full config
        logger.info(
            "AsyncClient created",
            context={
                "base_url": str(self._base_url) if self._base_url else None,
                "http2": http2,
                "follow_redirects": follow_redirects,
                "retry_enabled": retry is not None,
                "circuit_breaker_enabled": circuit_breaker is not None,
                "verify": verify if isinstance(verify, bool) else "custom",
                "timeout": str(self._timeout) if self._timeout else None,
                "proxy_enabled": proxies is not None,
            }
        )

    @staticmethod
    def _format_proxies(proxies: ProxiesTypes | None) -> str | dict[str, str] | None:
        """Format proxy config for logging (masks credentials)."""
        if proxies is None:
            return None
        if isinstance(proxies, str):
            return AsyncClient._mask_proxy_url(proxies)
        if isinstance(proxies, Mapping):
            return {k: AsyncClient._mask_proxy_url(str(v)) for k, v in proxies.items()}
        return str(type(proxies).__name__)

    @staticmethod
    def _mask_proxy_url(url: str) -> str:
        """Mask credentials in proxy URL for safe logging."""
        if "@" in url:
            # URL has credentials - mask them
            # Format: scheme://user:pass@host:port
            try:
                scheme_end = url.index("://") + 3
                at_pos = url.index("@")
                return f"{url[:scheme_end]}***:***{url[at_pos:]}"
            except ValueError:
                return url
        return url

    @property
    def circuit_breaker(self) -> CircuitBreaker | None:
        """Access the circuit breaker instance."""
        return self._circuit_breaker

    def _resolve_proxy(self) -> "Proxy | None":
        """Resolve proxies config to a single Proxy instance (or None)."""
        proxies = self._proxies
        if proxies is None:
            return None
        if isinstance(proxies, Proxy):
            return proxies
        if isinstance(proxies, str):
            return Proxy(proxies)
        if isinstance(proxies, dict):
            # Prefer "https://" key, then "all://", then first value
            for key in ("https://", "all://"):
                val = proxies.get(key)
                if val is not None:
                    return val if isinstance(val, Proxy) else Proxy(val)
            # Fallback to first non-None value
            for val in proxies.values():
                if val is not None:
                    return val if isinstance(val, Proxy) else Proxy(val)
        return None

    async def _ensure_transport(self) -> AsyncHTTPTransport:
        """Lazily create the transport."""
        if self._transport is None:
            proxy = self._resolve_proxy()
            self._transport = AsyncHTTPTransport(
                verify=self._verify,
                cert=self._cert,
                http1=self._http1,
                http2=self._http2,
                limits=self._limits,
                timeout=self._timeout,
                proxy=proxy,
            )
        return self._transport

    def _merge_url(self, url: URLTypes) -> URL:
        """Merge URL with base URL."""
        try:
            request_url = URL(url) if not isinstance(url, URL) else url
        except Exception as e:
            logger.error(
                "URL construction failed in _merge_url",
                context={
                    "url_type": type(url).__name__,
                    "url_repr": repr(url)[:200] if url else "None",
                    "error": str(e),
                    "error_type": type(e).__name__,
                },
            )
            raise

        if self._base_url:
            try:
                return self._base_url.join(request_url)
            except Exception as e:
                logger.error(
                    "URL join failed in _merge_url",
                    context={
                        "base_url": str(self._base_url),
                        "request_url": str(request_url),
                        "error": str(e),
                        "error_type": type(e).__name__,
                    },
                )
                raise
        return request_url

    def _merge_headers(
        self, headers: HeaderTypes | None = None
    ) -> Headers:
        """Merge headers with defaults."""
        merged = self._headers.copy()
        if headers:
            for key, value in Headers(headers).items():
                merged.set(key, value)
        return merged

    def _merge_params(
        self, params: QueryParamTypes | None = None
    ) -> str | None:
        """Merge query params with defaults."""
        if not self._params and not params:
            return None

        merged = list(self._params.items())
        if params:
            merged.extend(QueryParams(params).items())

        return QueryParams(merged).__str__() if merged else None

    def _should_retry_method(self, method: str, headers: Headers | None = None) -> bool:
        """Check if method should be retried based on idempotency."""
        if not self._retry:
            return False

        method_upper = method.upper()

        # If explicit retry_methods configured, use that
        if self._retry.retry_methods is not None:
            return method_upper in [m.upper() for m in self._retry.retry_methods]

        # Default: retry idempotent methods
        if method_upper in IDEMPOTENT_METHODS:
            return True

        # POST/PATCH with Idempotency-Key header is safe to retry
        if headers:
            idempotency_key = (
                headers.get("Idempotency-Key")
                or headers.get("X-Idempotency-Key")
            )
            if idempotency_key:
                return True

        return False

    def _calculate_delay(self, attempt: int) -> float:
        """Calculate retry delay with jitter."""
        if not self._retry:
            return 0

        # Calculate exponential delay
        calculated = self._retry.retry_delay * (self._retry.retry_backoff ** attempt)

        # Apply cap
        capped = min(calculated, self._retry.max_retry_delay)

        # Apply jitter strategy
        jitter = self._retry.jitter

        if jitter == JitterStrategy.NONE:
            delay = capped
        elif jitter == JitterStrategy.FULL:
            delay = random.uniform(0, capped)
        elif jitter == JitterStrategy.EQUAL:
            delay = (capped / 2) + random.uniform(0, capped / 2)
        elif jitter == JitterStrategy.DECORRELATED:
            delay = random.uniform(self._retry.retry_delay, self._last_delay * 3)
            delay = min(delay, self._retry.max_retry_delay)
            self._last_delay = delay
        else:
            delay = capped

        return delay

    def _parse_retry_after(self, response: Response) -> float | None:
        """Parse Retry-After header from response."""
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
            from datetime import UTC, datetime
            from email.utils import parsedate_to_datetime

            retry_date = parsedate_to_datetime(retry_after)
            now = datetime.now(UTC)
            delta = (retry_date - now).total_seconds()
            return max(0, delta)
        except (ValueError, TypeError):
            pass

        return None

    def _is_retryable_exception(self, exc: Exception) -> bool:
        """Check if exception is retryable (connection/timeout errors)."""
        return isinstance(exc, ConnectError | TimeoutException | NetworkError)

    async def _build_request(
        self,
        method: str,
        url: URLTypes,
        *,
        content: RequestContent | None = None,
        data: RequestData | None = None,
        files: RequestFiles | None = None,
        json_data: Any | None = None,
        params: QueryParamTypes | None = None,
        headers: HeaderTypes | None = None,
        cookies: CookieTypes | None = None,
        timeout: TimeoutTypes | None = None,
    ) -> tuple[Request, Timeout | None]:
        """Build a Request object."""
        try:
            return await self._build_request_inner(
                method, url, content=content, data=data, files=files,
                json_data=json_data, params=params, headers=headers,
                cookies=cookies, timeout=timeout,
            )
        except Exception as e:
            logger.error(
                "Request build failed",
                context={
                    "method": method,
                    "url_type": type(url).__name__,
                    "url_repr": repr(url)[:200] if url else "None",
                    "error": str(e),
                    "error_type": type(e).__name__,
                },
            )
            raise

    async def _build_request_inner(
        self,
        method: str,
        url: URLTypes,
        *,
        content: RequestContent | None = None,
        data: RequestData | None = None,
        files: RequestFiles | None = None,
        json_data: Any | None = None,
        params: QueryParamTypes | None = None,
        headers: HeaderTypes | None = None,
        cookies: CookieTypes | None = None,
        timeout: TimeoutTypes | None = None,
    ) -> tuple[Request, Timeout | None]:
        """Internal: Build a Request object."""
        # URL
        merged_url = self._merge_url(url)

        # Query params
        extra_query = self._merge_params(params)
        if extra_query:
            current_query = merged_url.query
            if current_query:
                new_query = f"{current_query}&{extra_query}"
            else:
                new_query = extra_query
            merged_url = merged_url.copy_with(query=new_query)

        # Headers
        merged_headers = self._merge_headers(headers)

        # Body content
        body_content: bytes | None = None

        if json_data is not None:
            body_content = json.dumps(json_data).encode("utf-8")
            if "content-type" not in merged_headers:
                merged_headers.set("Content-Type", "application/json")
        elif data is not None:
            # Form-encode data
            from urllib.parse import urlencode
            body_content = urlencode(data).encode("utf-8")
            if "content-type" not in merged_headers:
                merged_headers.set(
                    "Content-Type", "application/x-www-form-urlencoded"
                )
        elif content is not None:
            if isinstance(content, str):
                body_content = content.encode("utf-8")
            elif isinstance(content, bytes):
                body_content = content

        # Cookies
        if cookies:
            cookie_header = "; ".join(
                f"{k}={v}" for k, v in Cookies(cookies).items()
            )
            existing = merged_headers.get("Cookie", "")
            if existing:
                merged_headers.set("Cookie", f"{existing}; {cookie_header}")
            else:
                merged_headers.set("Cookie", cookie_header)

        # Default headers
        if "user-agent" not in merged_headers:
            merged_headers.set("User-Agent", "fetch-httpx/1.0.0")
        if "accept" not in merged_headers:
            merged_headers.set("Accept", "*/*")

        request = Request(
            method=method,
            url=merged_url,
            headers=merged_headers,
            content=body_content,
        )

        # Request timeout
        req_timeout: Timeout | None = None
        if timeout is not None:
            if isinstance(timeout, Timeout):
                req_timeout = timeout
            else:
                req_timeout = Timeout(timeout)
        elif self._timeout:
            req_timeout = self._timeout

        return request, req_timeout

    async def _send_single_request(self, request: Request) -> Response:
        """Send a single request without retry logic."""
        # Call request hooks
        for hook in self._event_hooks.get("request", []):
            await self._call_hook(hook, request)

        # Get appropriate transport
        if self._mounts:
            transport = self._mounts.get_transport(request.url)
            if transport is None:
                transport = await self._ensure_transport()
        else:
            transport = await self._ensure_transport()

        # Apply auth
        if self._auth:
            if hasattr(self._auth, "auth_flow"):
                flow = self._auth.auth_flow(request)
                try:
                    request = next(flow)
                except StopIteration:
                    pass
            else:
                request = self._auth(request)

        logger.info(
            "Sending request",
            context={
                "method": request.method,
                "url": str(request.url),
            }
        )

        _SENSITIVE_HEADERS = {"authorization", "x-api-key", "proxy-authorization", "cookie"}
        import json as _json
        print("[fetch-httpx] outbound request", _json.dumps({
            "method": request.method,
            "url": str(request.url),
            "headers": {
                k: "*******" if k.lower() in _SENSITIVE_HEADERS else v
                for k, v in request.headers.items()
            },
            "proxy": self._format_proxies(self._proxies) if self._proxies else None,
            "verify": str(self._verify),
            "cert": str(self._cert),
            "body_length": len(request.content) if request.content else 0,
        }, indent=2, default=str))

        try:
            response = await transport.handle_async_request(request)
        except HTTPError:
            raise  # Already mapped by transport layer, just re-raise
        except Exception as e:
            logger.error(
                "Request failed",
                context={
                    "error": str(e),
                    "error_type": type(e).__name__,
                    "url": str(request.url),
                    "method": request.method,
                }
            )
            raise map_exception(e, request=request) from e

        # Set request on response
        response.request = request

        # Call response hooks
        for hook in self._event_hooks.get("response", []):
            await self._call_hook(hook, response)

        logger.info(
            "Response received",
            context={
                "status_code": response.status_code,
                "url": str(request.url),
            }
        )

        return response

    async def _send_request(self, request: Request) -> Response:
        """Send a request with retry logic if configured."""
        # No retry config - send directly
        if not self._retry:
            return await self._send_single_request(request)

        # Check circuit breaker
        if self._circuit_breaker and not self._circuit_breaker.allow_request():
            raise CircuitOpenError(
                f"Circuit breaker is open, request to {request.url} blocked"
            )

        # Check if method is safe to retry
        can_retry = self._should_retry_method(request.method, request.headers)

        last_error: Exception | None = None
        self._last_delay = self._retry.retry_delay

        for attempt in range(self._retry.max_retries + 1):
            try:
                response = await self._send_single_request(request)

                # Check if we should retry based on status
                should_retry_status = (
                    response.status_code in self._retry.retry_on_status
                    and attempt < self._retry.max_retries
                    and can_retry
                )

                if should_retry_status:
                    delay = self._calculate_delay(attempt)

                    # Check Retry-After header
                    if self._retry.respect_retry_after_header:
                        retry_after = self._parse_retry_after(response)
                        if retry_after is not None:
                            delay = min(retry_after, self._retry.max_retry_delay)
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
                            "method": request.method,
                        }
                    )

                    if self._circuit_breaker:
                        self._circuit_breaker.record_failure()

                    await asyncio.sleep(delay)
                    continue

                # Success
                if self._circuit_breaker and response.is_success:
                    self._circuit_breaker.record_success()

                return response

            except CircuitOpenError:
                raise

            except Exception as e:
                last_error = e

                if self._circuit_breaker:
                    self._circuit_breaker.record_failure()

                # Only retry on retryable exceptions and if method is idempotent
                is_retryable = (
                    self._retry.retry_on_exception
                    and self._is_retryable_exception(e)
                    and can_retry
                )

                if not is_retryable:
                    raise

                if attempt < self._retry.max_retries:
                    delay = self._calculate_delay(attempt)

                    logger.warn(
                        "Request failed, retrying",
                        context={
                            "error": str(e),
                            "attempt": attempt + 1,
                            "delay": round(delay, 3),
                            "method": request.method,
                        }
                    )
                    await asyncio.sleep(delay)
                else:
                    raise

        if last_error:
            raise last_error
        raise HTTPError("Unexpected error in retry loop")

    async def _call_hook(
        self, hook: Callable, arg: Any
    ) -> None:
        """Call an event hook (sync or async)."""
        result = hook(arg)
        if asyncio.iscoroutine(result):
            await result

    async def _handle_redirects(
        self,
        request: Request,
        response: Response,
        history: list[Response],
    ) -> Response:
        """Handle redirect responses."""
        while response.is_redirect and len(history) < self._max_redirects:
            location = response.headers.get("Location")
            if not location:
                break

            redirect_url = request.url.join(location)

            method = request.method
            if response.status_code in (301, 302, 303):
                method = "GET"

            history.append(response)

            logger.debug(
                "Following redirect",
                context={
                    "from": str(request.url),
                    "to": str(redirect_url),
                    "status": response.status_code,
                }
            )

            redirect_request = Request(
                method=method,
                url=redirect_url,
                headers=request.headers,
            )

            response = await self._send_request(redirect_request)
            response.history = history
            request = redirect_request

        if response.is_redirect and len(history) >= self._max_redirects:
            raise TooManyRedirects(
                f"Maximum redirects ({self._max_redirects}) exceeded"
            )

        return response

    async def request(
        self,
        method: str,
        url: URLTypes,
        *,
        content: RequestContent | None = None,
        data: RequestData | None = None,
        files: RequestFiles | None = None,
        json: Any | None = None,
        params: QueryParamTypes | None = None,
        headers: HeaderTypes | None = None,
        cookies: CookieTypes | None = None,
        auth: AuthTypes | None = None,
        follow_redirects: bool | None = None,
        timeout: TimeoutTypes | None = None,
    ) -> Response:
        """
        Send an HTTP request.

        Args:
            method: HTTP method (GET, POST, PUT, DELETE, etc.)
            url: Request URL
            content: Raw request body
            data: Form data (dict or list of tuples)
            files: Files to upload
            json: JSON data to send
            params: Query parameters
            headers: Request headers
            cookies: Request cookies
            auth: Authentication (overrides client auth)
            follow_redirects: Follow redirects (overrides client setting)
            timeout: Request timeout (overrides client timeout)

        Returns:
            Response object
        """
        request, req_timeout = await self._build_request(
            method,
            url,
            content=content,
            data=data,
            files=files,
            json_data=json,
            params=params,
            headers=headers,
            cookies=cookies,
            timeout=timeout,
        )

        # Override auth if provided
        if auth is not None:
            request_auth = build_auth(auth)
            if request_auth:
                request = request_auth(request)

        response = await self._send_request(request)

        # Handle redirects
        should_follow = (
            follow_redirects if follow_redirects is not None
            else self._follow_redirects
        )
        if should_follow and response.is_redirect:
            response = await self._handle_redirects(request, response, [])

        return response

    async def _stream_request(
        self,
        method: str,
        url: URLTypes,
        *,
        content: RequestContent | None = None,
        data: RequestData | None = None,
        files: RequestFiles | None = None,
        json: Any | None = None,
        params: QueryParamTypes | None = None,
        headers: HeaderTypes | None = None,
        cookies: CookieTypes | None = None,
        auth: AuthTypes | None = None,
        follow_redirects: bool | None = None,
        timeout: TimeoutTypes | None = None,
    ) -> StreamingResponse:
        """
        Send an HTTP request and return a streaming response.

        Unlike request(), this method returns a StreamingResponse that allows
        iterating over the response body without loading it into memory.
        """
        request, req_timeout = await self._build_request(
            method,
            url,
            content=content,
            data=data,
            files=files,
            json_data=json,
            params=params,
            headers=headers,
            cookies=cookies,
            timeout=timeout,
        )

        # Override auth if provided
        if auth is not None:
            request_auth = build_auth(auth)
            if request_auth:
                request = request_auth(request)

        # Get transport (streaming doesn't use retry/circuit breaker)
        transport = await self._ensure_transport()

        # Apply auth
        if self._auth:
            if hasattr(self._auth, "auth_flow"):
                flow = self._auth.auth_flow(request)
                try:
                    request = next(flow)
                except StopIteration:
                    pass
            else:
                request = self._auth(request)

        logger.info(
            "Sending stream request",
            context={
                "method": request.method,
                "url": str(request.url),
            }
        )

        # Use streaming transport method
        response = await transport.handle_async_stream(request)

        return response

    def stream(
        self,
        method: str,
        url: URLTypes,
        *,
        content: RequestContent | None = None,
        data: RequestData | None = None,
        files: RequestFiles | None = None,
        json: Any | None = None,
        params: QueryParamTypes | None = None,
        headers: HeaderTypes | None = None,
        cookies: CookieTypes | None = None,
        auth: AuthTypes | None = None,
        follow_redirects: bool | None = None,
        timeout: TimeoutTypes | None = None,
    ) -> AsyncStreamContextManager:
        """
        Send a streaming HTTP request.

        Returns an async context manager that yields a Response object
        suitable for streaming iteration.

        Example:
            async with client.stream("GET", url) as response:
                async for line in response.aiter_lines():
                    print(line)
        """
        return AsyncStreamContextManager(
            self,
            {
                "method": method,
                "url": url,
                "content": content,
                "data": data,
                "files": files,
                "json": json,
                "params": params,
                "headers": headers,
                "cookies": cookies,
                "auth": auth,
                "follow_redirects": follow_redirects,
                "timeout": timeout,
            }
        )

    # Convenience methods
    async def get(
        self,
        url: URLTypes,
        *,
        params: QueryParamTypes | None = None,
        headers: HeaderTypes | None = None,
        cookies: CookieTypes | None = None,
        auth: AuthTypes | None = None,
        follow_redirects: bool | None = None,
        timeout: TimeoutTypes | None = None,
    ) -> Response:
        """Send a GET request."""
        return await self.request(
            "GET",
            url,
            params=params,
            headers=headers,
            cookies=cookies,
            auth=auth,
            follow_redirects=follow_redirects,
            timeout=timeout,
        )

    async def post(
        self,
        url: URLTypes,
        *,
        content: RequestContent | None = None,
        data: RequestData | None = None,
        files: RequestFiles | None = None,
        json: Any | None = None,
        params: QueryParamTypes | None = None,
        headers: HeaderTypes | None = None,
        cookies: CookieTypes | None = None,
        auth: AuthTypes | None = None,
        follow_redirects: bool | None = None,
        timeout: TimeoutTypes | None = None,
    ) -> Response:
        """Send a POST request."""
        return await self.request(
            "POST",
            url,
            content=content,
            data=data,
            files=files,
            json=json,
            params=params,
            headers=headers,
            cookies=cookies,
            auth=auth,
            follow_redirects=follow_redirects,
            timeout=timeout,
        )

    async def put(
        self,
        url: URLTypes,
        *,
        content: RequestContent | None = None,
        data: RequestData | None = None,
        files: RequestFiles | None = None,
        json: Any | None = None,
        params: QueryParamTypes | None = None,
        headers: HeaderTypes | None = None,
        cookies: CookieTypes | None = None,
        auth: AuthTypes | None = None,
        follow_redirects: bool | None = None,
        timeout: TimeoutTypes | None = None,
    ) -> Response:
        """Send a PUT request."""
        return await self.request(
            "PUT",
            url,
            content=content,
            data=data,
            files=files,
            json=json,
            params=params,
            headers=headers,
            cookies=cookies,
            auth=auth,
            follow_redirects=follow_redirects,
            timeout=timeout,
        )

    async def patch(
        self,
        url: URLTypes,
        *,
        content: RequestContent | None = None,
        data: RequestData | None = None,
        files: RequestFiles | None = None,
        json: Any | None = None,
        params: QueryParamTypes | None = None,
        headers: HeaderTypes | None = None,
        cookies: CookieTypes | None = None,
        auth: AuthTypes | None = None,
        follow_redirects: bool | None = None,
        timeout: TimeoutTypes | None = None,
    ) -> Response:
        """Send a PATCH request."""
        return await self.request(
            "PATCH",
            url,
            content=content,
            data=data,
            files=files,
            json=json,
            params=params,
            headers=headers,
            cookies=cookies,
            auth=auth,
            follow_redirects=follow_redirects,
            timeout=timeout,
        )

    async def delete(
        self,
        url: URLTypes,
        *,
        params: QueryParamTypes | None = None,
        headers: HeaderTypes | None = None,
        cookies: CookieTypes | None = None,
        auth: AuthTypes | None = None,
        follow_redirects: bool | None = None,
        timeout: TimeoutTypes | None = None,
    ) -> Response:
        """Send a DELETE request."""
        return await self.request(
            "DELETE",
            url,
            params=params,
            headers=headers,
            cookies=cookies,
            auth=auth,
            follow_redirects=follow_redirects,
            timeout=timeout,
        )

    async def head(
        self,
        url: URLTypes,
        *,
        params: QueryParamTypes | None = None,
        headers: HeaderTypes | None = None,
        cookies: CookieTypes | None = None,
        auth: AuthTypes | None = None,
        follow_redirects: bool | None = None,
        timeout: TimeoutTypes | None = None,
    ) -> Response:
        """Send a HEAD request."""
        return await self.request(
            "HEAD",
            url,
            params=params,
            headers=headers,
            cookies=cookies,
            auth=auth,
            follow_redirects=follow_redirects,
            timeout=timeout,
        )

    async def options(
        self,
        url: URLTypes,
        *,
        params: QueryParamTypes | None = None,
        headers: HeaderTypes | None = None,
        cookies: CookieTypes | None = None,
        auth: AuthTypes | None = None,
        follow_redirects: bool | None = None,
        timeout: TimeoutTypes | None = None,
    ) -> Response:
        """Send an OPTIONS request."""
        return await self.request(
            "OPTIONS",
            url,
            params=params,
            headers=headers,
            cookies=cookies,
            auth=auth,
            follow_redirects=follow_redirects,
            timeout=timeout,
        )

    async def aclose(self) -> None:
        """Close the client and release resources."""
        if self._closed:
            return

        self._closed = True

        if self._transport_created and self._transport:
            await self._transport.aclose()

        if self._mounts:
            await self._mounts.aclose_all()

        logger.debug("AsyncClient closed")

    async def __aenter__(self) -> AsyncClient:
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        await self.aclose()


# =============================================================================
# Sync Client
# =============================================================================

class Client:
    """
    Synchronous HTTP client.

    Wraps AsyncClient for synchronous usage.

    Example:
        with Client() as client:
            response = client.get("https://api.example.com/users")
            data = response.json()
    """

    def __init__(self, **kwargs: Any) -> None:
        self._async_client = AsyncClient(**kwargs)
        self._loop: asyncio.AbstractEventLoop | None = None

    def _get_loop(self) -> asyncio.AbstractEventLoop:
        """Get or create an event loop for synchronous execution.

        Always creates a new loop — reusing a running loop would make
        ``run_until_complete`` impossible (cannot nest event loops).
        """
        if self._loop is None or self._loop.is_closed():
            self._loop = asyncio.new_event_loop()
        return self._loop

    def _run(self, coro):
        """Run a coroutine synchronously."""
        loop = self._get_loop()
        return loop.run_until_complete(coro)

    @property
    def circuit_breaker(self) -> CircuitBreaker | None:
        """Access the circuit breaker instance."""
        return self._async_client.circuit_breaker

    def request(self, method: str, url: URLTypes, **kwargs: Any) -> Response:
        """Send an HTTP request."""
        return self._run(self._async_client.request(method, url, **kwargs))

    def get(self, url: URLTypes, **kwargs: Any) -> Response:
        """Send a GET request."""
        return self._run(self._async_client.get(url, **kwargs))

    def post(self, url: URLTypes, **kwargs: Any) -> Response:
        """Send a POST request."""
        return self._run(self._async_client.post(url, **kwargs))

    def put(self, url: URLTypes, **kwargs: Any) -> Response:
        """Send a PUT request."""
        return self._run(self._async_client.put(url, **kwargs))

    def patch(self, url: URLTypes, **kwargs: Any) -> Response:
        """Send a PATCH request."""
        return self._run(self._async_client.patch(url, **kwargs))

    def delete(self, url: URLTypes, **kwargs: Any) -> Response:
        """Send a DELETE request."""
        return self._run(self._async_client.delete(url, **kwargs))

    def head(self, url: URLTypes, **kwargs: Any) -> Response:
        """Send a HEAD request."""
        return self._run(self._async_client.head(url, **kwargs))

    def options(self, url: URLTypes, **kwargs: Any) -> Response:
        """Send an OPTIONS request."""
        return self._run(self._async_client.options(url, **kwargs))

    def close(self) -> None:
        """Close the client."""
        self._run(self._async_client.aclose())
        if self._loop and not self._loop.is_closed():
            self._loop.close()

    def __enter__(self) -> Client:
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.close()


__all__ = [
    "AsyncClient",
    "Client",
    "RetryConfig",
    "JitterStrategy",
    "CircuitBreaker",
    "CircuitBreakerConfig",
    "CircuitState",
    "CircuitOpenError",
    "SAFE_METHODS",
    "IDEMPOTENT_METHODS",
]
