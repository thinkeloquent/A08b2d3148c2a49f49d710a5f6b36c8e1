"""
FastAPI Integration Tests for cache_json_awss3_storage.

Tests cover:
- FastAPI endpoint integration
- Dependency injection patterns
- Request lifecycle with storage
- Lifespan context manager
"""

from __future__ import annotations

import json
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from cache_json_awss3_storage import JsonS3Storage, NullLogger, create_storage

# =============================================================================
# Test Application Setup
# =============================================================================


def create_mock_s3_client() -> MagicMock:
    """Create a mock S3 client for tests."""
    client = MagicMock()
    client.put_object = AsyncMock(return_value={"ETag": '"abc123"'})
    client.get_object = AsyncMock()
    client.delete_object = AsyncMock(return_value={})
    client.head_object = AsyncMock(return_value={})
    client.list_objects_v2 = AsyncMock(
        return_value={"Contents": [], "IsTruncated": False}
    )
    return client


def create_test_app(storage: JsonS3Storage) -> FastAPI:
    """Create a test FastAPI application with storage integration."""
    app = FastAPI(title="Test API")

    # Store in app state
    app.state.storage = storage

    def get_storage() -> JsonS3Storage:
        return app.state.storage

    @app.get("/health")
    async def health():
        """Health check endpoint."""
        return {"status": "ok", "storage_stats": storage.get_stats().__dict__}

    @app.post("/cache")
    async def cache_data(
        data: dict[str, Any], storage: JsonS3Storage = Depends(get_storage)
    ):
        """Cache data and return key."""
        key = await storage.save(data)
        return {"key": key}

    @app.get("/cache/{key}")
    async def get_cached(key: str, storage: JsonS3Storage = Depends(get_storage)):
        """Get cached data by key."""
        data = await storage.load(key)
        if data is None:
            return {"error": "Not found"}, 404
        return {"data": data}

    @app.delete("/cache/{key}")
    async def delete_cached(key: str, storage: JsonS3Storage = Depends(get_storage)):
        """Delete cached data."""
        await storage.delete(key)
        return {"deleted": True}

    @app.get("/cache")
    async def list_cached(storage: JsonS3Storage = Depends(get_storage)):
        """List all cached keys."""
        keys = await storage.list_keys()
        return {"keys": keys, "count": len(keys)}

    return app


# =============================================================================
# Test Fixtures
# =============================================================================


@pytest.fixture
def mock_storage() -> JsonS3Storage:
    """Create a mock storage instance for tests."""
    return JsonS3Storage(
        create_mock_s3_client(), bucket_name="test-bucket", logger=NullLogger()
    )


@pytest.fixture
def client(mock_storage: JsonS3Storage) -> TestClient:
    """Create a test client with mock storage."""
    app = create_test_app(mock_storage)
    return TestClient(app)


# =============================================================================
# Test Classes
# =============================================================================


class TestHealthEndpoint:
    """Tests for /health endpoint."""

    def test_health_returns_200(self, client: TestClient):
        """Health endpoint should return 200 OK."""
        response = client.get("/health")

        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    def test_health_includes_storage_stats(self, client: TestClient):
        """Health endpoint should include storage statistics."""
        response = client.get("/health")

        data = response.json()
        assert "storage_stats" in data
        assert "saves" in data["storage_stats"]
        assert "loads" in data["storage_stats"]


class TestCacheEndpoints:
    """Tests for cache CRUD endpoints."""

    def test_cache_data(self, client: TestClient):
        """POST /cache should save data and return key."""
        response = client.post("/cache", json={"user_id": 123, "name": "Alice"})

        assert response.status_code == 200
        data = response.json()
        assert "key" in data
        assert len(data["key"]) == 16

    def test_list_cached_empty(self, client: TestClient):
        """GET /cache should return empty list initially."""
        response = client.get("/cache")

        assert response.status_code == 200
        data = response.json()
        assert data["keys"] == []
        assert data["count"] == 0

    def test_delete_cached(self, client: TestClient):
        """DELETE /cache/{key} should delete data."""
        response = client.delete("/cache/test123")

        assert response.status_code == 200
        assert response.json()["deleted"] is True


class TestDependencyInjection:
    """Tests for FastAPI dependency injection patterns."""

    def test_storage_injected_correctly(self, client: TestClient, mock_storage):
        """Storage should be correctly injected via Depends."""
        # Make a request that uses storage
        client.post("/cache", json={"test": "data"})

        # Verify storage was used (saves counter incremented)
        assert mock_storage.get_stats().saves == 1


class TestLifespanIntegration:
    """Tests for FastAPI lifespan context manager pattern."""

    def test_lifespan_startup_shutdown(self):
        """Test lifespan context manager pattern."""
        from contextlib import asynccontextmanager

        startup_called = False
        shutdown_called = False

        @asynccontextmanager
        async def lifespan(app: FastAPI):
            nonlocal startup_called, shutdown_called
            # Startup
            startup_called = True
            app.state.storage = JsonS3Storage(
                create_mock_s3_client(),
                bucket_name="test-bucket",
                logger=NullLogger(),
            )
            yield
            # Shutdown
            shutdown_called = True
            await app.state.storage.close()

        app = FastAPI(lifespan=lifespan)

        @app.get("/health")
        async def health():
            return {"status": "ok"}

        with TestClient(app) as client:
            assert startup_called is True
            response = client.get("/health")
            assert response.status_code == 200

        assert shutdown_called is True


class TestRequestStateMiddleware:
    """Tests for request state patterns."""

    def test_storage_available_in_request(self, client: TestClient, mock_storage):
        """Storage should be accessible throughout request lifecycle."""
        # First request - cache data
        response1 = client.post("/cache", json={"request": 1})
        assert response1.status_code == 200

        # Second request - different data
        response2 = client.post("/cache", json={"request": 2})
        assert response2.status_code == 200

        # Both should have succeeded
        assert mock_storage.get_stats().saves == 2


class TestErrorHandling:
    """Tests for error handling in API integration."""

    def test_storage_error_handling(self):
        """Storage errors should be handled gracefully."""
        # Create storage that will fail on save
        mock_client = create_mock_s3_client()
        mock_client.put_object = AsyncMock(
            side_effect=Exception("S3 Connection Error")
        )

        storage = JsonS3Storage(
            mock_client, bucket_name="test-bucket", logger=NullLogger()
        )
        app = create_test_app(storage)

        with TestClient(app, raise_server_exceptions=False) as client:
            response = client.post("/cache", json={"test": "data"})
            # Should return 500 error
            assert response.status_code == 500
