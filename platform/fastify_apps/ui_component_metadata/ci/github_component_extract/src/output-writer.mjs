/**
 * Output Writer
 * Writes extracted component data to JSON files.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

/**
 * Build the output payload for extracted components.
 * @param {object} params
 * @param {string} params.owner
 * @param {string} params.repo
 * @param {string} params.branch
 * @param {string} params.prependName
 * @param {Array<import('./component-extractor.mjs').ComponentDef>} params.components
 * @returns {object}
 */
export function buildOutputPayload({ owner, repo, branch, prependName, components }) {
  const repoFullName = `${owner}/${repo}`;
  const generatedAt = new Date().toISOString();

  const componentEntries = components.map(comp => ({
    name: `${prependName} :: ${comp.name}`,
    description: comp.description || `Extracted from ${repoFullName} (${branch}) at ${comp.filePath}`,
    taxonomy_level: comp.taxonomyLevel,
    status: 'draft',
    aliases: [comp.name],
    directives: `Source: https://github.com/${repoFullName}/blob/${branch}/${comp.filePath}`,
    created_by: 'github_component_extract',
    tag_names: ['extracted', repoFullName, branch],
    few_shot_examples: [],
    input_schema: {},
    output_schema: null,
    lifecycle_config: {},
    interactions: [],
    service_dependencies: [],
    composition_rules: {},
  }));

  return {
    metadata: {
      tool: 'github_component_extract',
      version: '0.1.0',
      generatedAt,
      source: {
        repo: repoFullName,
        branch,
        url: `https://github.com/${repoFullName}/tree/${branch}`,
      },
      prependName,
      totalComponents: componentEntries.length,
    },
    components: componentEntries,
  };
}

/**
 * Write output payload to a JSON file.
 * @param {object} payload
 * @param {string} outputDir
 * @param {string} filename
 * @returns {string} Path to written file
 */
export function writeOutputFile(payload, outputDir, filename) {
  const outPath = resolve(outputDir, filename);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf-8');
  return outPath;
}
