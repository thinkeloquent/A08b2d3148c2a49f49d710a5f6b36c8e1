import { Command } from "commander";
import { addCommonOptions } from "@internal/github-api-sdk-cli";

/**
 * Create and configure the Commander program with all CLI options.
 * @returns {Command}
 */
export function createProgram() {
  const program = new Command();

  program
    .name("developer_insights")
    .description(
      "Generate comprehensive individual efficiency reports for performance reviews"
    );

  // Add all common options from SDK
  addCommonOptions(program);

  // Tool-specific options
  program
    .option(
      "--partitionStrategy <strategy>",
      "Partitioning strategy: time, size, auto",
      "auto"
    )
    .option(
      "--fetchStrategy <strategy>",
      "Fetch strategy: commits-by-date, code-by-size, repos-by-date",
      "commits-by-date"
    )
    .option(
      "--modules <modules>",
      "Comma-separated analysis modules",
      "prThroughput,codeChurn,workPatterns,prCycleTime"
    )
    .option("--databaseUrl <url>", "Database URL for database export");

  return program;
}
