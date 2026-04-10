# Storage Integration Tests

Direct-import CLI tests for storage packages (no endpoint calls).

Folders:
- `postgres`
- `redis`
- `elasticsearch`
- `s3`
- `s3-cached-key`

Each folder includes:
- `service.json` package mapping
- `test_case.py` Python direct-import test
- `test_case.mjs` Node direct-import test
- `Makefile` with local `.venv` setup/install/test targets

Shared defaults:
- `APP_ENV=dev`
- `CONFIG_DIR=/Users/Shared/autoload/mta-v800/platform/common/config`
