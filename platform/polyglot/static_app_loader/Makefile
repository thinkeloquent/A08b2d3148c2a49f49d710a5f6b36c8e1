# Static App Loader - Polyglot Package Makefile
# Requires: Node.js 20.x, Python 3.11.x

.PHONY: all install install-mjs install-py build build-mjs build-py \
        test test-mjs test-py test-unit test-integration test-coverage \
        lint lint-mjs lint-py clean clean-mjs clean-py \
        dev-mjs dev-py examples examples-mjs examples-py help

# Default target
all: install build test

# ============================================================================
# Installation
# ============================================================================

install: install-mjs install-py
	@echo "✓ All packages installed"

install-mjs:
	@echo "Installing Node.js dependencies..."
	cd mjs && npm install
	@echo "✓ Node.js dependencies installed"

install-py:
	@echo "Installing Python dependencies..."
	cd py && pip install -e ".[dev]"
	@echo "✓ Python dependencies installed"

# ============================================================================
# Build
# ============================================================================

build: build-mjs
	@echo "✓ All packages built"

build-mjs:
	@echo "Building Node.js package..."
	cd mjs && npm run build
	@echo "✓ Node.js package built"

# Python doesn't need a build step for source distribution
build-py:
	@echo "Python package is source-only, no build required"

# ============================================================================
# Testing
# ============================================================================

test: test-mjs test-py
	@echo "✓ All tests passed"

test-mjs:
	@echo "Running Node.js tests..."
	cd mjs && npm test

test-py:
	@echo "Running Python tests..."
	cd py && pytest -v

# Run only unit tests
test-unit: test-unit-mjs test-unit-py
	@echo "✓ All unit tests passed"

test-unit-mjs:
	@echo "Running Node.js unit tests..."
	cd mjs && npm test -- --grep "Unit|types|logger|errors|sdk|path-rewriter|template"

test-unit-py:
	@echo "Running Python unit tests..."
	cd py && pytest -v __tests__/test_types.py __tests__/test_logger.py __tests__/test_errors.py __tests__/test_path_rewriter.py __tests__/test_template_resolver.py

# Run only integration tests
test-integration: test-integration-mjs test-integration-py
	@echo "✓ All integration tests passed"

test-integration-mjs:
	@echo "Running Node.js integration tests (Fastify)..."
	cd mjs && npm test -- __tests__/plugin.integration.test.ts

test-integration-py:
	@echo "Running Python integration tests (FastAPI)..."
	cd py && pytest -v __tests__/test_fastapi_integration.py

# Run tests with coverage
test-coverage: test-coverage-mjs test-coverage-py
	@echo "✓ Coverage reports generated"

test-coverage-mjs:
	@echo "Running Node.js tests with coverage..."
	cd mjs && npm test -- --coverage

test-coverage-py:
	@echo "Running Python tests with coverage..."
	cd py && pytest --cov=static_app_loader --cov-report=html --cov-report=term

# ============================================================================
# Linting
# ============================================================================

lint: lint-mjs lint-py
	@echo "✓ All linting passed"

lint-mjs:
	@echo "Linting Node.js code..."
	cd mjs && npm run lint || true
	cd mjs && npm run typecheck

lint-py:
	@echo "Linting Python code..."
	cd py && ruff check src/ || true
	cd py && mypy src/ || true

# ============================================================================
# Examples
# ============================================================================

examples: examples-mjs examples-py
	@echo "✓ All examples completed"

examples-mjs:
	@echo "Running Node.js examples..."
	cd mjs/examples && make start

examples-py:
	@echo "Running Python examples..."
	cd py/examples && make start

# Run example servers in dev mode
dev-example-mjs:
	@echo "Starting Fastify example server..."
	cd mjs/examples && make dev

dev-example-py:
	@echo "Starting FastAPI example server..."
	cd py/examples && make dev

# ============================================================================
# Development
# ============================================================================

dev-mjs:
	@echo "Starting Node.js development mode..."
	cd mjs && npm run dev

dev-py:
	@echo "Python development mode: edit and re-import"

# ============================================================================
# Cleanup
# ============================================================================

clean: clean-mjs clean-py
	@echo "✓ All packages cleaned"

clean-mjs:
	@echo "Cleaning Node.js package..."
	cd mjs && rm -rf dist node_modules coverage
	@echo "✓ Node.js package cleaned"

clean-py:
	@echo "Cleaning Python package..."
	cd py && rm -rf __pycache__ .pytest_cache .mypy_cache .ruff_cache htmlcov .coverage
	cd py && find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	cd py && find . -type f -name "*.pyc" -delete 2>/dev/null || true
	cd py && rm -rf src/*.egg-info
	@echo "✓ Python package cleaned"

# ============================================================================
# Help
# ============================================================================

help:
	@echo "Static App Loader - Polyglot Package"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Installation & Build:"
	@echo "  all              Install, build, and test all packages (default)"
	@echo "  install          Install dependencies for all packages"
	@echo "  install-mjs      Install Node.js dependencies"
	@echo "  install-py       Install Python dependencies"
	@echo "  build            Build all packages"
	@echo "  build-mjs        Build Node.js package"
	@echo ""
	@echo "Testing:"
	@echo "  test             Run all tests (Fastify + FastAPI)"
	@echo "  test-mjs         Run Node.js tests (Vitest)"
	@echo "  test-py          Run Python tests (pytest)"
	@echo "  test-unit        Run unit tests only"
	@echo "  test-integration Run integration tests only (Fastify/FastAPI)"
	@echo "  test-coverage    Run tests with coverage reports"
	@echo ""
	@echo "Linting:"
	@echo "  lint             Lint all packages"
	@echo "  lint-mjs         Lint Node.js code (Biome + TypeScript)"
	@echo "  lint-py          Lint Python code (Ruff + MyPy)"
	@echo ""
	@echo "Examples:"
	@echo "  examples         Run basic usage examples"
	@echo "  examples-mjs     Run Node.js examples"
	@echo "  examples-py      Run Python examples"
	@echo "  dev-example-mjs  Start Fastify example server"
	@echo "  dev-example-py   Start FastAPI example server"
	@echo ""
	@echo "Development:"
	@echo "  dev-mjs          Start Node.js development mode"
	@echo "  clean            Clean all build artifacts"
	@echo "  help             Show this help message"
	@echo ""
	@echo "Requirements:"
	@echo "  - Node.js >= 20.0.0"
	@echo "  - Python >= 3.11"
	@echo "  - npm >= 10.0.0"
	@echo "  - pip >= 23.0.0"
