"""
Pytest configuration and shared fixtures for cache_json_awss3_storage tests.

Provides:
- Mock S3 client fixtures
- Mock logger fixtures for log verification
- FastAPI test client fixtures
- Helper assertions for log checking
"""

from __future__ import annotations

import logging
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest

from cache_json_awss3_storage import NullLogger

# Configure logging for tests
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)


@pytest.fixture
def mock_s3_client() -> MagicMock:
    """Fixture providing a mock S3 client for unit tests."""
    client = MagicMock()
    client.put_object = AsyncMock(return_value={"ETag": '"abc123"'})
    client.get_object = AsyncMock()
    client.delete_object = AsyncMock(return_value={})
    client.head_object = AsyncMock(return_value={})
    client.list_objects_v2 = AsyncMock(
        return_value={"Contents": [], "IsTruncated": False}
    )
    client.delete_objects = AsyncMock(return_value={"Deleted": []})
    return client


@pytest.fixture
def null_logger() -> NullLogger:
    """Fixture providing a null logger that suppresses all output."""
    return NullLogger()


@pytest.fixture
def mock_logger() -> MagicMock:
    """Fixture providing a mock logger for log verification."""
    mock = MagicMock()
    mock.debug = MagicMock()
    mock.info = MagicMock()
    mock.warn = MagicMock()
    mock.error = MagicMock()
    return mock


@pytest.fixture
def log_capture() -> dict[str, list[str]]:
    """Fixture providing a dict to capture log messages."""
    return {"debug": [], "info": [], "warn": [], "error": []}


@pytest.fixture
def capturing_logger(log_capture: dict[str, list[str]]) -> MagicMock:
    """Fixture providing a logger that captures messages for verification."""
    mock = MagicMock()
    mock.debug = MagicMock(side_effect=lambda msg: log_capture["debug"].append(msg))
    mock.info = MagicMock(side_effect=lambda msg: log_capture["info"].append(msg))
    mock.warn = MagicMock(side_effect=lambda msg: log_capture["warn"].append(msg))
    mock.error = MagicMock(side_effect=lambda msg: log_capture["error"].append(msg))
    return mock


@pytest.fixture
def assert_log_contains(caplog: pytest.LogCaptureFixture):
    """Fixture to assert log messages are present in caplog."""

    def _assert(expected_text: str, level: str | None = None) -> bool:
        for record in caplog.records:
            if level and record.levelname != level.upper():
                continue
            if expected_text in record.message:
                return True

        all_messages = [f"[{r.levelname}] {r.message}" for r in caplog.records]
        raise AssertionError(
            f"Expected log containing '{expected_text}' not found.\n"
            f"Captured logs:\n" + "\n".join(all_messages)
        )

    return _assert


def expect_log_contains(
    log_capture: dict[str, list[str]], level: str, text: str
) -> bool:
    """Helper to verify log messages contain expected text."""
    messages = log_capture.get(level, [])
    found = any(text in msg for msg in messages)
    if not found:
        raise AssertionError(
            f"Expected log '{text}' in {level} logs not found.\n"
            f"Captured {level} logs: {messages}"
        )
    return True


@pytest.fixture
def sample_data() -> dict[str, Any]:
    """Fixture providing sample data for tests."""
    return {"user_id": 123, "name": "Alice", "email": "alice@example.com"}


@pytest.fixture
def sample_entry() -> dict[str, Any]:
    """Fixture providing a complete storage entry."""
    import time

    return {
        "key": "abc123def456",
        "data": {"user_id": 123, "name": "Alice"},
        "created_at": time.time(),
        "expires_at": None,
    }


@pytest.fixture
def expired_entry() -> dict[str, Any]:
    """Fixture providing an expired storage entry."""
    import time

    return {
        "key": "expired123",
        "data": {"test": "data"},
        "created_at": time.time() - 7200,  # 2 hours ago
        "expires_at": time.time() - 3600,  # Expired 1 hour ago
    }
