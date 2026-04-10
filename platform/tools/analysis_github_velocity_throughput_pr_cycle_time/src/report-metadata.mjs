/**
 * Static report metadata for PR cycle time analysis.
 */

export const REPORT_VERSION = "1.0";
export const TOOL_NAME = "pr-cycle-time";
export const REPORT_DESCRIPTION = "PR Cycle Time: The duration from the first commit to the PR being merged.";
export const REPORT_INSIGHT = "Insight: Identifies if the \"waiting\" stages (Review/QA) are longer than the \"doing\" stages (Coding).";
export const REPORT_ANALYSIS = "For each merged PR, optionally fetches commit history to find the earliest commit date. Computes cycle time as the delta from first commit to merge (falling back to PR creation-to-merge when commit history is unavailable). Produces percentile statistics, distribution buckets (fast through extreme), weekly trend analysis, and per-repository breakdowns.";
export const REPORT_IMPROVES = "Velocity & Throughput";

export const REPORT_PLAIN_ENGLISH = {
  what: "Measures PR cycle time — the duration from the first commit on a PR branch to the PR being merged — as the workhorse metric for sprint-level velocity tracking.",
  how: "Fetches merged PRs and optionally their commit history to find the earliest commit date. Cycle time = merged_at - first_commit_date (falls back to created_at - merged_at when no commit data). Computes avg, p50/p75/p90/p95, and distributes into severity buckets (fast < 1d through extreme > 14d).",
  why: "PR cycle time focuses specifically on how quickly the PR review and merge process completes — useful for identifying slow review cycles without needing full DORA framing. Pairs with PR pickup time to pinpoint where cycle time is lost.",
  main_logic: "Validate user → fetch PRs → [if includeCommitHistory]: for each merged PR: fetch commits → find earliest commit date (_firstCommitDate) → compute: cycleTimeDays = merged_at - firstCommitDate [fallback: merged_at - created_at], openToMergeDays = merged_at - created_at → compute avg + p50/p75/p90/p95 → distribute into buckets (fast/normal/slow/verySlow/extreme) → weekly trend (avg + median per merge week) → per-repo breakdown → output report.",
};

export const REPORT_FORMULA = [
  "Cycle Time = merge_date - first_commit_date (per merged PR)",
  "PR Open to Merge = merge_date - created_date (per merged PR)",
  "Average Cycle Time = Sum(Cycle Times) / Count(Merged PRs)",
  "Merge Rate = (Merged PRs / Total PRs) * 100",
  "Percentiles computed on sorted merged PR cycle times",
  "Distribution buckets: <1d (fast), 1-3d (normal), 3-7d (slow), 7-14d (very slow), >14d (extreme)",
];

/**
 * Build dynamic criteria entries based on config.
 * @param {object} config
 * @returns {string[]}
 */
export function buildCriteria(config) {
  return [
    `Pull requests filtered by author:${config.searchUser} and user:${config.searchUser}`,
    `Cycle time measured from first commit to PR merge`,
    `Fallback: PR created_at to merged_at when commit history unavailable`,
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
