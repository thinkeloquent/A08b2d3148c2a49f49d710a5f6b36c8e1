"""
Pytest configuration and shared fixtures for healthz_diagnostics.
"""

import os
import time
from typing import Any, Dict, List, Optional, Callable
from unittest.mock import MagicMock, AsyncMock
import pytest


@pytest.fixture
def mock_logger():
    """Fixture providing a mock logger for injection."""
    mock = MagicMock()
    mock.debug = MagicMock()
    mock.info = MagicMock()
    mock.warn = MagicMock()
    mock.error = MagicMock()
    return mock


@pytest.fixture
def capture_output():
    """Fixture to capture logger output."""
    captured: List[str] = []

    class CaptureOutput:
        @staticmethod
        def capture(message: str) -> None:
            captured.append(message)

        @staticmethod
        def get() -> List[str]:
            return captured

        @staticmethod
        def clear() -> None:
            captured.clear()

    return CaptureOutput()


@pytest.fixture
def assert_log_contains(capture_output):
    """Fixture to assert log messages contain expected text."""
    def _assert(expected_text: str, level: Optional[str] = None):
        logs = capture_output.get()
        for log in logs:
            if level and f"[{level}]" not in log:
                continue
            if expected_text in log:
                return True
        raise AssertionError(
            f"Expected log containing '{expected_text}' not found.\n"
            f"Captured logs:\n" + "\n".join(logs)
        )
    return _assert


@pytest.fixture
def clean_env(monkeypatch):
    """Fixture to manage environment variables."""
    def set_env(**kwargs):
        for key, value in kwargs.items():
            if value is None:
                monkeypatch.delenv(key, raising=False)
            else:
                monkeypatch.setenv(key, value)
    return set_env


@pytest.fixture
def mock_time(monkeypatch):
    """Fixture to mock time functions."""
    class MockTime:
        def __init__(self):
            self._current = 1705312200.0  # 2024-01-15T10:30:00Z

        def time(self):
            return self._current

        def set(self, value: float):
            self._current = value

        def advance(self, seconds: float):
            self._current += seconds

    mock = MockTime()
    monkeypatch.setattr(time, "time", mock.time)
    return mock


@pytest.fixture
def mock_http_client():
    """Fixture providing a mock HTTP client."""
    class MockResponse:
        def __init__(self, status_code: int = 200, data: Any = None):
            self.status_code = status_code
            self.data = data or {"status": "ok"}

    class MockClient:
        def __init__(self, status_code: int = 200, should_fail: bool = False, error_msg: str = ""):
            self.status_code = status_code
            self.should_fail = should_fail
            self.error_msg = error_msg
            self.get_called = False
            self.close_called = False

        async def get(self, url: str) -> MockResponse:
            self.get_called = True
            if self.should_fail:
                raise ConnectionError(self.error_msg or "Connection failed")
            return MockResponse(self.status_code)

        async def close(self) -> None:
            self.close_called = True

    return MockClient


@pytest.fixture
def mock_http_client_factory(mock_http_client):
    """Fixture providing a mock HTTP client factory."""
    def factory(config: Dict[str, Any], **kwargs):
        return mock_http_client(**kwargs)
    return factory
