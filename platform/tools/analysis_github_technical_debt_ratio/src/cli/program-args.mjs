import { Command } from "commander";
import { addCommonOptions } from "@internal/github-api-sdk-cli";

/**
 * Create and configure the Commander program with all CLI options.
 * @returns {Command}
 */
export function createProgram() {
  const program = new Command();

  program
    .name("technical_debt_ratio")
    .description(
      "Analyze technical debt ratio — classifies commits into Feature, Fix, Refactor, or Chore and computes the debt ratio"
    );

  // Add all common options from SDK
  addCommonOptions(program);

  // No additional tool-specific CLI options needed.
  // Classification uses built-in keyword matching on commit messages.

  return program;
}
