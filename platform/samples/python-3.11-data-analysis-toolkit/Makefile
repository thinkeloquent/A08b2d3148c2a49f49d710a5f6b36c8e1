# --------------------------------------------------------------------------- #
#  CI Commands — python-3.11-data-analysis-toolkit
# --------------------------------------------------------------------------- #

PYTHON  ?= python3
VENV    := .venv
PIP     := $(VENV)/bin/pip
PY      := $(VENV)/bin/python

# ---- setup ---------------------------------------------------------------- #
#  Create a virtual-env (idempotent — skips if .venv already exists)
# --------------------------------------------------------------------------- #
.PHONY: setup
setup:
	@if [ ! -d "$(VENV)" ]; then \
		echo "Creating virtual-env …"; \
		$(PYTHON) -m venv $(VENV); \
	else \
		echo "Virtual-env already exists."; \
	fi

# ---- install -------------------------------------------------------------- #
#  Install project dependencies (and optional dev extras) into the venv
# --------------------------------------------------------------------------- #
.PHONY: install
install: setup
	$(PIP) install --upgrade pip
	$(PIP) install -e ".[dev]"

# ---- run ------------------------------------------------------------------ #
#  Launch the sample analysis script
# --------------------------------------------------------------------------- #
.PHONY: run
run:
	$(PY) main.py
