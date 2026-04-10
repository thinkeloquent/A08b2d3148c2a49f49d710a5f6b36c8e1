"""
Unit tests for storage module.

Tests cover:
- Statement coverage for all code paths
- Branch coverage for all conditionals
- Boundary value analysis
- Error handling verification
- Log verification (hyper-observability)
"""

from __future__ import annotations

import json
import time
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest

from cache_json_awss3_storage import (
    JsonS3Storage,
    JsonS3StorageClosedError,
    JsonS3StorageConfigError,
    create_storage,
)


class AsyncBytesReader:
    """Async-compatible body reader that mimics aiobotocore's StreamingBody."""

    def __init__(self, data: bytes) -> None:
        self._data = data

    async def read(self) -> bytes:
        return self._data


class TestJsonS3StorageInit:
    """Tests for JsonS3Storage initialization."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        def test_creates_instance_with_required_params(
            self, mock_s3_client: MagicMock, null_logger
        ):
            """Happy path: create instance with minimal config."""
            storage = JsonS3Storage(
                mock_s3_client, bucket_name="test-bucket", logger=null_logger
            )

            assert storage is not None
            assert storage.get_stats().saves == 0

        def test_accepts_all_optional_params(
            self, mock_s3_client: MagicMock, null_logger
        ):
            """All optional params should be accepted."""
            storage = JsonS3Storage(
                mock_s3_client,
                bucket_name="test-bucket",
                key_prefix="custom:",
                hash_keys=["user_id"],
                ttl=3600,
                region="us-west-2",
                debug=True,
                max_error_history=50,
                logger=null_logger,
            )

            assert storage is not None

    class TestBranchCoverage:
        """Test all if/else branches."""

        def test_requires_bucket_name(self, mock_s3_client: MagicMock):
            """Branch: empty bucket_name raises error."""
            with pytest.raises(JsonS3StorageConfigError, match="bucket_name"):
                JsonS3Storage(mock_s3_client, bucket_name="")

        def test_accepts_custom_logger(
            self, mock_s3_client: MagicMock, mock_logger: MagicMock
        ):
            """Branch: custom logger is used."""
            storage = JsonS3Storage(
                mock_s3_client, bucket_name="test-bucket", logger=mock_logger
            )

            assert storage is not None


class TestSaveOperation:
    """Tests for save operation."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_save_returns_key(
            self, mock_s3_client: MagicMock, null_logger, sample_data: dict[str, Any]
        ):
            """Happy path: save returns generated key."""
            storage = JsonS3Storage(
                mock_s3_client, bucket_name="test-bucket", logger=null_logger
            )

            key = await storage.save(sample_data)

            assert len(key) == 16
            assert all(c in "0123456789abcdef" for c in key)

        @pytest.mark.asyncio
        async def test_save_increments_stats(
            self, mock_s3_client: MagicMock, null_logger, sample_data: dict[str, Any]
        ):
            """Save should increment saves counter."""
            storage = JsonS3Storage(
                mock_s3_client, bucket_name="test-bucket", logger=null_logger
            )

            assert storage.get_stats().saves == 0
            await storage.save(sample_data)
            assert storage.get_stats().saves == 1

        @pytest.mark.asyncio
        async def test_save_calls_put_object(
            self, mock_s3_client: MagicMock, null_logger, sample_data: dict[str, Any]
        ):
            """Save should call S3 put_object."""
            storage = JsonS3Storage(
                mock_s3_client, bucket_name="test-bucket", logger=null_logger
            )

            await storage.save(sample_data)

            mock_s3_client.put_object.assert_called_once()

    class TestBranchCoverage:
        """Test all if/else branches."""

        @pytest.mark.asyncio
        async def test_save_with_ttl(
            self, mock_s3_client: MagicMock, null_logger, sample_data: dict[str, Any]
        ):
            """Branch: save with TTL sets expires_at."""
            storage = JsonS3Storage(
                mock_s3_client, bucket_name="test-bucket", logger=null_logger
            )

            await storage.save(sample_data, ttl=3600)

            call_kwargs = mock_s3_client.put_object.call_args.kwargs
            body = json.loads(call_kwargs["Body"])
            assert body["expires_at"] is not None

        @pytest.mark.asyncio
        async def test_save_without_ttl(
            self, mock_s3_client: MagicMock, null_logger, sample_data: dict[str, Any]
        ):
            """Branch: save without TTL has null expires_at."""
            storage = JsonS3Storage(
                mock_s3_client, bucket_name="test-bucket", logger=null_logger
            )

            await storage.save(sample_data)

            call_kwargs = mock_s3_client.put_object.call_args.kwargs
            body = json.loads(call_kwargs["Body"])
            assert body["expires_at"] is None

        @pytest.mark.asyncio
        async def test_save_with_default_ttl(
            self, mock_s3_client: MagicMock, null_logger, sample_data: dict[str, Any]
        ):
            """Branch: save uses default TTL from constructor."""
            storage = JsonS3Storage(
                mock_s3_client, bucket_name="test-bucket", ttl=1800, logger=null_logger
            )

            await storage.save(sample_data)

            call_kwargs = mock_s3_client.put_object.call_args.kwargs
            body = json.loads(call_kwargs["Body"])
            assert body["expires_at"] is not None

    class TestErrorHandling:
        """Test error conditions and exception paths."""

        @pytest.mark.asyncio
        async def test_save_after_close_raises(
            self, mock_s3_client: MagicMock, null_logger, sample_data: dict[str, Any]
        ):
            """Save after close should raise ClosedError."""
            storage = JsonS3Storage(
                mock_s3_client, bucket_name="test-bucket", logger=null_logger
            )
            await storage.close()

            with pytest.raises(JsonS3StorageClosedError):
                await storage.save(sample_data)

        @pytest.mark.asyncio
        async def test_save_records_error_on_failure(
            self, mock_s3_client: MagicMock, null_logger, sample_data: dict[str, Any]
        ):
            """S3 errors should be recorded in error history."""
            mock_s3_client.put_object = AsyncMock(
                side_effect=Exception("Connection refused")
            )
            storage = JsonS3Storage(
                mock_s3_client, bucket_name="test-bucket", logger=null_logger
            )

            with pytest.raises(Exception):
                await storage.save(sample_data)

            assert storage.get_stats().errors >= 1

    class TestLogVerification:
        """Verify defensive logging at control flow points."""

        @pytest.mark.asyncio
        async def test_save_logs_entry_and_completion(
            self,
            mock_s3_client: MagicMock,
            capturing_logger: MagicMock,
            log_capture: dict[str, list[str]],
            sample_data: dict[str, Any],
        ):
            """Save should log start and completion."""
            storage = JsonS3Storage(
                mock_s3_client, bucket_name="test-bucket", logger=capturing_logger
            )

            await storage.save(sample_data)

            assert any("save:" in msg for msg in log_capture["debug"])
            assert any("completed" in msg for msg in log_capture["info"])


class TestLoadOperation:
    """Tests for load operation."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_load_by_key(
            self, mock_s3_client: MagicMock, null_logger, sample_entry: dict[str, Any]
        ):
            """Happy path: load by key returns data."""
            mock_s3_client.get_object = AsyncMock(
                return_value={
                    "Body": AsyncBytesReader(json.dumps(sample_entry).encode("utf-8"))
                }
            )
            storage = JsonS3Storage(
                mock_s3_client, bucket_name="test-bucket", logger=null_logger
            )

            result = await storage.load("abc123def456")

            assert result == sample_entry["data"]

        @pytest.mark.asyncio
        async def test_load_by_data(
            self, mock_s3_client: MagicMock, null_logger, sample_entry: dict[str, Any]
        ):
            """Load by data dict generates key and loads."""
            mock_s3_client.get_object = AsyncMock(
                return_value={
                    "Body": AsyncBytesReader(json.dumps(sample_entry).encode("utf-8"))
                }
            )
            storage = JsonS3Storage(
                mock_s3_client, bucket_name="test-bucket", logger=null_logger
            )

            result = await storage.load({"user_id": 123, "name": "Alice"})

            assert result is not None

    class TestBranchCoverage:
        """Test all if/else branches."""

        @pytest.mark.asyncio
        async def test_load_not_found_returns_none(
            self, mock_s3_client: MagicMock, null_logger
        ):
            """Branch: object not found returns None."""
            mock_s3_client.get_object = AsyncMock(
                side_effect=Exception("NoSuchKey: Key not found")
            )
            storage = JsonS3Storage(
                mock_s3_client, bucket_name="test-bucket", logger=null_logger
            )

            result = await storage.load("nonexistent")

            assert result is None
            assert storage.get_stats().misses == 1

        @pytest.mark.asyncio
        async def test_load_expired_returns_none(
            self, mock_s3_client: MagicMock, null_logger, expired_entry: dict[str, Any]
        ):
            """Branch: expired entry returns None."""
            mock_s3_client.get_object = AsyncMock(
                return_value={
                    "Body": AsyncBytesReader(json.dumps(expired_entry).encode("utf-8"))
                }
            )
            storage = JsonS3Storage(
                mock_s3_client, bucket_name="test-bucket", logger=null_logger
            )

            result = await storage.load("expired123")

            assert result is None
            assert storage.get_stats().misses == 1

        @pytest.mark.asyncio
        async def test_load_expired_with_ignore_expiry(
            self, mock_s3_client: MagicMock, null_logger, expired_entry: dict[str, Any]
        ):
            """Branch: ignore_expiry=True returns expired data."""
            mock_s3_client.get_object = AsyncMock(
                return_value={
                    "Body": AsyncBytesReader(json.dumps(expired_entry).encode("utf-8"))
                }
            )
            storage = JsonS3Storage(
                mock_s3_client, bucket_name="test-bucket", logger=null_logger
            )

            result = await storage.load("expired123", ignore_expiry=True)

            assert result == expired_entry["data"]
            assert storage.get_stats().hits == 1


class TestDeleteOperation:
    """Tests for delete operation."""

    @pytest.mark.asyncio
    async def test_delete_returns_true(self, mock_s3_client: MagicMock, null_logger):
        """Delete always returns True (S3 is idempotent)."""
        storage = JsonS3Storage(
            mock_s3_client, bucket_name="test-bucket", logger=null_logger
        )

        result = await storage.delete("test123")

        assert result is True

    @pytest.mark.asyncio
    async def test_delete_increments_stats(
        self, mock_s3_client: MagicMock, null_logger
    ):
        """Delete should increment deletes counter."""
        storage = JsonS3Storage(
            mock_s3_client, bucket_name="test-bucket", logger=null_logger
        )

        await storage.delete("test123")

        assert storage.get_stats().deletes == 1


class TestExistsOperation:
    """Tests for exists operation."""

    @pytest.mark.asyncio
    async def test_exists_returns_true(self, mock_s3_client: MagicMock, null_logger):
        """Exists returns True when object exists."""
        storage = JsonS3Storage(
            mock_s3_client, bucket_name="test-bucket", logger=null_logger
        )

        result = await storage.exists("test123")

        assert result is True

    @pytest.mark.asyncio
    async def test_exists_returns_false(self, mock_s3_client: MagicMock, null_logger):
        """Exists returns False when object doesn't exist."""
        mock_s3_client.head_object = AsyncMock(side_effect=Exception("404 Not Found"))
        storage = JsonS3Storage(
            mock_s3_client, bucket_name="test-bucket", logger=null_logger
        )

        result = await storage.exists("nonexistent")

        assert result is False


class TestBulkOperations:
    """Tests for bulk operations (listKeys, clear, cleanupExpired)."""

    @pytest.mark.asyncio
    async def test_list_keys_empty(self, mock_s3_client: MagicMock, null_logger):
        """List keys returns empty list for empty bucket."""
        storage = JsonS3Storage(
            mock_s3_client, bucket_name="test-bucket", logger=null_logger
        )

        keys = await storage.list_keys()

        assert keys == []

    @pytest.mark.asyncio
    async def test_list_keys_returns_keys(self, mock_s3_client: MagicMock, null_logger):
        """List keys returns stripped keys."""
        mock_s3_client.list_objects_v2 = AsyncMock(
            return_value={
                "Contents": [{"Key": "jss3:key1"}, {"Key": "jss3:key2"}],
                "IsTruncated": False,
            }
        )
        storage = JsonS3Storage(
            mock_s3_client, bucket_name="test-bucket", logger=null_logger
        )

        keys = await storage.list_keys()

        assert keys == ["key1", "key2"]

    @pytest.mark.asyncio
    async def test_clear_empty_bucket(self, mock_s3_client: MagicMock, null_logger):
        """Clear returns 0 for empty bucket."""
        storage = JsonS3Storage(
            mock_s3_client, bucket_name="test-bucket", logger=null_logger
        )

        count = await storage.clear()

        assert count == 0


class TestCloseOperation:
    """Tests for close operation."""

    @pytest.mark.asyncio
    async def test_close_marks_closed(self, mock_s3_client: MagicMock, null_logger):
        """Close marks storage as closed."""
        storage = JsonS3Storage(
            mock_s3_client, bucket_name="test-bucket", logger=null_logger
        )

        await storage.close()

        with pytest.raises(JsonS3StorageClosedError):
            await storage.save({"test": "data"})

    @pytest.mark.asyncio
    async def test_close_is_idempotent(self, mock_s3_client: MagicMock, null_logger):
        """Multiple close calls should not raise."""
        storage = JsonS3Storage(
            mock_s3_client, bucket_name="test-bucket", logger=null_logger
        )

        await storage.close()
        await storage.close()  # Should not raise


class TestErrorHandling:
    """Tests for error tracking."""

    def test_get_errors_empty(self, mock_s3_client: MagicMock, null_logger):
        """Initial error list should be empty."""
        storage = JsonS3Storage(
            mock_s3_client, bucket_name="test-bucket", logger=null_logger
        )

        assert storage.get_errors() == []

    def test_get_last_error_none(self, mock_s3_client: MagicMock, null_logger):
        """Initial last error should be None."""
        storage = JsonS3Storage(
            mock_s3_client, bucket_name="test-bucket", logger=null_logger
        )

        assert storage.get_last_error() is None

    def test_clear_errors(self, mock_s3_client: MagicMock, null_logger):
        """Clear errors should empty error list."""
        storage = JsonS3Storage(
            mock_s3_client, bucket_name="test-bucket", logger=null_logger
        )

        storage.clear_errors()

        assert storage.get_errors() == []


class TestFactoryFunction:
    """Tests for create_storage factory."""

    def test_create_storage(self, mock_s3_client: MagicMock):
        """Factory should create JsonS3Storage instance."""
        storage = create_storage(mock_s3_client, bucket_name="test-bucket")

        assert isinstance(storage, JsonS3Storage)

    def test_create_storage_with_options(self, mock_s3_client: MagicMock):
        """Factory should accept all options."""
        storage = create_storage(
            mock_s3_client,
            bucket_name="test-bucket",
            key_prefix="custom:",
            ttl=3600,
            debug=True,
        )

        assert isinstance(storage, JsonS3Storage)


class TestContextManager:
    """Tests for async context manager support."""

    @pytest.mark.asyncio
    async def test_context_manager(
        self, mock_s3_client: MagicMock, null_logger, sample_data: dict[str, Any]
    ):
        """Storage works as async context manager."""
        async with JsonS3Storage(
            mock_s3_client, bucket_name="test-bucket", logger=null_logger
        ) as storage:
            key = await storage.save(sample_data)
            assert len(key) == 16

        # After context exit, storage should be closed
        with pytest.raises(JsonS3StorageClosedError):
            await storage.save(sample_data)
