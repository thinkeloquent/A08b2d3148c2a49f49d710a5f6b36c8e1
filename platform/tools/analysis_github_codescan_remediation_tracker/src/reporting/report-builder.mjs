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
 * Build the full report object for codescan remediation tracker analysis.
 * @param {object} config - Validated config
 * @param {{ openAlerts: object[], fixedAlerts: object[] }} data
 * @param {object} analytics - Results from analysis modules
 * @param {{ totalFetched: number, cancelled: boolean }} state
 * @returns {object} complete report
 */
export function buildReport(config, data, analytics, { totalFetched, cancelled }) {
  const report = {
    metadata: {
      reportVersion: REPORT_VERSION,
      toolName: TOOL_NAME,
      description: REPORT_DESCRIPTION,
      insight: REPORT_INSIGHT,
      improves: REPORT_IMPROVES,
      repo: config.repo,
      generatedAt: new Date().toISOString(),
      metaTags: config.metaTags || {},
      inputs: {
        repo: config.repo,
        toolName: config.toolName,
        severity: config.severity,
        includeFixed: config.includeFixed,
        velocityWeeks: config.velocityWeeks,
        topFiles: config.topFiles,
        topRules: config.topRules,
        format: config.format,
        outputDir: config.outputDir,
        filename: config.filename,
        cancelled,
      },
      criteria: buildCriteria(config),
      formula: buildFormula(config),
    },
    summary: analytics.summary || {},
    analytics: {
      ruleBreakdown: analytics.ruleBreakdown || [],
      fileHeatmap: analytics.fileHeatmap || [],
      velocity: analytics.velocity || {},
    },
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
