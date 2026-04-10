#!/usr/bin/env node

/**
 * Interactive CLI for File Touch Frequency (Knowledge Entropy) analysis.
 *
 * Usage:
 *   node cli.mjs              — interactive wizard (prompts for all options)
 *   node cli.mjs --searchUser — skip to non-interactive mode (delegates to bin/file_touch_frequency.mjs)
 */

import * as p from "@clack/prompts";
import chalk from "chalk";
import dotenv from "dotenv";
import {
  bail,
  promptHierarchyScope,
  promptHierarchyCascade,
  promptOutputOptions,
} from "@internal/github-api-sdk-cli";
import { validateAndNormalize } from "./src/cli/defaults-and-validate.mjs";
import { FileTouchFrequency } from "./src/services/file-touch-frequency.mjs";

dotenv.config();


// ── Interactive Flow ─────────────────────────────────────────────────

async function runInteractive() {
  p.intro(chalk.cyan.bold("File Touch Frequency (Knowledge Entropy) Analyzer"));

  // ── Hierarchy scope picker ────────────────────────────────────────

  const scopeConfig = {
    levels: {},
  };
  const scope = await promptHierarchyScope(scopeConfig);
  const { token, hierarchy } = await promptHierarchyCascade({ scope, config: scopeConfig });
  const { searchUser, org, repo, start, end, ignoreDateRange, commitSearch, pullRequestNumber } = hierarchy;

  // ── Hotspot thresholds ──────────────────────────────────────────

  const hotspotThreshold = bail(
    await p.text({
      message: "Minimum file frequency (%) to classify as a hotspot",
      placeholder: "10",
      defaultValue: "10",
      validate: (val) => {
        const num = parseFloat(val);
        if (isNaN(num) || num < 1 || num > 100) return "Must be a number between 1 and 100";
      },
    })
  );

  const topFilesLimit = bail(
    await p.text({
      message: "Number of top files to include in hotspot ranking",
      placeholder: "50",
      defaultValue: "50",
      validate: (val) => {
        const num = parseInt(val, 10);
        if (isNaN(num) || num < 1) return "Must be a positive integer";
      },
    })
  );

  // ── Output options ────────────────────────────────────────────────

  const { format, outputDir, filename, totalRecords, delay, verbose, debug } =
    await promptOutputOptions({ searchUser });

  // ── Build options object ──────────────────────────────────────────

  const options = {
    searchUser: searchUser || undefined,
    token,
    org: org || undefined,
    repo: repo || undefined,
    format,
    outputDir,
    filename: filename || undefined,
    ignoreDateRange,
    start: start || undefined,
    end: end || undefined,
    commitSearch,
    pullRequestNumber,
    totalRecords,
    delay,
    hotspotThreshold,
    topFilesLimit,
    verbose,
    debug,
    metaTags: [],
  };

  // ── Confirmation summary ──────────────────────────────────────────

  p.log.step(chalk.bold("Configuration Summary"));

  const summaryLines = [
    `  Username           ${chalk.green(options.searchUser || "N/A")}`,
    `  Organization       ${chalk.green(options.org || "All")}`,
    `  Repositories       ${chalk.green(options.repo || "All")}`,
  ];

  if (options.ignoreDateRange) {
    summaryLines.push(`  Date range         ${chalk.yellow("All time")}`);
  } else if (options.start && options.end) {
    summaryLines.push(
      `  Date range         ${chalk.green(options.start)} to ${chalk.green(options.end)}`
    );
  } else {
    summaryLines.push(
      `  Date range         ${chalk.green("Last 30 days")}`
    );
  }

  summaryLines.push(
    `  Hotspot threshold  ${chalk.green(">= " + options.hotspotThreshold + "%")}`,
    `  Top files limit    ${chalk.green(options.topFilesLimit)}`,
    `  Format             ${chalk.green(options.format.toUpperCase())}`,
    `  Output             ${chalk.green(options.outputDir)}`,
    `  Record limit       ${
      parseInt(options.totalRecords, 10) > 0
        ? chalk.green(options.totalRecords)
        : chalk.yellow("No limit")
    }`,
    `  API delay          ${chalk.green(options.delay + "s")}`,
    `  Verbose            ${options.verbose ? chalk.green("Yes") : chalk.gray("No")}`,
    `  Debug              ${options.debug ? chalk.green("Yes") : chalk.gray("No")}`
  );

  console.log(summaryLines.join("\n"));

  const confirmed = bail(
    await p.confirm({
      message: `Run file touch frequency analysis for ${chalk.bold(options.searchUser || options.org || options.repo)}?`,
    })
  );

  if (!confirmed) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  p.outro(`Starting analysis for ${chalk.bold(options.searchUser || options.org || options.repo)}`);

  // ── Execute ───────────────────────────────────────────────────────

  const validated = validateAndNormalize(options);
  const analyzer = new FileTouchFrequency(validated);
  await analyzer.run();
}

// ── Entry point ─────────────────────────────────────────────────────

if (import.meta.url === `file://${process.argv[1]}`) {
  // If --searchUser is passed on argv, delegate to the non-interactive path
  if (process.argv.includes("--searchUser")) {
    const { main } = await import("./src/main.mjs");
    main().catch((error) => {
      console.error(chalk.red(`Unexpected error: ${error.message}`));
      process.exit(1);
    });
  } else {
    runInteractive().catch((error) => {
      console.error(chalk.red(`Unexpected error: ${error.message}`));
      process.exit(1);
    });
  }
}
