"""Tests for TokenRefreshManager (Story 6, Task 6.2)."""

import asyncio
import time

import pytest

from fetch_http_cache_response.exceptions import FetchCacheAuthError
from fetch_http_cache_response.token_manager import (
    CallableTokenStrategy,
    ComputedTokenStrategy,
    StaticTokenStrategy,
    TokenRefreshManager,
    create_token_manager,
    create_token_strategy,
)
from fetch_http_cache_response.types import AuthRefreshConfig


class TestStaticTokenStrategy:
    async def test_returns_static_token(self):
        strategy = StaticTokenStrategy("my-token")
        assert await strategy.get_token() == "my-token"

    async def test_never_expires(self):
        strategy = StaticTokenStrategy("my-token")
        assert strategy.is_expired() is False


class TestCallableTokenStrategy:
    async def test_fetches_token_on_first_call(self):
        call_count = 0

        async def refresh():
            nonlocal call_count
            call_count += 1
            return f"token-{call_count}"

        strategy = CallableTokenStrategy(refresh_fn=refresh, refresh_interval_seconds=60)
        token = await strategy.get_token()
        assert token == "token-1"
        assert call_count == 1

    async def test_caches_token_within_interval(self):
        call_count = 0

        async def refresh():
            nonlocal call_count
            call_count += 1
            return f"token-{call_count}"

        strategy = CallableTokenStrategy(refresh_fn=refresh, refresh_interval_seconds=60)
        t1 = await strategy.get_token()
        t2 = await strategy.get_token()
        assert t1 == t2
        assert call_count == 1

    async def test_refreshes_on_expiry(self):
        call_count = 0

        async def refresh():
            nonlocal call_count
            call_count += 1
            return f"token-{call_count}"

        strategy = CallableTokenStrategy(refresh_fn=refresh, refresh_interval_seconds=0.01)
        t1 = await strategy.get_token()
        await asyncio.sleep(0.02)
        t2 = await strategy.get_token()
        assert t1 != t2
        assert call_count == 2

    async def test_refresh_failure_raises(self):
        async def bad_refresh():
            raise ValueError("remote error")

        strategy = CallableTokenStrategy(refresh_fn=bad_refresh)
        with pytest.raises(FetchCacheAuthError, match="Token refresh failed"):
            await strategy.get_token()

    async def test_concurrent_access_single_refresh(self):
        call_count = 0

        async def slow_refresh():
            nonlocal call_count
            call_count += 1
            await asyncio.sleep(0.05)
            return f"token-{call_count}"

        strategy = CallableTokenStrategy(refresh_fn=slow_refresh, refresh_interval_seconds=60)
        results = await asyncio.gather(
            strategy.get_token(),
            strategy.get_token(),
            strategy.get_token(),
        )
        # All should get the same token, only one refresh call
        assert len(set(results)) == 1
        assert call_count == 1


class TestComputedTokenStrategy:
    async def test_resolves_token(self):
        async def resolver(name):
            return f"computed-{name}"

        strategy = ComputedTokenStrategy(
            resolver_name="github_api",
            resolve_fn=resolver,
            refresh_interval_seconds=60,
        )
        token = await strategy.get_token()
        assert token == "computed-github_api"

    async def test_no_resolve_fn_raises(self):
        strategy = ComputedTokenStrategy(resolver_name="test")
        with pytest.raises(FetchCacheAuthError, match="No resolve_fn provided"):
            await strategy.get_token()


class TestTokenRefreshManager:
    async def test_build_auth_headers_bearer(self):
        config = AuthRefreshConfig(auth_type="bearer", auth_token="tok_123")
        manager = create_token_manager(config)
        headers = await manager.build_auth_headers()
        assert "Authorization" in headers
        assert headers["Authorization"] == "Bearer tok_123"

    async def test_build_auth_headers_custom_header(self):
        config = AuthRefreshConfig(
            auth_type="custom",
            auth_token="fig_123",
            api_auth_header_name="X-Figma-Token",
        )
        manager = create_token_manager(config)
        headers = await manager.build_auth_headers()
        assert headers == {"X-Figma-Token": "fig_123"}


class TestCreateTokenStrategy:
    def test_static_from_token(self):
        config = AuthRefreshConfig(auth_token="static-tok")
        strategy = create_token_strategy(config)
        assert isinstance(strategy, StaticTokenStrategy)

    def test_callable_from_refresh_fn(self):
        async def my_refresh():
            return "new-token"

        config = AuthRefreshConfig(refresh_fn=my_refresh)
        strategy = create_token_strategy(config)
        assert isinstance(strategy, CallableTokenStrategy)

    def test_computed_from_resolver(self):
        config = AuthRefreshConfig(auth_token_resolver="my_resolver")
        strategy = create_token_strategy(config)
        assert isinstance(strategy, ComputedTokenStrategy)

    def test_no_source_raises(self):
        config = AuthRefreshConfig()
        with pytest.raises(FetchCacheAuthError, match="must provide one of"):
            create_token_strategy(config)
