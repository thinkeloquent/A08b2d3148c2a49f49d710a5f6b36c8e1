/**
 * Static report metadata for review load distribution analysis.
 */

export const REPORT_VERSION = "1.0";
export const TOOL_NAME = "review-load-distribution";
export const REPORT_DESCRIPTION = "Review Load Distribution: Using the API to see who is doing the most reviews.";
export const REPORT_INSIGHT = "Insight: Detects \"Knowledge Silos\" (where one person reviews everything) or \"Reviewer Burnout.\"";
export const REPORT_ANALYSIS = "Iterates all reviews across a developer's PRs to build a per-reviewer profile (total reviews, approvals, changes-requested, unique PRs/repos reviewed). Computes the Gini coefficient over review counts to quantify workload fairness, identifies top-reviewer concentration ratios, and flags knowledge silos — repositories where 2 or fewer unique reviewers handle all reviews.";
export const REPORT_IMPROVES = "Collaboration & Review Health";

export const REPORT_PLAIN_ENGLISH = {
  what: "Measures how evenly the code review workload is distributed among reviewers of a developer's PRs, detecting knowledge silos and reviewer burnout risk.",
  how: "Fetches reviews for all PRs and builds a reviewer map tracking review counts, types, and repo coverage. Computes the Gini coefficient (0 = perfectly equal, 1 = single reviewer) and top-N concentration ratios. Flags repos with 2 or fewer reviewers as knowledge silos.",
  why: "Uneven review load creates single points of failure (bus factor risk), review bottlenecks, and reviewer burnout — all hidden risks that raw PR metrics miss.",
  main_logic: "Validate user → fetch PRs → for each PR: fetch reviews → build reviewerMap {reviewer → totalReviews, approvals, changesRequested, prsReviewed, reposReviewed} → compute shareOfTotalReviews per reviewer → computeGini(reviewCounts) → classifyLoadDistribution → computeTopConcentration (top 1/3/5) → detectKnowledgeSilos (repos with ≤ 2 reviewers, ≥ 3 reviews) → weekly trends + repo breakdown → output report.",
};

export const REPORT_FORMULA = [
  "Total Reviews = count of all review submissions across all PRs",
  "Unique Reviewers = count of distinct reviewer logins",
  "Avg Reviews/PR = Total Reviews / Total PRs Analyzed",
  "Avg Reviews/Reviewer = Total Reviews / Unique Reviewers",
  "Share of Total Reviews = (reviewer_reviews / total_reviews) * 100",
  "Gini Coefficient = mean absolute difference / (2 * mean) — 0 = equal, 1 = maximally concentrated",
  "Load Classification: Well Balanced (Gini < 0.3), Moderate (0.3-0.5), Concentrated (0.5-0.7), Highly Concentrated (0.7-0.9), Single Reviewer (>0.9)",
  "Knowledge Silo = repository with <= 2 unique reviewers and >= 3 total reviews",
  "Top N Concentration = sum of top N reviewers' reviews / total reviews * 100",
];

/**
 * Build dynamic criteria entries based on config.
 * @param {object} config
 * @returns {string[]}
 */
export function buildCriteria(config) {
  return [
    `Pull requests filtered by author:${config.searchUser} and user:${config.searchUser}`,
    `Reviews fetched for all PRs to measure reviewer load distribution`,
    `Gini coefficient computed to assess balance of review workload`,
    `Knowledge silos identified for repos with <= 2 reviewers and >= 3 reviews`,
    !config.ignoreDateRange && config.start && config.end
      ? `Date range: ${config.start} to ${config.end}`
      : "Date range: All time",
    config.org ? `Organization scope: ${config.org}` : null,
    config.repo ? `Repository scope: ${config.repo}` : null,
    config.totalRecords > 0
      ? `Total records limit: ${config.totalRecords}`
      : null,
  ].filter(Boolean);
}
