import contextlib
import logging
import ssl
from dataclasses import dataclass, field
from typing import Any
from urllib.parse import parse_qs, urlparse

from app_yaml_static_config import AppYamlConfig
from env_resolve.core import resolve, resolve_bool, resolve_float, resolve_int
from env_resolver import resolve_redis_env

from .constants import (
    ENV_REDIS_DB,
    ENV_REDIS_HOST,
    ENV_REDIS_MAX_CONNECTIONS,
    ENV_REDIS_PASSWORD,
    ENV_REDIS_PORT,
    ENV_REDIS_SOCKET_CONNECT_TIMEOUT,
    ENV_REDIS_SOCKET_TIMEOUT,
    ENV_REDIS_SSL,
    ENV_REDIS_SSL_CA_CERTS,
    ENV_REDIS_SSL_CA_DATA,
    ENV_REDIS_SSL_CERT_REQS,
    ENV_REDIS_SSL_CERTFILE,
    ENV_REDIS_SSL_CHECK_HOSTNAME,
    ENV_REDIS_SSL_KEYFILE,
    ENV_REDIS_USERNAME,
)
from .exceptions import RedisConfigError
from .schemas import RedisConfigValidator

logger = logging.getLogger(__name__)


def _load_yaml_config() -> dict[str, Any]:
    """Load Redis config from AppYamlConfig (storage.redis in server.dev.yaml).

    AppYamlConfig must be initialized by the lifecycle hook
    (``01_app_yaml.lifecycle``) before this is called.  If it is not
    initialized, a warning is logged so the misconfiguration is visible
    rather than silently falling through to defaults.

    Returns an empty dict when ``storage.redis`` is absent from the YAML.
    Null values are excluded so they don't shadow environment variables.
    """
    if AppYamlConfig._instance is None:
        logger.warning(
            "AppYamlConfig is not initialized — Redis YAML overrides "
            "(storage.redis) will be unavailable. Ensure the "
            "01_app_yaml lifecycle hook runs before RedisConfig is created."
        )
        return {}

    try:
        instance = AppYamlConfig.get_instance()
        raw = instance.get_nested("storage", "redis", default={}) or {}
        result = {k: v for k, v in raw.items() if v is not None}
        if not result:
            logger.debug(
                "AppYamlConfig initialized but storage.redis is empty — "
                "Redis will resolve config from env vars / defaults only"
            )
        return result
    except Exception:
        logger.warning("Failed to read storage.redis from AppYamlConfig", exc_info=True)
        return {}


@dataclass
class RedisConfig:
    """
    Configuration for Redis connection.
    Resolves parameters from source of truth in order:
    1. Direct constructor arguments
    2. YamlConfig (storage.redis from server.dev.yaml)
    3. Environment variables
    4. Config dictionary
    5. Default values
    """
    host: str = field(default="localhost")
    port: int = field(default=6379)
    username: str | None = field(default=None)
    password: str | None = field(default=None)
    db: int = field(default=0)
    unix_socket_path: str | None = field(default=None)
    use_ssl: bool = field(default=False)
    ssl_cert_reqs: str = field(default="none")
    ssl_ca_certs: str | None = field(default=None)
    ssl_ca_data: str | None = field(default=None)
    ssl_certfile: str | None = field(default=None)
    ssl_keyfile: str | None = field(default=None)
    ssl_check_hostname: bool = field(default=False)
    socket_timeout: float = field(default=5.0)
    socket_connect_timeout: float = field(default=5.0)
    retry_on_timeout: bool = field(default=False)
    max_connections: int | None = field(default=None)
    health_check_interval: float = field(default=0)
    encoding: str = field(default="utf-8")
    decode_responses: bool = field(default=True)

    def __init__(
        self,
        config: dict[str, Any] | None = None,
        host: str | None = None,
        port: int | None = None,
        username: str | None = None,
        password: str | None = None,
        db: int | None = None,
        unix_socket_path: str | None = None,
        use_ssl: bool | None = None,
        ssl_cert_reqs: str | None = None,
        ssl_ca_certs: str | None = None,
        ssl_ca_data: str | None = None,
        ssl_certfile: str | None = None,
        ssl_keyfile: str | None = None,
        ssl_check_hostname: bool | None = None,
        socket_timeout: float | None = None,
        socket_connect_timeout: float | None = None,
        retry_on_timeout: bool | None = None,
        max_connections: int | None = None,
        health_check_interval: float | None = None,
        encoding: str | None = None,
        decode_responses: bool | None = None
    ):
        # Load YamlConfig (storage.redis) — sits between direct args and env vars.
        # Non-null YAML values are promoted to "arg" so they beat env vars in
        # env_resolve's  arg > env > config > default  chain.
        yaml = _load_yaml_config()

        def _y(arg: Any, key: str) -> Any:
            """Return direct arg if given, else YAML value (may be None)."""
            return arg if arg is not None else yaml.get(key)

        # Resolve values:  arg > yaml > env > config > default
        self.host = resolve(_y(host, "host"), ENV_REDIS_HOST, config, "host", "localhost")
        self.port = resolve_int(_y(port, "port"), ENV_REDIS_PORT, config, "port", 6379)
        self.username = resolve(_y(username, "username"), ENV_REDIS_USERNAME, config, "username", None)
        self.password = resolve(_y(password, "password"), ENV_REDIS_PASSWORD, config, "password", None)
        self.db = resolve_int(_y(db, "db"), ENV_REDIS_DB, config, "db", 0)
        self.unix_socket_path = resolve(_y(unix_socket_path, "unix_socket_path"), [], config, "unix_socket_path", None)

        ssl_from_yaml = use_ssl if use_ssl is not None else yaml.get("use_ssl")
        self.use_ssl = resolve_bool(ssl_from_yaml, ENV_REDIS_SSL, config, "use_ssl", False)
        self.ssl_cert_reqs = resolve(_y(ssl_cert_reqs, "ssl_cert_reqs"), ENV_REDIS_SSL_CERT_REQS, config, "ssl_cert_reqs", "none")
        self.ssl_ca_certs = resolve(_y(ssl_ca_certs, "ssl_ca_certs"), ENV_REDIS_SSL_CA_CERTS, config, "ssl_ca_certs", None)
        self.ssl_ca_data = resolve(_y(ssl_ca_data, "ssl_ca_data"), ENV_REDIS_SSL_CA_DATA, config, "ssl_ca_data", None)
        self.ssl_certfile = resolve(_y(ssl_certfile, "ssl_certfile"), ENV_REDIS_SSL_CERTFILE, config, "ssl_certfile", None)
        self.ssl_keyfile = resolve(_y(ssl_keyfile, "ssl_keyfile"), ENV_REDIS_SSL_KEYFILE, config, "ssl_keyfile", None)
        self.ssl_check_hostname = resolve_bool(_y(ssl_check_hostname, "ssl_check_hostname"), ENV_REDIS_SSL_CHECK_HOSTNAME, config, "ssl_check_hostname", False)

        self.socket_timeout = resolve_float(_y(socket_timeout, "socket_timeout"), ENV_REDIS_SOCKET_TIMEOUT, config, "socket_timeout", 5.0)
        self.socket_connect_timeout = resolve_float(_y(socket_connect_timeout, "socket_connect_timeout"), ENV_REDIS_SOCKET_CONNECT_TIMEOUT, config, "socket_connect_timeout", 5.0)
        self.retry_on_timeout = resolve_bool(_y(retry_on_timeout, "retry_on_timeout"), [], config, "retry_on_timeout", False)

        max_conn = resolve(_y(max_connections, "max_connections"), ENV_REDIS_MAX_CONNECTIONS, config, "max_connections", None)
        self.max_connections = int(max_conn) if max_conn is not None else None

        self.health_check_interval = resolve_float(_y(health_check_interval, "health_check_interval"), [], config, "health_check_interval", 0)
        self.encoding = resolve(_y(encoding, "encoding"), [], config, "encoding", "utf-8")
        self.decode_responses = resolve_bool(_y(decode_responses, "decode_responses"), [], config, "decode_responses", True)

        # YAML url field or REDIS_URL env var — last-write-wins override
        yaml_url = yaml.get("url")
        redis_url = yaml_url or resolve_redis_env().url
        if redis_url:
            self._parse_redis_url(redis_url)

        # Auto-detect vendor / defaults if not explicitly set
        self._detect_vendor_defaults()

        # Validate
        self.validate()

    def _parse_redis_url(self, url: str) -> None:
        """Parse redis:// or rediss:// URL."""
        parsed = urlparse(url)
        if parsed.scheme == "rediss":
            self.use_ssl = True

        if parsed.hostname:
            self.host = parsed.hostname
        if parsed.port:
            self.port = parsed.port
        if parsed.username:
            self.username = parsed.username
        if parsed.password:
            self.password = parsed.password
        if parsed.path and parsed.path != "/":
            with contextlib.suppress(ValueError):
                self.db = int(parsed.path.lstrip("/"))

        # Query params
        qs = parse_qs(parsed.query)
        if "ssl_cert_reqs" in qs:
            self.ssl_cert_reqs = qs["ssl_cert_reqs"][0]

    def _detect_vendor_defaults(self) -> None:
        """Apply cloud vendor defaults if matching specific patterns."""
        # AWS ElastiCache, Redis Cloud, Upstash, Digital Ocean
        is_cloud = False
        if "cache.amazonaws.com" in self.host or "redis-cloud.com" in self.host or "upstash.io" in self.host:
            is_cloud = True
        elif "db.ondigitalocean.com" in self.host:
            is_cloud = True
            if self.port == 25061: # TLS port
                self.use_ssl = True

        if is_cloud and not self.use_ssl:
            # Force SSL defaults if not explicitly disabled/configured?
            # Spec says "detect" and "default_tls: true".
            # Assuming if it looks like cloud, we prefer SSL.
            self.use_ssl = True

    def validate(self) -> None:
        try:
            RedisConfigValidator(**self.__dict__)
        except Exception as e:
            raise RedisConfigError(f"Configuration validation failed: {str(e)}") from e

    def get_url(self) -> str:
        """Build a redis:// or rediss:// URL from config fields.

        The URL carries host, port, db, and credentials.  TLS/timeout
        kwargs must still be passed separately to ``from_url()``.
        """
        scheme = "rediss" if self.use_ssl else "redis"
        userinfo = ""
        if self.username and self.password:
            userinfo = f"{self.username}:{self.password}@"
        elif self.password:
            userinfo = f":{self.password}@"
        return f"{scheme}://{userinfo}{self.host}:{self.port}/{self.db}"

    def get_from_url_kwargs(self) -> dict[str, Any]:
        """Get kwargs suitable for ``Redis.from_url(url, **kwargs)``.

        ``from_url`` already extracts host/port/db/password/scheme from
        the URL, so those are excluded here.  Only TLS detail kwargs,
        timeouts, encoding, and pool settings are returned.
        """
        kwargs: dict[str, Any] = {
            "socket_timeout": self.socket_timeout,
            "socket_connect_timeout": self.socket_connect_timeout,
            "retry_on_timeout": self.retry_on_timeout,
            "encoding": self.encoding,
            "decode_responses": self.decode_responses,
        }

        if self.health_check_interval > 0:
            kwargs["health_check_interval"] = int(self.health_check_interval)

        if self.use_ssl:
            kwargs["ssl"] = True
            cert_const = getattr(
                ssl, f"CERT_{self.ssl_cert_reqs.upper()}", ssl.CERT_NONE
            )
            kwargs["ssl_cert_reqs"] = cert_const
            kwargs["ssl_check_hostname"] = self.ssl_check_hostname
            if self.ssl_ca_certs:
                kwargs["ssl_ca_certs"] = self.ssl_ca_certs
            if self.ssl_ca_data:
                kwargs["ssl_ca_data"] = self.ssl_ca_data
            if self.ssl_certfile:
                kwargs["ssl_certfile"] = self.ssl_certfile
            if self.ssl_keyfile:
                kwargs["ssl_keyfile"] = self.ssl_keyfile

        if self.max_connections:
            kwargs["max_connections"] = self.max_connections

        return {k: v for k, v in kwargs.items() if v is not None}

    def get_connection_kwargs(self) -> dict[str, Any]:
        """Get arguments for redis.asyncio.Redis / redis.Redis constructor.

        Includes TLS/SSL kwargs (ssl, ssl_cert_reqs, ssl_ca_certs,
        ssl_ca_data, ssl_check_hostname, ssl_certfile, ssl_keyfile)
        and timeout kwargs (socket_timeout, socket_connect_timeout,
        retry_on_timeout, health_check_interval).
        """
        kwargs: dict[str, Any] = {
            "host": self.host,
            "port": self.port,
            "username": self.username,
            "password": self.password,
            "db": self.db,
            "socket_timeout": self.socket_timeout,
            "socket_connect_timeout": self.socket_connect_timeout,
            "retry_on_timeout": self.retry_on_timeout,
            "encoding": self.encoding,
            "decode_responses": self.decode_responses,
        }

        if self.health_check_interval > 0:
            kwargs["health_check_interval"] = int(self.health_check_interval)

        if self.unix_socket_path:
            kwargs["unix_socket_path"] = self.unix_socket_path
            del kwargs["host"]
            del kwargs["port"]

        # --- TLS / SSL ---
        # IMPORTANT: Only pass ssl=True when SSL is enabled.
        # Passing ssl=False causes redis-py to forward it to
        # AbstractConnection.__init__() which does not accept it,
        # raising TypeError: unexpected keyword argument 'ssl'.
        # The Redis() constructor consumes ssl=True to switch
        # connection_class to SSLConnection; omitting it defaults
        # to the plain Connection class.
        if self.use_ssl:
            kwargs["ssl"] = True
            # ssl_cert_reqs: "none" | "optional" | "required" -> ssl.CERT_*
            cert_const = getattr(
                ssl, f"CERT_{self.ssl_cert_reqs.upper()}", ssl.CERT_NONE
            )
            kwargs["ssl_cert_reqs"] = cert_const

            kwargs["ssl_check_hostname"] = self.ssl_check_hostname

            if self.ssl_ca_certs:
                kwargs["ssl_ca_certs"] = self.ssl_ca_certs
            if self.ssl_ca_data:
                kwargs["ssl_ca_data"] = self.ssl_ca_data
            if self.ssl_certfile:
                kwargs["ssl_certfile"] = self.ssl_certfile
            if self.ssl_keyfile:
                kwargs["ssl_keyfile"] = self.ssl_keyfile

        if self.max_connections:
            kwargs["max_connections"] = self.max_connections

        # Filter out None values
        return {k: v for k, v in kwargs.items() if v is not None}
