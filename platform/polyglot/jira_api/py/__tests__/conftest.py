"""
Pytest configuration and shared fixtures for jira_api tests.
"""

import logging
import os
from typing import Optional
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from jira_api.config import JiraConfig

# Ensure silent logging during tests
os.environ.setdefault("LOG_LEVEL", "SILENT")

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
    mock.critical = MagicMock()
    return mock


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
    """Fixture to manage environment variables cleanly."""
    def set_env(**kwargs):
        for key, value in kwargs.items():
            if value is None:
                monkeypatch.delenv(key, raising=False)
            else:
                monkeypatch.setenv(key, value)
    return set_env


@pytest.fixture
def test_jira_config():
    """Create a test Jira configuration."""
    return JiraConfig(
        base_url="https://test.atlassian.net",
        email="test@example.com",
        api_token="test-api-token-1234567890",
    )


@pytest.fixture
def mock_jira_client():
    """Create a mock JiraClient with all methods mocked."""
    client = MagicMock()
    client.base_url = "https://test.atlassian.net/rest/api/3/"
    client.email = "test@example.com"
    client.close = MagicMock()

    # User methods
    client.get_user = MagicMock(return_value=MagicMock(
        account_id="acc123", display_name="Test User",
        email_address="test@example.com", active=True,
    ))
    client.search_users = MagicMock(return_value=[])
    client.find_assignable_users = MagicMock(return_value=[])

    # Issue methods
    client.get_issue = MagicMock()
    client.create_issue = MagicMock()
    client.update_issue = MagicMock()
    client.assign_issue = MagicMock()
    client.get_issue_transitions = MagicMock(return_value=[])
    client.transition_issue = MagicMock()

    # Project methods
    client.get_project = MagicMock()
    client.get_project_versions = MagicMock(return_value=[])
    client.create_project_version = MagicMock()
    client.get_issue_types = MagicMock(return_value=[])
    client.get_project_issue_types = MagicMock(return_value=[])
    client.get_issue_type_id_by_name = MagicMock(return_value="10001")

    return client


@pytest.fixture
def test_app(test_jira_config):
    """Create a test FastAPI app with mocked Jira client."""
    with patch("jira_api.server.get_config", return_value=test_jira_config):
        with patch("jira_api.server.get_jira_client") as mock_get_client:
            from jira_api.server import app
            yield app, mock_get_client


@pytest.fixture
def api_client(test_app):
    """Synchronous test client for FastAPI."""
    app, _ = test_app
    return TestClient(app)
