# Statsig Console API — Polyglot Package
# Targets: install, test, test-py, test-mjs, test-fastapi, test-fastify, lint, clean

.PHONY: install test test-py test-mjs test-fastapi test-fastify test-integration lint clean

ROOT := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

# ── Install ──────────────────────────────────────────────────────────
install: install-py install-mjs

install-py:
	cd $(ROOT)/py && pip install -e ".[dev]"

install-mjs:
	cd $(ROOT)/mjs && pnpm install

# ── Test — All ───────────────────────────────────────────────────────
test: test-py test-mjs

# ── Test — Python (unit + FastAPI integration) ───────────────────────
test-py:
	cd $(ROOT)/py && python -m pytest __tests__/ -v

test-fastapi:
	cd $(ROOT)/py && python -m pytest __tests__/test_fastapi_integration.py -v

# ── Test — Node.js (unit + Fastify integration) ─────────────────────
test-mjs:
	cd $(ROOT)/mjs && npx vitest run

test-fastify:
	cd $(ROOT)/mjs && npx vitest run __tests__/fastify.integration.test.mjs

# ── Test — Integration only (FastAPI + Fastify) ─────────────────────
test-integration: test-fastapi test-fastify

# ── Lint ─────────────────────────────────────────────────────────────
lint:
	@echo "Linting Python..."
	cd $(ROOT)/py && python -m py_compile statsig_client/__init__.py
	@echo "Linting Node.js..."
	cd $(ROOT)/mjs && node --check src/index.mjs

# ── Clean ────────────────────────────────────────────────────────────
clean:
	cd $(ROOT)/py && rm -rf __pycache__ *.egg-info .pytest_cache
	cd $(ROOT)/mjs && rm -rf node_modules
