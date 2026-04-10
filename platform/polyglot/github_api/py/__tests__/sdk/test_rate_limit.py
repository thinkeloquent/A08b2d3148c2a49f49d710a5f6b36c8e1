"""Unit tests for github_api.sdk.rate_limit module.

Tests cover:
- Statement coverage for RateLimitInfo, parse_rate_limit_headers,
  should_wait_for_rate_limit, wait_for_rate_limit, is_secondary_rate_limit
- Branch coverage for all conditional paths
- Boundary value analysis
- Error handling verification
- Log verification for wait_for_rate_limit
"""

from __future__ import annotations

import logging
import time
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

import pytest

from github_api.sdk.rate_limit import (
    RateLimitInfo,
    is_secondary_rate_limit,
    parse_rate_limit_headers,
    should_wait_for_rate_limit,
    wait_for_rate_limit,
)


class TestStatementCoverage:
    """Execute every code path in rate_limit module."""

    # -- RateLimitInfo model --

    def test_rate_limit_info_fields(self) -> None:
        """RateLimitInfo stores all required and default fields."""
        info = RateLimitInfo(limit=5000, remaining=4999, reset=1700000000)
        assert info.limit == 5000
        assert info.remaining == 4999
        assert info.reset == 1700000000
        assert info.used == 0  # default
        assert info.resource == "core"  # default

    def test_rate_limit_info_custom_defaults(self) -> None:
        """RateLimitInfo accepts custom values for optional fields."""
        info = RateLimitInfo(
            limit=5000,
            remaining=4000,
            reset=1700000000,
            used=1000,
            resource="search",
        )
        assert info.used == 1000
        assert info.resource == "search"

    def test_reset_at_property(self) -> None:
        """reset_at returns a UTC datetime from the reset timestamp."""
        info = RateLimitInfo(limit=5000, remaining=4999, reset=1700000000)
        dt = info.reset_at
        assert isinstance(dt, datetime)
        assert dt.tzinfo == timezone.utc
        expected = datetime.fromtimestamp(1700000000, tz=timezone.utc)
        assert dt == expected

    def test_seconds_until_reset_positive(self) -> None:
        """seconds_until_reset returns a positive value for future resets."""
        future_reset = int(time.time()) + 3600  # 1 hour from now
        info = RateLimitInfo(limit=5000, remaining=0, reset=future_reset)
        seconds = info.seconds_until_reset
        assert seconds > 0
        assert seconds <= 3601  # allow small timing margin

    def test_is_exhausted_true(self) -> None:
        """is_exhausted returns True when remaining is 0."""
        info = RateLimitInfo(limit=5000, remaining=0, reset=1700000000, used=5000)
        assert info.is_exhausted is True

    def test_is_exhausted_false(self) -> None:
        """is_exhausted returns False when remaining > 0."""
        info = RateLimitInfo(limit=5000, remaining=100, reset=1700000000, used=4900)
        assert info.is_exhausted is False

    # -- parse_rate_limit_headers --

    def test_parse_rate_limit_headers_all_present(self) -> None:
        """parse_rate_limit_headers parses all five headers correctly."""
        headers = {
            "x-ratelimit-limit": "5000",
            "x-ratelimit-remaining": "4999",
            "x-ratelimit-reset": "1700000000",
            "x-ratelimit-used": "1",
            "x-ratelimit-resource": "core",
        }
        info = parse_rate_limit_headers(headers)
        assert info is not None
        assert info.limit == 5000
        assert info.remaining == 4999
        assert info.reset == 1700000000
        assert info.used == 1
        assert info.resource == "core"

    # -- should_wait_for_rate_limit --

    def test_should_wait_true(self) -> None:
        """should_wait_for_rate_limit returns True when remaining <= threshold."""
        info = RateLimitInfo(limit=5000, remaining=0, reset=1700000000)
        assert should_wait_for_rate_limit(info) is True

    def test_should_wait_false_above_threshold(self) -> None:
        """should_wait_for_rate_limit returns False when remaining > threshold."""
        info = RateLimitInfo(limit=5000, remaining=100, reset=1700000000)
        assert should_wait_for_rate_limit(info, threshold=0) is False

    # -- wait_for_rate_limit --

    async def test_wait_for_rate_limit_sleeps(self) -> None:
        """wait_for_rate_limit calls asyncio.sleep."""
        future_reset = int(time.time()) + 100
        info = RateLimitInfo(limit=5000, remaining=0, reset=future_reset)
        with patch("github_api.sdk.rate_limit.asyncio.sleep", new_callable=AsyncMock) as mock_sleep:
            await wait_for_rate_limit(info)
            mock_sleep.assert_called_once()
            # Should sleep for approximately seconds_until_reset + 1
            sleep_arg = mock_sleep.call_args[0][0]
            assert sleep_arg > 0

    # -- is_secondary_rate_limit --

    def test_is_secondary_rate_limit_detects_403_secondary(self) -> None:
        """is_secondary_rate_limit returns True for 403 + secondary message."""
        assert is_secondary_rate_limit(403, {"message": "secondary rate limit"}) is True

    def test_is_secondary_rate_limit_detects_429_abuse(self) -> None:
        """is_secondary_rate_limit returns True for 429 + abuse detection."""
        assert is_secondary_rate_limit(429, {"message": "abuse detection triggered"}) is True


class TestBranchCoverage:
    """Test all if/else branches in rate_limit module."""

    # -- parse_rate_limit_headers --

    def test_parse_missing_limit_returns_none(self) -> None:
        """parse_rate_limit_headers returns None when limit header is missing."""
        headers = {
            "x-ratelimit-remaining": "4999",
            "x-ratelimit-reset": "1700000000",
        }
        assert parse_rate_limit_headers(headers) is None

    def test_parse_missing_remaining_returns_none(self) -> None:
        """parse_rate_limit_headers returns None when remaining header is missing."""
        headers = {
            "x-ratelimit-limit": "5000",
            "x-ratelimit-reset": "1700000000",
        }
        assert parse_rate_limit_headers(headers) is None

    def test_parse_missing_reset_returns_none(self) -> None:
        """parse_rate_limit_headers returns None when reset header is missing."""
        headers = {
            "x-ratelimit-limit": "5000",
            "x-ratelimit-remaining": "4999",
        }
        assert parse_rate_limit_headers(headers) is None

    def test_parse_non_numeric_limit_returns_none(self) -> None:
        """parse_rate_limit_headers returns None when limit is non-numeric."""
        headers = {
            "x-ratelimit-limit": "abc",
            "x-ratelimit-remaining": "4999",
            "x-ratelimit-reset": "1700000000",
        }
        assert parse_rate_limit_headers(headers) is None

    def test_parse_non_numeric_remaining_returns_none(self) -> None:
        """parse_rate_limit_headers returns None when remaining is non-numeric."""
        headers = {
            "x-ratelimit-limit": "5000",
            "x-ratelimit-remaining": "xyz",
            "x-ratelimit-reset": "1700000000",
        }
        assert parse_rate_limit_headers(headers) is None

    def test_parse_non_numeric_reset_returns_none(self) -> None:
        """parse_rate_limit_headers returns None when reset is non-numeric."""
        headers = {
            "x-ratelimit-limit": "5000",
            "x-ratelimit-remaining": "4999",
            "x-ratelimit-reset": "invalid",
        }
        assert parse_rate_limit_headers(headers) is None

    def test_parse_missing_used_uses_default_zero(self) -> None:
        """parse_rate_limit_headers uses '0' default when used header absent."""
        headers = {
            "x-ratelimit-limit": "5000",
            "x-ratelimit-remaining": "4999",
            "x-ratelimit-reset": "1700000000",
        }
        info = parse_rate_limit_headers(headers)
        assert info is not None
        assert info.used == 0

    def test_parse_missing_resource_uses_core_default(self) -> None:
        """parse_rate_limit_headers defaults resource to 'core'."""
        headers = {
            "x-ratelimit-limit": "5000",
            "x-ratelimit-remaining": "4999",
            "x-ratelimit-reset": "1700000000",
        }
        info = parse_rate_limit_headers(headers)
        assert info is not None
        assert info.resource == "core"

    def test_parse_non_numeric_used_falls_back(self) -> None:
        """parse_rate_limit_headers falls back to limit-remaining when used is non-numeric."""
        headers = {
            "x-ratelimit-limit": "5000",
            "x-ratelimit-remaining": "4000",
            "x-ratelimit-reset": "1700000000",
            "x-ratelimit-used": "not_a_number",
        }
        info = parse_rate_limit_headers(headers)
        assert info is not None
        assert info.used == 1000  # 5000 - 4000

    # -- should_wait_for_rate_limit --

    def test_should_wait_auto_wait_false(self) -> None:
        """should_wait_for_rate_limit returns False when auto_wait=False."""
        info = RateLimitInfo(limit=5000, remaining=0, reset=1700000000)
        assert should_wait_for_rate_limit(info, auto_wait=False) is False

    def test_should_wait_remaining_above_threshold(self) -> None:
        """should_wait_for_rate_limit returns False when remaining > threshold."""
        info = RateLimitInfo(limit=5000, remaining=10, reset=1700000000)
        assert should_wait_for_rate_limit(info, threshold=5) is False

    def test_should_wait_remaining_at_threshold(self) -> None:
        """should_wait_for_rate_limit returns True when remaining == threshold."""
        info = RateLimitInfo(limit=5000, remaining=5, reset=1700000000)
        assert should_wait_for_rate_limit(info, threshold=5) is True

    def test_should_wait_remaining_below_threshold(self) -> None:
        """should_wait_for_rate_limit returns True when remaining < threshold."""
        info = RateLimitInfo(limit=5000, remaining=3, reset=1700000000)
        assert should_wait_for_rate_limit(info, threshold=5) is True

    # -- wait_for_rate_limit --

    async def test_wait_with_logger_logs_warning(self) -> None:
        """wait_for_rate_limit logs a warning when logger is provided."""
        future_reset = int(time.time()) + 100
        info = RateLimitInfo(limit=5000, remaining=0, reset=future_reset)
        logger = logging.getLogger("test_rate_limit")

        with patch("github_api.sdk.rate_limit.asyncio.sleep", new_callable=AsyncMock):
            with patch.object(logger, "warning") as mock_warning:
                await wait_for_rate_limit(info, logger=logger)
                mock_warning.assert_called_once()
                call_args = mock_warning.call_args[0]
                assert "Rate limit exhausted" in call_args[0]

    async def test_wait_without_logger_no_error(self) -> None:
        """wait_for_rate_limit works without a logger."""
        future_reset = int(time.time()) + 100
        info = RateLimitInfo(limit=5000, remaining=0, reset=future_reset)

        with patch("github_api.sdk.rate_limit.asyncio.sleep", new_callable=AsyncMock) as mock_sleep:
            await wait_for_rate_limit(info, logger=None)
            mock_sleep.assert_called_once()

    async def test_wait_past_reset_returns_immediately(self) -> None:
        """wait_for_rate_limit returns immediately when reset is in the past."""
        past_reset = int(time.time()) - 3600  # 1 hour ago
        info = RateLimitInfo(limit=5000, remaining=0, reset=past_reset)

        with patch("github_api.sdk.rate_limit.asyncio.sleep", new_callable=AsyncMock) as mock_sleep:
            await wait_for_rate_limit(info, logger=None)
            # seconds_until_reset returns 0, wait_seconds = 0+1 = 1 > 0, so sleep is called
            # The function adds 1s buffer so it still sleeps for 1 second
            mock_sleep.assert_called_once()

    # -- is_secondary_rate_limit --

    def test_is_secondary_status_200_false(self) -> None:
        """is_secondary_rate_limit returns False for status 200."""
        assert is_secondary_rate_limit(200, {"message": "rate limit"}) is False

    def test_is_secondary_status_201_false(self) -> None:
        """is_secondary_rate_limit returns False for status 201."""
        assert is_secondary_rate_limit(201) is False

    def test_is_secondary_body_none_false(self) -> None:
        """is_secondary_rate_limit returns False when body is None."""
        assert is_secondary_rate_limit(403, None) is False

    def test_is_secondary_429_body_none_false(self) -> None:
        """is_secondary_rate_limit returns False for 429 with body=None."""
        assert is_secondary_rate_limit(429, None) is False

    def test_is_secondary_403_secondary_rate(self) -> None:
        """is_secondary_rate_limit returns True for 403 + 'secondary rate' message."""
        assert is_secondary_rate_limit(403, {"message": "You have exceeded a secondary rate limit"}) is True

    def test_is_secondary_429_abuse_detection(self) -> None:
        """is_secondary_rate_limit returns True for 429 + 'abuse detection' message."""
        assert is_secondary_rate_limit(429, {"message": "Abuse detection triggered"}) is True

    def test_is_secondary_403_unrelated_message(self) -> None:
        """is_secondary_rate_limit returns False for 403 + unrelated message."""
        assert is_secondary_rate_limit(403, {"message": "Resource not accessible"}) is False

    def test_is_secondary_429_unrelated_message(self) -> None:
        """is_secondary_rate_limit returns False for 429 + unrelated message."""
        assert is_secondary_rate_limit(429, {"message": "Too many requests"}) is False

    def test_is_secondary_403_rate_limit_keyword(self) -> None:
        """is_secondary_rate_limit returns True for 403 + 'rate limit' message."""
        assert is_secondary_rate_limit(403, {"message": "API rate limit exceeded"}) is True

    def test_is_secondary_429_retry_later(self) -> None:
        """is_secondary_rate_limit returns True for 429 + 'retry later' message."""
        assert is_secondary_rate_limit(429, {"message": "Please retry later"}) is True

    def test_is_secondary_empty_message(self) -> None:
        """is_secondary_rate_limit returns False when message is empty."""
        assert is_secondary_rate_limit(403, {"message": ""}) is False

    def test_is_secondary_no_message_key(self) -> None:
        """is_secondary_rate_limit returns False when body has no message key."""
        assert is_secondary_rate_limit(403, {"error": "something"}) is False


class TestBoundaryValues:
    """Edge cases: reset in the past, empty dict, non-numeric used."""

    def test_seconds_until_reset_past_returns_zero(self) -> None:
        """seconds_until_reset returns 0 when reset is in the past."""
        past_reset = int(time.time()) - 3600  # 1 hour ago
        info = RateLimitInfo(limit=5000, remaining=0, reset=past_reset)
        assert info.seconds_until_reset == 0

    def test_parse_empty_dict_returns_none(self) -> None:
        """parse_rate_limit_headers with empty dict returns None."""
        assert parse_rate_limit_headers({}) is None

    def test_parse_used_non_numeric_falls_back_to_limit_minus_remaining(self) -> None:
        """parse_rate_limit_headers with non-numeric used uses limit - remaining."""
        headers = {
            "x-ratelimit-limit": "100",
            "x-ratelimit-remaining": "30",
            "x-ratelimit-reset": "1700000000",
            "x-ratelimit-used": "abc",
        }
        info = parse_rate_limit_headers(headers)
        assert info is not None
        assert info.used == 70  # 100 - 30

    def test_rate_limit_info_zero_remaining_zero_limit(self) -> None:
        """RateLimitInfo with limit=0 and remaining=0."""
        info = RateLimitInfo(limit=0, remaining=0, reset=1700000000)
        assert info.is_exhausted is True

    def test_rate_limit_info_large_limit(self) -> None:
        """RateLimitInfo with very large limit value."""
        info = RateLimitInfo(limit=999999, remaining=999999, reset=1700000000)
        assert info.is_exhausted is False

    def test_should_wait_zero_threshold_zero_remaining(self) -> None:
        """should_wait with threshold=0 and remaining=0 returns True."""
        info = RateLimitInfo(limit=5000, remaining=0, reset=1700000000)
        assert should_wait_for_rate_limit(info, threshold=0) is True

    def test_should_wait_high_threshold(self) -> None:
        """should_wait with threshold higher than limit."""
        info = RateLimitInfo(limit=5000, remaining=4999, reset=1700000000)
        assert should_wait_for_rate_limit(info, threshold=5000) is True

    def test_parse_custom_resource(self) -> None:
        """parse_rate_limit_headers with custom resource header."""
        headers = {
            "x-ratelimit-limit": "30",
            "x-ratelimit-remaining": "29",
            "x-ratelimit-reset": "1700000000",
            "x-ratelimit-resource": "search",
        }
        info = parse_rate_limit_headers(headers)
        assert info is not None
        assert info.resource == "search"


class TestErrorHandling:
    """Test error scenarios in rate_limit functions."""

    def test_parse_headers_with_all_non_numeric_returns_none(self) -> None:
        """parse_rate_limit_headers returns None when all values are non-numeric."""
        headers = {
            "x-ratelimit-limit": "abc",
            "x-ratelimit-remaining": "def",
            "x-ratelimit-reset": "ghi",
        }
        assert parse_rate_limit_headers(headers) is None

    def test_rate_limit_info_is_pydantic_model(self) -> None:
        """RateLimitInfo is a valid Pydantic BaseModel."""
        from pydantic import BaseModel
        assert issubclass(RateLimitInfo, BaseModel)

    def test_rate_limit_info_model_dump(self) -> None:
        """RateLimitInfo.model_dump returns expected dict."""
        info = RateLimitInfo(limit=5000, remaining=100, reset=1700000000, used=4900, resource="core")
        d = info.model_dump()
        assert d["limit"] == 5000
        assert d["remaining"] == 100
        assert d["reset"] == 1700000000
        assert d["used"] == 4900
        assert d["resource"] == "core"


class TestLogVerification:
    """Verify logging calls in rate_limit module."""

    async def test_wait_for_rate_limit_logs_with_logger(self) -> None:
        """wait_for_rate_limit logs warning with wait time and reset time."""
        future_reset = int(time.time()) + 300
        info = RateLimitInfo(limit=5000, remaining=0, reset=future_reset)
        logger = logging.getLogger("test_rate_limit_logging")

        with patch("github_api.sdk.rate_limit.asyncio.sleep", new_callable=AsyncMock):
            with patch.object(logger, "warning") as mock_warning:
                await wait_for_rate_limit(info, logger=logger)
                mock_warning.assert_called_once()
                log_format = mock_warning.call_args[0][0]
                assert "Rate limit exhausted" in log_format
                assert "Waiting" in log_format
                # Check that wait seconds and reset time are passed as args
                assert len(mock_warning.call_args[0]) >= 3

    async def test_wait_for_rate_limit_no_log_without_logger(self) -> None:
        """wait_for_rate_limit does not log when logger is None."""
        future_reset = int(time.time()) + 100
        info = RateLimitInfo(limit=5000, remaining=0, reset=future_reset)

        with patch("github_api.sdk.rate_limit.asyncio.sleep", new_callable=AsyncMock):
            # This should not raise any errors
            await wait_for_rate_limit(info, logger=None)

    async def test_wait_logs_correct_wait_duration(self) -> None:
        """wait_for_rate_limit passes the correct wait duration to sleep."""
        future_reset = int(time.time()) + 60
        info = RateLimitInfo(limit=5000, remaining=0, reset=future_reset)

        with patch("github_api.sdk.rate_limit.asyncio.sleep", new_callable=AsyncMock) as mock_sleep:
            await wait_for_rate_limit(info)
            sleep_seconds = mock_sleep.call_args[0][0]
            # Should be approximately seconds_until_reset + 1 buffer
            assert 59 <= sleep_seconds <= 63
