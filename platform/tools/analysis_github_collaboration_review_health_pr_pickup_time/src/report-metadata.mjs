/**
 * Static report metadata for PR pickup time analysis.
 */

export const REPORT_VERSION = "1.0";
export const TOOL_NAME = "pr-pickup-time";
export const REPORT_DESCRIPTION = "PR Pickup Time: Time elapsed between a PR being opened and the first comment/review.";
export const REPORT_INSIGHT = "Insight: Detects \"Knowledge Silos\" (where one person reviews everything) or \"Reviewer Burnout.\"";
export const REPORT_ANALYSIS = "For each PR, collects formal reviews, issue comments, and optionally inline review comments, then identifies the chronologically earliest non-author response. The delta between PR creation and that first response is the pickup time. PRs with no non-author response are flagged as not-yet-picked-up. Aggregates into statistical summaries, severity buckets, weekly trends, and per-responder leaderboards.";
export const REPORT_IMPROVES = "Collaboration & Review Health";

export const REPORT_PLAIN_ENGLISH = {
  what: "Measures how quickly someone other than the PR author responds to a pull request — the 'time to first review response' across all PR states (open, closed, merged).",
  how: "Fetches reviews, issue comments, and inline review comments for each PR, filters to non-author events, picks the earliest timestamp as the first response, and computes pickup_time = first_response - PR creation. Aggregates into avg/median/percentiles and distributes into severity buckets (fast < 1h through critical > 72h).",
  why: "Long pickup times signal review bottlenecks, poor team availability, or ignored PRs — directly blocking developer throughput while authors wait for review.",
  main_logic: "Validate user → fetch all PRs → for each PR: fetch reviews + issue comments + [inline comments] → find earliest non-author event across all sources → pickup_time_hours = earliest_response - pr.created_at → compute avg/median/p75/p90/p95 → distribute into 6 severity buckets → compute weekly trends + per-repo breakdown + first-responder leaderboard → output report.",
};

export const REPORT_FORMULA = [
  "Pickup Time = first_non_author_response_timestamp - pr.created_at (per PR)",
  "First response candidates: reviews (submitted_at), issue comments (created_at), review comments (created_at)",
  "Only non-author responses are considered (user.login !== pr.user.login)",
  "Earliest response across all sources wins",
  "PRs with no non-author response have pickup_time = null",
  "Average Pickup Time = Sum(Pickup Times) / Count(PRs with pickup)",
  "Distribution buckets: <1h (Fast), 1-4h (Good), 4-8h (Moderate), 8-24h (Slow), 24-72h (Very Slow), >72h (Critical)",
];

/**
 * Build dynamic criteria entries based on config.
 * @param {object} config
 * @returns {string[]}
 */
export function buildCriteria(config) {
  return [
    `Pull requests filtered by author:${config.searchUser} and user:${config.searchUser}`,
    `Pickup time measured from PR creation to first non-author response`,
    `Response sources: formal reviews, issue comments${config.includeReviewComments ? ", inline review comments" : ""}`,
    `Applies to ALL PRs (open, closed, merged) — not just merged`,
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
