import { LOAD_DISTRIBUTION_THRESHOLDS } from "../domain/models.mjs";

/**
 * Review Load Distribution Analyzer — measures how review work is distributed
 * across team members who review a user's pull requests.
 *
 * Metrics computed:
 * - Review count per reviewer (total, by state: approved/changes_requested/commented)
 * - Unique PRs reviewed per reviewer
 * - Unique repos reviewed per reviewer
 * - Share of total reviews per reviewer
 * - Gini coefficient for load balance assessment
 * - Top reviewer concentration (% of reviews by top N reviewers)
 * - Review activity timeline (reviews per week)
 * - Cross-repo reviewer diversity (knowledge silo detection)
 */
export class ReviewLoadAnalyzer {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Analyze review load distribution from PR + review data.
   * @param {Array} pullRequests - PRs with _reviews attached
   * @param {{ log: Function }} deps
   * @returns {object} review load analytics
   */
  analyze(pullRequests, { log }) {
    if (!Array.isArray(pullRequests)) {
      throw new Error("ReviewLoadAnalyzer expects an array of pull requests");
    }

    // Collect all reviews across all PRs
    const reviewerMap = new Map();
    let totalReviewCount = 0;

    pullRequests.forEach((pr) => {
      const reviews = pr._reviews || [];
      const repoName = pr.repository?.full_name || "unknown";

      reviews.forEach((review) => {
        const reviewer = review.user?.login;
        if (!reviewer) return;

        totalReviewCount++;

        if (!reviewerMap.has(reviewer)) {
          reviewerMap.set(reviewer, {
            reviewer,
            totalReviews: 0,
            approvals: 0,
            changesRequested: 0,
            comments: 0,
            dismissed: 0,
            prsReviewed: new Set(),
            reposReviewed: new Set(),
            reviewDates: [],
          });
        }

        const entry = reviewerMap.get(reviewer);
        entry.totalReviews++;

        switch (review.state) {
          case "APPROVED":
            entry.approvals++;
            break;
          case "CHANGES_REQUESTED":
            entry.changesRequested++;
            break;
          case "COMMENTED":
            entry.comments++;
            break;
          case "DISMISSED":
            entry.dismissed++;
            break;
        }

        entry.prsReviewed.add(`${repoName}#${pr.number}`);
        entry.reposReviewed.add(repoName);

        if (review.submitted_at) {
          entry.reviewDates.push(review.submitted_at);
        }
      });
    });

    // Build reviewer details array
    const reviewerDetails = Array.from(reviewerMap.values())
      .map((entry) => {
        const sortedDates = entry.reviewDates
          .map((d) => new Date(d))
          .filter((d) => !isNaN(d.getTime()))
          .sort((a, b) => a - b);

        let avgReviewsPerDay = null;
        if (sortedDates.length >= 2) {
          const firstDate = sortedDates[0];
          const lastDate = sortedDates[sortedDates.length - 1];
          const daySpan =
            (lastDate - firstDate) / (1000 * 60 * 60 * 24);
          if (daySpan > 0) {
            avgReviewsPerDay = round(entry.totalReviews / daySpan);
          }
        }

        return {
          reviewer: entry.reviewer,
          totalReviews: entry.totalReviews,
          approvals: entry.approvals,
          changesRequested: entry.changesRequested,
          comments: entry.comments,
          dismissed: entry.dismissed,
          uniquePRsReviewed: entry.prsReviewed.size,
          uniqueReposReviewed: entry.reposReviewed.size,
          repositories: Array.from(entry.reposReviewed).sort(),
          avgReviewsPerDay,
          firstReviewDate:
            sortedDates.length > 0
              ? sortedDates[0].toISOString()
              : null,
          lastReviewDate:
            sortedDates.length > 0
              ? sortedDates[sortedDates.length - 1].toISOString()
              : null,
          shareOfTotalReviews:
            totalReviewCount > 0
              ? round((entry.totalReviews / totalReviewCount) * 100)
              : 0,
        };
      })
      .sort((a, b) => b.totalReviews - a.totalReviews);

    // Compute distribution metrics
    const reviewCounts = reviewerDetails.map((r) => r.totalReviews);
    const giniCoefficient = computeGini(reviewCounts);
    const loadClassification = classifyLoadDistribution(giniCoefficient);

    // Top reviewer concentration
    const topReviewerConcentration = computeTopConcentration(
      reviewerDetails,
      totalReviewCount
    );

    // Weekly trend
    const weeklyTrend = computeWeeklyTrend(pullRequests);

    // By repository breakdown
    const byRepository = computeByRepository(pullRequests);

    // Review state distribution
    const stateDistribution = computeStateDistribution(reviewerDetails);

    // Knowledge silo detection
    const knowledgeSilos = detectKnowledgeSilos(reviewerDetails, byRepository);

    return {
      summary: {
        totalReviews: totalReviewCount,
        uniqueReviewers: reviewerDetails.length,
        totalPRsWithReviews: pullRequests.filter(
          (pr) => (pr._reviews || []).length > 0
        ).length,
        totalPRsAnalyzed: pullRequests.length,
        avgReviewsPerPR:
          pullRequests.length > 0
            ? round(totalReviewCount / pullRequests.length)
            : 0,
        avgReviewsPerReviewer:
          reviewerDetails.length > 0
            ? round(totalReviewCount / reviewerDetails.length)
            : 0,
        giniCoefficient: round(giniCoefficient),
        loadClassification,
      },
      topReviewerConcentration,
      stateDistribution,
      knowledgeSilos,
      weeklyTrend,
      byRepository,
      details: reviewerDetails,
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
 * Compute the Gini coefficient for a set of values.
 * 0 = perfectly equal, 1 = maximally concentrated.
 * @param {number[]} values
 * @returns {number}
 */
function computeGini(values) {
  if (values.length <= 1) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((s, v) => s + v, 0) / n;

  if (mean === 0) return 0;

  let sumOfDifferences = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      sumOfDifferences += Math.abs(sorted[i] - sorted[j]);
    }
  }

  return sumOfDifferences / (2 * n * n * mean);
}

/**
 * Classify load distribution based on Gini coefficient.
 * @param {number} gini
 * @returns {object}
 */
function classifyLoadDistribution(gini) {
  const {
    WELL_BALANCED,
    MODERATE,
    CONCENTRATED,
    HIGHLY_CONCENTRATED,
  } = LOAD_DISTRIBUTION_THRESHOLDS;

  if (gini < WELL_BALANCED) {
    return {
      level: "well_balanced",
      label: "Well Balanced",
      description: "Review work is evenly distributed across team members",
    };
  }
  if (gini < MODERATE) {
    return {
      level: "moderate",
      label: "Moderately Balanced",
      description:
        "Some reviewers do more than others, but load is generally reasonable",
    };
  }
  if (gini < CONCENTRATED) {
    return {
      level: "concentrated",
      label: "Concentrated",
      description:
        "Review work is concentrated among a few team members — consider redistributing",
    };
  }
  if (gini < HIGHLY_CONCENTRATED) {
    return {
      level: "highly_concentrated",
      label: "Highly Concentrated",
      description:
        "Most reviews are done by very few people — high bus factor risk",
    };
  }
  return {
    level: "single_reviewer",
    label: "Single Reviewer Bottleneck",
    description:
      "Nearly all reviews depend on one person — critical knowledge silo",
  };
}

/**
 * Compute concentration of reviews among top 1, 3, and 5 reviewers.
 * @param {Array} reviewerDetails - Sorted by totalReviews descending
 * @param {number} totalReviewCount
 * @returns {object}
 */
function computeTopConcentration(reviewerDetails, totalReviewCount) {
  if (totalReviewCount === 0 || reviewerDetails.length === 0) {
    return {
      top1: { reviewer: null, reviews: 0, percentage: 0 },
      top3: { reviewers: [], reviews: 0, percentage: 0 },
      top5: { reviewers: [], reviews: 0, percentage: 0 },
    };
  }

  const top1 = reviewerDetails[0];
  const top3 = reviewerDetails.slice(0, 3);
  const top5 = reviewerDetails.slice(0, 5);

  const top3Reviews = top3.reduce((s, r) => s + r.totalReviews, 0);
  const top5Reviews = top5.reduce((s, r) => s + r.totalReviews, 0);

  return {
    top1: {
      reviewer: top1.reviewer,
      reviews: top1.totalReviews,
      percentage: round((top1.totalReviews / totalReviewCount) * 100),
    },
    top3: {
      reviewers: top3.map((r) => r.reviewer),
      reviews: top3Reviews,
      percentage: round((top3Reviews / totalReviewCount) * 100),
    },
    top5: {
      reviewers: top5.map((r) => r.reviewer),
      reviews: top5Reviews,
      percentage: round((top5Reviews / totalReviewCount) * 100),
    },
  };
}

/**
 * Compute weekly review activity trend.
 * @param {Array} pullRequests - PRs with _reviews attached
 * @returns {Array}
 */
function computeWeeklyTrend(pullRequests) {
  const weekMap = new Map();

  pullRequests.forEach((pr) => {
    const reviews = pr._reviews || [];
    reviews.forEach((review) => {
      if (!review.submitted_at) return;

      const date = new Date(review.submitted_at);
      if (isNaN(date.getTime())) return;

      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, {
          reviewers: new Set(),
          totalReviews: 0,
          approvals: 0,
          changesRequested: 0,
          comments: 0,
        });
      }

      const week = weekMap.get(weekKey);
      week.totalReviews++;
      if (review.user?.login) week.reviewers.add(review.user.login);

      switch (review.state) {
        case "APPROVED":
          week.approvals++;
          break;
        case "CHANGES_REQUESTED":
          week.changesRequested++;
          break;
        case "COMMENTED":
          week.comments++;
          break;
      }
    });
  });

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, data]) => ({
      weekStart,
      totalReviews: data.totalReviews,
      uniqueReviewers: data.reviewers.size,
      approvals: data.approvals,
      changesRequested: data.changesRequested,
      comments: data.comments,
    }));
}

/**
 * Compute review load per repository.
 * @param {Array} pullRequests - PRs with _reviews attached
 * @returns {Array}
 */
function computeByRepository(pullRequests) {
  const repoMap = new Map();

  pullRequests.forEach((pr) => {
    const repoName = pr.repository?.full_name || "unknown";
    const reviews = pr._reviews || [];

    if (!repoMap.has(repoName)) {
      repoMap.set(repoName, {
        totalPRs: 0,
        totalReviews: 0,
        reviewers: new Map(),
      });
    }

    const repo = repoMap.get(repoName);
    repo.totalPRs++;

    reviews.forEach((review) => {
      const reviewer = review.user?.login;
      if (!reviewer) return;

      repo.totalReviews++;
      repo.reviewers.set(
        reviewer,
        (repo.reviewers.get(reviewer) || 0) + 1
      );
    });
  });

  return Array.from(repoMap.entries())
    .map(([repoName, data]) => {
      const reviewerEntries = Array.from(data.reviewers.entries())
        .sort(([, a], [, b]) => b - a)
        .map(([reviewer, count]) => ({
          reviewer,
          reviews: count,
          percentage: round((count / data.totalReviews) * 100),
        }));

      return {
        repository: repoName,
        totalPRs: data.totalPRs,
        totalReviews: data.totalReviews,
        uniqueReviewers: data.reviewers.size,
        avgReviewsPerPR:
          data.totalPRs > 0
            ? round(data.totalReviews / data.totalPRs)
            : 0,
        reviewers: reviewerEntries,
      };
    })
    .sort((a, b) => b.totalReviews - a.totalReviews);
}

/**
 * Compute overall review state distribution.
 * @param {Array} reviewerDetails
 * @returns {object}
 */
function computeStateDistribution(reviewerDetails) {
  const totals = reviewerDetails.reduce(
    (acc, r) => {
      acc.approvals += r.approvals;
      acc.changesRequested += r.changesRequested;
      acc.comments += r.comments;
      acc.dismissed += r.dismissed;
      return acc;
    },
    { approvals: 0, changesRequested: 0, comments: 0, dismissed: 0 }
  );

  const total =
    totals.approvals +
    totals.changesRequested +
    totals.comments +
    totals.dismissed;

  const pct = (count) => (total > 0 ? round((count / total) * 100) : 0);

  return {
    approvals: {
      count: totals.approvals,
      percentage: pct(totals.approvals),
    },
    changesRequested: {
      count: totals.changesRequested,
      percentage: pct(totals.changesRequested),
    },
    comments: {
      count: totals.comments,
      percentage: pct(totals.comments),
    },
    dismissed: {
      count: totals.dismissed,
      percentage: pct(totals.dismissed),
    },
  };
}

/**
 * Detect knowledge silos — repositories where only 1-2 reviewers do all reviews.
 * @param {Array} reviewerDetails
 * @param {Array} byRepository
 * @returns {Array}
 */
function detectKnowledgeSilos(reviewerDetails, byRepository) {
  return byRepository
    .filter(
      (repo) => repo.uniqueReviewers <= 2 && repo.totalReviews >= 3
    )
    .map((repo) => ({
      repository: repo.repository,
      reviewers: repo.reviewers.map((r) => r.reviewer),
      totalReviews: repo.totalReviews,
      risk:
        repo.uniqueReviewers === 1
          ? "high"
          : "moderate",
      description:
        repo.uniqueReviewers === 1
          ? `Only ${repo.reviewers[0]?.reviewer} reviews this repo — single point of failure`
          : `Only ${repo.reviewers.map((r) => r.reviewer).join(" and ")} review this repo`,
    }));
}
