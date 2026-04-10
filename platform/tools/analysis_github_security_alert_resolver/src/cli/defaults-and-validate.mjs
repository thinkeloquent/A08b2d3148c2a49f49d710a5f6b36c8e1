import { validateAndNormalize as sdkValidate } from "@internal/github-api-sdk-cli";

const VALID_ALERT_TYPES = ["code-scanning", "secret-scanning", "dependabot"];

/**
 * Validate required fields, set defaults, coerce types, and normalize CLI options.
 * Delegates common validation to SDK, then applies tool-specific coercions.
 * @param {object} options - Raw options from Commander or interactive CLI
 * @returns {object} validated and normalized options
 */
export function validateAndNormalize(options) {
  const coerced = { ...options };

  // Coerce alertTypes from comma-separated string to array before SDK validation
  if (typeof coerced.alertTypes === "string") {
    coerced.alertTypes = coerced.alertTypes
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  if (!Array.isArray(coerced.alertTypes) || coerced.alertTypes.length === 0) {
    coerced.alertTypes = ["code-scanning", "secret-scanning", "dependabot"];
  }

  // Validate each alert type
  coerced.alertTypes = coerced.alertTypes.filter((t) =>
    VALID_ALERT_TYPES.includes(t)
  );
  if (coerced.alertTypes.length === 0) {
    coerced.alertTypes = ["code-scanning", "secret-scanning", "dependabot"];
  }

  // autoClose implies no-dryRun
  if (coerced.autoClose) {
    coerced.dryRun = false;
  }

  // Coerce boolean flags that may arrive as strings from commander
  if (typeof coerced.dryRun === "string") {
    coerced.dryRun = coerced.dryRun !== "false";
  }
  if (typeof coerced.autoClose === "string") {
    coerced.autoClose = coerced.autoClose === "true";
  }

  // Ensure dismissReason has a value
  if (!coerced.dismissReason) {
    coerced.dismissReason = "false positive";
  }

  // Ensure dismissComment has a value
  if (!coerced.dismissComment) {
    coerced.dismissComment =
      "Auto-resolved: alert no longer present on default branch";
  }

  // Token precedence: GITHUB_TOKEN_SECSCAN > GITHUB_TOKEN > --token flag
  if (!coerced.token) {
    coerced.token = process.env.GITHUB_TOKEN_SECSCAN || process.env.GITHUB_TOKEN;
  }

  // Common validation (token, dates, meta-tags, searchUser/org/repo, etc.)
  const validated = sdkValidate(coerced, { requireUser: false });

  return validated;
}
