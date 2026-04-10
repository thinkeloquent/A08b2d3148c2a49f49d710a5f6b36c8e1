# AWS S3 Client — Environment Variables

Environment variables used by the polyglot `aws_s3_client` SDK (Node + Python).

## Core

| Variable | Required | Default | Description |
|---|---|---|---|
| `AWS_S3_BUCKET` | yes | `""` | S3 bucket name for storage operations |
| `AWS_REGION` | no | `us-east-1` | AWS region (falls back to `AWS_DEFAULT_REGION`) |
| `AWS_DEFAULT_REGION` | no | `us-east-1` | Fallback region when `AWS_REGION` is not set |
| `AWS_S3_KEY_PREFIX` | no | `jss3:` | Prefix prepended to all S3 object keys |
| `AWS_S3_TTL` | no | _(none)_ | Default TTL in seconds; objects never expire when unset |
| `AWS_S3_DEBUG` | no | `false` | Enable debug logging (`true`, `1`, `yes`) |

## Credentials

| Variable | Required | Default | Description |
|---|---|---|---|
| `AWS_ACCESS_KEY_ID` | no | _(none)_ | AWS IAM access key; falls back to the SDK credential chain |
| `AWS_SECRET_ACCESS_KEY` | no | _(none)_ | AWS IAM secret key; falls back to the SDK credential chain |

## Endpoint & Networking

| Variable | Required | Default | Description |
|---|---|---|---|
| `AWS_ENDPOINT_URL` | no | _(none)_ | Custom S3-compatible endpoint (LocalStack, MinIO, etc.) |
| `AWS_S3_PROXY` | no | _(none)_ | HTTP/HTTPS proxy URL; falls back to `HTTPS_PROXY` |
| `HTTPS_PROXY` | no | _(none)_ | Standard proxy variable (used when `AWS_S3_PROXY` is unset) |
| `AWS_S3_FORCE_PATH_STYLE` | no | `false` | Force path-style addressing (`true`, `1`, `yes`) |

## Timeouts & Retries (Python only)

These are consumed by the Python SDK via `botocore.config.Config`.

| Variable | Required | Default | Description |
|---|---|---|---|
| `AWS_S3_CONNECT_TIMEOUT` | no | `10` | Connection timeout in seconds |
| `AWS_S3_READ_TIMEOUT` | no | `60` | Read timeout in seconds |
| `AWS_S3_MAX_RETRIES` | no | `3` | Maximum retry attempts for transient failures |
| `AWS_S3_VERIFY_SSL` | no | `false` | Enable SSL certificate verification (`true`, `1`, `yes`) |

## Config Functions

Both languages expose a `configFromEnv` / `config_from_env` helper that reads all
variables above and returns a plain config object (dict / object). Overrides can
be passed as keyword arguments / object properties to take precedence over env vars.

| Language | Function | Location |
|---|---|---|
| Python | `config_from_env(**overrides)` | `aws_s3_client.config` |
| Python | `SDKConfig.from_env(**overrides)` | `aws_s3_client.config` |
| Node | `configFromEnv(overrides?)` | `aws-s3-client` (re-exported from `config.ts`) |
