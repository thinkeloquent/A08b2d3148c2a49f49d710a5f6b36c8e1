"""
Pytest configuration and shared fixtures for confluence_api tests.
"""

import os
from typing import Any, Optional
from unittest.mock import AsyncMock, MagicMock

import pytest


@pytest.fixture
def mock_client():
    """Fixture providing a mock ConfluenceClient with all HTTP methods."""
    client = MagicMock()
    client.get = MagicMock(return_value={"results": [], "size": 0, "start": 0, "limit": 25})
    client.post = MagicMock(return_value={"id": "123", "title": "Test"})
    client.put = MagicMock(return_value={"id": "123", "title": "Updated"})
    client.delete = MagicMock(return_value=None)
    client.patch = MagicMock(return_value={"id": "123"})
    client.get_raw = MagicMock(return_value=b"binary-data")
    return client


@pytest.fixture
def mock_async_client():
    """Fixture providing an async mock ConfluenceClient."""
    client = MagicMock()
    client.get = AsyncMock(return_value={"results": [], "size": 0, "start": 0, "limit": 25})
    client.post = AsyncMock(return_value={"id": "123", "title": "Test"})
    client.put = AsyncMock(return_value={"id": "123", "title": "Updated"})
    client.delete = AsyncMock(return_value=None)
    client.patch = AsyncMock(return_value={"id": "123"})
    client.get_raw = AsyncMock(return_value=b"binary-data")
    return client


@pytest.fixture
def assert_log_contains(caplog):
    """Fixture to assert log messages are present."""

    def _assert(expected_text: str, level: str | None = None):
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
    """Fixture to manage environment variables for config tests."""
    env_keys = [
        "CONFLUENCE_BASE_URL",
        "CONFLUENCE_USERNAME",
        "CONFLUENCE_API_TOKEN",
        "LOG_LEVEL",
    ]
    for key in env_keys:
        monkeypatch.delenv(key, raising=False)

    def set_env(**kwargs):
        for key, value in kwargs.items():
            if value is None:
                monkeypatch.delenv(key, raising=False)
            else:
                monkeypatch.setenv(key, value)

    return set_env


@pytest.fixture
def confluence_env(monkeypatch):
    """Fixture that sets complete Confluence environment variables."""
    monkeypatch.setenv("CONFLUENCE_BASE_URL", "https://confluence.example.com")
    monkeypatch.setenv("CONFLUENCE_USERNAME", "admin")
    monkeypatch.setenv("CONFLUENCE_API_TOKEN", "test-token-123")
