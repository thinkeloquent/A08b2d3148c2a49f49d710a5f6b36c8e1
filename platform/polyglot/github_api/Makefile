# Development commands for polyglot/github_api

# Default ports
MJS_PORT ?= 53100
PY_PORT ?= 54100

# Get the directory where Makefile is located
MAKEFILE_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

# Use local .venv if it exists, otherwise use system Python
VENV_DIR := $(MAKEFILE_DIR)py/.venv
PYTHON := $(if $(wildcard $(VENV_DIR)/bin/python),$(VENV_DIR)/bin/python,python)

.PHONY: help install install-mjs install-py dev dev-mjs dev-py clean clean-ports \
	test test-mjs test-py test-unit test-unit-mjs test-unit-py \
	test-integration test-integration-mjs test-integration-py \
	test-coverage test-coverage-mjs test-coverage-py lint build

help:
	@echo "GitHub API - Polyglot Package Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make install       - Install all dependencies (pnpm + pip)"
	@echo "  make install-mjs   - Install Node.js dependencies"
	@echo "  make install-py    - Install Python dependencies"
	@echo ""
	@echo "Development:"
	@echo "  make dev           - Run both servers in parallel"
	@echo "  make dev-mjs       - Run Node.js server only (port $(MJS_PORT))"
	@echo "  make dev-py        - Run Python server only (port $(PY_PORT))"
	@echo "  make clean-ports   - Kill processes on dev ports ($(MJS_PORT), $(PY_PORT))"
	@echo ""
	@echo "Testing:"
	@echo "  make test                  - Run all tests (Python + Node.js)"
	@echo "  make test-mjs              - Run Node.js tests only"
	@echo "  make test-py               - Run Python tests only"
	@echo "  make test-unit             - Run unit tests only (both languages)"
	@echo "  make test-unit-mjs         - Run Node.js unit tests only"
	@echo "  make test-unit-py          - Run Python unit tests only"
	@echo "  make test-integration      - Run integration tests only (Fastify + FastAPI)"
	@echo "  make test-integration-mjs  - Run Fastify integration tests only"
	@echo "  make test-integration-py   - Run FastAPI integration tests only"
	@echo "  make test-coverage         - Run all tests with coverage"
	@echo "  make test-coverage-mjs     - Run Node.js tests with coverage"
	@echo "  make test-coverage-py      - Run Python tests with coverage"
	@echo ""
	@echo "Quality:"
	@echo "  make lint          - Run linters"
	@echo "  make build         - Build packages"
	@echo ""
	@echo "Clean:"
	@echo "  make clean         - Clean build artifacts"

# =============================================================================
# Installation
# =============================================================================

# Install all dependencies
install: install-mjs install-py

install-mjs:
	@echo "Installing Node.js dependencies..."
	cd $(MAKEFILE_DIR)mjs && pnpm install

install-py:
	@echo "Installing Python dependencies..."
	cd $(MAKEFILE_DIR)py && pip install -e ".[dev]"

# =============================================================================
# Development
# =============================================================================

# Clean development ports before starting
clean-ports:
	@echo "Cleaning ports $(MJS_PORT) and $(PY_PORT)..."
	@lsof -ti:$(MJS_PORT) | xargs kill -9 2>/dev/null || true
	@lsof -ti:$(PY_PORT) | xargs kill -9 2>/dev/null || true

# Development - run both servers in parallel
dev: clean-ports
	@echo "Starting development servers..."
	@echo "  Node.js (mjs):  http://localhost:$(MJS_PORT)"
	@echo "  Python (py):    http://localhost:$(PY_PORT)"
	@echo ""
	@$(MAKE) dev-mjs & $(MAKE) dev-py & wait

# Run Node.js server
dev-mjs:
	cd $(MAKEFILE_DIR)mjs && PORT=$(MJS_PORT) node src/main.mjs

# Run Python server
dev-py:
	cd $(MAKEFILE_DIR)py && PORT=$(PY_PORT) $(PYTHON) -m github_api.main

# =============================================================================
# Testing
# =============================================================================

# Run all tests
test: test-mjs test-py

# Run Node.js tests (all)
test-mjs:
	@echo "Running Node.js tests..."
	cd $(MAKEFILE_DIR)mjs && npx vitest run

# Run Python tests (all)
test-py:
	@echo "Running Python tests..."
	cd $(MAKEFILE_DIR)py && \
		$(PYTHON) -m pytest __tests__/ -v --tb=short

# --- Unit Tests ---

test-unit: test-unit-mjs test-unit-py

test-unit-mjs:
	@echo "Running Node.js unit tests..."
	cd $(MAKEFILE_DIR)mjs && npx vitest run __tests__/sdk/

test-unit-py:
	@echo "Running Python unit tests..."
	cd $(MAKEFILE_DIR)py && \
		$(PYTHON) -m pytest __tests__/sdk/ __tests__/middleware/ -v --tb=short

# --- Integration Tests (Fastify + FastAPI) ---

test-integration: test-integration-mjs test-integration-py

test-integration-mjs:
	@echo "Running Fastify integration tests..."
	cd $(MAKEFILE_DIR)mjs && npx vitest run __tests__/integration/

test-integration-py:
	@echo "Running FastAPI integration tests..."
	cd $(MAKEFILE_DIR)py && \
		$(PYTHON) -m pytest __tests__/integration/ -v --tb=short

# --- Coverage ---

test-coverage: test-coverage-mjs test-coverage-py

test-coverage-mjs:
	@echo "Running Node.js tests with coverage..."
	cd $(MAKEFILE_DIR)mjs && npx vitest run --coverage

test-coverage-py:
	@echo "Running Python tests with coverage..."
	cd $(MAKEFILE_DIR)py && \
		$(PYTHON) -m pytest __tests__/ -v --tb=short --cov=github_api --cov-report=term-missing

# =============================================================================
# Linting
# =============================================================================

lint:
	@echo "Linting Node.js..."
	cd $(MAKEFILE_DIR)mjs && pnpm tsc --noEmit || true
	@echo ""
	@echo "Linting Python..."
	cd $(MAKEFILE_DIR)py && $(PYTHON) -m ruff check . || true

# =============================================================================
# Build
# =============================================================================

build:
	@echo "Building Node.js package..."
	cd $(MAKEFILE_DIR)mjs && pnpm build
	@echo ""
	@echo "Build complete!"

# =============================================================================
# Clean
# =============================================================================

clean:
	@echo "Cleaning build artifacts..."
	find $(MAKEFILE_DIR) -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	find $(MAKEFILE_DIR) -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find $(MAKEFILE_DIR) -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find $(MAKEFILE_DIR) -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
	find $(MAKEFILE_DIR) -type d -name "build" -exec rm -rf {} + 2>/dev/null || true
	@echo "Clean complete!"
