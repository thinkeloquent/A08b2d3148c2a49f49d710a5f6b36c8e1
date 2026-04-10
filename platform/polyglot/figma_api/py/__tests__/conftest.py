"""
Pytest configuration and shared fixtures for Figma API SDK tests.
"""
import logging
import os
from typing import Optional
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from figma_api.config import Config

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
    mock.warn = MagicMock()
    mock.warning = MagicMock()
    mock.error = MagicMock()
    mock.trace = MagicMock()
    mock.critical = MagicMock()
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
def test_config():
    """Create a test configuration."""
    return Config(
        figma_token="test-token-1234567890",
        base_url="https://api.figma.com",
        log_level="DEBUG",
        port=8000,
        host="127.0.0.1",
    )


@pytest.fixture
def test_app(test_config):
    """Create a test FastAPI app with mocked Figma client."""
    with patch("figma_api.server.FigmaClient") as MockClient:
        mock_client_instance = AsyncMock()
        mock_client_instance.close = AsyncMock()
        MockClient.return_value = mock_client_instance

        from figma_api.server import create_app
        app = create_app(test_config)
        yield app


@pytest.fixture
def client(test_app):
    """Synchronous test client for FastAPI."""
    return TestClient(test_app)
