# Computed URL Builder - Polyglot Makefile
# Supports Python (FastAPI) and Node.js (Fastify) implementations

.PHONY: all install install-py install-mjs test test-py test-mjs build clean help

# Default target
all: install test

# ============================================================================
# INSTALL TARGETS
# ============================================================================

install: install-py install-mjs
	@echo "All dependencies installed successfully"

install-py:
	@echo "Installing Python dependencies..."
	cd py && (test -d .venv || python3 -m venv .venv) && \
		. .venv/bin/activate && \
		pip install -e ".[dev]" --quiet
	@echo "Python dependencies installed"

install-mjs:
	@echo "Installing Node.js dependencies..."
	cd mjs && npm install --silent
	@echo "Node.js dependencies installed"

# ============================================================================
# TEST TARGETS
# ============================================================================

test: test-py test-mjs
	@echo "All tests passed successfully"

test-py:
	@echo "Running Python tests..."
	cd py && . .venv/bin/activate && python -m pytest __tests__/ -v --tb=short
	@echo "Python tests completed"

test-mjs:
	@echo "Running Node.js tests..."
	cd mjs && npm test
	@echo "Node.js tests completed"

# ============================================================================
# BUILD TARGETS
# ============================================================================

build: build-py build-mjs
	@echo "All packages built successfully"

build-py:
	@echo "Building Python package..."
	cd py && . .venv/bin/activate && python -m build
	@echo "Python package built"

build-mjs:
	@echo "Building Node.js package..."
	cd mjs && npm pack
	@echo "Node.js package built"

# ============================================================================
# CLEAN TARGETS
# ============================================================================

clean: clean-py clean-mjs
	@echo "All build artifacts cleaned"

clean-py:
	@echo "Cleaning Python artifacts..."
	cd py && rm -rf dist/ build/ *.egg-info/ __pycache__/ .pytest_cache/ .venv/
	find py -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find py -type f -name "*.pyc" -delete 2>/dev/null || true
	@echo "Python artifacts cleaned"

clean-mjs:
	@echo "Cleaning Node.js artifacts..."
	cd mjs && rm -rf node_modules/ dist/ *.tgz coverage/
	@echo "Node.js artifacts cleaned"

# ============================================================================
# DEVELOPMENT TARGETS
# ============================================================================

lint: lint-py lint-mjs
	@echo "Linting completed"

lint-py:
	@echo "Linting Python code..."
	cd py && . .venv/bin/activate && python -m ruff check computed_url_builder/ __tests__/ || true

lint-mjs:
	@echo "Linting Node.js code..."
	cd mjs && npm run lint 2>/dev/null || true

format: format-py format-mjs
	@echo "Formatting completed"

format-py:
	@echo "Formatting Python code..."
	cd py && . .venv/bin/activate && python -m ruff format computed_url_builder/ __tests__/ || true

format-mjs:
	@echo "Formatting Node.js code..."
	cd mjs && npm run format 2>/dev/null || true

# ============================================================================
# HELP
# ============================================================================

help:
	@echo "Computed URL Builder - Polyglot Makefile"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install      Install all dependencies (py + mjs)"
	@echo "  install-py   Install Python dependencies"
	@echo "  install-mjs  Install Node.js dependencies"
	@echo "  test         Run all tests"
	@echo "  test-py      Run Python tests (pytest)"
	@echo "  test-mjs     Run Node.js tests (jest)"
	@echo "  build        Build all packages"
	@echo "  build-py     Build Python package"
	@echo "  build-mjs    Build Node.js package"
	@echo "  clean        Clean all build artifacts"
	@echo "  clean-py     Clean Python artifacts"
	@echo "  clean-mjs    Clean Node.js artifacts"
	@echo "  lint         Lint all code"
	@echo "  format       Format all code"
	@echo "  help         Show this help message"
