"""
Pre-configured Gemini API Transport Layer Constants for httpx.

This module provides optimized httpx client configuration for Gemini API
with settings derived from the operational characteristics of LLM workloads.

Key Configuration Rationale:
- connect_timeout: 10.0s - Fast fail on network partition/outage
- read_timeout: None - DISABLED for chat/completions (thinking models pause 120s+)
- write_timeout: 10.0s - Sending prompt payload should be fast
- HTTP/2: Enabled with automatic HTTP/1.1 fallback for firewall resilience
- max_connections: 100 - High ceiling for concurrent requests
- keepalive_expiry: 60.0s - Aligns with chat interface typing pauses

Example:
    from fetch_httpx_gemini_openai_constant import (
        get_gemini_client,
        get_async_gemini_client,
        GEMINI_TIMEOUT_CONFIG,
        GEMINI_LIMITS_CONFIG,
    )

    # Use singleton client with pre-configured settings
    client = get_gemini_client()
    response = client.post(
        GEMINI_CHAT_COMPLETIONS_PATH,
        json={"model": "gemini-2.0-flash-thinking-exp", "messages": [...]}
    )

    # Async client
    async_client = get_async_gemini_client()
    response = await async_client.post(...)
"""

from __future__ import annotations

import os
from typing import Any, TypedDict

import httpx
from env_resolver import resolve_gemini_env

_gemini_env = resolve_gemini_env()

__version__ = "1.0.0"

# =============================================================================
# TRANSPORT LAYER CONSTANTS
# =============================================================================

GEMINI_ORIGIN: str = "https://generativelanguage.googleapis.com"
"""
Gemini API base endpoint.
Using a client with base_url set to this origin ensures connection reuse.
"""

GEMINI_CHAT_COMPLETIONS_PATH: str = "/v1beta/openai/chat/completions"
"""OpenAI-compatible chat completions endpoint path."""

# =============================================================================
# TIMEOUT CONSTANTS
# =============================================================================

GEMINI_CONNECT_TIMEOUT_S: float = 10.0
"""
Connect timeout in seconds (10 seconds).
If the server cannot be reached in 10 seconds, it indicates a network
partition or outage. Failing fast here is appropriate.
"""

GEMINI_READ_TIMEOUT_S: float = 60.0
"""
Standard read timeout in seconds (60 seconds).
Suitable for streaming responses where data flows continuously.
Use this for regular chat completions and streaming endpoints.
"""

GEMINI_READ_TIMEOUT_THINKING_S: float | None = None
"""
Thinking model read timeout in seconds (DISABLED / None).
CRITICAL: Because thinking models may "think" for 120+ seconds without sending bytes,
enforcing a read timeout is dangerous. The application should instead rely
on application-level cancellation or keep-alive checks.

This is the most common cause of failure in Python AI clients (ReadTimeout).
For "Thinking" models, Time to First Token (TTFT) can be exceptionally long.
Use this for thinking models like gemini-2.0-flash-thinking-exp.
"""

GEMINI_WRITE_TIMEOUT_S: float = 10.0
"""
Write timeout in seconds (10 seconds).
Sending the prompt payload should be fast.
"""

GEMINI_POOL_TIMEOUT_S: float | None = None
"""
Pool timeout in seconds (DISABLED / None).
Time to wait for a connection from the pool.
"""

# =============================================================================
# CONNECTION POOL CONSTANTS
# =============================================================================

GEMINI_MAX_CONNECTIONS: int = 100
"""
Maximum concurrent connections.
High-throughput AI applications require a higher ceiling (100) to prevent
local bottlenecks before upstream rate limits are reached.
"""

GEMINI_MAX_KEEPALIVE_CONNECTIONS: int = 50
"""
Maximum keep-alive connections to maintain.
Balanced for typical LLM workload concurrency patterns.
"""

GEMINI_KEEPALIVE_EXPIRY_S: float = 60.0
"""
Keep-alive expiry in seconds (60 seconds).
Aligns with typical cadence of user interaction in chat interfaces.
Shorter timeouts cause frequent reconnections during user typing pauses.
"""

# =============================================================================
# HTTP/2 CONFIGURATION
# =============================================================================

GEMINI_HTTP2_ENABLED: bool = True
"""
HTTP/2 protocol support flag.
HTTP/2 improves multiplexing and reduces latency.

Implementation Note: The client should handle http2.RemoteProtocolError
and implement fallback to HTTP/1.1 if HTTP/2 connection fails during
the handshake (e.g., due to corporate firewalls stripping ALPN headers).
"""

# =============================================================================
# CONFIGURATION TYPED DICTS
# =============================================================================


class GeminiTimeoutConfig(TypedDict, total=False):
    """Timeout configuration for Gemini API requests."""

    connect: float | None
    read: float | None
    write: float | None
    pool: float | None


class GeminiLimitsConfig(TypedDict, total=False):
    """Connection limits configuration for Gemini API client."""

    max_connections: int
    max_keepalive_connections: int
    keepalive_expiry: float


class GeminiClientConfig(TypedDict, total=False):
    """Complete Gemini client configuration."""

    api_key: str
    timeout: GeminiTimeoutConfig
    limits: GeminiLimitsConfig
    http2: bool


# =============================================================================
# PRE-CONFIGURED OBJECTS
# =============================================================================

GEMINI_TIMEOUT_CONFIG: GeminiTimeoutConfig = {
    "connect": GEMINI_CONNECT_TIMEOUT_S,
    "read": GEMINI_READ_TIMEOUT_S,
    "write": GEMINI_WRITE_TIMEOUT_S,
    "pool": GEMINI_POOL_TIMEOUT_S,
}
"""
Pre-configured timeout settings for Gemini API.

Use this with httpx.Timeout:
    timeout = httpx.Timeout(**GEMINI_TIMEOUT_CONFIG)
"""

GEMINI_LIMITS_CONFIG: GeminiLimitsConfig = {
    "max_connections": GEMINI_MAX_CONNECTIONS,
    "max_keepalive_connections": GEMINI_MAX_KEEPALIVE_CONNECTIONS,
    "keepalive_expiry": GEMINI_KEEPALIVE_EXPIRY_S,
}
"""
Pre-configured connection limits for Gemini API.

Use this with httpx.Limits:
    limits = httpx.Limits(**GEMINI_LIMITS_CONFIG)
"""


def create_gemini_timeout() -> httpx.Timeout:
    """
    Create httpx.Timeout with pre-configured Gemini settings.

    Returns:
        httpx.Timeout configured for LLM workloads:
        - connect: 10.0s (fast fail on network issues)
        - read: None (disabled for thinking models)
        - write: 10.0s (prompt sending should be fast)
        - pool: None (disabled)
    """
    return httpx.Timeout(
        connect=GEMINI_CONNECT_TIMEOUT_S,
        read=GEMINI_READ_TIMEOUT_S,
        write=GEMINI_WRITE_TIMEOUT_S,
        pool=GEMINI_POOL_TIMEOUT_S,
    )


def create_gemini_limits() -> httpx.Limits:
    """
    Create httpx.Limits with pre-configured Gemini settings.

    Returns:
        httpx.Limits configured for high-throughput LLM workloads:
        - max_connections: 100
        - max_keepalive_connections: 50
        - keepalive_expiry: 60.0s
    """
    return httpx.Limits(
        max_connections=GEMINI_MAX_CONNECTIONS,
        max_keepalive_connections=GEMINI_MAX_KEEPALIVE_CONNECTIONS,
        keepalive_expiry=GEMINI_KEEPALIVE_EXPIRY_S,
    )


# =============================================================================
# SINGLETON CLIENTS
# =============================================================================

_sync_singleton: httpx.Client | None = None
_async_singleton: httpx.AsyncClient | None = None


def get_gemini_client(
    api_key: str | None = None,
    origin: str = GEMINI_ORIGIN,
) -> httpx.Client:
    """
    Get or create the singleton sync httpx client with pre-configured Gemini settings.

    The client is configured with optimized settings for LLM workloads:
    - Connect timeout: 10s (fast fail on network issues)
    - Read timeout: None (disabled for thinking models)
    - Write timeout: 10s
    - 100 max connections, 50 keep-alive, 60s expiry
    - HTTP/2 enabled

    Args:
        api_key: Gemini API key (defaults to GEMINI_API_KEY env var)
        origin: API origin (defaults to GEMINI_ORIGIN)

    Returns:
        Pre-configured httpx.Client instance

    Example:
        client = get_gemini_client()
        response = client.post(
            GEMINI_CHAT_COMPLETIONS_PATH,
            json={
                "model": "gemini-2.0-flash-thinking-exp",
                "messages": [{"role": "user", "content": "Complex reasoning task..."}]
            }
        )
    """
    global _sync_singleton

    if _sync_singleton is None:
        resolved_api_key = api_key or _gemini_env.api_key or ""
        if not resolved_api_key:
            raise ValueError(
                "Gemini API key required: set GEMINI_API_KEY env var or pass api_key parameter"
            )

        _sync_singleton = httpx.Client(
            base_url=origin,
            headers={
                "Authorization": f"Bearer {resolved_api_key}",
                "Content-Type": "application/json",
            },
            timeout=create_gemini_timeout(),
            limits=create_gemini_limits(),
            http2=GEMINI_HTTP2_ENABLED,
        )

    return _sync_singleton


def get_async_gemini_client(
    api_key: str | None = None,
    origin: str = GEMINI_ORIGIN,
) -> httpx.AsyncClient:
    """
    Get or create the singleton async httpx client with pre-configured Gemini settings.

    The client is configured with optimized settings for LLM workloads:
    - Connect timeout: 10s (fast fail on network issues)
    - Read timeout: None (disabled for thinking models)
    - Write timeout: 10s
    - 100 max connections, 50 keep-alive, 60s expiry
    - HTTP/2 enabled

    Args:
        api_key: Gemini API key (defaults to GEMINI_API_KEY env var)
        origin: API origin (defaults to GEMINI_ORIGIN)

    Returns:
        Pre-configured httpx.AsyncClient instance

    Example:
        client = get_async_gemini_client()
        response = await client.post(
            GEMINI_CHAT_COMPLETIONS_PATH,
            json={
                "model": "gemini-2.0-flash-thinking-exp",
                "messages": [{"role": "user", "content": "Complex reasoning task..."}]
            }
        )
    """
    global _async_singleton

    if _async_singleton is None:
        resolved_api_key = api_key or _gemini_env.api_key or ""
        if not resolved_api_key:
            raise ValueError(
                "Gemini API key required: set GEMINI_API_KEY env var or pass api_key parameter"
            )

        _async_singleton = httpx.AsyncClient(
            base_url=origin,
            headers={
                "Authorization": f"Bearer {resolved_api_key}",
                "Content-Type": "application/json",
            },
            timeout=create_gemini_timeout(),
            limits=create_gemini_limits(),
            http2=GEMINI_HTTP2_ENABLED,
        )

    return _async_singleton


def close_gemini_client() -> None:
    """Close the singleton sync Gemini client."""
    global _sync_singleton
    if _sync_singleton is not None:
        _sync_singleton.close()
        _sync_singleton = None


async def close_async_gemini_client() -> None:
    """Close the singleton async Gemini client."""
    global _async_singleton
    if _async_singleton is not None:
        await _async_singleton.aclose()
        _async_singleton = None


# =============================================================================
# FACTORY FUNCTIONS
# =============================================================================


def create_gemini_client(
    api_key: str | None = None,
    origin: str = GEMINI_ORIGIN,
    timeout_overrides: GeminiTimeoutConfig | None = None,
    limits_overrides: GeminiLimitsConfig | None = None,
    http2: bool = GEMINI_HTTP2_ENABLED,
) -> httpx.Client:
    """
    Create a new sync httpx client with Gemini-optimized settings.

    Use this when you need a separate client instance (not the singleton).

    Args:
        api_key: Gemini API key (defaults to GEMINI_API_KEY env var)
        origin: API origin (defaults to GEMINI_ORIGIN)
        timeout_overrides: Optional timeout configuration overrides
        limits_overrides: Optional limits configuration overrides
        http2: Enable HTTP/2 (default: True)

    Returns:
        New pre-configured httpx.Client instance

    Example:
        # Create with default config
        client1 = create_gemini_client()

        # Create with custom timeouts
        client2 = create_gemini_client(
            timeout_overrides={"read": 60.0}  # 60s read timeout instead of None
        )
    """
    resolved_api_key = api_key or _gemini_env.api_key or ""
    if not resolved_api_key:
        raise ValueError(
            "Gemini API key required: set GEMINI_API_KEY env var or pass api_key parameter"
        )

    # Merge timeout config
    timeout_config: dict[str, Any] = {**GEMINI_TIMEOUT_CONFIG}
    if timeout_overrides:
        timeout_config.update(timeout_overrides)

    # Merge limits config
    limits_config: dict[str, Any] = {**GEMINI_LIMITS_CONFIG}
    if limits_overrides:
        limits_config.update(limits_overrides)

    return httpx.Client(
        base_url=origin,
        headers={
            "Authorization": f"Bearer {resolved_api_key}",
            "Content-Type": "application/json",
        },
        timeout=httpx.Timeout(**timeout_config),
        limits=httpx.Limits(**limits_config),
        http2=http2,
    )


def create_async_gemini_client(
    api_key: str | None = None,
    origin: str = GEMINI_ORIGIN,
    timeout_overrides: GeminiTimeoutConfig | None = None,
    limits_overrides: GeminiLimitsConfig | None = None,
    http2: bool = GEMINI_HTTP2_ENABLED,
) -> httpx.AsyncClient:
    """
    Create a new async httpx client with Gemini-optimized settings.

    Use this when you need a separate client instance (not the singleton).

    Args:
        api_key: Gemini API key (defaults to GEMINI_API_KEY env var)
        origin: API origin (defaults to GEMINI_ORIGIN)
        timeout_overrides: Optional timeout configuration overrides
        limits_overrides: Optional limits configuration overrides
        http2: Enable HTTP/2 (default: True)

    Returns:
        New pre-configured httpx.AsyncClient instance

    Example:
        # Create with default config
        client1 = create_async_gemini_client()

        # Create with custom connection limits
        client2 = create_async_gemini_client(
            limits_overrides={"max_connections": 50}
        )
    """
    resolved_api_key = api_key or _gemini_env.api_key or ""
    if not resolved_api_key:
        raise ValueError(
            "Gemini API key required: set GEMINI_API_KEY env var or pass api_key parameter"
        )

    # Merge timeout config
    timeout_config: dict[str, Any] = {**GEMINI_TIMEOUT_CONFIG}
    if timeout_overrides:
        timeout_config.update(timeout_overrides)

    # Merge limits config
    limits_config: dict[str, Any] = {**GEMINI_LIMITS_CONFIG}
    if limits_overrides:
        limits_config.update(limits_overrides)

    return httpx.AsyncClient(
        base_url=origin,
        headers={
            "Authorization": f"Bearer {resolved_api_key}",
            "Content-Type": "application/json",
        },
        timeout=httpx.Timeout(**timeout_config),
        limits=httpx.Limits(**limits_config),
        http2=http2,
    )


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================


def get_gemini_api_key(env_var_name: str = "GEMINI_API_KEY") -> str:
    """
    Get API key from environment or raise descriptive error.

    Args:
        env_var_name: Environment variable name (default: GEMINI_API_KEY)

    Returns:
        API key string

    Raises:
        ValueError: If API key is not set
    """
    api_key = os.environ.get(env_var_name)
    if not api_key:
        raise ValueError(f"Gemini API key required: set {env_var_name} environment variable")
    return api_key


def create_gemini_headers(
    api_key: str,
    additional_headers: dict[str, str] | None = None,
) -> dict[str, str]:
    """
    Create request headers with authorization.

    Args:
        api_key: Gemini API key
        additional_headers: Optional additional headers

    Returns:
        Headers dict for use in httpx requests
    """
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    if additional_headers:
        headers.update(additional_headers)
    return headers


# =============================================================================
# EXPORTS
# =============================================================================

__all__ = [
    # Version
    "__version__",
    # Origin and paths
    "GEMINI_ORIGIN",
    "GEMINI_CHAT_COMPLETIONS_PATH",
    # Timeout constants
    "GEMINI_CONNECT_TIMEOUT_S",
    "GEMINI_READ_TIMEOUT_S",
    "GEMINI_READ_TIMEOUT_THINKING_S",
    "GEMINI_WRITE_TIMEOUT_S",
    "GEMINI_POOL_TIMEOUT_S",
    # Connection pool constants
    "GEMINI_MAX_CONNECTIONS",
    "GEMINI_MAX_KEEPALIVE_CONNECTIONS",
    "GEMINI_KEEPALIVE_EXPIRY_S",
    # HTTP/2 config
    "GEMINI_HTTP2_ENABLED",
    # TypedDicts
    "GeminiTimeoutConfig",
    "GeminiLimitsConfig",
    "GeminiClientConfig",
    # Pre-configured objects
    "GEMINI_TIMEOUT_CONFIG",
    "GEMINI_LIMITS_CONFIG",
    # Factory functions for httpx objects
    "create_gemini_timeout",
    "create_gemini_limits",
    # Singleton clients
    "get_gemini_client",
    "get_async_gemini_client",
    "close_gemini_client",
    "close_async_gemini_client",
    # Factory functions for clients
    "create_gemini_client",
    "create_async_gemini_client",
    # Utilities
    "get_gemini_api_key",
    "create_gemini_headers",
]
