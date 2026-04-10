"""
Pytest configuration and shared fixtures for AWS S3 Client tests.

Provides mock S3 clients, logger verification, and test utilities.
"""

import json
import logging
import os
from collections.abc import Callable
from typing import Any, Optional
from unittest.mock import AsyncMock, MagicMock

import pytest

from aws_s3_client.config import SDKConfig
from aws_s3_client.models import StorageEntry

# Configure logging for tests
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)


@pytest.fixture
def mock_logger() -> MagicMock:
    """Fixture providing a mock logger for injection."""
    mock = MagicMock()
    mock.debug = MagicMock()
    mock.info = MagicMock()
    mock.warn = MagicMock()
    mock.error = MagicMock()
    return mock


@pytest.fixture
def assert_log_contains(caplog: pytest.LogCaptureFixture) -> Callable[[str, str | None], bool]:
    """Fixture to assert log messages are present."""
    def _assert(expected_text: str, level: str | None = None) -> bool:
        for record in caplog.records:
            if level and record.levelname != level.upper():
                continue
            if expected_text in record.message:
                return True

        all_messages = [f"[{r.levelname}] {r.message}" for r in caplog.records]
        raise AssertionError(
            f"Expected log containing '{expected_text}' not found.\n"
            f"Captured logs:\n" + "\n".join(all_messages)
        )
    return _assert


@pytest.fixture
def clean_env(monkeypatch: pytest.MonkeyPatch) -> Callable[..., None]:
    """Fixture to manage environment variables."""
    def set_env(**kwargs: Any) -> None:
        for key, value in kwargs.items():
            if value is None:
                monkeypatch.delenv(key, raising=False)
            else:
                monkeypatch.setenv(key, value)
    return set_env


@pytest.fixture
def mock_s3_client() -> MagicMock:
    """
    Create a mock S3 client with async methods.

    Returns a MagicMock that simulates aiobotocore S3 client behavior.
    """
    client = MagicMock()

    # Mock put_object
    client.put_object = AsyncMock(return_value={"ETag": '"abc123"'})

    # Mock get_object with a proper body response
    async def mock_read():
        entry = StorageEntry(
            key="test_key",
            data={"user": "alice", "score": 100},
            created_at=1700000000.0,
            expires_at=None,
        )
        return json.dumps(entry.to_dict()).encode("utf-8")

    mock_body = MagicMock()
    mock_body.read = mock_read
    client.get_object = AsyncMock(return_value={"Body": mock_body})

    # Mock head_object
    client.head_object = AsyncMock(return_value={"ContentLength": 100})

    # Mock delete_object
    client.delete_object = AsyncMock(return_value={})

    # Mock delete_objects
    client.delete_objects = AsyncMock(return_value={"Deleted": []})

    # Mock list_objects_v2
    client.list_objects_v2 = AsyncMock(return_value={
        "Contents": [
            {"Key": "jss3:key1"},
            {"Key": "jss3:key2"},
        ],
        "IsTruncated": False,
    })

    return client


@pytest.fixture
def mock_s3_client_empty() -> MagicMock:
    """Create a mock S3 client that returns empty/not found responses."""
    client = MagicMock()

    client.put_object = AsyncMock(return_value={"ETag": '"abc123"'})
    client.get_object = AsyncMock(side_effect=Exception("NoSuchKey: The specified key does not exist."))
    client.head_object = AsyncMock(side_effect=Exception("404 Not Found"))
    client.delete_object = AsyncMock(return_value={})
    client.delete_objects = AsyncMock(return_value={"Deleted": []})
    client.list_objects_v2 = AsyncMock(return_value={"Contents": [], "IsTruncated": False})

    return client


@pytest.fixture
def sample_data() -> dict[str, Any]:
    """Sample data for testing."""
    return {
        "user_id": 123,
        "name": "Alice",
        "email": "alice@example.com",
        "tags": ["python", "aws"],
    }


@pytest.fixture
def sdk_config() -> SDKConfig:
    """Default SDK configuration for testing."""
    return SDKConfig(
        bucket_name="test-bucket",
        region="us-east-1",
        key_prefix="jss3:",
        ttl=3600,
        debug=True,
    )


@pytest.fixture
def sdk_config_minimal() -> SDKConfig:
    """Minimal SDK configuration for testing."""
    return SDKConfig(bucket_name="test-bucket")
