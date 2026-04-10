/**
 * Static report metadata for context switching analysis.
 */

export const REPORT_VERSION = "1.0";
export const TOOL_NAME = "context-switching";
export const REPORT_DESCRIPTION = "Context Switching: Analyzing the time between a developer's activity on different repositories.";
export const REPORT_INSIGHT = "Insight: Frequent repository switching fragments focus and increases cognitive overhead, reducing capacity for deep work.";
export const REPORT_ANALYSIS = "Builds a unified chronological activity timeline from PRs (open/merge/close), commits, and reviews across all repositories. Detects a context switch whenever consecutive activities target different repositories. Computes focus sessions as consecutive same-repo activity groups within a configurable gap threshold, and measures switch frequency between specific repo pairs.";
export const REPORT_IMPROVES = "Developer Friction & \"Cognitive Load\"";

export const REPORT_PLAIN_ENGLISH = {
  what: "Measures how often a developer switches between repositories in their activity timeline — a proxy for cognitive fragmentation and multitasking overhead.",
  how: "Merges PR events (open/merge/close), commit activity, and review submissions into a single timeline sorted by timestamp. A context switch occurs when consecutive activities target different repos. Focus score = 1 - (switches / (activities - 1)). Focus sessions are consecutive same-repo groups within the gap threshold.",
  why: "Constant context switching between repositories reduces deep work capacity and signals that a developer may be overloaded across too many projects simultaneously.",
  main_logic: "Validate user → fetch PR events (opened/merged/closed) → fetch commits per repo → fetch review events → deduplicate → sort chronologically → detect switches (repo[i] ≠ repo[i-1]) → contextSwitchRate = switches / (activities - 1) → focusScore = 1 - rate → classify (deep_focus through highly_fragmented) → compute focus sessions (same-repo runs within gap threshold) → repo-pair switch frequency → daily/weekly breakdowns → output report.",
};

export const REPORT_FORMULA = [
  "Context Switch Rate = total_switches / (total_activities - 1)",
  "Focus Score = 1 - context_switch_rate (range 0..1, higher = more focused)",
  "Focus Classification: deep_focus (<0.2), focused (0.2-0.4), moderate (0.4-0.6), fragmented (0.6-0.8), highly_fragmented (>=0.8)",
  "Focus Session = consecutive same-repo activities within the gap threshold",
  "Avg Focus Session Length = total session activities / number of sessions",
  "Avg Time Between Switches = sum(switch gaps) / total switches",
];

/**
 * Build dynamic criteria entries based on config.
 * @param {object} config
 * @returns {string[]}
 */
export function buildCriteria(config) {
  return [
    `Activities filtered for user: ${config.searchUser}`,
    `Context switch = consecutive activities on different repositories`,
    `Focus score = 1 - (switches / (activities - 1))`,
    config.includeCommits ? "Commit activity: included" : "Commit activity: excluded",
    config.includePRs ? "PR activity (open/merge/close): included" : "PR activity: excluded",
    config.includeReviews ? "Review activity: included" : "Review activity: excluded",
    `Focus session gap threshold: ${config.minSessionGapMinutes} minutes`,
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
