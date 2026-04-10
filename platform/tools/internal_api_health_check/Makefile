# Makefile - Internal API Health Check
# CI commands for testing registered API endpoints across Fastify and FastAPI servers
#
# Usage:
#   make -C tools/internal_api_health_check help
#   make -C tools/internal_api_health_check check
#   make -C tools/internal_api_health_check check-fastify
#   make -C tools/internal_api_health_check check-fastapi
#   make -C tools/internal_api_health_check dry-run
#   make -C tools/internal_api_health_check ci

# ============================================================================
# Constants and Configuration
# ============================================================================

# Get the directory where Makefile is located
MAKEFILE_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

# Project root (two levels up from tools/internal_api_health_check/)
PROJECT_ROOT := $(abspath $(MAKEFILE_DIR)../..)

# Python configuration
VENV_DIR := $(PROJECT_ROOT)/.venv
PYTHON := $(if $(wildcard $(VENV_DIR)/bin/python),$(VENV_DIR)/bin/python,python)

# Build PYTHONPATH with packages_py/*/src
PYTHON_PATHS := $(shell for pkg in $(PROJECT_ROOT)/packages_py/*/src; do [ -d "$$pkg" ] && printf "%s:" "$$pkg"; done)
PYTHON_PATHS := $(PYTHON_PATHS:%:=%)
export PYTHONPATH := $(PYTHON_PATHS):$(PYTHONPATH)

# Module invocation (run from project root so -m tools.internal_api_health_check works)
MODULE := tools.internal_api_health_check
RUN := cd $(PROJECT_ROOT) && $(PYTHON) -m $(MODULE)

# Server configuration
FASTIFY_PORT ?= 51000
FASTAPI_PORT ?= 52000
FASTIFY_URL := http://localhost:$(FASTIFY_PORT)
FASTAPI_URL := http://localhost:$(FASTAPI_PORT)

# Test configuration
CONCURRENCY ?= 5
TIMEOUT ?= 10

# Log directories
LOG_DIR := $(PROJECT_ROOT)/logs
RESULTS_DIR := $(LOG_DIR)/health-check

# Default variables (can be overridden: make check OWNER=myorg REPO=myrepo)
OWNER ?=
REPO ?=

# Build --var flags from OWNER/REPO if provided
VAR_FLAGS :=
ifneq ($(OWNER),)
VAR_FLAGS += --var owner=$(OWNER)
endif
ifneq ($(REPO),)
VAR_FLAGS += --var repo=$(REPO)
endif

# ============================================================================
# Phony Targets
# ============================================================================
.PHONY: help check check-fastify check-fastapi check-verbose \
        dry-run dry-run-fastify dry-run-fastapi \
        suite suite-fastify suite-fastapi \
        check-log check-fastify-log check-fastapi-log \
        ci ci-fastify ci-fastapi \
        info clean

# ============================================================================
# Help
# ============================================================================
help:
	@echo "Internal API Health Check"
	@echo ""
	@echo "Run All Endpoints:"
	@echo "  make check                  - Test all suites against all servers"
	@echo "  make check-fastify          - Test all suites against Fastify only"
	@echo "  make check-fastapi          - Test all suites against FastAPI only"
	@echo "  make check-verbose          - Test all with verbose error details"
	@echo ""
	@echo "Run Specific Suite:"
	@echo "  make suite SUITE=<name>     - Run named suite against all servers"
	@echo "  make suite-fastify SUITE=<name> - Run named suite against Fastify"
	@echo "  make suite-fastapi SUITE=<name> - Run named suite against FastAPI"
	@echo ""
	@echo "  Available suites:"
	@echo "    github_api_health         - /health, /health/rate-limit"
	@echo "    github_api_repos          - /repos/* endpoints (7 tests)"
	@echo "    github_api_branches       - /branches/*, /compare/* (4 tests)"
	@echo "    github_api_collaborators  - /collaborators/*, /invitations (3 tests)"
	@echo "    github_api_releases       - /tags, /releases/*, /rulesets (5 tests)"
	@echo "    github_api_webhooks       - /hooks/* (2 tests)"
	@echo "    github_api_security       - /vulnerability-alerts (1 test)"
	@echo ""
	@echo "Dry Run (no HTTP requests):"
	@echo "  make dry-run                - Show all resolved URLs"
	@echo "  make dry-run-fastify        - Show Fastify URLs only"
	@echo "  make dry-run-fastapi        - Show FastAPI URLs only"
	@echo ""
	@echo "CI Logging:"
	@echo "  make check-log              - Run all, save JSON to logs/"
	@echo "  make check-fastify-log      - Run Fastify, save JSON to logs/"
	@echo "  make check-fastapi-log      - Run FastAPI, save JSON to logs/"
	@echo ""
	@echo "CI Pipeline:"
	@echo "  make ci                     - Full CI: dry-run, check, save logs"
	@echo "  make ci-fastify             - CI pipeline for Fastify only"
	@echo "  make ci-fastapi             - CI pipeline for FastAPI only"
	@echo ""
	@echo "Utilities:"
	@echo "  make info                   - Show current configuration"
	@echo "  make clean                  - Remove health check logs"
	@echo ""
	@echo "Variable Overrides:"
	@echo "  make check OWNER=myorg REPO=myrepo"
	@echo "  FASTIFY_PORT=9000 make check-fastify"
	@echo "  TIMEOUT=30 CONCURRENCY=10 make check"
	@echo ""
	@echo "Configuration:"
	@echo "  FASTIFY_PORT=$(FASTIFY_PORT)  FASTAPI_PORT=$(FASTAPI_PORT)"
	@echo "  CONCURRENCY=$(CONCURRENCY)    TIMEOUT=$(TIMEOUT)"

# ============================================================================
# Run All Endpoints
# ============================================================================

check:
	@$(RUN) --concurrency $(CONCURRENCY) --timeout $(TIMEOUT) $(VAR_FLAGS)

check-fastify:
	@$(RUN) --server fastify --concurrency $(CONCURRENCY) --timeout $(TIMEOUT) $(VAR_FLAGS)

check-fastapi:
	@$(RUN) --server fastapi --concurrency $(CONCURRENCY) --timeout $(TIMEOUT) $(VAR_FLAGS)

check-verbose:
	@$(RUN) --verbose --concurrency $(CONCURRENCY) --timeout $(TIMEOUT) $(VAR_FLAGS)

# ============================================================================
# Run Specific Suite
# ============================================================================

suite:
	@if [ -z "$(SUITE)" ]; then \
		echo "Usage: make suite SUITE=<name>"; \
		echo "Example: make suite SUITE=github_api_health"; \
		exit 1; \
	fi
	@$(RUN) --suite $(SUITE) --concurrency $(CONCURRENCY) --timeout $(TIMEOUT) $(VAR_FLAGS)

suite-fastify:
	@if [ -z "$(SUITE)" ]; then \
		echo "Usage: make suite-fastify SUITE=<name>"; \
		exit 1; \
	fi
	@$(RUN) --suite $(SUITE) --server fastify --concurrency $(CONCURRENCY) --timeout $(TIMEOUT) $(VAR_FLAGS)

suite-fastapi:
	@if [ -z "$(SUITE)" ]; then \
		echo "Usage: make suite-fastapi SUITE=<name>"; \
		exit 1; \
	fi
	@$(RUN) --suite $(SUITE) --server fastapi --concurrency $(CONCURRENCY) --timeout $(TIMEOUT) $(VAR_FLAGS)

# ============================================================================
# Dry Run
# ============================================================================

dry-run:
	@$(RUN) --dry-run $(VAR_FLAGS)

dry-run-fastify:
	@$(RUN) --dry-run --server fastify $(VAR_FLAGS)

dry-run-fastapi:
	@$(RUN) --dry-run --server fastapi $(VAR_FLAGS)

# ============================================================================
# CI Logging
# ============================================================================

# Ensure results directory exists
$(RESULTS_DIR):
	@mkdir -p $(RESULTS_DIR)

check-log: $(RESULTS_DIR)
	@echo "Running health check (all servers)..."
	@$(RUN) --concurrency $(CONCURRENCY) --timeout $(TIMEOUT) \
		--output-file $(RESULTS_DIR)/results-all.json \
		--verbose $(VAR_FLAGS) || true
	@echo ""
	@echo "Results saved to $(RESULTS_DIR)/results-all.json"

check-fastify-log: $(RESULTS_DIR)
	@echo "Running health check (Fastify)..."
	@$(RUN) --server fastify --concurrency $(CONCURRENCY) --timeout $(TIMEOUT) \
		--output-file $(RESULTS_DIR)/results-fastify.json \
		--verbose $(VAR_FLAGS) || true
	@echo ""
	@echo "Results saved to $(RESULTS_DIR)/results-fastify.json"

check-fastapi-log: $(RESULTS_DIR)
	@echo "Running health check (FastAPI)..."
	@$(RUN) --server fastapi --concurrency $(CONCURRENCY) --timeout $(TIMEOUT) \
		--output-file $(RESULTS_DIR)/results-fastapi.json \
		--verbose $(VAR_FLAGS) || true
	@echo ""
	@echo "Results saved to $(RESULTS_DIR)/results-fastapi.json"

# ============================================================================
# CI Pipeline
# ============================================================================

ci: $(RESULTS_DIR)
	@echo "=========================================="
	@echo "Step 1: Dry run (validate URL resolution)"
	@echo "=========================================="
	@$(RUN) --dry-run $(VAR_FLAGS)
	@echo ""
	@echo "=========================================="
	@echo "Step 2: Health check (all servers)"
	@echo "=========================================="
	@$(RUN) --concurrency $(CONCURRENCY) --timeout $(TIMEOUT) \
		--output-file $(RESULTS_DIR)/results-all.json \
		--verbose $(VAR_FLAGS) || true
	@echo ""
	@echo "=========================================="
	@echo "CI Complete"
	@echo "=========================================="
	@echo "Results: $(RESULTS_DIR)/results-all.json"

ci-fastify: $(RESULTS_DIR)
	@echo "=========================================="
	@echo "Step 1: Dry run (Fastify)"
	@echo "=========================================="
	@$(RUN) --dry-run --server fastify $(VAR_FLAGS)
	@echo ""
	@echo "=========================================="
	@echo "Step 2: Health check (Fastify)"
	@echo "=========================================="
	@$(RUN) --server fastify --concurrency $(CONCURRENCY) --timeout $(TIMEOUT) \
		--output-file $(RESULTS_DIR)/results-fastify.json \
		--verbose $(VAR_FLAGS) || true
	@echo ""
	@echo "=========================================="
	@echo "CI Complete (Fastify)"
	@echo "=========================================="
	@echo "Results: $(RESULTS_DIR)/results-fastify.json"

ci-fastapi: $(RESULTS_DIR)
	@echo "=========================================="
	@echo "Step 1: Dry run (FastAPI)"
	@echo "=========================================="
	@$(RUN) --dry-run --server fastapi $(VAR_FLAGS)
	@echo ""
	@echo "=========================================="
	@echo "Step 2: Health check (FastAPI)"
	@echo "=========================================="
	@$(RUN) --server fastapi --concurrency $(CONCURRENCY) --timeout $(TIMEOUT) \
		--output-file $(RESULTS_DIR)/results-fastapi.json \
		--verbose $(VAR_FLAGS) || true
	@echo ""
	@echo "=========================================="
	@echo "CI Complete (FastAPI)"
	@echo "=========================================="
	@echo "Results: $(RESULTS_DIR)/results-fastapi.json"

# ============================================================================
# Utilities
# ============================================================================

info:
	@echo "Internal API Health Check Configuration"
	@echo "========================================"
	@echo ""
	@echo "Servers:"
	@echo "  FASTIFY_URL:  $(FASTIFY_URL)"
	@echo "  FASTAPI_URL:  $(FASTAPI_URL)"
	@echo ""
	@echo "Test Settings:"
	@echo "  CONCURRENCY:  $(CONCURRENCY)"
	@echo "  TIMEOUT:      $(TIMEOUT)s"
	@echo ""
	@echo "Paths:"
	@echo "  PROJECT_ROOT: $(PROJECT_ROOT)"
	@echo "  CONFIG_DIR:   $(MAKEFILE_DIR)config/"
	@echo "  RESULTS_DIR:  $(RESULTS_DIR)"
	@echo ""
	@echo "Python:"
	@echo "  PYTHON:       $(PYTHON)"
	@echo "  MODULE:       $(MODULE)"
	@echo ""
	@echo "Overrides:"
	@echo "  OWNER:        $(or $(OWNER),(default: octocat))"
	@echo "  REPO:         $(or $(REPO),(default: Hello-World))"

clean:
	@echo "Cleaning health check logs..."
	@rm -f $(RESULTS_DIR)/results-*.json 2>/dev/null || true
	@echo "Done."
