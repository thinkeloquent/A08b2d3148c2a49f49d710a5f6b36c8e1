/**
 * @fileoverview Post-processing pipeline for search results.
 */

import { separateCodeText } from './code-text-separator.mjs';
import { detectComponentsMetadata, detectComponentsParse } from './component-detector.mjs';

/**
 * Post-process hybrid search results: code/text separation + component detection.
 *
 * @param {Array<[{metadata: Record<string, any>, pageContent?: string, page_content?: string}, number]>} results
 * @param {Object} [opts]
 * @param {string} [opts.codeMode='regex']
 * @param {string} [opts.componentMode='metadata']
 * @param {string[]} [opts.importPackages]
 * @returns {import('./types.mjs').PostProcessedResults}
 */
export function postProcessResults(results, opts = {}) {
  const { componentMode = 'metadata', importPackages } = opts;

  const components = componentMode === 'parse'
    ? detectComponentsParse(results, importPackages)
    : detectComponentsMetadata(results);

  const processed = results.map(([doc, score]) => {
    const content = (doc.pageContent || doc.page_content || '').slice(0, 500);
    const fileName = doc.metadata?.file_name || '';
    const sep = separateCodeText(content, fileName);

    return {
      content,
      codeParts: sep.codeParts,
      textParts: sep.textParts,
      metadata: doc.metadata || {},
      score,
    };
  });

  return { components, results: processed };
}
