from dataclasses import dataclass
from typing import Any

from env_resolve import resolve, resolve_bool, resolve_int


@dataclass(frozen=True)
class AwsS3Env:
    bucket: str | None
    region: str
    key_prefix: str
    ttl: str | None
    access_key: str | None
    secret_key: str | None
    endpoint: str | None
    force_path_style: bool
    proxy: str | None
    connect_timeout: int
    read_timeout: int
    max_retries: int
    verify_ssl: bool
    debug: bool


def resolve_aws_s3_env(config: dict[str, Any] | None = None) -> AwsS3Env:
    return AwsS3Env(
        bucket=resolve(None, ['AWS_S3_BUCKET', 'AWS_S3_BUCKETNAME'], config, 'bucket', None),
        region=resolve(None, ['AWS_S3_REGION', 'AWS_REGION', 'AWS_DEFAULT_REGION'], config, 'region', 'us-east-1'),
        key_prefix=resolve(None, ['AWS_S3_KEY_PREFIX'], config, 'key_prefix', 'jss3:'),
        ttl=resolve(None, ['AWS_S3_TTL'], config, 'ttl', None),
        access_key=resolve(None, ['AWS_S3_ACCESS_KEY', 'AWS_ACCESS_KEY_ID'], config, 'access_key', None),
        secret_key=resolve(None, ['AWS_S3_SECRET_KEY', 'AWS_SECRET_ACCESS_KEY'], config, 'secret_key', None),
        endpoint=resolve(None, ['AWS_S3_ENDPOINT', 'AWS_ENDPOINT_URL'], config, 'endpoint', None),
        force_path_style=resolve_bool(None, ['AWS_S3_FORCE_PATH_STYLE'], config, 'force_path_style', False),
        proxy=resolve(None, ['AWS_S3_PROXY', 'HTTPS_PROXY'], config, 'proxy', None),
        connect_timeout=resolve_int(None, ['AWS_S3_CONNECT_TIMEOUT'], config, 'connect_timeout', 10),
        read_timeout=resolve_int(None, ['AWS_S3_READ_TIMEOUT'], config, 'read_timeout', 60),
        max_retries=resolve_int(None, ['AWS_S3_MAX_RETRIES'], config, 'max_retries', 3),
        verify_ssl=resolve_bool(None, ['AWS_S3_VERIFY_SSL'], config, 'verify_ssl', False),
        debug=resolve_bool(None, ['AWS_S3_DEBUG'], config, 'debug', False),
    )
