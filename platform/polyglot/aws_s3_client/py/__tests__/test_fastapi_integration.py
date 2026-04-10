"""
FastAPI Integration Tests for AWS S3 Client.

Tests cover:
- FastAPI adapter lifecycle management
- Dependency injection patterns
- Health check routes
- Request isolation
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from aws_s3_client.adapters.fastapi import (
    FastAPIAdapter,
    create_fastapi_adapter,
    get_storage_dependency,
)
from aws_s3_client.config import SDKConfig

# Conditionally import FastAPI components
try:
    from fastapi import Depends, FastAPI
    from fastapi.testclient import TestClient

    HAS_FASTAPI = True
except ImportError:
    HAS_FASTAPI = False


pytestmark = pytest.mark.skipif(not HAS_FASTAPI, reason="FastAPI not installed")


class TestFastAPIAdapter:
    """Tests for FastAPIAdapter class."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        def test_creates_adapter_with_config(self, sdk_config: SDKConfig) -> None:
            """Adapter should initialize with config."""
            adapter = FastAPIAdapter(sdk_config)
            assert adapter is not None
            assert adapter._config == sdk_config

        def test_create_fastapi_adapter_factory(self, sdk_config: SDKConfig) -> None:
            """Factory function should create adapter instance."""
            adapter = create_fastapi_adapter(sdk_config)
            assert adapter is not None

    class TestDecisionBranchCoverage:
        """Test all if/else paths."""

        def test_uses_custom_logger(
            self, sdk_config: SDKConfig, mock_logger: MagicMock
        ) -> None:
            """Adapter should use custom logger when provided."""
            adapter = FastAPIAdapter(sdk_config, custom_logger=mock_logger)
            assert adapter._logger == mock_logger

        def test_get_sdk_raises_when_not_initialized(
            self, sdk_config: SDKConfig
        ) -> None:
            """get_sdk should raise RuntimeError before lifespan."""
            adapter = FastAPIAdapter(sdk_config)

            with pytest.raises(RuntimeError, match="not initialized"):
                adapter.get_sdk()


class TestFastAPIAdapterLifespan:
    """Tests for FastAPI lifespan management."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_lifespan_initializes_sdk(self, sdk_config: SDKConfig) -> None:
            """Lifespan should initialize SDK on startup."""
            with patch("aws_s3_client.adapters.fastapi.create_sdk") as mock_create:
                mock_sdk = MagicMock()
                mock_sdk.close = AsyncMock()
                mock_create.return_value = mock_sdk

                adapter = FastAPIAdapter(sdk_config)
                mock_app = MagicMock()

                async with adapter.lifespan(mock_app):
                    assert adapter._sdk is not None
                    assert mock_create.called

        @pytest.mark.asyncio
        async def test_lifespan_closes_sdk_on_shutdown(
            self, sdk_config: SDKConfig
        ) -> None:
            """Lifespan should close SDK on shutdown."""
            with patch("aws_s3_client.adapters.fastapi.create_sdk") as mock_create:
                mock_sdk = MagicMock()
                mock_sdk.close = AsyncMock()
                mock_create.return_value = mock_sdk

                adapter = FastAPIAdapter(sdk_config)
                mock_app = MagicMock()

                async with adapter.lifespan(mock_app):
                    pass

                # SDK should be closed after context exits
                mock_sdk.close.assert_called_once()
                assert adapter._sdk is None


class TestFastAPIAdapterDependencyInjection:
    """Tests for FastAPI dependency injection."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_get_sdk_returns_sdk_after_lifespan(
            self, sdk_config: SDKConfig
        ) -> None:
            """get_sdk should return SDK after lifespan started."""
            with patch("aws_s3_client.adapters.fastapi.create_sdk") as mock_create:
                mock_sdk = MagicMock()
                mock_sdk.close = AsyncMock()
                mock_create.return_value = mock_sdk

                adapter = FastAPIAdapter(sdk_config)
                mock_app = MagicMock()

                async with adapter.lifespan(mock_app):
                    sdk = adapter.get_sdk()
                    assert sdk == mock_sdk

        def test_get_storage_dependency_returns_callable(
            self, sdk_config: SDKConfig
        ) -> None:
            """get_storage_dependency should return callable."""
            adapter = FastAPIAdapter(sdk_config)
            dependency = get_storage_dependency(adapter)

            assert callable(dependency)


class TestFastAPIAdapterHealthRoute:
    """Tests for health check route."""

    class TestDecisionBranchCoverage:
        """Test all if/else paths."""

        @pytest.mark.asyncio
        async def test_health_route_returns_unhealthy_when_not_initialized(
            self, sdk_config: SDKConfig
        ) -> None:
            """Health route should return unhealthy when SDK not initialized."""
            adapter = FastAPIAdapter(sdk_config)
            health_check = adapter.create_health_route()

            result = await health_check()

            assert result["status"] == "unhealthy"
            assert "not initialized" in result["error"]

        @pytest.mark.asyncio
        async def test_health_route_returns_healthy_when_initialized(
            self, sdk_config: SDKConfig
        ) -> None:
            """Health route should return healthy when SDK initialized."""
            with patch("aws_s3_client.adapters.fastapi.create_sdk") as mock_create:
                mock_sdk = MagicMock()
                mock_sdk.close = AsyncMock()
                mock_sdk.stats = AsyncMock(
                    return_value=MagicMock(data={"saves": 0, "loads": 0})
                )
                mock_create.return_value = mock_sdk

                adapter = FastAPIAdapter(sdk_config)
                mock_app = MagicMock()

                async with adapter.lifespan(mock_app):
                    health_check = adapter.create_health_route()
                    result = await health_check()

                    assert result["status"] == "healthy"
                    assert result["bucket"] == sdk_config.bucket_name

        @pytest.mark.asyncio
        async def test_health_route_returns_unhealthy_on_error(
            self, sdk_config: SDKConfig
        ) -> None:
            """Health route should return unhealthy on SDK error."""
            with patch("aws_s3_client.adapters.fastapi.create_sdk") as mock_create:
                mock_sdk = MagicMock()
                mock_sdk.close = AsyncMock()
                mock_sdk.stats = AsyncMock(side_effect=Exception("Connection failed"))
                mock_create.return_value = mock_sdk

                adapter = FastAPIAdapter(sdk_config)
                mock_app = MagicMock()

                async with adapter.lifespan(mock_app):
                    health_check = adapter.create_health_route()
                    result = await health_check()

                    assert result["status"] == "unhealthy"
                    assert "Connection failed" in result["error"]


class TestFastAPIAdapterDebugRoute:
    """Tests for debug info route."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_debug_route_returns_info(self, sdk_config: SDKConfig) -> None:
            """Debug route should return debug info."""
            with patch("aws_s3_client.adapters.fastapi.create_sdk") as mock_create:
                mock_response = MagicMock()
                mock_response.to_dict.return_value = {
                    "bucket_name": "test-bucket",
                    "stats": {"saves": 0},
                }

                mock_sdk = MagicMock()
                mock_sdk.close = AsyncMock()
                mock_sdk.debug_info = AsyncMock(return_value=mock_response)
                mock_create.return_value = mock_sdk

                adapter = FastAPIAdapter(sdk_config)
                mock_app = MagicMock()

                async with adapter.lifespan(mock_app):
                    debug_info = adapter.create_debug_route()
                    result = await debug_info()

                    assert "bucket_name" in result
                    assert result["bucket_name"] == "test-bucket"


@pytest.mark.skipif(not HAS_FASTAPI, reason="FastAPI not installed")
class TestFastAPIFullIntegration:
    """Full integration tests with FastAPI TestClient."""

    class TestIntegration:
        """End-to-end integration tests."""

        def test_app_with_adapter_starts(self, sdk_config: SDKConfig) -> None:
            """FastAPI app with adapter should start successfully."""
            with patch("aws_s3_client.adapters.fastapi.create_sdk") as mock_create:
                mock_sdk = MagicMock()
                mock_sdk.close = AsyncMock()
                mock_sdk.stats = AsyncMock(
                    return_value=MagicMock(data={"saves": 0})
                )
                mock_create.return_value = mock_sdk

                adapter = create_fastapi_adapter(sdk_config)
                app = FastAPI(lifespan=adapter.lifespan)

                # Add health route
                app.get("/health")(adapter.create_health_route())

                # Test with TestClient
                with TestClient(app) as client:
                    response = client.get("/health")
                    assert response.status_code == 200
                    data = response.json()
                    assert data["status"] == "healthy"
