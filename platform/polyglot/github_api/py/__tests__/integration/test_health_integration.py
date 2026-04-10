"""
Integration tests for health check routes.

Tests cover:
- Statement coverage: health and rate-limit endpoints return expected data
- Branch coverage: rate-limit failure returns degraded status
- Boundary value: response fields have correct types
"""

from __future__ import annotations

from typing import Any
from unittest.mock import AsyncMock, MagicMock

from fastapi.testclient import TestClient


class TestHealthRoutes:
    """Tests for /api/github/health endpoints via full HTTP cycle."""

    # =================================================================
    # Statement Coverage
    # =================================================================

    def test_health_returns_200_with_status_ok(self, client: TestClient) -> None:
        """GET /api/github/health should return 200 with status 'ok'."""
        response = client.get("/api/github/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"

    def test_health_includes_service_name(self, client: TestClient) -> None:
        """Health response should include the service name."""
        response = client.get("/api/github/health")

        data = response.json()
        assert data["service"] == "github-api"

    def test_health_includes_version(self, client: TestClient) -> None:
        """Health response should include the version string."""
        response = client.get("/api/github/health")

        data = response.json()
        assert data["version"] == "1.0.0"

    # =================================================================
    # Rate-limit endpoint — Statement Coverage
    # =================================================================

    def test_rate_limit_returns_200(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """GET /api/github/health/rate-limit should return 200."""
        response = client.get("/api/github/health/rate-limit")

        assert response.status_code == 200

    def test_rate_limit_includes_rate_limit_data(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """Rate-limit response should include rate_limit field."""
        response = client.get("/api/github/health/rate-limit")

        data = response.json()
        assert "rate_limit" in data
        assert data["status"] == "ok"

    def test_rate_limit_includes_resources(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """Rate-limit data should include resources with core limits."""
        response = client.get("/api/github/health/rate-limit")

        data = response.json()
        resources = data["rate_limit"]["resources"]
        assert "core" in resources
        assert resources["core"]["limit"] == 5000

    # =================================================================
    # Branch Coverage — degraded state
    # =================================================================

    def test_rate_limit_degraded_on_client_error(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """Rate-limit endpoint should return 'degraded' when client fails."""
        mock_github_client.get_rate_limit = AsyncMock(
            side_effect=Exception("Connection refused")
        )

        response = client.get("/api/github/health/rate-limit")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "degraded"
        assert "error" in data

    def test_rate_limit_degraded_includes_error_message(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """Degraded response should include the error message string."""
        mock_github_client.get_rate_limit = AsyncMock(
            side_effect=RuntimeError("Timeout exceeded")
        )

        response = client.get("/api/github/health/rate-limit")

        data = response.json()
        assert data["status"] == "degraded"
        assert "Timeout exceeded" in data["error"]

    def test_rate_limit_degraded_still_includes_service(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """Degraded response should still include service metadata."""
        mock_github_client.get_rate_limit = AsyncMock(
            side_effect=Exception("fail")
        )

        response = client.get("/api/github/health/rate-limit")

        data = response.json()
        assert data["service"] == "github-api"
        assert data["version"] == "1.0.0"

    # =================================================================
    # Boundary Value Analysis
    # =================================================================

    def test_health_response_has_exactly_three_keys(self, client: TestClient) -> None:
        """Health response should have exactly status, service, and version."""
        response = client.get("/api/github/health")

        data = response.json()
        assert set(data.keys()) == {"status", "service", "version"}

    def test_health_response_values_are_strings(self, client: TestClient) -> None:
        """All health response values should be strings."""
        response = client.get("/api/github/health")

        data = response.json()
        for key, value in data.items():
            assert isinstance(value, str), f"Expected str for {key}, got {type(value)}"

    def test_rate_limit_response_ok_has_four_keys(
        self, client: TestClient, mock_github_client: MagicMock
    ) -> None:
        """Successful rate-limit response should have status, service, version, rate_limit."""
        response = client.get("/api/github/health/rate-limit")

        data = response.json()
        assert "status" in data
        assert "service" in data
        assert "version" in data
        assert "rate_limit" in data
