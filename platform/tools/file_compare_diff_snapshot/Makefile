# Makefile - file_compare_diff_snapshot
# Compare files between directories, hash diffs, and verify snapshot stability.
#
# Usage:
#   make -C tools/file_compare_diff_snapshot help
#   make -C tools/file_compare_diff_snapshot snapshot DIR_A=./src DIR_B=./ref
#   make -C tools/file_compare_diff_snapshot snapshot DIR_A=./src DIR_B=./ref GLOB="**/*.py"
#   make -C tools/file_compare_diff_snapshot clean-snapshot DIR_A=./src DIR_B=./ref

# ============================================================================
# Configuration
# ============================================================================

VENV := py/.venv
PYTHON := $(VENV)/bin/python
PIP := $(VENV)/bin/pip
CLI := $(VENV)/bin/file-compare-diff-snapshot

# Overridable variables
DIR_A ?=
DIR_B ?=
GLOB ?=
CACHE_DIR ?=
VERBOSE ?=

# Build CLI flags from variables
CLI_FLAGS :=
ifneq ($(GLOB),)
CLI_FLAGS += -g "$(GLOB)"
endif
ifneq ($(CACHE_DIR),)
CLI_FLAGS += --cache-dir "$(CACHE_DIR)"
endif
ifeq ($(VERBOSE),1)
CLI_FLAGS += -v
endif

# ============================================================================
# Phony Targets
# ============================================================================
.PHONY: help setup install snapshot verify clean-snapshot test clean

# ============================================================================
# Help
# ============================================================================
help:
	@echo "file_compare_diff_snapshot"
	@echo ""
	@echo "Targets:"
	@echo "  make help             - Show this usage info"
	@echo "  make setup            - Create virtual environment"
	@echo "  make install          - Install package (editable)"
	@echo "  make snapshot         - Create or verify snapshot"
	@echo "  make verify           - Alias for snapshot (explicit intent)"
	@echo "  make clean-snapshot   - Remove cached snapshot for DIR_A/DIR_B pair"
	@echo "  make test             - Run tests"
	@echo "  make clean            - Remove virtual environment"
	@echo ""
	@echo "Overridable Variables:"
	@echo "  DIR_A=<path>          - Directory to scan (required for snapshot/verify/clean-snapshot)"
	@echo "  DIR_B=<path>          - Reference directory (required for snapshot/verify/clean-snapshot)"
	@echo "  GLOB=<pattern>        - Glob filter (e.g. \"**/*.py\")"
	@echo "  CACHE_DIR=<path>      - Override cache location"
	@echo "  VERBOSE=1             - Enable verbose output"
	@echo ""
	@echo "Examples:"
	@echo "  make snapshot DIR_A=./src DIR_B=./ref"
	@echo "  make snapshot DIR_A=./src DIR_B=./ref GLOB=\"**/*.py\""
	@echo "  make clean-snapshot DIR_A=./src DIR_B=./ref"
	@echo "  make test"

# ============================================================================
# Setup & Install
# ============================================================================
setup: $(VENV)/bin/activate

$(VENV)/bin/activate:
	python3 -m venv $(VENV)
	$(PIP) install --upgrade pip

install: setup
	$(PIP) install -e ./py

# ============================================================================
# Snapshot Commands
# ============================================================================
snapshot: install
	@if [ -z "$(DIR_A)" ] || [ -z "$(DIR_B)" ]; then \
		echo "Error: DIR_A and DIR_B are required."; \
		echo "Usage: make snapshot DIR_A=./src DIR_B=./ref"; \
		exit 1; \
	fi
	$(CLI) "$(DIR_A)" "$(DIR_B)" $(CLI_FLAGS)

verify: snapshot

clean-snapshot: install
	@if [ -z "$(DIR_A)" ] || [ -z "$(DIR_B)" ]; then \
		echo "Error: DIR_A and DIR_B are required."; \
		echo "Usage: make clean-snapshot DIR_A=./src DIR_B=./ref"; \
		exit 1; \
	fi
	$(CLI) "$(DIR_A)" "$(DIR_B)" $(CLI_FLAGS) --clean

# ============================================================================
# Testing
# ============================================================================
test: install
	$(PIP) install pytest
	$(VENV)/bin/pytest py/tests/ -v

# ============================================================================
# Cleanup
# ============================================================================
clean:
	rm -rf $(VENV)
