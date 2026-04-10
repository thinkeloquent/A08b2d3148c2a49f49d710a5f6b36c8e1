"""
Unit tests for healthz_diagnostics.executor module.
"""

import pytest
from unittest.mock import MagicMock, AsyncMock
from healthz_diagnostics.executor import HealthCheckExecutor


class TestHealthCheckExecutor:
    """Tests for HealthCheckExecutor."""

    class TestStatementCoverage:
        """Ensure every statement executes."""

        def test_constructor_accepts_factory(self):
            """Constructor accepts http_client_factory."""
            def factory(config):
                return MagicMock()

            executor = HealthCheckExecutor(http_client_factory=factory)

            assert executor is not None

        @pytest.mark.asyncio
        async def test_execute_returns_health_check_result(self):
            """execute() returns HealthCheckResult."""
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_client = MagicMock()
            mock_client.get = AsyncMock(return_value=mock_response)
            mock_client.close = AsyncMock()

            executor = HealthCheckExecutor(
                http_client_factory=lambda c: mock_client
            )
            config = {
                "base_url": "https://api.example.com",
                "health_endpoint": "/health",
            }

            result = await executor.execute("test_provider", config)

            assert "provider" in result
            assert "healthy" in result
            assert "timestamp" in result
            assert "diagnostics" in result

    class TestBranchCoverage:
        """Test all branches."""

        @pytest.mark.asyncio
        async def test_http_2xx_returns_healthy(self):
            """HTTP 2xx status returns healthy=True."""
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_client = MagicMock()
            mock_client.get = AsyncMock(return_value=mock_response)
            mock_client.close = AsyncMock()

            executor = HealthCheckExecutor(
                http_client_factory=lambda c: mock_client
            )
            config = {
                "base_url": "https://api.example.com",
                "health_endpoint": "/health",
            }

            result = await executor.execute("provider", config)

            assert result["healthy"] is True
            assert result["status_code"] == 200

        @pytest.mark.asyncio
        async def test_http_5xx_returns_unhealthy(self):
            """HTTP 5xx status returns healthy=False."""
            mock_response = MagicMock()
            mock_response.status_code = 503
            mock_client = MagicMock()
            mock_client.get = AsyncMock(return_value=mock_response)
            mock_client.close = AsyncMock()

            executor = HealthCheckExecutor(
                http_client_factory=lambda c: mock_client
            )
            config = {
                "base_url": "https://api.example.com",
                "health_endpoint": "/health",
            }

            result = await executor.execute("provider", config)

            assert result["healthy"] is False
            assert result["status_code"] == 503

        @pytest.mark.asyncio
        async def test_connection_error_returns_unhealthy(self):
            """Connection error returns healthy=False with error message."""
            mock_client = MagicMock()
            mock_client.get = AsyncMock(side_effect=ConnectionError("Connection refused"))
            mock_client.close = AsyncMock()

            executor = HealthCheckExecutor(
                http_client_factory=lambda c: mock_client
            )
            config = {
                "base_url": "https://api.example.com",
                "health_endpoint": "/health",
            }

            result = await executor.execute("provider", config)

            assert result["healthy"] is False
            assert "Connection refused" in result["error"]

        @pytest.mark.asyncio
        async def test_missing_base_url_returns_error(self):
            """Missing base_url returns error."""
            mock_client = MagicMock()
            mock_client.get = AsyncMock()
            mock_client.close = AsyncMock()

            executor = HealthCheckExecutor(
                http_client_factory=lambda c: mock_client
            )
            config = {
                "health_endpoint": "/health",
            }

            result = await executor.execute("provider", config)

            assert result["healthy"] is False
            assert "not configured" in result["error"]

    class TestBoundaryValues:
        """Test edge cases."""

        @pytest.mark.asyncio
        async def test_empty_provider_name(self):
            """Empty provider name handled."""
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_client = MagicMock()
            mock_client.get = AsyncMock(return_value=mock_response)
            mock_client.close = AsyncMock()

            executor = HealthCheckExecutor(
                http_client_factory=lambda c: mock_client
            )
            config = {
                "base_url": "https://api.example.com",
                "health_endpoint": "/health",
            }

            result = await executor.execute("", config)

            assert result["provider"] == ""

        @pytest.mark.asyncio
        async def test_missing_health_endpoint_uses_default(self):
            """Missing health_endpoint uses default '/'."""
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_client = MagicMock()
            mock_client.get = AsyncMock(return_value=mock_response)
            mock_client.close = AsyncMock()

            executor = HealthCheckExecutor(
                http_client_factory=lambda c: mock_client
            )
            config = {
                "base_url": "https://api.example.com",
            }

            result = await executor.execute("provider", config)

            assert result["healthy"] is True

    class TestResultStructure:
        """Verify result structure matches spec."""

        @pytest.mark.asyncio
        async def test_result_has_all_required_fields(self):
            """Result has all required fields."""
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_client = MagicMock()
            mock_client.get = AsyncMock(return_value=mock_response)
            mock_client.close = AsyncMock()

            executor = HealthCheckExecutor(
                http_client_factory=lambda c: mock_client
            )
            config = {
                "base_url": "https://api.example.com",
                "health_endpoint": "/health",
                "model": "gpt-4",
            }

            result = await executor.execute("openai", config)

            assert "provider" in result
            assert "healthy" in result
            assert "status_code" in result
            assert "latency_ms" in result
            assert "error" in result
            assert "endpoint" in result
            assert "model" in result
            assert "timestamp" in result
            assert "diagnostics" in result

        @pytest.mark.asyncio
        async def test_result_diagnostics_is_list(self):
            """Diagnostics field is a list."""
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_client = MagicMock()
            mock_client.get = AsyncMock(return_value=mock_response)
            mock_client.close = AsyncMock()

            executor = HealthCheckExecutor(
                http_client_factory=lambda c: mock_client
            )
            config = {
                "base_url": "https://api.example.com",
                "health_endpoint": "/health",
            }

            result = await executor.execute("provider", config)

            assert isinstance(result["diagnostics"], list)
            assert len(result["diagnostics"]) >= 1
