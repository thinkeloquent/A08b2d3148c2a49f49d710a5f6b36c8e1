/**
 * Static report metadata for CodeQL code scanning remediation tracker.
 */

export const REPORT_VERSION = "1.0";
export const TOOL_NAME = "codescan-remediation-tracker";
export const REPORT_DESCRIPTION = "Deep-dive analysis of CodeQL code scanning alerts: groups by rule, maps to files, identifies hotspot files, and tracks remediation velocity over time.";
export const REPORT_INSIGHT = "Insight: Tracking fix velocity per rule reveals whether security debt is growing or shrinking, and which rule categories respond best to batch remediation.";
export const REPORT_IMPROVES = "CodeQL remediation planning and progress tracking";

export const REPORT_PLAIN_ENGLISH = {
  what: "Groups CodeQL alerts by rule ID to reveal which rules dominate the backlog. Maps alerts to source files to identify hotspot files with concentrated risk. Tracks how quickly alerts are fixed week-over-week.",
  how: "Fetches open and fixed code scanning alerts for a repository. Groups by rule for breakdown. Extracts file paths from most_recent_instance to build a heatmap. Buckets fixed_at timestamps into ISO weeks and computes average fixes/week and linear trend.",
  why: "Most repositories have a handful of rules and files that account for the majority of alerts. Identifying these lets teams batch-remediate effectively. Velocity tracking shows whether the fix rate is keeping pace with new alert creation.",
  main_logic: "Parse owner/repo → fetch open alerts → fetch fixed alerts → group by rule → build file heatmap → compute remediation velocity → build weekly buckets → flag batch remediation candidates → output report.",
};

export const REPORT_FORMULA = [
  "hotspotScore = alertCount × severityWeight (error=3, warning=2, note=1)",
  "avgFixesPerWeek = totalFixed / weeksAnalyzed",
  "projectedWeeksToZero = openCount / avgFixesPerWeek",
  "trend = linear regression slope over weekly fix counts",
  "batchCandidate = ruleFixCount > 2 × avgRuleFixRate",
];

/**
 * Build dynamic criteria entries based on config.
 * @param {object} config
 * @returns {string[]}
 */
export function buildCriteria(config) {
  return [
    `Repository: ${config.repo}`,
    `Tool filter: ${config.toolName || "CodeQL"}`,
    `Severity filter: ${config.severity?.join(", ") || "all"}`,
    `Include fixed alerts: ${config.includeFixed ? "yes" : "no"}`,
    `Velocity window: ${config.velocityWeeks} weeks`,
    `Top files: ${config.topFiles}`,
    `Top rules: ${config.topRules}`,
    !config.ignoreDateRange && config.start && config.end
      ? `Date range: ${config.start} to ${config.end}`
      : "Date range: All time",
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
    `Velocity analysis window: ${config.velocityWeeks} weeks`,
  ];
}
