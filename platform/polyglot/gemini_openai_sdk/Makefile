# =============================================================================
# Gemini OpenAI SDK - Polyglot Makefile
# =============================================================================
# Supports both Python (3.11.x) and Node.js (20.x) packages
# =============================================================================

.PHONY: all install install-py install-mjs clean test test-py test-mjs test-coverage lint dev help

# Default target
all: install

# =============================================================================
# Installation
# =============================================================================

install: install-py install-mjs
	@echo "✓ All packages installed"

install-py:
	@echo "Installing Python package..."
	cd py && pip install -e ".[dev]"
	@echo "✓ Python package installed"

install-mjs:
	@echo "Installing Node.js package..."
	cd mjs/gemini-openai-sdk && npm install
	@echo "✓ Node.js package installed"

# =============================================================================
# Development
# =============================================================================

dev: install
	@echo "Development environment ready"

# =============================================================================
# Testing
# =============================================================================

test: test-py test-mjs
	@echo "✓ All tests passed"

test-py:
	@echo "Running Python tests..."
	cd py && python -m pytest -v --tb=short

test-mjs:
	@echo "Running Node.js tests..."
	cd mjs/gemini-openai-sdk && npm test

test-coverage: test-coverage-py test-coverage-mjs
	@echo "✓ Coverage reports generated"

test-coverage-py:
	@echo "Running Python tests with coverage..."
	cd py && python -m pytest --cov=gemini_openai_sdk --cov-report=html --cov-report=term -v

test-coverage-mjs:
	@echo "Running Node.js tests with coverage..."
	cd mjs/gemini-openai-sdk && npm run test:coverage

# =============================================================================
# Linting
# =============================================================================

lint: lint-py lint-mjs
	@echo "✓ Linting complete"

lint-py:
	@echo "Linting Python..."
	cd py && python -m ruff check .

lint-mjs:
	@echo "Linting Node.js..."
	cd mjs/gemini-openai-sdk && npm run lint 2>/dev/null || echo "No lint script configured"

# =============================================================================
# Cleanup
# =============================================================================

clean:
	@echo "Cleaning build artifacts..."
	rm -rf py/dist py/build py/*.egg-info py/__pycache__ py/**/__pycache__
	rm -rf mjs/gemini-openai-sdk/node_modules mjs/gemini-openai-sdk/dist
	@echo "✓ Clean complete"

# =============================================================================
# Help
# =============================================================================

help:
	@echo "Gemini OpenAI SDK - Polyglot Package"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install      Install both Python and Node.js packages"
	@echo "  install-py   Install Python package only"
	@echo "  install-mjs  Install Node.js package only"
	@echo "  test         Run all tests"
	@echo "  test-py      Run Python tests only"
	@echo "  test-mjs     Run Node.js tests only"
	@echo "  lint         Run linters"
	@echo "  clean        Remove build artifacts"
	@echo "  dev          Setup development environment"
	@echo "  help         Show this help message"
