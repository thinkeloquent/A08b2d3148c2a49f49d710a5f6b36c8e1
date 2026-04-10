import { LEAD_TIME_BUCKETS } from "../domain/models.mjs";

/**
 * Lead Time for Changes Analyzer — measures the end-to-end time from a developer's
 * first commit to code reaching the main branch.
 *
 * Lead Time is decomposed into phases:
 * - Coding Time:  first_commit → PR created (time spent writing code before review)
 * - Review Time:  PR created → first review (wait time for review pickup)
 * - Merge Time:   last approval → merge (time in merge queue after approval)
 * - Total Lead Time: first_commit → merge (end-to-end)
 *
 * When commit history is unavailable, falls back to created_at → merged_at.
 * When review data is unavailable, review/merge phases are not computed.
 */
export class LeadTimeAnalyzer {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Analyze lead time metrics for a set of pull requests.
   * @param {Array} pullRequests - PRs with optional _firstCommitDate, _firstReviewAt, _lastApprovalAt
   * @param {{ log: Function }} deps
   * @returns {object} lead time analytics
   */
  analyze(pullRequests, { log }) {
    if (!Array.isArray(pullRequests)) {
      throw new Error("LeadTimeAnalyzer expects an array of pull requests");
    }

    if (pullRequests.length > 0 && !pullRequests[0].hasOwnProperty("number")) {
      throw new Error(
        "LeadTimeAnalyzer received invalid data: missing PR properties"
      );
    }

    const leadTimeData = [];
    let totalLeadTime = 0;
    let totalCodingTime = 0;
    let totalReviewTime = 0;
    let totalMergeTime = 0;
    let totalOpenToMerge = 0;
    let mergedCount = 0;
    let codingTimeCount = 0;
    let reviewTimeCount = 0;
    let mergeTimeCount = 0;

    pullRequests.forEach((pr) => {
      try {
        const created = new Date(pr.created_at);
        const firstCommitDate = pr._firstCommitDate
          ? new Date(pr._firstCommitDate)
          : null;
        const firstReviewAt = pr._firstReviewAt
          ? new Date(pr._firstReviewAt)
          : null;
        const lastApprovalAt = pr._lastApprovalAt
          ? new Date(pr._lastApprovalAt)
          : null;

        let leadTimeDays = null;
        let codingTimeDays = null;
        let reviewTimeDays = null;
        let mergeTimeDays = null;
        let openToMergeDays = null;
        let status = "open";

        if (pr.merged_at) {
          status = "merged";
          const merged = new Date(pr.merged_at);

          // PR open to merge (baseline)
          if (!isNaN(created.getTime()) && !isNaN(merged.getTime())) {
            openToMergeDays = (merged - created) / (1000 * 60 * 60 * 24);
            totalOpenToMerge += openToMergeDays;
          }

          // Lead Time: first commit → merge (primary metric)
          if (firstCommitDate && !isNaN(firstCommitDate.getTime()) && !isNaN(merged.getTime())) {
            leadTimeDays = (merged - firstCommitDate) / (1000 * 60 * 60 * 24);
          } else if (openToMergeDays !== null) {
            // Fallback: PR created → merged
            leadTimeDays = openToMergeDays;
          }

          if (leadTimeDays !== null) {
            totalLeadTime += leadTimeDays;
            mergedCount++;
          }

          // Coding Time: first commit → PR created
          if (firstCommitDate && !isNaN(firstCommitDate.getTime()) && !isNaN(created.getTime())) {
            codingTimeDays = (created - firstCommitDate) / (1000 * 60 * 60 * 24);
            // Clamp negative values (commit after PR creation = 0 coding time)
            if (codingTimeDays < 0) codingTimeDays = 0;
            totalCodingTime += codingTimeDays;
            codingTimeCount++;
          }

          // Review Time: PR created → first review
          if (firstReviewAt && !isNaN(firstReviewAt.getTime()) && !isNaN(created.getTime())) {
            reviewTimeDays = (firstReviewAt - created) / (1000 * 60 * 60 * 24);
            if (reviewTimeDays < 0) reviewTimeDays = 0;
            totalReviewTime += reviewTimeDays;
            reviewTimeCount++;
          }

          // Merge Time: last approval → merge
          if (lastApprovalAt && !isNaN(lastApprovalAt.getTime()) && !isNaN(merged.getTime())) {
            mergeTimeDays = (merged - lastApprovalAt) / (1000 * 60 * 60 * 24);
            if (mergeTimeDays < 0) mergeTimeDays = 0;
            totalMergeTime += mergeTimeDays;
            mergeTimeCount++;
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

        leadTimeData.push({
          number: pr.number,
          title: pr.title,
          repository: repoName,
          created_at: pr.created_at,
          merged_at: pr.merged_at || null,
          closed_at: pr.closed_at || null,
          first_commit_at: pr._firstCommitDate || null,
          first_review_at: pr._firstReviewAt || null,
          last_approval_at: pr._lastApprovalAt || null,
          lead_time_days: round(leadTimeDays),
          coding_time_days: round(codingTimeDays),
          review_time_days: round(reviewTimeDays),
          merge_time_days: round(mergeTimeDays),
          pr_open_to_merge_days: round(openToMergeDays),
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

    const mergedPRs = leadTimeData.filter((d) => d.status === "merged");

    // Percentile calculations on merged PRs
    const sortedLeadTimes = mergedPRs
      .map((d) => d.lead_time_days)
      .filter((v) => v !== null)
      .sort((a, b) => a - b);

    const sortedCodingTimes = mergedPRs
      .map((d) => d.coding_time_days)
      .filter((v) => v !== null)
      .sort((a, b) => a - b);

    const sortedReviewTimes = mergedPRs
      .map((d) => d.review_time_days)
      .filter((v) => v !== null)
      .sort((a, b) => a - b);

    const sortedMergeTimes = mergedPRs
      .map((d) => d.merge_time_days)
      .filter((v) => v !== null)
      .sort((a, b) => a - b);

    const p50 = percentile(sortedLeadTimes, 50);
    const p75 = percentile(sortedLeadTimes, 75);
    const p90 = percentile(sortedLeadTimes, 90);
    const p95 = percentile(sortedLeadTimes, 95);

    // DORA performance classification
    const doraClassification = classifyDORA(p50);

    // Distribution buckets
    const distribution = computeDistribution(sortedLeadTimes);

    // Trend by week
    const weeklyTrend = computeWeeklyTrend(mergedPRs);

    // By repository
    const byRepository = computeByRepository(leadTimeData);

    // Phase breakdown averages
    const phaseBreakdown = {
      avgCodingTimeDays: codingTimeCount > 0 ? round(totalCodingTime / codingTimeCount) : null,
      medianCodingTimeDays: round(percentile(sortedCodingTimes, 50)),
      avgReviewTimeDays: reviewTimeCount > 0 ? round(totalReviewTime / reviewTimeCount) : null,
      medianReviewTimeDays: round(percentile(sortedReviewTimes, 50)),
      avgMergeTimeDays: mergeTimeCount > 0 ? round(totalMergeTime / mergeTimeCount) : null,
      medianMergeTimeDays: round(percentile(sortedMergeTimes, 50)),
      samplesWithCodingTime: codingTimeCount,
      samplesWithReviewTime: reviewTimeCount,
      samplesWithMergeTime: mergeTimeCount,
    };

    return {
      summary: {
        totalPRs: pullRequests.length,
        mergedPRs: mergedCount,
        closedPRs: leadTimeData.filter((d) => d.status === "closed").length,
        openPRs: leadTimeData.filter((d) => d.status === "open").length,
        avgLeadTimeDays: mergedCount > 0 ? round(totalLeadTime / mergedCount) : 0,
        avgOpenToMergeDays: mergedCount > 0 ? round(totalOpenToMerge / mergedCount) : 0,
        medianLeadTimeDays: round(p50),
        p75LeadTimeDays: round(p75),
        p90LeadTimeDays: round(p90),
        p95LeadTimeDays: round(p95),
        minLeadTimeDays: sortedLeadTimes.length > 0 ? round(sortedLeadTimes[0]) : null,
        maxLeadTimeDays: sortedLeadTimes.length > 0 ? round(sortedLeadTimes[sortedLeadTimes.length - 1]) : null,
        mergeRate: pullRequests.length > 0
          ? round((mergedCount / pullRequests.length) * 100)
          : 0,
        doraClassification,
      },
      phaseBreakdown,
      distribution,
      weeklyTrend,
      byRepository,
      details: leadTimeData,
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
 * Classify lead time performance per DORA metrics.
 * @param {number|null} medianLeadTimeDays
 * @returns {object} DORA classification
 */
function classifyDORA(medianLeadTimeDays) {
  if (medianLeadTimeDays === null) {
    return { level: "unknown", label: "Insufficient data", color: "gray" };
  }

  const { ELITE, HIGH, MEDIUM } = LEAD_TIME_BUCKETS;

  if (medianLeadTimeDays < ELITE) {
    return { level: "elite", label: "Elite (< 1 day)", color: "green" };
  }
  if (medianLeadTimeDays < HIGH) {
    return { level: "high", label: "High (1-7 days)", color: "blue" };
  }
  if (medianLeadTimeDays < MEDIUM) {
    return { level: "medium", label: "Medium (7-30 days)", color: "yellow" };
  }
  return { level: "low", label: "Low (> 30 days)", color: "red" };
}

/**
 * Compute distribution buckets based on DORA lead time thresholds.
 */
function computeDistribution(sortedLeadTimes) {
  const { ELITE, HIGH, MEDIUM, LOW } = LEAD_TIME_BUCKETS;
  const total = sortedLeadTimes.length;

  if (total === 0) {
    return {
      elite: { label: `<${ELITE}d`, count: 0, percentage: 0 },
      high: { label: `${ELITE}-${HIGH}d`, count: 0, percentage: 0 },
      medium: { label: `${HIGH}-${MEDIUM}d`, count: 0, percentage: 0 },
      low: { label: `${MEDIUM}-${LOW}d`, count: 0, percentage: 0 },
      veryLow: { label: `>${LOW}d`, count: 0, percentage: 0 },
    };
  }

  const elite = sortedLeadTimes.filter((t) => t < ELITE).length;
  const high = sortedLeadTimes.filter((t) => t >= ELITE && t < HIGH).length;
  const medium = sortedLeadTimes.filter((t) => t >= HIGH && t < MEDIUM).length;
  const low = sortedLeadTimes.filter((t) => t >= MEDIUM && t < LOW).length;
  const veryLow = sortedLeadTimes.filter((t) => t >= LOW).length;

  const pct = (count) => round((count / total) * 100);

  return {
    elite: { label: `<${ELITE}d`, count: elite, percentage: pct(elite) },
    high: { label: `${ELITE}-${HIGH}d`, count: high, percentage: pct(high) },
    medium: { label: `${HIGH}-${MEDIUM}d`, count: medium, percentage: pct(medium) },
    low: { label: `${MEDIUM}-${LOW}d`, count: low, percentage: pct(low) },
    veryLow: { label: `>${LOW}d`, count: veryLow, percentage: pct(veryLow) },
  };
}

/**
 * Compute weekly trend for merged PRs.
 */
function computeWeeklyTrend(mergedPRs) {
  const weekMap = new Map();

  mergedPRs.forEach((pr) => {
    if (!pr.merged_at || pr.lead_time_days === null) return;

    const mergedDate = new Date(pr.merged_at);
    const weekStart = new Date(mergedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split("T")[0];

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        leadTimes: [],
        codingTimes: [],
        reviewTimes: [],
        mergeTimes: [],
        count: 0,
      });
    }

    const week = weekMap.get(weekKey);
    week.leadTimes.push(pr.lead_time_days);
    if (pr.coding_time_days !== null) week.codingTimes.push(pr.coding_time_days);
    if (pr.review_time_days !== null) week.reviewTimes.push(pr.review_time_days);
    if (pr.merge_time_days !== null) week.mergeTimes.push(pr.merge_time_days);
    week.count++;
  });

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, data]) => ({
      weekStart,
      prsMerged: data.count,
      avgLeadTimeDays: round(
        data.leadTimes.reduce((s, v) => s + v, 0) / data.leadTimes.length
      ),
      medianLeadTimeDays: round(
        percentile(
          data.leadTimes.sort((a, b) => a - b),
          50
        )
      ),
      avgCodingTimeDays: data.codingTimes.length > 0
        ? round(data.codingTimes.reduce((s, v) => s + v, 0) / data.codingTimes.length)
        : null,
      avgReviewTimeDays: data.reviewTimes.length > 0
        ? round(data.reviewTimes.reduce((s, v) => s + v, 0) / data.reviewTimes.length)
        : null,
      avgMergeTimeDays: data.mergeTimes.length > 0
        ? round(data.mergeTimes.reduce((s, v) => s + v, 0) / data.mergeTimes.length)
        : null,
    }));
}

/**
 * Compute lead time statistics grouped by repository.
 */
function computeByRepository(leadTimeData) {
  const repoMap = new Map();

  leadTimeData.forEach((entry) => {
    if (!repoMap.has(entry.repository)) {
      repoMap.set(entry.repository, []);
    }
    repoMap.get(entry.repository).push(entry);
  });

  return Array.from(repoMap.entries()).map(([repo, entries]) => {
    const merged = entries.filter(
      (e) => e.status === "merged" && e.lead_time_days !== null
    );
    const leadTimes = merged.map((e) => e.lead_time_days).sort((a, b) => a - b);

    return {
      repository: repo,
      totalPRs: entries.length,
      mergedPRs: merged.length,
      avgLeadTimeDays: leadTimes.length > 0
        ? round(leadTimes.reduce((s, v) => s + v, 0) / leadTimes.length)
        : null,
      medianLeadTimeDays: percentile(leadTimes, 50),
      doraClassification: classifyDORA(percentile(leadTimes, 50))?.level || "unknown",
    };
  });
}
