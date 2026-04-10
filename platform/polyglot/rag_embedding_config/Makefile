# =============================================================================
# rag_embedding_config - Polyglot RAG Embedding Config
# =============================================================================
# Makefile for managing Node.js (ESM) and Python implementations
#
# Available targets:
#   make install    - Install all dependencies
#   make test       - Run all tests
#   make test-mjs   - Run MJS tests only
#   make test-py    - Run Python tests only
#   make lint       - Run linters
#   make clean      - Clean build artifacts
# =============================================================================

.PHONY: install install-all install-mjs install-py test test-all test-mjs test-py lint clean help

# Default target
help:
	@echo "rag_embedding_config - Polyglot RAG Embedding Config"
	@echo ""
	@echo "Usage:"
	@echo "  make install    Install all dependencies"
	@echo "  make test       Run all tests"
	@echo "  make test-mjs   Run MJS tests only"
	@echo "  make test-py    Run Python tests only"
	@echo "  make lint       Run linters"
	@echo "  make clean      Clean build artifacts"

# =============================================================================
# Installation
# =============================================================================
install: install-all
install-all: install-mjs install-py

install-mjs:
	@echo "Installing MJS dependencies..."
	cd mjs && pnpm install

install-py:
	@echo "Installing Python dependencies..."
	cd py && pip install -e ".[dev]"

# =============================================================================
# Testing
# =============================================================================
test: test-all
test-all: test-mjs test-py
	@echo ""
	@echo "All tests passed!"

test-mjs:
	@echo "Running MJS tests..."
	cd mjs && npx vitest run

test-py:
	@echo "Running Python tests..."
	cd py && pytest __tests__/ -v

# =============================================================================
# Linting
# =============================================================================
lint:
	@echo "Linting MJS..."
	cd mjs && npx biome check . || true
	@echo ""
	@echo "Linting Python..."
	cd py && ruff check . || true

# =============================================================================
# Clean
# =============================================================================
clean:
	@echo "Cleaning MJS artifacts..."
	cd mjs && rm -rf node_modules dist coverage .turbo
	@echo ""
	@echo "Cleaning Python artifacts..."
	cd py && rm -rf .venv .pytest_cache dist .coverage htmlcov
	find py -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find py -type f -name "*.pyc" -delete 2>/dev/null || true
	@echo ""
	@echo "Clean complete!"
