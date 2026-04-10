export { GitHubUserSchema } from "./user-schema.mjs";
export { PullRequestSchema, PickupTimeEntrySchema } from "./pr-schema.mjs";

/**
 * PR status constants.
 */
export const PR_STATUSES = {
  MERGED: "merged",
  CLOSED: "closed",
  OPEN: "open",
};

/**
 * Response type constants for first-response classification.
 */
export const RESPONSE_TYPES = {
  REVIEW: "review",
  COMMENT: "comment",
  REVIEW_COMMENT: "review_comment",
};

/**
 * Pickup time bucket thresholds (in hours).
 * - Fast:      < 1 hour
 * - Good:      1-4 hours
 * - Moderate:  4-8 hours
 * - Slow:      8-24 hours
 * - Very Slow: 1-3 days (24-72 hours)
 * - Critical:  > 3 days (> 72 hours)
 */
export const PICKUP_TIME_BUCKETS = {
  FAST: 1,
  GOOD: 4,
  MODERATE: 8,
  SLOW: 24,
  VERY_SLOW: 72,
};
