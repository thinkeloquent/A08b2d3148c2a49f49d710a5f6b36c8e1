import { Command } from "commander";
import { addCommonOptions } from "@internal/github-api-sdk-cli";

/**
 * Create and configure the Commander program with all CLI options.
 * @returns {Command}
 */
export function createProgram() {
  const program = new Command();

  program
    .name("pr_pickup_time")
    .description(
      "Analyze PR pickup time — elapsed time from PR creation to first non-author response"
    );

  // Add all common options from SDK
  addCommonOptions(program);

  // Tool-specific options
  program
    .option(
      "--includeReviewComments",
      "Fetch review comments (inline code comments) in addition to reviews and issue comments",
      true
    )
    .option(
      "--partitionBy <qualifier>",
      "Partition qualifier for search (created|updated)",
      "created"
    );

  return program;
}
