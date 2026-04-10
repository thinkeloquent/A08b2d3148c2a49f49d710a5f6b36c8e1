/**
 * Compute summary statistics from commits.
 * @param {Array} commits
 * @param {object} config
 * @param {number} totalFetched
 * @returns {object} summary object
 */
export function computeSummary(commits, config, totalFetched) {
  const totalAdditions = commits.reduce(
    (sum, c) => sum + (c.stats?.additions || 0),
    0
  );
  const totalDeletions = commits.reduce(
    (sum, c) => sum + (c.stats?.deletions || 0),
    0
  );
  const totalFilesChanged = commits.reduce(
    (sum, c) => sum + (c.files?.length || 0),
    0
  );

  return {
    totalCommits: commits.length,
    directCommits: commits.filter((c) => c.type === "direct").length,
    pullRequestCommits: commits.filter((c) => c.type === "pull_request")
      .length,
    uniqueRepositories: new Set(commits.map((c) => c.repository)).size,
    uniquePullRequests: new Set(
      commits.filter((c) => c.pullRequest).map((c) => c.pullRequest)
    ).size,
    totalAdditions,
    totalDeletions,
    totalFilesChanged,
    totalRecordsFetched: totalFetched,
    dateRange: {
      earliest:
        commits.length > 0
          ? new Date(
              Math.min(...commits.map((c) => new Date(c.date)))
            ).toISOString()
          : null,
      latest:
        commits.length > 0
          ? new Date(
              Math.max(...commits.map((c) => new Date(c.date)))
            ).toISOString()
          : null,
    },
  };
}
