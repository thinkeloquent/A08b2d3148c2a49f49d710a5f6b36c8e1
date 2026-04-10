"""
Cache JSON AWS S3 Storage

AWS S3-backed JSON storage with TTL support and polyglot parity.
Provides a unified interface for saving and loading JSON data to Amazon S3.
"""

from cache_json_awss3_storage.client_factory import (
    ClientAsync,
    ClientSync,
    get_client_factory,
)
from cache_json_awss3_storage.client_factory_with_http_client import (
    ClientAsyncWithHttpClient,
    ClientSyncWithHttpClient,
    get_client_factory_with_http_client,
)
from cache_json_awss3_storage.httpx_s3_client import (
    HttpxS3ClientAsync,
    HttpxS3ClientSync,
)
from cache_json_awss3_storage.config_bridge import get_client_factory_from_app_config
from cache_json_awss3_storage.exceptions import (
    JsonS3StorageAuthError,
    JsonS3StorageClosedError,
    JsonS3StorageConfigError,
    JsonS3StorageError,
    JsonS3StorageReadError,
    JsonS3StorageSerializationError,
    JsonS3StorageWriteError,
)
from cache_json_awss3_storage.key_generator import (
    generate_key,
    generate_key_from_fields,
    generate_key_from_value,
    generate_key_string,
)
from cache_json_awss3_storage.logger import LoggerProtocol, NullLogger
from cache_json_awss3_storage.logger import create as create_logger
from cache_json_awss3_storage.models import (
    ClientConfig,
    EncryptionConfig,
    EncryptionType,
    ErrorRecord,
    RetryConfig,
    S3ClientProtocol,
    StorageClass,
    StorageEntry,
    StorageStats,
)
from cache_json_awss3_storage.storage import JsonS3Storage, create_storage
from cache_json_awss3_storage.cached_http_client import (
    with_s3_cache,
    CachedHttpClient,
    CachedResponse,
    S3CacheConfig,
)

__version__ = "1.0.0"

__all__ = [
    # Main class
    "JsonS3Storage",
    "create_storage",
    # Client Factory
    "get_client_factory",
    "get_client_factory_from_app_config",
    "ClientAsync",
    "ClientSync",
    "ClientConfig",
    # Client Factory with HTTP Client (httpx injection)
    "get_client_factory_with_http_client",
    "ClientAsyncWithHttpClient",
    "ClientSyncWithHttpClient",
    "HttpxS3ClientAsync",
    "HttpxS3ClientSync",
    # Logger
    "LoggerProtocol",
    "NullLogger",
    "create_logger",
    # Models
    "StorageEntry",
    "ErrorRecord",
    "StorageStats",
    "RetryConfig",
    "EncryptionConfig",
    "EncryptionType",
    "StorageClass",
    "S3ClientProtocol",
    # Exceptions
    "JsonS3StorageError",
    "JsonS3StorageReadError",
    "JsonS3StorageWriteError",
    "JsonS3StorageSerializationError",
    "JsonS3StorageAuthError",
    "JsonS3StorageConfigError",
    "JsonS3StorageClosedError",
    # Key Generation Utilities
    "generate_key",
    "generate_key_string",
    "generate_key_from_value",
    "generate_key_from_fields",
    # Cached HTTP Client (HOF pattern)
    "with_s3_cache",
    "CachedHttpClient",
    "CachedResponse",
    "S3CacheConfig",
]
