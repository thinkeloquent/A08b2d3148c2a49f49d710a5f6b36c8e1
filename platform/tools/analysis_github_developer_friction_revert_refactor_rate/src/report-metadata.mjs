/**
 * Static report metadata for revert/refactor rate analysis.
 */

export const REPORT_VERSION = "1.0";
export const TOOL_NAME = "revert-refactor-rate";
export const REPORT_DESCRIPTION = "Revert/Refactor Rate: Frequency of PRs that are reverted or require significant rework after feedback.";
export const REPORT_INSIGHT = "Insight: High rework rates often signal poor requirements or lack of architectural clarity (high cognitive load).";
export const REPORT_ANALYSIS = "Classifies each PR as REVERTED (title/commit pattern matching, cross-PR references, or post-merge revert window), REWORKED (review round-trips or changes-requested count exceeding threshold), or CLEAN. Computes revert rate against merged PRs, rework rate against all PRs, and a combined friction rate. Includes review round-trip distribution and per-repo breakdown.";
export const REPORT_IMPROVES = "Developer Friction & \"Cognitive Load\"";

export const REPORT_PLAIN_ENGLISH = {
  what: "Measures what fraction of a developer's PRs were reverted or required significant rework after review — a friction rate indicating code quality or process issues.",
  how: "Fetches PRs with reviews and commits. Detects reverts via title pattern matching (revert/rollback/undo), revert commits in PR history, cross-PR references, and post-merge revert window analysis. Detects rework via review round-trip counting (CHANGES_REQUESTED → re-review cycles). Each PR is classified as REVERTED, REWORKED, or CLEAN.",
  why: "High revert and rework rates are symptoms of inadequate pre-merge review, unclear requirements, or insufficient testing — quantifying hidden code churn costs beyond raw commit counts.",
  main_logic: "Validate user → fetch user's PRs → search revert PRs in scope → for each PR: fetch reviews → compute review round-trips and changes-requested count → fetch PR commits → check commit messages against revert patterns → classify each PR (REVERTED | REWORKED | CLEAN) → revertRate = reverted/mergedPRs → reworkRate = reworked/totalPRs → frictionRate = (reverted + reworked)/totalPRs → classify severity (minimal through critical) → round-trip distribution + top reworked PRs + weekly trends + repo breakdown → output report.",
};

export const REPORT_FORMULA = [
  "Revert Rate = reverted_merged_PRs / total_merged_PRs",
  "Rework Rate = reworked_PRs / total_PRs",
  "Friction Rate = (reverted + reworked) / total_PRs",
  "Clean Rate = clean_PRs / total_PRs",
  "Review Round-Trip = CHANGES_REQUESTED → subsequent review cycle",
  "Friction Classification: minimal (<5%), low (5-10%), moderate (10-20%), high (20-35%), critical (>=35%)",
];

/**
 * Build dynamic criteria entries based on config.
 * @param {object} config
 * @returns {string[]}
 */
export function buildCriteria(config) {
  return [
    `PRs filtered for user: ${config.searchUser}`,
    `Revert detection: PR title matching revert/rollback/undo patterns, revert commits, cross-PR references`,
    `Rework detection: review round-trips >= ${config.reworkThreshold} or changes-requested count >= ${config.reworkThreshold}`,
    `Post-merge revert window: ${config.postMergeWindowHours} hours`,
    `Revert Rate = reverted merged PRs / total merged PRs`,
    `Rework Rate = reworked PRs / total PRs`,
    `Friction Rate = (reverted + reworked) / total PRs`,
    !config.ignoreDateRange && config.start && config.end
      ? `Date range: ${config.start} to ${config.end}`
      : "Date range: All time",
    config.org ? `Organization scope: ${config.org}` : null,
    config.repo ? `Repository scope: ${config.repo}` : null,
    config.totalRecords > 0
      ? `Total records limit: ${config.totalRecords}`
      : null,
  ].filter(Boolean);
}

/**
 * Build dynamic formula entries based on config.
 * @param {object} config
 * @returns {string[]}
 */
export function buildFormula(config) {
  return [
    ...REPORT_FORMULA,
    `Rework Threshold = ${config.reworkThreshold} round-trips or changes-requested reviews`,
    `Post-Merge Revert Window = ${config.postMergeWindowHours} hours after merge`,
  ];
}
