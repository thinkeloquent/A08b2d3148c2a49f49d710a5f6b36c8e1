export const REPORT_VERSION = "1.0";
export const TOOL_NAME = "github-security-secret-scanning";
export const REPORT_DESCRIPTION =
  "Downloads secret scanning alerts and their locations from GitHub, optionally applies a user-provided handler to remediate secrets in local files, and resolves alerts on GitHub.";
export const REPORT_INSIGHT =
  "Insight: Automating secret remediation reduces mean-time-to-resolution and prevents secrets from persisting in codebases after detection.";
export const REPORT_IMPROVES =
  "Secret scanning alert hygiene and credential rotation compliance";

export const REPORT_PLAIN_ENGLISH = {
  what: "Downloads open secret scanning alerts from GitHub with full location data, applies a user-provided handler function to fix each occurrence in local files, and optionally resolves the alerts on GitHub.",
  how: "Fetches alerts via the GitHub secret scanning API, enriches each with its locations endpoint, invokes the handler per (alert, location) pair, and calls the PATCH resolve endpoint for fully-fixed alerts.",
  why: "GitHub detects exposed secrets but does not fix them. This tool bridges detection and remediation by letting teams plug in custom handlers that redact, rotate, or replace secrets across the codebase.",
  main_logic:
    "Validate config → fetch alerts → fetch locations per alert → save alert data → (check: display summary | resolve: load handler → apply per location → auto-resolve on GitHub) → generate report",
};

export const REPORT_FORMULA = [
  "Alert fetched = open secret scanning alerts via GET /repos/{owner}/{repo}/secret-scanning/alerts?state=open",
  "Locations fetched = GET /repos/{owner}/{repo}/secret-scanning/alerts/{n}/locations per alert",
  "Handler result = handler(alert, location, context) → { action: fixed|skipped|error }",
  "Auto-resolve eligible = alerts where ALL locations returned action=fixed",
  "Resolved on GitHub = PATCH /repos/{owner}/{repo}/secret-scanning/alerts/{n} with state=resolved",
];

/**
 * Build dynamic criteria list based on config.
 * @param {object} config
 * @returns {string[]}
 */
export function buildCriteria(config) {
  return [
    `Repository: ${config.repo}`,
    `Mode: ${config.mode}`,
    `Handler: ${config.handler || "N/A"}`,
    `Secret resolution: ${config.secretResolution}`,
    `Auto resolve: ${config.autoResolve ? "Yes" : "No"}`,
    `Dry run: ${config.dryRun ? "Yes" : "No"}`,
    `Repo root: ${config.repoRoot || "N/A"}`,
  ];
}

/**
 * Build formula list.
 * @param {object} _config
 * @returns {string[]}
 */
export function buildFormula(_config) {
  return [...REPORT_FORMULA];
}
