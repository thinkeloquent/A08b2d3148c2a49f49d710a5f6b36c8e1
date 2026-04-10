import {
  ATOMICITY_HEALTH,
  COMMIT_SIZE_BUCKETS,
} from "../domain/models.mjs";

/**
 * Commit Atomicity Analyzer — measures the distribution of changes per commit
 * to identify "review-proof" monolithic commits.
 *
 * Metrics computed:
 * - averageCommitImpact = sum(additions + deletions) / totalCommits
 * - atomicityScore = % of commits where lines < linesThreshold AND files < filesThreshold
 * - Per-commit classification (atomic vs. non-atomic)
 * - Weekly trends, per-repo breakdown, size-bucket distribution
 */
export class CommitAtomicityAnalyzer {
  constructor(options = {}) {
    this.linesThreshold = options.linesThreshold || 200;
    this.filesThreshold = options.filesThreshold || 10;
  }

  /**
   * Analyze commit atomicity metrics from commit data.
   * @param {{ commits: Array }} data
   * @param {{ log: Function }} deps
   * @returns {object} atomicity analytics
   */
  analyze(data, { log }) {
    const { commits } = data;

    if (!Array.isArray(commits)) {
      throw new Error("CommitAtomicityAnalyzer expects commits array");
    }

    if (commits.length === 0) {
      return this.emptyResult();
    }

    // ── 1. Compute per-commit metrics ─────────────────────────────────
    const commitMetrics = commits.map((commit) => {
      const additions = commit.additions || 0;
      const deletions = commit.deletions || 0;
      const totalLines = additions + deletions;
      const filesChanged = commit.filesChanged || 0;
      const isAtomic =
        totalLines <= this.linesThreshold && filesChanged <= this.filesThreshold;
      const sizeBucket = getSizeBucket(totalLines, filesChanged);

      return {
        sha: commit.sha,
        message: truncateMessage(commit.message),
        date: commit.date,
        repository: commit.repository,
        html_url: commit.html_url || "",
        additions,
        deletions,
        totalLines,
        filesChanged,
        isAtomic,
        sizeBucket,
      };
    });

    // ── 2. Compute aggregate summary ──────────────────────────────────
    const totalCommits = commitMetrics.length;
    const totalAdditions = commitMetrics.reduce((sum, c) => sum + c.additions, 0);
    const totalDeletions = commitMetrics.reduce((sum, c) => sum + c.deletions, 0);
    const totalLines = totalAdditions + totalDeletions;
    const totalFilesChanged = commitMetrics.reduce((sum, c) => sum + c.filesChanged, 0);

    const averageCommitImpact = totalCommits > 0
      ? round(totalLines / totalCommits)
      : 0;
    const averageFilesPerCommit = totalCommits > 0
      ? round(totalFilesChanged / totalCommits)
      : 0;

    const atomicCount = commitMetrics.filter((c) => c.isAtomic).length;
    const atomicityScore = totalCommits > 0
      ? round((atomicCount / totalCommits) * 100)
      : 0;
    const healthClassification = classifyAtomicityHealth(atomicityScore);

    // Median commit size (total lines)
    const sortedLineCounts = [...commitMetrics]
      .map((c) => c.totalLines)
      .sort((a, b) => a - b);
    const medianCommitSize = sortedLineCounts.length > 0
      ? sortedLineCounts[Math.floor(sortedLineCounts.length / 2)]
      : 0;

    // Median files per commit
    const sortedFileCounts = [...commitMetrics]
      .map((c) => c.filesChanged)
      .sort((a, b) => a - b);
    const medianFilesPerCommit = sortedFileCounts.length > 0
      ? sortedFileCounts[Math.floor(sortedFileCounts.length / 2)]
      : 0;

    // ── 3. Size bucket distribution ───────────────────────────────────
    const sizeBucketDistribution = computeSizeBucketDistribution(commitMetrics);

    // ── 4. Weekly trends ──────────────────────────────────────────────
    const weeklyTrends = computeWeeklyTrends(commitMetrics, this.linesThreshold, this.filesThreshold);

    // ── 5. Per-repository breakdown ───────────────────────────────────
    const repositoryBreakdown = computeRepositoryBreakdown(
      commitMetrics,
      this.linesThreshold,
      this.filesThreshold
    );

    // ── 6. Largest commits (top 10) ───────────────────────────────────
    const largestCommits = [...commitMetrics]
      .sort((a, b) => b.totalLines - a.totalLines)
      .slice(0, 10)
      .map((c) => ({
        sha: c.sha,
        message: c.message,
        repository: c.repository,
        date: c.date,
        additions: c.additions,
        deletions: c.deletions,
        totalLines: c.totalLines,
        filesChanged: c.filesChanged,
        isAtomic: c.isAtomic,
        sizeBucket: c.sizeBucket,
        html_url: c.html_url,
      }));

    return {
      summary: {
        totalCommits,
        totalAdditions,
        totalDeletions,
        totalLines,
        totalFilesChanged,
        averageCommitImpact,
        averageFilesPerCommit,
        medianCommitSize,
        medianFilesPerCommit,
        atomicCount,
        nonAtomicCount: totalCommits - atomicCount,
        atomicityScore,
        healthClassification,
        linesThreshold: this.linesThreshold,
        filesThreshold: this.filesThreshold,
      },
      weeklyTrends,
      repositoryBreakdown,
      sizeBucketDistribution,
      largestCommits,
      commitMetrics,
    };
  }

  emptyResult() {
    return {
      summary: {
        totalCommits: 0,
        totalAdditions: 0,
        totalDeletions: 0,
        totalLines: 0,
        totalFilesChanged: 0,
        averageCommitImpact: 0,
        averageFilesPerCommit: 0,
        medianCommitSize: 0,
        medianFilesPerCommit: 0,
        atomicCount: 0,
        nonAtomicCount: 0,
        atomicityScore: 0,
        healthClassification: "excellent",
        linesThreshold: this.linesThreshold,
        filesThreshold: this.filesThreshold,
      },
      weeklyTrends: [],
      repositoryBreakdown: [],
      sizeBucketDistribution: {},
      largestCommits: [],
      commitMetrics: [],
    };
  }
}

/**
 * Classify atomicity health based on the atomicity score (% of atomic commits).
 */
function classifyAtomicityHealth(atomicityScore) {
  if (atomicityScore >= ATOMICITY_HEALTH.EXCELLENT.min)
    return ATOMICITY_HEALTH.EXCELLENT.label;
  if (atomicityScore >= ATOMICITY_HEALTH.HEALTHY.min)
    return ATOMICITY_HEALTH.HEALTHY.label;
  if (atomicityScore >= ATOMICITY_HEALTH.MODERATE.min)
    return ATOMICITY_HEALTH.MODERATE.label;
  if (atomicityScore >= ATOMICITY_HEALTH.CONCERNING.min)
    return ATOMICITY_HEALTH.CONCERNING.label;
  return ATOMICITY_HEALTH.CRITICAL.label;
}

/**
 * Get the size bucket label for a given commit.
 */
function getSizeBucket(totalLines, filesChanged) {
  if (totalLines < COMMIT_SIZE_BUCKETS.TINY.maxLines && filesChanged < COMMIT_SIZE_BUCKETS.TINY.maxFiles)
    return COMMIT_SIZE_BUCKETS.TINY.label;
  if (totalLines < COMMIT_SIZE_BUCKETS.SMALL.maxLines && filesChanged < COMMIT_SIZE_BUCKETS.SMALL.maxFiles)
    return COMMIT_SIZE_BUCKETS.SMALL.label;
  if (totalLines < COMMIT_SIZE_BUCKETS.MEDIUM.maxLines && filesChanged < COMMIT_SIZE_BUCKETS.MEDIUM.maxFiles)
    return COMMIT_SIZE_BUCKETS.MEDIUM.label;
  if (totalLines < COMMIT_SIZE_BUCKETS.LARGE.maxLines && filesChanged < COMMIT_SIZE_BUCKETS.LARGE.maxFiles)
    return COMMIT_SIZE_BUCKETS.LARGE.label;
  return COMMIT_SIZE_BUCKETS.MONOLITHIC.label;
}

/**
 * Compute size bucket distribution — count of commits in each size category.
 */
function computeSizeBucketDistribution(commitMetrics) {
  const buckets = {};
  for (const bucket of Object.values(COMMIT_SIZE_BUCKETS)) {
    buckets[bucket.label] = {
      count: 0,
      totalLines: 0,
      totalFiles: 0,
    };
  }

  for (const commit of commitMetrics) {
    const entry = buckets[commit.sizeBucket];
    if (entry) {
      entry.count++;
      entry.totalLines += commit.totalLines;
      entry.totalFiles += commit.filesChanged;
    }
  }

  // Compute averages per bucket
  const result = {};
  for (const [label, data] of Object.entries(buckets)) {
    result[label] = {
      count: data.count,
      totalLines: data.totalLines,
      totalFiles: data.totalFiles,
      avgLines: data.count > 0 ? round(data.totalLines / data.count) : 0,
      avgFiles: data.count > 0 ? round(data.totalFiles / data.count) : 0,
    };
  }

  return result;
}

/**
 * Compute weekly trends for commit atomicity.
 */
function computeWeeklyTrends(commitMetrics, linesThreshold, filesThreshold) {
  const weekMap = new Map();

  for (const commit of commitMetrics) {
    const commitDate = new Date(commit.date);
    const weekStart = new Date(commitDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split("T")[0];

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        totalCommits: 0,
        atomicCount: 0,
        totalLines: 0,
        totalFiles: 0,
      });
    }

    const week = weekMap.get(weekKey);
    week.totalCommits++;
    if (commit.isAtomic) week.atomicCount++;
    week.totalLines += commit.totalLines;
    week.totalFiles += commit.filesChanged;
  }

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, data]) => ({
      weekStart,
      totalCommits: data.totalCommits,
      atomicCount: data.atomicCount,
      nonAtomicCount: data.totalCommits - data.atomicCount,
      atomicityScore:
        data.totalCommits > 0
          ? round((data.atomicCount / data.totalCommits) * 100)
          : 0,
      avgCommitImpact:
        data.totalCommits > 0
          ? round(data.totalLines / data.totalCommits)
          : 0,
      avgFilesPerCommit:
        data.totalCommits > 0
          ? round(data.totalFiles / data.totalCommits)
          : 0,
    }));
}

/**
 * Compute per-repository breakdown.
 */
function computeRepositoryBreakdown(commitMetrics, linesThreshold, filesThreshold) {
  const repoMap = new Map();

  for (const commit of commitMetrics) {
    const repo = commit.repository;
    if (!repoMap.has(repo)) {
      repoMap.set(repo, {
        totalCommits: 0,
        atomicCount: 0,
        totalLines: 0,
        totalFiles: 0,
      });
    }

    const data = repoMap.get(repo);
    data.totalCommits++;
    if (commit.isAtomic) data.atomicCount++;
    data.totalLines += commit.totalLines;
    data.totalFiles += commit.filesChanged;
  }

  return Array.from(repoMap.entries())
    .sort(([, a], [, b]) => b.totalCommits - a.totalCommits)
    .map(([repo, data]) => ({
      repository: repo,
      totalCommits: data.totalCommits,
      atomicCount: data.atomicCount,
      nonAtomicCount: data.totalCommits - data.atomicCount,
      atomicityScore:
        data.totalCommits > 0
          ? round((data.atomicCount / data.totalCommits) * 100)
          : 0,
      avgCommitImpact:
        data.totalCommits > 0
          ? round(data.totalLines / data.totalCommits)
          : 0,
      avgFilesPerCommit:
        data.totalCommits > 0
          ? round(data.totalFiles / data.totalCommits)
          : 0,
    }));
}

/**
 * Truncate commit message to first line, max 120 chars.
 */
function truncateMessage(message) {
  if (!message) return "";
  const firstLine = message.split("\n")[0];
  return firstLine.length > 120 ? firstLine.slice(0, 117) + "..." : firstLine;
}

/**
 * Round to 2 decimal places.
 */
function round(value) {
  if (value === null || value === undefined) return null;
  return Math.round(value * 100) / 100;
}
