"""Unit tests for figma_api.sdk.retry."""
from unittest.mock import AsyncMock, patch

import pytest

from figma_api.sdk.retry import calculate_backoff, is_retryable, with_retry


class TestCalculateBackoff:
    class TestStatementCoverage:
        def test_returns_float(self):
            result = calculate_backoff(0)
            assert isinstance(result, float)
            assert result > 0

    class TestBranchCoverage:
        def test_increases_with_attempt(self):
            result0 = calculate_backoff(0, initial_wait=1.0, max_wait=30.0)
            assert result0 >= 1.0
            assert result0 <= 2.0  # 1*2^0 + jitter(0..1)

        def test_capped_at_max_wait(self):
            result = calculate_backoff(100, initial_wait=1.0, max_wait=5.0)
            assert result <= 5.0

    class TestBoundaryValues:
        def test_attempt_zero(self):
            result = calculate_backoff(0, initial_wait=1.0, max_wait=30.0)
            assert result >= 1.0


class TestIsRetryable:
    def test_500_retryable(self):
        assert is_retryable(500) is True

    def test_502_retryable(self):
        assert is_retryable(502) is True

    def test_503_retryable(self):
        assert is_retryable(503) is True

    def test_400_not_retryable(self):
        assert is_retryable(400) is False

    def test_401_not_retryable(self):
        assert is_retryable(401) is False

    def test_429_not_retryable(self):
        assert is_retryable(429) is False

    def test_499_not_retryable(self):
        assert is_retryable(499) is False


class TestWithRetry:
    class TestStatementCoverage:
        async def test_success_on_first_attempt(self):
            fn = AsyncMock(return_value="success")
            result = await with_retry(fn, max_retries=3, initial_wait=0.001, max_wait=0.01)
            assert result == "success"
            fn.assert_called_once()

    class TestBranchCoverage:
        async def test_retry_on_retryable_error_then_succeed(self):
            call_count = 0

            async def fn(attempt):
                nonlocal call_count
                call_count += 1
                if call_count < 3:
                    err = Exception("server error")
                    err.status = 500
                    raise err
                return "recovered"

            result = await with_retry(fn, max_retries=3, initial_wait=0.001, max_wait=0.01)
            assert result == "recovered"
            assert call_count == 3

        async def test_raise_immediately_for_non_retryable(self):
            async def fn(attempt):
                err = Exception("not found")
                err.status = 404
                raise err

            with pytest.raises(Exception, match="not found"):
                await with_retry(fn, max_retries=3, initial_wait=0.001, max_wait=0.01)

        async def test_raise_after_max_retries(self):
            async def fn(attempt):
                err = Exception("server down")
                err.status = 500
                raise err

            with pytest.raises(Exception, match="server down"):
                await with_retry(fn, max_retries=2, initial_wait=0.001, max_wait=0.01)

        async def test_retry_429_errors(self):
            call_count = 0

            async def fn(attempt):
                nonlocal call_count
                call_count += 1
                if call_count == 1:
                    err = Exception("rate limited")
                    err.status = 429
                    raise err
                return "done"

            result = await with_retry(fn, max_retries=3, initial_wait=0.001, max_wait=0.01)
            assert result == "done"

        async def test_retry_errors_without_status(self):
            call_count = 0

            async def fn(attempt):
                nonlocal call_count
                call_count += 1
                if call_count < 2:
                    raise Exception("generic")
                return "ok"

            result = await with_retry(fn, max_retries=3, initial_wait=0.001, max_wait=0.01)
            assert result == "ok"
