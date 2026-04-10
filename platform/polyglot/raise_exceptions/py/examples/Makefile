# =============================================================================
# Common Exceptions Python Examples - Makefile
# =============================================================================
# Usage:
#   make install    - Install dependencies
#   make start      - Run basic usage example
#   make dev        - Run FastAPI app in development mode
# =============================================================================

.PHONY: install start dev clean test

# Variables
POETRY := poetry
PYTHON := python3
UVICORN := uvicorn

# =============================================================================
# Main Targets
# =============================================================================

## Install dependencies for examples
install:
	@echo "Installing example dependencies..."
	@cd .. && $(POETRY) install
	@echo "Dependencies installed"

## Run basic usage example
start:
	@echo "Running basic usage example..."
	@cd .. && $(POETRY) run python examples/basic_usage.py

## Run FastAPI app in development mode
dev:
	@echo "Starting FastAPI development server..."
	@cd .. && $(POETRY) run $(UVICORN) examples.fastapi_app.main:app --reload --port 8000

## Run all example tests
test:
	@echo "Running example tests..."
	@cd .. && $(POETRY) run pytest examples/ -v

## Clean generated files
clean:
	@echo "Cleaning up..."
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@echo "Cleanup complete"

# =============================================================================
# Help
# =============================================================================

help:
	@echo ""
	@echo "Common Exceptions Python Examples"
	@echo "================================="
	@echo ""
	@echo "Targets:"
	@echo "  install    Install dependencies"
	@echo "  start      Run basic usage example"
	@echo "  dev        Run FastAPI app (uvicorn --reload)"
	@echo "  test       Run example tests"
	@echo "  clean      Clean generated files"
	@echo ""
