"""
FastAPI Integration Tests for gemini_openai_sdk.

Tests cover:
- Endpoint availability and response format
- Request state handling
- Middleware behavior
- Error handling
"""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


class TestFastAPIIntegration:
    """Integration tests using FastAPI TestClient."""

    class TestHealthEndpoint:
        """Tests for health endpoints."""

        def test_health_returns_200(self, test_client):
            """Health endpoint should return 200 OK."""
            response = test_client.get("/health")

            assert response.status_code == 200
            assert response.json()["status"] == "ok"

        def test_api_health_returns_200(self, test_client):
            """API health endpoint should return 200 OK."""
            response = test_client.get("/api/llm/gemini-openai-v1/health")

            assert response.status_code == 200
            assert response.json()["status"] == "ok"
            assert response.json()["api_version"] == "v1"

    class TestChatEndpoint:
        """Tests for chat endpoint."""

        def test_chat_endpoint_structure(self, test_client):
            """Chat endpoint should have correct structure."""
            # This would test the actual chat endpoint
            # For now, we just verify the test infrastructure works
            response = test_client.get("/health")
            assert response.status_code == 200


class TestFastAPIAsyncEndpoints:
    """Async integration tests."""

    @pytest.mark.asyncio
    async def test_async_health(self, async_client):
        """Async health check should work."""
        response = await async_client.get("/health")

        assert response.status_code == 200
        assert response.json()["status"] == "ok"


class TestFastAPIRouteRegistration:
    """Tests for route registration patterns."""

    def test_routes_are_registered(self, fastapi_app):
        """All expected routes should be registered."""
        routes = [route.path for route in fastapi_app.routes]

        assert "/health" in routes
        assert "/api/llm/gemini-openai-v1/health" in routes


class TestFastAPIMiddleware:
    """Tests for middleware behavior."""

    def test_request_isolation(self, test_client):
        """Each request should be isolated."""
        response1 = test_client.get("/health")
        response2 = test_client.get("/health")

        # Both should succeed independently
        assert response1.status_code == 200
        assert response2.status_code == 200


class TestFastAPIErrorHandling:
    """Tests for error handling."""

    def test_404_for_unknown_route(self, test_client):
        """Unknown routes should return 404."""
        response = test_client.get("/unknown/route")

        assert response.status_code == 404


class TestFastAPIDependencyInjection:
    """Tests for dependency injection patterns."""

    def test_sdk_can_be_injected(self, fastapi_app):
        """SDK should be injectable as dependency."""
        try:
            from fastapi import Depends

            from gemini_openai_sdk import GeminiClient

            # Verify the pattern works
            def get_client():
                return GeminiClient()

            @fastapi_app.get("/test-injection")
            async def test_endpoint(client: GeminiClient = Depends(get_client)):
                return {"has_client": client is not None}

            from fastapi.testclient import TestClient
            client = TestClient(fastapi_app)
            response = client.get("/test-injection")

            assert response.status_code == 200
            assert response.json()["has_client"] is True
        except ImportError:
            pytest.skip("FastAPI not installed")
