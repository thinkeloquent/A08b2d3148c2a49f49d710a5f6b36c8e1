# redis integration

Direct-import package tests for `db_connection_redis` (no endpoint calls).

Run commands:
- make setup
- make test-py
- make test-mjs
- make test-all

Notes:
- `AppYamlConfig` is initialized from `common/config`.
- Python package consumes `AppYamlConfig.storage.redis`; MJS package resolves env/defaults.
