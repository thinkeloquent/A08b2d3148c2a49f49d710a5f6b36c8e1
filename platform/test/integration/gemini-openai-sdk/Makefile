SHELL := /bin/bash
.DEFAULT_GOAL := help

SUBDIRS := client-config fetch-client health-check transport-constant

.PHONY: help setup test-all clean

help:
	@echo "Targets: setup test-all clean"
	@echo ""
	@echo "Subdirectories: $(SUBDIRS)"

setup: ## Install Node.js and Python dependencies via pnpm + poetry
	pnpm install
	@for d in $(SUBDIRS); do \
		echo "=== poetry: $$d ==="; \
		cd $$d && poetry lock && poetry install && cd ..; \
	done

test-all: ## Run tests in all subdirectories
	@for d in $(SUBDIRS); do \
		echo "=== $$d ==="; \
		$(MAKE) -C $$d test-all; \
		echo ""; \
	done

clean: ## Remove generated artifacts in all subdirectories
	@for d in $(SUBDIRS); do \
		$(MAKE) -C $$d clean; \
	done
