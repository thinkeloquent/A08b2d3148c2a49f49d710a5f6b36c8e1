.PHONY: build test lint format clean install

install:
	pip install -e ".[dev]"

build:
	@echo "Python package is source-only, no build needed"

test:
	python -m pytest __tests__/ -v --tb=short

lint:
	ruff check .

format:
	ruff format .

clean:
	rm -rf *.egg-info __pycache__ .pytest_cache
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
