export { GitHubUserSchema } from "./user-schema.mjs";
export { ActivitySchema } from "./activity-schema.mjs";

/**
 * Activity type constants.
 */
export const ACTIVITY_TYPES = {
  COMMIT: "commit",
  PR_OPENED: "pr_opened",
  PR_MERGED: "pr_merged",
  PR_CLOSED: "pr_closed",
  REVIEW: "review",
};

/**
 * Focus classification thresholds based on context switch rate.
 * contextSwitchRate = totalSwitches / (totalActivities - 1)
 * focusScore = 1 - contextSwitchRate
 */
export const FOCUS_CLASSIFICATION = {
  DEEP_FOCUS: { max: 0.2, label: "deep_focus" },
  FOCUSED: { max: 0.4, label: "focused" },
  MODERATE: { max: 0.6, label: "moderate" },
  FRAGMENTED: { max: 0.8, label: "fragmented" },
  HIGHLY_FRAGMENTED: { max: 1.0, label: "highly_fragmented" },
};
