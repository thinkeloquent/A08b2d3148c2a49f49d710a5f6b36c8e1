import { Command } from "commander";
import { addCommonOptions } from "@internal/github-api-sdk-cli";

/**
 * Create and configure the Commander program with all CLI options.
 * @returns {Command}
 */
export function createProgram() {
  const program = new Command();

  program
    .name("file_touch_frequency")
    .description(
      "Analyze file touch frequency (knowledge entropy) — identifies hotspot files that are modified most frequently across commits"
    );

  // Add all common options from SDK
  addCommonOptions(program);

  // Tool-specific options
  program
    .option(
      "--hotspotThreshold <number>",
      "Minimum file frequency (%) to classify a file as a hotspot",
      "10"
    )
    .option(
      "--topFilesLimit <number>",
      "Number of top files to include in the hotspot ranking",
      "50"
    );

  return program;
}
