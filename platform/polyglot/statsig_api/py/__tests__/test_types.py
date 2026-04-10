"""
Unit tests for statsig_client.types.

Tests cover:
- Statement coverage for dataclass construction
- Boundary value analysis for defaults and edge cases
"""

from statsig_client.types import (
    DEFAULT_BASE_URL,
    DEFAULT_TIMEOUT,
    RateLimitInfo,
    StatsigClientOptions,
)


class TestRateLimitInfo:
    """Tests for the RateLimitInfo frozen dataclass."""

    class TestStatementCoverage:
        def test_create_with_all_fields(self):
            info = RateLimitInfo(
                retry_after=5.0,
                remaining=95,
                limit=100,
                reset_at="2025-01-01T00:00:00Z",
                timestamp="2025-01-01T00:00:00Z",
            )
            assert info.retry_after == 5.0
            assert info.remaining == 95
            assert info.limit == 100
            assert info.reset_at == "2025-01-01T00:00:00Z"

        def test_create_with_defaults(self):
            info = RateLimitInfo(retry_after=1.0)
            assert info.retry_after == 1.0
            assert info.remaining is None
            assert info.limit is None
            assert info.reset_at is None
            assert info.timestamp == ""

    class TestBoundaryValueAnalysis:
        def test_zero_retry_after(self):
            info = RateLimitInfo(retry_after=0.0)
            assert info.retry_after == 0.0

        def test_frozen_immutability(self):
            info = RateLimitInfo(retry_after=1.0)
            import pytest

            with pytest.raises(AttributeError):
                info.retry_after = 2.0


class TestStatsigClientOptions:
    """Tests for the StatsigClientOptions dataclass."""

    class TestStatementCoverage:
        def test_create_with_defaults(self):
            opts = StatsigClientOptions()
            assert opts.api_key is None
            assert opts.base_url == DEFAULT_BASE_URL
            assert opts.rate_limit_auto_wait is True
            assert opts.rate_limit_threshold == 0
            assert opts.on_rate_limit is None
            assert opts.logger is None
            assert opts.timeout == DEFAULT_TIMEOUT
            assert opts.proxy is None
            assert opts.verify_ssl is True

        def test_create_with_custom_values(self):
            opts = StatsigClientOptions(
                api_key="test-key",
                base_url="https://custom.api.com",
                timeout=60.0,
                verify_ssl=False,
            )
            assert opts.api_key == "test-key"
            assert opts.base_url == "https://custom.api.com"
            assert opts.timeout == 60.0
            assert opts.verify_ssl is False


class TestConstants:
    """Tests for module-level constants."""

    def test_default_base_url(self):
        assert DEFAULT_BASE_URL == "https://statsigapi.net/console/v1"

    def test_default_timeout(self):
        assert DEFAULT_TIMEOUT == 30.0
