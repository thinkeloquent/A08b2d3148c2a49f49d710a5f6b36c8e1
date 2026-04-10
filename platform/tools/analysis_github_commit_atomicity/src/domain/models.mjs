/**
 * Commit atomicity classification thresholds.
 *
 * A commit is "atomic" when it affects fewer than `filesThreshold` files
 * and fewer than `linesThreshold` total lines (additions + deletions).
 *
 * Health is based on the percentage of atomic commits:
 *   Ideally 80%+ of commits should affect < 10 files and < 200 lines.
 */
export const ATOMICITY_HEALTH = {
  EXCELLENT: { min: 80, label: "excellent" },
  HEALTHY: { min: 65, label: "healthy" },
  MODERATE: { min: 50, label: "moderate" },
  CONCERNING: { min: 35, label: "concerning" },
  CRITICAL: { min: 0, label: "critical" },
};

/**
 * Commit size buckets for distribution analysis.
 * Based on total lines changed (additions + deletions).
 */
export const COMMIT_SIZE_BUCKETS = {
  TINY: { maxLines: 10, maxFiles: 3, label: "tiny (<10 lines, <3 files)" },
  SMALL: { maxLines: 50, maxFiles: 5, label: "small (10-50 lines, 3-5 files)" },
  MEDIUM: { maxLines: 200, maxFiles: 10, label: "medium (50-200 lines, 5-10 files)" },
  LARGE: { maxLines: 500, maxFiles: 20, label: "large (200-500 lines, 10-20 files)" },
  MONOLITHIC: { maxLines: Infinity, maxFiles: Infinity, label: "monolithic (500+ lines or 20+ files)" },
};

/**
 * Default thresholds for atomic commit classification.
 */
export const DEFAULT_LINES_THRESHOLD = 200;
export const DEFAULT_FILES_THRESHOLD = 10;
