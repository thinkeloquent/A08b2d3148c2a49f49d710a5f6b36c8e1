#!/usr/bin/env node

/**
 * Interactive CLI for github_user_status.
 *
 * Usage:
 *   node cli.mjs              -- interactive wizard (prompts for all options)
 *   node cli.mjs --searchUser -- skip to non-interactive mode (delegates to bin/github_user_status.mjs)
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
import { GitHubUserStatus } from "./src/services/github-user-status.mjs";

dotenv.config();


// -- Interactive Flow ---------------------------------------------------------

async function runInteractive() {
  p.intro(chalk.cyan.bold("GitHub User Status Checker"));

  // -- Hierarchy scope picker -------------------------------------------------

  const scopeConfig = {
    levels: {},
  };
  const scope = await promptHierarchyScope(scopeConfig);
  const { token, hierarchy } = await promptHierarchyCascade({ scope, config: scopeConfig });
  const { searchUser, commitSearch, pullRequestNumber } = hierarchy;
  const dataSource = {
    start: hierarchy.start,
    end: hierarchy.end,
    ignoreDateRange: hierarchy.ignoreDateRange,
  };

  // -- 4. Output options ------------------------------------------------------

  const outputOptions = await promptOutputOptions({
    searchUser: searchUser.trim(),
  });

  // -- Build options object ---------------------------------------------------

  const options = {
    searchUser: searchUser.trim(),
    token,
    format: outputOptions.format,
    outputDir: outputOptions.outputDir,
    filename: outputOptions.filename || undefined,
    ignoreDateRange: dataSource.ignoreDateRange,
    start: dataSource.start,
    end: dataSource.end,
    commitSearch,
    pullRequestNumber,
    totalRecords: outputOptions.totalRecords,
    delay: outputOptions.delay,
    verbose: outputOptions.verbose,
    debug: outputOptions.debug,
    metaTags: [],
  };

  // -- Confirmation summary ---------------------------------------------------

  p.log.step(chalk.bold("Configuration Summary"));

  const usernames = options.searchUser.split(",").map((u) => u.trim()).filter(Boolean);
  const summaryLines = [
    `  Users          ${chalk.green(usernames.join(", "))}`,
    `  User count     ${chalk.green(usernames.length)}`,
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
      message: `Check status for ${chalk.bold(usernames.length)} user(s)?`,
    })
  );

  if (!confirmed) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  p.outro(`Starting user status check for ${chalk.bold(usernames.length)} user(s)`);

  // -- Execute ----------------------------------------------------------------

  const validated = validateAndNormalize(options);
  const analyzer = new GitHubUserStatus(validated);
  await analyzer.run();
}

// -- Entry point --------------------------------------------------------------

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
