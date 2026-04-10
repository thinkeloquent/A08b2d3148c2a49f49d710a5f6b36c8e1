.PHONY: help install start dev clean

MAKEFILE_DIR := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
PARENT_DIR := $(shell dirname $(MAKEFILE_DIR))
PORT ?= 9000

help:
	@echo ""
	@echo "  Jira API — Python Examples"
	@echo "  ────────────────────────────────────────────"
	@echo ""
	@echo "  make install   Install dependencies (from parent py/ dir)"
	@echo "  make start     Run basic_usage.py examples"
	@echo "  make dev       Start FastAPI example app (port=$(PORT))"
	@echo "  make clean     Remove caches"
	@echo ""
	@echo "  Environment Variables:"
	@echo "    JIRA_BASE_URL    Jira instance URL"
	@echo "    JIRA_EMAIL       Jira account email"
	@echo "    JIRA_API_TOKEN   Jira API token"
	@echo "    SERVER_API_KEY   Optional API key for the server"
	@echo "    PORT             Server port (default: 9000)"
	@echo "    LOG_LEVEL        Log level (default: INFO)"
	@echo ""

install:
	cd $(PARENT_DIR) && pip install -e ".[dev]"

start:
	cd $(MAKEFILE_DIR) && LOG_LEVEL=DEBUG python basic_usage.py

dev:
	cd $(MAKEFILE_DIR) && uvicorn fastapi_app.main:app --reload --host 0.0.0.0 --port $(PORT)

clean:
	find $(MAKEFILE_DIR) -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find $(MAKEFILE_DIR) -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
