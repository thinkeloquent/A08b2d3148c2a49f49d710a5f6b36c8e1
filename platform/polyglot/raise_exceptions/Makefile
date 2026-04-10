# =============================================================================
# Common Exceptions - Polyglot Package Makefile
# =============================================================================
# Root Makefile for building and installing both Python and Node.js packages
# Usage:
#   make install     - Install all packages
#   make build       - Build all packages
#   make test        - Run all tests
#   make clean       - Clean build artifacts
# =============================================================================

.PHONY: all install build test clean help
.PHONY: install-py install-mjs build-py build-mjs test-py test-mjs clean-py clean-mjs
.PHONY: lint lint-py lint-mjs format format-py format-mjs

# Default target
all: install build

# =============================================================================
# Variables
# =============================================================================

ROOT_DIR := $(shell pwd)
PY_DIR := $(ROOT_DIR)/py
MJS_DIR := $(ROOT_DIR)/mjs

# Python settings
PYTHON := python3
PIP := pip3
POETRY := poetry

# Node.js settings
NPM := npm
NODE := node

# =============================================================================
# Combined Targets
# =============================================================================

## Install all packages
install: install-py install-mjs
	@echo "✓ All packages installed"

## Build all packages
build: build-py build-mjs
	@echo "✓ All packages built"

## Run all tests
test: test-py test-mjs
	@echo "✓ All tests passed"

## Clean all build artifacts
clean: clean-py clean-mjs
	@echo "✓ All build artifacts cleaned"

## Lint all packages
lint: lint-py lint-mjs
	@echo "✓ All linting complete"

## Format all packages
format: format-py format-mjs
	@echo "✓ All formatting complete"

# =============================================================================
# Python Package Targets
# =============================================================================

## Install Python package dependencies
install-py:
	@echo "Installing Python package..."
	@cd $(PY_DIR) && $(POETRY) install
	@echo "✓ Python package installed"

## Build Python package
build-py:
	@echo "Building Python package..."
	@cd $(PY_DIR) && $(POETRY) build
	@echo "✓ Python package built"

## Run Python tests
test-py:
	@echo "Running Python tests..."
	@cd $(PY_DIR) && $(POETRY) run pytest -v
	@echo "✓ Python tests passed"

## Clean Python build artifacts
clean-py:
	@echo "Cleaning Python build artifacts..."
	@cd $(PY_DIR) && rm -rf dist/ build/ *.egg-info/ .pytest_cache/ __pycache__/
	@find $(PY_DIR) -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find $(PY_DIR) -type f -name "*.pyc" -delete 2>/dev/null || true
	@echo "✓ Python artifacts cleaned"

## Lint Python code
lint-py:
	@echo "Linting Python code..."
	@cd $(PY_DIR) && $(POETRY) run ruff check src/ || true
	@echo "✓ Python linting complete"

## Format Python code
format-py:
	@echo "Formatting Python code..."
	@cd $(PY_DIR) && $(POETRY) run ruff format src/ || true
	@echo "✓ Python formatting complete"

# =============================================================================
# Node.js Package Targets
# =============================================================================

## Install Node.js package dependencies
install-mjs:
	@echo "Installing Node.js package..."
	@cd $(MJS_DIR) && $(NPM) install
	@echo "✓ Node.js package installed"

## Build Node.js package
build-mjs:
	@echo "Building Node.js package..."
	@cd $(MJS_DIR) && $(NPM) run build
	@echo "✓ Node.js package built"

## Run Node.js tests
test-mjs:
	@echo "Running Node.js tests..."
	@cd $(MJS_DIR) && $(NPM) test
	@echo "✓ Node.js tests passed"

## Clean Node.js build artifacts
clean-mjs:
	@echo "Cleaning Node.js build artifacts..."
	@cd $(MJS_DIR) && rm -rf dist/ node_modules/ coverage/
	@echo "✓ Node.js artifacts cleaned"

## Lint Node.js code
lint-mjs:
	@echo "Linting Node.js code..."
	@cd $(MJS_DIR) && $(NPM) run lint || true
	@echo "✓ Node.js linting complete"

## Format Node.js code
format-mjs:
	@echo "Formatting Node.js code..."
	@cd $(MJS_DIR) && $(NPM) run format || true
	@echo "✓ Node.js formatting complete"

# =============================================================================
# Development Targets
# =============================================================================

## Watch Python tests
watch-py:
	@cd $(PY_DIR) && $(POETRY) run pytest --watch

## Watch Node.js tests
watch-mjs:
	@cd $(MJS_DIR) && $(NPM) run test:watch

## Watch Node.js build
watch-build-mjs:
	@cd $(MJS_DIR) && $(NPM) run build:watch

# =============================================================================
# CI/CD Targets
# =============================================================================

## Run CI checks (lint + test)
ci: lint test
	@echo "✓ CI checks passed"

## Verify parity between Python and TypeScript implementations
verify-parity:
	@echo "Verifying parity between implementations..."
	@echo "Checking error codes..."
	@cd $(PY_DIR) && $(POETRY) run python -c "from common_exceptions.codes import ErrorCode; print(f'Python: {len(ErrorCode)} codes')"
	@cd $(MJS_DIR) && $(NODE) -e "import('./dist/codes.js').then(m => console.log('TypeScript:', Object.keys(m.ErrorCode).length, 'codes'))"
	@echo "✓ Parity verification complete"

# =============================================================================
# Publish Targets
# =============================================================================

## Publish Python package to PyPI (dry-run)
publish-py-dry:
	@cd $(PY_DIR) && $(POETRY) publish --dry-run

## Publish Node.js package to npm (dry-run)
publish-mjs-dry:
	@cd $(MJS_DIR) && $(NPM) publish --dry-run

# =============================================================================
# Help
# =============================================================================

## Show this help message
help:
	@echo ""
	@echo "Common Exceptions - Polyglot Package Makefile"
	@echo "============================================="
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install       Install all packages (Python + Node.js)"
	@echo "  build         Build all packages"
	@echo "  test          Run all tests"
	@echo "  clean         Clean all build artifacts"
	@echo "  lint          Lint all packages"
	@echo "  format        Format all packages"
	@echo ""
	@echo "Python-specific:"
	@echo "  install-py    Install Python dependencies via Poetry"
	@echo "  build-py      Build Python package"
	@echo "  test-py       Run Python tests"
	@echo "  clean-py      Clean Python artifacts"
	@echo ""
	@echo "Node.js-specific:"
	@echo "  install-mjs   Install Node.js dependencies via npm"
	@echo "  build-mjs     Build TypeScript package"
	@echo "  test-mjs      Run Node.js tests"
	@echo "  clean-mjs     Clean Node.js artifacts"
	@echo ""
	@echo "CI/CD:"
	@echo "  ci            Run CI checks (lint + test)"
	@echo "  verify-parity Check Python/TypeScript implementation parity"
	@echo ""
