.PHONY: env-setup install build clean test lint

PYTHON := python3
VENV := .venv
BIN := $(VENV)/bin

# source ./.venv/bin/activate

env-setup:
	$(PYTHON) -m venv $(VENV)
	$(BIN)/pip install --upgrade pip

install:
	$(BIN)/pip install --upgrade setuptools wheel
	$(BIN)/pip install -e ".[dev]"

build:
	$(BIN)/python setup.py sdist bdist_wheel

test:
	$(BIN)/pytest

lint:
	$(BIN)/black --check .
	$(BIN)/flake8 .
	$(BIN)/mypy .

clean:
	rm -rf $(VENV)
	rm -rf build dist *.egg-info
	find . -type d -name __pycache__ -exec rm -rf {} +
