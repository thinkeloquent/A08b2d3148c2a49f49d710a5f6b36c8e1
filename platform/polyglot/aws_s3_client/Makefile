# AWS S3 Client - Polyglot Package Makefile
# Supports Python 3.11.x and Node.js 20.x

.PHONY: all install install-py install-mjs build build-py build-mjs \
        test test-py test-mjs test-unit test-unit-py test-unit-mjs \
        test-integration test-integration-py test-integration-mjs \
        test-coverage test-coverage-py test-coverage-mjs \
        lint lint-py lint-mjs fix-py fix-mjs \
        dev-py dev-mjs clean clean-py clean-mjs help

# Default target
all: install build test

# =============================================================================
# Installation
# =============================================================================

install: install-py install-mjs
	@echo "All dependencies installed"

install-py:
	@echo "Installing Python dependencies..."
	cd py && pip install -e ".[dev]"

install-mjs:
	@echo "Installing Node.js dependencies..."
	cd mjs && npm install

# =============================================================================
# Build
# =============================================================================

build: build-py build-mjs
	@echo "All packages built"

build-py:
	@echo "Building Python package..."
	cd py && python -m build

build-mjs:
	@echo "Building TypeScript package..."
	cd mjs && npm run build

# =============================================================================
# Testing - All Tests
# =============================================================================

test: test-py test-mjs
	@echo "All tests passed"

test-py:
	@echo "Running Python tests..."
	cd py && pytest -v __tests__/ aws_s3_client/tests/

test-mjs:
	@echo "Running TypeScript tests..."
	cd mjs && npm test

# =============================================================================
# Testing - Unit Tests Only
# =============================================================================

test-unit: test-unit-py test-unit-mjs
	@echo "All unit tests passed"

test-unit-py:
	@echo "Running Python unit tests..."
	cd py && pytest -v __tests__/test_storage.py __tests__/test_sdk.py __tests__/test_config.py aws_s3_client/tests/

test-unit-mjs:
	@echo "Running TypeScript unit tests..."
	cd mjs && npm test -- --grep "Storage|SDK|Config|Logger|KeyGenerator"

# =============================================================================
# Testing - Integration Tests (FastAPI & Fastify)
# =============================================================================

test-integration: test-integration-py test-integration-mjs
	@echo "All integration tests passed"

test-integration-py:
	@echo "Running FastAPI integration tests..."
	cd py && pytest -v __tests__/test_fastapi_integration.py -m "not slow"

test-integration-mjs:
	@echo "Running Fastify integration tests..."
	cd mjs && npm test -- --grep "Fastify"

# =============================================================================
# Testing - Coverage Reports
# =============================================================================

test-coverage: test-coverage-py test-coverage-mjs
	@echo "Coverage reports generated"

test-coverage-py:
	@echo "Running Python tests with coverage..."
	cd py && pytest --cov=aws_s3_client --cov-report=html --cov-report=term-missing __tests__/ aws_s3_client/tests/
	@echo "Coverage report: py/htmlcov/index.html"

test-coverage-mjs:
	@echo "Running TypeScript tests with coverage..."
	cd mjs && npm test -- --coverage
	@echo "Coverage report: mjs/coverage/index.html"

# =============================================================================
# Testing - Watch Mode
# =============================================================================

test-watch-py:
	@echo "Running Python tests in watch mode..."
	cd py && pytest-watch -- -v __tests__/

test-watch-mjs:
	@echo "Running TypeScript tests in watch mode..."
	cd mjs && npm test -- --watch

# =============================================================================
# Linting & Type Checking
# =============================================================================

lint: lint-py lint-mjs
	@echo "All linting passed"

lint-py:
	@echo "Linting Python..."
	cd py && ruff check aws_s3_client/ __tests__/
	cd py && mypy aws_s3_client/

lint-mjs:
	@echo "Linting TypeScript..."
	cd mjs && npm run lint
	cd mjs && npm run typecheck

fix-py:
	@echo "Fixing Python lint issues..."
	cd py && ruff check --fix aws_s3_client/ __tests__/

fix-mjs:
	@echo "Fixing TypeScript lint issues..."
	cd mjs && npm run lint:fix

# =============================================================================
# Development
# =============================================================================

dev-py:
	@echo "Starting Python development server..."
	cd py && uvicorn examples.fastapi_app.main:app --reload --port 8000

dev-mjs:
	@echo "Starting TypeScript development server..."
	cd mjs && npm run dev

# =============================================================================
# Examples
# =============================================================================

run-example-py:
	@echo "Running Python basic example..."
	cd py/examples && python basic_usage.py

run-example-mjs:
	@echo "Running TypeScript basic example..."
	cd mjs && npx tsx examples/basic-usage.ts

# =============================================================================
# Parity Verification
# =============================================================================

verify-parity:
	@echo "Verifying cross-language parity..."
	cd py && pytest -v -k "parity"
	cd mjs && npm run test:parity

# =============================================================================
# Clean
# =============================================================================

clean: clean-py clean-mjs
	@echo "All build artifacts cleaned"

clean-py:
	@echo "Cleaning Python artifacts..."
	cd py && rm -rf build/ dist/ *.egg-info/ .pytest_cache/ .mypy_cache/ __pycache__/ htmlcov/ .coverage
	find py -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

clean-mjs:
	@echo "Cleaning Node.js artifacts..."
	cd mjs && rm -rf dist/ node_modules/.cache/ coverage/

# =============================================================================
# CI/CD
# =============================================================================

ci: lint test
	@echo "CI checks passed"

ci-full: lint test-coverage
	@echo "Full CI checks passed"

# =============================================================================
# Quick Commands
# =============================================================================

# Quick test all
q: test

# Quick test Python
qp: test-py

# Quick test TypeScript
qm: test-mjs

# =============================================================================
# Help
# =============================================================================

help:
	@echo "AWS S3 Client - Polyglot Package"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Installation & Build:"
	@echo "  install           Install all dependencies"
	@echo "  install-py        Install Python dependencies"
	@echo "  install-mjs       Install Node.js dependencies"
	@echo "  build             Build all packages"
	@echo "  build-py          Build Python package"
	@echo "  build-mjs         Build TypeScript package"
	@echo ""
	@echo "Testing:"
	@echo "  test              Run all tests"
	@echo "  test-py           Run Python tests"
	@echo "  test-mjs          Run TypeScript tests"
	@echo "  test-unit         Run unit tests only"
	@echo "  test-unit-py      Run Python unit tests"
	@echo "  test-unit-mjs     Run TypeScript unit tests"
	@echo "  test-integration  Run integration tests (FastAPI & Fastify)"
	@echo "  test-integration-py   Run FastAPI integration tests"
	@echo "  test-integration-mjs  Run Fastify integration tests"
	@echo "  test-coverage     Run tests with coverage reports"
	@echo "  test-coverage-py  Run Python tests with coverage"
	@echo "  test-coverage-mjs Run TypeScript tests with coverage"
	@echo ""
	@echo "Linting:"
	@echo "  lint              Run all linters"
	@echo "  lint-py           Run Python linter (ruff + mypy)"
	@echo "  lint-mjs          Run TypeScript linter (eslint)"
	@echo "  fix-py            Fix Python lint issues"
	@echo "  fix-mjs           Fix TypeScript lint issues"
	@echo ""
	@echo "Development:"
	@echo "  dev-py            Start Python dev server (FastAPI)"
	@echo "  dev-mjs           Start TypeScript dev server (Fastify)"
	@echo "  run-example-py    Run Python basic example"
	@echo "  run-example-mjs   Run TypeScript basic example"
	@echo ""
	@echo "Other:"
	@echo "  clean             Clean all build artifacts"
	@echo "  ci                Run CI checks (lint + test)"
	@echo "  ci-full           Run full CI checks with coverage"
	@echo "  help              Show this help message"
