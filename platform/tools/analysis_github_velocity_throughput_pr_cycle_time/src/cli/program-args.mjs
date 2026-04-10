import { Command } from "commander";
import { addCommonOptions } from "@internal/github-api-sdk-cli";

/**
 * Create and configure the Commander program with all CLI options.
 * @returns {Command}
 */
export function createProgram() {
  const program = new Command();

  program
    .name("pr_cycle_time")
    .description(
      "Analyze PR cycle time — duration from first commit to PR merge"
    );

  // Add all common options from SDK
  addCommonOptions(program);

  // Tool-specific options
  program
    .option(
      "--includeCommitHistory",
      "Fetch first commit date for each PR (more accurate cycle time)",
      true
    )
    .option(
      "--partitionBy <qualifier>",
      "Partition qualifier for search (created|updated)",
      "created"
    );

  return program;
}
