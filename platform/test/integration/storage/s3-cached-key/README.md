# s3-cached-key integration

Direct-import package tests for `cache_json_awss3_storage` config bridge (no endpoint calls).

Run commands:
- make setup
- make test-py
- make test-mjs
- make test-all

Notes:
- `AppYamlConfig` is initialized from `common/config`.
- `storage.s3` is passed into `get_client_factory_from_app_config` / `getClientFactoryFromAppConfig`.
