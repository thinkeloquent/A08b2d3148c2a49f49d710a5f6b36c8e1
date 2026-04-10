import { validateAndNormalize as sdkValidate } from "@internal/github-api-sdk-cli";

/**
 * Validate required fields, set defaults, coerce types, and normalize CLI options.
 * Delegates common validation to SDK, then applies tool-specific coercions.
 * @param {object} options - Raw options from Commander or interactive CLI
 * @returns {object} validated and normalized options
 */
export function validateAndNormalize(options) {
  // Common validation (token, dates, meta-tags, branch, etc.)
  // requireUser=true because developer_insights always needs --searchUser
  const validated = sdkValidate(options, { requireUser: true });

  return validated;
}
