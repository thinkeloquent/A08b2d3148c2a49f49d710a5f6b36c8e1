# ───────────────────────────────────────────────────────────────────
# GitHub SDK API Component Usage Audit — Polyglot Makefile
# ───────────────────────────────────────────────────────────────────

MJS_DIR := mjs
PY_DIR  := py

.PHONY: install install-mjs install-py \
        test test-mjs test-py \
        dev dev-mjs dev-py \
        lint lint-py \
        clean

# ── Install ────────────────────────────────────────────────────────

install: install-mjs install-py

install-mjs:
	cd $(MJS_DIR) && pnpm install

install-py:
	cd $(PY_DIR) && pip install -e ".[dev]"

# ── Test ───────────────────────────────────────────────────────────

test: test-mjs test-py

test-mjs:
	@echo "No mjs tests yet"

test-py:
	cd $(PY_DIR) && python -m pytest __tests__/ -v --tb=short

# ── Dev / Run ──────────────────────────────────────────────────────

dev: dev-mjs

dev-mjs:
	cd $(MJS_DIR) && node cli.mjs

dev-py:
	cd $(PY_DIR) && python -m github_sdk_api_component_usage_audit.main --help

# ── Lint ───────────────────────────────────────────────────────────

lint: lint-py

lint-py:
	cd $(PY_DIR) && python -m ruff check github_sdk_api_component_usage_audit/ __tests__/

# ── Clean ──────────────────────────────────────────────────────────

clean:
	rm -rf $(MJS_DIR)/node_modules $(MJS_DIR)/output
	rm -rf $(PY_DIR)/*.egg-info $(PY_DIR)/output $(PY_DIR)/__pycache__
	find $(PY_DIR) -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
