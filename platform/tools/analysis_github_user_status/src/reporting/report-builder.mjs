import { computeSummary } from "../analysis/compute-summary.mjs";
import { REPORT_DESCRIPTION, REPORT_INSIGHT, REPORT_IMPROVES, REPORT_FORMULA, buildCriteria } from "../report-metadata.mjs";

/**
 * Build the full report object.
 * @param {Array} users - Array of user status objects
 * @param {object} config - Config object
 * @param {{ totalFetched: number, cancelled: boolean }} state
 * @returns {object} report
 */
export function buildReport(users, config, { totalFetched, cancelled }) {
  const summary = computeSummary(users, config, totalFetched);

  // Group by status
  const groupedByStatus = {};
  for (const user of users) {
    if (!groupedByStatus[user.status]) {
      groupedByStatus[user.status] = [];
    }
    groupedByStatus[user.status].push(user);
  }

  return {
    description: REPORT_DESCRIPTION,
    insight: REPORT_INSIGHT,
    improves: REPORT_IMPROVES,
    inputs: {
      searchUser: config.searchUser,
      format: config.format,
      outputDir: config.outputDir,
      filename: config.filename,
      verbose: config.verbose,
      debug: config.debug,
      delay: config.delay,
      totalRecords: config.totalRecords,
      ignoreDateRange: config.ignoreDateRange,
      generatedAt: new Date().toISOString(),
      cancelled,
    },
    metaTags: config.metaTags,
    summary,
    users,
    groupedByStatus,
    criteria: buildCriteria(config),
    formula: REPORT_FORMULA,
  };
}
