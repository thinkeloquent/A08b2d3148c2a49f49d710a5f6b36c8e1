import { validateAndNormalize as sdkValidate } from "@internal/github-api-sdk-cli";

/**
 * Validate required fields, set defaults, coerce types, and normalize CLI options.
 * Delegates common validation to SDK, then applies tool-specific coercions.
 * @param {object} options - Raw options from Commander or interactive CLI
 * @returns {object} validated and normalized options
 */
export function validateAndNormalize(options) {
  // Common validation (token, dates, meta-tags, searchUser/org/repo, etc.)
  const validated = sdkValidate(options, { requireUser: false });

  // Coerce velocityWeeks to integer
  if (validated.velocityWeeks !== undefined) {
    const n = parseInt(validated.velocityWeeks, 10);
    validated.velocityWeeks = Number.isNaN(n) ? 12 : Math.min(52, Math.max(1, n));
  } else {
    validated.velocityWeeks = 12;
  }

  // Coerce topFiles to integer
  if (validated.topFiles !== undefined) {
    const n = parseInt(validated.topFiles, 10);
    validated.topFiles = Number.isNaN(n) ? 20 : Math.min(100, Math.max(1, n));
  } else {
    validated.topFiles = 20;
  }

  // Coerce topRules to integer
  if (validated.topRules !== undefined) {
    const n = parseInt(validated.topRules, 10);
    validated.topRules = Number.isNaN(n) ? 30 : Math.min(100, Math.max(1, n));
  } else {
    validated.topRules = 30;
  }

  // Normalize severity array
  if (validated.severity && typeof validated.severity === "string") {
    validated.severity = validated.severity.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (!Array.isArray(validated.severity) || validated.severity.length === 0) {
    validated.severity = undefined;
  }

  // Default toolName
  if (!validated.toolName) {
    validated.toolName = "CodeQL";
  }

  // Default includeFixed
  if (validated.includeFixed === undefined) {
    validated.includeFixed = true;
  }

  return validated;
}
