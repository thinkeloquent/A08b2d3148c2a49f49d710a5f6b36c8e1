"""
Unit tests for healthz_diagnostics.latency module.
"""

import pytest
from healthz_diagnostics.latency import LatencyCalculator


class TestLatencyCalculator:
    """Tests for LatencyCalculator."""

    class TestStatementCoverage:
        """Ensure every statement executes."""

        def test_start_captures_timestamp(self, mock_time):
            """start() captures current time."""
            calc = LatencyCalculator()

            calc.start()

            assert calc._start_time is not None

        def test_stop_captures_timestamp(self, mock_time):
            """stop() captures end time."""
            calc = LatencyCalculator()
            calc.start()
            mock_time.advance(0.1)

            calc.stop()

            assert calc._end_time is not None

        def test_get_ms_returns_duration(self, mock_time):
            """get_ms() returns milliseconds with 2 decimal precision."""
            calc = LatencyCalculator()
            calc.start()
            mock_time.advance(0.145)  # 145ms
            calc.stop()

            result = calc.get_ms()

            assert result == 145.0

        def test_get_seconds_returns_duration(self, mock_time):
            """get_seconds() returns duration in seconds."""
            calc = LatencyCalculator()
            calc.start()
            mock_time.advance(1.5)
            calc.stop()

            result = calc.get_seconds()

            assert result == 1.5

    class TestBranchCoverage:
        """Test all branches."""

        def test_get_ms_before_stop_uses_current_time(self, mock_time):
            """get_ms() before stop() uses current time."""
            calc = LatencyCalculator()
            calc.start()
            mock_time.advance(0.100)

            result = calc.get_ms()

            assert result == 100.0

        def test_get_ms_before_start_returns_zero(self):
            """get_ms() before start() returns 0.0."""
            calc = LatencyCalculator()

            result = calc.get_ms()

            assert result == 0.0

    class TestBoundaryValues:
        """Test edge cases."""

        def test_zero_duration(self, mock_time):
            """Zero duration when start and stop at same time."""
            calc = LatencyCalculator()
            calc.start()
            calc.stop()

            result = calc.get_ms()

            assert result == 0.0

        def test_very_small_duration(self, mock_time):
            """Very small duration (1ms)."""
            calc = LatencyCalculator()
            calc.start()
            mock_time.advance(0.001)
            calc.stop()

            result = calc.get_ms()

            assert result == 1.0

        def test_very_large_duration(self, mock_time):
            """Very large duration (1 hour)."""
            calc = LatencyCalculator()
            calc.start()
            mock_time.advance(3600)
            calc.stop()

            result = calc.get_ms()

            assert result == 3600000.0

    class TestParityVectors:
        """Cross-language parity tests."""

        @pytest.mark.parametrize("duration_sec,expected_ms", [
            (0.145, 145.0),
            (0.001, 1.0),
            (1.0, 1000.0),
            (0.0005, 0.5),
            (0.1234, 123.4),
        ])
        def test_precision_parity(self, mock_time, duration_sec, expected_ms):
            """Verify 2 decimal precision parity."""
            calc = LatencyCalculator()
            calc.start()
            mock_time.advance(duration_sec)
            calc.stop()

            result = calc.get_ms()

            assert result == expected_ms
