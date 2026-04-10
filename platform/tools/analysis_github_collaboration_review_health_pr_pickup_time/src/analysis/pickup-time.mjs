import { PICKUP_TIME_BUCKETS, RESPONSE_TYPES } from "../domain/models.mjs";

/**
 * PR Pickup Time Analyzer — measures the elapsed time from PR creation
 * to the first comment/review by someone other than the author.
 *
 * For each PR:
 *   1. Identify PR author (pr.user.login)
 *   2. From reviews: find first where user.login !== author (sorted by submitted_at ASC)
 *   3. From issue comments: find first where user.login !== author (sorted by created_at ASC)
 *   4. From review comments (optional): find first where user.login !== author (sorted by created_at ASC)
 *   5. Pick the earliest timestamp across up to 3 candidates
 *   6. pickup_time_hours = (earliest_response - pr.created_at) / ms_per_hour
 *   7. If no candidates → pickup_time = null (no pickup yet)
 */
export class PickupTimeAnalyzer {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Analyze pickup time metrics for a set of pull requests.
   * @param {Array} pullRequests - PRs enriched with _reviews, _issueComments, _reviewComments
   * @param {{ log: Function }} deps
   * @returns {object} pickup time analytics
   */
  analyze(pullRequests, { log }) {
    if (!Array.isArray(pullRequests)) {
      throw new Error("PickupTimeAnalyzer expects an array of pull requests");
    }

    if (pullRequests.length > 0 && !pullRequests[0].hasOwnProperty("number")) {
      throw new Error(
        "PickupTimeAnalyzer received invalid data: missing PR properties"
      );
    }

    const pickupData = [];
    let totalPickupHours = 0;
    let prsWithPickup = 0;

    pullRequests.forEach((pr) => {
      try {
        const author = pr.user?.login;
        if (!author) {
          log(`PR #${pr.number} has no author, skipping`, "warn");
          return;
        }

        const created = new Date(pr.created_at);
        if (isNaN(created.getTime())) {
          log(`PR #${pr.number} has invalid created_at, skipping`, "warn");
          return;
        }

        // Find first non-author response from each source
        const candidates = [];

        // 1. Reviews (sorted by submitted_at ASC)
        const reviews = pr._reviews || [];
        const firstReview = reviews.find(
          (r) => r.user?.login && r.user.login !== author && r.submitted_at
        );
        if (firstReview) {
          candidates.push({
            timestamp: new Date(firstReview.submitted_at),
            responder: firstReview.user.login,
            type: RESPONSE_TYPES.REVIEW,
          });
        }

        // 2. Issue comments (sorted by created_at ASC)
        const issueComments = pr._issueComments || [];
        const firstIssueComment = issueComments.find(
          (c) => c.user?.login && c.user.login !== author && c.created_at
        );
        if (firstIssueComment) {
          candidates.push({
            timestamp: new Date(firstIssueComment.created_at),
            responder: firstIssueComment.user.login,
            type: RESPONSE_TYPES.COMMENT,
          });
        }

        // 3. Review comments / inline code comments (sorted by created_at ASC)
        const reviewComments = pr._reviewComments || [];
        const firstReviewComment = reviewComments.find(
          (c) => c.user?.login && c.user.login !== author && c.created_at
        );
        if (firstReviewComment) {
          candidates.push({
            timestamp: new Date(firstReviewComment.created_at),
            responder: firstReviewComment.user.login,
            type: RESPONSE_TYPES.REVIEW_COMMENT,
          });
        }

        // Pick earliest valid candidate
        const validCandidates = candidates.filter(
          (c) => !isNaN(c.timestamp.getTime())
        );
        validCandidates.sort((a, b) => a.timestamp - b.timestamp);

        const winner = validCandidates[0] || null;

        let pickupTimeHours = null;
        let pickupTimeDays = null;
        let firstResponseAt = null;
        let firstResponder = null;
        let firstResponseType = null;

        if (winner) {
          const diffMs = winner.timestamp - created;
          pickupTimeHours = diffMs / (1000 * 60 * 60);
          // Clamp negative values (response before PR creation edge case)
          if (pickupTimeHours < 0) pickupTimeHours = 0;
          pickupTimeDays = pickupTimeHours / 24;
          firstResponseAt = winner.timestamp.toISOString();
          firstResponder = winner.responder;
          firstResponseType = winner.type;

          totalPickupHours += pickupTimeHours;
          prsWithPickup++;
        }

        let state = "open";
        if (pr.merged_at) state = "merged";
        else if (pr.closed_at) state = "closed";

        const repoName =
          pr.repository?.full_name ||
          pr.base?.repo?.full_name ||
          "unknown";

        pickupData.push({
          number: pr.number,
          title: pr.title,
          repository: repoName,
          author,
          created_at: pr.created_at,
          first_response_at: firstResponseAt,
          first_responder: firstResponder,
          first_response_type: firstResponseType,
          pickup_time_hours: round(pickupTimeHours),
          pickup_time_days: round(pickupTimeDays),
          state,
          merged_at: pr.merged_at || null,
          html_url: pr.html_url || null,
        });
      } catch (error) {
        log(
          `Error processing PR #${pr.number}: ${error.message}`,
          "warn"
        );
      }
    });

    // Compute statistics on PRs that have pickup time
    const withPickup = pickupData.filter((d) => d.pickup_time_hours !== null);
    const sortedPickupHours = withPickup
      .map((d) => d.pickup_time_hours)
      .sort((a, b) => a - b);

    const avgPickupHours =
      prsWithPickup > 0 ? round(totalPickupHours / prsWithPickup) : null;
    const medianPickupHours = round(percentile(sortedPickupHours, 50));
    const p75PickupHours = round(percentile(sortedPickupHours, 75));
    const p90PickupHours = round(percentile(sortedPickupHours, 90));
    const p95PickupHours = round(percentile(sortedPickupHours, 95));
    const minPickupHours =
      sortedPickupHours.length > 0 ? round(sortedPickupHours[0]) : null;
    const maxPickupHours =
      sortedPickupHours.length > 0
        ? round(sortedPickupHours[sortedPickupHours.length - 1])
        : null;

    // Distribution buckets (hour-based)
    const distribution = computeDistribution(sortedPickupHours);

    // Weekly trend
    const weeklyTrend = computeWeeklyTrend(pickupData);

    // By repository
    const byRepository = computeByRepository(pickupData);

    // By first responder
    const byFirstResponder = computeByFirstResponder(withPickup);

    return {
      summary: {
        totalPRs: pullRequests.length,
        prsWithPickup,
        prsWithoutPickup: pullRequests.length - prsWithPickup,
        avgPickupHours,
        medianPickupHours,
        p75PickupHours,
        p90PickupHours,
        p95PickupHours,
        minPickupHours,
        maxPickupHours,
        avgPickupDays: avgPickupHours !== null ? round(avgPickupHours / 24) : null,
        medianPickupDays: medianPickupHours !== null ? round(medianPickupHours / 24) : null,
      },
      distribution,
      weeklyTrend,
      byRepository,
      byFirstResponder,
      details: pickupData,
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
 * Compute distribution buckets based on hour thresholds.
 */
function computeDistribution(sortedPickupHours) {
  const { FAST, GOOD, MODERATE, SLOW, VERY_SLOW } = PICKUP_TIME_BUCKETS;
  const total = sortedPickupHours.length;

  if (total === 0) {
    return {
      fast: { label: `<${FAST}h`, count: 0, percentage: 0 },
      good: { label: `${FAST}-${GOOD}h`, count: 0, percentage: 0 },
      moderate: { label: `${GOOD}-${MODERATE}h`, count: 0, percentage: 0 },
      slow: { label: `${MODERATE}-${SLOW}h`, count: 0, percentage: 0 },
      verySlow: { label: `${SLOW}-${VERY_SLOW}h`, count: 0, percentage: 0 },
      critical: { label: `>${VERY_SLOW}h`, count: 0, percentage: 0 },
    };
  }

  const fast = sortedPickupHours.filter((t) => t < FAST).length;
  const good = sortedPickupHours.filter((t) => t >= FAST && t < GOOD).length;
  const moderate = sortedPickupHours.filter((t) => t >= GOOD && t < MODERATE).length;
  const slow = sortedPickupHours.filter((t) => t >= MODERATE && t < SLOW).length;
  const verySlow = sortedPickupHours.filter((t) => t >= SLOW && t < VERY_SLOW).length;
  const critical = sortedPickupHours.filter((t) => t >= VERY_SLOW).length;

  const pct = (count) => round((count / total) * 100);

  return {
    fast: { label: `<${FAST}h`, count: fast, percentage: pct(fast) },
    good: { label: `${FAST}-${GOOD}h`, count: good, percentage: pct(good) },
    moderate: { label: `${GOOD}-${MODERATE}h`, count: moderate, percentage: pct(moderate) },
    slow: { label: `${MODERATE}-${SLOW}h`, count: slow, percentage: pct(slow) },
    verySlow: { label: `${SLOW}-${VERY_SLOW}h`, count: verySlow, percentage: pct(verySlow) },
    critical: { label: `>${VERY_SLOW}h`, count: critical, percentage: pct(critical) },
  };
}

/**
 * Compute weekly trend for pickup time.
 * Groups by the week the PR was created.
 */
function computeWeeklyTrend(pickupData) {
  const weekMap = new Map();

  pickupData.forEach((entry) => {
    if (!entry.created_at) return;

    const createdDate = new Date(entry.created_at);
    const weekStart = new Date(createdDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split("T")[0];

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        pickupHours: [],
        withPickup: 0,
        withoutPickup: 0,
        total: 0,
      });
    }

    const week = weekMap.get(weekKey);
    week.total++;

    if (entry.pickup_time_hours !== null) {
      week.pickupHours.push(entry.pickup_time_hours);
      week.withPickup++;
    } else {
      week.withoutPickup++;
    }
  });

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, data]) => ({
      weekStart,
      totalPRs: data.total,
      prsWithPickup: data.withPickup,
      prsWithoutPickup: data.withoutPickup,
      avgPickupHours:
        data.pickupHours.length > 0
          ? round(
              data.pickupHours.reduce((s, v) => s + v, 0) /
                data.pickupHours.length
            )
          : null,
      medianPickupHours:
        data.pickupHours.length > 0
          ? round(
              percentile(
                data.pickupHours.sort((a, b) => a - b),
                50
              )
            )
          : null,
    }));
}

/**
 * Compute pickup time statistics grouped by repository.
 */
function computeByRepository(pickupData) {
  const repoMap = new Map();

  pickupData.forEach((entry) => {
    if (!repoMap.has(entry.repository)) {
      repoMap.set(entry.repository, []);
    }
    repoMap.get(entry.repository).push(entry);
  });

  return Array.from(repoMap.entries()).map(([repo, entries]) => {
    const withPickup = entries.filter((e) => e.pickup_time_hours !== null);
    const pickupHours = withPickup
      .map((e) => e.pickup_time_hours)
      .sort((a, b) => a - b);

    return {
      repository: repo,
      totalPRs: entries.length,
      prsWithPickup: withPickup.length,
      prsWithoutPickup: entries.length - withPickup.length,
      avgPickupHours:
        pickupHours.length > 0
          ? round(pickupHours.reduce((s, v) => s + v, 0) / pickupHours.length)
          : null,
      medianPickupHours: round(percentile(pickupHours, 50)),
    };
  });
}

/**
 * Compute statistics grouped by first responder.
 */
function computeByFirstResponder(withPickupEntries) {
  const responderMap = new Map();

  withPickupEntries.forEach((entry) => {
    const responder = entry.first_responder;
    if (!responder) return;

    if (!responderMap.has(responder)) {
      responderMap.set(responder, []);
    }
    responderMap.get(responder).push(entry);
  });

  return Array.from(responderMap.entries())
    .map(([responder, entries]) => {
      const pickupHours = entries
        .map((e) => e.pickup_time_hours)
        .filter((h) => h !== null)
        .sort((a, b) => a - b);

      return {
        responder,
        reviewCount: entries.length,
        avgPickupHours:
          pickupHours.length > 0
            ? round(
                pickupHours.reduce((s, v) => s + v, 0) / pickupHours.length
              )
            : null,
        medianPickupHours: round(percentile(pickupHours, 50)),
        responseTypes: {
          review: entries.filter((e) => e.first_response_type === "review").length,
          comment: entries.filter((e) => e.first_response_type === "comment").length,
          review_comment: entries.filter((e) => e.first_response_type === "review_comment").length,
        },
      };
    })
    .sort((a, b) => b.reviewCount - a.reviewCount);
}
