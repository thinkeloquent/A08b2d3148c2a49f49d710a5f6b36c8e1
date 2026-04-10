"""Redis client creation via ``from_url``.

``Redis.from_url()`` is the preferred way to create clients in cloud /
production environments because the URL scheme (``rediss://``) drives
connection-class selection internally — no raw ``ssl`` kwarg is passed
to the connection constructor, avoiding the
``AbstractConnection.__init__() got an unexpected keyword argument 'ssl'``
error that can occur with ``Redis(ssl=True/False, ...)``.

All configuration options and combinations are provided as factory
functions below.  Each returns a ready-to-use client; callers are
responsible for calling ``await client.aclose()`` (async) or
``client.close()`` (sync) when done.
"""

import logging
import ssl
from typing import Any

import redis
from redis.asyncio import Redis as AsyncRedis

from .config import RedisConfig

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Core helpers
# ---------------------------------------------------------------------------

def _build_url(config: RedisConfig) -> str:
    """Build redis:// or rediss:// URL from config."""
    return config.get_url()


def _build_from_url_kwargs(config: RedisConfig) -> dict[str, Any]:
    """Build kwargs for ``Redis.from_url(url, **kwargs)``."""
    return config.get_from_url_kwargs()


# ---------------------------------------------------------------------------
# Async client factories
# ---------------------------------------------------------------------------

async def async_client_from_url(config: RedisConfig | None = None) -> AsyncRedis:
    """Create an async Redis client via ``from_url``.

    Resolves all settings from ``RedisConfig`` (env vars, constructor
    args, or defaults).  Uses ``rediss://`` scheme when TLS is enabled.

    Example — minimal (local dev, no TLS)::

        from db_connection_redis.from_url import async_client_from_url
        client = await async_client_from_url()
        await client.ping()
        await client.aclose()

    Example — production TLS with CA bundle::

        from db_connection_redis import RedisConfig
        from db_connection_redis.from_url import async_client_from_url

        config = RedisConfig(
            host="redis.example.com",
            port=6380,
            password="secret",
            use_ssl=True,
            ssl_cert_reqs="required",
            ssl_check_hostname=True,
            ssl_ca_certs="/etc/ssl/certs/ca-bundle.crt",
            socket_connect_timeout=3.0,
            socket_timeout=5.0,
            retry_on_timeout=True,
            health_check_interval=30,
        )
        client = await async_client_from_url(config)
    """
    if config is None:
        config = RedisConfig()

    url = _build_url(config)
    kwargs = _build_from_url_kwargs(config)

    logger.info("Creating async Redis client from URL (host=%s port=%s ssl=%s)",
                config.host, config.port, config.use_ssl)
    return AsyncRedis.from_url(url, **kwargs)


def sync_client_from_url(config: RedisConfig | None = None) -> redis.Redis:
    """Create a sync Redis client via ``from_url``.

    Same resolution as :func:`async_client_from_url` but returns a
    blocking ``redis.Redis`` instance.
    """
    if config is None:
        config = RedisConfig()

    url = _build_url(config)
    kwargs = _build_from_url_kwargs(config)

    logger.info("Creating sync Redis client from URL (host=%s port=%s ssl=%s)",
                config.host, config.port, config.use_ssl)
    return redis.Redis.from_url(url, **kwargs)


# ---------------------------------------------------------------------------
# Preset configuration factories
# ---------------------------------------------------------------------------

def _make_async(url: str, **kwargs: Any) -> AsyncRedis:
    """Thin wrapper so presets stay one-liners."""
    return AsyncRedis.from_url(url, **kwargs)


def _make_sync(url: str, **kwargs: Any) -> redis.Redis:
    """Thin wrapper so presets stay one-liners."""
    return redis.Redis.from_url(url, **kwargs)


# ---- 1. Plain / local dev (no TLS) ----

def async_plain(
    host: str = "localhost",
    port: int = 6379,
    db: int = 0,
    password: str | None = None,
    socket_timeout: float = 5.0,
    socket_connect_timeout: float = 5.0,
    decode_responses: bool = True,
) -> AsyncRedis:
    """Async client — plain TCP, no TLS.  Good for local Redis."""
    userinfo = f":{password}@" if password else ""
    url = f"redis://{userinfo}{host}:{port}/{db}"
    return _make_async(
        url,
        socket_timeout=socket_timeout,
        socket_connect_timeout=socket_connect_timeout,
        decode_responses=decode_responses,
    )


def sync_plain(
    host: str = "localhost",
    port: int = 6379,
    db: int = 0,
    password: str | None = None,
    socket_timeout: float = 5.0,
    socket_connect_timeout: float = 5.0,
    decode_responses: bool = True,
) -> redis.Redis:
    """Sync client — plain TCP, no TLS.  Good for local Redis."""
    userinfo = f":{password}@" if password else ""
    url = f"redis://{userinfo}{host}:{port}/{db}"
    return _make_sync(
        url,
        socket_timeout=socket_timeout,
        socket_connect_timeout=socket_connect_timeout,
        decode_responses=decode_responses,
    )


# ---- 2. TLS with full verification (recommended for production) ----

def async_tls_verified(
    host: str,
    port: int = 6380,
    db: int = 0,
    password: str | None = None,
    username: str | None = None,
    ssl_ca_certs: str = "/etc/ssl/certs/ca-bundle.crt",
    ssl_check_hostname: bool = True,
    socket_connect_timeout: float = 3.0,
    socket_timeout: float = 5.0,
    retry_on_timeout: bool = True,
    health_check_interval: int = 30,
    decode_responses: bool = True,
) -> AsyncRedis:
    """Async client — TLS with server cert + hostname verification.

    This is the **recommended** configuration for cloud providers
    (AWS ElastiCache, Redis Cloud, Upstash, DigitalOcean).

    Equivalent to::

        from redis import asyncio as aioredis
        r = aioredis.Redis.from_url(
            "rediss://redis.example.com:6380/0",
            ssl=True,
            ssl_cert_reqs="required",
            ssl_check_hostname=True,
            ssl_ca_certs="/etc/ssl/certs/ca-bundle.crt",
            socket_connect_timeout=3.0,
            socket_timeout=5.0,
            retry_on_timeout=True,
            health_check_interval=30,
        )
    """
    userinfo = ""
    if username and password:
        userinfo = f"{username}:{password}@"
    elif password:
        userinfo = f":{password}@"
    url = f"rediss://{userinfo}{host}:{port}/{db}"
    return _make_async(
        url,
        ssl=True,
        ssl_cert_reqs="required",
        ssl_check_hostname=ssl_check_hostname,
        ssl_ca_certs=ssl_ca_certs,
        socket_connect_timeout=socket_connect_timeout,
        socket_timeout=socket_timeout,
        retry_on_timeout=retry_on_timeout,
        health_check_interval=health_check_interval,
        decode_responses=decode_responses,
    )


def sync_tls_verified(
    host: str,
    port: int = 6380,
    db: int = 0,
    password: str | None = None,
    username: str | None = None,
    ssl_ca_certs: str = "/etc/ssl/certs/ca-bundle.crt",
    ssl_check_hostname: bool = True,
    socket_connect_timeout: float = 3.0,
    socket_timeout: float = 5.0,
    retry_on_timeout: bool = True,
    health_check_interval: int = 30,
    decode_responses: bool = True,
) -> redis.Redis:
    """Sync client — TLS with server cert + hostname verification."""
    userinfo = ""
    if username and password:
        userinfo = f"{username}:{password}@"
    elif password:
        userinfo = f":{password}@"
    url = f"rediss://{userinfo}{host}:{port}/{db}"
    return _make_sync(
        url,
        ssl=True,
        ssl_cert_reqs="required",
        ssl_check_hostname=ssl_check_hostname,
        ssl_ca_certs=ssl_ca_certs,
        socket_connect_timeout=socket_connect_timeout,
        socket_timeout=socket_timeout,
        retry_on_timeout=retry_on_timeout,
        health_check_interval=health_check_interval,
        decode_responses=decode_responses,
    )


# ---- 3. TLS with CA-only verification (no hostname check) ----

def async_tls_ca_only(
    host: str,
    port: int = 6380,
    db: int = 0,
    password: str | None = None,
    ssl_ca_certs: str = "/etc/ssl/certs/ca-bundle.crt",
    socket_connect_timeout: float = 3.0,
    socket_timeout: float = 5.0,
    decode_responses: bool = True,
) -> AsyncRedis:
    """Async client — TLS, verify CA signature but skip hostname check.

    Useful when the server cert CN / SAN doesn't match the hostname
    you connect to (e.g. internal IPs behind a load balancer).
    """
    userinfo = f":{password}@" if password else ""
    url = f"rediss://{userinfo}{host}:{port}/{db}"
    return _make_async(
        url,
        ssl=True,
        ssl_cert_reqs="required",
        ssl_check_hostname=False,
        ssl_ca_certs=ssl_ca_certs,
        socket_connect_timeout=socket_connect_timeout,
        socket_timeout=socket_timeout,
        decode_responses=decode_responses,
    )


# ---- 4. TLS with inline CA PEM (ssl_ca_data) ----

def async_tls_ca_data(
    host: str,
    port: int = 6380,
    db: int = 0,
    password: str | None = None,
    ssl_ca_data: str = "",
    ssl_check_hostname: bool = True,
    socket_connect_timeout: float = 3.0,
    socket_timeout: float = 5.0,
    decode_responses: bool = True,
) -> AsyncRedis:
    """Async client — TLS with inline PEM via ``ssl_ca_data``.

    Use when you can't write a CA file to disk (containers, serverless)
    but have the PEM content available as a string or env var.

    Example::

        import os
        client = async_tls_ca_data(
            host="redis.example.com",
            password="secret",
            ssl_ca_data=os.environ["REDIS_CA_PEM"],
        )
    """
    userinfo = f":{password}@" if password else ""
    url = f"rediss://{userinfo}{host}:{port}/{db}"
    return _make_async(
        url,
        ssl=True,
        ssl_cert_reqs="required",
        ssl_check_hostname=ssl_check_hostname,
        ssl_ca_data=ssl_ca_data,
        socket_connect_timeout=socket_connect_timeout,
        socket_timeout=socket_timeout,
        decode_responses=decode_responses,
    )


# ---- 5. TLS with mutual TLS (client certificate) ----

def async_tls_mtls(
    host: str,
    port: int = 6380,
    db: int = 0,
    password: str | None = None,
    ssl_ca_certs: str = "/etc/ssl/certs/ca-bundle.crt",
    ssl_certfile: str = "",
    ssl_keyfile: str = "",
    ssl_check_hostname: bool = True,
    socket_connect_timeout: float = 3.0,
    socket_timeout: float = 5.0,
    decode_responses: bool = True,
) -> AsyncRedis:
    """Async client — mutual TLS (client cert + server verification).

    Both sides authenticate: the client verifies the server's cert
    and the server verifies the client's cert.

    Example::

        client = async_tls_mtls(
            host="redis.example.com",
            password="secret",
            ssl_ca_certs="/etc/ssl/certs/ca-bundle.crt",
            ssl_certfile="/etc/ssl/client/client.crt",
            ssl_keyfile="/etc/ssl/client/client.key",
        )
    """
    userinfo = f":{password}@" if password else ""
    url = f"rediss://{userinfo}{host}:{port}/{db}"
    return _make_async(
        url,
        ssl=True,
        ssl_cert_reqs="required",
        ssl_check_hostname=ssl_check_hostname,
        ssl_ca_certs=ssl_ca_certs,
        ssl_certfile=ssl_certfile,
        ssl_keyfile=ssl_keyfile,
        socket_connect_timeout=socket_connect_timeout,
        socket_timeout=socket_timeout,
        decode_responses=decode_responses,
    )


# ---- 6. TLS with verification disabled (dev/troubleshooting only) ----

def async_tls_unverified(
    host: str,
    port: int = 6380,
    db: int = 0,
    password: str | None = None,
    socket_connect_timeout: float = 3.0,
    socket_timeout: float = 5.0,
    decode_responses: bool = True,
) -> AsyncRedis:
    """Async client — TLS encryption but NO cert verification.

    **Only for local dev / troubleshooting** where proper CA setup is
    missing.  Do not use in production.

    Equivalent to::

        r = Redis.from_url("rediss://...", ssl=True, ssl_cert_reqs=None)
    """
    userinfo = f":{password}@" if password else ""
    url = f"rediss://{userinfo}{host}:{port}/{db}"
    return _make_async(
        url,
        ssl=True,
        ssl_cert_reqs=None,
        socket_connect_timeout=socket_connect_timeout,
        socket_timeout=socket_timeout,
        decode_responses=decode_responses,
    )


def sync_tls_unverified(
    host: str,
    port: int = 6380,
    db: int = 0,
    password: str | None = None,
    socket_connect_timeout: float = 3.0,
    socket_timeout: float = 5.0,
    decode_responses: bool = True,
) -> redis.Redis:
    """Sync client — TLS encryption but NO cert verification."""
    userinfo = f":{password}@" if password else ""
    url = f"rediss://{userinfo}{host}:{port}/{db}"
    return _make_sync(
        url,
        ssl=True,
        ssl_cert_reqs=None,
        socket_connect_timeout=socket_connect_timeout,
        socket_timeout=socket_timeout,
        decode_responses=decode_responses,
    )


# ---- 7. Full production preset (all options) ----

def async_production(
    host: str,
    port: int = 6380,
    db: int = 0,
    password: str | None = None,
    username: str | None = None,
    ssl_cert_reqs: str = "required",
    ssl_ca_certs: str | None = "/etc/ssl/certs/ca-bundle.crt",
    ssl_ca_data: str | None = None,
    ssl_certfile: str | None = None,
    ssl_keyfile: str | None = None,
    ssl_check_hostname: bool = True,
    socket_connect_timeout: float = 3.0,
    socket_timeout: float = 5.0,
    retry_on_timeout: bool = True,
    health_check_interval: int = 30,
    max_connections: int | None = None,
    decode_responses: bool = True,
) -> AsyncRedis:
    """Async client — every TLS + timeout knob exposed.

    This is the kitchen-sink factory for production deployments where
    you need full control over every parameter.

    TLS kwargs (passed to the underlying ``SSLConnection``)::

        ssl=True                     # implicit via rediss:// scheme
        ssl_cert_reqs="required"     # verify server cert (or "none" / None)
        ssl_ca_certs="/path/to/ca"   # CA bundle file
        ssl_ca_data="-----BEGIN..."  # inline PEM (alternative to file)
        ssl_certfile="/path/cert"    # client certificate (mTLS)
        ssl_keyfile="/path/key"      # client private key  (mTLS)
        ssl_check_hostname=True      # verify hostname matches cert SAN/CN

    Timeout kwargs::

        socket_connect_timeout=3.0   # TCP/TLS handshake timeout
        socket_timeout=5.0           # per-command I/O timeout
        retry_on_timeout=True        # auto-retry on timeout
        health_check_interval=30     # seconds between PING keep-alives

    Pool kwargs::

        max_connections=None         # connection pool ceiling
    """
    userinfo = ""
    if username and password:
        userinfo = f"{username}:{password}@"
    elif password:
        userinfo = f":{password}@"
    url = f"rediss://{userinfo}{host}:{port}/{db}"

    kwargs: dict[str, Any] = {
        "ssl": True,
        "ssl_cert_reqs": ssl_cert_reqs,
        "ssl_check_hostname": ssl_check_hostname,
        "socket_connect_timeout": socket_connect_timeout,
        "socket_timeout": socket_timeout,
        "retry_on_timeout": retry_on_timeout,
        "health_check_interval": health_check_interval,
        "decode_responses": decode_responses,
    }
    if ssl_ca_certs:
        kwargs["ssl_ca_certs"] = ssl_ca_certs
    if ssl_ca_data:
        kwargs["ssl_ca_data"] = ssl_ca_data
    if ssl_certfile:
        kwargs["ssl_certfile"] = ssl_certfile
    if ssl_keyfile:
        kwargs["ssl_keyfile"] = ssl_keyfile
    if max_connections:
        kwargs["max_connections"] = max_connections

    return _make_async(url, **kwargs)


def sync_production(
    host: str,
    port: int = 6380,
    db: int = 0,
    password: str | None = None,
    username: str | None = None,
    ssl_cert_reqs: str = "required",
    ssl_ca_certs: str | None = "/etc/ssl/certs/ca-bundle.crt",
    ssl_ca_data: str | None = None,
    ssl_certfile: str | None = None,
    ssl_keyfile: str | None = None,
    ssl_check_hostname: bool = True,
    socket_connect_timeout: float = 3.0,
    socket_timeout: float = 5.0,
    retry_on_timeout: bool = True,
    health_check_interval: int = 30,
    max_connections: int | None = None,
    decode_responses: bool = True,
) -> redis.Redis:
    """Sync client — every TLS + timeout knob exposed."""
    userinfo = ""
    if username and password:
        userinfo = f"{username}:{password}@"
    elif password:
        userinfo = f":{password}@"
    url = f"rediss://{userinfo}{host}:{port}/{db}"

    kwargs: dict[str, Any] = {
        "ssl": True,
        "ssl_cert_reqs": ssl_cert_reqs,
        "ssl_check_hostname": ssl_check_hostname,
        "socket_connect_timeout": socket_connect_timeout,
        "socket_timeout": socket_timeout,
        "retry_on_timeout": retry_on_timeout,
        "health_check_interval": health_check_interval,
        "decode_responses": decode_responses,
    }
    if ssl_ca_certs:
        kwargs["ssl_ca_certs"] = ssl_ca_certs
    if ssl_ca_data:
        kwargs["ssl_ca_data"] = ssl_ca_data
    if ssl_certfile:
        kwargs["ssl_certfile"] = ssl_certfile
    if ssl_keyfile:
        kwargs["ssl_keyfile"] = ssl_keyfile
    if max_connections:
        kwargs["max_connections"] = max_connections

    return _make_sync(url, **kwargs)
