import { Command } from "commander";
import { addCommonOptions } from "@internal/github-api-sdk-cli";

/**
 * Create and configure the Commander program with all CLI options.
 * @returns {Command}
 */
export function createProgram() {
  const program = new Command();

  program
    .name("codechurn_throughput")
    .description(
      "Analyze code churn vs. throughput ratio — measures how much code is rewritten or deleted compared to new feature growth"
    );

  // Add all common options from SDK
  addCommonOptions(program);

  // Tool-specific options
  program
    .option(
      "--granularity <level>",
      "Analysis granularity: 'pr' (PR-level stats) or 'commit' (individual commit stats)",
      "pr"
    );

  return program;
}
