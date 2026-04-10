import { Command } from "commander";
import { addCommonOptions } from "@internal/github-api-sdk-cli";

/**
 * Create and configure the Commander program with all CLI options.
 * @returns {Command}
 */
export function createProgram() {
  const program = new Command();

  program
    .name("component_usage_audit")
    .description(
      "Audit real-world usage of a React UI component across public GitHub repositories"
    );

  // Add all common options from SDK
  addCommonOptions(program);

  // Tool-specific options
  program
    .option(
      "--componentName <name>",
      "React component name to search for (e.g. Accordion)"
    )
    .option(
      "--minStars <number>",
      "Minimum stargazers for repo validation",
      "500"
    )
    .option(
      "--maxPages <number>",
      "Maximum search result pages (1-10, 100 results/page)",
      "10"
    )
    .option(
      "--minFileSize <number>",
      "Minimum file size in bytes for search query",
      "1000"
    );

  return program;
}
