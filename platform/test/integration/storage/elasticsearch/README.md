# elasticsearch integration

Direct-import package tests for `db_connection_elasticsearch` / `db-connection-elasticsearch` (no endpoint calls).

Run commands:
- make setup
- make test-py
- make test-mjs
- make test-all

Notes:
- `AppYamlConfig` is initialized from `common/config`.
- Elasticsearch packages resolve env/defaults directly (do not consume AppYamlConfig internally).
