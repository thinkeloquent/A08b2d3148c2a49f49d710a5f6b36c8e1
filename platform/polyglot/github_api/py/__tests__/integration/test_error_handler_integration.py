"""
Integration tests for error handler middleware.

Tests cover:
- Statement coverage: every error type maps to the correct HTTP status
- Branch coverage: error responses with/without optional fields
- Error handling: response format validation
"""

from __future__ import annotations

from datetime import datetime
from typing import Any
from unittest.mock import AsyncMock, MagicMock

from fastapi.testclient import TestClient

from github_api.sdk.errors import (
    AuthError,
    ConflictError,
    ForbiddenError,
    GitHubError,
    NotFoundError,
    RateLimitError,
    ServerError,
    ValidationError,
)

from __tests__.integration.conftest import create_mock_github_client, create_test_app


def _client_raising(error: Exception) -> TestClient:
    """Create a TestClient whose mock GitHub client.get raises *error*.

    This is a convenience helper that builds a fresh app so each test
    can configure its own error without interfering with others.
    """
    mock = create_mock_github_client()
    mock.get = AsyncMock(side_effect=error)
    app, _ = create_test_app(mock)
    return TestClient(app, raise_server_exceptions=False)


class TestErrorMapping:
    """Verify that SDK errors are mapped to the correct HTTP status codes."""

    # =================================================================
    # Statement Coverage
    # =================================================================

    def test_validation_error_returns_400(self) -> None:
        """ValidationError should produce a 400 response."""
        client = _client_raising(
            ValidationError("Invalid input", errors=[{"field": "name", "code": "missing"}])
        )

        response = client.get("/api/github/repos/octocat/hello-world")

        assert response.status_code == 400
        data = response.json()
        assert data["error"] == "ValidationError"
        assert "Invalid input" in data["message"]

    def test_auth_error_returns_401(self) -> None:
        """AuthError should produce a 401 response."""
        client = _client_raising(AuthError("Bad credentials"))

        response = client.get("/api/github/repos/octocat/hello-world")

        assert response.status_code == 401
        data = response.json()
        assert data["error"] == "AuthError"

    def test_forbidden_error_returns_403(self) -> None:
        """ForbiddenError should produce a 403 response."""
        client = _client_raising(ForbiddenError("Insufficient permissions"))

        response = client.get("/api/github/repos/octocat/hello-world")

        assert response.status_code == 403
        data = response.json()
        assert data["error"] == "ForbiddenError"

    def test_not_found_error_returns_404(self) -> None:
        """NotFoundError should produce a 404 response."""
        client = _client_raising(NotFoundError("Not Found"))

        response = client.get("/api/github/repos/octocat/hello-world")

        assert response.status_code == 404
        data = response.json()
        assert data["error"] == "NotFoundError"

    def test_conflict_error_returns_409(self) -> None:
        """ConflictError should produce a 409 response."""
        client = _client_raising(ConflictError("Already exists"))

        response = client.get("/api/github/repos/octocat/hello-world")

        assert response.status_code == 409
        data = response.json()
        assert data["error"] == "ConflictError"

    def test_rate_limit_error_returns_429(self) -> None:
        """RateLimitError should produce a 429 response with retry_after."""
        client = _client_raising(
            RateLimitError(
                "Rate limit exceeded",
                retry_after=60,
                reset_at=datetime(2025, 1, 1, 0, 0, 0),
            )
        )

        response = client.get("/api/github/repos/octocat/hello-world")

        assert response.status_code == 429
        data = response.json()
        assert data["error"] == "RateLimitError"
        assert data["retry_after"] == 60
        assert "Retry-After" in response.headers

    def test_server_error_returns_502(self) -> None:
        """ServerError should produce a 502 response."""
        client = _client_raising(ServerError("Internal server error"))

        response = client.get("/api/github/repos/octocat/hello-world")

        assert response.status_code == 502
        data = response.json()
        assert data["error"] == "ServerError"

    def test_generic_github_error_uses_status(self) -> None:
        """GitHubError with a custom status should be forwarded as-is."""
        client = _client_raising(GitHubError("Custom error", status=418))

        response = client.get("/api/github/repos/octocat/hello-world")

        assert response.status_code == 418
        data = response.json()
        assert data["error"] == "GitHubError"

    # =================================================================
    # Branch Coverage — error fields
    # =================================================================

    def test_validation_error_includes_errors_list(self) -> None:
        """ValidationError response should include the errors list."""
        err = ValidationError(
            "Multiple errors",
            errors=[
                {"field": "name", "code": "missing"},
                {"field": "owner", "code": "invalid"},
            ],
        )
        client = _client_raising(err)

        response = client.get("/api/github/repos/octocat/hello-world")

        data = response.json()
        assert "errors" in data
        assert len(data["errors"]) == 2

    def test_rate_limit_error_without_retry_after(self) -> None:
        """RateLimitError without retry_after should still return 429."""
        client = _client_raising(RateLimitError("Rate limit exceeded"))

        response = client.get("/api/github/repos/octocat/hello-world")

        assert response.status_code == 429
        data = response.json()
        assert "retry_after" not in data or data.get("retry_after") is None

    def test_error_with_request_id(self) -> None:
        """Error with request_id should include it in response."""
        err = NotFoundError("Not Found", request_id="ABCD-1234")
        client = _client_raising(err)

        response = client.get("/api/github/repos/octocat/hello-world")

        data = response.json()
        assert data.get("request_id") == "ABCD-1234"

    def test_error_with_documentation_url(self) -> None:
        """Error with documentation_url should include it in response."""
        err = AuthError(
            "Bad credentials",
            documentation_url="https://docs.github.com/rest",
        )
        client = _client_raising(err)

        response = client.get("/api/github/repos/octocat/hello-world")

        data = response.json()
        assert data.get("documentation_url") == "https://docs.github.com/rest"


class TestErrorResponseFormat:
    """Verify the structure of error response bodies."""

    # =================================================================
    # Statement Coverage
    # =================================================================

    def test_error_response_has_error_field(self) -> None:
        """Error responses must contain an 'error' field."""
        client = _client_raising(NotFoundError("Not Found"))

        response = client.get("/api/github/repos/octocat/hello-world")

        data = response.json()
        assert "error" in data

    def test_error_response_has_message_field(self) -> None:
        """Error responses must contain a 'message' field."""
        client = _client_raising(NotFoundError("Not Found"))

        response = client.get("/api/github/repos/octocat/hello-world")

        data = response.json()
        assert "message" in data

    def test_error_response_has_status_field(self) -> None:
        """Error responses should contain a 'status' field."""
        client = _client_raising(NotFoundError("Not Found"))

        response = client.get("/api/github/repos/octocat/hello-world")

        data = response.json()
        assert data.get("status") == 404

    # =================================================================
    # Branch Coverage — different error routes
    # =================================================================

    def test_error_on_post_route(self) -> None:
        """Errors on POST routes should follow the same format."""
        mock = create_mock_github_client()
        mock.post = AsyncMock(side_effect=AuthError("Unauthorized"))
        app, _ = create_test_app(mock)
        client = TestClient(app, raise_server_exceptions=False)

        response = client.post(
            "/api/github/repos",
            json={"name": "test-repo"},
        )

        assert response.status_code == 401
        data = response.json()
        assert "error" in data
        assert "message" in data

    def test_error_on_delete_route(self) -> None:
        """Errors on DELETE routes should follow the same format."""
        mock = create_mock_github_client()
        mock.delete = AsyncMock(side_effect=ForbiddenError("Forbidden"))
        app, _ = create_test_app(mock)
        client = TestClient(app, raise_server_exceptions=False)

        response = client.delete("/api/github/repos/octocat/hello-world")

        assert response.status_code == 403
        data = response.json()
        assert data["error"] == "ForbiddenError"
