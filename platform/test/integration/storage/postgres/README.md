# postgres integration

Direct-import package tests for `db_connection_postgres` (no endpoint calls).

Run commands:
- make setup
- make test-py
- make test-mjs
- make test-all

Notes:
- `AppYamlConfig` is initialized from `common/config`.
- Postgres package resolves env/defaults directly (does not consume AppYamlConfig internally).
