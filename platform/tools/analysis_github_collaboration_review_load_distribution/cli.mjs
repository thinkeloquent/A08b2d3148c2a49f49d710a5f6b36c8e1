#!/usr/bin/env node

/**
 * Interactive CLI for Review Load Distribution analysis.
 *
 * Usage:
 *   node cli.mjs              — interactive wizard (prompts for all options)
 *   node cli.mjs --searchUser — skip to non-interactive mode (delegates to bin/review_load_distribution.mjs)
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
import { ReviewLoadDistribution } from "./src/services/review-load-distribution.mjs";

dotenv.config();


// ── Interactive Flow ─────────────────────────────────────────────────

async function runInteractive() {
  p.intro(chalk.cyan.bold("Review Load Distribution Analyzer"));

  // ── Hierarchy scope picker ────────────────────────────────────────

  const scopeConfig = {
    levels: {},
  };
  const scope = await promptHierarchyScope(scopeConfig);
  const { token, hierarchy } = await promptHierarchyCascade({ scope, config: scopeConfig });
  const { searchUser, org, repo, start, end, ignoreDateRange, commitSearch, pullRequestNumber } = hierarchy;

  // ── Common output prompts from SDK ─────────────────────────────────

  const { format, outputDir, filename, totalRecords, delay, verbose, debug } =
    await promptOutputOptions({ searchUser });

  // ── Build options object ───────────────────────────────────────────

  const options = {
    searchUser: searchUser || undefined,
    token,
    org: org || undefined,
    repo: repo || undefined,
    format,
    outputDir: outputDir || "./output",
    filename: filename || undefined,
    ignoreDateRange,
    start: start || undefined,
    end: end || undefined,
    commitSearch,
    pullRequestNumber,
    totalRecords: totalRecords || "0",
    delay: delay || "6",
    verbose,
    debug,
    metaTags: [],
  };

  // ── Confirmation summary ───────────────────────────────────────────

  p.log.step(chalk.bold("Configuration Summary"));

  const summaryLines = [
    `  Username       ${chalk.green(options.searchUser)}`,
    `  Organization   ${chalk.green(options.org || "All")}`,
    `  Repositories   ${chalk.green(options.repo || "All")}`,
  ];

  if (options.ignoreDateRange) {
    summaryLines.push(`  Date range     ${chalk.yellow("All time")}`);
  } else if (options.start && options.end) {
    summaryLines.push(
      `  Date range     ${chalk.green(options.start)} to ${chalk.green(options.end)}`
    );
  } else {
    summaryLines.push(
      `  Date range     ${chalk.green("Last 30 days")}`
    );
  }

  if (options.pullRequestNumber) {
    summaryLines.push(`  Pull Request   ${chalk.green("#" + options.pullRequestNumber)}`);
  }

  summaryLines.push(
    `  Format         ${chalk.green(options.format.toUpperCase())}`,
    `  Output         ${chalk.green(options.outputDir)}`,
    `  Record limit   ${
      parseInt(options.totalRecords, 10) > 0
        ? chalk.green(options.totalRecords)
        : chalk.yellow("No limit")
    }`,
    `  API delay      ${chalk.green(options.delay + "s")}`,
    `  Verbose        ${options.verbose ? chalk.green("Yes") : chalk.gray("No")}`,
    `  Debug          ${options.debug ? chalk.green("Yes") : chalk.gray("No")}`
  );

  console.log(summaryLines.join("\n"));

  const confirmed = bail(
    await p.confirm({
      message: `Run review load distribution analysis for ${chalk.bold(options.searchUser)}?`,
    })
  );

  if (!confirmed) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  p.outro(`Starting analysis for ${chalk.bold(options.searchUser)}`);

  // ── Execute ────────────────────────────────────────────────────────

  const validated = validateAndNormalize(options);
  const analyzer = new ReviewLoadDistribution(validated);
  await analyzer.run();
}

// ── Entry point ──────────────────────────────────────────────────────

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
