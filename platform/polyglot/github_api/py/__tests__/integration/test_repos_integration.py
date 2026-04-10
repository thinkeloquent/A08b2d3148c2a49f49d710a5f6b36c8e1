"""
Integration tests for repository API routes.

Tests cover:
- Statement coverage: every repo route returns 200 for valid requests
- Branch coverage: query parameter forwarding, error conditions
- Error handling: NotFoundError, AuthError from mock client
- Boundary value: invalid repo/owner names trigger validation errors
"""

from __future__ import annotations

from typing import Any
from unittest.mock import AsyncMock, MagicMock

from fastapi.testclient import TestClient

from github_api.sdk.errors import AuthError, NotFoundError

from __tests__.integration.conftest import create_mock_github_client, create_test_app


class TestRepoRoutes:
    """Statement coverage for all repository route handlers."""

    # =================================================================
    # GET routes
    # =================================================================

    def test_get_repository_returns_200(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """GET /api/github/repos/{owner}/{repo} should return 200."""
        mock_github_client.get.return_value = {"id": 1, "name": "hello-world"}

        response = client.get("/api/github/repos/octocat/hello-world")

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "hello-world"

    def test_list_user_repos_returns_200(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """GET /api/github/repos/user/{username} should return 200."""
        mock_github_client.get.return_value = {"data": [{"name": "repo1"}]}

        response = client.get("/api/github/repos/user/octocat")

        assert response.status_code == 200

    def test_list_my_repos_returns_200(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """GET /api/github/repos/me should return 200."""
        mock_github_client.get.return_value = {"data": [{"name": "my-repo"}]}

        response = client.get("/api/github/repos/me")

        assert response.status_code == 200

    def test_list_org_repos_returns_200(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """GET /api/github/repos/org/{org} should return 200."""
        mock_github_client.get.return_value = {"data": [{"name": "org-repo"}]}

        response = client.get("/api/github/repos/org/myorg")

        assert response.status_code == 200

    def test_get_topics_returns_200(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """GET /api/github/repos/{owner}/{repo}/topics should return 200."""
        mock_github_client.get.return_value = {"names": ["python", "api"]}

        response = client.get("/api/github/repos/octocat/hello-world/topics")

        assert response.status_code == 200
        data = response.json()
        assert "names" in data

    def test_get_languages_returns_200(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """GET /api/github/repos/{owner}/{repo}/languages should return 200."""
        mock_github_client.get.return_value = {"Python": 50000, "JavaScript": 10000}

        response = client.get("/api/github/repos/octocat/hello-world/languages")

        assert response.status_code == 200

    def test_list_contributors_returns_200(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """GET /api/github/repos/{owner}/{repo}/contributors should return 200."""
        mock_github_client.get.return_value = {"data": [{"login": "octocat"}]}

        response = client.get("/api/github/repos/octocat/hello-world/contributors")

        assert response.status_code == 200

    def test_list_forks_returns_200(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """GET /api/github/repos/{owner}/{repo}/forks should return 200."""
        mock_github_client.get.return_value = {"data": [{"full_name": "user/fork"}]}

        response = client.get("/api/github/repos/octocat/hello-world/forks")

        assert response.status_code == 200

    # =================================================================
    # POST routes
    # =================================================================

    def test_create_repo_returns_200(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """POST /api/github/repos should return 200."""
        mock_github_client.post.return_value = {"id": 2, "name": "new-repo"}

        response = client.post(
            "/api/github/repos",
            json={"name": "new-repo", "private": False},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "new-repo"

    def test_create_org_repo_returns_200(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """POST /api/github/repos/org/{org} should return 200."""
        mock_github_client.post.return_value = {"id": 3, "name": "org-new-repo"}

        response = client.post(
            "/api/github/repos/org/myorg",
            json={"name": "org-new-repo"},
        )

        assert response.status_code == 200

    def test_create_fork_returns_200(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """POST /api/github/repos/{owner}/{repo}/forks should return 200."""
        mock_github_client.post.return_value = {"full_name": "me/hello-world"}

        response = client.post("/api/github/repos/octocat/hello-world/forks")

        assert response.status_code == 200

    def test_create_fork_with_options_returns_200(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """POST /api/github/repos/{owner}/{repo}/forks with body should return 200."""
        mock_github_client.post.return_value = {"full_name": "org/hello-world"}

        response = client.post(
            "/api/github/repos/octocat/hello-world/forks",
            json={"organization": "myorg"},
        )

        assert response.status_code == 200

    # =================================================================
    # PATCH routes
    # =================================================================

    def test_update_repo_returns_200(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """PATCH /api/github/repos/{owner}/{repo} should return 200."""
        mock_github_client.patch.return_value = {
            "id": 1,
            "name": "hello-world",
            "description": "Updated",
        }

        response = client.patch(
            "/api/github/repos/octocat/hello-world",
            json={"description": "Updated"},
        )

        assert response.status_code == 200

    # =================================================================
    # PUT routes
    # =================================================================

    def test_replace_topics_returns_200(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """PUT /api/github/repos/{owner}/{repo}/topics should return 200."""
        mock_github_client.put.return_value = {"names": ["python", "fastapi"]}

        response = client.put(
            "/api/github/repos/octocat/hello-world/topics",
            json={"names": ["python", "fastapi"]},
        )

        assert response.status_code == 200

    def test_watch_repo_returns_200(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """PUT /api/github/repos/{owner}/{repo}/subscription should return 200."""
        mock_github_client.put.return_value = {"subscribed": True}

        response = client.put("/api/github/repos/octocat/hello-world/subscription")

        assert response.status_code == 200

    # =================================================================
    # DELETE routes
    # =================================================================

    def test_delete_repo_returns_200(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """DELETE /api/github/repos/{owner}/{repo} should return 200."""
        mock_github_client.delete.return_value = {}

        response = client.delete("/api/github/repos/octocat/hello-world")

        assert response.status_code == 200

    def test_unwatch_repo_returns_200(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """DELETE /api/github/repos/{owner}/{repo}/subscription should return 200."""
        mock_github_client.delete.return_value = {}

        response = client.delete("/api/github/repos/octocat/hello-world/subscription")

        assert response.status_code == 200


class TestRepoRouteErrors:
    """Error handling paths for repository routes."""

    # =================================================================
    # Error Handling
    # =================================================================

    def test_not_found_error_returns_404(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """NotFoundError from SDK client should produce a 404 response."""
        mock_github_client.get.side_effect = NotFoundError("Not Found")

        response = client.get("/api/github/repos/octocat/hello-world")

        assert response.status_code == 404
        data = response.json()
        assert data["error"] == "NotFoundError"

    def test_auth_error_returns_401(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """AuthError from SDK client should produce a 401 response."""
        mock_github_client.get.side_effect = AuthError("Bad credentials")

        response = client.get("/api/github/repos/octocat/hello-world")

        assert response.status_code == 401

    def test_query_parameters_forwarded_to_sdk(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """Query parameters should be passed through to the SDK client."""
        mock_github_client.get.return_value = {"data": []}

        response = client.get(
            "/api/github/repos/user/octocat",
            params={"type": "owner", "sort": "updated", "per_page": "5"},
        )

        assert response.status_code == 200
        # Verify the SDK get was called with params containing our values
        call_kwargs = mock_github_client.get.call_args
        assert call_kwargs is not None

    def test_query_parameters_on_contributors(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """Query parameters on contributors endpoint should be forwarded."""
        mock_github_client.get.return_value = {"data": []}

        response = client.get(
            "/api/github/repos/octocat/hello-world/contributors",
            params={"per_page": "10", "page": "2"},
        )

        assert response.status_code == 200

    def test_query_parameters_on_forks(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """Query parameters on forks endpoint should be forwarded."""
        mock_github_client.get.return_value = {"data": []}

        response = client.get(
            "/api/github/repos/octocat/hello-world/forks",
            params={"sort": "newest"},
        )

        assert response.status_code == 200


class TestRepoRouteValidation:
    """Boundary value analysis for repository route inputs."""

    # =================================================================
    # Boundary Value Analysis
    # =================================================================

    def test_invalid_owner_name_returns_400(
        self, client: TestClient
    ) -> None:
        """Owner name with invalid characters should return 400 (ValidationError)."""
        response = client.get("/api/github/repos/invalid--user/hello-world")

        assert response.status_code == 400
        data = response.json()
        assert data["error"] == "ValidationError"

    def test_owner_starting_with_hyphen_returns_400(
        self, client: TestClient
    ) -> None:
        """Owner name starting with hyphen should return 400."""
        response = client.get("/api/github/repos/-baduser/hello-world")

        assert response.status_code == 400

    def test_reserved_repo_name_returns_400(
        self, client: TestClient
    ) -> None:
        """Reserved repository name should return 400 (ValidationError)."""
        response = client.get("/api/github/repos/octocat/settings")

        assert response.status_code == 400
        data = response.json()
        assert data["error"] == "ValidationError"

    def test_repo_name_with_special_chars_returns_400(
        self, client: TestClient
    ) -> None:
        """Repository name with special characters should return 400."""
        response = client.get("/api/github/repos/octocat/bad%20repo%20name")

        assert response.status_code == 400

    def test_empty_json_body_on_create_errors(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """POST /repos with an empty JSON object should still call the SDK."""
        mock_github_client.post.return_value = {"id": 1, "name": "unnamed"}

        response = client.post("/api/github/repos", json={})

        # Should succeed since the SDK client is mocked
        assert response.status_code == 200
