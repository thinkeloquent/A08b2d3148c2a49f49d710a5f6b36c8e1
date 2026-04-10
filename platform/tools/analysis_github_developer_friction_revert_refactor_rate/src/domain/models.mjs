export { GitHubUserSchema } from "./user-schema.mjs";
export { PullRequestSchema } from "./pr-schema.mjs";

/**
 * PR classification constants for revert/refactor analysis.
 */
export const PR_CLASSIFICATION = {
  REVERTED: "reverted",
  REWORKED: "reworked",
  CLEAN: "clean",
};

/**
 * Revert detection patterns — regex patterns for identifying revert PRs/commits.
 */
export const REVERT_PATTERNS = [
  /^Revert\s+"/i,
  /^Revert\s+#\d+/i,
  /\brevert\b/i,
  /\brollback\b/i,
  /\bundo\b/i,
];

/**
 * Friction classification thresholds based on combined revert + rework rate.
 * frictionRate = (reverted + reworked) / totalPRs
 */
export const FRICTION_CLASSIFICATION = {
  MINIMAL: { max: 0.05, label: "minimal" },
  LOW: { max: 0.10, label: "low" },
  MODERATE: { max: 0.20, label: "moderate" },
  HIGH: { max: 0.35, label: "high" },
  CRITICAL: { max: 1.0, label: "critical" },
};

/**
 * Review state constants from GitHub API.
 */
export const REVIEW_STATES = {
  APPROVED: "APPROVED",
  CHANGES_REQUESTED: "CHANGES_REQUESTED",
  COMMENTED: "COMMENTED",
  DISMISSED: "DISMISSED",
};
