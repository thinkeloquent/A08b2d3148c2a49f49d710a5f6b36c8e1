/**
 * Static report metadata for technical debt ratio analysis.
 */

export const REPORT_VERSION = "1.0";
export const TOOL_NAME = "technical-debt-ratio";
export const REPORT_DESCRIPTION = "Technical Debt Ratio: Classifies commits into Feature, Fix, Refactor, or Chore using NLP keyword matching, then computes the debt ratio.";
export const REPORT_INSIGHT = "Insight: If Fix and Refactor commits dominate your Feature count for months, you are drowning in technical debt. A healthy project maintains roughly 60% Features, 20% Fixes, and 20% Maintenance/Refactoring.";
export const REPORT_ANALYSIS = "Fetches commits for a user across repositories, classifies each commit message into Feature/Fix/Refactor/Chore via keyword matching, computes the technical debt ratio (Fixes + Refactors / Total), and generates work-type distribution, weekly trends, and per-repository breakdown.";
export const REPORT_IMPROVES = "Roadmap planning and technical debt management";

export const REPORT_PLAIN_ENGLISH = {
  what: "Counts all commits labeled as Fix, Bug, or Refactor and divides that by the total number of commits (including new features) to measure what percentage of energy is spent fixing the past versus building the future.",
  how: "Fetches commits authored by the user across repositories. Classifies each commit message using keyword matching into Feature, Fix, Refactor, or Chore. Computes the debt ratio as (Fixes + Refactors) / Total Commits.",
  why: "If this number is over 0.5 (50%), you are spending more time repairing than growing. A healthy project should keep the debt ratio below 0.40.",
  main_logic: "Validate user -> discover repositories -> fetch commits per repo -> classify each commit message (Feature/Fix/Refactor/Chore) -> compute: debt ratio, work-type distribution, weekly trends, repo breakdown -> output report.",
};

export const REPORT_FORMULA = [
  "Debt Ratio = (Fixes + Refactors) / Total Commits",
  "Feature Ratio = Features / Total Commits",
  "Fix Ratio = Fixes / Total Commits",
  "Refactor Ratio = Refactors / Total Commits",
  "Chore Ratio = Chores / Total Commits",
  "Health: excellent (<20% debt), healthy (<40%), moderate (<50%), concerning (<65%), critical (>=65%)",
  "Ideal: ~60% Features, ~20% Fixes, ~20% Maintenance/Refactoring",
];

/**
 * Build dynamic criteria entries based on config.
 * @param {object} config
 * @returns {string[]}
 */
export function buildCriteria(config) {
  return [
    `Commits filtered for user: ${config.searchUser}`,
    `Classification method: keyword matching on commit message first line`,
    `Debt Ratio = (Fixes + Refactors) / Total Commits`,
    `Health classification: excellent (<20%), healthy (<40%), moderate (<50%), concerning (<65%), critical (>=65%)`,
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
  return [...REPORT_FORMULA];
}
