from dataclasses import dataclass
from typing import Any

from env_resolve import resolve, resolve_bool, resolve_int


@dataclass(frozen=True)
class PostgresqlEnv:
    host: str
    port: int
    user: str
    password: str | None
    database: str
    url: str | None
    schema: str
    ssl_mode: str
    ssl_ca_file: str | None
    ssl_check_hostname: bool
    pool_size: int
    connect_timeout: int
    max_overflow: int
    pool_timeout: int
    pool_recycle: int
    echo: bool


def resolve_postgresql_env(config: dict[str, Any] | None = None) -> PostgresqlEnv:
    return PostgresqlEnv(
        host=resolve(None, ['POSTGRES_HOST', 'POSTGRES_HOSTNAME', 'DATABASE_HOST'], config, 'host', 'localhost'),
        port=resolve_int(None, ['POSTGRES_PORT', 'DATABASE_PORT'], config, 'port', 5432),
        user=resolve(None, ['POSTGRES_USER', 'POSTGRES_USERNAME', 'DATABASE_USER'], config, 'user', 'postgres'),
        password=resolve(None, ['POSTGRES_PASSWORD', 'DATABASE_PASSWORD'], config, 'password', None),
        database=resolve(None, ['POSTGRES_DB', 'POSTGRES_DATABASE', 'DATABASE_NAME'], config, 'database', 'postgres'),
        url=resolve(None, ['DATABASE_URL'], config, 'url', None),
        schema=resolve(None, ['POSTGRES_SCHEMA', 'DATABASE_SCHEMA'], config, 'schema', 'public'),
        ssl_mode=resolve(None, ['POSTGRES_SSL_MODE', 'DATABASE_SSL_MODE', 'POSTGRES_SSLMODE'], config, 'ssl_mode', 'prefer'),
        ssl_ca_file=resolve(None, ['POSTGRES_SSL_CA_FILE', 'POSTGRES_SSL_CA_CERTS'], config, 'ssl_ca_file', None),
        ssl_check_hostname=resolve_bool(None, ['POSTGRES_SSL_CHECK_HOSTNAME'], config, 'ssl_check_hostname', True),
        pool_size=resolve_int(None, ['POSTGRES_POOL_SIZE', 'DATABASE_POOL_SIZE'], config, 'pool_size', 5),
        connect_timeout=resolve_int(None, ['POSTGRES_CONNECT_TIMEOUT'], config, 'connect_timeout', 30),
        max_overflow=resolve_int(None, ['POSTGRES_MAX_OVERFLOW', 'DATABASE_MAX_OVERFLOW'], config, 'max_overflow', 10),
        pool_timeout=resolve_int(None, ['POSTGRES_POOL_TIMEOUT', 'DATABASE_POOL_TIMEOUT'], config, 'pool_timeout', 30),
        pool_recycle=resolve_int(None, ['POSTGRES_POOL_RECYCLE', 'DATABASE_POOL_RECYCLE'], config, 'pool_recycle', 3600),
        echo=resolve_bool(None, ['POSTGRES_ECHO', 'DATABASE_ECHO'], config, 'echo', False),
    )
