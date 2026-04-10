"""
Pytest configuration and shared fixtures for statsig_client tests.
"""

import logging
import os
from typing import Any, Optional
from unittest.mock import AsyncMock, MagicMock

import pytest

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)


@pytest.fixture
def mock_logger():
    """Fixture providing a mock logger for injection."""
    mock = MagicMock()
    mock.debug = MagicMock()
    mock.info = MagicMock()
    mock.warning = MagicMock()
    mock.error = MagicMock()
    mock.trace = MagicMock()
    return mock


@pytest.fixture
def assert_log_contains(caplog):
    """Fixture to assert log messages are present."""

    def _assert(expected_text: str, level: Optional[str] = None):
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


@pytest.fixture
def clean_env(monkeypatch):
    """Fixture to manage environment variables cleanly."""

    def set_env(**kwargs):
        for key, value in kwargs.items():
            if value is None:
                monkeypatch.delenv(key, raising=False)
            else:
                monkeypatch.setenv(key, value)

    return set_env


@pytest.fixture
def mock_response():
    """Create a mock HTTP response object."""

    def _create(status_code=200, json_data=None, text="", headers=None):
        resp = MagicMock()
        resp.status_code = status_code
        resp.headers = headers or {}
        resp.text = text
        resp.content = b"content" if (json_data is not None or text) else b""
        if json_data is not None:
            resp.json.return_value = json_data
        else:
            resp.json.side_effect = Exception("No JSON")
        return resp

    return _create


@pytest.fixture
def mock_client():
    """Create a mock StatsigClient for testing domain modules."""
    client = AsyncMock()
    client.get = AsyncMock()
    client.post = AsyncMock()
    client.put = AsyncMock()
    client.patch = AsyncMock()
    client.delete = AsyncMock()
    client.list = AsyncMock()
    client._base_url = "https://statsigapi.net/console/v1"
    return client
