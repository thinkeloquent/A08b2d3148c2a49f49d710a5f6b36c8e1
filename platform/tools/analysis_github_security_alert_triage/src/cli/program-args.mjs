import { Command } from "commander";
import { addCommonOptions } from "@internal/github-api-sdk-cli";

/**
 * Create and configure the Commander program with all CLI options.
 * @returns {Command}
 */
export function createProgram() {
  const program = new Command();

  program
    .name("security_alert_triage")
    .description(
      "Aggregate open security alerts across code scanning (CodeQL), secret scanning, and Dependabot — normalizes severity and produces a prioritized triage report"
    );

  // Add all common options from SDK
  addCommonOptions(program);

  // Tool-specific options
  program
    .option(
      "--alertTypes <types>",
      "Comma-separated alert types to fetch: code-scanning, secret-scanning, dependabot",
      "code-scanning,secret-scanning,dependabot"
    )
    .option(
      "--alertState <state>",
      "Alert state to filter: open, closed, dismissed, all",
      "open"
    )
    .option(
      "--minSeverity <level>",
      "Minimum severity to include: note, warning, error, critical"
    )
    .option(
      "--toolName <name>",
      "Filter code-scanning alerts by tool name (e.g., CodeQL)"
    );

  return program;
}
