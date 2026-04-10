import { REPORT_VERSION, TOOL_NAME, REPORT_DESCRIPTION, REPORT_INSIGHT, REPORT_IMPROVES, REPORT_FORMULA, buildCriteria } from "../report-metadata.mjs";

/**
 * Generate summary statistics from collected data and analytics.
 * @param {{ pullRequests: Array }} data
 * @param {object} analytics - Results from PickupTimeAnalyzer
 * @returns {object} summary object
 */
function generateSummary(data, analytics) {
  const { pullRequests } = data;

  const mergedPRs = pullRequests.filter((pr) => pr.merged_at);
  const closedPRs = pullRequests.filter((pr) => pr.closed_at && !pr.merged_at);

  return {
    totalPRs: pullRequests.length,
    mergedPRs: mergedPRs.length,
    closedPRs: closedPRs.length,
    openPRs: pullRequests.length - mergedPRs.length - closedPRs.length,
    prsWithPickup: analytics?.summary?.prsWithPickup || 0,
    prsWithoutPickup: analytics?.summary?.prsWithoutPickup || 0,
    avgPickupHours: analytics?.summary?.avgPickupHours || null,
    medianPickupHours: analytics?.summary?.medianPickupHours || null,
    p75PickupHours: analytics?.summary?.p75PickupHours || null,
    p90PickupHours: analytics?.summary?.p90PickupHours || null,
    p95PickupHours: analytics?.summary?.p95PickupHours || null,
    minPickupHours: analytics?.summary?.minPickupHours || null,
    maxPickupHours: analytics?.summary?.maxPickupHours || null,
    avgPickupDays: analytics?.summary?.avgPickupDays || null,
    medianPickupDays: analytics?.summary?.medianPickupDays || null,
  };
}

/**
 * Build the full report object.
 * @param {object} config - Validated config
 * @param {{ pullRequests: Array }} data
 * @param {object} analytics - Results from PickupTimeAnalyzer
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
        includeReviewComments: config.includeReviewComments,
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
