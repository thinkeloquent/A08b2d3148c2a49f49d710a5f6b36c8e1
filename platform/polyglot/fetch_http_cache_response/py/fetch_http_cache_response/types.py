"""Core types, configs, and response models for fetch_http_cache_response."""

from __future__ import annotations

import os
import time
from dataclasses import dataclass, field
from typing import Any, Callable, Awaitable, Generic, TypeVar

T = TypeVar("T")

_UNSET = object()


def _y(v: Any) -> Any:
    """Treat None as unset so YAML nulls fall through."""
    return v if v is not None else _UNSET


def _first(*values: Any) -> Any:
    """Return first non-UNSET, non-None value."""
    for v in values:
        if v is not _UNSET and v is not None:
            return v
    return None


# ─── RetryConfig ───────────────────────────────────────────────────────────────


@dataclass
class RetryConfig:
    """Retry configuration with exponential backoff."""

    max_retries: int = 3
    base_delay_seconds: float = 0.1
    max_delay_seconds: float = 5.0
    exponential_base: float = 2.0
    jitter: bool = True


# ─── HttpFetchConfig ──────────────────────────────────────────────────────────


@dataclass
class HttpFetchConfig:
    """HTTP client configuration."""

    base_url: str = ""
    method: str = "GET"
    headers: dict[str, str] = field(default_factory=dict)
    timeout: float = 30.0
    verify: bool = True
    proxy_url: str | None = None
    follow_redirects: bool = True
    retry: RetryConfig | None = None


# ─── AuthRefreshConfig ────────────────────────────────────────────────────────


@dataclass
class AuthRefreshConfig:
    """Auth token rotation configuration."""

    auth_type: str = "bearer"
    auth_token: str | None = None
    auth_token_resolver: str | None = None
    refresh_interval_seconds: float = 1200.0
    refresh_fn: Callable[[], Awaitable[str]] | None = None
    api_auth_header_name: str | None = None


# ─── CacheResponseConfig ─────────────────────────────────────────────────────


@dataclass
class CacheResponseConfig:
    """Response caching configuration."""

    enabled: bool = True
    ttl_seconds: float = 600.0
    storage_type: str = "s3"
    s3_config: dict[str, Any] | None = None
    key_strategy: str = "url"
    key_prefix: str = "fhcr:"
    stale_while_revalidate: float | None = None
    cache_methods: list[str] = field(default_factory=lambda: ["GET"])


# ─── SDKConfig ────────────────────────────────────────────────────────────────


@dataclass
class SDKConfig:
    """Top-level composite configuration with three-tier resolution."""

    http: HttpFetchConfig = field(default_factory=HttpFetchConfig)
    auth: AuthRefreshConfig | None = None
    cache: CacheResponseConfig = field(default_factory=CacheResponseConfig)
    debug: bool = False

    @classmethod
    def from_env(
        cls,
        yaml_config: dict[str, Any] | None = None,
        **overrides: Any,
    ) -> SDKConfig:
        """Three-tier resolution: overrides > YAML > env > defaults."""
        yc = yaml_config or {}

        # ── HTTP config ──
        http_yc = yc.get("http", {}) or {}
        http = HttpFetchConfig(
            base_url=(
                overrides.get("base_url")
                or _first(_y(http_yc.get("base_url")))
                or os.environ.get("FETCH_CACHE_BASE_URL", "")
            ),
            method=(
                overrides.get("method")
                or _first(_y(http_yc.get("method")))
                or "GET"
            ),
            headers=overrides.get("headers") or http_yc.get("headers") or {},
            timeout=float(
                overrides.get("timeout")
                or _first(_y(http_yc.get("timeout")))
                or os.environ.get("FETCH_CACHE_TIMEOUT", "30")
            ),
            verify=overrides.get("verify", http_yc.get("verify", True)),
            proxy_url=(
                overrides.get("proxy_url")
                or _first(_y(http_yc.get("proxy_url")))
                or os.environ.get("FETCH_CACHE_PROXY")
            ),
            follow_redirects=overrides.get(
                "follow_redirects", http_yc.get("follow_redirects", True)
            ),
            retry=overrides.get("retry") or http_yc.get("retry"),
        )

        # ── Auth config ──
        auth_yc = yc.get("auth", {}) or {}
        auth = None
        if auth_yc or overrides.get("auth_type") or overrides.get("auth_token"):
            auth = AuthRefreshConfig(
                auth_type=(
                    overrides.get("auth_type")
                    or _first(_y(auth_yc.get("auth_type")))
                    or os.environ.get("FETCH_CACHE_AUTH_TYPE", "bearer")
                ),
                auth_token=(
                    overrides.get("auth_token")
                    or _first(_y(auth_yc.get("auth_token")))
                    or os.environ.get("FETCH_CACHE_AUTH_TOKEN")
                ),
                auth_token_resolver=(
                    overrides.get("auth_token_resolver")
                    or _first(_y(auth_yc.get("auth_token_resolver")))
                ),
                refresh_interval_seconds=float(
                    overrides.get("refresh_interval_seconds")
                    or _first(_y(auth_yc.get("refresh_interval_seconds")))
                    or os.environ.get("FETCH_CACHE_AUTH_REFRESH_INTERVAL", "1200")
                ),
                refresh_fn=overrides.get("refresh_fn"),
                api_auth_header_name=(
                    overrides.get("api_auth_header_name")
                    or _first(_y(auth_yc.get("api_auth_header_name")))
                ),
            )

        # ── Cache config ──
        cache_yc = yc.get("cache", {}) or {}
        cache = CacheResponseConfig(
            enabled=overrides.get("cache_enabled", cache_yc.get("enabled", True)),
            ttl_seconds=float(
                overrides.get("cache_ttl_seconds")
                or _first(_y(cache_yc.get("ttl_seconds")))
                or os.environ.get("FETCH_CACHE_TTL", "600")
            ),
            storage_type=(
                overrides.get("cache_storage_type")
                or _first(_y(cache_yc.get("storage_type")))
                or "s3"
            ),
            s3_config=overrides.get("s3_config") or cache_yc.get("s3_config"),
            key_strategy=(
                overrides.get("cache_key_strategy")
                or _first(_y(cache_yc.get("key_strategy")))
                or "url"
            ),
            key_prefix=(
                overrides.get("cache_key_prefix")
                or _first(_y(cache_yc.get("key_prefix")))
                or os.environ.get("FETCH_CACHE_KEY_PREFIX", "fhcr:")
            ),
            stale_while_revalidate=overrides.get("stale_while_revalidate")
            or _first(_y(cache_yc.get("stale_while_revalidate"))),
            cache_methods=(
                overrides.get("cache_methods")
                or cache_yc.get("cache_methods")
                or ["GET"]
            ),
        )

        # ── Debug ──
        debug_str = os.environ.get("FETCH_CACHE_DEBUG", "false").lower()
        debug = overrides.get("debug", yc.get("debug", debug_str in ("true", "1", "yes")))

        return cls(http=http, auth=auth, cache=cache, debug=debug)


# ─── Response Types ───────────────────────────────────────────────────────────


@dataclass
class CachedHttpResponse:
    """HTTP response with cache metadata."""

    status_code: int
    headers: dict[str, str]
    body: Any
    cache_hit: bool
    cache_key: str | None = None
    cache_age: float | None = None
    cache_expires_at: float | None = None


@dataclass
class FetchResult(Generic[T]):
    """Generic result envelope."""

    success: bool
    data: T | None = None
    cached: bool = False
    cache_key: str | None = None
    elapsed_ms: float = 0.0
    error: str | None = None

    @classmethod
    def ok(cls, data: T, cached: bool = False, cache_key: str | None = None,
           elapsed_ms: float = 0.0) -> FetchResult[T]:
        return cls(success=True, data=data, cached=cached,
                   cache_key=cache_key, elapsed_ms=elapsed_ms)

    @classmethod
    def fail(cls, error: str, elapsed_ms: float = 0.0) -> FetchResult[T]:
        return cls(success=False, error=error, elapsed_ms=elapsed_ms)
