import { Command } from "commander";
import { addCommonOptions } from "@internal/github-api-sdk-cli";

/**
 * Create and configure the Commander program with all CLI options.
 * @returns {Command}
 */
export function createProgram() {
  const program = new Command();

  program
    .name("markdown_to_code")
    .description(
      "Analyze documentation markdown-to-code ratio — correlating commit volume in docs vs source"
    );

  // Add all common options from SDK
  addCommonOptions(program);

  // Tool-specific options
  program
    .option(
      "--sourceDirs <dirs>",
      "Comma-separated source directories to classify as code (e.g. src,lib,app)",
      "src"
    )
    .option(
      "--docExtensions <exts>",
      "Comma-separated documentation file extensions (e.g. .md,.mdx)",
      ".md,.mdx"
    );

  return program;
}
