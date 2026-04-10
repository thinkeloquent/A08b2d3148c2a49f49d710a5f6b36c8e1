/**
 * Static report metadata for security alert triage analysis.
 */

export const REPORT_VERSION = "1.0";
export const TOOL_NAME = "security-alert-triage";
export const REPORT_DESCRIPTION = "Aggregates open security alerts across code scanning (CodeQL), secret scanning, and Dependabot, categorizes by type/severity/rule, and produces a prioritized triage report.";
export const REPORT_INSIGHT = "Insight: A unified severity-weighted view across all three GitHub security alert types reveals which remediation work delivers the highest risk reduction per engineering hour.";
export const REPORT_ANALYSIS = "Fetches all open alerts from code scanning, secret scanning, and Dependabot APIs. Normalizes severity across different naming schemes, computes a priority score using severity weight, type weight, and recency weight, then groups and sorts alerts for triage.";
export const REPORT_IMPROVES = "Security posture visibility and remediation prioritization";

export const REPORT_PLAIN_ENGLISH = {
  what: "Fetches and aggregates security alerts from all three GitHub alert sources — CodeQL (code scanning), secret scanning, and Dependabot — then ranks them by priority score.",
  how: "Pulls paginated alerts from each enabled API. Normalizes severity to a common scale (critical/high/medium/low). Computes a priority score = severityWeight × typeWeight × recencyWeight. Groups results by type, severity, rule/package, and affected files.",
  why: "Security teams need a single ranked list across alert types to focus effort on the highest-risk items first. Without normalization, critical CodeQL findings compete with Dependabot lows in separate dashboards.",
  main_logic: "Validate config → fetch alerts from selected types → normalize severity → compute priority score → sort by priority → group by type/severity → build report.",
};

export const REPORT_FORMULA = [
  "Priority Score = severityWeight × typeWeight × recencyWeight",
  "Severity weights: critical=4, high=3, medium=2, low=1",
  "Type weights: secret-scanning=1.5, code-scanning=1.2, dependabot=1.0",
  "Recency weights: <7 days=1.5, <30 days=1.2, else=1.0",
  "CodeQL severity map: error→critical, warning→high, note→medium",
  "Secret scanning validity map: active→critical, possibly_valid→high, unknown→medium, invalid→low",
  "Dependabot severity: direct map (critical/high/medium/low)",
];

/**
 * Build dynamic criteria entries based on config.
 * @param {object} config
 * @returns {string[]}
 */
export function buildCriteria(config) {
  return [
    `Repository: ${config.repo}`,
    `Alert types: ${config.alertTypes.join(", ")}`,
    `Alert state: ${config.alertState}`,
    config.minSeverity ? `Minimum severity: ${config.minSeverity}` : null,
    config.toolName ? `Tool name filter: ${config.toolName}` : null,
    `Priority Score = severityWeight × typeWeight × recencyWeight`,
    `Severity weights: critical=4, high=3, medium=2, low=1`,
    `Type weights: secret-scanning=1.5, code-scanning=1.2, dependabot=1.0`,
    `Recency weights: <7 days=1.5, <30 days=1.2, else=1.0`,
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
