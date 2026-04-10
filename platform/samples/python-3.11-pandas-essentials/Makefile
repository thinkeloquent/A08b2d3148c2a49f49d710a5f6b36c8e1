# --------------------------------------------------------------------------- #
#  CI Commands — python-3.11-pandas-essentials
# --------------------------------------------------------------------------- #

PYTHON  ?= python3
VENV    := .venv
PIP     := $(VENV)/bin/pip
PY      := $(VENV)/bin/python

.PHONY: setup
setup:
	@if [ ! -d "$(VENV)" ]; then \
		echo "Creating virtual-env …"; \
		$(PYTHON) -m venv $(VENV); \
	else \
		echo "Virtual-env already exists."; \
	fi

.PHONY: install
install: setup
	$(PIP) install --upgrade pip
	$(PIP) install -e .

.PHONY: run
run:
	$(PY) main.py
