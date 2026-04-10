# s3 integration

Direct-import package tests for `aws_s3_client` / `aws-s3-client` (no endpoint calls).

Run commands:
- make setup
- make test-py
- make test-mjs
- make test-all

Notes:
- `AppYamlConfig` is initialized from `common/config`.
- `storage.s3` is passed into `config_from_env` / `configFromEnv` to match server-side config resolution.
