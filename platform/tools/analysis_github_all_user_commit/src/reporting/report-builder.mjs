import { groupByRepository } from "../analysis/group-by-repository.mjs";
import { groupByPullRequest } from "../analysis/group-by-pull-request.mjs";
import { computeSummary } from "../analysis/compute-summary.mjs";
import { REPORT_DESCRIPTION, REPORT_INSIGHT, REPORT_IMPROVES, REPORT_FORMULA, buildCriteria } from "../report-metadata.mjs";

/**
 * Build the full report object.
 * @param {Array} commits
 * @param {object} config
 * @param {{ totalFetched: number, cancelled: boolean }} state
 * @returns {object} report
 */
export function buildReport(commits, config, { totalFetched, cancelled }) {
  const summary = computeSummary(commits, config, totalFetched);

  return {
    description: REPORT_DESCRIPTION,
    insight: REPORT_INSIGHT,
    improves: REPORT_IMPROVES,
    inputs: {
      searchUser: config.searchUser,
      org: config.org,
      repo: config.repo,
      start: config.start,
      end: config.end,
      ignoreDateRange: config.ignoreDateRange,
      totalRecords: config.totalRecords,
      includeDetails: config.includeDetails,
      generatedAt: new Date().toISOString(),
      cancelled,
    },
    metaTags: config.metaTags,
    summary,
    commits,
    groupedByRepository: groupByRepository(commits, config.searchUser),
    groupedByPullRequest: groupByPullRequest(commits, config.searchUser),
    criteria: buildCriteria(config),
    formula: REPORT_FORMULA,
  };
}
