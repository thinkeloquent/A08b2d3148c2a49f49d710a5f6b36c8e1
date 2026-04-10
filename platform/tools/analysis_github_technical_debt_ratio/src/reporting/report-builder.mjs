import {
  REPORT_VERSION,
  TOOL_NAME,
  REPORT_DESCRIPTION,
  REPORT_INSIGHT,
  REPORT_IMPROVES,
  buildCriteria,
  buildFormula,
} from "../report-metadata.mjs";

/**
 * Build the full report object for technical debt ratio analysis.
 * @param {object} config - Validated config
 * @param {{ commits: Array, repositories: string[] }} data
 * @param {object} analytics - Results from TechnicalDebtAnalyzer
 * @param {string[]} repositories - Repositories analyzed
 * @param {{ totalFetched: number, cancelled: boolean }} state
 * @returns {object} complete report
 */
export function buildReport(config, data, analytics, repositories, { totalFetched, cancelled }) {
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
        cancelled,
      },
      criteria: buildCriteria(config),
      formula: buildFormula(config),
    },
    summary: analytics.summary || {},
    analytics: {
      summary: analytics.summary || {},
      workTypeDistribution: analytics.workTypeDistribution || {},
      weeklyTrends: analytics.weeklyTrends || [],
      repositoryBreakdown: analytics.repositoryBreakdown || [],
      topDebtCommits: analytics.topDebtCommits || [],
    },
    commitMetrics: analytics.commitMetrics || [],
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
