SHELL := /bin/bash
.DEFAULT_GOAL := help

PLATFORM_ROOT := $(shell cd ../../../../ && pwd)

APP_ENV ?= dev
CONFIG_DIR ?= $(PLATFORM_ROOT)/common/config

.PHONY: help test-mjs

help:
	@echo "Targets: test-mjs"

test-mjs:
	APP_ENV=$(APP_ENV) CONFIG_DIR=$(CONFIG_DIR) node test_case.mjs --app-env "$(APP_ENV)" --config-dir "$(CONFIG_DIR)"
