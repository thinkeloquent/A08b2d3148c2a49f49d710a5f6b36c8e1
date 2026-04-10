/**
 * Extractor Registry
 * Central registry for all graph type extractors.
 * Each extractor implements: { extract(source, filePath, lang) => RuleItem[] }
 */

import { extractRules } from '../rule-extractor.mjs';
import { extractImportDependency } from './import-dependency.mjs';
import { extractVariableDefinitions } from './variable-definitions.mjs';
import { extractBddCucumber } from './bdd-cucumber.mjs';

/**
 * Registry of graph type extractors.
 * Key = graph_type string, Value = { extract(source, filePath, lang) => { rules, functionRules } }
 */
const extractors = new Map();

// conditional_logic — existing extractor (JS/TS via acorn-loose, Python via regex)
extractors.set('conditional_logic', {
  name: 'Conditional Logic',
  languages: ['js', 'ts', 'jsx', 'tsx', 'mjs', 'py'],
  extract: (source, filePath, _lang) => extractRules(source, filePath),
});

// import_dependency — module import/export analysis
extractors.set('import_dependency', {
  name: 'Import Dependency',
  languages: ['js', 'ts', 'jsx', 'tsx', 'mjs', 'py'],
  extract: (source, filePath, lang) => extractImportDependency(source, filePath, lang),
});

// variable_definitions — variable declaration analysis
extractors.set('variable_definitions', {
  name: 'Variable Definitions',
  languages: ['js', 'ts', 'jsx', 'tsx', 'mjs'],
  extract: (source, filePath, lang) => extractVariableDefinitions(source, filePath, lang),
});

// bdd_cucumber — Gherkin feature file analysis
extractors.set('bdd_cucumber', {
  name: 'BDD Cucumber',
  languages: ['feature'],
  extract: (source, filePath, _lang) => extractBddCucumber(source, filePath),
});

/**
 * Get an extractor by graph type.
 * @param {string} graphType
 * @returns {{ name: string, languages: string[], extract: Function } | undefined}
 */
export function getExtractor(graphType) {
  return extractors.get(graphType);
}

/**
 * Get all registered graph types.
 * @returns {string[]}
 */
export function getRegisteredTypes() {
  return [...extractors.keys()];
}

/**
 * Check if a file extension is supported by a graph type.
 * @param {string} graphType
 * @param {string} filePath
 * @returns {boolean}
 */
export function isSupported(graphType, filePath) {
  const extractor = extractors.get(graphType);
  if (!extractor) return false;
  const ext = filePath.split('.').pop()?.toLowerCase();
  return extractor.languages.includes(ext);
}

export { extractors };
