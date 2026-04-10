import { Command } from "commander";
import { addCommonOptions } from "@internal/github-api-sdk-cli";

/**
 * Create and configure the Commander program with all CLI options.
 * @returns {Command}
 */
export function createProgram() {
  const program = new Command();

  program
    .name("lead_time_for_changes")
    .description(
      "Analyze lead time for changes — duration from first commit to code reaching main branch"
    );

  // Add all common options from SDK
  addCommonOptions(program);

  // Tool-specific options
  program
    .option(
      "--includeReviews",
      "Fetch review data for detailed lead time breakdown (more API calls)",
      true
    )
    .option(
      "--partitionBy <qualifier>",
      "Partition qualifier for search (created|updated)",
      "created"
    );

  return program;
}
