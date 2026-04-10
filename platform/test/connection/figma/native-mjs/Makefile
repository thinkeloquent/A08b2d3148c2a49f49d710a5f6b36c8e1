SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help setup test-mjs test-all clean

help:
	@echo "Targets: setup test-mjs test-all clean"

setup:
	npm install

test-mjs:
	@if [ ! -d node_modules/undici ]; then $(MAKE) setup; fi
	node test_case.mjs

test-all: test-mjs

clean:
	rm -rf node_modules package-lock.json
