#!/usr/bin/env node

/**
 * validate-manifest CLI
 *
 * Validates app.manifest.yaml files against the app-manifest JSON schema.
 * Usage: node validate-manifest.mjs <path-to-manifest> [--all <dir>]
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument } from 'yaml';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const schemaPath = join(__dirname, 'app-manifest.schema.json');

function loadSchema() {
  return JSON.parse(readFileSync(schemaPath, 'utf-8'));
}

function loadManifest(filePath) {
  const raw = readFileSync(filePath, 'utf-8');
  const doc = parseDocument(raw);
  if (doc.errors.length > 0) {
    throw new Error(`YAML parse error in ${filePath}: ${doc.errors[0].message}`);
  }
  return doc.toJSON();
}

function validateType(value, schema, path) {
  const errors = [];

  if (schema.type === 'string') {
    if (typeof value !== 'string') {
      errors.push({ path, message: `Expected string, got ${typeof value}` });
      return errors;
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push({ path, message: `Does not match pattern: ${schema.pattern}` });
    }
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push({ path, message: `Must be one of: ${schema.enum.join(', ')}` });
    }
    if (schema.const !== undefined && value !== schema.const) {
      errors.push({ path, message: `Must be "${schema.const}"` });
    }
  } else if (schema.type === 'integer' || schema.type === 'number') {
    if (typeof value !== 'number') {
      errors.push({ path, message: `Expected number, got ${typeof value}` });
      return errors;
    }
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push({ path, message: `Must be >= ${schema.minimum}` });
    }
  } else if (schema.type === 'boolean') {
    if (typeof value !== 'boolean') {
      errors.push({ path, message: `Expected boolean, got ${typeof value}` });
    }
  } else if (schema.type === 'array') {
    if (!Array.isArray(value)) {
      errors.push({ path, message: `Expected array, got ${typeof value}` });
      return errors;
    }
    if (schema.uniqueItems) {
      const seen = new Set();
      for (const item of value) {
        const key = JSON.stringify(item);
        if (seen.has(key)) {
          errors.push({ path, message: `Duplicate item: ${key}` });
        }
        seen.add(key);
      }
    }
    if (schema.items) {
      value.forEach((item, i) => {
        errors.push(...validateType(item, schema.items, `${path}[${i}]`));
      });
    }
  } else if (schema.type === 'object') {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      errors.push({ path, message: `Expected object, got ${Array.isArray(value) ? 'array' : typeof value}` });
      return errors;
    }
    errors.push(...validateObject(value, schema, path));
  }

  return errors;
}

function validateObject(data, schema, basePath = '') {
  const errors = [];

  if (schema.required) {
    for (const field of schema.required) {
      if (data[field] === undefined || data[field] === null) {
        errors.push({ path: `${basePath}.${field}`, message: 'Required field is missing' });
      }
    }
  }

  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      const fieldPath = basePath ? `${basePath}.${key}` : key;
      if (data[key] !== undefined && data[key] !== null) {
        errors.push(...validateType(data[key], propSchema, fieldPath));
      }
    }

    if (schema.additionalProperties === false) {
      for (const key of Object.keys(data)) {
        if (!schema.properties[key]) {
          const fieldPath = basePath ? `${basePath}.${key}` : key;
          errors.push({ path: fieldPath, message: `Unknown property "${key}"` });
        }
      }
    }
  }

  return [...new Set(errors.map(JSON.stringify))].map(JSON.parse);
}

function validateManifest(filePath) {
  const schema = loadSchema();
  const manifest = loadManifest(filePath);
  const errors = validateType(manifest, schema, '$');
  return { file: filePath, manifest, errors, valid: errors.length === 0 };
}

function findManifests(dir) {
  const results = [];
  function walk(d) {
    for (const entry of readdirSync(d)) {
      const full = join(d, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else if (entry === 'app.manifest.yaml') {
        results.push(full);
      }
    }
  }
  walk(dir);
  return results;
}

function formatErrors(result) {
  const lines = [];
  const status = result.valid ? '\x1b[32m✓ VALID\x1b[0m' : '\x1b[31m✗ INVALID\x1b[0m';
  lines.push(`${status}  ${result.file}`);
  if (!result.valid) {
    for (const err of result.errors) {
      lines.push(`  \x1b[31m->\x1b[0m ${err.path}: ${err.message}`);
    }
  }
  return lines.join('\n');
}

// CLI entry
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: validate-manifest <path> [--all <directory>]');
  console.log('  <path>          Path to a single app.manifest.yaml');
  console.log('  --all <dir>     Validate all app.manifest.yaml files in directory tree');
  process.exit(0);
}

let files = [];
const allIdx = args.indexOf('--all');
if (allIdx !== -1) {
  const dir = args[allIdx + 1] || '.';
  files = findManifests(resolve(dir));
  if (files.length === 0) {
    console.log(`No app.manifest.yaml files found in ${resolve(dir)}`);
    process.exit(0);
  }
} else {
  files = [resolve(args[0])];
}

let hasErrors = false;
const results = [];

for (const file of files) {
  try {
    const result = validateManifest(file);
    results.push(result);
    if (!result.valid) hasErrors = true;
  } catch (err) {
    results.push({ file, errors: [{ path: '$', message: err.message }], valid: false });
    hasErrors = true;
  }
}

console.log('\n' + results.map(formatErrors).join('\n\n'));
console.log(`\n${results.length} manifest(s) checked: ${results.filter(r => r.valid).length} valid, ${results.filter(r => !r.valid).length} invalid\n`);

process.exit(hasErrors ? 1 : 0);
