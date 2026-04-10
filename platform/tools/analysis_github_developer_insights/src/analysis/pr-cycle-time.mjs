/**
 * PR Cycle Time Analyzer — measures time from creation to merge/close.
 */
export class PRCycleTimeAnalyzer {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Analyze PR cycle time metrics.
   * @param {Array} pullRequests
   * @param {{ log: Function }} deps
   * @returns {object} cycle time analytics
   */
  analyze(pullRequests, { log }) {
    if (!Array.isArray(pullRequests)) {
      throw new Error("PRCycleTimeAnalyzer expects an array of pull requests");
    }

    if (pullRequests.length > 0 && !pullRequests[0].hasOwnProperty("number")) {
      throw new Error(
        "PRCycleTimeAnalyzer received invalid data: missing PR properties"
      );
    }

    const cycleTimeData = [];
    let totalCycleTime = 0;
    let mergedCount = 0;

    pullRequests.forEach((pr) => {
      try {
        const created = new Date(pr.created_at);
        let cycleTime = null;

        if (pr.merged_at) {
          const merged = new Date(pr.merged_at);
          if (!isNaN(created.getTime()) && !isNaN(merged.getTime())) {
            cycleTime = (merged - created) / (1000 * 60 * 60 * 24);
            totalCycleTime += cycleTime;
            mergedCount++;
          } else {
            log(`Invalid date format in PR #${pr.number}`, "warn");
          }
        } else if (pr.closed_at) {
          const closed = new Date(pr.closed_at);
          if (!isNaN(created.getTime()) && !isNaN(closed.getTime())) {
            cycleTime = (closed - created) / (1000 * 60 * 60 * 24);
          } else {
            log(`Invalid date format in PR #${pr.number}`, "warn");
          }
        }

        cycleTimeData.push({
          number: pr.number,
          title: pr.title,
          repository: pr.repository.full_name,
          created_at: pr.created_at,
          merged_at: pr.merged_at,
          closed_at: pr.closed_at,
          cycleTime: cycleTime ? Math.round(cycleTime * 10) / 10 : null,
          status: pr.merged_at ? "merged" : pr.closed_at ? "closed" : "open",
        });
      } catch (error) {
        log(
          `Error processing PR #${pr.number}: ${error.message}`,
          "warn"
        );
      }
    });

    const avgCycleTime = mergedCount > 0 ? totalCycleTime / mergedCount : 0;

    return {
      avgCycleTime: Math.round(avgCycleTime * 10) / 10,
      totalPRs: pullRequests.length,
      mergedPRs: mergedCount,
      details: cycleTimeData,
    };
  }
}
