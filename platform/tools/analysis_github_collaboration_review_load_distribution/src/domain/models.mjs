export { GitHubUserSchema } from "./user-schema.mjs";
export {
  ReviewSchema,
  PullRequestSchema,
  ReviewerLoadEntrySchema,
} from "./review-schema.mjs";

/**
 * Review state constants.
 */
export const REVIEW_STATES = {
  APPROVED: "APPROVED",
  CHANGES_REQUESTED: "CHANGES_REQUESTED",
  COMMENTED: "COMMENTED",
  DISMISSED: "DISMISSED",
  PENDING: "PENDING",
};

/**
 * Review load distribution thresholds.
 * Used to classify whether review load is balanced or concentrated.
 */
export const LOAD_DISTRIBUTION_THRESHOLDS = {
  WELL_BALANCED: 0.3,
  MODERATE: 0.5,
  CONCENTRATED: 0.7,
  HIGHLY_CONCENTRATED: 0.9,
};
