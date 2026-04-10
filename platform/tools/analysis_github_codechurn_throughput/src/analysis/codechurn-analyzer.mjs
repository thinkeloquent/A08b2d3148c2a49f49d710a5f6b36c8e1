import { CHURN_CLASSIFICATION, PR_SIZE_BUCKETS } from "../domain/models.mjs";

/**
 * Code Churn vs. Throughput Analyzer — measures how much code is rewritten
 * or deleted compared to new feature growth.
 *
 * Metrics computed:
 * - churnRate = (totalDeletions / totalAdditions) x 100
 * - netThroughput = totalAdditions - totalDeletions
 * - throughputRatio = netThroughput / totalAdditions
 * - healthClassification based on churnRate
 * - Per-PR churn breakdown
 * - Weekly trends, per-repo breakdown, size-bucket distribution
 */
export class CodeChurnAnalyzer {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Analyze code churn metrics from PR data.
   * @param {{ pullRequests: Array }} data
   * @param {{ log: Function }} deps
   * @returns {object} churn analytics
   */
  analyze(data, { log }) {
    const { pullRequests } = data;

    if (!Array.isArray(pullRequests)) {
      throw new Error("CodeChurnAnalyzer expects pullRequests array");
    }

    if (pullRequests.length === 0) {
      return this.emptyResult();
    }

    const useCommitStats = this.options.granularity === "commit";

    // ── 1. Compute per-PR churn metrics ─────────────────────────────
    const prMetrics = pullRequests.map((pr) => {
      const additions = useCommitStats && pr._commitAdditions != null
        ? pr._commitAdditions
        : (pr.additions || 0);
      const deletions = useCommitStats && pr._commitDeletions != null
        ? pr._commitDeletions
        : (pr.deletions || 0);
      const totalChanges = additions + deletions;
      const churnRate = additions > 0
        ? round((deletions / additions) * 100)
        : (deletions > 0 ? 100 : 0);
      const netThroughput = additions - deletions;

      return {
        number: pr.number,
        title: pr.title,
        state: pr.state,
        created_at: pr.created_at,
        merged_at: pr.merged_at || null,
        html_url: pr.html_url || "",
        repository: pr.repository?.full_name || "unknown",
        additions,
        deletions,
        changed_files: pr.changed_files || 0,
        totalChanges,
        churnRate,
        netThroughput,
        healthClassification: classifyChurnHealth(churnRate),
      };
    });

    // ── 2. Compute aggregate summary ────────────────────────────────
    const totalAdditions = prMetrics.reduce((sum, pr) => sum + pr.additions, 0);
    const totalDeletions = prMetrics.reduce((sum, pr) => sum + pr.deletions, 0);
    const totalChangedFiles = prMetrics.reduce((sum, pr) => sum + pr.changed_files, 0);
    const overallChurnRate = totalAdditions > 0
      ? round((totalDeletions / totalAdditions) * 100)
      : (totalDeletions > 0 ? 100 : 0);
    const netThroughput = totalAdditions - totalDeletions;
    const throughputRatio = totalAdditions > 0
      ? round(netThroughput / totalAdditions)
      : 0;
    const healthClassification = classifyChurnHealth(overallChurnRate);

    // Median churn rate
    const sortedChurnRates = [...prMetrics]
      .map((pr) => pr.churnRate)
      .sort((a, b) => a - b);
    const medianChurnRate = sortedChurnRates.length > 0
      ? round(sortedChurnRates[Math.floor(sortedChurnRates.length / 2)])
      : 0;

    // Average churn rate
    const avgChurnRate = prMetrics.length > 0
      ? round(prMetrics.reduce((sum, pr) => sum + pr.churnRate, 0) / prMetrics.length)
      : 0;

    // ── 3. Health distribution ──────────────────────────────────────
    const healthDistribution = computeHealthDistribution(prMetrics);

    // ── 4. Weekly trends ────────────────────────────────────────────
    const weeklyTrends = computeWeeklyTrends(prMetrics);

    // ── 5. Per-repository breakdown ─────────────────────────────────
    const repositoryBreakdown = computeRepositoryBreakdown(prMetrics);

    // ── 6. PR size vs. churn distribution ───────────────────────────
    const sizeBucketDistribution = computeSizeBucketDistribution(prMetrics);

    // ── 7. Highest churn PRs (top 10) ───────────────────────────────
    const highestChurnPRs = [...prMetrics]
      .filter((pr) => pr.additions > 0)
      .sort((a, b) => b.churnRate - a.churnRate)
      .slice(0, 10)
      .map((pr) => ({
        number: pr.number,
        title: pr.title,
        repository: pr.repository,
        additions: pr.additions,
        deletions: pr.deletions,
        churnRate: pr.churnRate,
        netThroughput: pr.netThroughput,
        healthClassification: pr.healthClassification,
        html_url: pr.html_url,
      }));

    return {
      summary: {
        totalPRs: prMetrics.length,
        totalAdditions,
        totalDeletions,
        totalChangedFiles,
        overallChurnRate,
        netThroughput,
        throughputRatio,
        medianChurnRate,
        avgChurnRate,
        healthClassification,
        granularity: this.options.granularity || "pr",
      },
      weeklyTrends,
      repositoryBreakdown,
      healthDistribution,
      sizeBucketDistribution,
      highestChurnPRs,
      prMetrics,
    };
  }

  emptyResult() {
    return {
      summary: {
        totalPRs: 0,
        totalAdditions: 0,
        totalDeletions: 0,
        totalChangedFiles: 0,
        overallChurnRate: 0,
        netThroughput: 0,
        throughputRatio: 0,
        medianChurnRate: 0,
        avgChurnRate: 0,
        healthClassification: "excellent",
        granularity: this.options.granularity || "pr",
      },
      weeklyTrends: [],
      repositoryBreakdown: [],
      healthDistribution: {},
      sizeBucketDistribution: {},
      highestChurnPRs: [],
      prMetrics: [],
    };
  }
}

/**
 * Classify churn health based on churn rate percentage.
 */
function classifyChurnHealth(churnRate) {
  if (churnRate < CHURN_CLASSIFICATION.EXCELLENT.max)
    return CHURN_CLASSIFICATION.EXCELLENT.label;
  if (churnRate < CHURN_CLASSIFICATION.HEALTHY.max)
    return CHURN_CLASSIFICATION.HEALTHY.label;
  if (churnRate < CHURN_CLASSIFICATION.MODERATE.max)
    return CHURN_CLASSIFICATION.MODERATE.label;
  if (churnRate < CHURN_CLASSIFICATION.CONCERNING.max)
    return CHURN_CLASSIFICATION.CONCERNING.label;
  return CHURN_CLASSIFICATION.CRITICAL.label;
}

/**
 * Compute health distribution — count of PRs in each health bucket.
 */
function computeHealthDistribution(prMetrics) {
  const distribution = {
    excellent: 0,
    healthy: 0,
    moderate: 0,
    concerning: 0,
    critical: 0,
  };

  for (const pr of prMetrics) {
    const bucket = pr.healthClassification;
    if (distribution[bucket] !== undefined) {
      distribution[bucket]++;
    }
  }

  return distribution;
}

/**
 * Compute weekly trends for churn metrics.
 */
function computeWeeklyTrends(prMetrics) {
  const weekMap = new Map();

  for (const pr of prMetrics) {
    const prDate = new Date(pr.created_at);
    const weekStart = new Date(prDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split("T")[0];

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        totalPRs: 0,
        additions: 0,
        deletions: 0,
      });
    }

    const week = weekMap.get(weekKey);
    week.totalPRs++;
    week.additions += pr.additions;
    week.deletions += pr.deletions;
  }

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, data]) => ({
      weekStart,
      totalPRs: data.totalPRs,
      additions: data.additions,
      deletions: data.deletions,
      netThroughput: data.additions - data.deletions,
      churnRate:
        data.additions > 0
          ? round((data.deletions / data.additions) * 100)
          : 0,
    }));
}

/**
 * Compute per-repository breakdown.
 */
function computeRepositoryBreakdown(prMetrics) {
  const repoMap = new Map();

  for (const pr of prMetrics) {
    const repo = pr.repository;
    if (!repoMap.has(repo)) {
      repoMap.set(repo, {
        totalPRs: 0,
        additions: 0,
        deletions: 0,
      });
    }

    const data = repoMap.get(repo);
    data.totalPRs++;
    data.additions += pr.additions;
    data.deletions += pr.deletions;
  }

  return Array.from(repoMap.entries())
    .sort(([, a], [, b]) => b.totalPRs - a.totalPRs)
    .map(([repo, data]) => ({
      repository: repo,
      totalPRs: data.totalPRs,
      additions: data.additions,
      deletions: data.deletions,
      netThroughput: data.additions - data.deletions,
      churnRate:
        data.additions > 0
          ? round((data.deletions / data.additions) * 100)
          : 0,
    }));
}

/**
 * Compute PR size bucket distribution — churn by PR size.
 */
function computeSizeBucketDistribution(prMetrics) {
  const buckets = {};
  for (const [, bucket] of Object.entries(PR_SIZE_BUCKETS)) {
    buckets[bucket.label] = {
      count: 0,
      totalAdditions: 0,
      totalDeletions: 0,
    };
  }

  for (const pr of prMetrics) {
    const totalLines = pr.additions + pr.deletions;
    const bucket = getSizeBucket(totalLines);
    const entry = buckets[bucket];
    if (entry) {
      entry.count++;
      entry.totalAdditions += pr.additions;
      entry.totalDeletions += pr.deletions;
    }
  }

  // Compute churn rate per bucket
  const result = {};
  for (const [label, data] of Object.entries(buckets)) {
    result[label] = {
      count: data.count,
      totalAdditions: data.totalAdditions,
      totalDeletions: data.totalDeletions,
      churnRate:
        data.totalAdditions > 0
          ? round((data.totalDeletions / data.totalAdditions) * 100)
          : 0,
    };
  }

  return result;
}

/**
 * Get the size bucket label for a given total line count.
 */
function getSizeBucket(totalLines) {
  for (const [, bucket] of Object.entries(PR_SIZE_BUCKETS)) {
    if (totalLines < bucket.max) {
      return bucket.label;
    }
  }
  return PR_SIZE_BUCKETS.XLARGE.label;
}

/**
 * Round to 2 decimal places.
 */
function round(value) {
  if (value === null || value === undefined) return null;
  return Math.round(value * 100) / 100;
}
