"""
S3 Client Factory

Provides factory function and context-manager wrappers for creating
async (aiobotocore) and sync (boto3) S3 clients from a unified ClientConfig.

Usage:
    config = get_client_factory(bucket_name="my-bucket", region_name="us-east-1")

    # Async (aiobotocore)
    async with ClientAsync(config) as client:
        storage = create_storage(client, config.bucket_name, ttl=config.ttl)

    # Sync (boto3)
    with ClientSync(config) as client:
        client.put_object(Bucket=config.bucket_name, Key="k", Body=b"v")
"""

from __future__ import annotations

from typing import Any

from cache_json_awss3_storage.exceptions import JsonS3StorageConfigError
from cache_json_awss3_storage.logger import create as create_logger
from cache_json_awss3_storage.models import ClientConfig

_logger = create_logger("cache_json_awss3_storage", __file__)


def _build_client_kwargs(config: ClientConfig) -> dict[str, Any]:
    """Build the common boto/aiobotocore client kwargs from ClientConfig."""
    from botocore.config import Config as BotoConfig

    boto_config = BotoConfig(
        s3={"addressing_style": config.addressing_style},
        connect_timeout=config.connection_timeout,
        read_timeout=config.read_timeout,
        retries={"max_attempts": config.retries_max_attempts},
        proxies={"https": config.proxy_url, "http": config.proxy_url}
        if config.proxy_url
        else None,
    )

    kwargs: dict[str, Any] = {
        "config": boto_config,
        "verify": config.verify,
    }

    if config.endpoint_url:
        kwargs["endpoint_url"] = config.endpoint_url
    if config.region_name:
        kwargs["region_name"] = config.region_name
    if config.aws_access_key_id:
        kwargs["aws_access_key_id"] = config.aws_access_key_id
    if config.aws_secret_access_key:
        kwargs["aws_secret_access_key"] = config.aws_secret_access_key

    return kwargs


class ClientAsync:
    """
    Async S3 client context manager using aiobotocore.

    Yields an aiobotocore S3 client compatible with S3ClientProtocol.

    Example:
        async with ClientAsync(config) as client:
            await client.put_object(Bucket="b", Key="k", Body=b"data")
    """

    def __init__(self, config: ClientConfig) -> None:
        if config.type != "s3":
            raise JsonS3StorageConfigError(
                f"Unsupported client type: {config.type!r}, expected 's3'"
            )
        self._config = config
        self._ctx: Any = None

    async def __aenter__(self) -> Any:
        import aiobotocore.session

        session = aiobotocore.session.AioSession()
        kwargs = _build_client_kwargs(self._config)
        self._ctx = session.create_client("s3", **kwargs)
        client = await self._ctx.__aenter__()

        _logger.debug(
            f"ClientAsync: opened connection "
            f"endpoint={self._config.endpoint_url}, "
            f"region={self._config.region_name}, "
            f"bucket={self._config.bucket_name}"
        )
        return client

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        if self._ctx:
            await self._ctx.__aexit__(exc_type, exc_val, exc_tb)
            _logger.debug("ClientAsync: closed connection")


class ClientSync:
    """
    Sync S3 client context manager using boto3.

    Yields a boto3 S3 client.

    Example:
        with ClientSync(config) as client:
            client.put_object(Bucket="b", Key="k", Body=b"data")
    """

    def __init__(self, config: ClientConfig) -> None:
        if config.type != "s3":
            raise JsonS3StorageConfigError(
                f"Unsupported client type: {config.type!r}, expected 's3'"
            )
        self._config = config
        self._client: Any = None

    def __enter__(self) -> Any:
        import boto3

        kwargs = _build_client_kwargs(self._config)
        self._client = boto3.client("s3", **kwargs)

        _logger.debug(
            f"ClientSync: opened connection "
            f"endpoint={self._config.endpoint_url}, "
            f"region={self._config.region_name}, "
            f"bucket={self._config.bucket_name}"
        )
        return self._client

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        if self._client:
            self._client.close()
            self._client = None
            _logger.debug("ClientSync: closed connection")


def get_client_factory(
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
    Create an S3 ClientConfig from connection parameters.

    The returned config is used with ClientAsync or ClientSync context
    managers to obtain a ready-to-use S3 client.

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
        ClientConfig instance for use with ClientAsync or ClientSync

    Example:
        config = get_client_factory(
            bucket_name="my-cache-bucket",
            region_name="us-east-1",
            endpoint_url="http://localhost:4566",
            ttl=3600.0,
        )

        # Async usage
        async with ClientAsync(config) as client:
            storage = create_storage(client, config.bucket_name, ttl=config.ttl)
            await storage.save("key", {"data": "value"})

        # Sync usage
        with ClientSync(config) as client:
            client.put_object(Bucket=config.bucket_name, Key="k", Body=b"v")
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
        f"get_client_factory: created config "
        f"bucket={bucket_name}, region={region_name}, "
        f"endpoint={endpoint_url}, ttl={ttl}"
    )

    return config
