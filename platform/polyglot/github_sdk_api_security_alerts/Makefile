# ───────────────────────────────────────────────────────────────────
# GitHub SDK API Security Alerts — Polyglot Makefile
# ───────────────────────────────────────────────────────────────────

MJS_DIR := mjs

.PHONY: install install-mjs \
        test test-mjs \
        dev dev-mjs \
        clean

# ── Install ────────────────────────────────────────────────────────

install: install-mjs

install-mjs:
	cd $(MJS_DIR) && pnpm install

# ── Test ───────────────────────────────────────────────────────────

test: test-mjs

test-mjs:
	@echo "No mjs tests yet"

# ── Dev / Run ──────────────────────────────────────────────────────

dev: dev-mjs

dev-mjs:
	@echo "This is a library module — no standalone entrypoint."

# ── Clean ──────────────────────────────────────────────────────────

clean:
	rm -rf $(MJS_DIR)/node_modules $(MJS_DIR)/output
