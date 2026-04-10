import { Command } from "commander";
import { addCommonOptions } from "@internal/github-api-sdk-cli";

/**
 * Create and configure the Commander program with all CLI options.
 * @returns {Command}
 */
export function createProgram() {
  const program = new Command();

  program
    .name("commit_atomicity")
    .description(
      "Analyze commit atomicity — measures the distribution of changes per commit to identify review-proof monolithic commits"
    );

  // Add all common options from SDK
  addCommonOptions(program);

  // Tool-specific options
  program
    .option(
      "--linesThreshold <number>",
      "Max total lines (additions + deletions) for a commit to be considered atomic",
      "200"
    )
    .option(
      "--filesThreshold <number>",
      "Max files changed for a commit to be considered atomic",
      "10"
    );

  return program;
}
