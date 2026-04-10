.PHONY: install start dev clean

# Install dependencies
install:
	@echo "Installing dependencies..."
	cd .. && pip install -e ".[dev]"
	@echo "✓ Dependencies installed"

# Run basic usage example
start:
	@echo "Running basic usage examples..."
	python basic_usage.py

# Run FastAPI server in development mode
dev:
	@echo "Starting FastAPI server in development mode..."
	@echo "Visit: http://localhost:8000/dashboard"
	cd fastapi_app && uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Clean build artifacts
clean:
	@echo "Cleaning..."
	find .. -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find .. -type f -name "*.pyc" -delete 2>/dev/null || true
	rm -rf ../.pytest_cache ../.mypy_cache ../.ruff_cache
	@echo "✓ Clean complete"

# Help
help:
	@echo "Static App Loader - Python Examples"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install  Install dependencies"
	@echo "  start    Run basic usage examples"
	@echo "  dev      Run FastAPI server in dev mode"
	@echo "  clean    Clean build artifacts"
	@echo "  help     Show this help message"
