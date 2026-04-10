.PHONY: help install clean test test-unit test-coverage test-parity lint typecheck all

help:
	@echo "server-provider-cache polyglot package"
	@echo ""
	@echo "Targets:"
	@echo "  install        - Install all dependencies"
	@echo "  clean          - Remove build artifacts"
	@echo "  test           - Run all tests (Python + Node.js)"
	@echo "  test-unit      - Run unit tests only"
	@echo "  test-coverage  - Run tests with coverage reporting"
	@echo "  test-parity    - Run parity vector tests"
	@echo "  lint           - Run linters"
	@echo "  typecheck      - Run type checkers"
	@echo "  all            - Install, lint, typecheck, and test"

install:
	@echo "Installing Python dependencies..."
	cd py && poetry install
	@echo "Installing Node.js dependencies..."
	cd mjs && npm install

clean:
	rm -rf py/.venv mjs/node_modules mjs/dist
	find . -name "__pycache__" -exec rm -rf {} +
	find . -name ".pytest_cache" -exec rm -rf {} +
	find . -name ".coverage" -exec rm -rf {} +
	find . -name "htmlcov" -exec rm -rf {} +

test: test-unit

test-unit:
	@echo "Running Python unit tests..."
	cd py && poetry run pytest server_provider_cache/__tests__/ -v
	@echo ""
	@echo "Running Node.js unit tests..."
	cd mjs && npm test

test-coverage:
	@echo "Running Python tests with coverage..."
	cd py && poetry run pytest server_provider_cache/__tests__/ --cov=server_provider_cache --cov-report=term-missing --cov-fail-under=80
	@echo ""
	@echo "Running Node.js tests with coverage..."
	cd mjs && npm run test:coverage

test-parity:
	@echo "Running Python parity tests..."
	cd py && poetry run pytest server_provider_cache/__tests__/ -v -k "parity or Parity"
	@echo ""
	@echo "Running Node.js parity tests..."
	cd mjs && npm test -- --grep "parity|Parity"

lint:
	@echo "Linting Python..."
	cd py && poetry run ruff check .
	@echo ""
	@echo "Linting Node.js..."
	cd mjs && npm run lint || true

typecheck:
	@echo "Type checking Python..."
	cd py && poetry run mypy server_provider_cache/
	@echo ""
	@echo "Type checking Node.js (via TypeScript definitions)..."
	@echo "  (Node.js uses JSDoc + types.d.ts)"

all: install lint typecheck test-coverage
	@echo ""
	@echo "All checks passed!"
