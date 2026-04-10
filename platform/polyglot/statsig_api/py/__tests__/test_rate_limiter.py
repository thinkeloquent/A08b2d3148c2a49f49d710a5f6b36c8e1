"""
Unit tests for statsig_client.rate_limiter.

Tests cover:
- Statement coverage for RateLimiter construction and handle_response
- Decision/branch coverage for auto_wait, callback, max_retries paths
- Boundary value analysis for header parsing edge cases
- Error handling for RateLimitError raised in various conditions
- Log verification for warning and info log emission
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from statsig_client.errors import RateLimitError
from statsig_client.rate_limiter import RateLimiter
from statsig_client.types import RateLimitInfo


class TestRateLimiter:
    """Tests for the RateLimiter class."""

    class TestStatementCoverage:
        async def test_non_429_passes_through(self, mock_response, mock_logger):
            limiter = RateLimiter(logger=mock_logger)
            resp = mock_response(status_code=200)
            retry_fn = AsyncMock()

            result = await limiter.handle_response(resp, retry_fn)

            assert result is resp
            retry_fn.assert_not_called()

        async def test_429_with_auto_wait_retries(self, mock_response, mock_logger):
            limiter = RateLimiter(auto_wait=True, max_retries=3, logger=mock_logger)
            resp_429 = mock_response(
                status_code=429, headers={"retry-after": "0.01"}
            )
            resp_200 = mock_response(status_code=200, json_data={"ok": True})
            retry_fn = AsyncMock(return_value=resp_200)

            with patch("statsig_client.rate_limiter.asyncio.sleep", new_callable=AsyncMock):
                result = await limiter.handle_response(resp_429, retry_fn)

            assert result is resp_200

        async def test_last_rate_limit_updated_on_429(self, mock_response, mock_logger):
            limiter = RateLimiter(auto_wait=False, logger=mock_logger)
            resp = mock_response(
                status_code=429,
                text="rate limited",
                headers={"retry-after": "5"},
            )

            with pytest.raises(RateLimitError):
                await limiter.handle_response(resp, AsyncMock())

            assert limiter.last_rate_limit is not None
            assert limiter.last_rate_limit.retry_after == 5.0

    class TestDecisionBranchCoverage:
        async def test_auto_wait_false_raises_immediately(self, mock_response, mock_logger):
            limiter = RateLimiter(auto_wait=False, logger=mock_logger)
            resp = mock_response(
                status_code=429, text="limited", headers={"retry-after": "1"}
            )

            with pytest.raises(RateLimitError):
                await limiter.handle_response(resp, AsyncMock())

        async def test_max_retries_exceeded_raises(self, mock_response, mock_logger):
            limiter = RateLimiter(auto_wait=True, max_retries=2, logger=mock_logger)
            resp = mock_response(
                status_code=429, text="limited", headers={"retry-after": "1"}
            )

            with pytest.raises(RateLimitError):
                await limiter.handle_response(resp, AsyncMock(), retry_count=2)

        async def test_callback_returns_false_aborts(self, mock_response, mock_logger):
            callback = MagicMock(return_value=False)
            limiter = RateLimiter(
                auto_wait=True, on_rate_limit=callback, logger=mock_logger
            )
            resp = mock_response(
                status_code=429, text="limited", headers={"retry-after": "1"}
            )

            with pytest.raises(RateLimitError):
                await limiter.handle_response(resp, AsyncMock())

            callback.assert_called_once()

        async def test_async_callback_returns_false_aborts(self, mock_response, mock_logger):
            callback = AsyncMock(return_value=False)
            limiter = RateLimiter(
                auto_wait=True, on_rate_limit=callback, logger=mock_logger
            )
            resp = mock_response(
                status_code=429, text="limited", headers={"retry-after": "1"}
            )

            with pytest.raises(RateLimitError):
                await limiter.handle_response(resp, AsyncMock())

        async def test_callback_returns_true_allows_retry(self, mock_response, mock_logger):
            callback = MagicMock(return_value=True)
            limiter = RateLimiter(
                auto_wait=True, on_rate_limit=callback, logger=mock_logger
            )
            resp_429 = mock_response(
                status_code=429, headers={"retry-after": "0.01"}
            )
            resp_200 = mock_response(status_code=200, json_data={"ok": True})
            retry_fn = AsyncMock(return_value=resp_200)

            with patch("statsig_client.rate_limiter.asyncio.sleep", new_callable=AsyncMock):
                result = await limiter.handle_response(resp_429, retry_fn)

            assert result is resp_200

    class TestBoundaryValueAnalysis:
        def test_parse_retry_after_valid(self):
            assert RateLimiter._parse_retry_after({"retry-after": "5"}) == 5.0

        def test_parse_retry_after_case_insensitive(self):
            assert RateLimiter._parse_retry_after({"Retry-After": "3"}) == 3.0

        def test_parse_retry_after_below_minimum(self):
            result = RateLimiter._parse_retry_after({"retry-after": "0.01"})
            assert result >= 0.1

        def test_parse_retry_after_missing(self):
            assert RateLimiter._parse_retry_after({}) == 1.0

        def test_parse_retry_after_invalid(self):
            assert RateLimiter._parse_retry_after({"retry-after": "abc"}) == 1.0

        def test_parse_optional_int_valid(self):
            assert RateLimiter._parse_optional_int({"x-limit": "100"}, "x-limit") == 100

        def test_parse_optional_int_missing(self):
            assert RateLimiter._parse_optional_int({}, "x-limit") is None

        def test_parse_optional_int_invalid(self):
            assert RateLimiter._parse_optional_int({"x-limit": "abc"}, "x-limit") is None

    class TestLogVerification:
        async def test_logs_warning_on_429(self, mock_response, mock_logger):
            limiter = RateLimiter(auto_wait=False, logger=mock_logger)
            resp = mock_response(
                status_code=429, text="limited", headers={"retry-after": "1"}
            )

            with pytest.raises(RateLimitError):
                await limiter.handle_response(resp, AsyncMock())

            mock_logger.warning.assert_called()
            call_args = mock_logger.warning.call_args[0][0]
            assert "429" in call_args or "Rate limited" in call_args

        async def test_logs_info_before_retry(self, mock_response, mock_logger):
            limiter = RateLimiter(auto_wait=True, max_retries=3, logger=mock_logger)
            resp_429 = mock_response(
                status_code=429, headers={"retry-after": "0.01"}
            )
            resp_200 = mock_response(status_code=200)
            retry_fn = AsyncMock(return_value=resp_200)

            with patch("statsig_client.rate_limiter.asyncio.sleep", new_callable=AsyncMock):
                await limiter.handle_response(resp_429, retry_fn)

            mock_logger.info.assert_called()
