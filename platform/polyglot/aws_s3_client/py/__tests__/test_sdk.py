"""
Unit tests for S3StorageSDK.

Tests cover:
- Statement coverage for all code paths
- Branch coverage for all conditionals
- Error handling verification
- SDK response envelope pattern
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from aws_s3_client.config import SDKConfig
from aws_s3_client.sdk import S3StorageSDK, SDKResponse, create_sdk


class TestSDKResponse:
    """Tests for SDKResponse dataclass."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        def test_creates_success_response(self) -> None:
            """SDKResponse should create success response."""
            response = SDKResponse(
                success=True,
                data={"key": "value"},
                key="abc123",
                elapsed_ms=10.5,
            )

            assert response.success is True
            assert response.data == {"key": "value"}
            assert response.key == "abc123"
            assert response.elapsed_ms == 10.5
            assert response.error is None

        def test_creates_error_response(self) -> None:
            """SDKResponse should create error response."""
            response = SDKResponse(
                success=False,
                data=None,
                key=None,
                elapsed_ms=5.0,
                error="Something went wrong",
            )

            assert response.success is False
            assert response.data is None
            assert response.error == "Something went wrong"

        def test_to_dict_serialization(self) -> None:
            """to_dict should produce JSON-serializable dict."""
            response = SDKResponse(
                success=True,
                data="test_key",
                key="test_key",
                elapsed_ms=10.0,
            )

            result = response.to_dict()

            assert isinstance(result, dict)
            assert result["success"] is True
            assert result["data"] == "test_key"
            assert result["elapsed_ms"] == 10.0


class TestS3StorageSDK:
    """Tests for S3StorageSDK class."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        def test_creates_sdk_with_config(self, sdk_config: SDKConfig) -> None:
            """SDK should initialize with config."""
            sdk = S3StorageSDK(sdk_config)
            assert sdk is not None

        def test_create_sdk_factory_function(self, sdk_config: SDKConfig) -> None:
            """Factory function should create SDK instance."""
            sdk = create_sdk(sdk_config)
            assert sdk is not None

    class TestDecisionBranchCoverage:
        """Test all if/else paths."""

        def test_uses_custom_logger(
            self, sdk_config: SDKConfig, mock_logger: MagicMock
        ) -> None:
            """SDK should use custom logger when provided."""
            sdk = S3StorageSDK(sdk_config, custom_logger=mock_logger)
            assert sdk._logger == mock_logger

        def test_uses_null_logger_when_debug_false(
            self, sdk_config_minimal: SDKConfig
        ) -> None:
            """SDK should use NullLogger when debug is False."""
            from aws_s3_client.logger import NullLogger

            sdk = S3StorageSDK(sdk_config_minimal)
            assert isinstance(sdk._logger, NullLogger)


class TestS3StorageSDKSave:
    """Tests for SDK save operation."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_save_returns_success_response(
            self, sdk_config: SDKConfig, sample_data: dict
        ) -> None:
            """Save should return success response with key."""
            with patch("aws_s3_client.sdk.get_session") as mock_session:
                # Setup mock
                mock_s3 = AsyncMock()
                mock_s3.put_object = AsyncMock(return_value={"ETag": '"abc"'})
                mock_ctx = AsyncMock()
                mock_ctx.__aenter__ = AsyncMock(return_value=mock_s3)
                mock_ctx.__aexit__ = AsyncMock()
                mock_session.return_value.create_client.return_value = mock_ctx

                sdk = create_sdk(sdk_config)

                try:
                    response = await sdk.save(sample_data)

                    assert response.success is True
                    assert response.key is not None
                    assert len(response.key) == 16
                    assert response.elapsed_ms > 0
                finally:
                    await sdk.close()

    class TestErrorHandling:
        """Test error conditions."""

        @pytest.mark.asyncio
        async def test_save_error_returns_failure_response(
            self, sdk_config: SDKConfig
        ) -> None:
            """Save error should return failure response."""
            with patch("aws_s3_client.sdk.get_session") as mock_session:
                # Setup mock that raises error
                mock_s3 = AsyncMock()
                mock_s3.put_object = AsyncMock(
                    side_effect=Exception("S3 Error")
                )
                mock_ctx = AsyncMock()
                mock_ctx.__aenter__ = AsyncMock(return_value=mock_s3)
                mock_ctx.__aexit__ = AsyncMock()
                mock_session.return_value.create_client.return_value = mock_ctx

                sdk = create_sdk(sdk_config)

                try:
                    response = await sdk.save({"test": "data"})

                    assert response.success is False
                    assert response.error is not None
                    assert "S3 Error" in response.error
                finally:
                    await sdk.close()


class TestS3StorageSDKLoad:
    """Tests for SDK load operation."""

    class TestDecisionBranchCoverage:
        """Test all if/else paths."""

        @pytest.mark.asyncio
        async def test_load_by_string_key(self, sdk_config: SDKConfig) -> None:
            """Load by string key should include key in response."""
            with patch("aws_s3_client.sdk.get_session") as mock_session:
                # Setup mock with proper response
                import json

                from aws_s3_client.models import StorageEntry

                entry = StorageEntry(
                    key="test_key",
                    data={"user": "alice"},
                    created_at=1700000000.0,
                    expires_at=None,
                )

                async def mock_read():
                    return json.dumps(entry.to_dict()).encode("utf-8")

                mock_body = MagicMock()
                mock_body.read = mock_read

                mock_s3 = AsyncMock()
                mock_s3.get_object = AsyncMock(return_value={"Body": mock_body})
                mock_ctx = AsyncMock()
                mock_ctx.__aenter__ = AsyncMock(return_value=mock_s3)
                mock_ctx.__aexit__ = AsyncMock()
                mock_session.return_value.create_client.return_value = mock_ctx

                sdk = create_sdk(sdk_config)

                try:
                    response = await sdk.load("test_key")

                    assert response.success is True
                    assert response.key == "test_key"
                finally:
                    await sdk.close()


class TestS3StorageSDKDelete:
    """Tests for SDK delete operation."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_delete_returns_success_response(
            self, sdk_config: SDKConfig
        ) -> None:
            """Delete should return success response."""
            with patch("aws_s3_client.sdk.get_session") as mock_session:
                mock_s3 = AsyncMock()
                mock_s3.delete_object = AsyncMock(return_value={})
                mock_ctx = AsyncMock()
                mock_ctx.__aenter__ = AsyncMock(return_value=mock_s3)
                mock_ctx.__aexit__ = AsyncMock()
                mock_session.return_value.create_client.return_value = mock_ctx

                sdk = create_sdk(sdk_config)

                try:
                    response = await sdk.delete("test_key")

                    assert response.success is True
                    assert response.data is True
                finally:
                    await sdk.close()


class TestS3StorageSDKExists:
    """Tests for SDK exists operation."""

    class TestDecisionBranchCoverage:
        """Test all if/else paths."""

        @pytest.mark.asyncio
        async def test_exists_returns_true_when_found(
            self, sdk_config: SDKConfig
        ) -> None:
            """Exists should return True when object exists."""
            with patch("aws_s3_client.sdk.get_session") as mock_session:
                mock_s3 = AsyncMock()
                mock_s3.head_object = AsyncMock(return_value={"ContentLength": 100})
                mock_ctx = AsyncMock()
                mock_ctx.__aenter__ = AsyncMock(return_value=mock_s3)
                mock_ctx.__aexit__ = AsyncMock()
                mock_session.return_value.create_client.return_value = mock_ctx

                sdk = create_sdk(sdk_config)

                try:
                    response = await sdk.exists("test_key")

                    assert response.success is True
                    assert response.data is True
                finally:
                    await sdk.close()


class TestS3StorageSDKListKeys:
    """Tests for SDK list_keys operation."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_list_keys_returns_list(self, sdk_config: SDKConfig) -> None:
            """list_keys should return list of keys."""
            with patch("aws_s3_client.sdk.get_session") as mock_session:
                mock_s3 = AsyncMock()
                mock_s3.list_objects_v2 = AsyncMock(return_value={
                    "Contents": [
                        {"Key": "jss3:key1"},
                        {"Key": "jss3:key2"},
                    ],
                    "IsTruncated": False,
                })
                mock_ctx = AsyncMock()
                mock_ctx.__aenter__ = AsyncMock(return_value=mock_s3)
                mock_ctx.__aexit__ = AsyncMock()
                mock_session.return_value.create_client.return_value = mock_ctx

                sdk = create_sdk(sdk_config)

                try:
                    response = await sdk.list_keys()

                    assert response.success is True
                    assert isinstance(response.data, list)
                    assert len(response.data) == 2
                finally:
                    await sdk.close()


class TestS3StorageSDKStats:
    """Tests for SDK stats operation."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_stats_returns_stats_dict(self, sdk_config: SDKConfig) -> None:
            """Stats should return stats dictionary."""
            with patch("aws_s3_client.sdk.get_session") as mock_session:
                mock_s3 = AsyncMock()
                mock_ctx = AsyncMock()
                mock_ctx.__aenter__ = AsyncMock(return_value=mock_s3)
                mock_ctx.__aexit__ = AsyncMock()
                mock_session.return_value.create_client.return_value = mock_ctx

                sdk = create_sdk(sdk_config)

                try:
                    response = await sdk.stats()

                    assert response.success is True
                    assert isinstance(response.data, dict)
                    assert "saves" in response.data
                    assert "loads" in response.data
                finally:
                    await sdk.close()


class TestS3StorageSDKClose:
    """Tests for SDK close operation."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_close_marks_sdk_closed(self, sdk_config: SDKConfig) -> None:
            """Close should mark SDK as closed."""
            with patch("aws_s3_client.sdk.get_session") as mock_session:
                mock_s3 = AsyncMock()
                mock_ctx = AsyncMock()
                mock_ctx.__aenter__ = AsyncMock(return_value=mock_s3)
                mock_ctx.__aexit__ = AsyncMock()
                mock_session.return_value.create_client.return_value = mock_ctx

                sdk = create_sdk(sdk_config)
                await sdk.close()

                assert sdk._closed is True

        @pytest.mark.asyncio
        async def test_close_is_idempotent(self, sdk_config: SDKConfig) -> None:
            """Multiple close calls should not error."""
            with patch("aws_s3_client.sdk.get_session") as mock_session:
                mock_s3 = AsyncMock()
                mock_ctx = AsyncMock()
                mock_ctx.__aenter__ = AsyncMock(return_value=mock_s3)
                mock_ctx.__aexit__ = AsyncMock()
                mock_session.return_value.create_client.return_value = mock_ctx

                sdk = create_sdk(sdk_config)
                await sdk.close()
                await sdk.close()  # Should not raise

                assert sdk._closed is True

    class TestIntegration:
        """Context manager support."""

        @pytest.mark.asyncio
        async def test_async_context_manager(self, sdk_config: SDKConfig) -> None:
            """SDK should work as async context manager."""
            with patch("aws_s3_client.sdk.get_session") as mock_session:
                mock_s3 = AsyncMock()
                mock_ctx = AsyncMock()
                mock_ctx.__aenter__ = AsyncMock(return_value=mock_s3)
                mock_ctx.__aexit__ = AsyncMock()
                mock_session.return_value.create_client.return_value = mock_ctx

                async with create_sdk(sdk_config) as sdk:
                    assert sdk is not None

                assert sdk._closed is True
