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
 * Build the full report object for file touch frequency analysis.
 * @param {object} config - Validated config
 * @param {{ commits: Array, repositories: string[] }} data
 * @param {object} analytics - Results from FileTouchFrequencyAnalyzer
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
        hotspotThreshold: config.hotspotThreshold,
        topFilesLimit: config.topFilesLimit,
        cancelled,
      },
      criteria: buildCriteria(config),
      formula: buildFormula(config),
    },
    summary: analytics.summary || {},
    analytics: {
      summary: analytics.summary || {},
      topHotspots: analytics.topHotspots || [],
      frequencyTierDistribution: analytics.frequencyTierDistribution || {},
      directoryBreakdown: analytics.directoryBreakdown || [],
      weeklyTrends: analytics.weeklyTrends || [],
      repositoryBreakdown: analytics.repositoryBreakdown || [],
    },
    fileMetrics: analytics.fileMetrics || [],
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
