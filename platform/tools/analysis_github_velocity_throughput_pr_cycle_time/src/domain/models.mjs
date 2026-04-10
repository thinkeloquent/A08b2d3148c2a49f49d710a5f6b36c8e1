export { GitHubUserSchema } from "./user-schema.mjs";
export { PullRequestSchema, PRCycleTimeEntrySchema } from "./pr-schema.mjs";

/**
 * PR status constants.
 */
export const PR_STATUSES = {
  MERGED: "merged",
  CLOSED: "closed",
  OPEN: "open",
};

/**
 * Cycle time bucket thresholds (in days).
 */
export const CYCLE_TIME_BUCKETS = {
  FAST: 1,
  NORMAL: 3,
  SLOW: 7,
  VERY_SLOW: 14,
};
