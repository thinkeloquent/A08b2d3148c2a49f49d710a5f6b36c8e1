import { Command } from "commander";
import { addCommonOptions } from "@internal/github-api-sdk-cli";

/**
 * Create and configure the Commander program with all CLI options.
 * @returns {Command}
 */
export function createProgram() {
  const program = new Command();

  program
    .name("revert_refactor_rate")
    .description(
      "Analyze developer friction — frequency of PRs that are reverted or require significant rework after feedback"
    );

  // Add all common options from SDK
  addCommonOptions(program);

  // Tool-specific options
  program
    .option(
      "--reworkThreshold <number>",
      "Minimum review rounds to classify a PR as requiring significant rework",
      "3"
    )
    .option(
      "--postMergeWindowHours <number>",
      "Hours after merge to search for follow-up fix PRs",
      "72"
    );

  return program;
}
