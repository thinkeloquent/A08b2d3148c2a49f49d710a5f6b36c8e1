# Makefile for Python examples

.PHONY: install start dev clean

# Install dependencies
install:
	@echo "Installing Python example dependencies..."
	pip install -e "..[dev,fastapi]"
	pip install moto[s3] uvicorn

# Run basic usage example
start:
	@echo "Running basic usage example..."
	python basic_usage.py

# Run FastAPI app in development mode
dev:
	@echo "Starting FastAPI development server..."
	uvicorn fastapi_app.main:app --reload --host 0.0.0.0 --port 8000

# Clean cached files
clean:
	@echo "Cleaning Python cache files..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
