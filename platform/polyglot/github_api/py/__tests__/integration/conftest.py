"""
Integration test fixtures for FastAPI server.

Provides shared fixtures for creating test FastAPI apps with mock
GitHub clients, TestClient instances, and common response data.
"""

from __future__ import annotations

import os
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from github_api.middleware.error_handler import register_error_handlers
from github_api.routes import create_router

# Ensure a test token is available so the SDK does not raise AuthError
os.environ.setdefault("GITHUB_TOKEN", "ghp_test_token_for_unit_tests_1234567890")


# ---------------------------------------------------------------------------
# Mock factory
# ---------------------------------------------------------------------------

def create_mock_github_client(responses: dict[str, Any] | None = None) -> MagicMock:
    """Create a mock GitHubClient with predefined async method stubs.

    Args:
        responses: Optional dict to customise individual return values.

    Returns:
        A MagicMock with AsyncMock methods for get/post/put/patch/delete.
    """
    responses = responses or {}
    default_response: dict[str, Any] = {
        "id": 1,
        "name": "test-repo",
        "full_name": "testuser/test-repo",
    }

    client = MagicMock()
    client.get = AsyncMock(return_value=responses.get("get", default_response))
    client.post = AsyncMock(return_value=responses.get("post", default_response))
    client.put = AsyncMock(return_value=responses.get("put", {}))
    client.patch = AsyncMock(return_value=responses.get("patch", default_response))
    client.delete = AsyncMock(return_value=responses.get("delete", {}))
    client.get_raw = AsyncMock()
    client.get_rate_limit = AsyncMock(return_value={
        "resources": {
            "core": {"limit": 5000, "remaining": 4999, "reset": 1700000000, "used": 1},
        },
        "rate": {"limit": 5000, "remaining": 4999, "reset": 1700000000, "used": 1},
    })
    client.close = AsyncMock()
    return client


def create_test_app(mock_client: MagicMock | None = None) -> tuple[FastAPI, MagicMock]:
    """Create a FastAPI test app with mock GitHub client and all routes.

    Args:
        mock_client: Optional pre-configured mock client.

    Returns:
        Tuple of (FastAPI app, mock client).
    """
    app = FastAPI(title="Test GitHub API")

    register_error_handlers(app)
    router = create_router()
    app.include_router(router)

    client = mock_client or create_mock_github_client()
    app.state.github_client = client

    return app, client


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_github_client() -> MagicMock:
    """Provide a fresh mock GitHub client."""
    return create_mock_github_client()


@pytest.fixture
def test_app(mock_github_client: MagicMock) -> FastAPI:
    """Create test FastAPI app with mock client."""
    app, _client = create_test_app(mock_github_client)
    return app


@pytest.fixture
def client(test_app: FastAPI) -> TestClient:
    """Create a synchronous TestClient for the test app."""
    return TestClient(test_app, raise_server_exceptions=False)


@pytest.fixture
def mock_repo_response() -> dict[str, Any]:
    """Sample repository response payload."""
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
