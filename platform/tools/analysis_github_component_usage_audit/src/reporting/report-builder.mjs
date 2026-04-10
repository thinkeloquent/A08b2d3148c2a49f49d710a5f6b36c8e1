import {
  REPORT_VERSION,
  TOOL_NAME,
  REPORT_DESCRIPTION,
  REPORT_INSIGHT,
  REPORT_ANALYSIS,
  REPORT_IMPROVES,
  REPORT_PLAIN_ENGLISH,
  REPORT_FORMULA,
  buildCriteria,
} from "../report-metadata.mjs";

/**
 * Build the full report object for component usage audit.
 * @param {object} config - Validated config
 * @param {object[]} usages - Array of { repository_name, file_path, code_snippet }
 * @param {object[]} references - Array of { repository_name, file_path, reference }
 * @param {object} stats - Run statistics
 * @param {{ totalFetched: number, cancelled: boolean }} state
 * @returns {object} complete report
 */
export function buildReport(config, usages, references, stats, { totalFetched, cancelled }) {
  return {
    metadata: {
      reportVersion: REPORT_VERSION,
      toolName: TOOL_NAME,
      description: REPORT_DESCRIPTION,
      insight: REPORT_INSIGHT,
      analysis: REPORT_ANALYSIS,
      improves: REPORT_IMPROVES,
      plainEnglish: REPORT_PLAIN_ENGLISH,
      componentName: config.componentName,
      generatedAt: new Date().toISOString(),
      metaTags: config.metaTags || {},
      inputs: {
        componentName: config.componentName,
        minStars: config.minStars,
        maxPages: config.maxPages,
        minFileSize: config.minFileSize,
        format: config.format,
        outputDir: config.outputDir,
        filename: config.filename,
        totalRecords: config.totalRecords,
        delay: config.delay,
        cancelled,
      },
      criteria: buildCriteria(config),
      formula: REPORT_FORMULA,
    },
    summary: {
      totalUsagesFound: usages.length,
      totalReferencesFound: references.length,
      totalSearchResults: stats.totalSearchResults,
      reposValidated: stats.reposValidated,
      reposSkipped: stats.reposSkipped,
      filesProcessed: stats.filesProcessed,
      totalFetched,
      cancelled,
    },
    usages,
    references,
  };
}
