.PHONY: install test clean test-fastify test-fastapi test-all build

install:
	cd mjs && pnpm install
	cd py && pip install -e .

build:
	cd mjs && pnpm build

test-fastify:
	cd mjs && pnpm test

test-fastapi:
	cd py && python -m pytest -v

test-all: test-fastify test-fastapi

test: test-all

test-coverage:
	cd mjs && pnpm test:coverage
	cd py && python -m pytest --cov=proxy_url_builder --cov-report=html --cov-report=term-missing

clean:
	cd mjs && rm -rf node_modules dist coverage
	cd py && rm -rf .venv .pytest_cache __pycache__ dist htmlcov .coverage *.egg-info
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
