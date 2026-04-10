"""Unit tests for github_api.middleware.error_handler module.

Tests cover:
- Statement coverage for register_error_handlers and each handler
- Branch coverage for conditional paths (RateLimitError retry-after)
- Boundary value analysis
- Error handling verification
- Log verification
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import pytest
from fastapi import FastAPI, Request
from fastapi.testclient import TestClient

from github_api.middleware.error_handler import register_error_handlers
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


def _create_app_with_error(error: Exception) -> FastAPI:
    """Create a FastAPI app that raises the given error on GET /test.

    Args:
        error: The exception instance to raise.

    Returns:
        A configured FastAPI app with error handlers registered.
    """
    app = FastAPI()
    register_error_handlers(app)

    @app.get("/test")
    async def test_endpoint() -> dict[str, Any]:
        raise error

    return app


class TestStatementCoverage:
    """Execute every code path in error_handler module."""

    def test_register_error_handlers_completes(self) -> None:
        """register_error_handlers does not raise on a fresh app."""
        app = FastAPI()
        register_error_handlers(app)
        # Should not raise

    def test_validation_error_handler(self) -> None:
        """ValidationError returns 400 with error body."""
        err = ValidationError(
            "Bad input",
            errors=[{"field": "name", "code": "missing"}],
        )
        app = _create_app_with_error(err)
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/test")
        assert resp.status_code == 400
        body = resp.json()
        assert body["error"] == "ValidationError"
        assert body["message"] == "Bad input"
        assert body["errors"] == [{"field": "name", "code": "missing"}]

    def test_auth_error_handler(self) -> None:
        """AuthError returns 401."""
        err = AuthError("Bad credentials")
        app = _create_app_with_error(err)
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/test")
        assert resp.status_code == 401
        body = resp.json()
        assert body["error"] == "AuthError"

    def test_forbidden_error_handler(self) -> None:
        """ForbiddenError returns 403."""
        err = ForbiddenError("Not allowed")
        app = _create_app_with_error(err)
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/test")
        assert resp.status_code == 403
        body = resp.json()
        assert body["error"] == "ForbiddenError"

    def test_not_found_error_handler(self) -> None:
        """NotFoundError returns 404."""
        err = NotFoundError("Resource not found")
        app = _create_app_with_error(err)
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/test")
        assert resp.status_code == 404
        body = resp.json()
        assert body["error"] == "NotFoundError"

    def test_conflict_error_handler(self) -> None:
        """ConflictError returns 409."""
        err = ConflictError("Already exists")
        app = _create_app_with_error(err)
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/test")
        assert resp.status_code == 409
        body = resp.json()
        assert body["error"] == "ConflictError"

    def test_rate_limit_error_handler(self) -> None:
        """RateLimitError returns 429."""
        err = RateLimitError("Rate limit exceeded")
        app = _create_app_with_error(err)
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/test")
        assert resp.status_code == 429
        body = resp.json()
        assert body["error"] == "RateLimitError"

    def test_rate_limit_error_with_retry_after_header(self) -> None:
        """RateLimitError with retry_after includes Retry-After header."""
        err = RateLimitError("Rate limit exceeded", retry_after=120)
        app = _create_app_with_error(err)
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/test")
        assert resp.status_code == 429
        assert resp.headers.get("retry-after") == "120"

    def test_server_error_handler(self) -> None:
        """ServerError returns 502."""
        err = ServerError("Upstream error")
        app = _create_app_with_error(err)
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/test")
        assert resp.status_code == 502
        body = resp.json()
        assert body["error"] == "ServerError"

    def test_github_error_fallback_handler(self) -> None:
        """Base GitHubError returns its status or 500."""
        err = GitHubError("Unknown error", status=418)
        app = _create_app_with_error(err)
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/test")
        assert resp.status_code == 418
        body = resp.json()
        assert body["error"] == "GitHubError"


class TestBranchCoverage:
    """Test conditional branches in error handlers."""

    def test_rate_limit_without_retry_after_no_header(self) -> None:
        """RateLimitError without retry_after does not set Retry-After header."""
        err = RateLimitError("Rate limit exceeded", retry_after=None)
        app = _create_app_with_error(err)
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/test")
        assert resp.status_code == 429
        # Retry-After should not be present (or not set by the handler)
        assert "retry-after" not in resp.headers

    def test_rate_limit_with_retry_after_zero(self) -> None:
        """RateLimitError with retry_after=0 still includes the header."""
        err = RateLimitError("Rate limit exceeded", retry_after=0)
        app = _create_app_with_error(err)
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/test")
        assert resp.status_code == 429
        assert resp.headers.get("retry-after") == "0"

    def test_github_error_no_status_defaults_to_500(self) -> None:
        """GitHubError with status=None uses 500 as fallback."""
        err = GitHubError("Unknown error")
        app = _create_app_with_error(err)
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/test")
        assert resp.status_code == 500

    def test_rate_limit_error_with_reset_at_in_body(self) -> None:
        """RateLimitError with reset_at includes it in response body."""
        reset = datetime(2024, 6, 1, 12, 0, 0, tzinfo=timezone.utc)
        err = RateLimitError("limited", reset_at=reset, retry_after=60)
        app = _create_app_with_error(err)
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/test")
        body = resp.json()
        assert "reset_at" in body
        assert body["retry_after"] == 60

    def test_validation_error_empty_errors_not_in_body(self) -> None:
        """ValidationError with empty errors omits errors from body."""
        err = ValidationError("bad", errors=[])
        app = _create_app_with_error(err)
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/test")
        body = resp.json()
        assert "errors" not in body


class TestBoundaryValues:
    """Edge cases for error handlers."""

    def test_validation_error_with_documentation_url(self) -> None:
        """ValidationError with documentation_url includes it in response."""
        err = ValidationError(
            "Invalid",
            documentation_url="https://docs.github.com",
        )
        app = _create_app_with_error(err)
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/test")
        body = resp.json()
        assert body["documentation_url"] == "https://docs.github.com"

    def test_auth_error_with_request_id(self) -> None:
        """AuthError with request_id includes it in response body."""
        err = AuthError("Bad creds", request_id="REQ-123")
        app = _create_app_with_error(err)
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/test")
        body = resp.json()
        assert body["request_id"] == "REQ-123"

    def test_server_error_custom_message(self) -> None:
        """ServerError with custom message returns that message."""
        err = ServerError("Bad Gateway from upstream")
        app = _create_app_with_error(err)
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/test")
        body = resp.json()
        assert body["message"] == "Bad Gateway from upstream"

    def test_conflict_error_includes_status_in_body(self) -> None:
        """ConflictError includes status in serialized body."""
        err = ConflictError("Already exists")
        app = _create_app_with_error(err)
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/test")
        body = resp.json()
        assert body["status"] == 409


class TestErrorHandling:
    """Verify that handlers correctly process various error states."""

    def test_handlers_do_not_interfere_with_normal_routes(self) -> None:
        """Normal routes continue to work after registering handlers."""
        app = FastAPI()
        register_error_handlers(app)

        @app.get("/health")
        async def health() -> dict[str, str]:
            return {"status": "ok"}

        client = TestClient(app)
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}

    def test_most_specific_handler_wins(self) -> None:
        """AuthError is caught by auth handler, not base GitHubError handler."""
        err = AuthError("bad creds")
        app = _create_app_with_error(err)
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/test")
        # Should be 401 (auth handler), not 500 (base handler)
        assert resp.status_code == 401

    def test_rate_limit_error_is_not_caught_by_forbidden_handler(self) -> None:
        """RateLimitError with status 403 is still handled as rate limit."""
        err = RateLimitError("Secondary rate limit", status=403, retry_after=30)
        app = _create_app_with_error(err)
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/test")
        assert resp.status_code == 429
        assert resp.headers.get("retry-after") == "30"


class TestLogVerification:
    """Verify logging behavior in error_handler module.

    The error_handler module does not use a logger directly.
    These tests verify that error context is preserved in responses
    for downstream logging.
    """

    def test_error_context_preserved_in_response(self) -> None:
        """Error details (status, message, request_id) are in the response."""
        err = NotFoundError("Repo not found", request_id="REQ-999")
        app = _create_app_with_error(err)
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/test")
        body = resp.json()
        assert body["error"] == "NotFoundError"
        assert body["message"] == "Repo not found"
        assert body["request_id"] == "REQ-999"
        assert body["status"] == 404

    def test_validation_error_details_in_response(self) -> None:
        """Validation errors list is preserved in response for audit logging."""
        err = ValidationError(
            "Input invalid",
            errors=[{"field": "name", "code": "too_long"}],
        )
        app = _create_app_with_error(err)
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/test")
        body = resp.json()
        assert body["errors"] == [{"field": "name", "code": "too_long"}]
