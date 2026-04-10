# Development commands for polyglot/langgraph-flow-serializer

# Get the directory where Makefile is located
MAKEFILE_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

# Use local .venv if it exists, otherwise use system Python
VENV_DIR := $(MAKEFILE_DIR)py/.venv
PYTHON := $(if $(wildcard $(VENV_DIR)/bin/python),$(VENV_DIR)/bin/python,python)

.PHONY: help install install-mjs install-py test test-mjs test-py \
	test-coverage test-coverage-mjs test-coverage-py lint build clean

help:
	@echo "LangGraph Flow Serializer - Polyglot Package Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make install       - Install all dependencies (pnpm + pip)"
	@echo "  make install-mjs   - Install Node.js dependencies"
	@echo "  make install-py    - Install Python dependencies"
	@echo ""
	@echo "Testing:"
	@echo "  make test              - Run all tests (Python + Node.js)"
	@echo "  make test-mjs          - Run Node.js tests only"
	@echo "  make test-py           - Run Python tests only"
	@echo "  make test-coverage     - Run all tests with coverage"
	@echo "  make test-coverage-mjs - Run Node.js tests with coverage"
	@echo "  make test-coverage-py  - Run Python tests with coverage"
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

install: install-mjs install-py

install-mjs:
	@echo "Installing Node.js dependencies..."
	cd $(MAKEFILE_DIR)mjs && pnpm install

install-py:
	@echo "Installing Python dependencies..."
	cd $(MAKEFILE_DIR)py && pip install -e ".[dev]"

# =============================================================================
# Testing
# =============================================================================

test: test-mjs test-py

test-mjs:
	@echo "Running Node.js tests..."
	cd $(MAKEFILE_DIR)mjs && npx vitest run

test-py:
	@echo "Running Python tests..."
	cd $(MAKEFILE_DIR)py && \
		$(PYTHON) -m pytest __tests__/ -v --tb=short

test-coverage: test-coverage-mjs test-coverage-py

test-coverage-mjs:
	@echo "Running Node.js tests with coverage..."
	cd $(MAKEFILE_DIR)mjs && npx vitest run --coverage

test-coverage-py:
	@echo "Running Python tests with coverage..."
	cd $(MAKEFILE_DIR)py && \
		$(PYTHON) -m pytest __tests__/ -v --tb=short \
		--cov=langgraph_flow_serializer --cov-report=term-missing

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
	find $(MAKEFILE_DIR) -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	@echo "Clean complete!"
