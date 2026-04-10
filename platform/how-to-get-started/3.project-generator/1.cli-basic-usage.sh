#!/bin/bash
# ============================================================================
# Project Generator (polynx) - Basic CLI Usage
# ============================================================================
#
# The project generator CLI tool scaffolds new projects in the polyglot monorepo.
# It supports 7 project types and 4 preset tool integrations.
#
# Location: packages_mjs/project-generator
# Binary: polynx (after build)
#
# ============================================================================

# Navigate to monorepo root
cd /Users/Shared/autoload/mta-v800

# ----------------------------------------------------------------------------
# SETUP: Build the project generator (one-time)
# ----------------------------------------------------------------------------
cd packages_mjs/project-generator
pnpm install
pnpm build
cd ../..

# ----------------------------------------------------------------------------
# OPTION 1: Run via node directly
# ----------------------------------------------------------------------------
node packages_mjs/project-generator/dist/index.js --help

# ----------------------------------------------------------------------------
# OPTION 2: Link globally for 'polynx' command (optional)
# ----------------------------------------------------------------------------
# cd packages_mjs/project-generator && pnpm link --global

# ----------------------------------------------------------------------------
# VIEW AVAILABLE TEMPLATES AND PRESETS
# ----------------------------------------------------------------------------
node packages_mjs/project-generator/dist/index.js list

# Output:
# Project Templates:
#   fastapi            Python REST API with FastAPI
#   fastify            Node.js REST API with Fastify
#   frontend           React + Vite + Tailwind CSS
#   react-component    Reusable React UI component package
#   ts-package         @internal/* TypeScript package
#   py-package         packages_py/* Python package
#   health-check-provider Add provider to provider_api_getters
#
# Presets:
#   degit              Clone a repository template
#   vite               Create a Vite project
#   nx-workspace       Create an Nx workspace
#   nx                 Add Nx to existing project

# ----------------------------------------------------------------------------
# VIEW HELP FOR SPECIFIC COMMANDS
# ----------------------------------------------------------------------------
node packages_mjs/project-generator/dist/index.js help create
node packages_mjs/project-generator/dist/index.js help init
