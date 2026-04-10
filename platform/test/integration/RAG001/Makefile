SHELL := /bin/bash
.DEFAULT_GOAL := help

LIBS := ant-design blueprint chakra-ui fluentui mantine material-ui primitives react-bootstrap Semantic-UI-React ui

.PHONY: help setup install-all ingest-all clean-all nuke-all $(LIBS)

help: ## Show this help
	@echo "  Top-level orchestrator for all 10 RAG libraries"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*##"}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "  Per-library usage:"
	@echo "    make install-<lib>   e.g. make install-mantine"
	@echo "    make ingest-<lib>    e.g. make ingest-mantine"
	@echo "    make query-<lib>     e.g. make query-mantine"
	@echo "    make serve-<lib>     e.g. make serve-mantine"
	@echo ""
	@echo "  Available libraries:"
	@echo "    $(LIBS)"

setup: ## Install Node.js and Python dependencies via pnpm + poetry
	pnpm install
	@for lib in $(LIBS); do \
		echo "=== poetry: $$lib ==="; \
		cd $$lib && poetry lock && poetry install && cd ..; \
	done

install-all: ## Install venv + deps for all libraries
	@for lib in $(LIBS); do \
		echo "=== Installing $$lib ==="; \
		$(MAKE) -C $$lib install; \
		echo ""; \
	done

ingest-all: ## Ingest all libraries into their vector stores
	@for lib in $(LIBS); do \
		echo "=== Ingesting $$lib ==="; \
		$(MAKE) -C $$lib ingest; \
		echo ""; \
	done

clean-all: ## Remove all vector store data
	@for lib in $(LIBS); do \
		$(MAKE) -C $$lib clean; \
	done

nuke-all: ## Remove all venvs and vector store data
	@for lib in $(LIBS); do \
		$(MAKE) -C $$lib nuke; \
	done

# --- Per-library convenience targets ---

define LIB_TARGETS
install-$(1):
	$(MAKE) -C $(1) install

ingest-$(1):
	$(MAKE) -C $(1) ingest

query-$(1):
	$(MAKE) -C $(1) query

query-$(1)-openai:
	$(MAKE) -C $(1) query-openai

query-$(1)-anthropic:
	$(MAKE) -C $(1) query-anthropic

query-$(1)-gemini:
	$(MAKE) -C $(1) query-gemini

serve-$(1):
	$(MAKE) -C $(1) serve

clean-$(1):
	$(MAKE) -C $(1) clean

nuke-$(1):
	$(MAKE) -C $(1) nuke
endef

$(foreach lib,$(LIBS),$(eval $(call LIB_TARGETS,$(lib))))
