#!/bin/bash
# ============================================================================
# Project Generator - Naming Conventions
# ============================================================================
#
# The generator automatically handles naming conventions across languages.
# Input names should always be in kebab-case.
#
# ============================================================================

# ----------------------------------------------------------------------------
# AUTOMATIC NAME TRANSFORMATIONS
# ----------------------------------------------------------------------------
# When you create a project with name "my-awesome-service", the generator
# creates these variants for use in templates:
#
#   Input (kebab-case):     my-awesome-service
#
#   {{APP_NAME}}            my-awesome-service
#   {{APP_NAME_SHORT}}      my-awesome-service  (removes 'app-' prefix if present)
#   {{APP_NAME_PASCAL}}     MyAwesomeService
#   {{APP_NAME_CAMEL}}      myAwesomeService
#   {{APP_NAME_SNAKE}}      my_awesome_service
#   {{APP_NAME_UPPER_SNAKE}} MY_AWESOME_SERVICE
#   {{APP_NAME_TITLE}}      My Awesome Service

# ----------------------------------------------------------------------------
# APP PREFIX HANDLING
# ----------------------------------------------------------------------------
# For app types (fastapi, fastify, frontend), 'app-' prefix is auto-added:
#
#   polynx create fastify user-service
#   → Creates: app-user-service
#   → Directory: fastify_apps/app_user_service/
#
#   polynx create fastify app-user-service
#   → Creates: app-user-service (prefix not doubled)
#   → Directory: fastify_apps/app_user_service/

# ----------------------------------------------------------------------------
# PYTHON NAMING
# ----------------------------------------------------------------------------
# Python projects automatically convert to snake_case for directories:
#
#   polynx create py-package my-utils
#   → Directory: packages_py/my_utils/
#   → Package: my_utils
#   → Import: from my_utils import hello
#
#   polynx create fastapi data-service
#   → Directory: fastapi_apps/app_data_service/
#   → Package: app_data_service

# ----------------------------------------------------------------------------
# TEMPLATE PLACEHOLDERS
# ----------------------------------------------------------------------------
# Templates use these placeholders which get replaced during generation:
#
# In package.json.tmpl:
#   "name": "@internal/{{APP_NAME}}"
#
# In Python __init__.py.tmpl:
#   def hello() -> str:
#       return "Hello from {{APP_NAME_SNAKE}}!"
#
# In TypeScript index.ts.tmpl:
#   export class {{APP_NAME_PASCAL}}Client {
#       // ...
#   }
#
# In filenames (also replaced):
#   src/{{APP_NAME_SNAKE}}/__init__.py.tmpl
#   → src/my_utils/__init__.py

# ----------------------------------------------------------------------------
# VALIDATION RULES
# ----------------------------------------------------------------------------
# Project names must follow these rules:
#
#   ✓ Lowercase letters (a-z)
#   ✓ Numbers (0-9)
#   ✓ Single hyphens (-)
#   ✓ Must start with a letter
#   ✓ Must end with a letter or number
#
#   ✗ No uppercase letters
#   ✗ No underscores (use hyphens)
#   ✗ No consecutive hyphens (--)
#   ✗ No starting/ending with hyphens
#
# Reserved names (cannot use):
#   node_modules, dist, build, src, test, tests
#   lib, bin, docs, public, private, static
#   assets, config, scripts, utils, helpers
#   types, interfaces, models, services, components
