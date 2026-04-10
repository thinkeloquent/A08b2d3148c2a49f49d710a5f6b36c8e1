/**
 * BDD Cucumber Extractor
 * Extracts Gherkin feature/scenario/step structures from .feature files.
 * Uses regex/line-based parsing (no AST needed).
 *
 * Node mapping:
 *   folder    -> Feature
 *   group     -> Scenario (AND logic -- all steps must pass)
 *   condition -> Step (keyword: step text)
 *
 * Metadata per condition:
 *   { keyword: 'Given' | 'When' | 'Then' | 'And' | 'But', stepText, examples }
 */

import { randomUUID } from 'node:crypto';

function makeFolder({ name, conditions = [], description = '' }) {
  return {
    id: randomUUID(),
    type: 'folder',
    name,
    enabled: true,
    description,
    conditions,
  };
}

function makeGroup({ name, logic = 'AND', conditions = [], description = '' }) {
  return {
    id: randomUUID(),
    type: 'group',
    name,
    logic,
    enabled: true,
    color: '#3B82F6',
    description,
    conditions,
  };
}

function makeCondition({ field, operator, value, description = '', metadata = null }) {
  return {
    id: randomUUID(),
    type: 'condition',
    field: field || 'unknown',
    operator: operator || 'step',
    value_type: 'value',
    value: String(value ?? ''),
    data_type: 'string',
    enabled: true,
    description,
    metadata,
  };
}

/**
 * Extract BDD structures from Gherkin .feature file content.
 * @param {string} source - Feature file content
 * @param {string} filePath - File path
 * @returns {{ rules: object[], functionRules: object[] }}
 */
export function extractBddCucumber(source, filePath) {
  const lines = source.split('\n');
  const features = [];
  let currentFeature = null;
  let currentScenario = null;
  let currentExamples = [];
  let inExamples = false;

  function flushScenario() {
    if (currentScenario && currentScenario.conditions.length > 0) {
      if (currentExamples.length > 0) {
        // Attach examples as metadata on the last step
        const lastStep = currentScenario.conditions[currentScenario.conditions.length - 1];
        if (lastStep.metadata) {
          lastStep.metadata.examples = currentExamples;
        }
      }
      if (currentFeature) {
        currentFeature.conditions.push(currentScenario);
      }
    }
    currentScenario = null;
    currentExamples = [];
    inExamples = false;
  }

  function flushFeature() {
    flushScenario();
    if (currentFeature && currentFeature.conditions.length > 0) {
      features.push(currentFeature);
    }
    currentFeature = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Feature
    const featureMatch = trimmed.match(/^Feature:\s*(.+)$/);
    if (featureMatch) {
      flushFeature();
      currentFeature = makeFolder({
        name: featureMatch[1].trim(),
        description: `Feature from ${filePath}`,
      });
      continue;
    }

    // Background
    const bgMatch = trimmed.match(/^Background:\s*(.*)$/);
    if (bgMatch) {
      flushScenario();
      currentScenario = makeGroup({
        name: `Background${bgMatch[1] ? ': ' + bgMatch[1].trim() : ''}`,
        logic: 'AND',
        description: 'Background steps run before each scenario',
      });
      inExamples = false;
      continue;
    }

    // Scenario / Scenario Outline
    const scenarioMatch = trimmed.match(/^(?:Scenario Outline|Scenario):\s*(.+)$/);
    if (scenarioMatch) {
      flushScenario();
      currentScenario = makeGroup({
        name: scenarioMatch[1].trim(),
        logic: 'AND',
        description: trimmed.startsWith('Scenario Outline') ? 'Scenario Outline (data-driven)' : 'Scenario',
      });
      inExamples = false;
      continue;
    }

    // Examples table header
    if (trimmed.match(/^Examples:\s*$/i)) {
      inExamples = true;
      currentExamples = [];
      continue;
    }

    // Examples table row
    if (inExamples && trimmed.startsWith('|')) {
      currentExamples.push(trimmed);
      continue;
    }

    // Steps: Given, When, Then, And, But
    const stepMatch = trimmed.match(/^(Given|When|Then|And|But)\s+(.+)$/);
    if (stepMatch && currentScenario) {
      inExamples = false;
      const keyword = stepMatch[1];
      const stepText = stepMatch[2].trim();

      currentScenario.conditions.push(makeCondition({
        field: keyword,
        operator: 'step',
        value: stepText,
        description: trimmed,
        metadata: { keyword, stepText, examples: null },
      }));
      continue;
    }
  }

  flushFeature();

  if (features.length === 0) {
    return { rules: [], functionRules: [] };
  }

  return { rules: features, functionRules: [] };
}
