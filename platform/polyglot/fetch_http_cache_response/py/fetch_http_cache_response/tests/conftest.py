"""Shared test fixtures for fetch_http_cache_response."""

import pytest
from unittest.mock import AsyncMock, MagicMock


@pytest.fixture
def mock_http_client():
    """Mock HTTP client with configurable responses."""
    client = AsyncMock()
    response = MagicMock()
    response.status_code = 200
    response.headers = {"content-type": "application/json"}
    response.json.return_value = {"result": "ok"}
    response.text = '{"result": "ok"}'
    client.request = AsyncMock(return_value=response)
    client.aclose = AsyncMock()
    return client


@pytest.fixture
def mock_storage():
    """Mock S3 storage."""
    storage = AsyncMock()
    storage.load = AsyncMock(return_value=None)
    storage.save = AsyncMock()
    storage.delete = AsyncMock()
    storage.close = AsyncMock()
    return storage


@pytest.fixture
def mock_token_manager():
    """Mock token refresh manager."""
    from fetch_http_cache_response.token_manager import TokenRefreshManager
    from fetch_http_cache_response.types import AuthRefreshConfig

    manager = MagicMock(spec=TokenRefreshManager)
    manager.get_token = AsyncMock(return_value="test-token-123")
    manager.build_auth_headers = AsyncMock(
        return_value={"Authorization": "Bearer test-token-123"}
    )
    manager.is_expired = MagicMock(return_value=False)
    return manager


@pytest.fixture
def null_logger():
    """Suppress all logging during tests."""
    mock = MagicMock()
    mock.debug = MagicMock()
    mock.info = MagicMock()
    mock.warn = MagicMock()
    mock.error = MagicMock()
    mock.child = MagicMock(return_value=mock)
    return mock
