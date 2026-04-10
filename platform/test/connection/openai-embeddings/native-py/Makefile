SHELL := /bin/bash
.DEFAULT_GOAL := help

PLATFORM_ROOT := $(shell cd ../../../../ && pwd)
VENV_DIR := .venv
PYTHON := $(VENV_DIR)/bin/python
DEPS_STAMP := $(VENV_DIR)/.deps-ready

APP_ENV ?= dev
CONFIG_DIR ?= $(PLATFORM_ROOT)/common/config

export POETRY_VIRTUALENVS_IN_PROJECT := 1

.PHONY: help setup ensure-setup test-py clean

help:
	@echo "Targets: setup test-py clean"

setup:
	poetry lock && poetry install
	@mkdir -p $(VENV_DIR) && touch $(DEPS_STAMP)

ensure-setup:
	@if [ ! -x "$(PYTHON)" ] || [ ! -f "$(DEPS_STAMP)" ] || [ pyproject.toml -nt "$(DEPS_STAMP)" ] || { [ -f poetry.lock ] && [ poetry.lock -nt "$(DEPS_STAMP)" ]; } || ! "$(PYTHON)" -c "import urllib.request, ssl, json" >/dev/null 2>&1; then \
		echo "[setup] Python environment missing/stale or imports failed; running setup..."; \
		$(MAKE) setup; \
	fi

test-py: ensure-setup
	APP_ENV=$(APP_ENV) CONFIG_DIR=$(CONFIG_DIR) $(PYTHON) test_case.py --app-env "$(APP_ENV)" --config-dir "$(CONFIG_DIR)"

clean:
	rm -rf $(VENV_DIR) poetry.lock
