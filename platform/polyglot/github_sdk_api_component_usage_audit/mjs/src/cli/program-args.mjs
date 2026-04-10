/**
 * Commander Program Arguments
 *
 * Creates a Commander program with common SDK options plus
 * tool-specific options for the component usage audit.
 */

import { Command } from "commander";
import { addCommonOptions } from "@internal/github-api-sdk-cli";

export function createProgram() {
  const program = new Command();

  program
    .name("github_sdk_api_component_usage_audit")
    .description(
      "Audit real-world usage of a React UI component across public GitHub repositories",
    );

  // Add all common options from SDK (token, format, outputDir, etc.)
  addCommonOptions(program);

  // Tool-specific options
  program
    .option(
      "--componentName <name>",
      "React component name to search for (e.g. Accordion)",
    )
    .option(
      "--minStars <number>",
      "Minimum stargazers for repo validation",
      "500",
    )
    .option(
      "--maxPages <number>",
      "Maximum search result pages (1-10, 100 results/page)",
      "10",
    )
    .option(
      "--minFileSize <number>",
      "Minimum file size in bytes for search query",
      "1000",
    );

  return program;
}
