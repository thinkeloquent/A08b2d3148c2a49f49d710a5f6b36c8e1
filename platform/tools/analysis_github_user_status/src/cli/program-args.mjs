import { Command } from "commander";
import { addCommonOptions } from "@internal/github-api-sdk-cli";

/**
 * Create and configure the Commander program with all CLI options.
 * @returns {Command}
 */
export function createProgram() {
  const program = new Command();

  program
    .name("github_user_status")
    .description(
      "Check the status (Active, Suspended, or Not Found) of GitHub users via the GitHub API"
    );

  // Add all common options from SDK (includes --searchUser, --org, --repo,
  // --token, --format, --outputDir, --filename, --ignoreDateRange, --start,
  // --end, --verbose, --debug, --loadData, --totalRecords, --delay, etc.)
  addCommonOptions(program);

  return program;
}
