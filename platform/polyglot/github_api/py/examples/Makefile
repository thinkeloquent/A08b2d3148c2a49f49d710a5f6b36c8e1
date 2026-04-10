.PHONY: install start dev

install:
	@echo "Installing example dependencies..."
	cd fastapi_app && pip install -r requirements.txt

start:
	@echo "Running basic usage example..."
	@echo "Note: Set GITHUB_TOKEN environment variable first"
	python basic_usage.py

dev:
	@echo "Starting FastAPI example server..."
	@echo "Note: Set GITHUB_TOKEN environment variable first"
	cd fastapi_app && uvicorn main:app --reload --port 3100
