"""
Tests for JsonS3Storage class.
"""

from __future__ import annotations

import json
import time
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest

from cache_json_awss3_storage.exceptions import (
    JsonS3StorageClosedError,
    JsonS3StorageConfigError,
    JsonS3StorageReadError,
    JsonS3StorageWriteError,
)
from cache_json_awss3_storage.logger import NullLogger
from cache_json_awss3_storage.models import StorageEntry
from cache_json_awss3_storage.storage import JsonS3Storage, create_storage


class TestJsonS3StorageInit:
    """Tests for storage initialization."""

    def test_requires_bucket_name(self, mock_s3_client: MagicMock) -> None:
        """Should raise error if bucket_name is empty."""
        with pytest.raises(JsonS3StorageConfigError):
            JsonS3Storage(mock_s3_client, "")

    def test_accepts_custom_logger(
        self, mock_s3_client: MagicMock, null_logger: NullLogger
    ) -> None:
        """Should accept custom logger."""
        storage = JsonS3Storage(
            mock_s3_client,
            "test-bucket",
            logger=null_logger,
        )
        assert storage._logger is null_logger

    def test_default_configuration(self, mock_s3_client: MagicMock) -> None:
        """Should use default configuration values."""
        storage = JsonS3Storage(mock_s3_client, "test-bucket")

        assert storage._bucket_name == "test-bucket"
        assert storage._key_prefix == "jss3:"
        assert storage._ttl is None
        assert storage._debug is False
        assert storage._max_error_history == 100


class TestSaveOperation:
    """Tests for save operation."""

    @pytest.mark.asyncio
    async def test_save_returns_key(
        self, storage: JsonS3Storage, sample_data: dict[str, Any]
    ) -> None:
        """Save should return the provided key."""
        key = await storage.save("my-custom-key", sample_data)

        assert key == "my-custom-key"

    @pytest.mark.asyncio
    async def test_save_increments_stats(
        self, storage: JsonS3Storage, sample_data: dict[str, Any]
    ) -> None:
        """Save should increment save stats."""
        assert storage.get_stats().saves == 0

        await storage.save("test-key", sample_data)

        assert storage.get_stats().saves == 1

    @pytest.mark.asyncio
    async def test_save_calls_put_object(
        self,
        mock_s3_client: MagicMock,
        storage: JsonS3Storage,
        sample_data: dict[str, Any],
    ) -> None:
        """Save should call S3 put_object."""
        await storage.save("test-key", sample_data)

        mock_s3_client.put_object.assert_called_once()
        call_kwargs = mock_s3_client.put_object.call_args.kwargs
        assert call_kwargs["Bucket"] == "test-bucket"
        assert call_kwargs["Key"].startswith("test:")
        assert call_kwargs["ContentType"] == "application/json"

    @pytest.mark.asyncio
    async def test_save_with_ttl(
        self,
        mock_s3_client: MagicMock,
        storage: JsonS3Storage,
        sample_data: dict[str, Any],
    ) -> None:
        """Save with TTL should set expires_at."""
        await storage.save("test-key", sample_data, ttl=3600)

        call_kwargs = mock_s3_client.put_object.call_args.kwargs
        body = json.loads(call_kwargs["Body"])
        assert body["expires_at"] is not None
        assert body["expires_at"] > time.time()

    @pytest.mark.asyncio
    async def test_save_without_ttl(
        self,
        mock_s3_client: MagicMock,
        storage: JsonS3Storage,
        sample_data: dict[str, Any],
    ) -> None:
        """Save without TTL should not set expires_at."""
        await storage.save("test-key", sample_data)

        call_kwargs = mock_s3_client.put_object.call_args.kwargs
        body = json.loads(call_kwargs["Body"])
        assert body["expires_at"] is None

    @pytest.mark.asyncio
    async def test_save_records_error_on_failure(
        self,
        mock_s3_client: MagicMock,
        storage: JsonS3Storage,
        sample_data: dict[str, Any],
    ) -> None:
        """Save should record error on failure."""
        mock_s3_client.put_object.side_effect = Exception("S3 error")

        with pytest.raises(JsonS3StorageWriteError):
            await storage.save("test-key", sample_data)

        assert storage.get_stats().errors == 1
        assert storage.get_last_error() is not None


class TestLoadOperation:
    """Tests for load operation."""

    @pytest.mark.asyncio
    async def test_load_by_key(
        self,
        mock_s3_client: MagicMock,
        storage: JsonS3Storage,
        sample_data: dict[str, Any],
    ) -> None:
        """Load by key should return data."""
        entry = StorageEntry(
            key="test123",
            data=sample_data,
            created_at=time.time(),
        )
        mock_body = AsyncMock()
        mock_body.read = AsyncMock(return_value=json.dumps(entry.to_dict()).encode())
        mock_s3_client.get_object.return_value = {"Body": mock_body}

        result = await storage.load("test123")

        assert result == sample_data

    @pytest.mark.asyncio
    async def test_load_by_generated_key(
        self,
        mock_s3_client: MagicMock,
        storage: JsonS3Storage,
        sample_data: dict[str, Any],
    ) -> None:
        """Load by generated key should return data."""
        from cache_json_awss3_storage import generate_key

        entry = StorageEntry(
            key="generated",
            data=sample_data,
            created_at=time.time(),
        )
        mock_body = AsyncMock()
        mock_body.read = AsyncMock(return_value=json.dumps(entry.to_dict()).encode())
        mock_s3_client.get_object.return_value = {"Body": mock_body}

        # Generate key from data and use it to load
        key = generate_key(sample_data)
        result = await storage.load(key)

        assert result == sample_data

    @pytest.mark.asyncio
    async def test_load_not_found_returns_none(
        self,
        mock_s3_client: MagicMock,
        storage: JsonS3Storage,
    ) -> None:
        """Load should return None for non-existent key."""
        mock_s3_client.get_object.side_effect = Exception("NoSuchKey")

        result = await storage.load("nonexistent")

        assert result is None
        assert storage.get_stats().misses == 1

    @pytest.mark.asyncio
    async def test_load_expired_returns_none(
        self,
        mock_s3_client: MagicMock,
        storage: JsonS3Storage,
        sample_data: dict[str, Any],
    ) -> None:
        """Load should return None for expired entry."""
        entry = StorageEntry(
            key="test123",
            data=sample_data,
            created_at=time.time() - 3600,
            expires_at=time.time() - 1800,  # Expired 30 min ago
        )
        mock_body = AsyncMock()
        mock_body.read = AsyncMock(return_value=json.dumps(entry.to_dict()).encode())
        mock_s3_client.get_object.return_value = {"Body": mock_body}

        result = await storage.load("test123")

        assert result is None
        assert storage.get_stats().misses == 1

    @pytest.mark.asyncio
    async def test_load_expired_with_ignore_expiry(
        self,
        mock_s3_client: MagicMock,
        storage: JsonS3Storage,
        sample_data: dict[str, Any],
    ) -> None:
        """Load with ignore_expiry should return expired data."""
        entry = StorageEntry(
            key="test123",
            data=sample_data,
            created_at=time.time() - 3600,
            expires_at=time.time() - 1800,  # Expired 30 min ago
        )
        mock_body = AsyncMock()
        mock_body.read = AsyncMock(return_value=json.dumps(entry.to_dict()).encode())
        mock_s3_client.get_object.return_value = {"Body": mock_body}

        result = await storage.load("test123", ignore_expiry=True)

        assert result == sample_data
        assert storage.get_stats().hits == 1

    @pytest.mark.asyncio
    async def test_load_increments_hits_on_success(
        self,
        mock_s3_client: MagicMock,
        storage: JsonS3Storage,
        sample_data: dict[str, Any],
    ) -> None:
        """Load should increment hits on successful load."""
        entry = StorageEntry(key="test", data=sample_data, created_at=time.time())
        mock_body = AsyncMock()
        mock_body.read = AsyncMock(return_value=json.dumps(entry.to_dict()).encode())
        mock_s3_client.get_object.return_value = {"Body": mock_body}

        await storage.load("test")

        assert storage.get_stats().hits == 1


class TestDeleteOperation:
    """Tests for delete operation."""

    @pytest.mark.asyncio
    async def test_delete_returns_true(self, storage: JsonS3Storage) -> None:
        """Delete should return True."""
        result = await storage.delete("test123")

        assert result is True

    @pytest.mark.asyncio
    async def test_delete_increments_stats(self, storage: JsonS3Storage) -> None:
        """Delete should increment delete stats."""
        await storage.delete("test123")

        assert storage.get_stats().deletes == 1

    @pytest.mark.asyncio
    async def test_delete_by_generated_key(
        self,
        mock_s3_client: MagicMock,
        storage: JsonS3Storage,
        sample_data: dict[str, Any],
    ) -> None:
        """Delete by generated key should work."""
        from cache_json_awss3_storage import generate_key

        key = generate_key(sample_data)
        await storage.delete(key)

        mock_s3_client.delete_object.assert_called_once()


class TestExistsOperation:
    """Tests for exists operation."""

    @pytest.mark.asyncio
    async def test_exists_returns_true(
        self, mock_s3_client: MagicMock, storage: JsonS3Storage
    ) -> None:
        """Exists should return True for existing object."""
        mock_s3_client.head_object.return_value = {}

        result = await storage.exists("test123")

        assert result is True

    @pytest.mark.asyncio
    async def test_exists_returns_false(
        self, mock_s3_client: MagicMock, storage: JsonS3Storage
    ) -> None:
        """Exists should return False for non-existent object."""
        mock_s3_client.head_object.side_effect = Exception("404 Not Found")

        result = await storage.exists("nonexistent")

        assert result is False


class TestBulkOperations:
    """Tests for bulk operations."""

    @pytest.mark.asyncio
    async def test_list_keys_empty(
        self, mock_s3_client: MagicMock, storage: JsonS3Storage
    ) -> None:
        """list_keys should return empty list for empty bucket."""
        mock_s3_client.list_objects_v2.return_value = {
            "Contents": [],
            "IsTruncated": False,
        }

        keys = await storage.list_keys()

        assert keys == []

    @pytest.mark.asyncio
    async def test_list_keys_returns_keys(
        self, mock_s3_client: MagicMock, storage: JsonS3Storage
    ) -> None:
        """list_keys should return list of keys."""
        mock_s3_client.list_objects_v2.return_value = {
            "Contents": [
                {"Key": "test:key1"},
                {"Key": "test:key2"},
            ],
            "IsTruncated": False,
        }

        keys = await storage.list_keys()

        assert keys == ["key1", "key2"]

    @pytest.mark.asyncio
    async def test_clear_empty_bucket(
        self, mock_s3_client: MagicMock, storage: JsonS3Storage
    ) -> None:
        """clear should return 0 for empty bucket."""
        mock_s3_client.list_objects_v2.return_value = {
            "Contents": [],
            "IsTruncated": False,
        }

        count = await storage.clear()

        assert count == 0

    @pytest.mark.asyncio
    async def test_clear_deletes_objects(
        self, mock_s3_client: MagicMock, storage: JsonS3Storage
    ) -> None:
        """clear should delete all objects."""
        mock_s3_client.list_objects_v2.return_value = {
            "Contents": [{"Key": "test:key1"}, {"Key": "test:key2"}],
            "IsTruncated": False,
        }

        count = await storage.clear()

        assert count == 2
        mock_s3_client.delete_objects.assert_called_once()


class TestCloseOperation:
    """Tests for close operation."""

    @pytest.mark.asyncio
    async def test_close_marks_closed(self, storage: JsonS3Storage) -> None:
        """close should mark storage as closed."""
        await storage.close()

        assert storage._closed is True

    @pytest.mark.asyncio
    async def test_operations_fail_after_close(
        self, storage: JsonS3Storage, sample_data: dict[str, Any]
    ) -> None:
        """Operations should fail after close."""
        await storage.close()

        with pytest.raises(JsonS3StorageClosedError):
            await storage.save("test-key", sample_data)

    @pytest.mark.asyncio
    async def test_close_is_idempotent(self, storage: JsonS3Storage) -> None:
        """close should be idempotent."""
        await storage.close()
        await storage.close()  # Should not raise

        assert storage._closed is True


class TestErrorHandling:
    """Tests for error handling."""

    def test_get_errors_empty(self, storage: JsonS3Storage) -> None:
        """get_errors should return empty list initially."""
        errors = storage.get_errors()

        assert errors == []

    def test_get_last_error_none(self, storage: JsonS3Storage) -> None:
        """get_last_error should return None initially."""
        error = storage.get_last_error()

        assert error is None

    def test_clear_errors(self, storage: JsonS3Storage) -> None:
        """clear_errors should clear error history."""
        storage._errors.append(MagicMock())  # type: ignore[arg-type]

        storage.clear_errors()

        assert storage.get_errors() == []


class TestFactoryFunction:
    """Tests for create_storage factory function."""

    def test_create_storage(self, mock_s3_client: MagicMock) -> None:
        """create_storage should return JsonS3Storage instance."""
        storage = create_storage(mock_s3_client, "test-bucket")

        assert isinstance(storage, JsonS3Storage)
        assert storage._bucket_name == "test-bucket"

    def test_create_storage_with_options(self, mock_s3_client: MagicMock) -> None:
        """create_storage should accept configuration options."""
        storage = create_storage(
            mock_s3_client,
            "test-bucket",
            key_prefix="custom:",
            ttl=3600,
            debug=True,
        )

        assert storage._key_prefix == "custom:"
        assert storage._ttl == 3600
        assert storage._debug is True
