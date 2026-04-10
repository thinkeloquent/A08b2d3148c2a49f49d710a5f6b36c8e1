/**
 * Static report metadata for commit atomicity analysis.
 */

export const REPORT_VERSION = "1.0";
export const TOOL_NAME = "commit-atomicity";
export const REPORT_DESCRIPTION = "Commit Atomicity: Analyzes the distribution of changes per commit to identify review-proof monolithic commits.";
export const REPORT_INSIGHT = "Insight: Massive commits (hundreds of files or thousands of lines) are \"review-proof.\" Nobody can effectively audit 2,000 lines of code in one go. Small, frequent commits indicate a healthy, iterative workflow.";
export const REPORT_ANALYSIS = "Fetches commits for a user across repositories, retrieves detailed stats (additions, deletions, files changed) for each commit, then computes the average commit impact, atomicity score, and classifies commit sizes. Aggregates per-commit metrics, weekly trends, per-repository breakdown, and size-bucket distribution.";
export const REPORT_IMPROVES = "Peer review quality and debugging speed (easier to use git bisect)";

export const REPORT_PLAIN_ENGLISH = {
  what: "Measures the average size of a developer's commits and what percentage of those commits are small enough to be meaningfully reviewed.",
  how: "Fetches commits authored by the user across repositories. For each commit, retrieves additions, deletions, and files changed. Classifies each commit as 'atomic' (< threshold lines AND < threshold files) or 'non-atomic'. Computes the atomicity score as the percentage of atomic commits.",
  why: "If the average commit is 500+ lines, the team is likely batching too much work instead of committing small, safe chunks. Large commits bypass effective peer review and make git bisect debugging impractical.",
  main_logic: "Validate user -> discover repositories -> fetch commits per repo -> fetch detailed stats per commit -> classify each commit (atomic vs. non-atomic) -> compute: average commit impact, atomicity score, weekly trends, repo breakdown, size distribution, largest commits -> output report.",
};

export const REPORT_FORMULA = [
  "Average Commit Impact = Sum(Additions + Deletions) / Total Commits",
  "Atomicity Score = (Atomic Commits / Total Commits) x 100",
  "Atomic Commit = totalLines <= linesThreshold AND filesChanged <= filesThreshold",
  "Health: excellent (>=80%), healthy (>=65%), moderate (>=50%), concerning (>=35%), critical (<35%)",
  "Ideal: 80% of commits should affect < 10 files and < 200 lines",
];

/**
 * Build dynamic criteria entries based on config.
 * @param {object} config
 * @returns {string[]}
 */
export function buildCriteria(config) {
  return [
    `Commits filtered for user: ${config.searchUser}`,
    `Atomic threshold — lines: <= ${config.linesThreshold}, files: <= ${config.filesThreshold}`,
    `Average Commit Impact = Sum(Additions + Deletions) / Total Commits`,
    `Atomicity Score = % of commits within atomic thresholds`,
    `Health classification: excellent (>=80%), healthy (>=65%), moderate (>=50%), concerning (>=35%), critical (<35%)`,
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
    `Lines threshold = ${config.linesThreshold}`,
    `Files threshold = ${config.filesThreshold}`,
  ];
}
