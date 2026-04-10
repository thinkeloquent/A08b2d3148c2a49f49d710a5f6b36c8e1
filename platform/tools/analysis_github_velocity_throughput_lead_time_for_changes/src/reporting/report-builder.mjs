import { generateSummary } from "../analysis/compute-summary.mjs";
import { REPORT_VERSION, TOOL_NAME, REPORT_DESCRIPTION, REPORT_INSIGHT, REPORT_IMPROVES, REPORT_FORMULA, buildCriteria } from "../report-metadata.mjs";

/**
 * Build the full report object.
 * @param {object} config - Validated config
 * @param {{ pullRequests: Array }} data
 * @param {object} analytics - Results from LeadTimeAnalyzer
 * @param {string[]} repositories - Repositories analyzed
 * @param {{ totalFetched: number, cancelled: boolean }} state
 * @returns {object} complete report
 */
export function buildReport(config, data, analytics, repositories, { totalFetched, cancelled }) {
  const summary = generateSummary(data, analytics);

  const report = {
    metadata: {
      reportVersion: REPORT_VERSION,
      toolName: TOOL_NAME,
      description: REPORT_DESCRIPTION,
      insight: REPORT_INSIGHT,
      improves: REPORT_IMPROVES,
      searchUser: config.searchUser,
      repositoriesAnalyzed: repositories,
      generatedAt: new Date().toISOString(),
      metaTags: config.metaTags || {},
      inputs: {
        searchUser: config.searchUser,
        org: config.org,
        repo: config.repo,
        format: config.format,
        outputDir: config.outputDir,
        filename: config.filename,
        ignoreDateRange: config.ignoreDateRange,
        start: config.start,
        end: config.end,
        totalRecords: config.totalRecords,
        delay: config.delay,
        includeReviews: config.includeReviews,
        partitionBy: config.partitionBy,
        cancelled,
      },
      criteria: buildCriteria(config),
      formula: REPORT_FORMULA,
    },
    summary,
    analytics,
  };

  // Add date range only if not ignoring dates
  if (!config.ignoreDateRange && config.start && config.end) {
    report.metadata.dateRange = {
      start: config.start,
      end: config.end,
    };
  }

  return report;
}
