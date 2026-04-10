from dataclasses import dataclass
from typing import Any

from env_resolve import resolve, resolve_bool, resolve_float, resolve_int


@dataclass(frozen=True)
class RedisEnv:
    host: str
    port: int
    username: str | None
    password: str | None
    db: int
    url: str | None
    ssl: bool
    ssl_cert_reqs: str
    ssl_ca_certs: str | None
    ssl_ca_data: str | None
    ssl_check_hostname: bool
    ssl_certfile: str | None
    ssl_keyfile: str | None
    socket_timeout: float
    socket_connect_timeout: float
    max_connections: int | None
    cache_default_ttl: int
    cache_backend: str


def resolve_redis_env(config: dict[str, Any] | None = None) -> RedisEnv:
    return RedisEnv(
        host=resolve(None, ['REDIS_HOST', 'REDIS_HOSTNAME'], config, 'host', 'localhost'),
        port=resolve_int(None, ['REDIS_PORT'], config, 'port', 6379),
        username=resolve(None, ['REDIS_USERNAME', 'REDIS_USER'], config, 'username', None),
        password=resolve(None, ['REDIS_PASSWORD', 'REDIS_AUTH'], config, 'password', None),
        db=resolve_int(None, ['REDIS_DB', 'REDIS_DATABASE'], config, 'db', 0),
        url=resolve(None, ['REDIS_URL'], config, 'url', None),
        ssl=resolve_bool(None, ['REDIS_SSL', 'REDIS_USE_SSL', 'REDIS_USE_TLS', 'REDIS_TLS'], config, 'ssl', False),
        ssl_cert_reqs=resolve(None, ['REDIS_SSL_CERT_REQS'], config, 'ssl_cert_reqs', 'none'),
        ssl_ca_certs=resolve(None, ['REDIS_SSL_CA_CERTS'], config, 'ssl_ca_certs', None),
        ssl_ca_data=resolve(None, ['REDIS_SSL_CA_DATA'], config, 'ssl_ca_data', None),
        ssl_check_hostname=resolve_bool(None, ['REDIS_SSL_CHECK_HOSTNAME'], config, 'ssl_check_hostname', False),
        ssl_certfile=resolve(None, ['REDIS_SSL_CERTFILE', 'REDIS_SSL_CLIENT_CERT'], config, 'ssl_certfile', None),
        ssl_keyfile=resolve(None, ['REDIS_SSL_KEYFILE', 'REDIS_SSL_CLIENT_KEY'], config, 'ssl_keyfile', None),
        socket_timeout=resolve_float(None, ['REDIS_SOCKET_TIMEOUT'], config, 'socket_timeout', 5.0),
        socket_connect_timeout=resolve_float(None, ['REDIS_SOCKET_CONNECT_TIMEOUT'], config, 'socket_connect_timeout', 5.0),
        max_connections=None,
        cache_default_ttl=resolve_int(None, ['CACHE_DEFAULT_TTL'], config, 'cache_default_ttl', 300),
        cache_backend=resolve(None, ['CACHE_BACKEND'], config, 'cache_backend', 'memory'),
    )
