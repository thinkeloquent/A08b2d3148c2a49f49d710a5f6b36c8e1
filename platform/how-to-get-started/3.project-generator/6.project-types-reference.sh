#!/bin/bash
# ============================================================================
# Project Generator - Project Types Reference
# ============================================================================
#
# Complete reference for all 7 supported project types.
#
# ============================================================================

POLYNX="node /Users/Shared/autoload/mta-v800/packages_mjs/project-generator/dist/index.js"

# ============================================================================
# 1. FASTAPI - Python REST API
# ============================================================================
# Description: Python backend using FastAPI framework
# Target Dir:  fastapi_apps/{name_snake}/
# Template:    fastapi-apps-simple/template
#
# Features:
#   - FastAPI with async support
#   - Poetry for dependency management
#   - Uvicorn ASGI server
#   - Health check endpoint
#   - Environment configuration
#
# Usage:
$POLYNX create fastapi my-api

# Post-generation:
#   cd fastapi_apps/app_my_api
#   poetry install
#   poetry run uvicorn app.main:app --reload --port 52000

# ============================================================================
# 2. FASTIFY - Node.js REST API
# ============================================================================
# Description: Node.js backend using Fastify framework
# Target Dir:  fastify_apps/{name_snake}/
# Template:    fastify-apps-simple/template
#
# Features:
#   - Fastify with TypeScript
#   - pnpm for package management
#   - Hot reload with tsx
#   - Health check endpoint
#   - Environment configuration
#
# Usage:
$POLYNX create fastify my-api

# Post-generation:
#   cd fastify_apps/app_my_api
#   pnpm install
#   pnpm dev

# ============================================================================
# 3. FRONTEND - React + Vite + Tailwind
# ============================================================================
# Description: React frontend application
# Target Dir:  frontend_apps/{name}/
# Template:    frontend-apps-simple/template
#
# Features:
#   - React 18+ with TypeScript
#   - Vite for fast dev/build
#   - Tailwind CSS for styling
#   - ESLint + Prettier
#
# Usage:
$POLYNX create frontend my-dashboard

# Post-generation:
#   cd frontend_apps/app-my-dashboard
#   pnpm install
#   pnpm dev

# ============================================================================
# 4. REACT-COMPONENT - Reusable UI Component
# ============================================================================
# Description: Publishable React component package
# Target Dir:  packages_mjs/{name}/
# Template:    react-ui-component/template
#
# Features:
#   - React component structure
#   - Storybook for development
#   - TypeScript types
#   - Build for npm publishing
#
# Usage:
$POLYNX create react-component my-button

# Post-generation:
#   cd packages_mjs/my-button
#   pnpm install
#   pnpm storybook

# ============================================================================
# 5. TS-PACKAGE - TypeScript Package
# ============================================================================
# Description: @internal/* scoped TypeScript package
# Target Dir:  packages_mjs/{name}/
# Template:    ts-package/template
#
# Features:
#   - TypeScript with ES2022
#   - @internal/{name} scope
#   - Vitest for testing
#   - Declaration files
#
# Usage:
$POLYNX create ts-package my-utils

# Post-generation:
#   cd packages_mjs/my-utils
#   pnpm install
#   pnpm build
#   pnpm test

# ============================================================================
# 6. PY-PACKAGE - Python Package
# ============================================================================
# Description: Python package for packages_py/
# Target Dir:  packages_py/{name_snake}/
# Template:    py-package/template
#
# Features:
#   - Poetry for package management
#   - Python 3.11+
#   - pytest for testing
#   - Type hints
#
# Usage:
$POLYNX create py-package my-utils

# Post-generation:
#   cd packages_py/my_utils
#   poetry install
#   poetry run pytest

# ============================================================================
# 7. HEALTH-CHECK-PROVIDER - Provider Integration
# ============================================================================
# Description: Add new provider to provider_api_getters
# Target Dir:  {monorepo_root}/ (adds to existing packages)
# Template:    health-check-provider/template
#
# Features:
#   - JavaScript API token class
#   - JavaScript health check provider
#   - Python API token class
#   - Python health check provider
#
# Usage:
$POLYNX create health-check-provider stripe

# Creates files in both JS and Python packages:
#   packages_mjs/provider_api_getters/src/api_token/stripe.mjs
#   packages_mjs/provider_api_getters/src/health_check/providers/stripe_health_check.mjs
#   packages_py/provider_api_getters/src/provider_api_getters/api_token/stripe.py
#   packages_py/provider_api_getters/src/provider_api_getters/health_check/providers/stripe_health_check.py

# Post-generation:
#   1. Update __init__.py exports in Python package
#   2. Update index.mjs exports in JS package
#   3. Run 'npm run rebuild' in packages_mjs/provider_api_getters
