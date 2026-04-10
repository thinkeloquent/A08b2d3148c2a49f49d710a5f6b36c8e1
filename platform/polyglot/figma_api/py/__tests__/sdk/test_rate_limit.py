"""Unit tests for figma_api.sdk.rate_limit."""
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from figma_api.sdk.rate_limit import (
    RateLimitInfo,
    RateLimitOptions,
    handle_rate_limit,
    parse_rate_limit_headers,
    should_auto_wait,
    wait_for_retry_after,
)


class TestParseRateLimitHeaders:
    class TestStatementCoverage:
        def test_parse_all_headers(self):
            info = parse_rate_limit_headers({
                "retry-after": "30",
                "x-figma-plan-tier": "professional",
                "x-figma-rate-limit-type": "files",
                "x-figma-upgrade-link": "https://figma.com/upgrade",
            })
            assert isinstance(info, RateLimitInfo)
            assert info.retry_after == 30.0
            assert info.plan_tier == "professional"
            assert info.rate_limit_type == "files"
            assert info.upgrade_link == "https://figma.com/upgrade"

    class TestBranchCoverage:
        def test_missing_headers_use_defaults(self):
            info = parse_rate_limit_headers({})
            assert info.retry_after == 60.0
            assert info.plan_tier is None
            assert info.rate_limit_type is None
            assert info.upgrade_link is None


class TestShouldAutoWait:
    class TestStatementCoverage:
        def test_returns_true_by_default(self):
            info = RateLimitInfo()
            assert should_auto_wait(info) is True

    class TestBranchCoverage:
        def test_none_options_returns_true(self):
            assert should_auto_wait(RateLimitInfo(), None) is True

        def test_auto_wait_false(self):
            options = RateLimitOptions(auto_wait=False)
            assert should_auto_wait(RateLimitInfo(), options) is False

        def test_callback_returns_false(self):
            callback = MagicMock(return_value=False)
            options = RateLimitOptions(on_rate_limit=callback)
            assert should_auto_wait(RateLimitInfo(), options) is False
            callback.assert_called_once()

        def test_callback_returns_none_uses_auto_wait(self):
            callback = MagicMock(return_value=None)
            options = RateLimitOptions(auto_wait=True, on_rate_limit=callback)
            assert should_auto_wait(RateLimitInfo(), options) is True


class TestWaitForRetryAfter:
    async def test_waits_specified_seconds(self):
        with patch("figma_api.sdk.rate_limit.asyncio.sleep", new_callable=AsyncMock) as mock_sleep:
            await wait_for_retry_after(5.0)
            mock_sleep.assert_called_once_with(5.0)


class TestHandleRateLimit:
    async def test_retry_true_when_auto_wait(self):
        with patch("figma_api.sdk.rate_limit.asyncio.sleep", new_callable=AsyncMock):
            result = await handle_rate_limit(
                {"retry-after": "1"},
                RateLimitOptions(auto_wait=True),
            )
            assert result["retry"] is True
            assert isinstance(result["rate_limit_info"], RateLimitInfo)

    async def test_retry_false_when_no_auto_wait(self):
        result = await handle_rate_limit(
            {"retry-after": "10"},
            RateLimitOptions(auto_wait=False),
        )
        assert result["retry"] is False
        assert result["rate_limit_info"].retry_after == 10.0
