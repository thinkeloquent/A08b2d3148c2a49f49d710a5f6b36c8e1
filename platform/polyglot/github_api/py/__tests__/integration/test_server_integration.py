"""
Integration tests for FastAPI server setup and middleware.

Tests cover:
- Statement coverage: app creation, route registration, docs endpoint
- Branch coverage: CORS middleware, unknown routes
- Error handling: invalid content type, JSON parse errors
"""

from __future__ import annotations

from typing import Any
from unittest.mock import MagicMock

from fastapi import FastAPI
from fastapi.testclient import TestClient

from __tests__.integration.conftest import create_mock_github_client, create_test_app


class TestServerSetup:
    """Tests for FastAPI application creation and configuration."""

    # =================================================================
    # Statement Coverage
    # =================================================================

    def test_app_creates_successfully_with_mock_client(self) -> None:
        """Application factory should return a valid FastAPI instance."""
        app, client = create_test_app()

        assert isinstance(app, FastAPI)
        assert app.state.github_client is client

    def test_app_has_routes_registered(self, test_app: FastAPI) -> None:
        """Application should have routes registered under /api/github."""
        route_paths = [route.path for route in test_app.routes]
        assert "/api/github/health" in route_paths

    def test_app_has_error_handlers_registered(self, test_app: FastAPI) -> None:
        """Application should have custom exception handlers registered."""
        from github_api.sdk.errors import NotFoundError

        assert NotFoundError in test_app.exception_handlers

    def test_app_returns_404_for_unknown_routes(self, client: TestClient) -> None:
        """Requests to unknown paths should return 404."""
        response = client.get("/api/github/nonexistent-route")

        assert response.status_code == 404

    def test_app_serves_openapi_docs(self, client: TestClient) -> None:
        """OpenAPI docs endpoint should be accessible at /docs."""
        response = client.get("/docs")

        assert response.status_code == 200
        assert "text/html" in response.headers.get("content-type", "")

    def test_app_serves_openapi_json(self, client: TestClient) -> None:
        """OpenAPI JSON schema should be accessible at /openapi.json."""
        response = client.get("/openapi.json")

        assert response.status_code == 200
        data = response.json()
        assert "paths" in data
        assert "info" in data

    # =================================================================
    # Branch Coverage — CORS
    # =================================================================

    def test_cors_middleware_allows_any_origin(self, client: TestClient) -> None:
        """CORS preflight should allow any origin."""
        app, _client = create_test_app()

        # Re-create to include CORS middleware (create_test_app does not add CORS)
        from fastapi.middleware.cors import CORSMiddleware

        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        cors_client = TestClient(app, raise_server_exceptions=False)

        response = cors_client.options(
            "/api/github/health",
            headers={
                "Origin": "http://example.com",
                "Access-Control-Request-Method": "GET",
            },
        )

        assert response.status_code == 200
        # With allow_credentials=True and allow_origins=["*"], Starlette
        # reflects the request origin rather than returning a literal "*".
        allow_origin = response.headers.get("access-control-allow-origin")
        assert allow_origin in ("*", "http://example.com")


class TestMiddleware:
    """Tests for request handling middleware behaviour."""

    # =================================================================
    # Error Handling — Invalid requests
    # =================================================================

    def test_post_without_body_returns_error(self, client: TestClient) -> None:
        """POST to an endpoint expecting JSON without a body should error."""
        response = client.post(
            "/api/github/repos",
            content=b"",
            headers={"Content-Type": "application/json"},
        )

        # FastAPI returns 422 for missing/invalid JSON body
        assert response.status_code in (400, 422, 500)

    def test_post_with_invalid_json_returns_error(self, client: TestClient) -> None:
        """POST with malformed JSON should return an error status."""
        response = client.post(
            "/api/github/repos",
            content=b"{not valid json",
            headers={"Content-Type": "application/json"},
        )

        assert response.status_code in (400, 422, 500)

    def test_get_request_succeeds_without_content_type(
        self, client: TestClient
    ) -> None:
        """GET requests should succeed regardless of content-type header."""
        response = client.get("/api/github/health")

        assert response.status_code == 200

    def test_response_is_json_content_type(self, client: TestClient) -> None:
        """Responses should use application/json content type."""
        response = client.get("/api/github/health")

        assert "application/json" in response.headers.get("content-type", "")
