/**
 * Static report metadata for developer insights analysis.
 */

export const REPORT_VERSION = "1.0";
export const TOOL_NAME = "developer-insights";
export const REPORT_DESCRIPTION = "Developer Insights: A holistic profile combining PR throughput, code churn, work patterns, and cycle time for a single developer.";
export const REPORT_INSIGHT = "Insight: Surfaces productivity patterns, after-hours work, and merge efficiency to guide 1:1 conversations and team support.";
export const REPORT_ANALYSIS = "Runs four pluggable analysis modules in a single pass: PR Throughput (merge rate, avg time-to-merge), PR Cycle Time (created-to-merged duration), Code Churn (additions/deletions, commit size distribution), and Work Patterns (day/hour punchcard, after-hours percentage). Data is sourced from PRs and per-repository commit history, with repositories discovered from PR metadata or GraphQL.";
export const REPORT_IMPROVES = "Developer Experience & Productivity";

export const REPORT_PLAIN_ENGLISH = {
  what: "Produces a 360-degree developer profile combining PR throughput, code churn, work-hour patterns, and cycle time into a single comprehensive report.",
  how: "Fetches PRs and commits, then runs four analysis modules: (1) PR Throughput — merge rate and avg time-to-merge; (2) PR Cycle Time — created-to-merged duration per PR; (3) Code Churn — additions/deletions totals and commit size distribution (small/medium/large); (4) Work Patterns — day/hour punchcard and after-hours activity percentage.",
  why: "Provides a unified view for performance calibration, capacity planning, and identifying overwork patterns — replacing the need to run multiple separate analyses.",
  main_logic: "Validate user → fetch PRs → discover repositories (from PR data, GraphQL, or config) → fetch commits across repos → run enabled modules: PRThroughput (merge rate, avg merge time) → PRCycleTime (avg cycle time for merged PRs) → CodeChurn (additions, deletions, net change, size distribution) → WorkPatterns (day/hour counts, after-hours %, punchcard) → generate summary → output report.",
};

export const REPORT_FORMULA = [
  "Merge Rate = (Merged PRs / Total PRs) * 100",
  "Average Time to Merge = Sum(Merge Time) / Count(Merged PRs)",
  "Net Code Change = Total Additions - Total Deletions",
  "After Hours Percentage = (After Hours Activities / Total Activities) * 100",
  "Average Cycle Time = Sum(Cycle Times) / Count(Merged PRs)",
];

/**
 * Build dynamic criteria entries based on config.
 * @param {object} config
 * @returns {string[]}
 */
export function buildCriteria(config) {
  return [
    `Pull requests filtered by author:${config.searchUser} and user:${config.searchUser}`,
    `Commits filtered by author:${config.searchUser}`,
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
