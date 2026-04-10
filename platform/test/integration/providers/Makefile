SHELL := /bin/bash
.DEFAULT_GOAL := help

SUBDIRS := anthropic confluence figma gemini-openai github jira openai openai-embeddings

.PHONY: help setup test-all clean $(SUBDIRS)

help:
	@echo "Targets: setup test-all clean <provider>"
	@echo ""
	@echo "Subdirectories: $(SUBDIRS)"
	@echo ""
	@echo "Examples:"
	@echo "  make confluence          # setup + test-all for confluence"
	@echo "  make github              # setup + test-all for github"
	@echo "  make test-all            # run all providers"

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

# Per-provider targets: make <provider> runs setup + test-all in that subdirectory
$(SUBDIRS):
	$(MAKE) -C $@ test-all
