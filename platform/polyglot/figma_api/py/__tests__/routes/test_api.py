"""Integration tests for FastAPI endpoints."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from figma_api.config import Config
from figma_api.sdk.errors import AuthenticationError, NotFoundError, RateLimitError


class TestHealthEndpoint:
    def test_health_returns_200(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "ok"
        assert body["service"] == "figma-api"
        assert "timestamp" in body


class TestErrorHandling:
    def test_404_for_unknown_route(self, client):
        response = client.get("/nonexistent")
        assert response.status_code == 404


class TestCORS:
    def test_cors_headers_present(self, client):
        response = client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers
