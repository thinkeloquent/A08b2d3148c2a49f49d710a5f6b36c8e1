import chalk from "chalk";
import { resolveGithubEnv } from "@internal/env-resolver";
import { parseMetaTags } from "./parse-meta-tags.js";

export interface ValidateOptions {
  /** When true, searchUser is required (e.g. user_status tool) */
  requireUser?: boolean;
}

/**
 * Validate required fields, set defaults, coerce types, and normalize CLI options.
 * This is the common validation layer; tools may add tool-specific coercions after.
 */
export function validateAndNormalize(
  options: Record<string, any>,
  { requireUser = false }: ValidateOptions = {},
): Record<string, any> {
  // Validate at least one query input
  if (requireUser && !options.searchUser) {
    console.error(chalk.red("Error: --searchUser is required for this analysis"));
    process.exit(1);
  }

  if (!options.searchUser && !options.org && !options.repo) {
    console.error(
      chalk.red(
        "Error: At least one of --searchUser, --org, or --repo is required",
      ),
    );
    process.exit(1);
  }

  // Validate GitHub token
  if (!options.token && !resolveGithubEnv().token) {
    console.error(
      chalk.red(
        "Error: GitHub token is required. Set GITHUB_TOKEN environment variable or use --token",
      ),
    );
    process.exit(1);
  }

  // Parse meta tags
  if (Array.isArray(options.metaTags)) {
    options.metaTags = parseMetaTags(options.metaTags);
  } else if (options["meta-tags"]) {
    options.metaTags = parseMetaTags(options["meta-tags"]);
  }

  // Handle branch wildcard
  if (options.branch === "*") {
    options.branchWildcard = true;
  }

  // Flatten hierarchy commitSearch object into base config fields
  if (options.commitSearch && typeof options.commitSearch === "object") {
    const cs = options.commitSearch;
    if (cs.mode === "sha" && cs.sha) {
      options.commitSha = cs.sha;
    }
    if (cs.mode === "commitMessage" && cs.commitMessage) {
      options.commitMessage = cs.commitMessage;
    }
    if (cs.mode === "all") {
      options.ignoreDateRange = true;
    }
    if (cs.mode === "branch") {
      options.currentFiles = true;
      options.ignoreDateRange = true;
    }
    if (cs.mode === "dateRange") {
      if (cs.start) options.start = cs.start;
      if (cs.end) options.end = cs.end;
      if (cs.ignoreDateRange) options.ignoreDateRange = cs.ignoreDateRange;
    }
    if (cs.mode === "dateAgo") {
      if (cs.start) options.start = cs.start;
      if (cs.end) options.end = cs.end;
      if (cs.daysAgo) options.daysAgo = cs.daysAgo;
      options.ignoreDateRange = false;
    }
    if (cs.mode === "pullRequest") {
      if (cs.pullRequestNumber) options.pullRequestNumber = cs.pullRequestNumber;
      options.ignoreDateRange = true;
    }
    delete options.commitSearch;
  }

  // Flatten hierarchy searchQuery object into base config fields
  if (options.searchQuery && typeof options.searchQuery === "object") {
    const sq = options.searchQuery;
    options.searchType = sq.searchType;
    options.searchQuery = sq.query;
    if (sq.codeSearchMode) options.codeSearchMode = sq.codeSearchMode;
    if (sq.qualifiers) options.searchQualifiers = sq.qualifiers;
    if (sq.commitDateQualifiers) options.searchQualifiers = sq.commitDateQualifiers;
  }

  // Set default dates if not ignoring date range and not in currentFiles mode
  if (!options.ignoreDateRange && !options.currentFiles) {
    if (!options.start) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      options.start = thirtyDaysAgo.toISOString().split("T")[0];
    }

    if (!options.end) {
      options.end = new Date().toISOString().split("T")[0];
    }

    // Validate date format
    if (options.start || options.end) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (options.start && !dateRegex.test(options.start)) {
        console.error(chalk.red("Start date must be in YYYY-MM-DD format"));
        process.exit(1);
      }
      if (options.end && !dateRegex.test(options.end)) {
        console.error(chalk.red("End date must be in YYYY-MM-DD format"));
        process.exit(1);
      }

      // Validate date logic
      if (
        options.start &&
        options.end &&
        new Date(options.start) > new Date(options.end)
      ) {
        console.error(chalk.red("Start date must be before end date"));
        process.exit(1);
      }

      // Validate dates are not in the future
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (options.start && new Date(options.start) > today) {
        console.error(chalk.red("Start date cannot be in the future"));
        process.exit(1);
      }
      if (options.end && new Date(options.end) > today) {
        console.error(chalk.red("End date cannot be in the future"));
        process.exit(1);
      }
    }
  }

  // Handle non-interactive --daysAgo flag: compute start/end from days value
  if (options.daysAgo && !options.start && !options.end) {
    const days = typeof options.daysAgo === "string"
      ? parseInt(options.daysAgo, 10)
      : options.daysAgo;
    if (!isNaN(days) && days > 0) {
      const d = new Date();
      d.setDate(d.getDate() - days);
      options.start = d.toISOString().split("T")[0];
      options.end = new Date().toISOString().split("T")[0];
      options.daysAgo = days;
      options.ignoreDateRange = false;
    }
  }

  // Convert string numbers to integers
  if (options.totalRecords) {
    options.totalRecords = parseInt(options.totalRecords, 10);
  }
  if (options.delay) {
    options.delay = parseInt(options.delay, 10);
  }
  if (options.pullRequestNumber) {
    options.pullRequestNumber = parseInt(options.pullRequestNumber, 10);
  }
  if (options.daysAgo) {
    options.daysAgo = typeof options.daysAgo === "string"
      ? parseInt(options.daysAgo, 10)
      : options.daysAgo;
  }

  return options;
}
