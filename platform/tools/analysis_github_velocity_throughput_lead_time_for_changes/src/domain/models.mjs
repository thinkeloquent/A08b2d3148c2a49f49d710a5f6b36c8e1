export { GitHubUserSchema } from "./user-schema.mjs";
export { PullRequestSchema, LeadTimeEntrySchema } from "./pr-schema.mjs";

/**
 * PR status constants.
 */
export const PR_STATUSES = {
  MERGED: "merged",
  CLOSED: "closed",
  OPEN: "open",
};

/**
 * Lead time bucket thresholds (in days).
 * Based on DORA metrics classification:
 * - Elite: < 1 day
 * - High: 1-7 days
 * - Medium: 7-30 days
 * - Low: > 30 days
 */
export const LEAD_TIME_BUCKETS = {
  ELITE: 1,
  HIGH: 7,
  MEDIUM: 30,
  LOW: 90,
};

/**
 * Lead time phase labels.
 */
export const LEAD_TIME_PHASES = {
  CODING: "coding_time",
  REVIEW: "review_time",
  MERGE: "merge_time",
  TOTAL: "lead_time",
};
