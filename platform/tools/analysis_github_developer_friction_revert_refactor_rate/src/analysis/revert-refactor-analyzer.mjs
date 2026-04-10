import {
  PR_CLASSIFICATION,
  REVERT_PATTERNS,
  FRICTION_CLASSIFICATION,
  REVIEW_STATES,
} from "../domain/models.mjs";

/**
 * Revert/Refactor Rate Analyzer — measures how frequently a developer's PRs
 * are reverted or require significant rework after review feedback.
 *
 * Metrics computed:
 * - revertRate = revertedPRs / totalMergedPRs
 * - reworkRate = reworkedPRs / totalPRs
 * - frictionRate = (reverted + reworked) / totalPRs
 * - frictionClassification based on frictionRate
 * - Review round-trip distribution
 * - Weekly trends, per-repo breakdown
 */
export class RevertRefactorAnalyzer {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Analyze revert/refactor metrics from PR data.
   * @param {{ pullRequests: Array, revertPRs: Array }} data
   * @param {{ log: Function }} deps
   * @returns {object} revert/refactor analytics
   */
  analyze(data, { log }) {
    const { pullRequests, revertPRs } = data;

    if (!Array.isArray(pullRequests)) {
      throw new Error("RevertRefactorAnalyzer expects pullRequests array");
    }

    if (pullRequests.length === 0) {
      return this.emptyResult();
    }

    const reworkThreshold = this.options.reworkThreshold || 3;
    const postMergeWindowHours = this.options.postMergeWindowHours || 72;

    // ── 1. Classify each PR ───────────────────────────────────────────
    const classifiedPRs = pullRequests.map((pr) => {
      const classification = classifyPR(pr, revertPRs, reworkThreshold, postMergeWindowHours);
      return {
        number: pr.number,
        title: pr.title,
        state: pr.state,
        created_at: pr.created_at,
        merged_at: pr.merged_at || null,
        closed_at: pr.closed_at || null,
        html_url: pr.html_url || "",
        repository: pr.repository?.full_name || "unknown",
        additions: pr.additions || 0,
        deletions: pr.deletions || 0,
        changed_files: pr.changed_files || 0,
        review_comments: pr.review_comments || 0,
        reviewRoundTrips: pr._reviewRoundTrips || 0,
        changesRequestedCount: pr._changesRequestedCount || 0,
        hasRevertCommit: pr._hasRevertCommit || false,
        classification: classification.type,
        classificationReason: classification.reason,
      };
    });

    // ── 2. Compute summary metrics ────────────────────────────────────
    const totalPRs = classifiedPRs.length;
    const mergedPRs = classifiedPRs.filter((pr) => pr.merged_at);
    const totalMergedPRs = mergedPRs.length;

    const revertedPRs = classifiedPRs.filter(
      (pr) => pr.classification === PR_CLASSIFICATION.REVERTED
    );
    const reworkedPRs = classifiedPRs.filter(
      (pr) => pr.classification === PR_CLASSIFICATION.REWORKED
    );
    const cleanPRs = classifiedPRs.filter(
      (pr) => pr.classification === PR_CLASSIFICATION.CLEAN
    );

    const revertRate = totalMergedPRs > 0
      ? round(revertedPRs.length / totalMergedPRs)
      : 0;
    const reworkRate = totalPRs > 0
      ? round(reworkedPRs.length / totalPRs)
      : 0;
    const frictionRate = totalPRs > 0
      ? round((revertedPRs.length + reworkedPRs.length) / totalPRs)
      : 0;
    const cleanRate = totalPRs > 0
      ? round(cleanPRs.length / totalPRs)
      : 0;

    const frictionClassification = classifyFriction(frictionRate);

    // ── 3. Review round-trip distribution ─────────────────────────────
    const roundTripDistribution = computeRoundTripDistribution(classifiedPRs);

    // ── 4. Average review round-trips ─────────────────────────────────
    const prsWithReviews = classifiedPRs.filter((pr) => pr.reviewRoundTrips > 0);
    const avgReviewRoundTrips = prsWithReviews.length > 0
      ? round(
          prsWithReviews.reduce((sum, pr) => sum + pr.reviewRoundTrips, 0) /
            prsWithReviews.length
        )
      : 0;

    // ── 5. Average changes-requested per PR ───────────────────────────
    const avgChangesRequested = totalPRs > 0
      ? round(
          classifiedPRs.reduce((sum, pr) => sum + pr.changesRequestedCount, 0) /
            totalPRs
        )
      : 0;

    // ── 6. Weekly trends ──────────────────────────────────────────────
    const weeklyTrends = computeWeeklyTrends(classifiedPRs);

    // ── 7. Per-repository breakdown ───────────────────────────────────
    const repositoryBreakdown = computeRepositoryBreakdown(classifiedPRs);

    // ── 8. Most reworked PRs (top 10) ─────────────────────────────────
    const mostReworkedPRs = [...classifiedPRs]
      .sort((a, b) => b.reviewRoundTrips - a.reviewRoundTrips)
      .slice(0, 10)
      .filter((pr) => pr.reviewRoundTrips > 0)
      .map((pr) => ({
        number: pr.number,
        title: pr.title,
        repository: pr.repository,
        reviewRoundTrips: pr.reviewRoundTrips,
        changesRequestedCount: pr.changesRequestedCount,
        classification: pr.classification,
        html_url: pr.html_url,
      }));

    return {
      summary: {
        totalPRs,
        totalMergedPRs,
        revertedPRs: revertedPRs.length,
        reworkedPRs: reworkedPRs.length,
        cleanPRs: cleanPRs.length,
        revertRate,
        reworkRate,
        frictionRate,
        cleanRate,
        frictionClassification,
        avgReviewRoundTrips,
        avgChangesRequested,
        reworkThreshold,
      },
      weeklyTrends,
      repositoryBreakdown,
      roundTripDistribution,
      mostReworkedPRs,
      classifiedPRs,
    };
  }

  emptyResult() {
    return {
      summary: {
        totalPRs: 0,
        totalMergedPRs: 0,
        revertedPRs: 0,
        reworkedPRs: 0,
        cleanPRs: 0,
        revertRate: 0,
        reworkRate: 0,
        frictionRate: 0,
        cleanRate: 1,
        frictionClassification: "minimal",
        avgReviewRoundTrips: 0,
        avgChangesRequested: 0,
        reworkThreshold: this.options.reworkThreshold || 3,
      },
      weeklyTrends: [],
      repositoryBreakdown: [],
      roundTripDistribution: {},
      mostReworkedPRs: [],
      classifiedPRs: [],
    };
  }
}

/**
 * Classify a single PR as reverted, reworked, or clean.
 *
 * A PR is classified as:
 * - REVERTED: title matches revert patterns, has revert commits, or a revert PR targets it
 * - REWORKED: review round-trips >= reworkThreshold, or changes_requested >= threshold
 * - CLEAN: neither reverted nor reworked
 */
function classifyPR(pr, revertPRs, reworkThreshold, postMergeWindowHours) {
  // Check if this PR IS a revert PR (title matches revert patterns)
  const titleIsRevert = REVERT_PATTERNS.some((pattern) =>
    pattern.test(pr.title || "")
  );
  if (titleIsRevert) {
    return { type: PR_CLASSIFICATION.REVERTED, reason: "PR title indicates revert" };
  }

  // Check if this PR has revert commits
  if (pr._hasRevertCommit) {
    return { type: PR_CLASSIFICATION.REVERTED, reason: "PR contains revert commit(s)" };
  }

  // Check if any revert PR references this PR (by PR number in title)
  if (pr.merged_at) {
    const prRef = `#${pr.number}`;
    const titleRef = `"${pr.title}"`;
    const revertedByAnother = revertPRs.some((revertPR) => {
      if (revertPR.id === pr.id) return false;
      const revertTitle = revertPR.title || "";
      const revertBody = revertPR.body || "";
      const revertRepo = revertPR.repository?.full_name;
      const prRepo = pr.repository?.full_name;

      // Must be same repo
      if (revertRepo !== prRepo) return false;

      // Check if revert PR references this PR
      return (
        revertTitle.includes(prRef) ||
        revertTitle.includes(titleRef) ||
        revertBody.includes(prRef)
      );
    });

    if (revertedByAnother) {
      return { type: PR_CLASSIFICATION.REVERTED, reason: "Reverted by a subsequent PR" };
    }

    // Check for post-merge fix PRs (same repo, created within window after merge)
    const mergeTime = new Date(pr.merged_at).getTime();
    const windowMs = postMergeWindowHours * 60 * 60 * 1000;
    const postMergeFix = revertPRs.some((fixPR) => {
      if (fixPR.id === pr.id) return false;
      const fixRepo = fixPR.repository?.full_name;
      const prRepo = pr.repository?.full_name;
      if (fixRepo !== prRepo) return false;

      const fixCreated = new Date(fixPR.created_at).getTime();
      return fixCreated > mergeTime && fixCreated <= mergeTime + windowMs;
    });

    if (postMergeFix) {
      return { type: PR_CLASSIFICATION.REVERTED, reason: "Post-merge revert PR within window" };
    }
  }

  // Check for significant rework via review round-trips
  const roundTrips = pr._reviewRoundTrips || 0;
  const changesRequested = pr._changesRequestedCount || 0;

  if (roundTrips >= reworkThreshold) {
    return {
      type: PR_CLASSIFICATION.REWORKED,
      reason: `${roundTrips} review round-trips (threshold: ${reworkThreshold})`,
    };
  }

  if (changesRequested >= reworkThreshold) {
    return {
      type: PR_CLASSIFICATION.REWORKED,
      reason: `${changesRequested} changes-requested reviews (threshold: ${reworkThreshold})`,
    };
  }

  return { type: PR_CLASSIFICATION.CLEAN, reason: "No revert or significant rework detected" };
}

/**
 * Classify friction level based on combined revert + rework rate.
 */
function classifyFriction(frictionRate) {
  if (frictionRate < FRICTION_CLASSIFICATION.MINIMAL.max)
    return FRICTION_CLASSIFICATION.MINIMAL.label;
  if (frictionRate < FRICTION_CLASSIFICATION.LOW.max)
    return FRICTION_CLASSIFICATION.LOW.label;
  if (frictionRate < FRICTION_CLASSIFICATION.MODERATE.max)
    return FRICTION_CLASSIFICATION.MODERATE.label;
  if (frictionRate < FRICTION_CLASSIFICATION.HIGH.max)
    return FRICTION_CLASSIFICATION.HIGH.label;
  return FRICTION_CLASSIFICATION.CRITICAL.label;
}

/**
 * Compute review round-trip distribution buckets.
 */
function computeRoundTripDistribution(classifiedPRs) {
  const buckets = {
    "0 (no review feedback)": 0,
    "1 round-trip": 0,
    "2 round-trips": 0,
    "3-4 round-trips": 0,
    "5+ round-trips": 0,
  };

  for (const pr of classifiedPRs) {
    const rt = pr.reviewRoundTrips;
    if (rt === 0) buckets["0 (no review feedback)"]++;
    else if (rt === 1) buckets["1 round-trip"]++;
    else if (rt === 2) buckets["2 round-trips"]++;
    else if (rt <= 4) buckets["3-4 round-trips"]++;
    else buckets["5+ round-trips"]++;
  }

  return buckets;
}

/**
 * Compute weekly trends for revert/rework rates.
 */
function computeWeeklyTrends(classifiedPRs) {
  const weekMap = new Map();

  for (const pr of classifiedPRs) {
    const prDate = new Date(pr.created_at);
    const weekStart = new Date(prDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split("T")[0];

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        total: 0,
        reverted: 0,
        reworked: 0,
        clean: 0,
      });
    }

    const week = weekMap.get(weekKey);
    week.total++;

    if (pr.classification === PR_CLASSIFICATION.REVERTED) week.reverted++;
    else if (pr.classification === PR_CLASSIFICATION.REWORKED) week.reworked++;
    else week.clean++;
  }

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, data]) => ({
      weekStart,
      totalPRs: data.total,
      reverted: data.reverted,
      reworked: data.reworked,
      clean: data.clean,
      frictionRate:
        data.total > 0
          ? round((data.reverted + data.reworked) / data.total)
          : 0,
    }));
}

/**
 * Compute per-repository breakdown.
 */
function computeRepositoryBreakdown(classifiedPRs) {
  const repoMap = new Map();

  for (const pr of classifiedPRs) {
    const repo = pr.repository;
    if (!repoMap.has(repo)) {
      repoMap.set(repo, {
        total: 0,
        reverted: 0,
        reworked: 0,
        clean: 0,
        totalRoundTrips: 0,
      });
    }

    const data = repoMap.get(repo);
    data.total++;
    data.totalRoundTrips += pr.reviewRoundTrips;

    if (pr.classification === PR_CLASSIFICATION.REVERTED) data.reverted++;
    else if (pr.classification === PR_CLASSIFICATION.REWORKED) data.reworked++;
    else data.clean++;
  }

  return Array.from(repoMap.entries())
    .sort(([, a], [, b]) => b.total - a.total)
    .map(([repo, data]) => ({
      repository: repo,
      totalPRs: data.total,
      reverted: data.reverted,
      reworked: data.reworked,
      clean: data.clean,
      frictionRate:
        data.total > 0
          ? round((data.reverted + data.reworked) / data.total)
          : 0,
      avgRoundTrips:
        data.total > 0 ? round(data.totalRoundTrips / data.total) : 0,
    }));
}

/**
 * Round to 2 decimal places.
 */
function round(value) {
  if (value === null || value === undefined) return null;
  return Math.round(value * 100) / 100;
}
