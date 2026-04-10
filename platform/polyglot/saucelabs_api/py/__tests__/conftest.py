"""
Pytest configuration and shared fixtures for saucelabs_api tests.
"""

import os
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest


# Ensure silent logging during tests
os.environ.setdefault("LOG_LEVEL", "SILENT")


@pytest.fixture
def mock_logger():
    """Fixture providing a mock logger for injection."""
    mock = MagicMock()
    mock.debug = MagicMock()
    mock.info = MagicMock()
    mock.warning = MagicMock()
    mock.error = MagicMock()
    return mock


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
def mock_saucelabs_client():
    """Create a mock SaucelabsClient with all domain modules."""
    client = MagicMock()
    client.username = "test_user"
    client.close = AsyncMock()

    # Jobs module
    client.jobs = MagicMock()
    client.jobs.list = AsyncMock(return_value=[{"id": "job1", "status": "complete"}])
    client.jobs.get = AsyncMock(return_value={"id": "job1", "status": "complete", "name": "Test Job"})

    # Platform module
    client.platform = MagicMock()
    client.platform.get_status = AsyncMock(return_value={"status": {"wait_time": 0.5}})
    client.platform.get_platforms = AsyncMock(return_value=[{"os": "Windows", "api_name": "appium"}])

    # Users module
    client.users = MagicMock()
    client.users.get_user = AsyncMock(return_value={"username": "test_user", "email": "test@example.com"})
    client.users.get_concurrency = AsyncMock(return_value={"concurrency": {"remaining": {"overall": 5}}})

    # Upload module
    client.upload = MagicMock()
    client.upload.upload_app = AsyncMock(return_value={"item": {"id": "upload_123"}})

    return client
