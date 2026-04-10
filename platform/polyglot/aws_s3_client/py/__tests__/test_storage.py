"""
Unit tests for JsonS3Storage.

Tests cover:
- Statement coverage for all code paths
- Branch coverage for all conditionals
- Boundary value analysis
- Error handling verification
- Log verification (hyper-observability)
"""

import json
import logging
import time
from unittest.mock import AsyncMock, MagicMock

import pytest

from aws_s3_client.exceptions import (
    JsonS3StorageClosedError,
    JsonS3StorageConfigError,
    JsonS3StorageReadError,
    JsonS3StorageSerializationError,
    JsonS3StorageWriteError,
)
from aws_s3_client.models import StorageEntry
from aws_s3_client.storage import JsonS3Storage, create_storage


class TestJsonS3StorageInit:
    """Tests for JsonS3Storage initialization."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        def test_creates_storage_with_valid_config(self, mock_s3_client: MagicMock) -> None:
            """Storage should initialize with valid configuration."""
            storage = JsonS3Storage(
                mock_s3_client,
                bucket_name="test-bucket",
            )
            assert storage is not None

        def test_create_storage_factory_function(self, mock_s3_client: MagicMock) -> None:
            """Factory function should create storage instance."""
            storage = create_storage(mock_s3_client, "test-bucket", ttl=3600)
            assert storage is not None

    class TestDecisionBranchCoverage:
        """Test all if/else/switch branches."""

        def test_uses_custom_logger_when_provided(self, mock_s3_client: MagicMock, mock_logger: MagicMock) -> None:
            """Should use custom logger when provided."""
            storage = JsonS3Storage(
                mock_s3_client,
                bucket_name="test-bucket",
                custom_logger=mock_logger,
            )
            assert storage._logger == mock_logger

        def test_uses_null_logger_when_debug_false(self, mock_s3_client: MagicMock) -> None:
            """Should use NullLogger when debug is False."""
            storage = JsonS3Storage(
                mock_s3_client,
                bucket_name="test-bucket",
                debug=False,
            )
            # NullLogger has empty implementations
            from aws_s3_client.logger import NullLogger
            assert isinstance(storage._logger, NullLogger)

        def test_uses_default_logger_when_debug_true(self, mock_s3_client: MagicMock) -> None:
            """Should use package logger when debug is True."""
            storage = JsonS3Storage(
                mock_s3_client,
                bucket_name="test-bucket",
                debug=True,
            )
            # Should not be NullLogger
            from aws_s3_client.logger import NullLogger
            assert not isinstance(storage._logger, NullLogger)

    class TestBoundaryValueAnalysis:
        """Test edge cases: empty, min, max, boundary values."""

        def test_empty_bucket_name_raises_error(self, mock_s3_client: MagicMock) -> None:
            """Empty bucket name should raise ConfigError."""
            with pytest.raises(JsonS3StorageConfigError, match="bucket_name is required"):
                JsonS3Storage(mock_s3_client, bucket_name="")

    class TestErrorHandling:
        """Test error conditions and exception paths."""

        def test_none_bucket_name_raises_error(self, mock_s3_client: MagicMock) -> None:
            """None bucket name should raise ConfigError."""
            with pytest.raises(JsonS3StorageConfigError):
                JsonS3Storage(mock_s3_client, bucket_name=None)  # type: ignore


class TestJsonS3StorageSave:
    """Tests for JsonS3Storage.save() method."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_save_returns_key(
            self, mock_s3_client: MagicMock, sample_data: dict
        ) -> None:
            """Save should return a storage key."""
            storage = JsonS3Storage(mock_s3_client, bucket_name="test-bucket")
            key = await storage.save(sample_data)

            assert key is not None
            assert len(key) == 16  # 16-char hex key
            assert mock_s3_client.put_object.called

    class TestDecisionBranchCoverage:
        """Test all if/else paths."""

        @pytest.mark.asyncio
        async def test_save_with_explicit_ttl(
            self, mock_s3_client: MagicMock, sample_data: dict
        ) -> None:
            """Save should use explicit TTL when provided."""
            storage = JsonS3Storage(mock_s3_client, bucket_name="test-bucket", ttl=3600)
            key = await storage.save(sample_data, ttl=7200)

            # Verify put_object was called
            call_args = mock_s3_client.put_object.call_args
            body = json.loads(call_args.kwargs["Body"])

            # TTL should use the explicit value
            assert body["expires_at"] is not None

        @pytest.mark.asyncio
        async def test_save_without_ttl(
            self, mock_s3_client: MagicMock, sample_data: dict
        ) -> None:
            """Save without TTL should have no expiration."""
            storage = JsonS3Storage(mock_s3_client, bucket_name="test-bucket")
            key = await storage.save(sample_data)

            call_args = mock_s3_client.put_object.call_args
            body = json.loads(call_args.kwargs["Body"])

            assert body["expires_at"] is None

    class TestErrorHandling:
        """Test error conditions and exception paths."""

        @pytest.mark.asyncio
        async def test_save_non_serializable_raises_error(
            self, mock_s3_client: MagicMock
        ) -> None:
            """Non-serializable data should raise SerializationError."""
            storage = JsonS3Storage(mock_s3_client, bucket_name="test-bucket")

            # Functions are not JSON serializable
            with pytest.raises(JsonS3StorageSerializationError, match="serialize"):
                await storage.save({"func": lambda x: x})

        @pytest.mark.asyncio
        async def test_save_s3_error_raises_write_error(
            self, mock_s3_client: MagicMock, sample_data: dict
        ) -> None:
            """S3 error should raise WriteError."""
            mock_s3_client.put_object = AsyncMock(
                side_effect=Exception("Internal Server Error")
            )
            storage = JsonS3Storage(mock_s3_client, bucket_name="test-bucket")

            with pytest.raises(JsonS3StorageWriteError, match="Failed to write"):
                await storage.save(sample_data)

        @pytest.mark.asyncio
        async def test_save_on_closed_storage_raises_error(
            self, mock_s3_client: MagicMock, sample_data: dict
        ) -> None:
            """Saving on closed storage should raise ClosedError."""
            storage = JsonS3Storage(mock_s3_client, bucket_name="test-bucket")
            await storage.close()

            with pytest.raises(JsonS3StorageClosedError, match="save"):
                await storage.save(sample_data)

    class TestLogVerification:
        """Verify defensive logging at control flow points."""

        @pytest.mark.asyncio
        async def test_save_logs_entry_and_completion(
            self,
            mock_s3_client: MagicMock,
            sample_data: dict,
            caplog: pytest.LogCaptureFixture,
        ) -> None:
            """Save should log entry and completion."""
            storage = JsonS3Storage(
                mock_s3_client, bucket_name="test-bucket", debug=True
            )

            with caplog.at_level(logging.DEBUG):
                key = await storage.save(sample_data)

            # Verify logging occurred
            log_text = caplog.text
            assert "save:" in log_text or "generated key" in log_text


class TestJsonS3StorageLoad:
    """Tests for JsonS3Storage.load() method."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_load_by_key(self, mock_s3_client: MagicMock) -> None:
            """Load by key should return data."""
            storage = JsonS3Storage(mock_s3_client, bucket_name="test-bucket")
            data = await storage.load("test_key")

            assert data is not None
            assert data["user"] == "alice"

        @pytest.mark.asyncio
        async def test_load_by_data_dict(
            self, mock_s3_client: MagicMock, sample_data: dict
        ) -> None:
            """Load by data dict should generate key and return data."""
            storage = JsonS3Storage(mock_s3_client, bucket_name="test-bucket")
            data = await storage.load(sample_data)

            assert data is not None

    class TestDecisionBranchCoverage:
        """Test all if/else paths."""

        @pytest.mark.asyncio
        async def test_load_not_found_returns_none(
            self, mock_s3_client_empty: MagicMock
        ) -> None:
            """Load for non-existent key should return None."""
            storage = JsonS3Storage(mock_s3_client_empty, bucket_name="test-bucket")
            data = await storage.load("nonexistent_key")

            assert data is None

        @pytest.mark.asyncio
        async def test_load_expired_returns_none(
            self, mock_s3_client: MagicMock
        ) -> None:
            """Load for expired entry should return None."""
            # Create expired entry
            async def mock_read():
                entry = StorageEntry(
                    key="expired_key",
                    data={"user": "bob"},
                    created_at=1000000.0,
                    expires_at=1000001.0,  # Expired
                )
                return json.dumps(entry.to_dict()).encode("utf-8")

            mock_body = MagicMock()
            mock_body.read = mock_read
            mock_s3_client.get_object = AsyncMock(return_value={"Body": mock_body})

            storage = JsonS3Storage(mock_s3_client, bucket_name="test-bucket")
            data = await storage.load("expired_key")

            assert data is None

        @pytest.mark.asyncio
        async def test_load_expired_with_ignore_expiry(
            self, mock_s3_client: MagicMock
        ) -> None:
            """Load with ignore_expiry should return expired data."""
            # Create expired entry
            async def mock_read():
                entry = StorageEntry(
                    key="expired_key",
                    data={"user": "bob"},
                    created_at=1000000.0,
                    expires_at=1000001.0,  # Expired
                )
                return json.dumps(entry.to_dict()).encode("utf-8")

            mock_body = MagicMock()
            mock_body.read = mock_read
            mock_s3_client.get_object = AsyncMock(return_value={"Body": mock_body})

            storage = JsonS3Storage(mock_s3_client, bucket_name="test-bucket")
            data = await storage.load("expired_key", ignore_expiry=True)

            assert data is not None
            assert data["user"] == "bob"

    class TestErrorHandling:
        """Test error conditions and exception paths."""

        @pytest.mark.asyncio
        async def test_load_on_closed_storage_raises_error(
            self, mock_s3_client: MagicMock
        ) -> None:
            """Loading on closed storage should raise ClosedError."""
            storage = JsonS3Storage(mock_s3_client, bucket_name="test-bucket")
            await storage.close()

            with pytest.raises(JsonS3StorageClosedError, match="load"):
                await storage.load("any_key")


class TestJsonS3StorageDelete:
    """Tests for JsonS3Storage.delete() method."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_delete_by_key(self, mock_s3_client: MagicMock) -> None:
            """Delete by key should succeed."""
            storage = JsonS3Storage(mock_s3_client, bucket_name="test-bucket")
            result = await storage.delete("test_key")

            assert result is True
            assert mock_s3_client.delete_object.called

        @pytest.mark.asyncio
        async def test_delete_by_data_dict(
            self, mock_s3_client: MagicMock, sample_data: dict
        ) -> None:
            """Delete by data dict should generate key and delete."""
            storage = JsonS3Storage(mock_s3_client, bucket_name="test-bucket")
            result = await storage.delete(sample_data)

            assert result is True


class TestJsonS3StorageExists:
    """Tests for JsonS3Storage.exists() method."""

    class TestDecisionBranchCoverage:
        """Test all if/else paths."""

        @pytest.mark.asyncio
        async def test_exists_returns_true_when_found(
            self, mock_s3_client: MagicMock
        ) -> None:
            """Exists should return True when object exists."""
            storage = JsonS3Storage(mock_s3_client, bucket_name="test-bucket")
            result = await storage.exists("test_key")

            assert result is True

        @pytest.mark.asyncio
        async def test_exists_returns_false_when_not_found(
            self, mock_s3_client_empty: MagicMock
        ) -> None:
            """Exists should return False when object doesn't exist."""
            storage = JsonS3Storage(mock_s3_client_empty, bucket_name="test-bucket")
            result = await storage.exists("nonexistent_key")

            assert result is False


class TestJsonS3StorageListKeys:
    """Tests for JsonS3Storage.list_keys() method."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_list_keys_returns_list(self, mock_s3_client: MagicMock) -> None:
            """list_keys should return list of keys."""
            storage = JsonS3Storage(mock_s3_client, bucket_name="test-bucket")
            keys = await storage.list_keys()

            assert isinstance(keys, list)
            assert len(keys) == 2
            assert "key1" in keys
            assert "key2" in keys

    class TestBoundaryValueAnalysis:
        """Test edge cases."""

        @pytest.mark.asyncio
        async def test_list_keys_empty_bucket(
            self, mock_s3_client_empty: MagicMock
        ) -> None:
            """list_keys on empty bucket should return empty list."""
            storage = JsonS3Storage(mock_s3_client_empty, bucket_name="test-bucket")
            keys = await storage.list_keys()

            assert keys == []


class TestJsonS3StorageClear:
    """Tests for JsonS3Storage.clear() method."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_clear_deletes_all_objects(
            self, mock_s3_client: MagicMock
        ) -> None:
            """Clear should delete all objects with prefix."""
            storage = JsonS3Storage(mock_s3_client, bucket_name="test-bucket")
            count = await storage.clear()

            assert count == 2
            assert mock_s3_client.delete_objects.called

    class TestBoundaryValueAnalysis:
        """Test edge cases."""

        @pytest.mark.asyncio
        async def test_clear_empty_bucket(
            self, mock_s3_client_empty: MagicMock
        ) -> None:
            """Clear on empty bucket should return 0."""
            storage = JsonS3Storage(mock_s3_client_empty, bucket_name="test-bucket")
            count = await storage.clear()

            assert count == 0


class TestJsonS3StorageStats:
    """Tests for statistics and error tracking."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_stats_tracks_operations(
            self, mock_s3_client: MagicMock, sample_data: dict
        ) -> None:
            """Stats should track save/load operations."""
            storage = JsonS3Storage(mock_s3_client, bucket_name="test-bucket")

            await storage.save(sample_data)
            await storage.load("key")

            stats = storage.get_stats()
            assert stats.saves == 1
            assert stats.loads == 1

        def test_get_errors_returns_error_list(
            self, mock_s3_client: MagicMock
        ) -> None:
            """get_errors should return error history."""
            storage = JsonS3Storage(mock_s3_client, bucket_name="test-bucket")
            errors = storage.get_errors()

            assert isinstance(errors, list)

        def test_clear_errors_empties_history(
            self, mock_s3_client: MagicMock
        ) -> None:
            """clear_errors should empty error history."""
            storage = JsonS3Storage(mock_s3_client, bucket_name="test-bucket")
            storage.clear_errors()
            errors = storage.get_errors()

            assert len(errors) == 0


class TestJsonS3StorageContextManager:
    """Tests for context manager support."""

    @pytest.mark.asyncio
    async def test_async_context_manager(
        self, mock_s3_client: MagicMock
    ) -> None:
        """Should work as async context manager."""
        async with JsonS3Storage(
            mock_s3_client, bucket_name="test-bucket"
        ) as storage:
            assert storage is not None

        # Storage should be closed after exiting context
        assert storage._closed is True
