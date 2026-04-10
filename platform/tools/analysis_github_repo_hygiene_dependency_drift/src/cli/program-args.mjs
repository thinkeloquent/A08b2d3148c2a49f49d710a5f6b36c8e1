import { Command } from "commander";
import { addCommonOptions } from "@internal/github-api-sdk-cli";

/**
 * Create and configure the Commander program with all CLI options.
 * @returns {Command}
 */
export function createProgram() {
  const program = new Command();

  program
    .name("dependency_drift")
    .description(
      "Analyze dependency drift — check how outdated dependencies are in repository dependency files"
    );

  // Add all common options from SDK
  addCommonOptions(program);

  // Tool-specific options
  program.option(
    "--ecosystems <ecosystems>",
    "Comma-separated list of ecosystems to check (npm,pypi)",
    "npm,pypi"
  );

  return program;
}
