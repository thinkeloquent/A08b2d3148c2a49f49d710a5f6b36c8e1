from dataclasses import dataclass
from typing import Any

from env_resolve import resolve, resolve_bool, resolve_int


@dataclass(frozen=True)
class ElasticsearchEnv:
    vendor_type: str
    host: str
    port: int
    scheme: str
    cloud_id: str | None
    index: str | None
    api_key: str | None
    username: str | None
    password: str | None
    access_key: str | None
    api_auth_type: str | None
    use_tls: bool
    verify_certs: bool
    ssl_show_warn: bool
    ca_certs: str | None
    client_cert: str | None
    client_key: str | None
    request_timeout: int
    connect_timeout: int
    max_retries: int
    retry_on_timeout: bool
    verify_cluster_connection: bool


def resolve_elasticsearch_env(config: dict[str, Any] | None = None) -> ElasticsearchEnv:
    return ElasticsearchEnv(
        vendor_type=resolve(None, ['ELASTIC_DB_VENDOR_TYPE'], config, 'vendor_type', 'on-prem'),
        host=resolve(None, ['ELASTIC_DB_HOST'], config, 'host', 'localhost'),
        port=resolve_int(None, ['ELASTIC_DB_PORT'], config, 'port', 9200),
        scheme=resolve(None, ['ELASTIC_DB_SCHEME'], config, 'scheme', 'https'),
        cloud_id=resolve(None, ['ELASTIC_DB_CLOUD_ID'], config, 'cloud_id', None),
        index=resolve(None, ['ELASTIC_DB_INDEX'], config, 'index', None),
        api_key=resolve(None, ['ELASTIC_DB_API_KEY'], config, 'api_key', None),
        username=resolve(None, ['ELASTIC_DB_USERNAME'], config, 'username', None),
        password=resolve(None, ['ELASTIC_DB_PASSWORD'], config, 'password', None),
        access_key=resolve(None, ['ELASTIC_DB_ACCESS_KEY'], config, 'access_key', None),
        api_auth_type=resolve(None, ['ELASTIC_DB_API_AUTH_TYPE'], config, 'api_auth_type', None),
        use_tls=resolve_bool(None, ['ELASTIC_DB_USE_TLS'], config, 'use_tls', False),
        verify_certs=resolve_bool(None, ['ELASTIC_DB_VERIFY_CERTS'], config, 'verify_certs', False),
        ssl_show_warn=resolve_bool(None, ['ELASTIC_DB_SSL_SHOW_WARN'], config, 'ssl_show_warn', False),
        ca_certs=resolve(None, ['ELASTIC_DB_CA_CERTS'], config, 'ca_certs', None),
        client_cert=resolve(None, ['ELASTIC_DB_CLIENT_CERT'], config, 'client_cert', None),
        client_key=resolve(None, ['ELASTIC_DB_CLIENT_KEY'], config, 'client_key', None),
        request_timeout=resolve_int(None, ['ELASTIC_DB_REQUEST_TIMEOUT'], config, 'request_timeout', 30),
        connect_timeout=resolve_int(None, ['ELASTIC_DB_CONNECT_TIMEOUT'], config, 'connect_timeout', 10),
        max_retries=resolve_int(None, ['ELASTIC_DB_MAX_RETRIES'], config, 'max_retries', 3),
        retry_on_timeout=resolve_bool(None, ['ELASTIC_DB_RETRY_ON_TIMEOUT'], config, 'retry_on_timeout', True),
        verify_cluster_connection=resolve_bool(None, ['ELASTIC_DB_VERIFY_CLUSTER_CONNECTION'], config, 'verify_cluster_connection', False),
    )
