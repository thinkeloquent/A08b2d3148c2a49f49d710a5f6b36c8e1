/**
 * Static report metadata for all-user-commit analysis.
 */

export const REPORT_VERSION = "1.0";
export const TOOL_NAME = "all-user-commit";
export const REPORT_DESCRIPTION = "All User Commits: A comprehensive collection of all commits authored by a developer across repositories.";
export const REPORT_INSIGHT = "Insight: Provides the raw commit foundation for higher-level analyses like code churn, work patterns, and contribution trends.";
export const REPORT_ANALYSIS = "Sweeps all accessible repositories for the target user, fetches direct branch commits and PR-associated commits separately, then cross-references by SHA to deduplicate and classify each commit as direct or pull-request. Date-range partitioning in weekly intervals overcomes the GitHub API 1,000-result limit.";
export const REPORT_IMPROVES = "Developer Activity & Contribution Tracking";

export const REPORT_PLAIN_ENGLISH = {
  what: "Produces a complete, deduplicated inventory of every commit a developer authored across all repositories, distinguishing direct branch commits from pull-request commits.",
  how: "Fetches commits per repository via the commits API and separately via PR commit endpoints, then cross-references SHAs to merge both sets without duplicates. Uses weekly date-range partitioning to bypass the 1,000-result API ceiling.",
  why: "Answers 'What did this developer actually ship?' with full commit-level detail — the raw foundation for code churn, work-pattern, and contribution-trend analyses.",
  main_logic: "Validate user → discover repos (filtered by org/repo) → fetch direct commits per repo → search PRs with date partitioning → fetch commits per PR → cross-reference SHAs (relabel direct commits found in PRs) → append remaining PR-only commits → compute summary (totals, additions, deletions, files changed, date range) → output report.",
};

export const REPORT_CRITERIA = [
  "Commits authored by the specified user",
  "Commits within the specified date range (if provided)",
  "Both direct commits and pull request commits included",
  "Repository-based approach for reliable commit discovery",
  "Dual search strategy using both author: and user: qualifiers",
  "Partitioned queries for handling >1000 results",
  "Enhanced commit details including parents, stats, and files (if enabled)",
];

export const REPORT_FORMULA = [
  "Direct commits = commits found in user's repositories not associated with any pull request",
  "Pull request commits = commits that are part of a pull request authored by the user",
  "Total commits = direct commits + pull request commits (deduplicated by SHA)",
  "Repository filtering applied based on org and repo parameters if specified",
  "Date partitioning applied in weekly intervals to overcome 1000-result API limit",
  "Total additions = sum of all lines added across all commits",
  "Total deletions = sum of all lines deleted across all commits",
  "Total files changed = sum of all files modified across all commits",
  "Total records fetched = cumulative count across all API calls, respecting totalRecords limit",
];

/**
 * Build dynamic criteria entries based on config.
 * @param {object} config
 * @returns {string[]}
 */
export function buildCriteria(config) {
  return [
    ...REPORT_CRITERIA,
    `Total records limit enforced: ${
      config.totalRecords > 0 ? config.totalRecords : "No limit"
    }`,
  ];
}
