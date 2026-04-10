.PHONY: install start dev

install:
	@echo "Installing example dependencies..."
	cd fastify-app && npm install

start:
	@echo "Running basic usage example..."
	@echo "Note: Set GITHUB_TOKEN environment variable first"
	node basic-usage.mjs

dev:
	@echo "Starting Fastify example server..."
	@echo "Note: Set GITHUB_TOKEN environment variable first"
	cd fastify-app && node server.mjs
