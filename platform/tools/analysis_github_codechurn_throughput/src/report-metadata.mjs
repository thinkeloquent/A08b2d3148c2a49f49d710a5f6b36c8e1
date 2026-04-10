/**
 * Static report metadata for code churn vs. throughput ratio analysis.
 */

export const REPORT_VERSION = "1.0";
export const TOOL_NAME = "codechurn-throughput";
export const REPORT_DESCRIPTION = "Code Churn vs. Throughput Ratio: Measures how much code is being rewritten or deleted shortly after being authored, compared to new feature growth.";
export const REPORT_INSIGHT = "Insight: High churn suggests \"thrashing\" — developers are struggling with requirements, or the codebase is so brittle that every fix breaks something else.";
export const REPORT_ANALYSIS = "Fetches PRs (and optionally individual commits) for a user, extracts additions and deletions, then computes churn rate = (deletions / additions) x 100. Aggregates per-PR churn metrics, weekly trends, per-repository breakdown, and PR-size distribution. Classifies overall health from excellent (<15%) through critical (>=75%).";
export const REPORT_IMPROVES = "Code stability and requirement clarity";

export const REPORT_PLAIN_ENGLISH = {
  what: "Measures the ratio of deleted/changed lines to newly added lines — a churn percentage indicating how much rework is happening relative to forward progress.",
  how: "Fetches PRs with their additions and deletions stats. For each PR, computes churn rate = deletions / additions x 100. Optionally enriches with individual commit-level stats for finer granularity. Aggregates into per-PR, per-repo, per-week, and per-size-bucket breakdowns.",
  why: "If you added 100 lines but had to delete or change 80 lines to get there, your net progress is low and your churn is 80%. High churn signals thrashing — unclear requirements, brittle architecture, or insufficient upfront design.",
  main_logic: "Validate user → fetch user's PRs (with additions/deletions) → optionally fetch per-PR commits for commit-level stats → compute churn rate per PR → classify health (excellent through critical) → aggregate: overall churn, net throughput, weekly trends, repo breakdown, size-bucket distribution, highest-churn PRs → output report.",
};

export const REPORT_FORMULA = [
  "Churn Rate = (Deletions / Total Lines Added) x 100",
  "Net Throughput = Total Additions - Total Deletions",
  "Throughput Ratio = Net Throughput / Total Additions",
  "Health: excellent (<15%), healthy (15-30%), moderate (30-50%), concerning (50-75%), critical (>=75%)",
];

/**
 * Build dynamic criteria entries based on config.
 * @param {object} config
 * @returns {string[]}
 */
export function buildCriteria(config) {
  return [
    `PRs filtered for user: ${config.searchUser}`,
    `Analysis granularity: ${config.granularity}-level`,
    `Churn Rate = (Deletions / Total Lines Added) x 100`,
    `Net Throughput = Total Additions - Total Deletions`,
    `Health classification: excellent (<15%), healthy (15-30%), moderate (30-50%), concerning (50-75%), critical (>=75%)`,
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
    `Granularity = ${config.granularity}-level analysis`,
  ];
}
