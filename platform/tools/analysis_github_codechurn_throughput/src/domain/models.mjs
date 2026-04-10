export { GitHubUserSchema } from "./user-schema.mjs";
export { PullRequestSchema } from "./pr-schema.mjs";

/**
 * Churn health classification thresholds.
 * churnRate = deletions / additions × 100
 *
 * High health = high additions with low-to-moderate deletions.
 */
export const CHURN_CLASSIFICATION = {
  EXCELLENT: { max: 15, label: "excellent" },
  HEALTHY: { max: 30, label: "healthy" },
  MODERATE: { max: 50, label: "moderate" },
  CONCERNING: { max: 75, label: "concerning" },
  CRITICAL: { max: Infinity, label: "critical" },
};

/**
 * PR size buckets for churn distribution analysis.
 */
export const PR_SIZE_BUCKETS = {
  TINY: { max: 10, label: "tiny (<10 lines)" },
  SMALL: { max: 50, label: "small (10-50 lines)" },
  MEDIUM: { max: 200, label: "medium (50-200 lines)" },
  LARGE: { max: 500, label: "large (200-500 lines)" },
  XLARGE: { max: Infinity, label: "x-large (500+ lines)" },
};
