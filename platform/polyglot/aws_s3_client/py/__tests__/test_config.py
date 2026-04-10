"""
Unit tests for SDKConfig.

Tests cover:
- Statement coverage for all code paths
- Branch coverage for all conditionals
- Environment variable loading
- Validation
"""

import os

import pytest

from aws_s3_client.config import SDKConfig, config_from_env, validate_config


class TestSDKConfig:
    """Tests for SDKConfig dataclass."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        def test_creates_config_with_bucket_name(self) -> None:
            """SDKConfig should create with bucket name."""
            config = SDKConfig(bucket_name="test-bucket")

            assert config.bucket_name == "test-bucket"

        def test_creates_config_with_all_options(self) -> None:
            """SDKConfig should create with all options."""
            config = SDKConfig(
                bucket_name="test-bucket",
                region="us-west-2",
                key_prefix="custom:",
                ttl=7200,
                debug=True,
                hash_keys=["id", "name"],
                aws_access_key_id="AKIATEST",
                aws_secret_access_key="********",
                endpoint_url="http://localhost:4566",
            )

            assert config.bucket_name == "test-bucket"
            assert config.region == "us-west-2"
            assert config.key_prefix == "custom:"
            assert config.ttl == 7200
            assert config.debug is True
            assert config.hash_keys == ["id", "name"]
            assert config.aws_access_key_id == "AKIATEST"
            assert config.aws_secret_access_key == "********"
            assert config.endpoint_url == "http://localhost:4566"

    class TestDecisionBranchCoverage:
        """Test all if/else paths."""

        def test_default_values(self) -> None:
            """SDKConfig should have correct defaults."""
            config = SDKConfig(bucket_name="test-bucket")

            assert config.region == "us-east-1"
            assert config.key_prefix == "jss3:"
            assert config.debug is False


class TestConfigFromEnv:
    """Tests for config_from_env function."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        def test_loads_from_env_vars(
            self, clean_env, monkeypatch: pytest.MonkeyPatch
        ) -> None:
            """config_from_env should load from environment variables."""
            monkeypatch.setenv("AWS_S3_BUCKET_NAME", "env-bucket")
            monkeypatch.setenv("AWS_S3_REGION", "eu-west-1")
            monkeypatch.setenv("AWS_S3_KEY_PREFIX", "env:")
            monkeypatch.setenv("AWS_S3_TTL", "1800")
            monkeypatch.setenv("AWS_S3_DEBUG", "true")

            config = config_from_env()

            assert config.bucket_name == "env-bucket"
            assert config.region == "eu-west-1"
            assert config.key_prefix == "env:"
            assert config.ttl == 1800
            assert config.debug is True

    class TestDecisionBranchCoverage:
        """Test all if/else paths."""

        def test_returns_none_without_bucket_name(
            self, clean_env, monkeypatch: pytest.MonkeyPatch
        ) -> None:
            """config_from_env should return None without bucket name."""
            # Clear the env var
            monkeypatch.delenv("AWS_S3_BUCKET_NAME", raising=False)

            config = config_from_env()

            assert config is None

        def test_uses_default_values(
            self, clean_env, monkeypatch: pytest.MonkeyPatch
        ) -> None:
            """config_from_env should use defaults for missing vars."""
            monkeypatch.setenv("AWS_S3_BUCKET_NAME", "env-bucket")
            monkeypatch.delenv("AWS_S3_REGION", raising=False)
            monkeypatch.delenv("AWS_S3_KEY_PREFIX", raising=False)
            monkeypatch.delenv("AWS_S3_TTL", raising=False)
            monkeypatch.delenv("AWS_S3_DEBUG", raising=False)

            config = config_from_env()

            assert config is not None
            assert config.bucket_name == "env-bucket"
            assert config.region == "us-east-1"
            assert config.key_prefix == "jss3:"

        def test_debug_false_values(
            self, clean_env, monkeypatch: pytest.MonkeyPatch
        ) -> None:
            """config_from_env should handle various debug false values."""
            monkeypatch.setenv("AWS_S3_BUCKET_NAME", "env-bucket")
            monkeypatch.setenv("AWS_S3_DEBUG", "false")

            config = config_from_env()

            assert config is not None
            assert config.debug is False


class TestValidateConfig:
    """Tests for validate_config function."""

    class TestDecisionBranchCoverage:
        """Test all if/else paths."""

        def test_valid_config_returns_true(self) -> None:
            """validate_config should return True for valid config."""
            config = SDKConfig(bucket_name="test-bucket")

            is_valid, errors = validate_config(config)

            assert is_valid is True
            assert errors == []

        def test_invalid_bucket_returns_false(self) -> None:
            """validate_config should return False for empty bucket."""
            config = SDKConfig(bucket_name="")

            is_valid, errors = validate_config(config)

            assert is_valid is False
            assert any("bucket_name" in e.lower() for e in errors)

        def test_negative_ttl_is_invalid(self) -> None:
            """validate_config should reject negative TTL."""
            config = SDKConfig(bucket_name="test-bucket", ttl=-100)

            is_valid, errors = validate_config(config)

            assert is_valid is False
            assert any("ttl" in e.lower() for e in errors)
