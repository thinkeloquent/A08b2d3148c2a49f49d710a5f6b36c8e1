import { validateAndNormalize as sdkValidate } from "@internal/github-api-sdk-cli";

/**
 * Validate required fields, set defaults, coerce types, and normalize CLI options.
 * Delegates common validation to SDK, then applies tool-specific coercions.
 * @param {object} options - Raw options from Commander or interactive CLI
 * @returns {object} validated and normalized options
 */
export function validateAndNormalize(options) {
  // Common validation (token, dates, meta-tags, searchUser required, etc.)
  const validated = sdkValidate(options, { requireUser: true });

  // Coerce includeCommits to boolean
  if (typeof validated.includeCommits === "string") {
    validated.includeCommits = validated.includeCommits !== "false";
  } else if (validated.includeCommits === undefined) {
    validated.includeCommits = true;
  }

  // Coerce includePRs to boolean
  if (typeof validated.includePRs === "string") {
    validated.includePRs = validated.includePRs !== "false";
  } else if (validated.includePRs === undefined) {
    validated.includePRs = true;
  }

  // Coerce includeReviews to boolean
  if (typeof validated.includeReviews === "string") {
    validated.includeReviews = validated.includeReviews !== "false";
  } else if (validated.includeReviews === undefined) {
    validated.includeReviews = true;
  }

  // Coerce minSessionGapMinutes to integer
  if (validated.minSessionGapMinutes) {
    validated.minSessionGapMinutes = parseInt(validated.minSessionGapMinutes, 10);
  } else if (validated.minSessionGapMinutes === undefined) {
    validated.minSessionGapMinutes = 30;
  }

  return validated;
}
