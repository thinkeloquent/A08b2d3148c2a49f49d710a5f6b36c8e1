# =============================================================================
# Makefile — Figma API SDK Examples (Python)
#
# Targets for running the example scripts.
# Examples use the parent package installed via pip install -e ".[dev]".
# =============================================================================

.PHONY: install start dev

# -----------------------------------------------------------------------------
# install — Install the SDK package in development mode from the parent dir.
# -----------------------------------------------------------------------------
install:
	cd .. && pip install -e ".[dev]"

# -----------------------------------------------------------------------------
# start — Run the basic-usage example script.
# -----------------------------------------------------------------------------
start:
	python basic_usage.py

# -----------------------------------------------------------------------------
# dev — Run the FastAPI demo server with hot reload.
# -----------------------------------------------------------------------------
dev:
	uvicorn fastapi_app.main:app --reload --port 3000
