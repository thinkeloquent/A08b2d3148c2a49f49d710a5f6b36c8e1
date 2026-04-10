"""
Unit tests for healthz_diagnostics.sdk module.
"""

import pytest
from unittest.mock import MagicMock, AsyncMock
from healthz_diagnostics.sdk import HealthzDiagnosticsSDK


class TestHealthzDiagnosticsSDK:
    """Tests for HealthzDiagnosticsSDK."""

    class TestStatementCoverage:
        """Ensure every statement executes."""

        def test_create_returns_sdk_instance(self):
            """create() returns SDK instance."""
            def factory(config):
                return MagicMock()

            sdk = HealthzDiagnosticsSDK.create(factory)

            assert sdk is not None
            assert isinstance(sdk, HealthzDiagnosticsSDK)

        @pytest.mark.asyncio
        async def test_check_health_delegates_to_executor(self):
            """check_health() delegates to HealthCheckExecutor."""
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_client = MagicMock()
            mock_client.get = AsyncMock(return_value=mock_response)
            mock_client.close = AsyncMock()

            sdk = HealthzDiagnosticsSDK.create(lambda c: mock_client)
            config = {
                "base_url": "https://api.example.com",
                "health_endpoint": "/health",
            }

            result = await sdk.check_health("provider", config)

            assert "healthy" in result

        def test_sanitize_config_delegates_to_sanitizer(self):
            """sanitize_config() delegates to ConfigSanitizer."""
            def factory(config):
                return MagicMock()

            sdk = HealthzDiagnosticsSDK.create(factory)
            config = {"api_key": "secret", "name": "test"}

            result = sdk.sanitize_config(config)

            assert result["api_key"] == "***"
            assert result["name"] == "test"

        def test_check_env_vars_delegates_to_sanitizer(self, clean_env):
            """check_env_vars() delegates to ConfigSanitizer."""
            clean_env(TEST_VAR="value")

            def factory(config):
                return MagicMock()

            sdk = HealthzDiagnosticsSDK.create(factory)

            result = sdk.check_env_vars(["TEST_VAR", "NONEXISTENT"])

            assert result["TEST_VAR"] is True
            assert result["NONEXISTENT"] is False

        def test_format_timestamp_delegates_to_formatter(self):
            """format_timestamp() delegates to TimestampFormatter."""
            def factory(config):
                return MagicMock()

            sdk = HealthzDiagnosticsSDK.create(factory)

            result = sdk.format_timestamp()

            assert isinstance(result, str)
            assert result.endswith("Z")

    class TestIntegration:
        """Integration tests for SDK methods working together."""

        @pytest.mark.asyncio
        async def test_full_health_check_workflow(self):
            """Test complete health check workflow."""
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_client = MagicMock()
            mock_client.get = AsyncMock(return_value=mock_response)
            mock_client.close = AsyncMock()

            sdk = HealthzDiagnosticsSDK.create(lambda c: mock_client)

            # Format timestamp
            ts = sdk.format_timestamp()
            assert ts.endswith("Z")

            # Sanitize config
            config = {
                "base_url": "https://api.example.com",
                "health_endpoint": "/health",
                "endpoint_api_key": "sk-secret",
            }
            safe_config = sdk.sanitize_config(config)
            assert safe_config["endpoint_api_key"] == "***"

            # Check health
            result = await sdk.check_health("test_provider", config)
            assert result["healthy"] is True

            # Check env vars
            env_result = sdk.check_env_vars(["PATH"])
            assert env_result["PATH"] is True
