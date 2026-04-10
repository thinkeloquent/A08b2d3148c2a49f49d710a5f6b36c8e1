#!/usr/bin/env node

/**
 * Interactive CLI for Context Switching analysis.
 *
 * Usage:
 *   node cli.mjs              — interactive wizard (prompts for all options)
 *   node cli.mjs --searchUser — skip to non-interactive mode (delegates to bin/context_switching.mjs)
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
import { ContextSwitching } from "./src/services/context-switching.mjs";

dotenv.config();


// ── Interactive Flow ─────────────────────────────────────────────────

async function runInteractive() {
  p.intro(chalk.cyan.bold("Context Switching Analyzer"));

  // ── Hierarchy scope picker ────────────────────────────────────────

  const scopeConfig = {
    levels: {},
  };
  const scope = await promptHierarchyScope(scopeConfig);
  const { token, hierarchy } = await promptHierarchyCascade({ scope, config: scopeConfig });
  const { searchUser, org, repo, start, end, ignoreDateRange, commitSearch, pullRequestNumber } = hierarchy;

  // ── 4. Activity types to include ───────────────────────────────────

  const activityTypes = bail(
    await p.multiselect({
      message: "Activity types to include in timeline",
      options: [
        { value: "commits", label: "Commits", hint: "per-repo commit history" },
        { value: "prs", label: "Pull Requests", hint: "open/merge/close events" },
        { value: "reviews", label: "Reviews", hint: "code reviews submitted" },
      ],
      initialValues: ["commits", "prs", "reviews"],
      required: true,
    })
  );

  // ── 5. Session gap ─────────────────────────────────────────────────

  const minSessionGapStr = bail(
    await p.text({
      message: "Minimum gap (minutes) between activities to start a new focus session",
      placeholder: "30",
      defaultValue: "30",
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
    searchUser,
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
    includeCommits: activityTypes.includes("commits"),
    includePRs: activityTypes.includes("prs"),
    includeReviews: activityTypes.includes("reviews"),
    minSessionGapMinutes: minSessionGapStr?.trim() || "30",
    verbose,
    debug,
    metaTags: [],
  };

  // ── Confirmation summary ───────────────────────────────────────────

  p.log.step(chalk.bold("Configuration Summary"));

  const summaryLines = [
    `  Username         ${chalk.green(options.searchUser)}`,
    `  Organization     ${chalk.green(options.org || "All")}`,
    `  Repositories     ${chalk.green(options.repo || "All")}`,
  ];

  if (options.ignoreDateRange) {
    summaryLines.push(`  Date range       ${chalk.yellow("All time")}`);
  } else if (options.start && options.end) {
    summaryLines.push(
      `  Date range       ${chalk.green(options.start)} to ${chalk.green(options.end)}`
    );
  } else {
    summaryLines.push(
      `  Date range       ${chalk.green("Last 30 days")}`
    );
  }

  if (options.pullRequestNumber) {
    summaryLines.push(`  Pull Request     ${chalk.green("#" + options.pullRequestNumber)}`);
  }

  summaryLines.push(
    `  Activity types   ${chalk.green(
      [
        options.includeCommits ? "Commits" : null,
        options.includePRs ? "PRs" : null,
        options.includeReviews ? "Reviews" : null,
      ]
        .filter(Boolean)
        .join(", ")
    )}`,
    `  Session gap      ${chalk.green(options.minSessionGapMinutes + " min")}`,
    `  Format           ${chalk.green(options.format.toUpperCase())}`,
    `  Output           ${chalk.green(options.outputDir)}`,
    `  Record limit     ${
      parseInt(options.totalRecords, 10) > 0
        ? chalk.green(options.totalRecords)
        : chalk.yellow("No limit")
    }`,
    `  API delay        ${chalk.green(options.delay + "s")}`,
    `  Verbose          ${options.verbose ? chalk.green("Yes") : chalk.gray("No")}`,
    `  Debug            ${options.debug ? chalk.green("Yes") : chalk.gray("No")}`
  );

  console.log(summaryLines.join("\n"));

  const confirmed = bail(
    await p.confirm({
      message: `Run context switching analysis for ${chalk.bold(options.searchUser)}?`,
    })
  );

  if (!confirmed) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  p.outro(`Starting analysis for ${chalk.bold(options.searchUser)}`);

  // ── Execute ────────────────────────────────────────────────────────

  const validated = validateAndNormalize(options);
  const analyzer = new ContextSwitching(validated);
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
