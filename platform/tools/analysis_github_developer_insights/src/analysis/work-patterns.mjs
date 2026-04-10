/**
 * Work Patterns Analyzer — analyzes commit timing, day/hour distributions.
 */
export class WorkPatternsAnalyzer {
  constructor(options = {}) {
    this.options = options;
    this.businessHours = { start: 9, end: 17 };
  }

  /**
   * Analyze work patterns from commits and PRs.
   * @param {Array} commits
   * @param {Array} pullRequests
   * @param {{ log: Function }} deps
   * @returns {object} work pattern analytics
   */
  analyze(commits, pullRequests = [], { log }) {
    if (!Array.isArray(commits)) {
      throw new Error("WorkPatternsAnalyzer expects commits to be an array");
    }
    if (!Array.isArray(pullRequests)) {
      throw new Error(
        "WorkPatternsAnalyzer expects pullRequests to be an array"
      );
    }

    const dayCount = {};
    const hourCount = {};
    const commitPunchcard = {};
    let afterHoursCount = 0;
    let totalActivities = 0;

    // Analyze commits
    commits.forEach((commit) => {
      try {
        const date = new Date(commit.commit.author.date);
        if (isNaN(date.getTime())) {
          log(`Invalid date in commit ${commit.sha}`, "warn");
          return;
        }

        const day = date.toLocaleDateString("en-US", { weekday: "long" });
        const hour = date.getHours();

        dayCount[day] = (dayCount[day] || 0) + 1;
        hourCount[hour] = (hourCount[hour] || 0) + 1;

        if (!commitPunchcard[day]) commitPunchcard[day] = {};
        commitPunchcard[day][hour] = (commitPunchcard[day][hour] || 0) + 1;

        if (hour < this.businessHours.start || hour >= this.businessHours.end) {
          afterHoursCount++;
        }
        totalActivities++;
      } catch (error) {
        log(
          `Error processing commit ${commit.sha}: ${error.message}`,
          "warn"
        );
      }
    });

    // Analyze PRs
    pullRequests.forEach((pr) => {
      try {
        const date = new Date(pr.created_at);
        if (isNaN(date.getTime())) {
          log(`Invalid date in PR #${pr.number}`, "warn");
          return;
        }

        const day = date.toLocaleDateString("en-US", { weekday: "long" });
        const hour = date.getHours();

        dayCount[day] = (dayCount[day] || 0) + 1;
        hourCount[hour] = (hourCount[hour] || 0) + 1;

        if (!commitPunchcard[day]) commitPunchcard[day] = {};
        commitPunchcard[day][hour] = (commitPunchcard[day][hour] || 0) + 1;

        if (hour < this.businessHours.start || hour >= this.businessHours.end) {
          afterHoursCount++;
        }
        totalActivities++;
      } catch (error) {
        log(
          `Error processing PR #${pr.number}: ${error.message}`,
          "warn"
        );
      }
    });

    // Find most active day
    const mostActiveDay =
      Object.keys(dayCount).length > 0
        ? Object.keys(dayCount).reduce((a, b) =>
            dayCount[a] > dayCount[b] ? a : b
          )
        : "Unknown";

    const afterHoursPercentage =
      totalActivities > 0
        ? Math.round((afterHoursCount / totalActivities) * 10000) / 100
        : 0;

    return {
      mostActiveDay,
      afterHoursPercentage,
      commitPunchcard,
      dayDistribution: dayCount,
      hourDistribution: hourCount,
      totalActivities,
      afterHoursCount,
    };
  }
}
