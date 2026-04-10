# Development commands for the monorepo

# Default ports
FASTIFY_PORT ?= 51000
FASTAPI_PORT ?= 52000

# Watch throttle delay in seconds (debounce rapid file changes)
WATCH_THROTTLE ?= 2

# Build parameters (set by CI/CD or manually)
BUILD_ID ?= local
BUILD_VERSION ?= 0.0.0-dev
GIT_COMMIT ?= $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
SHARED_ID ?= placeholder-shared-id
GLOBAL_ID ?= placeholder-global-id

# Get the directory where Makefile is located (project root)
MAKEFILE_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
FASTIFY_IGNORE := $(shell tr '\n' ' ' < .fastifyignore)

# ============================================================================
# PYTHONPATH Configuration
# ============================================================================
# Build PYTHONPATH with packages_py/*/src
PYTHON_PATHS := $(shell for pkg in $(MAKEFILE_DIR)packages_py/*/src; do [ -d "$$pkg" ] && printf "%s:" "$$pkg"; done)
# Remove trailing colon and export
PYTHON_PATHS := $(PYTHON_PATHS:%:=%)
export PYTHONPATH := $(PYTHON_PATHS):$(PYTHONPATH)

# Use local .venv if it exists, otherwise use system Python
VENV_DIR := $(MAKEFILE_DIR).venv
PYTHON := $(if $(wildcard $(VENV_DIR)/bin/python),$(VENV_DIR)/bin/python,poetry run python)
UVICORN := $(if $(wildcard $(VENV_DIR)/bin/uvicorn),$(VENV_DIR)/bin/uvicorn,uvicorn)

.PHONY: help setup install dev dev-fastify dev-fastapi build build-watch test lint format clean clean-ports docker-up docker-down \
	test-vault-file test-vault-file-py test-vault-file-mjs test-vault-file-fastapi test-vault-file-fastify \
	cli_db_manager polynx cli_chromadb_rag_ingest

help:
	@echo "MTA Development Commands"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; section = ""} \
		/^##@/ { section = substr($$0, 5); next } \
		/^[a-zA-Z_-]+:.*## / { \
			if (section != prev) { printf "\n\033[1m%s:\033[0m\n", section; prev = section } \
			printf "  \033[36m%-25s\033[0m %s\n", $$1, $$2 \
		}' $(MAKEFILE_LIST)

##@ Setup

init: ## Reset nx cache and clean all node_modules
	@if [ -d "node_modules" ]; then npx nx reset; else echo "Skipping nx reset (node_modules not found)"; fi
	@echo "Cleaning stale node_modules..."
	@rm -rf node_modules/ 2>/dev/null || true
	find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true

setup-clean: init setup ## Run init to reset nx cache and clean node_modules, then run setup
	@echo "Running setup scripts..."
	@bash .bin/git-hook-setup.sh || true

	@echo "Configuring Poetry to use in-project virtualenv..."
	poetry config virtualenvs.in-project true

	@echo "Running clean..."
	pnpm clean || true

setup: ## Run setup scripts, then install dependencies
	@echo "Configuring Poetry to use in-project virtualenv..."
	poetry config virtualenvs.in-project true

	@echo "Installing poetry dependencies..."
	rm -rf ./logs && mkdir ./logs

	@$(MAKE) install
	npm run build:log
	@echo "Setup complete!"

install: ## Install all dependencies (pnpm + poetry in parallel)
	@$(MAKE) -j2 install-pnpm install-py

install-pnpm:
	bash .bin/ts-apply-noImplicitAny.sh || true
	python .bin/packagejson-sync-polyglot-mjs.py
	pnpm install --reporter=default

install-py:
	poetry config virtualenvs.in-project true
	python .bin/pyproject-lint-no-readme.py --fix || true
	python .bin/fix_pytest_test_namespaces.py || true
	python .bin/pyproject-install-fix-versions.py
	python .bin/pyproject-sync-pkg-repo.py
	poetry lock
	poetry install --no-root -vv || true

##@ Development

clean-ports: ## Kill processes on dev ports (51000, 52000)
	@bash .bin/clean-ports.sh

dev_test_build: clean-ports test build
	@echo "Starting development servers..."
	@echo "  Fastify:  http://localhost:$(FASTIFY_PORT)"
	@echo "  FastAPI:  http://localhost:$(FASTAPI_PORT)"
	@echo ""
	@$(MAKE) -j2 dev-fastify dev-fastapi

dev-setup: clean-ports install-pnpm install-py build ## Run all backends in parallel (cleans ports first)

dev: clean-ports install-pnpm build ## Run all backends in parallel (cleans ports first)
	@rm -rf ./logs
	@mkdir -p logs
	@echo "Starting development servers..."
	@echo "  Fastify:  http://localhost:$(FASTIFY_PORT)"
	@echo "  FastAPI:  http://localhost:$(FASTAPI_PORT)"
	@echo "  Logs:     ./logs/fastify.log, ./logs/fastapi.log"
	@echo ""
	@$(MAKE) dev-fastify & $(MAKE) dev-fastapi & wait

healthz: ## Run health check after server startup
	sleep 5; \
	.bin/healthz-check.sh || true; \
	wait

dev-no-cache: clean clean-ports ## Clean then start dev servers
	@echo "Starting development servers..."
	@echo "  Fastify:  http://localhost:$(FASTIFY_PORT)"
	@echo "  FastAPI:  http://localhost:$(FASTAPI_PORT)"
	@echo ""
	@$(MAKE) -j2 dev-fastify dev-fastapi

dev-fastify: ## Run Fastify server only (port 51000)
	@mkdir -p logs
	cd $(MAKEFILE_DIR) && \
	NODE_ENV=development \
	PORT=$(FASTIFY_PORT) \
	LOG_LEVEL=debug \
	VAULT_SECRET_FILE=$(MAKEFILE_DIR).env \
	BUILD_ID=$(BUILD_ID) \
	BUILD_VERSION=$(BUILD_VERSION) \
	GIT_COMMIT=$(GIT_COMMIT) \
	./fastify_server/node_modules/.bin/fastify start ./fastify_server/src/app.mjs \
		--watch \
		--verbose-watch \
		--port $(FASTIFY_PORT) \
		--address 0.0.0.0 \
		--log-level debug \
		--pretty-logs \
		--ignore-watch='$(FASTIFY_IGNORE)' \
		2>&1 | tee logs/fastify.log

dev-fastapi: ## Run FastAPI server only (port 52000)
	@mkdir -p logs
	cd fastapi_server && \
		LOG_LEVEL=debug \
		VAULT_SECRET_FILE=$(MAKEFILE_DIR).env \
		BUILD_ID=$(BUILD_ID) \
		BUILD_VERSION=$(BUILD_VERSION) \
		GIT_COMMIT=$(GIT_COMMIT) \
		$(UVICORN) fastapi_server.main:app --reload --host 0.0.0.0 --port $(FASTAPI_PORT) \
			--reload-dir . \
			--reload-dir $(MAKEFILE_DIR)packages_py \
			--reload-dir $(MAKEFILE_DIR)polyglot \
			--reload-dir $(MAKEFILE_DIR)common \
			--reload-dir $(MAKEFILE_DIR)fastapi_apps \
			--reload-include '*.py' \
			2>&1 | tee $(MAKEFILE_DIR)logs/fastapi.log

##@ Build

build: ## Build all projects (frontend + backends)
	@$(PYTHON) .bin/lint-nx-project-paths.py
	make -f Makefile.fastapi build-log
	make -f Makefile.fastify build-log

build-watch: ## Rebuild on file changes (packages with build:watch)
	@echo "Starting build watchers for packages with build:watch..."
	pnpm nx run-many --target=build:watch --output-style=stream

test: ## Run all tests
	rm -rf ./logs && mkdir ./logs
	npm run test:log
	make -f Makefile.pytest build-log
	make -f Makefile.pytest test-log

##@ Code Quality

lint: ## Lint all code
	pnpm lint

format: ## Format all code
	pnpm format

check: ## Run all checks
	pnpm check

##@ Docker

docker-up: ## Start database services
	docker-compose up -d

docker-down: ## Stop database services
	docker-compose down

##@ CLI Tools

cli_db_manager: ## Manage database via CLI
	rm -rf ./logs/cli_db_manager.error.log
	rm -rf ./logs/cli_db_manager_seed.error.log
	pnpm --filter @internal/sequelize-manager dev

cli_git_module: ## Manage Git submodules via CLI
	pnpm --filter @internal/gitmodule-manager dev

cli_file_compare_diff_snapshot: ## Compare files between dirs and verify diff snapshot stability
	pnpm --filter @internal/file-compare-diff-snapshot dev

cli_github_pull_data_repo: ## Pull GitHub data repos
	python -m tools.github_pull_data_repo

polynx: ## Scaffold a new project (interactive)
	node packages_mjs/project-generator/dist/index.js

cli_chromadb_rag_ingest: ## Interactive ChromaDB RAG ingest manager (status, ingest, cleanup)
	pnpm --filter @internal/chromadb-rag-ingest-manager dev

cli_component_usage_audit: ## Audit real-world React component usage across GitHub repos
	pnpm --filter @tools/analysis_github_component_usage_audit cli

##@ Clean

clean: ## Clean build artifacts
	@# Only run pnpm clean if nx is available (node_modules installed)
	@if [ -d "node_modules" ] && command -v pnpm >/dev/null 2>&1; then pnpm clean || true; fi
	find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "build" -exec rm -rf {} + 2>/dev/null || true

##@ Vault File Tests

test-vault-file: test-vault-file-py test-vault-file-mjs ## Run vault_file tests (Python + Node.js)
	@echo "All vault_file tests completed!"

test-vault-file-py: ## Run vault_file Python tests
	@echo "Running vault_file Python tests..."
	cd polyglot/vault_file/py && \
		PYTHONPATH=src:$(PYTHONPATH) \
		$(PYTHON) -m pytest __tests__/ -v --tb=short

test-vault-file-fastapi: ## Run vault_file FastAPI integration tests
	@echo "Running vault_file FastAPI integration tests..."
	cd polyglot/vault_file/py && \
		PYTHONPATH=src:$(PYTHONPATH) \
		$(PYTHON) -m pytest __tests__/test_api.py -v --tb=short

test-vault-file-mjs: ## Run vault_file Node.js tests
	@echo "Running vault_file Node.js tests..."
	cd polyglot/vault_file/mjs && \
		NODE_OPTIONS="--experimental-vm-modules" npx jest --passWithNoTests

test-vault-file-fastify: ## Run vault_file Fastify integration tests
	@echo "Running vault_file Fastify integration tests..."
	cd polyglot/vault_file/mjs && \
		NODE_OPTIONS="--experimental-vm-modules" npx jest __tests__/api.test.ts --passWithNoTests

test-vault-file-coverage: ## Run vault_file tests with coverage
	@echo "Running vault_file tests with coverage..."
	cd polyglot/vault_file/py && \
		PYTHONPATH=src:$(PYTHONPATH) \
		$(PYTHON) -m pytest __tests__/ -v --cov=vault_file --cov-report=html
	cd polyglot/vault_file/mjs && \
		NODE_OPTIONS="--experimental-vm-modules" npx jest --coverage
