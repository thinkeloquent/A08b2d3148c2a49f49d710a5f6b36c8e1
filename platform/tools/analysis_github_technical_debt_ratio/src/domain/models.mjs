/**
 * Work type categories for commit classification.
 *
 * Each commit message is matched against keyword patterns to determine
 * its category. Feature-first matching: if no category keywords are found,
 * the commit is classified as "chore" (maintenance).
 */

export const WORK_TYPES = {
  FEATURE: "feature",
  FIX: "fix",
  REFACTOR: "refactor",
  CHORE: "chore",
};

/**
 * Keyword patterns for commit classification.
 * Matched against the first line of the commit message (case-insensitive).
 * Order matters — first match wins.
 */
export const CLASSIFICATION_PATTERNS = [
  {
    type: WORK_TYPES.FIX,
    keywords: [
      "fix", "bug", "patch", "resolve", "correct", "hotfix",
      "crash", "issue", "error", "broken", "repair", "defect",
    ],
  },
  {
    type: WORK_TYPES.REFACTOR,
    keywords: [
      "refactor", "restructure", "reorganize", "clean up", "cleanup",
      "simplify", "optimize", "rename", "move", "extract", "inline",
      "deduplicate", "dedup", "technical debt", "tech debt",
    ],
  },
  {
    type: WORK_TYPES.FEATURE,
    keywords: [
      "feat", "feature", "add", "implement", "new", "introduce",
      "create", "support", "enable", "allow", "enhance",
    ],
  },
  // Chore is the fallback — matched explicitly for conventional-commit style
  {
    type: WORK_TYPES.CHORE,
    keywords: [
      "chore", "build", "ci", "docs", "style", "test", "bump",
      "update", "upgrade", "merge", "revert", "release", "config",
      "dependency", "deps", "lint", "format", "scaffold", "setup",
      "wip", "misc", "meta",
    ],
  },
];

/**
 * Debt ratio health classification thresholds.
 *
 * Healthy project: ~60% Features, ~20% Fixes, ~20% Maintenance/Refactoring
 * Debt ratio = (fixes + refactors) / total commits
 *   < 0.20 — excellent (very feature-focused)
 *   < 0.40 — healthy (normal balance)
 *   < 0.50 — moderate (debt accumulating)
 *   < 0.65 — concerning (more repair than build)
 *   >= 0.65 — critical (drowning in technical debt)
 */
export const DEBT_HEALTH = {
  EXCELLENT: { max: 0.20, label: "excellent" },
  HEALTHY: { max: 0.40, label: "healthy" },
  MODERATE: { max: 0.50, label: "moderate" },
  CONCERNING: { max: 0.65, label: "concerning" },
  CRITICAL: { max: Infinity, label: "critical" },
};
