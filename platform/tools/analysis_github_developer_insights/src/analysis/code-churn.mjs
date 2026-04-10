/**
 * Code Churn Analyzer — measures lines added/deleted, commit size distribution.
 */
export class CodeChurnAnalyzer {
  constructor(options = {}) {
    this.options = options;
    this.smallCommitThreshold = options.smallCommitThreshold || 50;
    this.largeCommitThreshold = options.largeCommitThreshold || 500;
  }

  /**
   * Analyze code churn metrics.
   * @param {Array} commits
   * @param {Array} pullRequests
   * @returns {object} churn analytics
   */
  analyze(commits, pullRequests = []) {
    if (!Array.isArray(commits)) {
      throw new Error("CodeChurnAnalyzer expects commits to be an array");
    }
    if (!Array.isArray(pullRequests)) {
      throw new Error("CodeChurnAnalyzer expects pullRequests to be an array");
    }

    const totalCommits = commits.length;
    let totalAdditions = 0;
    let totalDeletions = 0;
    const commitSizeDistribution = { small: 0, medium: 0, large: 0 };

    commits.forEach((commit) => {
      if (commit.stats) {
        totalAdditions += commit.stats.additions;
        totalDeletions += commit.stats.deletions;

        const total = commit.stats.total;
        if (total <= this.smallCommitThreshold) {
          commitSizeDistribution.small++;
        } else if (total <= this.largeCommitThreshold) {
          commitSizeDistribution.medium++;
        } else {
          commitSizeDistribution.large++;
        }
      }
    });

    // Add PR data
    pullRequests.forEach((pr) => {
      totalAdditions += pr.additions || 0;
      totalDeletions += pr.deletions || 0;
    });

    const netChange = totalAdditions - totalDeletions;

    return {
      totalCommits,
      totalAdditions,
      totalDeletions,
      netChange,
      commitSizeDistribution,
      details: commits.map((commit) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author,
        repository: commit.repository?.full_name || "unknown",
        stats: commit.stats || { additions: 0, deletions: 0, total: 0 },
      })),
    };
  }
}
