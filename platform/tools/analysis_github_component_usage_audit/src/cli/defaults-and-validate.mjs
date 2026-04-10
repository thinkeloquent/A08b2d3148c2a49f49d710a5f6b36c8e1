import { validateAndNormalize as sdkValidate } from "@internal/github-api-sdk-cli";

/**
 * Validate required fields, set defaults, coerce types, and normalize CLI options.
 * Delegates common validation to SDK, then applies tool-specific coercions.
 *
 * GITHUB_TOKEN and GITHUB_BASE_API_URL must be provided as explicit arguments
 * (via --token and --baseUrl). Environment variables are NOT used — this avoids
 * silent misconfiguration when running on cloud providers with private GitHub.
 *
 * @param {object} options - Raw options from Commander or interactive CLI
 * @returns {object} validated and normalized options
 */
export function validateAndNormalize(options) {
  // Require explicit token — do NOT fall back to process.env
  if (!options.token) {
    throw new Error(
      "GITHUB_TOKEN is required. Pass it via --token <value> (CLI) or the interactive prompt.",
    );
  }

  // Require explicit baseUrl — do NOT fall back to process.env or default
  if (!options.baseUrl) {
    throw new Error(
      "GITHUB_BASE_API_URL is required. Pass it via --baseUrl <url> (CLI) or the interactive prompt.",
    );
  }

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
