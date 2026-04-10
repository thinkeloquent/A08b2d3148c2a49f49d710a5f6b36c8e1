import { CYCLE_TIME_BUCKETS } from "../domain/models.mjs";

/**
 * PR Cycle Time Analyzer — measures time from first commit to PR merge.
 *
 * Metrics computed:
 * - cycle_time_days: first commit → merge (primary metric)
 * - pr_open_to_merge_days: PR created → merge
 * - first_commit_to_merge_days: first commit → merge (same as cycle_time when commit data available)
 *
 * When commit history is unavailable, falls back to created_at → merged_at.
 */
export class PRCycleTimeAnalyzer {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Analyze PR cycle time metrics.
   * @param {Array} pullRequests - PRs with optional firstCommitDate
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
    let totalOpenToMerge = 0;
    let mergedCount = 0;

    pullRequests.forEach((pr) => {
      try {
        const created = new Date(pr.created_at);
        const firstCommitDate = pr._firstCommitDate
          ? new Date(pr._firstCommitDate)
          : null;

        let cycleTimeDays = null;
        let openToMergeDays = null;
        let firstCommitToMergeDays = null;
        let status = "open";

        if (pr.merged_at) {
          status = "merged";
          const merged = new Date(pr.merged_at);

          // PR open to merge
          if (!isNaN(created.getTime()) && !isNaN(merged.getTime())) {
            openToMergeDays = (merged - created) / (1000 * 60 * 60 * 24);
            totalOpenToMerge += openToMergeDays;
          }

          // First commit to merge (primary cycle time)
          if (firstCommitDate && !isNaN(firstCommitDate.getTime()) && !isNaN(merged.getTime())) {
            firstCommitToMergeDays = (merged - firstCommitDate) / (1000 * 60 * 60 * 24);
            cycleTimeDays = firstCommitToMergeDays;
          } else if (openToMergeDays !== null) {
            // Fallback: use PR created → merged
            cycleTimeDays = openToMergeDays;
          }

          if (cycleTimeDays !== null) {
            totalCycleTime += cycleTimeDays;
            mergedCount++;
          }
        } else if (pr.closed_at) {
          status = "closed";
          const closed = new Date(pr.closed_at);
          if (!isNaN(created.getTime()) && !isNaN(closed.getTime())) {
            openToMergeDays = (closed - created) / (1000 * 60 * 60 * 24);
          }
        }

        const repoName = pr.repository?.full_name ||
          pr.base?.repo?.full_name ||
          "unknown";

        cycleTimeData.push({
          number: pr.number,
          title: pr.title,
          repository: repoName,
          created_at: pr.created_at,
          merged_at: pr.merged_at || null,
          closed_at: pr.closed_at || null,
          first_commit_at: pr._firstCommitDate || null,
          cycle_time_days: round(cycleTimeDays),
          pr_open_to_merge_days: round(openToMergeDays),
          first_commit_to_merge_days: round(firstCommitToMergeDays),
          status,
          additions: pr.additions || 0,
          deletions: pr.deletions || 0,
          changed_files: pr.changed_files || 0,
          total_commits: pr.commits || 0,
        });
      } catch (error) {
        log(
          `Error processing PR #${pr.number}: ${error.message}`,
          "warn"
        );
      }
    });

    const mergedPRs = cycleTimeData.filter((d) => d.status === "merged");
    const avgCycleTime = mergedCount > 0 ? totalCycleTime / mergedCount : 0;
    const avgOpenToMerge = mergedCount > 0 ? totalOpenToMerge / mergedCount : 0;

    // Percentile calculations on merged PRs
    const sortedCycleTimes = mergedPRs
      .map((d) => d.cycle_time_days)
      .filter((v) => v !== null)
      .sort((a, b) => a - b);

    const p50 = percentile(sortedCycleTimes, 50);
    const p75 = percentile(sortedCycleTimes, 75);
    const p90 = percentile(sortedCycleTimes, 90);
    const p95 = percentile(sortedCycleTimes, 95);

    // Distribution buckets
    const distribution = computeDistribution(sortedCycleTimes);

    // Trend by week
    const weeklyTrend = computeWeeklyTrend(mergedPRs);

    // By repository
    const byRepository = computeByRepository(cycleTimeData);

    return {
      summary: {
        totalPRs: pullRequests.length,
        mergedPRs: mergedCount,
        closedPRs: cycleTimeData.filter((d) => d.status === "closed").length,
        openPRs: cycleTimeData.filter((d) => d.status === "open").length,
        avgCycleTimeDays: round(avgCycleTime),
        avgOpenToMergeDays: round(avgOpenToMerge),
        medianCycleTimeDays: round(p50),
        p75CycleTimeDays: round(p75),
        p90CycleTimeDays: round(p90),
        p95CycleTimeDays: round(p95),
        minCycleTimeDays: sortedCycleTimes.length > 0 ? round(sortedCycleTimes[0]) : null,
        maxCycleTimeDays: sortedCycleTimes.length > 0 ? round(sortedCycleTimes[sortedCycleTimes.length - 1]) : null,
      },
      distribution,
      weeklyTrend,
      byRepository,
      details: cycleTimeData,
    };
  }
}

/**
 * Round to 1 decimal place.
 */
function round(value) {
  if (value === null || value === undefined) return null;
  return Math.round(value * 10) / 10;
}

/**
 * Calculate percentile from a sorted array.
 */
function percentile(sortedArr, pct) {
  if (sortedArr.length === 0) return null;
  const idx = Math.ceil((pct / 100) * sortedArr.length) - 1;
  return sortedArr[Math.max(0, idx)];
}

/**
 * Compute distribution buckets based on cycle time thresholds.
 */
function computeDistribution(sortedCycleTimes) {
  const { FAST, NORMAL, SLOW, VERY_SLOW } = CYCLE_TIME_BUCKETS;
  const total = sortedCycleTimes.length;

  if (total === 0) {
    return {
      fast: { label: `<${FAST}d`, count: 0, percentage: 0 },
      normal: { label: `${FAST}-${NORMAL}d`, count: 0, percentage: 0 },
      slow: { label: `${NORMAL}-${SLOW}d`, count: 0, percentage: 0 },
      verySlow: { label: `${SLOW}-${VERY_SLOW}d`, count: 0, percentage: 0 },
      extreme: { label: `>${VERY_SLOW}d`, count: 0, percentage: 0 },
    };
  }

  const fast = sortedCycleTimes.filter((t) => t < FAST).length;
  const normal = sortedCycleTimes.filter((t) => t >= FAST && t < NORMAL).length;
  const slow = sortedCycleTimes.filter((t) => t >= NORMAL && t < SLOW).length;
  const verySlow = sortedCycleTimes.filter((t) => t >= SLOW && t < VERY_SLOW).length;
  const extreme = sortedCycleTimes.filter((t) => t >= VERY_SLOW).length;

  const pct = (count) => round((count / total) * 100);

  return {
    fast: { label: `<${FAST}d`, count: fast, percentage: pct(fast) },
    normal: { label: `${FAST}-${NORMAL}d`, count: normal, percentage: pct(normal) },
    slow: { label: `${NORMAL}-${SLOW}d`, count: slow, percentage: pct(slow) },
    verySlow: { label: `${SLOW}-${VERY_SLOW}d`, count: verySlow, percentage: pct(verySlow) },
    extreme: { label: `>${VERY_SLOW}d`, count: extreme, percentage: pct(extreme) },
  };
}

/**
 * Compute weekly trend for merged PRs.
 */
function computeWeeklyTrend(mergedPRs) {
  const weekMap = new Map();

  mergedPRs.forEach((pr) => {
    if (!pr.merged_at || pr.cycle_time_days === null) return;

    const mergedDate = new Date(pr.merged_at);
    const weekStart = new Date(mergedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split("T")[0];

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, { cycleTimes: [], count: 0 });
    }

    const week = weekMap.get(weekKey);
    week.cycleTimes.push(pr.cycle_time_days);
    week.count++;
  });

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, data]) => ({
      weekStart,
      prsMerged: data.count,
      avgCycleTimeDays: round(
        data.cycleTimes.reduce((s, v) => s + v, 0) / data.cycleTimes.length
      ),
      medianCycleTimeDays: round(
        percentile(
          data.cycleTimes.sort((a, b) => a - b),
          50
        )
      ),
    }));
}

/**
 * Compute cycle time statistics grouped by repository.
 */
function computeByRepository(cycleTimeData) {
  const repoMap = new Map();

  cycleTimeData.forEach((entry) => {
    if (!repoMap.has(entry.repository)) {
      repoMap.set(entry.repository, []);
    }
    repoMap.get(entry.repository).push(entry);
  });

  return Array.from(repoMap.entries()).map(([repo, entries]) => {
    const merged = entries.filter(
      (e) => e.status === "merged" && e.cycle_time_days !== null
    );
    const cycleTimes = merged.map((e) => e.cycle_time_days).sort((a, b) => a - b);

    return {
      repository: repo,
      totalPRs: entries.length,
      mergedPRs: merged.length,
      avgCycleTimeDays: cycleTimes.length > 0
        ? round(cycleTimes.reduce((s, v) => s + v, 0) / cycleTimes.length)
        : null,
      medianCycleTimeDays: percentile(cycleTimes, 50),
    };
  });
}
