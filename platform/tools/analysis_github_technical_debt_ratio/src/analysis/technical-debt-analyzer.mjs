import {
  WORK_TYPES,
  CLASSIFICATION_PATTERNS,
  DEBT_HEALTH,
} from "../domain/models.mjs";

/**
 * Technical Debt Analyzer — classifies commits into Feature/Fix/Refactor/Chore
 * and computes the technical debt ratio.
 *
 * Metrics computed:
 * - debtRatio = (fixes + refactors) / totalCommits
 * - Work-type distribution (counts and percentages)
 * - Weekly trends, per-repo breakdown
 * - Health classification
 */
export class TechnicalDebtAnalyzer {
  constructor() {}

  /**
   * Analyze technical debt metrics from commit data.
   * @param {{ commits: Array }} data
   * @param {{ log: Function }} deps
   * @returns {object} debt analytics
   */
  analyze(data, { log }) {
    const { commits } = data;

    if (!Array.isArray(commits)) {
      throw new Error("TechnicalDebtAnalyzer expects commits array");
    }

    if (commits.length === 0) {
      return this.emptyResult();
    }

    // ── 1. Classify each commit ─────────────────────────────────────
    const commitMetrics = commits.map((commit) => {
      const workType = classifyCommit(commit.message);

      return {
        sha: commit.sha,
        message: truncateMessage(commit.message),
        date: commit.date,
        repository: commit.repository,
        html_url: commit.html_url || "",
        workType,
        isDebt: workType === WORK_TYPES.FIX || workType === WORK_TYPES.REFACTOR,
      };
    });

    // ── 2. Compute aggregate summary ────────────────────────────────
    const totalCommits = commitMetrics.length;

    const featureCount = commitMetrics.filter((c) => c.workType === WORK_TYPES.FEATURE).length;
    const fixCount = commitMetrics.filter((c) => c.workType === WORK_TYPES.FIX).length;
    const refactorCount = commitMetrics.filter((c) => c.workType === WORK_TYPES.REFACTOR).length;
    const choreCount = commitMetrics.filter((c) => c.workType === WORK_TYPES.CHORE).length;

    const debtCount = fixCount + refactorCount;
    const debtRatio = totalCommits > 0 ? round(debtCount / totalCommits) : 0;
    const featureRatio = totalCommits > 0 ? round(featureCount / totalCommits) : 0;
    const fixRatio = totalCommits > 0 ? round(fixCount / totalCommits) : 0;
    const refactorRatio = totalCommits > 0 ? round(refactorCount / totalCommits) : 0;
    const choreRatio = totalCommits > 0 ? round(choreCount / totalCommits) : 0;

    const healthClassification = classifyDebtHealth(debtRatio);

    // ── 3. Work-type distribution ───────────────────────────────────
    const workTypeDistribution = {
      [WORK_TYPES.FEATURE]: { count: featureCount, ratio: featureRatio, percentage: round(featureRatio * 100) },
      [WORK_TYPES.FIX]: { count: fixCount, ratio: fixRatio, percentage: round(fixRatio * 100) },
      [WORK_TYPES.REFACTOR]: { count: refactorCount, ratio: refactorRatio, percentage: round(refactorRatio * 100) },
      [WORK_TYPES.CHORE]: { count: choreCount, ratio: choreRatio, percentage: round(choreRatio * 100) },
    };

    // ── 4. Weekly trends ────────────────────────────────────────────
    const weeklyTrends = computeWeeklyTrends(commitMetrics);

    // ── 5. Per-repository breakdown ─────────────────────────────────
    const repositoryBreakdown = computeRepositoryBreakdown(commitMetrics);

    // ── 6. Top debt commits (most recent fixes + refactors, top 10) ─
    const topDebtCommits = commitMetrics
      .filter((c) => c.isDebt)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
      .map((c) => ({
        sha: c.sha,
        message: c.message,
        repository: c.repository,
        date: c.date,
        workType: c.workType,
        html_url: c.html_url,
      }));

    return {
      summary: {
        totalCommits,
        featureCount,
        fixCount,
        refactorCount,
        choreCount,
        debtCount,
        debtRatio,
        debtPercentage: round(debtRatio * 100),
        featureRatio,
        featurePercentage: round(featureRatio * 100),
        fixRatio,
        fixPercentage: round(fixRatio * 100),
        refactorRatio,
        refactorPercentage: round(refactorRatio * 100),
        choreRatio,
        chorePercentage: round(choreRatio * 100),
        healthClassification,
      },
      workTypeDistribution,
      weeklyTrends,
      repositoryBreakdown,
      topDebtCommits,
      commitMetrics,
    };
  }

  emptyResult() {
    return {
      summary: {
        totalCommits: 0,
        featureCount: 0,
        fixCount: 0,
        refactorCount: 0,
        choreCount: 0,
        debtCount: 0,
        debtRatio: 0,
        debtPercentage: 0,
        featureRatio: 0,
        featurePercentage: 0,
        fixRatio: 0,
        fixPercentage: 0,
        refactorRatio: 0,
        refactorPercentage: 0,
        choreRatio: 0,
        chorePercentage: 0,
        healthClassification: "excellent",
      },
      workTypeDistribution: {
        [WORK_TYPES.FEATURE]: { count: 0, ratio: 0, percentage: 0 },
        [WORK_TYPES.FIX]: { count: 0, ratio: 0, percentage: 0 },
        [WORK_TYPES.REFACTOR]: { count: 0, ratio: 0, percentage: 0 },
        [WORK_TYPES.CHORE]: { count: 0, ratio: 0, percentage: 0 },
      },
      weeklyTrends: [],
      repositoryBreakdown: [],
      topDebtCommits: [],
      commitMetrics: [],
    };
  }
}

/**
 * Classify a commit message into a work type using keyword matching.
 * Uses conventional commit prefix first (e.g., "feat:", "fix:"), then
 * falls back to keyword scanning.
 *
 * @param {string} message
 * @returns {string} One of WORK_TYPES values
 */
function classifyCommit(message) {
  if (!message) return WORK_TYPES.CHORE;

  const firstLine = message.split("\n")[0].toLowerCase().trim();

  // Check for conventional commit prefix (e.g., "feat:", "fix:", "refactor:")
  const prefixMatch = firstLine.match(/^(\w+)(?:\(.+?\))?:/);
  if (prefixMatch) {
    const prefix = prefixMatch[1];
    if (prefix === "feat" || prefix === "feature") return WORK_TYPES.FEATURE;
    if (prefix === "fix" || prefix === "bugfix" || prefix === "hotfix") return WORK_TYPES.FIX;
    if (prefix === "refactor") return WORK_TYPES.REFACTOR;
    if (["chore", "build", "ci", "docs", "style", "test", "perf"].includes(prefix)) return WORK_TYPES.CHORE;
  }

  // Keyword matching — first match wins
  for (const pattern of CLASSIFICATION_PATTERNS) {
    for (const keyword of pattern.keywords) {
      // Word-boundary-aware check to avoid partial matches
      const regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, "i");
      if (regex.test(firstLine)) {
        return pattern.type;
      }
    }
  }

  // Default: chore (maintenance / uncategorized)
  return WORK_TYPES.CHORE;
}

/**
 * Classify debt health based on the debt ratio.
 */
function classifyDebtHealth(debtRatio) {
  if (debtRatio < DEBT_HEALTH.EXCELLENT.max) return DEBT_HEALTH.EXCELLENT.label;
  if (debtRatio < DEBT_HEALTH.HEALTHY.max) return DEBT_HEALTH.HEALTHY.label;
  if (debtRatio < DEBT_HEALTH.MODERATE.max) return DEBT_HEALTH.MODERATE.label;
  if (debtRatio < DEBT_HEALTH.CONCERNING.max) return DEBT_HEALTH.CONCERNING.label;
  return DEBT_HEALTH.CRITICAL.label;
}

/**
 * Compute weekly trends for work-type distribution.
 */
function computeWeeklyTrends(commitMetrics) {
  const weekMap = new Map();

  for (const commit of commitMetrics) {
    const commitDate = new Date(commit.date);
    const weekStart = new Date(commitDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split("T")[0];

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        totalCommits: 0,
        featureCount: 0,
        fixCount: 0,
        refactorCount: 0,
        choreCount: 0,
      });
    }

    const week = weekMap.get(weekKey);
    week.totalCommits++;
    if (commit.workType === WORK_TYPES.FEATURE) week.featureCount++;
    else if (commit.workType === WORK_TYPES.FIX) week.fixCount++;
    else if (commit.workType === WORK_TYPES.REFACTOR) week.refactorCount++;
    else week.choreCount++;
  }

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, data]) => {
      const debtCount = data.fixCount + data.refactorCount;
      return {
        weekStart,
        totalCommits: data.totalCommits,
        featureCount: data.featureCount,
        fixCount: data.fixCount,
        refactorCount: data.refactorCount,
        choreCount: data.choreCount,
        debtCount,
        debtRatio:
          data.totalCommits > 0
            ? round(debtCount / data.totalCommits)
            : 0,
        debtPercentage:
          data.totalCommits > 0
            ? round((debtCount / data.totalCommits) * 100)
            : 0,
      };
    });
}

/**
 * Compute per-repository breakdown.
 */
function computeRepositoryBreakdown(commitMetrics) {
  const repoMap = new Map();

  for (const commit of commitMetrics) {
    const repo = commit.repository;
    if (!repoMap.has(repo)) {
      repoMap.set(repo, {
        totalCommits: 0,
        featureCount: 0,
        fixCount: 0,
        refactorCount: 0,
        choreCount: 0,
      });
    }

    const data = repoMap.get(repo);
    data.totalCommits++;
    if (commit.workType === WORK_TYPES.FEATURE) data.featureCount++;
    else if (commit.workType === WORK_TYPES.FIX) data.fixCount++;
    else if (commit.workType === WORK_TYPES.REFACTOR) data.refactorCount++;
    else data.choreCount++;
  }

  return Array.from(repoMap.entries())
    .sort(([, a], [, b]) => b.totalCommits - a.totalCommits)
    .map(([repo, data]) => {
      const debtCount = data.fixCount + data.refactorCount;
      return {
        repository: repo,
        totalCommits: data.totalCommits,
        featureCount: data.featureCount,
        fixCount: data.fixCount,
        refactorCount: data.refactorCount,
        choreCount: data.choreCount,
        debtCount,
        debtRatio:
          data.totalCommits > 0
            ? round(debtCount / data.totalCommits)
            : 0,
        debtPercentage:
          data.totalCommits > 0
            ? round((debtCount / data.totalCommits) * 100)
            : 0,
      };
    });
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
 * Escape special regex characters in a string.
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Round to 2 decimal places.
 */
function round(value) {
  if (value === null || value === undefined) return null;
  return Math.round(value * 100) / 100;
}
