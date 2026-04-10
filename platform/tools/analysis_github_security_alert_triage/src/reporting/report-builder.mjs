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
 * Build the full report object for security alert triage analysis.
 * @param {object} config - Validated config
 * @param {object} data - Raw alert data by type
 * @param {object} analytics - Results from TriageAnalyzer
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
      repository: config.repo,
      generatedAt: new Date().toISOString(),
      metaTags: config.metaTags || {},
      inputs: {
        repo: config.repo,
        alertTypes: config.alertTypes,
        alertState: config.alertState,
        minSeverity: config.minSeverity || null,
        toolName: config.toolName || null,
        format: config.format,
        outputDir: config.outputDir,
        filename: config.filename || null,
        cancelled,
      },
      criteria: buildCriteria(config),
      formula: buildFormula(config),
    },
    summary: analytics.summary || {},
    triage: {
      prioritizedAlerts: analytics.prioritizedAlerts || [],
      byType: analytics.byType || {},
      bySeverity: analytics.bySeverity || {},
      topAffectedFiles: analytics.topAffectedFiles || [],
    },
  };

  return report;
}
