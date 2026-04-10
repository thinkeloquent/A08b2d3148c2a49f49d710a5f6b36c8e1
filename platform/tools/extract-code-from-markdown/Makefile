.PHONY: setup install clean run help

VENV := py/.venv
PYTHON := $(VENV)/bin/python
PIP := $(VENV)/bin/pip

help:
	@echo "Usage:"
	@echo "  make setup    - Create virtual environment"
	@echo "  make install  - Install package in editable mode"
	@echo "  make run      - Run extract-code (use ARGS='...' for arguments)"
	@echo "  make clean    - Remove virtual environment"

setup: $(VENV)/bin/activate

$(VENV)/bin/activate:
	python3 -m venv $(VENV)
	$(PIP) install --upgrade pip

install: setup
	$(PIP) install -e ./py

run: install
	$(VENV)/bin/extract-code $(ARGS)

clean:
	rm -rf $(VENV)
