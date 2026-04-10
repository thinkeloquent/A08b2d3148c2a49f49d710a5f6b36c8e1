"""Integration tests for jira_api.server (FastAPI)."""

from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from jira_api.config import JiraConfig
from jira_api.exceptions import JiraAuthenticationError, JiraNotFoundError


@pytest.fixture
def mock_client():
    """Create a mock JiraClient for server integration tests."""
    client = MagicMock()
    client.__enter__ = MagicMock(return_value=client)
    client.__exit__ = MagicMock(return_value=False)
    client.base_url = "https://test.atlassian.net/rest/api/3/"
    return client


@pytest.fixture
def server_client(mock_client):
    """Create a TestClient with mocked JiraClient."""
    test_config = JiraConfig(
        base_url="https://test.atlassian.net",
        email="test@example.com",
        api_token="test-token",
    )
    with patch("jira_api.server.get_config", return_value=test_config):
        with patch("jira_api.server.get_jira_client", return_value=mock_client):
            from jira_api.server import app
            yield TestClient(app), mock_client


class TestHealthEndpoint:
    class TestStatementCoverage:
        def test_health_returns_200(self, server_client):
            client, _ = server_client
            resp = client.get("/health")
            assert resp.status_code == 200
            data = resp.json()
            assert data["status"] == "healthy"
            assert data["service"] == "jira-api-server"


class TestUserEndpoints:
    class TestStatementCoverage:
        def test_search_users(self, server_client):
            client, mock = server_client
            mock.search_users = MagicMock(return_value=[
                MagicMock(
                    account_id="acc1", display_name="User 1",
                    email_address="u1@test.com", active=True,
                    avatar_urls=None, time_zone=None, locale=None,
                    model_dump=MagicMock(return_value={
                        "accountId": "acc1", "displayName": "User 1",
                        "emailAddress": "u1@test.com", "active": True,
                    }),
                ),
            ])
            with patch("jira_api.server.UserService") as MockSvc:
                MockSvc.return_value.search_users.return_value = mock.search_users()
                resp = client.get("/users/search?query=test")
            assert resp.status_code == 200

    class TestErrorHandling:
        def test_search_users_jira_error(self, server_client):
            api_client, _ = server_client
            with patch("jira_api.server.UserService") as MockSvc:
                MockSvc.return_value.search_users.side_effect = JiraAuthenticationError("bad creds")
                with patch("jira_api.server.get_jira_client") as mock_get:
                    ctx = MagicMock()
                    ctx.__enter__ = MagicMock(return_value=ctx)
                    ctx.__exit__ = MagicMock(return_value=False)
                    mock_get.return_value = ctx
                    resp = api_client.get("/users/search?query=test")
            assert resp.status_code == 401


class TestIssueEndpoints:
    class TestStatementCoverage:
        def test_get_issue(self, server_client):
            api_client, _ = server_client
            mock_issue = MagicMock()
            mock_issue.model_dump = MagicMock(return_value={
                "id": "1", "key": "PROJ-1", "self": "https://test.atlassian.net/rest/api/3/issue/1",
                "fields": {
                    "summary": "Test", "issuetype": {"id": "1", "name": "Bug", "description": ""},
                    "project": {"id": "1", "key": "PROJ", "name": "Project"},
                    "status": {"id": "1", "name": "Open", "description": ""},
                    "labels": [],
                },
            })
            with patch("jira_api.server.IssueService") as MockSvc:
                MockSvc.return_value.get_issue.return_value = mock_issue
                with patch("jira_api.server.get_jira_client") as mock_get:
                    ctx = MagicMock()
                    ctx.__enter__ = MagicMock(return_value=ctx)
                    ctx.__exit__ = MagicMock(return_value=False)
                    mock_get.return_value = ctx
                    resp = api_client.get("/issues/PROJ-1")
            assert resp.status_code == 200


class TestProjectEndpoints:
    class TestStatementCoverage:
        def test_get_project(self, server_client):
            api_client, _ = server_client
            mock_project = MagicMock()
            mock_project.model_dump = MagicMock(return_value={
                "id": "1", "key": "PROJ", "name": "Project",
            })
            with patch("jira_api.server.ProjectService") as MockSvc:
                MockSvc.return_value.get_project.return_value = mock_project
                with patch("jira_api.server.get_jira_client") as mock_get:
                    ctx = MagicMock()
                    ctx.__enter__ = MagicMock(return_value=ctx)
                    ctx.__exit__ = MagicMock(return_value=False)
                    mock_get.return_value = ctx
                    resp = api_client.get("/projects/PROJ")
            assert resp.status_code == 200


class TestAuthMiddleware:
    class TestStatementCoverage:
        def test_no_api_key_allows_access(self, server_client):
            client, _ = server_client
            resp = client.get("/health")
            assert resp.status_code == 200

    class TestBranchCoverage:
        def test_invalid_api_key_rejected(self):
            """When SERVER_API_KEY is set, invalid creds return 401."""
            import os
            with patch.dict(os.environ, {"SERVER_API_KEY": "valid_key"}):
                test_config = JiraConfig(
                    base_url="https://test.atlassian.net",
                    email="test@example.com",
                    api_token="test-token",
                )
                with patch("jira_api.server.get_config", return_value=test_config):
                    with patch("jira_api.server.settings") as mock_settings:
                        mock_settings.server_api_key = "valid_key"
                        from jira_api.server import app
                        client = TestClient(app)
                        resp = client.get("/users/search?query=test",
                                          auth=("wrong_key", ""))
                        assert resp.status_code == 401
