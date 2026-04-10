import { validateAndNormalize as sdkValidate } from "@internal/github-api-sdk-cli";

/**
 * Validate required fields, set defaults, coerce types, and normalize CLI options.
 * Delegates common validation to SDK, then applies tool-specific coercions.
 * @param {object} options - Raw options from Commander or interactive CLI
 * @returns {object} validated and normalized options
 */
export function validateAndNormalize(options) {
  // Common validation (token, dates, meta-tags, searchUser/org/repo, etc.)
  const validated = sdkValidate(options, { requireUser: true });

  // Coerce thresholds to positive integers
  validated.linesThreshold = Math.max(1, parseInt(validated.linesThreshold, 10) || 200);
  validated.filesThreshold = Math.max(1, parseInt(validated.filesThreshold, 10) || 10);

  return validated;
}
