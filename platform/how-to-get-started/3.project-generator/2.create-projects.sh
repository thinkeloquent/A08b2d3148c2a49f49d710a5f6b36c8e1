#!/bin/bash
# ============================================================================
# Project Generator - Creating Projects
# ============================================================================
#
# Usage: node packages_mjs/project-generator/dist/index.js create <type> <name> [options]
#
# Arguments:
#   type    Project type (fastapi, fastify, frontend, react-component, ts-package, py-package, health-check-provider)
#   name    Project name in kebab-case (e.g., my-project-name)
#
# Options:
#   --target-dir <path>   Override the output directory
#   --with-frontend       Include a frontend app (for backend projects)
#   --port <port>         Server port (for backend projects)
#
# IMPORTANT: Run from monorepo root (/Users/Shared/autoload/mta-v800)
#
# ============================================================================

polynx() { node packages_mjs/project-generator/dist/index.js "$@"; }

# ----------------------------------------------------------------------------
# CREATE A TYPESCRIPT PACKAGE
# ----------------------------------------------------------------------------
# Creates: packages_mjs/my-utils/
# Includes: package.json, tsconfig.json, src/index.ts
polynx create ts-package my-utils

# Next steps:
#   cd packages_mjs/my-utils
#   pnpm install
#   pnpm build
#   pnpm test

# ----------------------------------------------------------------------------
# CREATE A PYTHON PACKAGE
# ----------------------------------------------------------------------------
# Creates: packages_py/my_py_utils/ (name converted to snake_case)
# Includes: pyproject.toml, src/my_py_utils/__init__.py, tests/
polynx create py-package my-py-utils

# Next steps:
#   cd packages_py/my_py_utils
#   poetry install
#   poetry run pytest

# ----------------------------------------------------------------------------
# CREATE A FASTIFY BACKEND
# ----------------------------------------------------------------------------
# Creates: fastify_apps/app_user_service/ (auto-prefixes 'app-', converts to snake_case)
# Includes: Full Fastify REST API setup
polynx create fastify user-service

# Next steps:
#   cd fastify_apps/app_user_service
#   pnpm install
#   pnpm dev

# ----------------------------------------------------------------------------
# CREATE A FASTAPI BACKEND
# ----------------------------------------------------------------------------
# Creates: fastapi_apps/app_data_service/
# Includes: Full FastAPI REST API setup with Poetry
polynx create fastapi data-service

# Next steps:
#   cd fastapi_apps/app_data_service
#   poetry install
#   poetry run uvicorn app.main:app --reload --port 52000

# ----------------------------------------------------------------------------
# CREATE A REACT FRONTEND
# ----------------------------------------------------------------------------
# Creates: frontend_apps/app-dashboard/
# Includes: React + Vite + Tailwind CSS setup
polynx create frontend dashboard

# Next steps:
#   cd frontend_apps/app-dashboard
#   pnpm install
#   pnpm dev

# ----------------------------------------------------------------------------
# CREATE A REACT COMPONENT PACKAGE
# ----------------------------------------------------------------------------
# Creates: packages_mjs/my-button/
# Includes: React component with Storybook
polynx create react-component my-button

# Next steps:
#   cd packages_mjs/my-button
#   pnpm install
#   pnpm storybook

# ----------------------------------------------------------------------------
# CREATE A HEALTH CHECK PROVIDER
# ----------------------------------------------------------------------------
# Creates files in existing provider_api_getters packages (JS + Python)
# This is a special type that adds files to existing directories
polynx create health-check-provider stripe

# Creates:
#   packages_mjs/provider_api_getters/src/api_token/stripe.mjs
#   packages_mjs/provider_api_getters/src/health_check/providers/stripe_health_check.mjs
#   packages_py/provider_api_getters/src/provider_api_getters/api_token/stripe.py
#   packages_py/provider_api_getters/src/provider_api_getters/health_check/providers/stripe_health_check.py
#
# Next steps:
#   1. Update packages_py/.../provider_api_getters/__init__.py to export the new Token class
#   2. Update packages_mjs/.../index.mjs to export the new Token class
#   3. Run 'npm run rebuild' in packages_mjs/provider_api_getters

# ----------------------------------------------------------------------------
# USING --target-dir TO OVERRIDE OUTPUT LOCATION
# ----------------------------------------------------------------------------
# Create a frontend project in a custom directory:
polynx create frontend test-integration --target-dir fastapi_apps/test_integration

# Create a ts-package in a custom location:
polynx create ts-package my-lib --target-dir libs/my-lib
