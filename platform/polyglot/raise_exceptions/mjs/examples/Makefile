# =============================================================================
# Common Exceptions TypeScript Examples - Makefile
# =============================================================================
# Usage:
#   make install    - Install dependencies
#   make start      - Run basic usage example
#   make dev        - Run Fastify app in development mode
# =============================================================================

.PHONY: install start dev clean test build

# Variables
NPM := npm
TSX := npx tsx

# =============================================================================
# Main Targets
# =============================================================================

## Install dependencies for examples
install:
	@echo "Installing example dependencies..."
	@cd .. && $(NPM) install
	@echo "Dependencies installed"

## Build the package first (required for examples)
build:
	@echo "Building package..."
	@cd .. && $(NPM) run build

## Run basic usage example
start: build
	@echo "Running basic usage example..."
	@$(TSX) basic-usage.ts

## Run Fastify app in development mode
dev: build
	@echo "Starting Fastify development server..."
	@$(TSX) watch fastify-app/server.ts

## Run all example tests
test:
	@echo "Running example tests..."
	@cd .. && $(NPM) test

## Clean generated files
clean:
	@echo "Cleaning up..."
	@rm -rf node_modules/ dist/
	@echo "Cleanup complete"

# =============================================================================
# Help
# =============================================================================

help:
	@echo ""
	@echo "Common Exceptions TypeScript Examples"
	@echo "====================================="
	@echo ""
	@echo "Targets:"
	@echo "  install    Install dependencies"
	@echo "  build      Build the package"
	@echo "  start      Run basic usage example"
	@echo "  dev        Run Fastify app (tsx watch)"
	@echo "  test       Run example tests"
	@echo "  clean      Clean generated files"
	@echo ""
