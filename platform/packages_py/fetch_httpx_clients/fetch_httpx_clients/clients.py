"""Pre-configured httpx client factories for LLM API calls."""

from __future__ import annotations

import logging
from collections.abc import Callable, Mapping
from typing import Any

from can_use_http2 import Http2CheckResult
from fetch_httpx import (
    AsyncClient,
    Client,
    Limits,
    RetryConfig,
    Timeout,
)
from fetch_httpx._transports import AsyncHTTPTransport

logger = logging.getLogger("fetch_httpx_clients")

# Type aliases matching fetch_httpx conventions
HeaderTypes = Mapping[str, str] | list[tuple[str, str]] | None
EventHook = Callable[..., Any]
EventHooks = dict[str, list[EventHook]]
URLTypes = str | bytes
VerifyTypes = bool | str
TimeoutTypes = float | None | Timeout

# LLM-tuned default: generous read timeout for slow model responses
DEFAULT_LLM_TIMEOUT = Timeout(connect=5.0, read=120.0, write=30.0, pool=5.0)


def _resolve_http2(http2: Http2CheckResult | bool | None) -> bool:
    """Resolve the http2 parameter to a boolean.

    Accepts:
        - ``Http2CheckResult``: uses its ``.ok`` property
        - ``bool``: passed through directly
        - ``None``: defaults to ``False``
    """
    if http2 is None:
        return False
    if isinstance(http2, bool):
        return http2
    if not http2.ok:
        logger.warning(
            "HTTP/2 preflight failed, falling back to HTTP/1.1: %s",
            "; ".join(http2.errors),
        )
    return http2.ok


def fetch_httpx_async(
    *,
    base_url: URLTypes | None = None,
    headers: HeaderTypes = None,
    timeout: TimeoutTypes = DEFAULT_LLM_TIMEOUT,
    limits: Limits | None = None,
    http2: Http2CheckResult | bool | None = None,
    retry: RetryConfig | None = None,
    verify: VerifyTypes = True,
    trust_env: bool = True,
    mounts: Mapping[str, AsyncHTTPTransport] | None = None,
    follow_redirects: bool = True,
    max_redirects: int = 20,
    event_hooks: EventHooks | None = None,
) -> AsyncClient:
    """Create an async HTTP client configured for LLM API calls.

    Args:
        base_url: Base URL prepended to all request paths.
        headers: Default headers sent with every request (e.g. Authorization).
        timeout: Request timeout. Defaults are tuned for LLM endpoints
            (5 s connect, 120 s read, 30 s write, 5 s pool).
        limits: Connection pool limits.
        http2: ``Http2CheckResult`` from ``can_use_http2.check()``, a plain
            ``bool``, or ``None`` (defaults to HTTP/1.1).
        retry: Retry configuration (``RetryConfig``).
        verify: TLS verification (bool or CA bundle path).
        trust_env: Honour ``HTTP_PROXY`` / ``HTTPS_PROXY`` env vars.
        mounts: URL-pattern transport overrides.
        follow_redirects: Follow 3xx redirects.
        max_redirects: Maximum number of redirects to follow.
        event_hooks: ``{"request": [...], "response": [...]}`` callbacks.

    Returns:
        A configured ``AsyncClient`` ready for use as a context manager.

    Example::

        from can_use_http2 import check
        from fetch_httpx_clients import fetch_httpx_async

        h2 = check("https://api.openai.com")

        async with fetch_httpx_async(
            base_url="https://api.openai.com/v1",
            headers={"Authorization": "Bearer sk-..."},
            http2=h2,
        ) as client:
            resp = await client.post("/chat/completions", json={...})
    """
    use_http2 = _resolve_http2(http2)

    return AsyncClient(
        base_url=base_url,
        headers=headers,
        timeout=timeout,
        limits=limits,
        http2=use_http2,
        http1=True,
        retry=retry,
        verify=verify,
        trust_env=trust_env,
        mounts=mounts,
        follow_redirects=follow_redirects,
        max_redirects=max_redirects,
        event_hooks=event_hooks,
    )


def fetch_httpx_sync(
    *,
    base_url: URLTypes | None = None,
    headers: HeaderTypes = None,
    timeout: TimeoutTypes = DEFAULT_LLM_TIMEOUT,
    limits: Limits | None = None,
    http2: Http2CheckResult | bool | None = None,
    retry: RetryConfig | None = None,
    verify: VerifyTypes = True,
    trust_env: bool = True,
    mounts: Mapping[str, AsyncHTTPTransport] | None = None,
    follow_redirects: bool = True,
    max_redirects: int = 20,
    event_hooks: EventHooks | None = None,
) -> Client:
    """Create a synchronous HTTP client configured for LLM API calls.

    Same parameters as :func:`fetch_httpx_async` but returns a ``Client``
    that blocks on each call instead of returning coroutines.

    Example::

        from fetch_httpx_clients import fetch_httpx_sync

        with fetch_httpx_sync(
            base_url="https://api.anthropic.com/v1",
            headers={
                "x-api-key": "sk-ant-...",
                "anthropic-version": "2023-06-01",
            },
        ) as client:
            resp = client.post("/messages", json={...})
    """
    use_http2 = _resolve_http2(http2)

    return Client(
        base_url=base_url,
        headers=headers,
        timeout=timeout,
        limits=limits,
        http2=use_http2,
        http1=True,
        retry=retry,
        verify=verify,
        trust_env=trust_env,
        mounts=mounts,
        follow_redirects=follow_redirects,
        max_redirects=max_redirects,
        event_hooks=event_hooks,
    )
