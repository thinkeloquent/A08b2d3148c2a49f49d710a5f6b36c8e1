"""
S3 Client Factory with HTTP Client Injection

Companion to client_factory.py that accepts httpx AsyncClient/Client from
fetch_client as the transport layer instead of native aiobotocore/boto3.
This enables unified proxy, SSL, timeout, and connection pooling configuration
across the codebase.

Polyglot parity with TypeScript client-factory-with-http-client.ts.

Usage:
    import httpx
    from cache_json_awss3_storage import (
        get_client_factory_with_http_client,
        ClientAsyncWithHttpClient,
        ClientSyncWithHttpClient,
        create_storage,
    )

    config = get_client_factory_with_http_client(
        bucket_name="my-bucket",
        region_name="us-east-1",
    )

    # Async usage
    async with httpx.AsyncClient() as http:
        async with ClientAsyncWithHttpClient(config, http) as s3:
            storage = create_storage(s3, config.bucket_name, ttl=config.ttl)
            await storage.save("key", {"data": "value"})

    # Sync usage
    with httpx.Client() as http:
        with ClientSyncWithHttpClient(config, http) as s3:
            s3.put_object(Bucket=config.bucket_name, Key="k", Body=b"data")
"""

from __future__ import annotations

from typing import Any

import httpx

from cache_json_awss3_storage.exceptions import JsonS3StorageConfigError
from cache_json_awss3_storage.httpx_s3_client import (
    HttpxS3ClientAsync,
    HttpxS3ClientSync,
)
from cache_json_awss3_storage.logger import create as create_logger
from cache_json_awss3_storage.models import ClientConfig

_logger = create_logger("cache_json_awss3_storage", __file__)


class ClientAsyncWithHttpClient:
    """
    Async S3 client context manager using httpx.AsyncClient.

    Yields an HttpxS3ClientAsync compatible with S3ClientProtocol.
    The caller owns the httpx.AsyncClient lifecycle.

    Example:
        async with httpx.AsyncClient() as http:
            async with ClientAsyncWithHttpClient(config, http) as s3:
                await s3.put_object(Bucket="b", Key="k", Body=b"data")
    """

    def __init__(
        self, config: ClientConfig, httpx_client: httpx.AsyncClient
    ) -> None:
        if config.type != "s3":
            raise JsonS3StorageConfigError(
                f"Unsupported client type: {config.type!r}, expected 's3'"
            )
        self._config = config
        self._httpx_client = httpx_client
        self._client: HttpxS3ClientAsync | None = None

    async def __aenter__(self) -> HttpxS3ClientAsync:
        self._client = HttpxS3ClientAsync(self._config, self._httpx_client)

        _logger.debug(
            f"ClientAsyncWithHttpClient: opened connection "
            f"endpoint={self._config.endpoint_url}, "
            f"region={self._config.region_name}, "
            f"bucket={self._config.bucket_name}"
        )
        return self._client

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        # No-op: caller owns the httpx client lifecycle
        self._client = None
        _logger.debug("ClientAsyncWithHttpClient: released client reference")


class ClientSyncWithHttpClient:
    """
    Sync S3 client context manager using httpx.Client.

    Yields an HttpxS3ClientSync with sync methods for S3 operations.
    The caller owns the httpx.Client lifecycle.

    Example:
        with httpx.Client() as http:
            with ClientSyncWithHttpClient(config, http) as s3:
                s3.put_object(Bucket="b", Key="k", Body=b"data")
    """

    def __init__(
        self, config: ClientConfig, httpx_client: httpx.Client
    ) -> None:
        if config.type != "s3":
            raise JsonS3StorageConfigError(
                f"Unsupported client type: {config.type!r}, expected 's3'"
            )
        self._config = config
        self._httpx_client = httpx_client
        self._client: HttpxS3ClientSync | None = None

    def __enter__(self) -> HttpxS3ClientSync:
        self._client = HttpxS3ClientSync(self._config, self._httpx_client)

        _logger.debug(
            f"ClientSyncWithHttpClient: opened connection "
            f"endpoint={self._config.endpoint_url}, "
            f"region={self._config.region_name}, "
            f"bucket={self._config.bucket_name}"
        )
        return self._client

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        # No-op: caller owns the httpx client lifecycle
        self._client = None
        _logger.debug("ClientSyncWithHttpClient: released client reference")


def get_client_factory_with_http_client(
    *,
    bucket_name: str,
    proxy_url: str | None = None,
    endpoint_url: str | None = None,
    aws_secret_access_key: str | None = None,
    aws_access_key_id: str | None = None,
    region_name: str | None = None,
    addressing_style: str = "path",
    connection_timeout: int = 20,
    read_timeout: int = 60,
    retries_max_attempts: int = 3,
    type: str = "s3",
    verify: bool = True,
    ttl: float = 600.0,
) -> ClientConfig:
    """
    Create an S3 ClientConfig for use with httpx-based client context managers.

    Same validation as get_client_factory. The returned config is used with
    ClientAsyncWithHttpClient or ClientSyncWithHttpClient to obtain a
    ready-to-use S3 client backed by httpx transport.

    Args:
        bucket_name: Target S3 bucket name (required)
        proxy_url: HTTPS proxy URL for S3 connections
        endpoint_url: Custom S3-compatible endpoint (e.g. MinIO, LocalStack)
        aws_secret_access_key: AWS secret access key (falls back to env/profile)
        aws_access_key_id: AWS access key ID (falls back to env/profile)
        region_name: AWS region name
        addressing_style: S3 addressing style ("path" or "virtual")
        connection_timeout: Connection timeout in seconds
        read_timeout: Read timeout in seconds
        retries_max_attempts: Maximum retry attempts for transient failures
        type: Client type, must be "s3"
        verify: Enable SSL certificate verification
        ttl: Default TTL for cached entries in seconds

    Returns:
        ClientConfig instance for use with ClientAsyncWithHttpClient
        or ClientSyncWithHttpClient

    Example:
        config = get_client_factory_with_http_client(
            bucket_name="my-cache-bucket",
            region_name="us-east-1",
            endpoint_url="http://localhost:4566",
            ttl=3600.0,
        )

        async with httpx.AsyncClient() as http:
            async with ClientAsyncWithHttpClient(config, http) as s3:
                storage = create_storage(s3, config.bucket_name, ttl=config.ttl)
                await storage.save("key", {"data": "value"})
    """
    if not bucket_name:
        raise JsonS3StorageConfigError("bucket_name is required")

    if type != "s3":
        raise JsonS3StorageConfigError(
            f"Unsupported client type: {type!r}, expected 's3'"
        )

    config = ClientConfig(
        bucket_name=bucket_name,
        proxy_url=proxy_url,
        endpoint_url=endpoint_url,
        aws_secret_access_key=aws_secret_access_key,
        aws_access_key_id=aws_access_key_id,
        region_name=region_name,
        addressing_style=addressing_style,
        connection_timeout=connection_timeout,
        read_timeout=read_timeout,
        retries_max_attempts=retries_max_attempts,
        type=type,
        verify=verify,
        ttl=ttl,
    )

    _logger.info(
        f"get_client_factory_with_http_client: created config "
        f"bucket={bucket_name}, region={region_name}, "
        f"endpoint={endpoint_url}, ttl={ttl}"
    )

    return config
