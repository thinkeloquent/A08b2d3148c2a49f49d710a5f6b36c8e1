"""
Unit tests for healthz_diagnostics.timestamp module.
"""

import pytest
from healthz_diagnostics.timestamp import TimestampFormatter


class TestTimestampFormatter:
    """Tests for TimestampFormatter."""

    class TestStatementCoverage:
        """Ensure every statement executes."""

        def test_format_returns_string(self):
            """format() returns ISO8601 string."""
            formatter = TimestampFormatter()

            result = formatter.format()

            assert isinstance(result, str)
            assert result.endswith("Z")

        def test_format_from_epoch_returns_string(self):
            """format_from_epoch() returns ISO8601 string."""
            formatter = TimestampFormatter()

            result = formatter.format_from_epoch(1705312200.0)

            assert result == "2024-01-15T10:30:00Z"

    class TestBoundaryValues:
        """Test edge cases."""

        def test_epoch_zero(self):
            """Epoch 0 (Unix epoch start)."""
            formatter = TimestampFormatter()

            result = formatter.format_from_epoch(0)

            assert result == "1970-01-01T00:00:00Z"

        def test_large_epoch(self):
            """Large epoch value (year 2100)."""
            formatter = TimestampFormatter()
            # 2100-01-01T00:00:00Z
            result = formatter.format_from_epoch(4102444800.0)

            assert result == "2100-01-01T00:00:00Z"

        def test_fractional_seconds_truncated(self):
            """Fractional seconds should be truncated, not rounded."""
            formatter = TimestampFormatter()

            # 10:30:00.999 should become 10:30:00
            result = formatter.format_from_epoch(1705312200.999)

            assert result == "2024-01-15T10:30:00Z"

    class TestParityVectors:
        """Cross-language parity tests."""

        @pytest.mark.parametrize("epoch,expected", [
            (1705312200.0, "2024-01-15T10:30:00Z"),
            (0, "1970-01-01T00:00:00Z"),
            (1609459200.0, "2021-01-01T00:00:00Z"),
            (1735689600.0, "2025-01-01T00:00:00Z"),
            (946684800.0, "2000-01-01T00:00:00Z"),
        ])
        def test_parity_vector(self, epoch, expected):
            """Verify parity with Node.js implementation."""
            formatter = TimestampFormatter()

            result = formatter.format_from_epoch(epoch)

            assert result == expected
