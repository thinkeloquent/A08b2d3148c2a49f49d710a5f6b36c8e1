/**
 * PR Throughput Analyzer — measures PR velocity, merge rates, and time to merge.
 */
export class PRThroughputAnalyzer {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Analyze pull request throughput metrics.
   * @param {Array} pullRequests
   * @param {{ log: Function }} deps
   * @returns {object} throughput analytics
   */
  analyze(pullRequests, { log }) {
    if (!Array.isArray(pullRequests)) {
      throw new Error("PRThroughputAnalyzer expects an array of pull requests");
    }

    if (pullRequests.length > 0 && !pullRequests[0].hasOwnProperty("number")) {
      throw new Error(
        "PRThroughputAnalyzer received invalid data: missing PR properties"
      );
    }

    const totalPRs = pullRequests.length;
    const statusBreakdown = {
      merged: pullRequests.filter((pr) => pr.merged_at !== null).length,
      closed: pullRequests.filter(
        (pr) => pr.state === "closed" && pr.merged_at === null
      ).length,
      open: pullRequests.filter((pr) => pr.state === "open").length,
    };

    const mergeRate =
      totalPRs > 0 ? (statusBreakdown.merged / totalPRs) * 100 : 0;

    // Calculate average time to merge
    const mergedPRs = pullRequests.filter((pr) => pr.merged_at !== null);
    let avgTimeToMerge = 0;
    if (mergedPRs.length > 0) {
      const totalTime = mergedPRs.reduce((sum, pr) => {
        try {
          const created = new Date(pr.created_at);
          const merged = new Date(pr.merged_at);
          if (isNaN(created.getTime()) || isNaN(merged.getTime())) {
            log(`Invalid date format in PR #${pr.number}`, "warn");
            return sum;
          }
          return sum + (merged - created);
        } catch (error) {
          log(
            `Error calculating time for PR #${pr.number}: ${error.message}`,
            "warn"
          );
          return sum;
        }
      }, 0);
      avgTimeToMerge = totalTime / mergedPRs.length / (1000 * 60 * 60 * 24);
    }

    return {
      totalPRs,
      statusBreakdown,
      mergeRate: Math.round(mergeRate * 100) / 100,
      avgTimeToMerge:
        avgTimeToMerge > 0
          ? `${Math.round(avgTimeToMerge * 10) / 10} days`
          : "0 days",
      details: pullRequests.map((pr) => ({
        number: pr.number,
        title: pr.title,
        repository: pr.repository.full_name,
        state: pr.state,
        created_at: pr.created_at,
        merged_at: pr.merged_at,
        closed_at: pr.closed_at,
        additions: pr.additions,
        deletions: pr.deletions,
        changed_files: pr.changed_files,
      })),
    };
  }
}
