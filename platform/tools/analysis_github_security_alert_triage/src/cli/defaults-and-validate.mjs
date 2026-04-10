import { validateAndNormalize as sdkValidate } from "@internal/github-api-sdk-cli";

const VALID_ALERT_TYPES = ["code-scanning", "secret-scanning", "dependabot"];
const VALID_ALERT_STATES = ["open", "closed", "dismissed", "all"];
const VALID_SEVERITIES = ["note", "warning", "error", "critical"];

/**
 * Validate required fields, set defaults, coerce types, and normalize CLI options.
 * Delegates common validation to SDK, then applies tool-specific coercions.
 * @param {object} options - Raw options from Commander or interactive CLI
 * @returns {object} validated and normalized options
 */
export function validateAndNormalize(options) {
  // Coerce alertTypes from comma-separated string to array before SDK validation
  const coerced = { ...options };

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

  // Validate alertState
  if (!VALID_ALERT_STATES.includes(coerced.alertState)) {
    coerced.alertState = "open";
  }

  // Validate minSeverity if provided
  if (coerced.minSeverity && !VALID_SEVERITIES.includes(coerced.minSeverity)) {
    delete coerced.minSeverity;
  }

  // Common validation (token, dates, meta-tags, searchUser/org/repo, etc.)
  const validated = sdkValidate(coerced, { requireUser: false });

  return validated;
}
