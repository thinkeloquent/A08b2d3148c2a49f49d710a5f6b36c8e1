#!/bin/bash
# ============================================================================
# Project Generator - Preset Tool Integration
# ============================================================================
#
# Presets are wrappers around popular scaffolding tools.
# Use 'polynx init <preset> [args...]' to run them.
#
# ============================================================================

POLYNX="node /Users/Shared/autoload/mta-v800/packages_mjs/project-generator/dist/index.js"

# ----------------------------------------------------------------------------
# DEGIT - Clone repository templates
# ----------------------------------------------------------------------------
# Uses npx degit to clone a repo without git history
# Great for using community templates

$POLYNX init degit user/repo my-project
$POLYNX init degit sveltejs/template my-svelte-app
$POLYNX init degit vitejs/vite/packages/create-vite/template-react my-react

# ----------------------------------------------------------------------------
# VITE - Create Vite projects
# ----------------------------------------------------------------------------
# Uses npm create vite@latest
# Interactive template selection

$POLYNX init vite my-vite-app
$POLYNX init vite my-react-app --template react-ts
$POLYNX init vite my-vue-app --template vue

# Available Vite templates:
#   vanilla, vanilla-ts
#   vue, vue-ts
#   react, react-ts, react-swc, react-swc-ts
#   preact, preact-ts
#   lit, lit-ts
#   svelte, svelte-ts
#   solid, solid-ts
#   qwik, qwik-ts

# ----------------------------------------------------------------------------
# NX WORKSPACE - Create new Nx monorepo
# ----------------------------------------------------------------------------
# Uses npx create-nx-workspace@latest
# For creating new Nx-powered monorepos

$POLYNX init nx-workspace my-org
$POLYNX init nx-workspace my-org --preset=react
$POLYNX init nx-workspace my-org --preset=next

# Available Nx presets:
#   apps, react, vue, angular, next, nuxt
#   nest, express, react-native, expo
#   ts (for TypeScript packages)

# ----------------------------------------------------------------------------
# NX INIT - Add Nx to existing project
# ----------------------------------------------------------------------------
# Uses npx nx@latest init
# Converts existing project to use Nx

cd /path/to/existing-project
$POLYNX init nx

# This adds:
#   - nx.json configuration
#   - Task caching
#   - Dependency graph
#   - Affected commands
