SHELL := /bin/bash
.DEFAULT_GOAL := help

VENV_DIR := .venv
PYTHON := $(VENV_DIR)/bin/python
DEPS_STAMP := $(VENV_DIR)/.deps-ready

export POETRY_VIRTUALENVS_IN_PROJECT := 1

.PHONY: help setup ensure-setup test-py test-all clean

help:
	@echo "Targets: setup test-py test-all clean"

setup:
	poetry lock && poetry install
	@mkdir -p $(VENV_DIR) && touch $(DEPS_STAMP)

ensure-setup:
	@if [ ! -x "$(PYTHON)" ] || [ ! -f "$(DEPS_STAMP)" ] || [ pyproject.toml -nt "$(DEPS_STAMP)" ] || { [ -f poetry.lock ] && [ poetry.lock -nt "$(DEPS_STAMP)" ]; } || ! "$(PYTHON)" -c "import httpx" >/dev/null 2>&1; then \
		echo "[setup] Python environment missing/stale or imports failed; running setup..."; \
		$(MAKE) setup; \
	fi

test-py: ensure-setup
	$(PYTHON) test_case.py

test-all: test-py

clean:
	rm -rf $(VENV_DIR) poetry.lock
