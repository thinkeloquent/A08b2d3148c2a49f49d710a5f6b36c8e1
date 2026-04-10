import { Command } from "commander";
import { addCommonOptions } from "@internal/github-api-sdk-cli";

/**
 * Create and configure the Commander program with all CLI options.
 * @returns {Command}
 */
export function createProgram() {
  const program = new Command();

  program
    .name("security_alert_resolver")
    .description(
      "Closes open GitHub security alerts that have already been fixed on the default branch — checks code scanning, secret scanning, and Dependabot alerts and optionally auto-closes resolved ones via the GitHub API"
    );

  // Add all common options from SDK
  addCommonOptions(program);

  // Tool-specific options
  program
    .option(
      "--alertTypes <types>",
      "Comma-separated alert types to check: code-scanning, secret-scanning, dependabot",
      "code-scanning,secret-scanning,dependabot"
    )
    .option(
      "--dryRun",
      "Preview resolved alerts without writing to GitHub API (default: enabled)",
      true
    )
    .option(
      "--no-dryRun",
      "Disable dry-run mode (required together with --autoClose to actually close alerts)"
    )
    .option(
      "--autoClose",
      "Auto-close resolved alerts via GitHub PATCH API (implies --no-dryRun)",
      false
    )
    .option(
      "--dismissReason <reason>",
      'Dismissal reason for code scanning and Dependabot alerts',
      "false positive"
    )
    .option(
      "--dismissComment <comment>",
      "Dismissal comment applied when auto-closing alerts",
      "Auto-resolved: alert no longer present on default branch"
    )
    .option(
      "--secretResolution <resolution>",
      "Resolution reason for secret scanning alerts: false_positive, wont_fix, revoked, used_in_tests",
      "revoked"
    )
    .option(
      "--ref <branch>",
      "Override default branch detection (e.g., main, develop)"
    );

  return program;
}
