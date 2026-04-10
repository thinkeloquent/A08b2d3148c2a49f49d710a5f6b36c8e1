import { execSync } from "child_process";
import { validateAndNormalize as sdkValidate } from "@internal/github-api-sdk-cli";

/**
 * Validate required fields, set defaults, coerce types, and normalize CLI options.
 * @param {object} options - Raw options from Commander or interactive CLI
 * @returns {object} validated and normalized options
 */
export function validateAndNormalize(options) {
  const coerced = { ...options };

  // autoResolve implies no-dryRun
  if (coerced.autoResolve) {
    coerced.dryRun = false;
  }

  // Coerce boolean flags that may arrive as strings from commander
  if (typeof coerced.dryRun === "string") {
    coerced.dryRun = coerced.dryRun !== "false";
  }
  if (typeof coerced.autoResolve === "string") {
    coerced.autoResolve = coerced.autoResolve === "true";
  }

  // Token precedence: GITHUB_TOKEN_SECSCAN > GITHUB_TOKEN > --token flag
  if (!coerced.token) {
    coerced.token =
      process.env.GITHUB_TOKEN_SECSCAN || process.env.GITHUB_TOKEN;
  }

  // Auto-detect repoRoot from git if not provided
  if (!coerced.repoRoot) {
    try {
      coerced.repoRoot = execSync("git rev-parse --show-toplevel", {
        encoding: "utf-8",
      }).trim();
    } catch {
      coerced.repoRoot = process.cwd();
    }
  }

  // Common validation (token, dates, meta-tags, searchUser/org/repo, etc.)
  const validated = sdkValidate(coerced, { requireUser: false });

  return validated;
}
