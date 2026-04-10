/**
 * Report Builder
 *
 * Constructs the final report object from collected usage results.
 */

import {
  REPORT_VERSION,
  TOOL_NAME,
  REPORT_DESCRIPTION,
  REPORT_PLAIN_ENGLISH,
  REPORT_FORMULA,
  buildCriteria,
} from "../report-metadata.mjs";

/**
 * Build the final audit report.
 *
 * @param {object} config - Normalized configuration.
 * @param {object[]} usages - Array of { repository_name, file_path, code_snippet }.
 * @param {object[]} references - Array of { repository_name, file_path, reference }.
 * @param {object} stats - Run statistics.
 * @param {number} stats.totalSearchResults - Total search results processed.
 * @param {number} stats.reposValidated - Repos that passed validation.
 * @param {number} stats.reposSkipped - Repos skipped (archived or low stars).
 * @param {number} stats.filesProcessed - Files with raw content fetched.
 * @param {boolean} stats.cancelled - Whether the run was cancelled via SIGINT.
 * @returns {object} Complete report object.
 */
export function buildReport(config, usages, references, stats) {
  return {
    metadata: {
      tool: TOOL_NAME,
      version: REPORT_VERSION,
      description: REPORT_DESCRIPTION,
      plainEnglish: REPORT_PLAIN_ENGLISH,
      formula: REPORT_FORMULA,
      criteria: buildCriteria(config),
      componentName: config.componentName,
      generatedAt: new Date().toISOString(),
    },
    summary: {
      totalUsagesFound: usages.length,
      totalReferencesFound: references.length,
      totalSearchResults: stats.totalSearchResults,
      reposValidated: stats.reposValidated,
      reposSkipped: stats.reposSkipped,
      filesProcessed: stats.filesProcessed,
      cancelled: stats.cancelled,
    },
    usages,
    references,
  };
}
