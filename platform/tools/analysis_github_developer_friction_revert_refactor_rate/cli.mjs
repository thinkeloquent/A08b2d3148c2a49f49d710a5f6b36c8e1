#!/usr/bin/env node

/**
 * Interactive CLI for Revert/Refactor Rate analysis.
 *
 * Usage:
 *   node cli.mjs              — interactive wizard (prompts for all options)
 *   node cli.mjs --searchUser — skip to non-interactive mode (delegates to bin/revert_refactor_rate.mjs)
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
import { RevertRefactorRate } from "./src/services/revert-refactor-rate.mjs";

dotenv.config();


// ── Interactive Flow ─────────────────────────────────────────────────

async function runInteractive() {
  p.intro(chalk.cyan.bold("Revert/Refactor Rate Analyzer"));

  // ── Hierarchy scope picker ────────────────────────────────────────

  const scopeConfig = {
    levels: {},
  };
  const scope = await promptHierarchyScope(scopeConfig);
  const { token, hierarchy } = await promptHierarchyCascade({ scope, config: scopeConfig });
  const { searchUser, org, repo, start, end, ignoreDateRange, commitSearch, pullRequestNumber } = hierarchy;

  // ── 4. Rework threshold ────────────────────────────────────────────

  const reworkThresholdStr = bail(
    await p.text({
      message: "Review round-trip threshold to classify as 'reworked'",
      placeholder: "3",
      defaultValue: "3",
      validate: (v) => {
        if (!v.trim()) return;
        const n = parseInt(v.trim(), 10);
        if (isNaN(n) || n < 1) return "Must be a positive number";
      },
    })
  );

  // ── 5. Post-merge revert window ────────────────────────────────────

  const postMergeWindowStr = bail(
    await p.text({
      message: "Hours after merge to search for revert PRs",
      placeholder: "72",
      defaultValue: "72",
      validate: (v) => {
        if (!v.trim()) return;
        const n = parseInt(v.trim(), 10);
        if (isNaN(n) || n < 1) return "Must be a positive number";
      },
    })
  );

  // ── 6. Output options ──────────────────────────────────────────────

  const { format, outputDir, filename, totalRecords, delay, verbose, debug } =
    await promptOutputOptions({ searchUser });

  // ── Build options object ───────────────────────────────────────────

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
    reworkThreshold: reworkThresholdStr?.trim() || "3",
    postMergeWindowHours: postMergeWindowStr?.trim() || "72",
    verbose,
    debug,
    metaTags: [],
  };

  // ── Confirmation summary ───────────────────────────────────────────

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

  if (options.pullRequestNumber) {
    summaryLines.push(`  Pull Request       ${chalk.green("#" + options.pullRequestNumber)}`);
  }

  summaryLines.push(
    `  Rework threshold   ${chalk.green(options.reworkThreshold + " round-trips")}`,
    `  Post-merge window  ${chalk.green(options.postMergeWindowHours + " hours")}`,
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
      message: `Run revert/refactor rate analysis for ${chalk.bold(options.searchUser || options.org || options.repo)}?`,
    })
  );

  if (!confirmed) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  p.outro(`Starting analysis for ${chalk.bold(options.searchUser || options.org || options.repo)}`);

  // ── Execute ────────────────────────────────────────────────────────

  const validated = validateAndNormalize(options);
  const analyzer = new RevertRefactorRate(validated);
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
