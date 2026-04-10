SHELL := /bin/bash
.DEFAULT_GOAL := help

SUBDIRS := sdk fetch-httpx fetch-undici oss-httpx oss-undici native-py native-mjs

.PHONY: help setup test-all clean $(SUBDIRS)

help:
	@echo "Jira connection tests"
	@echo ""
	@echo "Targets:"
	@echo "  setup      Install deps for all sub-tests"
	@echo "  test-all   Run all connection tests"
	@echo "  clean      Remove venvs and lock files"
	@echo ""
	@echo "Sub-tests: $(SUBDIRS)"

setup:
	@for d in $(SUBDIRS); do \
		echo "=== setup $$d ==="; \
		$(MAKE) -C $$d setup || true; \
	done

test-all:
	@for d in $(SUBDIRS); do \
		echo ""; \
		echo "════════════════════════════════════════"; \
		echo "  $$d"; \
		echo "════════════════════════════════════════"; \
		$(MAKE) -C $$d test-all || true; \
	done

clean:
	@for d in $(SUBDIRS); do \
		$(MAKE) -C $$d clean || true; \
	done
