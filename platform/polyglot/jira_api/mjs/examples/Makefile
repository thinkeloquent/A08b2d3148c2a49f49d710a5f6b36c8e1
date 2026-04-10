.PHONY: help install start dev clean

MAKEFILE_DIR := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
PARENT_DIR := $(shell dirname $(MAKEFILE_DIR))
PORT ?= 9000

help:
	@echo ""
	@echo "  Jira API — Node.js Examples"
	@echo "  ────────────────────────────────────────────"
	@echo ""
	@echo "  make install   Install dependencies (from parent mjs/ dir)"
	@echo "  make start     Run basic-usage.mjs examples"
	@echo "  make dev       Start Fastify example app (port=$(PORT))"
	@echo "  make clean     Remove node_modules"
	@echo ""
	@echo "  Environment Variables:"
	@echo "    JIRA_BASE_URL    Jira instance URL"
	@echo "    JIRA_EMAIL       Jira account email"
	@echo "    JIRA_API_TOKEN   Jira API token"
	@echo "    SERVER_API_KEY   Optional API key for the server"
	@echo "    PORT             Server port (default: 9000)"
	@echo "    LOG_LEVEL        Log level (default: info)"
	@echo ""

install:
	cd $(PARENT_DIR) && pnpm install

start:
	cd $(PARENT_DIR) && LOG_LEVEL=debug node examples/basic-usage.mjs

dev:
	cd $(PARENT_DIR) && PORT=$(PORT) LOG_LEVEL=debug node examples/fastify-app/server.mjs

clean:
	rm -rf $(MAKEFILE_DIR)/node_modules || true
