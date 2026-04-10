#!/bin/bash
# ============================================================================
# Project Generator - Interactive Mode
# ============================================================================
#
# Run without arguments to enter interactive mode with guided prompts.
# This is the recommended way for new users.
#
# ============================================================================

POLYNX="node /Users/Shared/autoload/mta-v800/packages_mjs/project-generator/dist/index.js"

# ----------------------------------------------------------------------------
# START INTERACTIVE MODE
# ----------------------------------------------------------------------------
# Running without arguments launches the interactive wizard:
#
#   1. Select project type (dropdown with 7 options)
#   2. Enter project name (with validation for kebab-case)
#   3. Optional: Add frontend (for backend projects)
#   4. Confirm creation
#   5. View post-creation instructions
#
$POLYNX

# Example interactive session:
# ┌  PolyNx Project Generator
# │
# ◆  What type of project do you want to create?
# │  ○ FastAPI Backend - Python REST API with FastAPI
# │  ● Fastify Backend - Node.js REST API with Fastify
# │  ○ React Frontend - React + Vite + Tailwind CSS
# │  ○ React Component Package - Reusable UI component
# │  ○ TypeScript Package - @internal/* package
# │  ○ Python Package - packages_py/* package
# │  ○ Health Check Provider - Add to provider_api_getters
# └
#
# ◆  What is the project name? (kebab-case)
# │  my-api-service
# └
#
# ◆  Create Fastify Backend 'app-my-api-service' in fastify_apps/?
# │  Yes / No
# └
#
# ◇  Project created successfully!
# │
# │  Next steps:
# │    cd /path/to/fastify_apps/app_my_api_service
# │    pnpm install
# │    pnpm dev
# │
# └  Happy coding!

# ----------------------------------------------------------------------------
# INTERACTIVE MODE WITH PRE-SELECTED TYPE
# ----------------------------------------------------------------------------
# You can also start interactive mode with a type pre-selected:
$POLYNX create fastify
# This skips the type selection and goes straight to name input

# ----------------------------------------------------------------------------
# NON-INTERACTIVE (DIRECT) MODE
# ----------------------------------------------------------------------------
# For scripting or when you know exactly what you want:
$POLYNX create fastify my-api --port 3000
