import { Command } from "commander";
import { addCommonOptions } from "@internal/github-api-sdk-cli";

/**
 * Create and configure the Commander program with all CLI options.
 * @returns {Command}
 */
export function createProgram() {
  const program = new Command();

  program
    .name("secret_scanning")
    .description(
      "Downloads GitHub secret scanning alerts with locations, optionally applies a user-provided handler to remediate secrets in local files, and resolves alerts on GitHub"
    );

  // Add all common options from SDK
  addCommonOptions(program);

  // Tool-specific options
  program
    .requiredOption(
      "--mode <mode>",
      "Operation mode: 'check' (download and display) or 'resolve' (download, apply handler, resolve)"
    )
    .option(
      "--handler <path>",
      "Path to handler .mjs file (required for resolve mode)"
    )
    .option(
      "--secretResolution <resolution>",
      "Resolution reason for secret scanning alerts: false_positive, wont_fix, revoked, used_in_tests",
      "false_positive"
    )
    .option(
      "--autoResolve",
      "Auto-resolve alerts on GitHub after handler fixes all locations",
      false
    )
    .option(
      "--dryRun",
      "Preview mode — handler runs locally but no GitHub API writes (default: enabled)",
      true
    )
    .option(
      "--no-dryRun",
      "Disable dry-run mode (required together with --autoResolve to resolve on GitHub)"
    )
    .option(
      "--repoRoot <path>",
      "Local repository root for file operations (default: auto-detect from git)"
    );

  return program;
}
