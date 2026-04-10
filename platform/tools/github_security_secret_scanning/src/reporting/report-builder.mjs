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
 * Build the full report object.
 *
 * @param {object} config - Validated config
 * @param {object} data
 * @param {Array<{ alert: object, locations: object[] }>} data.alertsWithLocations
 * @param {Map<number, Array<{ action: string, message: string, path: string }>>} data.handlerResults
 * @param {Array<{ number: number, resolved: boolean, reason?: string }>} data.resolveResults
 * @param {{ fixedCount: number, skippedCount: number, errorCount: number } | null} data.handlerStats
 * @param {number} data.totalFetched
 * @param {boolean} data.cancelled
 * @returns {object} complete report
 */
export function buildReport(config, data) {
  const {
    alertsWithLocations = [],
    handlerResults = new Map(),
    resolveResults = [],
    handlerStats,
    totalFetched,
    cancelled,
  } = data;

  const totalAlerts = alertsWithLocations.length;
  const totalLocations = alertsWithLocations.reduce(
    (sum, a) => sum + a.locations.length,
    0
  );

  const autoResolved = resolveResults.filter((r) => r.resolved).length;
  const autoResolveFailed = resolveResults.filter((r) => !r.resolved).length;

  const summary = {
    mode: config.mode,
    totalAlerts,
    totalLocations,
    fixed: handlerStats?.fixedCount || 0,
    skipped: handlerStats?.skippedCount || 0,
    errored: handlerStats?.errorCount || 0,
    autoResolved,
    autoResolveFailed,
  };

  const alerts = alertsWithLocations.map(({ alert, locations }) => {
    const results = handlerResults.get(alert.number) || [];
    const resolveEntry = resolveResults.find((r) => r.number === alert.number);

    return {
      number: alert.number,
      secret_type: alert.secret_type || null,
      secret_type_display_name: alert.secret_type_display_name || null,
      validity: alert.validity || null,
      html_url: alert.html_url || null,
      created_at: alert.created_at || null,
      locations: locations.map((loc) => ({
        type: loc.type,
        path: loc.details?.path || null,
        start_line: loc.details?.start_line || null,
        end_line: loc.details?.end_line || null,
        blob_sha: loc.details?.blob_sha || null,
        commit_sha: loc.details?.commit_sha || null,
      })),
      handlerResults: results,
      resolvedOnGitHub: resolveEntry?.resolved || false,
    };
  });

  return {
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
        mode: config.mode,
        handler: config.handler || null,
        secretResolution: config.secretResolution,
        autoResolve: config.autoResolve,
        dryRun: config.dryRun,
        repoRoot: config.repoRoot || null,
        format: config.format,
        outputDir: config.outputDir,
        cancelled,
      },
      criteria: buildCriteria(config),
      formula: buildFormula(config),
    },
    summary,
    alerts,
  };
}
