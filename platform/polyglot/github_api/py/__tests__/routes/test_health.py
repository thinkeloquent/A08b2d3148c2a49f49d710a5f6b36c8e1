"""
Tests for the health check routes.

Covers the basic health endpoint and the rate-limit health endpoint.
"""

from __future__ import annotations

from typing import Any
from unittest.mock import AsyncMock

from fastapi.testclient import TestClient


class TestHealthRoutes:
    """Tests for /api/github/health endpoints."""

    def test_health_check(self, test_client: TestClient) -> None:
        """GET /api/github/health should return ok status."""
        response = test_client.get("/api/github/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "github-api"
        assert data["version"] == "1.0.0"

    def test_health_rate_limit(
        self, test_client: TestClient, mock_github_client: Any
    ) -> None:
        """GET /api/github/health/rate-limit should include rate limit data."""
        mock_github_client.get_rate_limit = AsyncMock(return_value={
            "resources": {
                "core": {
                    "limit": 5000,
                    "remaining": 4999,
                    "reset": 1700000000,
                    "used": 1,
                },
            },
            "rate": {
                "limit": 5000,
                "remaining": 4999,
                "reset": 1700000000,
                "used": 1,
            },
        })
        response = test_client.get("/api/github/health/rate-limit")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "rate_limit" in data

    def test_health_rate_limit_degraded(
        self, test_client: TestClient, mock_github_client: Any
    ) -> None:
        """Rate limit health should report degraded on error."""
        mock_github_client.get_rate_limit = AsyncMock(
            side_effect=Exception("Network error")
        )
        response = test_client.get("/api/github/health/rate-limit")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "degraded"
        assert "error" in data
