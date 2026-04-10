import { validateAndNormalize as sdkValidate } from "@internal/github-api-sdk-cli";

/**
 * Validate required fields, set defaults, coerce types, and normalize CLI options.
 * Delegates common validation to SDK, then applies tool-specific coercions.
 * @param {object} options - Raw options from Commander or interactive CLI
 * @returns {object} validated and normalized options
 */
export function validateAndNormalize(options) {
  // Common validation (token, dates, meta-tags, branch, etc.)
  const validated = sdkValidate(options);

  // Parse sourceDirs from comma-separated string to array
  if (typeof validated.sourceDirs === "string") {
    validated.sourceDirs = validated.sourceDirs
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);
  }

  // Parse docExtensions from comma-separated string to array
  if (typeof validated.docExtensions === "string") {
    validated.docExtensions = validated.docExtensions
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean)
      .map((e) => (e.startsWith(".") ? e : `.${e}`));
  }

  return validated;
}
