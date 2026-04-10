import { extractExports, extractImports, ImportExtractor } from '../src/index.js';

// ── Example 1: Quick extraction using convenience functions ─────────────────

const sampleImports = `
import React from 'react';
import { useState, useEffect } from 'react';
import * as path from 'node:path';
import type { FC } from 'react';
import './styles.css';
`;

console.log('=== Import Extraction ===');
const imports = extractImports(sampleImports);
for (const [mod, specifiers] of imports) {
  console.log(`  Module: ${mod}`);
  if (specifiers.length === 0) {
    console.log('    (side-effect only)');
  } else {
    for (const spec of specifiers) {
      console.log(`    - ${spec}`);
    }
  }
}

// ── Example 2: Export extraction ────────────────────────────────────────────

const sampleExports = `
export default function App() {}
export const VERSION = '1.0.0';
export function helper() {}
export { foo, bar as baz };
export * from './utils';
export * as helpers from './helpers';
`;

console.log('\n=== Export Extraction ===');
const exports_ = extractExports(sampleExports);
for (const [mod, specifiers] of exports_) {
  console.log(`  Module: ${mod}`);
  for (const spec of specifiers) {
    console.log(`    - ${spec}`);
  }
}

// ── Example 3: Using the class directly ─────────────────────────────────────

console.log('\n=== Using ImportExtractor class ===');
const extractor = new ImportExtractor();

const mixedCode = `
import lodash from 'lodash';
export { debounce } from 'lodash';
export default class MyComponent {}
`;

const importResults = extractor.extractImports(mixedCode);
const exportResults = extractor.extractExports(mixedCode);

console.log('Imports:', JSON.stringify(importResults, null, 2));
console.log('Exports:', JSON.stringify(exportResults, null, 2));
