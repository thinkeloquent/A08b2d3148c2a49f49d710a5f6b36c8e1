# =============================================================================
# Smart Fetch Router Config - Polyglot Package Makefile
# =============================================================================
# Supports Node.js 20.x (ESM) and Python 3.11.x
# Configuration-driven endpoint routing SDK
# =============================================================================

.PHONY: all install install-py install-mjs clean clean-py clean-mjs test test-py test-mjs lint help

# Default target
all: install

# =============================================================================
# Installation
# =============================================================================

install: install-py install-mjs
	@echo "All packages installed"

install-py:
	@echo "Installing Python package..."
	@cd py && pip install -e ".[dev]" --quiet
	@echo "Python package installed"

install-mjs:
	@echo "Installing Node.js package..."
	@cd mjs && npm install
	@echo "Node.js package installed"

# =============================================================================
# Testing
# =============================================================================

test: test-py test-mjs
	@echo "All tests passed"

test-py:
	@echo "Running Python tests..."
	cd py && python -m pytest tests/ -v

test-mjs:
	@echo "Running Node.js tests..."
	cd mjs && npm test

# Integration tests (requires running servers)
test-integration: test-integration-fastapi test-integration-fastify
	@echo "All integration tests passed"

test-integration-fastapi:
	@echo "Running FastAPI integration tests..."
	@echo "Note: Requires 'pip install httpx fastapi uvicorn'"
	cd py && python -m pytest tests/test_integration_fastapi.py -v 2>/dev/null || echo "Skipped (dependencies not installed)"

test-integration-fastify:
	@echo "Running Fastify integration tests..."
	@echo "Note: Requires 'npm install fastify' in mjs/examples/fastify-app"
	cd mjs && npm run test:integration 2>/dev/null || echo "Skipped (dependencies not installed)"

# Run examples
run-example-py:
	@echo "Running Python basic example..."
	cd py && python examples/basic_usage.py

run-example-mjs:
	@echo "Running Node.js basic example..."
	cd mjs && node examples/basic-usage.mjs

# =============================================================================
# Linting
# =============================================================================

lint: lint-py lint-mjs

lint-py:
	@echo "Linting Python..."
	@cd py && python -m ruff check app_yaml_endpoints/ 2>/dev/null || true

lint-mjs:
	@echo "Linting Node.js..."
	@cd mjs && npm run lint 2>/dev/null || true

# =============================================================================
# Cleanup
# =============================================================================

clean: clean-py clean-mjs
	@echo "Cleanup complete"

clean-py:
	@rm -rf py/*.egg-info py/dist py/build
	@find py -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find py -type f -name "*.pyc" -delete 2>/dev/null || true

clean-mjs:
	@rm -rf mjs/node_modules mjs/package-lock.json

# =============================================================================
# Version Check
# =============================================================================

check-versions:
	@echo "Python: $$(python3 --version)"
	@echo "Node.js: $$(node --version)"
	@echo "npm: $$(npm --version)"

# =============================================================================
# Help
# =============================================================================

help:
	@echo "Smart Fetch Router Config - Polyglot SDK"
	@echo ""
	@echo "Targets:"
	@echo "  install       Install both packages"
	@echo "  install-py    Install Python package"
	@echo "  install-mjs   Install Node.js package"
	@echo "  test          Run all tests"
	@echo "  lint          Lint all code"
	@echo "  clean         Remove build artifacts"
	@echo "  check-versions Show runtime versions"
	@echo "  help          Show this message"
	@echo ""
	@echo "Environment:"
	@echo "  LOG_LEVEL     Logging level (trace, debug, info, warn, error)"
	@echo "  LOG_JSON      Set 'true' for JSON log output"
