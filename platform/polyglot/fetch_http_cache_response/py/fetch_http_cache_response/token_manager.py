"""Auth token refresh manager with pluggable strategies (Story 2)."""

from __future__ import annotations

import asyncio
import time
from typing import Any, Awaitable, Callable, Protocol

from auth_encoding import encode_auth

from .exceptions import FetchCacheAuthError
from .logger import create as create_logger
from .types import AuthRefreshConfig

logger = create_logger(__name__)


# ─── Strategy Protocol ────────────────────────────────────────────────────────


class TokenStrategy(Protocol):
    async def get_token(self) -> str: ...
    def is_expired(self) -> bool: ...


# ─── Built-in Strategies ─────────────────────────────────────────────────────


class StaticTokenStrategy:
    """Never refreshes, returns static token."""

    def __init__(self, token: str):
        self._token = token

    async def get_token(self) -> str:
        return self._token

    def is_expired(self) -> bool:
        return False


class CallableTokenStrategy:
    """Wraps user-provided async function with TTL-based expiration."""

    def __init__(
        self,
        refresh_fn: Callable[[], Awaitable[str]],
        refresh_interval_seconds: float = 1200.0,
    ):
        self._refresh_fn = refresh_fn
        self._refresh_interval = refresh_interval_seconds
        self._token: str | None = None
        self._expires_at: float = 0.0
        self._lock = asyncio.Lock()

    async def get_token(self) -> str:
        if not self.is_expired() and self._token is not None:
            return self._token
        async with self._lock:
            # Double-check after acquiring lock
            if not self.is_expired() and self._token is not None:
                return self._token
            return await self._refresh()

    def is_expired(self) -> bool:
        return time.monotonic() >= self._expires_at

    async def _refresh(self) -> str:
        try:
            self._token = await self._refresh_fn()
            self._expires_at = time.monotonic() + self._refresh_interval
            logger.debug(f"token refreshed, expires in {self._refresh_interval}s")
            return self._token
        except Exception as e:
            raise FetchCacheAuthError(
                f"Token refresh failed: {e}", cause=e
            ) from e


class ComputedTokenStrategy:
    """Wraps overwrite_from_context {{fn:...}} resolver."""

    def __init__(
        self,
        resolver_name: str,
        resolve_fn: Callable[[str], Awaitable[str]] | None = None,
        refresh_interval_seconds: float = 1200.0,
    ):
        self._resolver_name = resolver_name
        self._resolve_fn = resolve_fn
        self._refresh_interval = refresh_interval_seconds
        self._token: str | None = None
        self._expires_at: float = 0.0
        self._lock = asyncio.Lock()

    async def get_token(self) -> str:
        if not self.is_expired() and self._token is not None:
            return self._token
        async with self._lock:
            if not self.is_expired() and self._token is not None:
                return self._token
            return await self._refresh()

    def is_expired(self) -> bool:
        return time.monotonic() >= self._expires_at

    async def _refresh(self) -> str:
        if self._resolve_fn is None:
            raise FetchCacheAuthError(
                f"No resolve_fn provided for computed token '{self._resolver_name}'"
            )
        try:
            self._token = await self._resolve_fn(self._resolver_name)
            self._expires_at = time.monotonic() + self._refresh_interval
            logger.debug(f"computed token '{self._resolver_name}' refreshed")
            return self._token
        except Exception as e:
            raise FetchCacheAuthError(
                f"Computed token resolution failed for '{self._resolver_name}': {e}",
                cause=e,
            ) from e


# ─── Token Refresh Manager ───────────────────────────────────────────────────


class TokenRefreshManager:
    """Manages token lifecycle with pluggable strategy."""

    def __init__(self, strategy: TokenStrategy, auth_config: AuthRefreshConfig):
        self._strategy = strategy
        self._auth_config = auth_config

    async def get_token(self) -> str:
        return await self._strategy.get_token()

    def is_expired(self) -> bool:
        return self._strategy.is_expired()

    async def build_auth_headers(self) -> dict[str, str]:
        """Build HTTP auth headers using current token."""
        token = await self.get_token()
        auth_type = self._auth_config.auth_type

        # Custom header name override (e.g., X-Figma-Token)
        if self._auth_config.api_auth_header_name:
            return {self._auth_config.api_auth_header_name: token}

        # Use auth_encoding for standard auth types
        credentials: dict[str, Any] = {"token": token}
        try:
            return encode_auth(auth_type, credentials)
        except Exception as e:
            raise FetchCacheAuthError(
                f"Failed to encode auth headers for type '{auth_type}': {e}",
                cause=e,
            ) from e


# ─── Factory ──────────────────────────────────────────────────────────────────


def create_token_strategy(auth_config: AuthRefreshConfig) -> TokenStrategy:
    """Create appropriate token strategy from config."""
    if auth_config.refresh_fn is not None:
        return CallableTokenStrategy(
            refresh_fn=auth_config.refresh_fn,
            refresh_interval_seconds=auth_config.refresh_interval_seconds,
        )
    if auth_config.auth_token_resolver is not None:
        return ComputedTokenStrategy(
            resolver_name=auth_config.auth_token_resolver,
            refresh_interval_seconds=auth_config.refresh_interval_seconds,
        )
    if auth_config.auth_token is not None:
        return StaticTokenStrategy(token=auth_config.auth_token)

    raise FetchCacheAuthError(
        "AuthRefreshConfig must provide one of: auth_token, auth_token_resolver, or refresh_fn"
    )


def create_token_manager(auth_config: AuthRefreshConfig) -> TokenRefreshManager:
    """Create a TokenRefreshManager from config."""
    strategy = create_token_strategy(auth_config)
    return TokenRefreshManager(strategy=strategy, auth_config=auth_config)
