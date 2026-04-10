SHELL := /bin/bash
.DEFAULT_GOAL := help

PLATFORM_ROOT := $(shell cd ../../../../ && pwd)

APP_ENV ?= dev
CONFIG_DIR ?= $(PLATFORM_ROOT)/common/config

.PHONY: help test-mjs test-all clean

help:
	@echo "Targets: test-mjs test-all clean"

test-mjs:
	APP_ENV=$(APP_ENV) CONFIG_DIR=$(CONFIG_DIR) node test_case.mjs --app-env "$(APP_ENV)" --config-dir "$(CONFIG_DIR)"

test-all: test-mjs

clean:
	@echo "Nothing to clean (MJS-only test)"
