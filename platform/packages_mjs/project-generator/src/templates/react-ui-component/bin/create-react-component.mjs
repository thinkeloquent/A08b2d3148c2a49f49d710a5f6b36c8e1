#!/usr/bin/env node

/**
 * Create React UI Component - Scaffolding CLI
 *
 * Creates a new reusable React UI component package.
 *
 * Usage:
 *   node tools/project-templates/react-ui-component/bin/create-react-component.mjs <component-name>
 *   make -f Makefile.create-project react-component APP=my-component
 *
 * Example:
 *   make -f Makefile.create-project react-component APP=button-group
 *   → Creates packages-mjs/button-group/
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =============================================================================
// Configuration
// =============================================================================

const TEMPLATE_DIR = resolve(__dirname, '../template');
const TARGET_BASE_DIR = resolve(__dirname, '../../../../packages-mjs');

// Placeholder patterns used in template files
const PLACEHOLDERS = {
  APP_NAME: '{{APP_NAME}}',                     // kebab-case: my-component
  APP_NAME_PASCAL: '{{APP_NAME_PASCAL}}',       // PascalCase: MyComponent
  APP_NAME_CAMEL: '{{APP_NAME_CAMEL}}',         // camelCase: myComponent
  APP_NAME_TITLE: '{{APP_NAME_TITLE}}',         // Title Case: My Component
  APP_NAME_UPPER_SNAKE: '{{APP_NAME_UPPER_SNAKE}}', // UPPER_SNAKE: MY_COMPONENT
};

// =============================================================================
// Utilities
// =============================================================================

/**
 * Converts kebab-case to PascalCase
 * @param {string} str - kebab-case string
 * @returns {string} PascalCase string
 */
function toPascalCase(str) {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Converts kebab-case to camelCase
 * @param {string} str - kebab-case string
 * @returns {string} camelCase string
 */
function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Converts kebab-case to Title Case
 * @param {string} str - kebab-case string
 * @returns {string} Title Case string
 */
function toTitleCase(str) {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Converts kebab-case to UPPER_SNAKE_CASE
 * @param {string} str - kebab-case string
 * @returns {string} UPPER_SNAKE_CASE string
 */
function toUpperSnakeCase(str) {
  return str.replace(/-/g, '_').toUpperCase();
}

/**
 * Converts snake_case to kebab-case
 * @param {string} str - snake_case string
 * @returns {string} kebab-case string
 */
function toKebabCase(str) {
  return str.replace(/_/g, '-');
}

/**
 * Validates component name format (kebab-case or snake_case)
 * @param {string} name - Component name to validate
 * @returns {{ valid: boolean, error?: string }}
 */
function validateComponentName(name) {
  if (!name) {
    return { valid: false, error: 'Component name is required' };
  }

  // Accept both kebab-case and snake_case
  if (!/^[a-z][a-z0-9_-]*[a-z0-9]$/.test(name) && !/^[a-z]$/.test(name)) {
    return {
      valid: false,
      error:
        'Component name must be kebab-case or snake_case (lowercase letters, numbers, hyphens, or underscores, starting with a letter)',
    };
  }

  if (name.includes('--') || name.includes('__')) {
    return { valid: false, error: 'Component name cannot contain consecutive hyphens or underscores' };
  }

  return { valid: true };
}

/**
 * Replaces all placeholders in content
 * @param {string} content - File content
 * @param {string} componentName - Component name in kebab-case
 * @returns {string} Content with placeholders replaced
 */
function replacePlaceholders(content, componentName) {
  return content
    .replace(new RegExp(PLACEHOLDERS.APP_NAME_PASCAL, 'g'), toPascalCase(componentName))
    .replace(new RegExp(PLACEHOLDERS.APP_NAME_CAMEL, 'g'), toCamelCase(componentName))
    .replace(new RegExp(PLACEHOLDERS.APP_NAME_TITLE, 'g'), toTitleCase(componentName))
    .replace(new RegExp(PLACEHOLDERS.APP_NAME_UPPER_SNAKE, 'g'), toUpperSnakeCase(componentName))
    .replace(new RegExp(PLACEHOLDERS.APP_NAME, 'g'), componentName);
}

/**
 * Recursively copies template directory with placeholder replacement
 * @param {string} srcDir - Source directory
 * @param {string} destDir - Destination directory
 * @param {string} componentName - Component name for placeholder replacement
 */
function copyTemplate(srcDir, destDir, componentName) {
  const entries = readdirSync(srcDir);

  for (const entry of entries) {
    const srcPath = join(srcDir, entry);
    const stat = statSync(srcPath);

    // Handle .tmpl extension (remove it in destination)
    let destEntry = entry;
    if (entry.endsWith('.tmpl')) {
      destEntry = entry.slice(0, -5);
    }

    // Replace placeholders in filename
    destEntry = replacePlaceholders(destEntry, componentName);

    const destPath = join(destDir, destEntry);

    if (stat.isDirectory()) {
      // Skip node_modules and dist directories
      if (entry === 'node_modules' || entry === 'dist') {
        continue;
      }
      mkdirSync(destPath, { recursive: true });
      copyTemplate(srcPath, destPath, componentName);
    } else {
      // Read file content
      const content = readFileSync(srcPath, 'utf-8');
      // Replace placeholders and write
      const processedContent = replacePlaceholders(content, componentName);
      writeFileSync(destPath, processedContent);
      console.log(`  Created: ${relative(TARGET_BASE_DIR, destPath)}`);
    }
  }
}

// =============================================================================
// Main
// =============================================================================

function main() {
  const args = process.argv.slice(2);
  let componentName = args[0];

  console.log('\n Create React UI Component\n');

  // Validate component name
  const validation = validateComponentName(componentName);
  if (!validation.valid) {
    console.error(`Error: ${validation.error}\n`);
    console.log('Usage: make -f Makefile.create-project react-component APP=<component-name>');
    console.log('Example: make -f Makefile.create-project react-component APP=button-group\n');
    process.exit(1);
  }

  // Convert snake_case to kebab-case for consistency
  if (componentName.includes('_')) {
    const kebabName = toKebabCase(componentName);
    console.log(`Converting to kebab-case: ${componentName} -> ${kebabName}\n`);
    componentName = kebabName;
  }

  const targetDir = join(TARGET_BASE_DIR, componentName);

  // Check if target directory already exists
  if (existsSync(targetDir)) {
    console.error(`Error: Directory already exists: packages-mjs/${componentName}\n`);
    process.exit(1);
  }

  // Check if template directory exists
  if (!existsSync(TEMPLATE_DIR)) {
    console.error(`Error: Template directory not found: ${TEMPLATE_DIR}\n`);
    process.exit(1);
  }

  console.log(`Creating new React UI component: ${componentName}`);
  console.log(`   Target: packages-mjs/${componentName}/\n`);

  // Create target directory
  mkdirSync(targetDir, { recursive: true });

  // Copy template with placeholder replacement
  console.log('Generating files:\n');
  copyTemplate(TEMPLATE_DIR, targetDir, componentName);

  console.log('\nReact UI component created successfully!\n');
  console.log('Next steps:\n');
  console.log(`   1. cd packages-mjs/${componentName}`);
  console.log('   2. pnpm install');
  console.log('   3. npm run dev   # Watch mode for development');
  console.log('   4. npm run build # Build for production\n');
  console.log(`Import in other packages: import { ${toPascalCase(componentName)} } from '@internal/${componentName}';\n`);
}

main();
