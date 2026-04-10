# =============================================================================
# Gemini OpenAI SDK - Python Examples Makefile
# =============================================================================

.PHONY: install start dev help

# Install dependencies
install:
	cd .. && pip install -e ".[dev]"

# Run basic usage examples
start:
	python basic_usage.py

# Run FastAPI development server
dev:
	uvicorn fastapi_app:app --reload --port 8000

# Show help
help:
	@echo "Gemini OpenAI SDK - Python Examples"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install    Install package dependencies"
	@echo "  start      Run basic usage examples"
	@echo "  dev        Run FastAPI server in development mode"
	@echo "  help       Show this help message"
