"""
Pytest fixtures for cache_json_awss3_storage tests.
"""

from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest

from cache_json_awss3_storage.logger import NullLogger
from cache_json_awss3_storage.storage import JsonS3Storage


@pytest.fixture
def mock_s3_client() -> MagicMock:
    """Create a mock S3 client."""
    client = MagicMock()

    # Set up async methods
    client.put_object = AsyncMock(return_value={"ETag": '"abc123"'})
    client.get_object = AsyncMock()
    client.delete_object = AsyncMock(return_value={})
    client.head_object = AsyncMock(return_value={})
    client.list_objects_v2 = AsyncMock(return_value={"Contents": [], "IsTruncated": False})
    client.delete_objects = AsyncMock(return_value={"Deleted": []})

    return client


@pytest.fixture
def null_logger() -> NullLogger:
    """Create a null logger for tests."""
    return NullLogger()


@pytest.fixture
async def storage(mock_s3_client: MagicMock, null_logger: NullLogger) -> AsyncIterator[JsonS3Storage]:
    """Create a storage instance for testing."""
    storage = JsonS3Storage(
        s3_client=mock_s3_client,
        bucket_name="test-bucket",
        key_prefix="test:",
        debug=False,
        logger=null_logger,
    )
    yield storage
    await storage.close()


@pytest.fixture
def sample_data() -> dict[str, Any]:
    """Sample data for testing."""
    return {
        "user_id": 123,
        "name": "Alice",
        "email": "alice@example.com",
    }


@pytest.fixture
def sample_data_2() -> dict[str, Any]:
    """Another sample data for testing."""
    return {
        "user_id": 456,
        "name": "Bob",
        "email": "bob@example.com",
    }
