SHELL := /bin/bash
.DEFAULT_GOAL := help

PLATFORM_ROOT := $(shell cd ../../../../ && pwd)
VENV_DIR   := .venv
PYTHON     := $(VENV_DIR)/bin/python

LIBRARY    := ant-design
DB_DIR     := db_ant_design

export POETRY_VIRTUALENVS_IN_PROJECT := 1

# --- Targets ---

.PHONY: help setup install ingest ingest-opensearch query serve serve-opensearch dev dev-opensearch clean nuke

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*##"}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

setup: ## Install Python dependencies via poetry
	poetry lock && poetry install

install: setup ## Alias for setup

ingest: setup ## Ingest $(LIBRARY) components into ChromaDB
	PERSIST_DIRECTORY=$(DB_DIR) $(PYTHON) ingest.py

ingest-opensearch: setup ## Ingest $(LIBRARY) into OpenSearch
	PERSIST_DIRECTORY=$(DB_DIR) VECTOR_BACKEND=opensearch $(PYTHON) ingest.py

query: setup ## Launch interactive query REPL
	PERSIST_DIRECTORY=$(DB_DIR) $(PYTHON) query.py

query-openai: setup ## Launch query REPL with OpenAI
	PERSIST_DIRECTORY=$(DB_DIR) LLM_PROVIDER=openai $(PYTHON) query.py

query-anthropic: setup ## Launch query REPL with Anthropic
	PERSIST_DIRECTORY=$(DB_DIR) LLM_PROVIDER=anthropic $(PYTHON) query.py

query-gemini: setup ## Launch query REPL with Gemini
	PERSIST_DIRECTORY=$(DB_DIR) LLM_PROVIDER=gemini $(PYTHON) query.py

serve: setup ## Start FastAPI dev server (default port 8000)
	PERSIST_DIRECTORY=$(DB_DIR) $(VENV_DIR)/bin/fastapi dev app.py --port $(or $(PORT),8000)

serve-opensearch: setup ## Start FastAPI with OpenSearch backend
	PERSIST_DIRECTORY=$(DB_DIR) VECTOR_BACKEND=opensearch $(VENV_DIR)/bin/fastapi dev app.py --port $(or $(PORT),8000)

dev: ingest serve ## Install, ingest into ChromaDB, and serve

dev-opensearch: ingest-opensearch serve-opensearch ## Install, ingest into OpenSearch, and serve

clean: ## Remove vector store data
	rm -rf $(DB_DIR)
	@echo "Removed $(DB_DIR)"

nuke: clean ## Remove venv and all generated data
	rm -rf $(VENV_DIR) poetry.lock
	@echo "Removed $(VENV_DIR)"
