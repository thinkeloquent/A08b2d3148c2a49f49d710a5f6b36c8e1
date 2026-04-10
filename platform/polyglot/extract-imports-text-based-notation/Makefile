# =============================================================================
# extract-imports-text-based-notation - Polyglot Import/Export Extraction SDK
# =============================================================================

.PHONY: all install build test lint format clean help \
        install-mjs install-py install-go install-rs install-java \
        build-mjs build-py build-go build-rs build-java \
        test-all test-mjs test-py test-go test-rs test-java \
        lint-all lint-mjs lint-py lint-go lint-rs lint-java

LANGUAGES := mjs py go rs java

# Default target
all: install build

# =============================================================================
# Installation
# =============================================================================

install: install-mjs install-py install-go install-rs install-java
	@echo "All packages installed"

install-mjs:
	@echo "Installing MJS dependencies..."
	cd mjs && pnpm install

install-py:
	@echo "Installing Python dependencies..."
	cd py && pip install -e ".[dev]"

install-go:
	@echo "Installing Go dependencies..."
	cd go && go mod download

install-rs:
	@echo "Installing Rust dependencies..."
	cd rs && cargo fetch

install-java:
	@echo "Installing Java dependencies..."
	cd java && mvn dependency:resolve -q

# =============================================================================
# Build
# =============================================================================

build: build-mjs build-py build-go build-rs build-java
	@echo "All packages built"

build-mjs:
	cd mjs && pnpm run build

build-py:
	@echo "Python package is source-only, no build needed"

build-go:
	cd go && go build ./...

build-rs:
	cd rs && cargo build

build-java:
	cd java && mvn compile -q

# =============================================================================
# Testing
# =============================================================================

test: test-all

test-all: test-mjs test-py test-go test-rs test-java
	@echo ""
	@echo "=============================================="
	@echo "All language tests passed"
	@echo "=============================================="

test-mjs:
	@echo ""
	@echo "=============================================="
	@echo "Running Node.js tests (Vitest)"
	@echo "=============================================="
	cd mjs && pnpm test

test-py:
	@echo ""
	@echo "=============================================="
	@echo "Running Python tests (pytest)"
	@echo "=============================================="
	cd py && python -m pytest __tests__/ -v --tb=short

test-go:
	@echo ""
	@echo "=============================================="
	@echo "Running Go tests"
	@echo "=============================================="
	cd go && go test ./... -v

test-rs:
	@echo ""
	@echo "=============================================="
	@echo "Running Rust tests"
	@echo "=============================================="
	cd rs && cargo test

test-java:
	@echo ""
	@echo "=============================================="
	@echo "Running Java tests (JUnit 5)"
	@echo "=============================================="
	cd java && mvn test -q

# =============================================================================
# Linting
# =============================================================================

lint: lint-all

lint-all: lint-mjs lint-py lint-go lint-rs lint-java
	@echo "All linters passed"

lint-mjs:
	cd mjs && pnpm run lint

lint-py:
	cd py && ruff check .

lint-go:
	cd go && golangci-lint run ./...

lint-rs:
	cd rs && cargo clippy -- -D warnings

lint-java:
	cd java && mvn checkstyle:check -q

# =============================================================================
# Formatting
# =============================================================================

format:
	cd mjs && pnpm run format
	cd py && ruff format .
	cd go && gofmt -w .
	cd rs && cargo fmt
	cd java && mvn fmt:format -q 2>/dev/null || true

# =============================================================================
# Clean
# =============================================================================

clean:
	rm -rf mjs/node_modules mjs/dist
	rm -rf py/*.egg-info py/__pycache__ py/extract_imports_text_based_notation/__pycache__
	rm -rf py/.pytest_cache py/__tests__/__pycache__
	cd go && go clean
	cd rs && cargo clean
	cd java && mvn clean -q
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

# =============================================================================
# Help
# =============================================================================

help:
	@echo "extract-imports-text-based-notation - Polyglot Makefile"
	@echo ""
	@echo "Installation:"
	@echo "  install          Install all language dependencies"
	@echo "  install-<lang>   Install deps for specific language (mjs|py|go|rs|java)"
	@echo ""
	@echo "Build:"
	@echo "  build            Build all packages"
	@echo "  build-<lang>     Build specific language"
	@echo ""
	@echo "Testing:"
	@echo "  test / test-all  Run all language test suites"
	@echo "  test-<lang>      Run tests for specific language"
	@echo ""
	@echo "Quality:"
	@echo "  lint / lint-all  Run all linters"
	@echo "  format           Auto-format all code"
	@echo ""
	@echo "Utilities:"
	@echo "  clean            Remove build artifacts"
	@echo "  help             Show this help"
