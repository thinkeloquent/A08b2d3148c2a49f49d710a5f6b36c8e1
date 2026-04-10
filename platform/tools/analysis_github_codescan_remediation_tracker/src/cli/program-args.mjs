import { Command } from "commander";
import { addCommonOptions } from "@internal/github-api-sdk-cli";

/**
 * Create and configure the Commander program with all CLI options.
 * @returns {Command}
 */
export function createProgram() {
  const program = new Command();

  program
    .name("codescan_remediation_tracker")
    .description(
      "Deep-dive into CodeQL code scanning alerts — group by rule, map to hotspot files, track remediation velocity over time"
    );

  // Add all common options from SDK
  addCommonOptions(program);

  // Tool-specific options
  program
    .option(
      "--severity <levels>",
      "Comma-separated severity levels to include: error,warning,note",
      (val) => val.split(",").map((s) => s.trim())
    )
    .option(
      "--toolName <name>",
      "Code scanning tool name to filter by",
      "CodeQL"
    )
    .option(
      "--includeFixed",
      "Include fixed/closed alerts in velocity analysis",
      false
    )
    .option(
      "--velocityWeeks <n>",
      "Number of weeks to analyze for remediation velocity",
      (val) => parseInt(val, 10),
      12
    )
    .option(
      "--topFiles <n>",
      "Number of top hotspot files to include in report",
      (val) => parseInt(val, 10),
      20
    )
    .option(
      "--topRules <n>",
      "Number of top rules to include in report",
      (val) => parseInt(val, 10),
      30
    );

  return program;
}
