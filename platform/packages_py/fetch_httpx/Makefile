# Makefile for fetch_httpx package
#
# Installation and development commands for the fetch_httpx HTTP client package.

.PHONY: help install install-dev install-all clean lint format test coverage build docs

# Default target
help:
	@echo "fetch_httpx - HTTP Client Package"
	@echo ""
	@echo "Usage:"
	@echo "  make install       Install the package"
	@echo "  make install-dev   Install with development dependencies"
	@echo "  make install-all   Install with all optional dependencies"
	@echo "  make clean         Remove build artifacts"
	@echo "  make lint          Run linters (ruff, mypy)"
	@echo "  make format        Format code (black, ruff)"
	@echo "  make test          Run tests"
	@echo "  make coverage      Run tests with coverage"
	@echo "  make build         Build distribution packages"
	@echo ""

# =============================================================================
# Installation Targets
# =============================================================================

# Install the package in editable mode
install:
	pip install -e .

# Install with development dependencies
install-dev:
	pip install -e ".[dev]"

# Install with test dependencies
install-test:
	pip install -e ".[test]"

# Install with all optional dependencies
install-all:
	pip install -e ".[all,dev,test]"

# Install only the runtime dependencies (non-editable)
install-prod:
	pip install .

# =============================================================================
# Code Quality
# =============================================================================

# Run linters
lint:
	@echo "Running ruff..."
	ruff check .
	@echo "Running mypy..."
	mypy . --ignore-missing-imports

# Format code
format:
	@echo "Running black..."
	black .
	@echo "Running ruff format..."
	ruff check --fix .

# Check formatting without making changes
format-check:
	black --check .
	ruff check .

# =============================================================================
# Testing
# =============================================================================

# Run tests
test:
	pytest -v

# Run tests with coverage
coverage:
	pytest --cov=. --cov-report=html --cov-report=term-missing

# Run tests with verbose output
test-verbose:
	pytest -vv --tb=long

# Run only unit tests (exclude integration)
test-unit:
	pytest -v -m "not integration"

# Run only integration tests
test-integration:
	pytest -v -m integration

# =============================================================================
# Build
# =============================================================================

# Build distribution packages
build:
	pip install build
	python -m build

# Build wheel only
build-wheel:
	pip install build
	python -m build --wheel

# Build source distribution only
build-sdist:
	pip install build
	python -m build --sdist

# =============================================================================
# Cleanup
# =============================================================================

# Remove build artifacts
clean:
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info/
	rm -rf .pytest_cache/
	rm -rf .mypy_cache/
	rm -rf .ruff_cache/
	rm -rf htmlcov/
	rm -rf .coverage
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete

# Deep clean (including virtual environments)
clean-all: clean
	rm -rf .venv/
	rm -rf venv/

# =============================================================================
# Development Utilities
# =============================================================================

# Create virtual environment
venv:
	python -m venv .venv
	@echo "Virtual environment created. Activate with:"
	@echo "  source .venv/bin/activate"

# Update dependencies
update-deps:
	pip install --upgrade pip
	pip install --upgrade -e ".[all,dev,test]"

# Show installed packages
show-deps:
	pip list

# Generate requirements.txt from pyproject.toml
requirements:
	pip-compile pyproject.toml -o requirements.txt

# =============================================================================
# Documentation
# =============================================================================

# Generate API documentation (requires pdoc)
docs:
	pip install pdoc
	pdoc . -o docs/

# Serve documentation locally
docs-serve:
	pip install pdoc
	pdoc . --port 8080

# =============================================================================
# Release Helpers
# =============================================================================

# Check package before release
pre-release: clean lint test coverage build
	@echo "Pre-release checks complete!"

# Upload to PyPI (requires twine)
upload:
	pip install twine
	twine upload dist/*

# Upload to TestPyPI
upload-test:
	pip install twine
	twine upload --repository testpypi dist/*
