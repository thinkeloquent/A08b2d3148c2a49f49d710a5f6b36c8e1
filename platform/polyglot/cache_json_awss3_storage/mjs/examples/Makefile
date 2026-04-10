# Makefile for TypeScript examples

.PHONY: install start dev clean

# Install dependencies
install:
	@echo "Installing TypeScript example dependencies..."
	cd .. && npm install
	npm install fastify-plugin

# Run basic usage example
start:
	@echo "Running basic usage example..."
	npx tsx basic-usage.ts

# Run Fastify app in development mode
dev:
	@echo "Starting Fastify development server..."
	npx tsx watch fastify-app/server.ts

# Clean build artifacts
clean:
	@echo "Cleaning TypeScript build artifacts..."
	rm -rf node_modules dist
