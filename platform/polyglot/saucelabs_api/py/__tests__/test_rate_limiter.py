"""
Unit tests for saucelabs_api.rate_limiter

Tests cover:
- Statement coverage for _parse_retry_after, _calculate_backoff, handle_response
- Branch coverage for auto_wait, max retries, callback
- Error handling verification
"""

import asyncio
from unittest.mock import AsyncMock, MagicMock

import pytest

from saucelabs_api.errors import SaucelabsRateLimitError
from saucelabs_api.rate_limiter import RateLimiter


class TestParseRetryAfter:
    """Tests for RateLimiter._parse_retry_after static method."""

    # =================================================================
    # Statement Coverage
    # =================================================================

    def test_parses_numeric_string(self):
        result = RateLimiter._parse_retry_after({"retry-after": "30"})
        assert result == 30.0

    def test_parses_float_string(self):
        result = RateLimiter._parse_retry_after({"retry-after": "1.5"})
        assert result == 1.5

    # =================================================================
    # Branch Coverage
    # =================================================================

    def test_returns_default_for_missing_header(self):
        result = RateLimiter._parse_retry_after({})
        assert result == 1.0

    def test_returns_default_for_invalid_value(self):
        result = RateLimiter._parse_retry_after({"retry-after": "not-a-number"})
        assert result == 1.0

    def test_enforces_minimum(self):
        result = RateLimiter._parse_retry_after({"retry-after": "0.01"})
        assert result >= 0.1

    def test_reads_capital_retry_after(self):
        result = RateLimiter._parse_retry_after({"Retry-After": "20"})
        assert result == 20.0


class TestCalculateBackoff:
    """Tests for RateLimiter._calculate_backoff static method."""

    # =================================================================
    # Statement Coverage
    # =================================================================

    def test_retry_0(self):
        delay = RateLimiter._calculate_backoff(0)
        assert delay >= 1.0
        assert delay <= 2.0  # 1*2^0 + jitter(0-1)

    def test_increases_exponentially(self):
        d0 = RateLimiter._calculate_backoff(0, base_delay=1.0, max_delay=1000.0)
        d3 = RateLimiter._calculate_backoff(3, base_delay=1.0, max_delay=1000.0)
        assert d3 > d0

    # =================================================================
    # Boundary Values
    # =================================================================

    def test_caps_at_max_delay(self):
        delay = RateLimiter._calculate_backoff(100, max_delay=60.0)
        assert delay <= 60.0


class TestRateLimiter:
    """Tests for RateLimiter class."""

    # =================================================================
    # Statement Coverage
    # =================================================================

    def test_constructs_with_defaults(self):
        rl = RateLimiter()
        assert rl.last_rate_limit is None

    def test_constructs_with_options(self):
        rl = RateLimiter(auto_wait=False, max_retries=3)
        assert rl.last_rate_limit is None

    # =================================================================
    # Branch Coverage
    # =================================================================

    @pytest.mark.asyncio
    async def test_passes_through_non_429(self):
        mock_logger = MagicMock()
        rl = RateLimiter(logger=mock_logger)
        response = MagicMock()
        response.status_code = 200
        result = await rl.handle_response(response, AsyncMock())
        assert result is response

    @pytest.mark.asyncio
    async def test_raises_when_auto_wait_disabled(self):
        mock_logger = MagicMock()
        rl = RateLimiter(auto_wait=False, logger=mock_logger)
        response = MagicMock()
        response.status_code = 429
        response.headers = {"retry-after": "5"}
        response.text = "rate limited"

        with pytest.raises(SaucelabsRateLimitError):
            await rl.handle_response(response, AsyncMock())

    @pytest.mark.asyncio
    async def test_raises_when_max_retries_exceeded(self):
        mock_logger = MagicMock()
        rl = RateLimiter(auto_wait=True, max_retries=2, logger=mock_logger)
        response = MagicMock()
        response.status_code = 429
        response.headers = {"retry-after": "1"}
        response.text = "rate limited"

        with pytest.raises(SaucelabsRateLimitError):
            await rl.handle_response(response, AsyncMock(), retry_count=2)

    @pytest.mark.asyncio
    async def test_raises_when_callback_returns_false(self):
        mock_logger = MagicMock()
        callback = MagicMock(return_value=False)
        rl = RateLimiter(auto_wait=True, max_retries=5, on_rate_limit=callback, logger=mock_logger)
        response = MagicMock()
        response.status_code = 429
        response.headers = {"retry-after": "1"}
        response.text = "rate limited"

        with pytest.raises(SaucelabsRateLimitError):
            await rl.handle_response(response, AsyncMock())
        callback.assert_called_once()

    @pytest.mark.asyncio
    async def test_retries_on_429_with_auto_wait(self):
        mock_logger = MagicMock()
        rl = RateLimiter(auto_wait=True, max_retries=3, logger=mock_logger)
        response_429 = MagicMock()
        response_429.status_code = 429
        response_429.headers = {"retry-after": "0.01"}
        response_429.text = "rate limited"

        response_200 = MagicMock()
        response_200.status_code = 200

        retry_fn = AsyncMock(return_value=response_200)
        result = await rl.handle_response(response_429, retry_fn)
        assert result is response_200
        retry_fn.assert_called_once()

    @pytest.mark.asyncio
    async def test_stores_last_rate_limit(self):
        mock_logger = MagicMock()
        rl = RateLimiter(auto_wait=False, logger=mock_logger)
        response = MagicMock()
        response.status_code = 429
        response.headers = {"retry-after": "10"}
        response.text = ""

        with pytest.raises(SaucelabsRateLimitError):
            await rl.handle_response(response, AsyncMock())
        assert rl.last_rate_limit is not None
        assert rl.last_rate_limit.retry_after == 10.0

    @pytest.mark.asyncio
    async def test_supports_async_callback(self):
        mock_logger = MagicMock()
        callback = AsyncMock(return_value=False)
        rl = RateLimiter(auto_wait=True, max_retries=5, on_rate_limit=callback, logger=mock_logger)
        response = MagicMock()
        response.status_code = 429
        response.headers = {"retry-after": "1"}
        response.text = ""

        with pytest.raises(SaucelabsRateLimitError):
            await rl.handle_response(response, AsyncMock())
        callback.assert_called_once()
