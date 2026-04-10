# Makefile for cache_json_awss3_storage polyglot package
#
# Provides targets for installing, building, testing, and cleaning
# both Python and TypeScript implementations.

.PHONY: all install install-py install-mjs build build-py build-mjs \
        test test-py test-mjs test-unit test-unit-py test-unit-mjs \
        test-integration test-integration-py test-integration-mjs \
        test-py-cov test-mjs-cov \
        lint lint-py lint-mjs clean clean-py clean-mjs help \
        dev-py dev-mjs verify-parity examples-py examples-mjs

# Default target
all: install build

# =============================================================================
# Installation Targets
# =============================================================================

## Install all dependencies
install: install-py install-mjs
	@echo "All dependencies installed"

## Install Python dependencies
install-py:
	@echo "Installing Python dependencies..."
	cd py && python3.11 -m pip install -e ".[dev,fastapi]"
	@echo "Installing integration test dependencies..."
	cd py && python3.11 -m pip install moto[s3] httpx

## Install Node.js dependencies
install-mjs:
	@echo "Installing Node.js dependencies..."
	cd mjs && npm install
	@echo "Installing integration test dependencies..."
	cd mjs && npm install fastify fastify-plugin --save-dev || true

# =============================================================================
# Build Targets
# =============================================================================

## Build all packages
build: build-py build-mjs
	@echo "All packages built"

## Build Python package (type check)
build-py:
	@echo "Type checking Python package..."
	cd py && python3.11 -m mypy cache_json_awss3_storage

## Build TypeScript package
build-mjs:
	@echo "Building TypeScript package..."
	cd mjs && npm run build

# =============================================================================
# Test Targets
# =============================================================================

## Run all tests (unit + integration)
test: test-unit test-integration
	@echo "All tests completed"

## Run all Python tests
test-py: test-unit-py test-integration-py
	@echo "All Python tests completed"

## Run all TypeScript tests
test-mjs: test-unit-mjs test-integration-mjs
	@echo "All TypeScript tests completed"

# -----------------------------------------------------------------------------
# Unit Tests
# -----------------------------------------------------------------------------

## Run all unit tests
test-unit: test-unit-py test-unit-mjs
	@echo "All unit tests completed"

## Run Python unit tests (from cache_json_awss3_storage/tests/)
test-unit-py:
	@echo "Running Python unit tests..."
	cd py && python3.11 -m pytest cache_json_awss3_storage/tests/ -v

## Run TypeScript unit tests (from src/__tests__/)
test-unit-mjs:
	@echo "Running TypeScript unit tests..."
	cd mjs && npm test -- --run src/__tests__/

# -----------------------------------------------------------------------------
# Integration Tests (FastAPI / Fastify)
# -----------------------------------------------------------------------------

## Run all integration tests
test-integration: test-integration-py test-integration-mjs
	@echo "All integration tests completed"

## Run Python/FastAPI integration tests (from __tests__/)
test-integration-py:
	@echo "Running Python/FastAPI integration tests..."
	cd py && python3.11 -m pytest __tests__/ -v

## Run TypeScript/Fastify integration tests (from __tests__/)
test-integration-mjs:
	@echo "Running TypeScript/Fastify integration tests..."
	cd mjs && npm test -- --run __tests__/

# -----------------------------------------------------------------------------
# Coverage Tests
# -----------------------------------------------------------------------------

## Run Python tests with coverage
test-py-cov:
	@echo "Running Python tests with coverage..."
	cd py && python3.11 -m pytest -v --cov=cache_json_awss3_storage --cov-report=html --cov-report=term \
		cache_json_awss3_storage/tests/ __tests__/

## Run TypeScript tests with coverage
test-mjs-cov:
	@echo "Running TypeScript tests with coverage..."
	cd mjs && npm run test:coverage

# =============================================================================
# Lint Targets
# =============================================================================

## Lint all code
lint: lint-py lint-mjs
	@echo "All linting completed"

## Lint Python code
lint-py:
	@echo "Linting Python code..."
	cd py && python3.11 -m ruff check cache_json_awss3_storage __tests__

## Fix Python lint issues
lint-py-fix:
	@echo "Fixing Python lint issues..."
	cd py && python3.11 -m ruff check --fix cache_json_awss3_storage __tests__

## Lint TypeScript code
lint-mjs:
	@echo "Linting TypeScript code..."
	cd mjs && npm run lint || true

## Type check TypeScript
typecheck-mjs:
	@echo "Type checking TypeScript..."
	cd mjs && npm run typecheck

# =============================================================================
# Clean Targets
# =============================================================================

## Clean all build artifacts
clean: clean-py clean-mjs
	@echo "All artifacts cleaned"

## Clean Python build artifacts
clean-py:
	@echo "Cleaning Python artifacts..."
	cd py && rm -rf build dist *.egg-info .pytest_cache .mypy_cache .ruff_cache htmlcov .coverage
	find py -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

## Clean TypeScript build artifacts
clean-mjs:
	@echo "Cleaning TypeScript artifacts..."
	cd mjs && rm -rf dist coverage

# =============================================================================
# Development Targets
# =============================================================================

## Watch TypeScript for changes
dev-mjs:
	@echo "Starting TypeScript watch mode..."
	cd mjs && npm run dev

## Watch Python tests
dev-py:
	@echo "Starting Python test watch mode..."
	cd py && python3.11 -m pytest-watch

## Run Python examples
examples-py:
	@echo "Running Python examples..."
	cd py/examples && python3.11 basic_usage.py

## Run TypeScript examples
examples-mjs:
	@echo "Running TypeScript examples..."
	cd mjs && npx tsx examples/basic-usage.ts

## Start Python FastAPI example server
dev-fastapi:
	@echo "Starting FastAPI example server..."
	cd py/examples && uvicorn fastapi_app.main:app --reload --port 8000

## Start TypeScript Fastify example server
dev-fastify:
	@echo "Starting Fastify example server..."
	cd mjs && npx tsx examples/fastify-app/server.ts

# =============================================================================
# Cross-Language Verification
# =============================================================================

## Verify key generation parity between Python and TypeScript
verify-parity:
	@echo "Verifying cross-language parity..."
	@echo "Running Python key generation test..."
	@cd py && python3.11 -c "from cache_json_awss3_storage import generate_key; print(generate_key({'user_id': 123, 'name': 'Alice'}))"
	@echo "Running TypeScript key generation test..."
	@cd mjs && npm run build --silent && node -e "import('./dist/index.js').then(m => console.log(m.generateKey({user_id: 123, name: 'Alice'})))"
	@echo ""
	@echo "✓ If both keys match (a3a1025004e50a9b), parity is verified!"

# =============================================================================
# CI/CD Targets
# =============================================================================

## Run full CI suite (lint, build, test)
ci: lint build test verify-parity
	@echo "CI suite completed successfully"

## Run quick check (lint + unit tests only)
check: lint test-unit
	@echo "Quick check completed"

# =============================================================================
# Help
# =============================================================================

## Show this help message
help:
	@echo "cache_json_awss3_storage - Polyglot JSON Storage for AWS S3"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Installation:"
	@echo "  install           Install all dependencies"
	@echo "  install-py        Install Python dependencies"
	@echo "  install-mjs       Install Node.js dependencies"
	@echo ""
	@echo "Build:"
	@echo "  build             Build all packages"
	@echo "  build-py          Type check Python package"
	@echo "  build-mjs         Build TypeScript package"
	@echo ""
	@echo "Testing:"
	@echo "  test              Run all tests (unit + integration)"
	@echo "  test-py           Run all Python tests"
	@echo "  test-mjs          Run all TypeScript tests"
	@echo "  test-unit         Run unit tests only"
	@echo "  test-unit-py      Run Python unit tests"
	@echo "  test-unit-mjs     Run TypeScript unit tests"
	@echo "  test-integration  Run integration tests (FastAPI/Fastify)"
	@echo "  test-integration-py   Run Python/FastAPI integration tests"
	@echo "  test-integration-mjs  Run TypeScript/Fastify integration tests"
	@echo "  test-py-cov       Run Python tests with coverage"
	@echo "  test-mjs-cov      Run TypeScript tests with coverage"
	@echo ""
	@echo "Linting:"
	@echo "  lint              Lint all code"
	@echo "  lint-py           Lint Python code"
	@echo "  lint-py-fix       Fix Python lint issues"
	@echo "  lint-mjs          Lint TypeScript code"
	@echo "  typecheck-mjs     Type check TypeScript"
	@echo ""
	@echo "Development:"
	@echo "  dev-py            Watch Python tests"
	@echo "  dev-mjs           Watch TypeScript for changes"
	@echo "  dev-fastapi       Start FastAPI example server"
	@echo "  dev-fastify       Start Fastify example server"
	@echo "  examples-py       Run Python examples"
	@echo "  examples-mjs      Run TypeScript examples"
	@echo ""
	@echo "Utilities:"
	@echo "  verify-parity     Verify cross-language key generation parity"
	@echo "  ci                Run full CI suite"
	@echo "  check             Run quick check (lint + unit tests)"
	@echo "  clean             Clean all build artifacts"
	@echo "  help              Show this help message"
	@echo ""
	@echo "Requirements:"
	@echo "  - Python 3.11.x"
	@echo "  - Node.js 20.x"
	@echo "  - npm"
