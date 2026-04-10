.PHONY: install install-py install-mjs build build-py build-mjs test test-py test-mjs test-unit test-integration lint lint-py lint-mjs clean clean-py clean-mjs help

# ─── Install ───────────────────────────────────────────────────────────────────
install: install-py install-mjs

install-py:
	cd py && pip install -e ".[dev]"

install-mjs:
	cd mjs && npm install

# ─── Build ─────────────────────────────────────────────────────────────────────
build: build-py build-mjs

build-py:
	cd py && python -m py_compile fetch_http_cache_response/__init__.py

build-mjs:
	cd mjs && npm run build

# ─── Test ──────────────────────────────────────────────────────────────────────
test: test-py test-mjs

test-py:
	cd py && python -m pytest fetch_http_cache_response/tests/ -v

test-mjs:
	cd mjs && npm test

test-unit: test-py test-mjs

test-integration:
	cd py && python -m pytest __tests__/ -v -m integration
	cd mjs && npm run test:integration

# ─── Lint ──────────────────────────────────────────────────────────────────────
lint: lint-py lint-mjs

lint-py:
	cd py && python -m ruff check fetch_http_cache_response/

lint-mjs:
	cd mjs && npm run lint

# ─── Clean ─────────────────────────────────────────────────────────────────────
clean: clean-py clean-mjs

clean-py:
	cd py && rm -rf __pycache__ .pytest_cache .mypy_cache *.egg-info
	find py -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

clean-mjs:
	cd mjs && rm -rf dist node_modules

# ─── CI ────────────────────────────────────────────────────────────────────────
ci: lint build test

# ─── Help ──────────────────────────────────────────────────────────────────────
help:
	@echo "fetch_http_cache_response — Polyglot HTTP Client with S3 Response Caching"
	@echo ""
	@echo "Targets:"
	@echo "  install          Install py + mjs dependencies"
	@echo "  build            Build py + mjs"
	@echo "  test             Run all tests (py + mjs)"
	@echo "  test-py          Run Python tests"
	@echo "  test-mjs         Run Node.js tests"
	@echo "  test-unit        Run unit tests only"
	@echo "  test-integration Run integration tests"
	@echo "  lint             Lint py + mjs"
	@echo "  clean            Remove build artifacts"
	@echo "  ci               Full CI (lint + build + test)"
