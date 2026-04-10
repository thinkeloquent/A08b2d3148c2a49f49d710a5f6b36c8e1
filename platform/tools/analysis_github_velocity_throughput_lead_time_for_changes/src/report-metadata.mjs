/**
 * Static report metadata for lead time for changes analysis.
 */

export const REPORT_VERSION = "1.0";
export const TOOL_NAME = "lead-time-for-changes";
export const REPORT_DESCRIPTION = "Lead Time for Changes: How long it takes code to go from a developer's machine to the main branch.";
export const REPORT_INSIGHT = "Insight: Identifies if the \"waiting\" stages (Review/QA) are longer than the \"doing\" stages (Coding).";
export const REPORT_ANALYSIS = "For each merged PR, fetches commit history to find the earliest commit date (first_commit_date), and optionally fetches reviews to identify first_review and last_approval timestamps. Decomposes total lead time into three phases: coding (first commit → PR open), review (PR open → first review), and merge queue (last approval → merge). Classifies results using DORA performance levels (Elite/High/Medium/Low) based on median lead time.";
export const REPORT_IMPROVES = "Velocity & Throughput";

export const REPORT_PLAIN_ENGLISH = {
  what: "Measures the DORA 'Lead Time for Changes' metric — the end-to-end time from a developer's first commit to when that code reaches the main branch, with optional phase decomposition.",
  how: "Fetches merged PRs and their commit history to find the earliest commit date. Optionally fetches reviews for phase breakdown. Lead time = merged_at - first_commit_date. Phases: coding time (first commit → PR open), review time (PR open → first review), merge time (last approval → merge). Computes percentiles and classifies via DORA levels.",
  why: "Lead Time for Changes is one of the four canonical DORA metrics for engineering performance — it captures the full delivery pipeline from code authorship to production-ready state, the gold standard for velocity measurement.",
  main_logic: "Validate user → fetch PRs → for each merged PR: fetch commits → find earliest commit date (_firstCommitDate) → [if includeReviews]: fetch reviews → find _firstReviewAt and _lastApprovalAt → compute: leadTimeDays = merged_at - firstCommitDate, codingTimeDays = created_at - firstCommitDate, reviewTimeDays = firstReview - created_at, mergeTimeDays = merged_at - lastApproval → compute p50/p75/p90/p95 → classify DORA (Elite < 1d, High 1-7d, Medium 7-30d, Low > 30d) → distribution buckets + phase breakdown + weekly trends + per-repo breakdown → output report.",
};

export const REPORT_FORMULA = [
  "Lead Time = merge_date - first_commit_date (per merged PR)",
  "Coding Time = pr_created_date - first_commit_date (time before submitting for review)",
  "Review Time = first_review_date - pr_created_date (wait time for review pickup)",
  "Merge Time = merge_date - last_approval_date (time in merge queue)",
  "PR Open to Merge = merge_date - created_date (fallback when commit history unavailable)",
  "Average Lead Time = Sum(Lead Times) / Count(Merged PRs)",
  "Merge Rate = (Merged PRs / Total PRs) * 100",
  "Percentiles computed on sorted merged PR lead times",
  "DORA Classification: Elite (<1d), High (1-7d), Medium (7-30d), Low (>30d)",
];

/**
 * Build dynamic criteria entries based on config.
 * @param {object} config
 * @returns {string[]}
 */
export function buildCriteria(config) {
  return [
    `Pull requests filtered by author:${config.searchUser} and user:${config.searchUser}`,
    `Lead time measured from first commit to PR merge into main branch`,
    `Fallback: PR created_at to merged_at when commit history unavailable`,
    `Phase breakdown: coding time (first commit to PR open), review time (PR open to first review), merge time (last approval to merge)`,
    !config.ignoreDateRange && config.start && config.end
      ? `Date range: ${config.start} to ${config.end}`
      : "Date range: All time",
    config.org ? `Organization scope: ${config.org}` : null,
    config.repo ? `Repository scope: ${config.repo}` : null,
    config.totalRecords > 0
      ? `Total records limit: ${config.totalRecords}`
      : null,
    config.includeReviews
      ? "Review data included for phase breakdown"
      : "Review data excluded",
  ].filter(Boolean);
}
