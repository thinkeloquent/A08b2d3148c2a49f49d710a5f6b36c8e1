/**
 * Defaults and Validation
 *
 * Wraps the SDK validateAndNormalize with tool-specific defaults.
 *
 * Key design decision: BaseConfigSchema requires searchUser || org || repo.
 * This tool searches all of GitHub, so we inject a sentinel searchUser
 * value to pass the base refine check.
 */

import { validateAndNormalize as sdkValidate } from "@internal/github-api-sdk-cli";

/**
 * Validate and normalize CLI options for the component usage audit.
 *
 * @param {object} options - Raw CLI options from Commander or interactive wizard.
 * @returns {object} Validated and normalized options.
 */
export function validateAndNormalize(options) {
  // Inject sentinel searchUser to satisfy BaseConfigSchema refine
  // (this tool searches all of GitHub, not a specific user/org/repo)
  if (!options.searchUser && !options.org && !options.repo) {
    options.searchUser = "_github_sdk_api_audit_";
  }

  // Parse numeric strings from Commander
  if (typeof options.minStars === "string") {
    options.minStars = parseInt(options.minStars, 10);
  }
  if (typeof options.maxPages === "string") {
    options.maxPages = parseInt(options.maxPages, 10);
  }
  if (typeof options.minFileSize === "string") {
    options.minFileSize = parseInt(options.minFileSize, 10);
  }

  // requireUser=false because this tool doesn't need --searchUser
  const validated = sdkValidate(options, { requireUser: false });
  return validated;
}
