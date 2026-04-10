"""
Shared test fixtures for the GitHub API SDK test suite.

Provides mock GitHub clients, FastAPI test clients, and common
mock response data for use across all test modules.
"""

from __future__ import annotations

import os
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

# Ensure a test token is available so the SDK does not raise AuthError
os.environ.setdefault("GITHUB_TOKEN", "ghp_test_token_for_unit_tests_1234567890")


@pytest.fixture
def mock_github_client() -> MagicMock:
    """Create a mock GitHubClient with async method stubs.

    Returns:
        A MagicMock with AsyncMock methods for get/post/put/patch/delete.
    """
    client = MagicMock()
    client.get = AsyncMock(return_value={})
    client.post = AsyncMock(return_value={})
    client.put = AsyncMock(return_value={})
    client.patch = AsyncMock(return_value={})
    client.delete = AsyncMock(return_value={})
    client.get_raw = AsyncMock()
    client.get_rate_limit = AsyncMock(return_value={
        "resources": {
            "core": {"limit": 5000, "remaining": 4999, "reset": 1700000000, "used": 1},
        },
        "rate": {"limit": 5000, "remaining": 4999, "reset": 1700000000, "used": 1},
    })
    client.close = AsyncMock()
    return client


@pytest.fixture
def app(mock_github_client: MagicMock) -> Any:
    """Create a FastAPI test application with a mock GitHub client.

    Args:
        mock_github_client: The mocked GitHubClient.

    Returns:
        A configured FastAPI app instance for testing.
    """
    from github_api.config import Config
    from github_api.server import create_app

    config = Config(
        github_token="ghp_test_token_for_unit_tests_1234567890",
        log_level="DEBUG",
    )
    test_app = create_app(config)
    # Override the client with our mock
    test_app.state.github_client = mock_github_client
    return test_app


@pytest.fixture
def test_client(app: Any) -> TestClient:
    """Create a FastAPI TestClient.

    Args:
        app: The FastAPI application.

    Returns:
        A TestClient for making HTTP requests.
    """
    return TestClient(app, raise_server_exceptions=False)


@pytest.fixture
def mock_repo_response() -> dict[str, Any]:
    """Sample repository response data."""
    return {
        "id": 1,
        "node_id": "MDEwOlJlcG9zaXRvcnkx",
        "name": "Hello-World",
        "full_name": "octocat/Hello-World",
        "description": "A test repository",
        "private": False,
        "fork": False,
        "html_url": "https://github.com/octocat/Hello-World",
        "clone_url": "https://github.com/octocat/Hello-World.git",
        "ssh_url": "git@github.com:octocat/Hello-World.git",
        "default_branch": "main",
        "language": "Python",
        "stargazers_count": 100,
        "forks_count": 50,
        "open_issues_count": 10,
        "archived": False,
        "disabled": False,
        "visibility": "public",
        "owner": {
            "login": "octocat",
            "id": 1,
            "type": "User",
        },
        "topics": ["python", "api"],
    }


@pytest.fixture
def mock_rate_limit_headers() -> dict[str, str]:
    """Sample rate limit response headers."""
    return {
        "x-ratelimit-limit": "5000",
        "x-ratelimit-remaining": "4999",
        "x-ratelimit-reset": "1700000000",
        "x-ratelimit-used": "1",
        "x-ratelimit-resource": "core",
        "x-github-request-id": "ABCD-1234-EFGH-5678",
    }
