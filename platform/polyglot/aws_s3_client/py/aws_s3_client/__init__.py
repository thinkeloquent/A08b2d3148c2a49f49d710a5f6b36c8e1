"""
AWS S3 Client - Polyglot JSON Storage SDK

Provides AWS S3-backed JSON storage with TTL support, defensive programming,
and polyglot parity with the TypeScript implementation.

Usage:
    from aws_s3_client import create_sdk, SDKConfig

    config = SDKConfig(bucket_name="my-bucket")
    sdk = create_sdk(config)

    response = await sdk.save({"user": "alice"})
    print(response.key)

    await sdk.close()
"""

from aws_s3_client.agent import (
    TOOL_SCHEMA,
    AgentResponse,
    AgentStorageInterface,
    create_agent_interface,
)
from aws_s3_client.config import SDKConfig, config_from_env, validate_config
from aws_s3_client.exceptions import (
    JsonS3StorageAuthError,
    JsonS3StorageClosedError,
    JsonS3StorageConfigError,
    JsonS3StorageError,
    JsonS3StorageReadError,
    JsonS3StorageSerializationError,
    JsonS3StorageWriteError,
)
from aws_s3_client.key_generator import generate_key
from aws_s3_client.logger import (
    DefaultLogger,
    LoggerProtocol,
    NullLogger,
)
from aws_s3_client.logger import (
    create as create_logger,
)
from aws_s3_client.models import (
    DebugInfo,
    EncryptionConfig,
    EncryptionType,
    ErrorRecord,
    RetryConfig,
    StorageClass,
    StorageEntry,
    StorageStats,
)
from aws_s3_client.sdk import S3StorageSDK, SDKResponse, create_sdk
from aws_s3_client.storage import JsonS3Storage, create_storage

__version__ = "1.0.0"

__all__ = [
    # Version
    "__version__",
    # SDK
    "S3StorageSDK",
    "SDKConfig",
    "SDKResponse",
    "create_sdk",
    "config_from_env",
    "validate_config",
    # Storage
    "JsonS3Storage",
    "create_storage",
    # Logger
    "create_logger",
    "DefaultLogger",
    "NullLogger",
    "LoggerProtocol",
    # Models
    "StorageEntry",
    "StorageStats",
    "ErrorRecord",
    "DebugInfo",
    "RetryConfig",
    "EncryptionConfig",
    "StorageClass",
    "EncryptionType",
    # Key Generation
    "generate_key",
    # Exceptions
    "JsonS3StorageError",
    "JsonS3StorageConfigError",
    "JsonS3StorageAuthError",
    "JsonS3StorageReadError",
    "JsonS3StorageWriteError",
    "JsonS3StorageSerializationError",
    "JsonS3StorageClosedError",
    # Agent
    "AgentStorageInterface",
    "AgentResponse",
    "create_agent_interface",
    "TOOL_SCHEMA",
]
