/**
 * Generate summary statistics from collected data and analytics.
 * @param {{ pullRequests: Array, commits: Array }} data
 * @param {object} analytics - Results from analyzer modules
 * @returns {object} summary object
 */
export function generateSummary(data, analytics) {
  const { pullRequests, commits } = data;

  return {
    totalContributions: commits.length + pullRequests.length,
    totalCommits: commits.length,
    totalPRsCreated: pullRequests.length,
    totalReviewsSubmitted: 0,
    totalComments: 0,
    linesAdded: analytics.codeChurn?.totalAdditions || 0,
    linesDeleted: analytics.codeChurn?.totalDeletions || 0,
    primaryLanguages: [],
  };
}
