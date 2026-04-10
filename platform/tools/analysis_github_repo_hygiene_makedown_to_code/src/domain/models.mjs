export { GitHubUserSchema } from "./user-schema.mjs";
export { FileChangeSchema, CommitWithFilesSchema } from "./file-change-schema.mjs";

/**
 * File classification constants.
 */
export const FILE_CATEGORIES = {
  DOCUMENTATION: "documentation",
  CODE: "code",
  OTHER: "other",
};

/**
 * Commit type based on file mix.
 */
export const COMMIT_TYPES = {
  DOC_ONLY: "doc_only",
  CODE_ONLY: "code_only",
  MIXED: "mixed",
  OTHER_ONLY: "other_only",
};

/**
 * Default documentation file extensions.
 */
export const DEFAULT_DOC_EXTENSIONS = [".md", ".mdx"];

/**
 * Documentation coverage classification thresholds.
 * Based on docToCodeRatio = docFileChanges / codeFileChanges.
 */
export const COVERAGE_CLASSIFICATION = {
  EXCELLENT: { min: 0.3, label: "excellent" },
  GOOD: { min: 0.15, label: "good" },
  MODERATE: { min: 0.05, label: "moderate" },
  LOW: { min: 0.01, label: "low" },
  MINIMAL: { min: 0, label: "minimal" },
};
