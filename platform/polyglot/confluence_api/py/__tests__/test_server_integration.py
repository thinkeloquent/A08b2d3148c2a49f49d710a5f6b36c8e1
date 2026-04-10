"""
FastAPI integration tests for the confluence_api server.

Tests verify:
- Health endpoint returns 200
- Error handler maps ConfluenceAPIError to JSON response
- CORS middleware is configured
- Server factory creates valid app
"""

import pytest
from fastapi.testclient import TestClient

from confluence_api.exceptions import (
    ConfluenceAPIError,
    ConfluenceAuthenticationError,
    ConfluenceNotFoundError,
    ConfluenceServerError,
    ConfluenceValidationError,
)
from confluence_api.server import create_app, create_error_handler


@pytest.fixture
def app():
    """Create a test application instance."""
    application = create_app()
    handler = create_error_handler()
    application.add_exception_handler(ConfluenceAPIError, handler)
    return application


@pytest.fixture
def client(app):
    """Synchronous test client."""
    return TestClient(app)


class TestHealthEndpoint:
    """Tests for /health endpoint."""

    def test_health_returns_200(self, client):
        """Health endpoint should return 200 OK."""
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_returns_ok_status(self, client):
        """Health endpoint should return status=ok."""
        response = client.get("/health")
        data = response.json()
        assert data["status"] == "ok"

    def test_health_returns_service_name(self, client):
        """Health endpoint should identify the service."""
        response = client.get("/health")
        data = response.json()
        assert data["service"] == "confluence-api-server"


class TestErrorHandler:
    """Tests for the error handler middleware."""

    def test_not_found_error_returns_404(self, app):
        """ConfluenceNotFoundError should map to 404 response."""

        @app.get("/test-404")
        async def raise_not_found():
            raise ConfluenceNotFoundError("Page 999 not found")

        client = TestClient(app)
        response = client.get("/test-404")
        assert response.status_code == 404
        data = response.json()
        assert data["error"] is True
        assert "Page 999 not found" in data["message"]
        assert data["type"] == "ConfluenceNotFoundError"

    def test_authentication_error_returns_401(self, app):
        """ConfluenceAuthenticationError should map to 401 response."""

        @app.get("/test-401")
        async def raise_auth():
            raise ConfluenceAuthenticationError("Bad credentials")

        client = TestClient(app)
        response = client.get("/test-401")
        assert response.status_code == 401
        data = response.json()
        assert data["error"] is True
        assert data["type"] == "ConfluenceAuthenticationError"

    def test_validation_error_returns_400(self, app):
        """ConfluenceValidationError should map to 400 response."""

        @app.get("/test-400")
        async def raise_validation():
            raise ConfluenceValidationError("Missing required field")

        client = TestClient(app)
        response = client.get("/test-400")
        assert response.status_code == 400
        data = response.json()
        assert data["error"] is True

    def test_server_error_returns_500(self, app):
        """ConfluenceServerError should map to 500 response."""

        @app.get("/test-500")
        async def raise_server():
            raise ConfluenceServerError("Internal server error")

        client = TestClient(app)
        response = client.get("/test-500")
        assert response.status_code == 500
        data = response.json()
        assert data["error"] is True
        assert data["type"] == "ConfluenceServerError"

    def test_base_error_without_status_returns_500(self, app):
        """ConfluenceAPIError without status_code should default to 500."""

        @app.get("/test-base")
        async def raise_base():
            raise ConfluenceAPIError("Unknown API error")

        client = TestClient(app)
        response = client.get("/test-base")
        assert response.status_code == 500


class TestCORSMiddleware:
    """Tests for CORS configuration."""

    def test_cors_allows_all_origins(self, client):
        """CORS should allow any origin."""
        response = client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers

    def test_cors_allows_all_methods(self, client):
        """CORS should allow all HTTP methods."""
        response = client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
            },
        )
        assert response.status_code == 200


class TestServerFactory:
    """Tests for create_app() factory."""

    def test_create_app_returns_fastapi_instance(self):
        """create_app should return a FastAPI instance."""
        from fastapi import FastAPI

        app = create_app()
        assert isinstance(app, FastAPI)

    def test_create_app_has_title(self):
        """App should have the configured title."""
        app = create_app()
        assert app.title == "Confluence API"

    def test_create_app_has_version(self):
        """App should have the configured version."""
        app = create_app()
        assert app.version == "1.0.0"

    def test_create_error_handler_returns_callable(self):
        """create_error_handler should return a callable."""
        handler = create_error_handler()
        assert callable(handler)
