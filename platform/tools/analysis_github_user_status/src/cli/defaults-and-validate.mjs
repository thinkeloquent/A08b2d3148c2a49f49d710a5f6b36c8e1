import { validateAndNormalize as sdkValidate } from "@internal/github-api-sdk-cli";

/**
 * Validate required fields, set defaults, coerce types, and normalize CLI options.
 * Delegates common validation to SDK (requireUser: true), then applies tool-specific coercions.
 * @param {object} options - Raw options from Commander or interactive CLI
 * @returns {object} validated and normalized options
 */
export function validateAndNormalize(options) {
  // This tool checks current user status — it ignores date ranges by default.
  // If neither --start nor --end was provided and --ignoreDateRange was not
  // explicitly set to false by the user, treat it as ignoreDateRange = true.
  const normalized = { ...options };
  if (!normalized.start && !normalized.end && !normalized.ignoreDateRange) {
    normalized.ignoreDateRange = true;
  }

  // Common validation — searchUser is required for this tool
  const validated = sdkValidate(normalized, { requireUser: true });

  return validated;
}
