import { Command } from "commander";
import { addCommonOptions } from "@internal/github-api-sdk-cli";

/**
 * Create and configure the Commander program with all CLI options.
 * @returns {Command}
 */
export function createProgram() {
  const program = new Command();

  program
    .name("context_switching")
    .description(
      "Analyze developer context switching — frequency of repo changes in activity timeline"
    );

  // Add all common options from SDK
  addCommonOptions(program);

  // Tool-specific options
  program
    .option(
      "--includeCommits",
      "Include commit activity in timeline",
      true
    )
    .option(
      "--includePRs",
      "Include PR open/merge/close activity in timeline",
      true
    )
    .option(
      "--includeReviews",
      "Include review activity in timeline",
      true
    )
    .option(
      "--minSessionGapMinutes <minutes>",
      "Minimum gap (minutes) between activities to start a new focus session",
      "30"
    );

  return program;
}
