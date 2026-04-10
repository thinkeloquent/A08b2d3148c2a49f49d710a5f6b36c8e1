import { Command } from "commander";
import { addCommonOptions } from "@internal/github-api-sdk-cli";

/**
 * Create and configure the Commander program with all CLI options.
 * @returns {Command}
 */
export function createProgram() {
  const program = new Command();

  program
    .name("all_user_commit")
    .description(
      "Analyze all commits made by a GitHub user within a date range"
    );

  // Add all common options from SDK
  addCommonOptions(program);

  // Tool-specific options
  program.option(
    "--includeDetails",
    "Include detailed commit information (parents, stats, files)",
    true
  );

  return program;
}
