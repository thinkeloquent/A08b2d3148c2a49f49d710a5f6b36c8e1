.PHONY: install start dev clean

# Install dependencies
install:
	@echo "Installing dependencies..."
	cd .. && npm install
	@echo "✓ Dependencies installed"

# Run basic usage example
start:
	@echo "Running basic usage examples..."
	npx tsx basic-usage.ts

# Run Fastify server in development mode
dev:
	@echo "Starting Fastify server in development mode..."
	@echo "Visit: http://localhost:3000/dashboard"
	npx tsx watch fastify-app/server.ts

# Clean build artifacts
clean:
	@echo "Cleaning..."
	rm -rf ../dist
	@echo "✓ Clean complete"

# Help
help:
	@echo "Static App Loader - Node.js Examples"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install  Install dependencies"
	@echo "  start    Run basic usage examples"
	@echo "  dev      Run Fastify server in dev mode"
	@echo "  clean    Clean build artifacts"
	@echo "  help     Show this help message"
