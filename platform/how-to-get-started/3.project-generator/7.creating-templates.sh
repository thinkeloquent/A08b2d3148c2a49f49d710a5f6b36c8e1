#!/bin/bash
# ============================================================================
# Project Generator - Creating and Registering Templates
# ============================================================================
#
# This guide explains how to create new templates and register them
# with the PolyNx project generator.
#
# Source Code Location:
#   /Users/Shared/autoload/mta-v800/packages_mjs/project-generator/
#
# ============================================================================

# ============================================================================
# PART 1: TEMPLATE DIRECTORY STRUCTURE
# ============================================================================
#
# Templates live in: src/templates/{template-name}/template/
#
# Example structure for a new "express-api" template:
#
#   src/templates/express-api/template/
#   ├── .gitignore                    # Copied as-is
#   ├── package.json.tmpl             # Processed for placeholders
#   ├── tsconfig.json                 # Copied as-is
#   ├── src/
#   │   ├── index.ts.tmpl             # Processed for placeholders
#   │   └── routes/
#   │       └── health.ts.tmpl
#   └── tests/
#       └── {{APP_NAME_SNAKE}}.test.ts.tmpl  # Placeholder in filename
#
# ============================================================================

# ============================================================================
# PART 2: FILE PROCESSING RULES
# ============================================================================
#
# 1. Files ending in .tmpl:
#    - Extension is REMOVED after processing
#    - All placeholders in content are replaced
#    - Example: package.json.tmpl → package.json
#
# 2. Files WITHOUT .tmpl:
#    - Placeholders in content are STILL replaced
#    - Filename stays the same
#    - Use for files like .gitignore, tsconfig.json
#
# 3. Directory names:
#    - Can contain placeholders
#    - Example: src/{{APP_NAME_SNAKE}}/ → src/my_project/
#
# 4. Skipped by default:
#    - Directories: node_modules, dist, venv, .git, __pycache__
#    - Files: .DS_Store, Thumbs.db, .gitkeep
#
# ============================================================================

# ============================================================================
# PART 3: AVAILABLE PLACEHOLDERS
# ============================================================================
#
# For a project named "my-cool-project":
#
# | Placeholder               | Value              | Description                |
# |---------------------------|--------------------|----------------------------|
# | {{APP_NAME}}              | my-cool-project    | Original kebab-case name   |
# | {{APP_NAME_SHORT}}        | cool-project       | Without 'app-' prefix      |
# | {{APP_NAME_PASCAL}}       | MyCoolProject      | PascalCase                 |
# | {{APP_NAME_CAMEL}}        | myCoolProject      | camelCase                  |
# | {{APP_NAME_SNAKE}}        | my_cool_project    | snake_case                 |
# | {{APP_NAME_TITLE}}        | My Cool Project    | Title Case with spaces     |
# | {{APP_NAME_UPPER_SNAKE}}  | MY_COOL_PROJECT    | UPPER_SNAKE_CASE           |
#
# Usage examples:
#
#   package.json.tmpl:
#     {
#       "name": "@internal/{{APP_NAME}}",
#       "description": "{{APP_NAME_TITLE}} package"
#     }
#
#   Python class:
#     class {{APP_NAME_PASCAL}}Config:
#         """Configuration for {{APP_NAME_TITLE}}."""
#         ENV_VAR = "{{APP_NAME_UPPER_SNAKE}}_API_KEY"
#
# ============================================================================

# ============================================================================
# PART 4: REGISTERING A NEW TEMPLATE
# ============================================================================
#
# File: src/generators/types.ts
#
# Step 1: Add to ProjectType union (near top of file):
# ----------------------------------------------------------------------------
#
#   export type ProjectType =
#     | 'fastapi'
#     | 'fastify'
#     | 'frontend'
#     | 'react-component'
#     | 'ts-package'
#     | 'py-package'
#     | 'health-check-provider'
#     | 'express-api';              // <-- Add your new type here
#
# Step 2: Add configuration to PROJECT_TYPE_CONFIGS:
# ----------------------------------------------------------------------------
#
#   export const PROJECT_TYPE_CONFIGS: Record<ProjectType, ProjectTypeConfig> = {
#     // ... existing configs ...
#
#     'express-api': {
#       type: 'express-api',
#       displayName: 'Express API',
#       description: 'Node.js REST API with Express framework',
#       targetDirectory: (rootDir, name) => `${rootDir}/express_apps/${name}`,
#       templatePath: 'express-api/template',
#       // Optional: allowExisting: true  (for multi-package templates)
#     },
#   };
#
# ============================================================================

# ============================================================================
# PART 5: ProjectTypeConfig INTERFACE
# ============================================================================
#
# interface ProjectTypeConfig {
#   type: ProjectType;              // Must match key in PROJECT_TYPE_CONFIGS
#   displayName: string;            // Human-readable name for CLI
#   description: string;            // Shown in list and help
#   targetDirectory: (
#     rootDir: string,              // Monorepo root path
#     name: string                  // Normalized project name
#   ) => string;                    // Returns full path for output
#   templatePath: string;           // Relative to src/templates/
#   allowExisting?: boolean;        // Default false; true for multi-package
# }
#
# ============================================================================

# ============================================================================
# PART 6: UPDATE CLI INTERACTIVE MODE
# ============================================================================
#
# File: src/cli/interactive.ts
#
# Find the PROJECT_TYPES array and add your new type:
#
#   const PROJECT_TYPES = [
#     { value: 'fastapi', label: 'FastAPI Backend' },
#     { value: 'fastify', label: 'Fastify Backend' },
#     { value: 'frontend', label: 'React Frontend' },
#     { value: 'react-component', label: 'React Component' },
#     { value: 'ts-package', label: 'TypeScript Package' },
#     { value: 'py-package', label: 'Python Package' },
#     { value: 'health-check-provider', label: 'Health Check Provider' },
#     { value: 'express-api', label: 'Express API' },  // <-- Add here
#   ];
#
# ============================================================================

# ============================================================================
# PART 7: COMPLETE EXAMPLE - Creating a "cli-tool" Template
# ============================================================================

# Step 1: Create template directory structure
# -------------------------------------------
mkdir -p src/templates/cli-tool/template/src
mkdir -p src/templates/cli-tool/template/bin

# Step 2: Create template files
# -------------------------------------------

# package.json.tmpl
cat > src/templates/cli-tool/template/package.json.tmpl << 'TEMPLATE'
{
  "name": "@internal/{{APP_NAME}}",
  "version": "1.0.0",
  "description": "{{APP_NAME_TITLE}} CLI tool",
  "type": "module",
  "bin": {
    "{{APP_NAME}}": "./bin/cli.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tsx": "^4.0.0"
  }
}
TEMPLATE

# src/index.ts.tmpl
cat > src/templates/cli-tool/template/src/index.ts.tmpl << 'TEMPLATE'
#!/usr/bin/env node
/**
 * {{APP_NAME_TITLE}}
 * CLI tool for {{APP_NAME_TITLE}} operations.
 */

export class {{APP_NAME_PASCAL}}CLI {
  run(args: string[]): void {
    console.log('{{APP_NAME_TITLE}} CLI');
    console.log('Arguments:', args);
  }
}

const cli = new {{APP_NAME_PASCAL}}CLI();
cli.run(process.argv.slice(2));
TEMPLATE

# .gitignore
cat > src/templates/cli-tool/template/.gitignore << 'TEMPLATE'
node_modules/
dist/
*.log
TEMPLATE

# Step 3: Register in types.ts
# -------------------------------------------
# Add to ProjectType union:
#   | 'cli-tool'
#
# Add to PROJECT_TYPE_CONFIGS:
#   'cli-tool': {
#     type: 'cli-tool',
#     displayName: 'CLI Tool',
#     description: 'Command-line tool with TypeScript',
#     targetDirectory: (rootDir, name) => `${rootDir}/packages_mjs/${name}`,
#     templatePath: 'cli-tool/template',
#   },

# Step 4: Update interactive.ts
# -------------------------------------------
# Add to PROJECT_TYPES array:
#   { value: 'cli-tool', label: 'CLI Tool' },

# Step 5: Rebuild the generator
# -------------------------------------------
cd /Users/Shared/autoload/mta-v800/packages_mjs/project-generator
pnpm build

# Step 6: Test your template
# -------------------------------------------
# $POLYNX create cli-tool my-tool

# ============================================================================
# PART 8: MULTI-PACKAGE TEMPLATES (Advanced)
# ============================================================================
#
# For templates that add files to EXISTING packages (like health-check-provider):
#
# 1. Set allowExisting: true in config
# 2. Set targetDirectory to return monorepo root: (rootDir) => rootDir
# 3. Structure template to match existing package paths:
#
#    health-check-provider/template/
#    ├── packages_py/existing_package/src/
#    │   └── {{APP_NAME_SNAKE}}.py.tmpl
#    └── packages_mjs/existing_package/src/
#        └── {{APP_NAME_SHORT}}.mjs.tmpl
#
# Files will be created directly in those existing packages.
#
# ============================================================================

# ============================================================================
# PART 9: KEY SOURCE FILES REFERENCE
# ============================================================================
#
# | File                          | Purpose                            |
# |-------------------------------|------------------------------------|
# | src/generators/types.ts       | Template registry & configs        |
# | src/generators/base.ts        | Core generation logic              |
# | src/core/template-engine.ts   | File copy & placeholder replacement|
# | src/core/naming-conventions.ts| Placeholder definitions            |
# | src/core/validators.ts        | Project name validation            |
# | src/cli/interactive.ts        | Interactive CLI prompts            |
# | src/cli/commands/create.ts    | Create command implementation      |
#
# ============================================================================

# ============================================================================
# PART 10: VALIDATION RULES FOR PROJECT NAMES
# ============================================================================
#
# Names must be kebab-case and follow these rules:
#   - Start with lowercase letter
#   - Only letters, numbers, and hyphens allowed
#   - No consecutive hyphens
#   - No trailing hyphens
#
# Reserved names (cannot be used):
#   node_modules, dist, build, src, test, tests, lib, bin, config, scripts
#
# ============================================================================
