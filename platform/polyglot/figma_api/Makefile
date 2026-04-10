# =============================================================================
# Figma API SDK - Polyglot Makefile
# =============================================================================
# Supports both Python (3.11.x) and Node.js (20.x) packages
# Using Fastify ^4.0.0 (Node.js) and FastAPI 0.115.0 (Python)
# =============================================================================

.PHONY: all install install-py install-mjs clean test test-py test-mjs \
        test-coverage test-coverage-py test-coverage-mjs lint lint-py lint-mjs \
        dev dev-mjs dev-py clean-ports help

# Default ports
MJS_PORT ?= 53108
PY_PORT ?= 54108

# Default target
all: install

# =============================================================================
# Installation
# =============================================================================

install: install-py install-mjs
	@echo "All packages installed"

install-py:
	@echo "Installing Python package..."
	cd py && pip install -e ".[dev]"
	@echo "Python package installed"

install-mjs:
	@echo "Installing Node.js package..."
	cd mjs && pnpm install
	@echo "Node.js package installed"

# =============================================================================
# Development
# =============================================================================

dev: dev-mjs dev-py

dev-mjs:
	@echo "Starting Fastify dev server on port $(MJS_PORT)..."
	cd mjs && PORT=$(MJS_PORT) node --watch src/main.mjs

dev-py:
	@echo "Starting FastAPI dev server on port $(PY_PORT)..."
	cd py && PORT=$(PY_PORT) uvicorn figma_api.main:app --reload --port $(PY_PORT) --host 0.0.0.0

clean-ports:
	@echo "Cleaning ports $(MJS_PORT) and $(PY_PORT)..."
	-lsof -ti :$(MJS_PORT) | xargs kill -9 2>/dev/null || true
	-lsof -ti :$(PY_PORT) | xargs kill -9 2>/dev/null || true
	@echo "Ports cleaned"

# =============================================================================
# Testing
# =============================================================================

test: test-mjs test-py
	@echo "All tests passed"

test-mjs:
	@echo "Running Node.js tests..."
	cd mjs && pnpm test

test-py:
	@echo "Running Python tests..."
	cd py && python -m pytest -v --tb=short

test-coverage: test-coverage-mjs test-coverage-py
	@echo "Coverage reports generated"

test-coverage-mjs:
	@echo "Running Node.js tests with coverage..."
	cd mjs && pnpm test:coverage

test-coverage-py:
	@echo "Running Python tests with coverage..."
	cd py && python -m pytest --cov=figma_api --cov-report=html --cov-report=term -v

# =============================================================================
# Linting
# =============================================================================

lint: lint-mjs lint-py
	@echo "Linting complete"

lint-mjs:
	@echo "Linting Node.js..."
	cd mjs && pnpm lint

lint-py:
	@echo "Linting Python..."
	cd py && python -m ruff check .

# =============================================================================
# Cleanup
# =============================================================================

clean:
	@echo "Cleaning build artifacts..."
	rm -rf py/dist py/build py/*.egg-info py/__pycache__ py/**/__pycache__
	rm -rf mjs/node_modules mjs/dist
	@echo "Clean complete"

# =============================================================================
# Help
# =============================================================================

help:
	@echo "Figma API SDK - Polyglot Package"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install          Install both Python and Node.js packages"
	@echo "  install-py       Install Python package only"
	@echo "  install-mjs      Install Node.js package only"
	@echo "  dev              Start both dev servers"
	@echo "  dev-mjs          Start Fastify dev server (port $(MJS_PORT))"
	@echo "  dev-py           Start FastAPI dev server (port $(PY_PORT))"
	@echo "  test             Run all tests"
	@echo "  test-mjs         Run Node.js tests only"
	@echo "  test-py          Run Python tests only"
	@echo "  test-coverage    Run tests with coverage"
	@echo "  lint             Run linters"
	@echo "  clean            Remove build artifacts"
	@echo "  clean-ports      Kill processes on dev ports"
	@echo "  help             Show this help message"
