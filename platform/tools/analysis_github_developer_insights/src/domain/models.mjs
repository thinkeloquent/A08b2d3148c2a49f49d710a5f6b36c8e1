export { GitHubUserSchema } from "./user-schema.mjs";
export { PullRequestSchema } from "./pr-schema.mjs";
export { CommitSchema, DateSchema } from "./commit-schema.mjs";

/**
 * Available analysis modules and their display names.
 */
export const ANALYSIS_MODULES = {
  prThroughput: "PR Throughput",
  codeChurn: "Code Churn",
  workPatterns: "Work Patterns",
  prCycleTime: "PR Cycle Time",
};

export const DEFAULT_MODULES = "prThroughput,codeChurn,workPatterns,prCycleTime";
