.PHONY: install-py install-mjs install-all test-py test-mjs test-all test-unit-py test-unit-mjs test-unit-all test-integration-fastapi test-integration-fastify test-integration-all lint-py lint-mjs lint-all build clean

ROOT := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
MJS_DIR := $(ROOT)/mjs
PY_DIR := $(ROOT)/py

# --- Install ---
install-py:
	cd $(PY_DIR) && pip install -e ".[dev]"

install-mjs:
	cd $(MJS_DIR) && pnpm install

install-all: install-py install-mjs

# --- Test ---
test-py:
	cd $(PY_DIR) && python -m pytest __tests__/ -v --tb=short --cov=src/confluence_api --cov-report=term-missing --cov-fail-under=80

test-mjs:
	cd $(MJS_DIR) && npx vitest run --reporter=verbose

test-all: test-py test-mjs

# --- Unit Tests ---
test-unit-py:
	cd $(PY_DIR) && python -m pytest __tests__/ -v --tb=short --ignore=__tests__/test_server_integration.py --cov=src/confluence_api --cov-report=term-missing --cov-fail-under=80

test-unit-mjs:
	cd $(MJS_DIR) && npx vitest run --reporter=verbose --exclude='__tests__/server.test.mjs'

test-unit-all: test-unit-py test-unit-mjs

# --- Integration Tests ---
test-integration-fastapi:
	cd $(PY_DIR) && python -m pytest __tests__/test_server_integration.py -v --tb=short

test-integration-fastify:
	cd $(MJS_DIR) && npx vitest run --reporter=verbose __tests__/server.test.mjs

test-integration-all: test-integration-fastapi test-integration-fastify

# --- Lint ---
lint-py:
	cd $(PY_DIR) && python -m ruff check src/ __tests__/ && python -m mypy src/

lint-mjs:
	cd $(MJS_DIR) && npx biome check src/

lint-all: lint-py lint-mjs

# --- Build ---
build:
	cd $(MJS_DIR) && npx tsc --noEmit

# --- Clean ---
clean:
	rm -rf $(MJS_DIR)/node_modules $(MJS_DIR)/dist
	rm -rf $(PY_DIR)/.venv $(PY_DIR)/__pycache__ $(PY_DIR)/src/*.egg-info
