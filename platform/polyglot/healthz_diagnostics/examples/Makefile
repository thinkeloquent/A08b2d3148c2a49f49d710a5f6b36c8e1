# Examples Makefile for healthz-diagnostics
# Run example scripts to demonstrate SDK usage

.PHONY: help install run-python run-node all

help:
	@echo "healthz-diagnostics examples"
	@echo ""
	@echo "Targets:"
	@echo "  install     - Install dependencies for examples"
	@echo "  run-python  - Run Python example"
	@echo "  run-node    - Run Node.js example"
	@echo "  all         - Run all examples"

install:
	@echo "Installing Python dependencies..."
	cd ../py && poetry install
	@echo "Installing Node.js dependencies..."
	cd ../mjs && npm install
	@echo "Done."

run-python:
	@echo "Running Python example..."
	cd ../py && poetry run python ../examples/basic_usage.py

run-node:
	@echo "Running Node.js example..."
	cd ../mjs && node ../examples/basic-usage.mjs

all: run-python run-node
