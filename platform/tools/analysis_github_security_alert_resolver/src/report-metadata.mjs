/**
 * Static report metadata for security alert resolver analysis.
 */

export const REPORT_VERSION = "1.0";
export const TOOL_NAME = "security-alert-resolver";
export const REPORT_DESCRIPTION =
  "Checks open security alerts against the default branch and optionally auto-closes alerts that have been resolved. Produces a resolution report consumable by other security tools.";
export const REPORT_INSIGHT =
  "Insight: Automating alert resolution cleanup after fixes are pushed to main ensures the security dashboard reflects the actual state of the codebase.";
export const REPORT_ANALYSIS =
  "Fetches all open alerts from code scanning, secret scanning, and Dependabot APIs. For code scanning, re-fetches the on-default-branch set to identify alerts no longer present. For secret scanning, checks alert locations to verify removal from the default branch. Optionally auto-closes resolved alerts via PATCH API.";
export const REPORT_IMPROVES = "Security alert hygiene and dashboard accuracy";

export const REPORT_PLAIN_ENGLISH = {
  what: "Identifies which open GitHub security alerts have already been fixed on the default branch and optionally auto-closes them via the GitHub API.",
  how: "For code scanning: fetches open alerts then re-fetches filtered by default branch ref — alerts absent from the ref-filtered set are resolved. For secret scanning: checks each alert's locations API to confirm no instances remain on the default branch. For Dependabot: reports open alerts for manual review.",
  why: "After pushing a fix, GitHub does not always auto-close security alerts. This tool automates the cleanup so the security dashboard accurately reflects what is actually vulnerable.",
  main_logic:
    "Validate config → fetch default branch → fetch all open alerts by type → run ResolutionChecker per type → optionally PATCH resolved alerts closed → build structured JSON report.",
};

export const REPORT_FORMULA = [
  "Code scanning resolved = open alerts NOT present when re-fetched with ref=defaultBranch",
  "Secret scanning resolved = open alerts with NO locations on the default branch",
  "Dependabot resolved = alerts whose state is no longer 'open' (auto-managed by GitHub)",
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
    config.ref ? `Branch override: ${config.ref}` : `Branch: auto-detected default branch`,
    `Dry run: ${config.dryRun ? "Yes (no writes)" : "No"}`,
    `Auto close: ${config.autoClose ? "Yes" : "No"}`,
    config.autoClose
      ? `Dismiss reason: ${config.dismissReason}`
      : null,
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
