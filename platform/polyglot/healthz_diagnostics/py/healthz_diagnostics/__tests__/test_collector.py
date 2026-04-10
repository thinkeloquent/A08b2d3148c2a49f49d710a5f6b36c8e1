"""
Unit tests for healthz_diagnostics.collector module.
"""

import pytest
from healthz_diagnostics.collector import DiagnosticsCollector


class TestDiagnosticsCollector:
    """Tests for DiagnosticsCollector."""

    class TestStatementCoverage:
        """Ensure every statement executes."""

        def test_push_start_records_event(self, mock_time):
            """push_start() records request:start event."""
            collector = DiagnosticsCollector()

            collector.push_start("https://api.example.com/health", "GET")

            events = collector.get_events()
            assert len(events) == 1
            assert events[0]["type"] == "request:start"

        def test_push_end_records_event(self, mock_time):
            """push_end() records request:end event."""
            collector = DiagnosticsCollector()
            collector.push_start("https://api.example.com/health", "GET")
            mock_time.advance(0.150)

            collector.push_end(200)

            events = collector.get_events()
            assert len(events) == 2
            assert events[1]["type"] == "request:end"

        def test_push_error_records_event(self, mock_time):
            """push_error() records request:error event."""
            collector = DiagnosticsCollector()
            collector.push_start("https://api.example.com/health", "GET")
            mock_time.advance(0.050)

            collector.push_error("Connection refused")

            events = collector.get_events()
            assert len(events) == 2
            assert events[1]["type"] == "request:error"

        def test_get_duration_returns_total(self, mock_time):
            """get_duration() returns total duration in seconds."""
            collector = DiagnosticsCollector()
            collector.push_start("https://api.example.com/health", "GET")
            mock_time.advance(0.250)
            collector.push_end(200)

            duration = collector.get_duration()

            assert duration == pytest.approx(0.25, rel=0.01)

    class TestBranchCoverage:
        """Test all branches."""

        def test_success_path_start_to_end(self, mock_time):
            """Success path: start -> end."""
            collector = DiagnosticsCollector()

            collector.push_start("https://api.example.com/health", "GET")
            mock_time.advance(0.100)
            collector.push_end(200)

            events = collector.get_events()
            assert events[0]["type"] == "request:start"
            assert events[1]["type"] == "request:end"

        def test_error_path_start_to_error(self, mock_time):
            """Error path: start -> error."""
            collector = DiagnosticsCollector()

            collector.push_start("https://api.example.com/health", "GET")
            mock_time.advance(0.050)
            collector.push_error("Timeout")

            events = collector.get_events()
            assert events[0]["type"] == "request:start"
            assert events[1]["type"] == "request:error"

    class TestBoundaryValues:
        """Test edge cases."""

        def test_empty_events(self):
            """Empty collector returns empty events."""
            collector = DiagnosticsCollector()

            events = collector.get_events()

            assert events == []

        def test_multiple_requests(self, mock_time):
            """Multiple start/end pairs."""
            collector = DiagnosticsCollector()

            collector.push_start("https://api1.example.com", "GET")
            mock_time.advance(0.100)
            collector.push_end(200)

            collector.push_start("https://api2.example.com", "POST")
            mock_time.advance(0.200)
            collector.push_end(201)

            events = collector.get_events()
            assert len(events) == 4

        def test_get_duration_before_any_events(self):
            """get_duration() before any events returns 0."""
            collector = DiagnosticsCollector()

            duration = collector.get_duration()

            assert duration == 0.0

    class TestEventStructure:
        """Verify event structure matches spec."""

        def test_start_event_structure(self, mock_time):
            """Start event has required fields."""
            collector = DiagnosticsCollector()

            collector.push_start("https://api.example.com/health", "GET")

            events = collector.get_events()
            event = events[0]
            assert "type" in event
            assert "timestamp" in event
            assert event["type"] == "request:start"

        def test_end_event_structure(self, mock_time):
            """End event has required fields."""
            collector = DiagnosticsCollector()
            collector.push_start("https://api.example.com/health", "GET")
            mock_time.advance(0.100)

            collector.push_end(200)

            events = collector.get_events()
            event = events[1]
            assert "type" in event
            assert "timestamp" in event
            assert "status" in event
            assert event["status"] == 200

        def test_error_event_structure(self, mock_time):
            """Error event has required fields."""
            collector = DiagnosticsCollector()
            collector.push_start("https://api.example.com/health", "GET")
            mock_time.advance(0.050)

            collector.push_error("Connection failed")

            events = collector.get_events()
            event = events[1]
            assert "type" in event
            assert "timestamp" in event
            assert "error" in event
            assert event["error"] == "Connection failed"
