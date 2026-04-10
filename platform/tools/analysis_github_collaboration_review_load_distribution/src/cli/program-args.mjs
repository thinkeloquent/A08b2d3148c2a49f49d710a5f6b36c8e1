import { Command } from "commander";
import { addCommonOptions } from "@internal/github-api-sdk-cli";

/**
 * Create and configure the Commander program with all CLI options.
 * @returns {Command}
 */
export function createProgram() {
  const program = new Command();

  program
    .name("review_load_distribution")
    .description(
      "Analyze review load distribution — who is doing the most code reviews and how review work is spread across team members"
    );

  // Add all common options from SDK
  addCommonOptions(program);

  // Tool-specific options
  program.option(
    "--partitionBy <qualifier>",
    "Partition qualifier for search (created|updated)",
    "created"
  );

  return program;
}
