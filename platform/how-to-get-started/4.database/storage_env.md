# Storage ENV Variables

Environment variables required by each storage service shown in the
[test-integration/storage](http://localhost:51000/apps/test-integration/storage/) dashboard.

All four services use a multi-tier resolution order:
**Direct argument > YAML config (`server.dev.yaml`) > Environment variable > Default**

---

## PostgreSQL

| Variable | Aliases | Default | Description |
|----------|---------|---------|-------------|
| `POSTGRES_HOST` | `POSTGRES_HOSTNAME`, `DATABASE_HOST` | `localhost` | Hostname |
| `POSTGRES_PORT` | `DATABASE_PORT` | `5432` | Port |
| `POSTGRES_USER` | `DATABASE_USER`, `POSTGRES_USERNAME` | `postgres` | Username |
| `POSTGRES_PASSWORD` | `DATABASE_PASSWORD` | *(none)* | Password |
| `POSTGRES_DB` | `POSTGRES_DATABASE`, `DATABASE_NAME` | `postgres` | Database name |
| `POSTGRES_SCHEMA` | `DATABASE_SCHEMA` | `public` | Schema |
| `POSTGRES_SSL_MODE` | `DATABASE_SSL_MODE`, `POSTGRES_SSLMODE` | `prefer` | SSL mode (`disable`, `allow`, `prefer`, `require`, `verify-ca`, `verify-full`) |
| `POSTGRES_SSL_CA_FILE` | `POSTGRES_SSL_CA_CERTS` | *(none)* | Path to CA certificate file |
| `POSTGRES_SSL_CHECK_HOSTNAME` | | `true` | Verify hostname in SSL certificate |
| `POSTGRES_ECHO` | `DATABASE_ECHO` | `false` | Log SQL queries |
| `POSTGRES_POOL_SIZE` | `DATABASE_POOL_SIZE` | `5` | Connection pool size |
| `POSTGRES_MAX_OVERFLOW` | `DATABASE_MAX_OVERFLOW` | `10` | Max overflow connections (Python only) |
| `POSTGRES_POOL_TIMEOUT` | `DATABASE_POOL_TIMEOUT` | `30` | Pool timeout in seconds (Python only) |
| `POSTGRES_POOL_RECYCLE` | `DATABASE_POOL_RECYCLE` | `3600` | Connection recycle interval in seconds (Python only) |
| `POSTGRES_CONNECT_TIMEOUT` | | `30000` | Connect timeout in ms (Node.js only) |
| `DATABASE_URL` | | *(none)* | Full connection URL — overrides all individual settings when set. Format: `postgresql+asyncpg://user:pass@host:port/database` |

**YAML path:** `storage.postgres` in `common/config/server.dev.yaml`

**Minimum to connect:**
```bash
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secret
POSTGRES_DB=mydb
```

---

## Redis

| Variable | Aliases | Default | Description |
|----------|---------|---------|-------------|
| `REDIS_HOST` | `REDIS_HOSTNAME` | `localhost` | Hostname |
| `REDIS_PORT` | | `6379` | Port |
| `REDIS_USERNAME` | `REDIS_USER` | *(none)* | Username |
| `REDIS_PASSWORD` | `REDIS_AUTH` | *(none)* | Password |
| `REDIS_DB` | `REDIS_DATABASE` | `0` | Database number |
| `REDIS_SSL` | `REDIS_USE_SSL`, `REDIS_USE_TLS`, `REDIS_TLS` | `false` | Enable TLS |
| `REDIS_SSL_CERT_REQS` | | `none` | Certificate requirement (`none`, `optional`, `required`) |
| `REDIS_SSL_CA_CERTS` | | *(none)* | Path to CA certificate file |
| `REDIS_SSL_CA_DATA` | | *(none)* | CA certificate data (PEM) — Python only |
| `REDIS_SSL_CERTFILE` | `REDIS_SSL_CLIENT_CERT` | *(none)* | Client certificate file — Python only |
| `REDIS_SSL_KEYFILE` | `REDIS_SSL_CLIENT_KEY` | *(none)* | Client key file — Python only |
| `REDIS_SSL_CHECK_HOSTNAME` | | `false` | Verify hostname in TLS certificate |
| `REDIS_SOCKET_TIMEOUT` | | `5000` (ms) / `5.0` (s) | Socket timeout |
| `REDIS_SOCKET_CONNECT_TIMEOUT` | | `5000` (ms) / `5.0` (s) | Connection timeout |
| `REDIS_MAX_CONNECTIONS` | | `10` (Node) / *(none)* (Python) | Max pool size |
| `REDIS_MIN_CONNECTIONS` | | `0` | Min pool size (Node.js only) |
| `REDIS_URL` | | *(none)* | Full connection URL — overrides host/port/db/password. Format: `redis://[:password]@host:port/db` or `rediss://` for TLS |

**YAML path:** `storage.redis` in `common/config/server.dev.yaml`
(YAML fields: `host`, `port`, `db`, `username`, `password`, `use_ssl`, `ssl_cert_reqs`, `url`)

**Cloud vendor auto-detection:** If the hostname matches `cache.amazonaws.com`, `redis-cloud.com`, `upstash.io`, or `db.ondigitalocean.com`, TLS is automatically enabled.

**Minimum to connect:**
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## Elasticsearch

| Variable | Default | Description |
|----------|---------|-------------|
| `ELASTIC_DB_HOST` | `localhost` | Hostname |
| `ELASTIC_DB_PORT` | `9200` | Port |
| `ELASTIC_DB_SCHEME` | `https` | Scheme (`http` or `https`) |
| `ELASTIC_DB_VENDOR_TYPE` | `on-prem` | Vendor type (`on-prem`, `elastic-cloud`, `elastic-transport`, `digital-ocean`) |
| `ELASTIC_DB_CLOUD_ID` | *(none)* | Elastic Cloud deployment ID (auto-sets vendor to `elastic-cloud`) |
| `ELASTIC_DB_API_KEY` | *(none)* | API key for authentication |
| `ELASTIC_DB_USERNAME` | *(none)* | Basic auth username |
| `ELASTIC_DB_PASSWORD` | *(none)* | Basic auth password |
| `ELASTIC_DB_ACCESS_KEY` | *(none)* | Fallback password alias |
| `ELASTIC_DB_API_AUTH_TYPE` | *(none)* | Auth type override |
| `ELASTIC_DB_USE_TLS` | `false` | Force TLS (also auto-enabled by `https` scheme) |
| `ELASTIC_DB_VERIFY_CERTS` | `false` | Verify server certificates |
| `ELASTIC_DB_SSL_SHOW_WARN` | `false` | Show SSL warnings |
| `ELASTIC_DB_CA_CERTS` | *(none)* | Path to CA certificates |
| `ELASTIC_DB_CLIENT_CERT` | *(none)* | Client certificate |
| `ELASTIC_DB_CLIENT_KEY` | *(none)* | Client key |
| `ELASTIC_DB_INDEX` | *(none)* | Default index name |
| `ELASTIC_DB_VERIFY_CLUSTER_CONNECTION` | `false` | Verify cluster connectivity on init |
| `ELASTIC_DB_REQUEST_TIMEOUT` | `30000` | Request timeout in ms |
| `ELASTIC_DB_CONNECT_TIMEOUT` | `10000` | Connect timeout in ms |
| `ELASTIC_DB_MAX_RETRIES` | `3` | Max retry attempts |
| `ELASTIC_DB_RETRY_ON_TIMEOUT` | `true` | Retry on timeout |

**YAML path:** `storage.elasticsearch` in `common/config/server.dev.yaml`

**Cloud vendor auto-detection:** Setting `ELASTIC_DB_CLOUD_ID` auto-selects the `elastic-cloud` vendor. DigitalOcean is detected from hostname pattern or port `25060`.

**Minimum to connect (on-prem):**
```bash
ELASTIC_DB_HOST=localhost
ELASTIC_DB_PORT=9200
ELASTIC_DB_SCHEME=http
```

**Minimum to connect (Elastic Cloud):**
```bash
ELASTIC_DB_CLOUD_ID=my-deployment:dXMtY2VudHJh...
ELASTIC_DB_API_KEY=your-api-key
```

---

## AWS S3

| Variable | Aliases | Default | Description |
|----------|---------|---------|-------------|
| `AWS_S3_BUCKET` | | *(none)* | **Required.** S3 bucket name |
| `AWS_S3_REGION` | `AWS_REGION`, `AWS_DEFAULT_REGION` | `us-east-1` | AWS region |
| `AWS_S3_KEY_PREFIX` | | `jss3:` | Object key prefix |
| `AWS_S3_TTL` | | *(none)* | Default TTL in seconds (no expiration if unset) |
| `AWS_S3_DEBUG` | | `false` | Enable debug logging (`true`/`1`/`yes`) |
| `AWS_S3_ACCESS_KEY` | `AWS_ACCESS_KEY_ID` | *(none)* | AWS access key |
| `AWS_S3_SECRET_KEY` | `AWS_SECRET_ACCESS_KEY` | *(none)* | AWS secret key |
| `AWS_S3_ENDPOINT` | `AWS_ENDPOINT_URL` | *(none)* | Custom endpoint (LocalStack, MinIO) |
| `AWS_S3_PROXY` | `HTTPS_PROXY` | *(none)* | HTTP/HTTPS proxy URL |
| `AWS_S3_FORCE_PATH_STYLE` | | `false` | Force path-style addressing (LocalStack, MinIO) |
| `AWS_S3_CONNECT_TIMEOUT` | | `10` | Connect timeout in seconds (Python only) |
| `AWS_S3_READ_TIMEOUT` | | `60` | Read timeout in seconds (Python only) |
| `AWS_S3_MAX_RETRIES` | | `3` | Max retry attempts (Python only) |
| `AWS_S3_VERIFY_SSL` | | `false` | Verify SSL certificates (Python only) |

**YAML path:** `storage.s3` in `common/config/server.dev.yaml`
(YAML fields: `bucket_name`, `region_name`, `access_key_id`, `secret_access_key`, `endpoint_url`, `force_path_style`, `proxy_url`, `verify_ssl`)

**Minimum to connect (AWS):**
```bash
AWS_S3_BUCKET=my-bucket
AWS_S3_REGION=us-east-1
# Credentials via env, IAM role, or ~/.aws/credentials
```

**Minimum to connect (LocalStack):**
```bash
AWS_S3_BUCKET=my-bucket
AWS_S3_ENDPOINT=http://localhost:4566
AWS_S3_FORCE_PATH_STYLE=true
AWS_S3_ACCESS_KEY=test
AWS_S3_SECRET_KEY=test
```

---

## Source Locations

| Service | Node.js Config | Python Config |
|---------|----------------|---------------|
| PostgreSQL | `packages_mjs/db_connection_postgres/src/config.ts` | `packages_py/db_connection_postgres/db_connection_postgres/config.py` |
| Redis | `packages_mjs/db_connection_redis/src/config.ts` | `packages_py/db_connection_redis/db_connection_redis/config.py` |
| Elasticsearch | `packages_mjs/db-connection-elasticsearch/src/config.ts` | *(uses RAG ingest config)* |
| S3 | `node_modules/aws-s3-client/src/config.ts` | `polyglot/aws_s3_client/py/aws_s3_client/config.py` |
