/**
 * Static report metadata for file touch frequency (knowledge entropy) analysis.
 */

export const REPORT_VERSION = "1.0";
export const TOOL_NAME = "file-touch-frequency";
export const REPORT_DESCRIPTION = "File Touch Frequency (Knowledge Entropy): Tracks which files are modified most frequently to identify hotspot bottleneck files.";
export const REPORT_INSIGHT = "Insight: Files that appear in almost every commit are \"God Objects\" or \"Bottleneck Files.\" These are the highest risk for merge conflicts and regressions. A few files shouldn't represent 50% of all commit activity.";
export const REPORT_ANALYSIS = "Fetches commits for a user across repositories, retrieves the list of files changed per commit, then computes per-file touch frequency, identifies hotspots, and analyzes directory-level concentration. Aggregates weekly trends, per-repository breakdown, and frequency tier distribution.";
export const REPORT_IMPROVES = "Architectural modularity — low entropy means changes are well-distributed across the codebase";

export const REPORT_PLAIN_ENGLISH = {
  what: "Measures how frequently each file is modified relative to total commits, identifying 'God Objects' and bottleneck files that concentrate too much change activity.",
  how: "Fetches commits authored by the user across repositories. For each commit, retrieves the list of files changed. Counts how many commits touch each file and divides by total commits to produce a frequency percentage.",
  why: "If a single file (like main.js) shows up in 70% of all commits, that file is a hotspot. It's a bottleneck where everyone is stepping on each other's toes, increasing the risk of merge conflicts and regressions.",
  main_logic: "Validate user -> discover repositories -> fetch commits per repo -> fetch file lists per commit -> count touches per file -> compute frequency = touches / total commits -> classify hotspots -> aggregate: directory breakdown, weekly trends, repo breakdown, frequency tiers -> output report.",
};

export const REPORT_FORMULA = [
  "File Frequency = Commits touching File X / Total Commits in Period",
  "Hotspot = File Frequency >= hotspotThreshold%",
  "Max File Frequency = highest File Frequency across all files",
  "Hotspot Count = number of files exceeding the hotspot threshold",
  "Health: excellent (<5% max), healthy (<10%), moderate (<20%), concerning (<35%), critical (>=35%)",
  "Ideal: No single file should appear in more than 10% of all commits",
];

/**
 * Build dynamic criteria entries based on config.
 * @param {object} config
 * @returns {string[]}
 */
export function buildCriteria(config) {
  return [
    `Commits filtered for user: ${config.searchUser}`,
    `Hotspot threshold: >= ${config.hotspotThreshold}% of commits`,
    `File Frequency = Commits touching File / Total Commits x 100`,
    `Top files limit: ${config.topFilesLimit} files shown in hotspot rankings`,
    `Health classification: excellent (<5%), healthy (<10%), moderate (<20%), concerning (<35%), critical (>=35%)`,
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
    `Hotspot threshold = ${config.hotspotThreshold}%`,
    `Top files limit = ${config.topFilesLimit}`,
  ];
}
