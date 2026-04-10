#!/usr/bin/env node

/**
 * Interactive CLI for GitHub Component Usage Audit.
 *
 * Usage:
 *   node cli.mjs                   — interactive wizard (prompts for all options)
 *   node cli.mjs --componentName   — skip to non-interactive mode (delegates to bin/component_usage_audit.mjs)
 */

import * as p from "@clack/prompts";
import chalk from "chalk";
import { resolveGithubEnv } from "@internal/env-resolver";
import {
  bail,
  promptHierarchyScope,
  promptHierarchyCascade,
  promptOutputOptions,
} from "@internal/github-api-sdk-cli";
import { validateAndNormalize } from "./src/cli/defaults-and-validate.mjs";
import { ComponentUsageAudit } from "./src/services/component-usage-audit.mjs";

// ── Route Registry ───────────────────────────────────────────────────
// Each route: { value, label, hint, handler }
// Add new entries here to extend the router.

const routes = [
  {
    value: "audit",
    label: "Component Usage Audit",
    hint: "full audit with JSX extraction, star validation, and report",
    handler: runComponentUsageAudit,
  },
  {
    value: "list-repos",
    label: "List Repos Using Component",
    hint: "extract usage and/or references across repos",
    handler: runListRepos,
  },
];

// ── Shared Prompts ───────────────────────────────────────────────────

const SCOPE_CONFIG = { levels: { search: "hidden" } };

async function promptSharedInputs() {
  // ── GitHub API Base URL (prepopulated from env, user can overwrite) ─
  const baseUrl = bail(
    await p.text({
      message: "GitHub API base URL",
      initialValue: resolveGithubEnv().baseApiUrl,
      validate: (v) => {
        if (!v.trim()) return "GitHub API base URL is required";
        try {
          new URL(v.trim());
        } catch {
          return "Must be a valid URL";
        }
      },
    }),
  );

  const scope = await promptHierarchyScope(SCOPE_CONFIG);
  const { token, hierarchy } = await promptHierarchyCascade({
    scope,
    config: SCOPE_CONFIG,
  });

  const componentName = bail(
    await p.text({
      message: "React component name to search for",
      placeholder: "Accordion",
      validate: (v) => {
        if (!v.trim()) return "Component name is required";
      },
    }),
  );

  return { token, baseUrl: baseUrl.trim(), hierarchy, componentName: componentName.trim() };
}

// ── Route: Component Usage Audit ─────────────────────────────────────

async function runComponentUsageAudit() {
  const { token, baseUrl, hierarchy, componentName } = await promptSharedInputs();
  const {
    searchUser, org, repo, start, end,
    ignoreDateRange, commitSearch, pullRequestNumber,
  } = hierarchy;

  // ── Minimum Stars ───────────────────────────────────────────────

  const minStarsStr = bail(
    await p.text({
      message: "Minimum stargazers for repo validation",
      placeholder: "500",
      defaultValue: "500",
      validate: (v) => {
        if (!v.trim()) return;
        const n = parseInt(v.trim(), 10);
        if (isNaN(n) || n < 0) return "Must be a non-negative number";
      },
    }),
  );

  // ── Max Pages ───────────────────────────────────────────────────

  const maxPagesStr = bail(
    await p.text({
      message: "Max search result pages (1-10, 100 results/page)",
      placeholder: "10",
      defaultValue: "10",
      validate: (v) => {
        if (!v.trim()) return;
        const n = parseInt(v.trim(), 10);
        if (isNaN(n) || n < 1 || n > 10) return "Must be between 1 and 10";
      },
    }),
  );

  // ── Min File Size ───────────────────────────────────────────────

  const minFileSizeStr = bail(
    await p.text({
      message: "Minimum file size in bytes for search",
      placeholder: "1000",
      defaultValue: "1000",
      validate: (v) => {
        if (!v.trim()) return;
        const n = parseInt(v.trim(), 10);
        if (isNaN(n) || n < 0) return "Must be a non-negative number";
      },
    }),
  );

  // ── Output options ──────────────────────────────────────────────

  const { outputDir, filename, totalRecords, delay, verbose, debug } =
    await promptOutputOptions({ searchUser: searchUser || componentName });

  // ── Build options object ────────────────────────────────────────

  const options = {
    searchUser: searchUser || undefined,
    token,
    baseUrl,
    org: org || undefined,
    repo: repo || undefined,
    componentName,
    minStars: minStarsStr?.trim() || "500",
    maxPages: maxPagesStr?.trim() || "10",
    minFileSize: minFileSizeStr?.trim() || "1000",
    format: "json",
    outputDir,
    filename: filename || undefined,
    ignoreDateRange,
    start: start || undefined,
    end: end || undefined,
    commitSearch,
    pullRequestNumber,
    totalRecords,
    delay,
    verbose,
    debug,
    metaTags: [],
  };

  // ── Confirmation summary ────────────────────────────────────────

  p.log.step(chalk.bold("Configuration Summary"));

  const summaryLines = [
    `  Component          ${chalk.green(options.componentName)}`,
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
    `  Min stars          ${chalk.green(options.minStars)}`,
    `  Max pages          ${chalk.green(options.maxPages)}`,
    `  Min file size      ${chalk.green(options.minFileSize)} bytes`,
    `  Format             ${chalk.green("JSON")}`,
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

  const queryLabel = options.componentName;
  const confirmed = bail(
    await p.confirm({
      message: `Run component usage audit for ${chalk.bold(queryLabel)}?`,
    })
  );

  if (!confirmed) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  p.outro(`Starting audit for ${chalk.bold(queryLabel)}`);

  // ── Execute ─────────────────────────────────────────────────────

  const validated = validateAndNormalize(options);
  const audit = new ComponentUsageAudit(validated);
  await audit.run();
}

// ── Route: List Repos Using Component ────────────────────────────────

async function runListRepos() {
  const { token, baseUrl, hierarchy, componentName } = await promptSharedInputs();
  const {
    searchUser, org, repo, start, end,
    ignoreDateRange, commitSearch, pullRequestNumber,
  } = hierarchy;

  // ── Max Pages ───────────────────────────────────────────────────

  const maxPagesStr = bail(
    await p.text({
      message: "Max search result pages (1-10, 100 results/page)",
      placeholder: "10",
      defaultValue: "10",
      validate: (v) => {
        if (!v.trim()) return;
        const n = parseInt(v.trim(), 10);
        if (isNaN(n) || n < 1 || n > 10) return "Must be between 1 and 10";
      },
    }),
  );

  // ── Output options ──────────────────────────────────────────────

  const { outputDir, filename, totalRecords, delay, verbose, debug } =
    await promptOutputOptions({ searchUser: searchUser || componentName });

  // ── Build options (skip star/file-size validation) ──────────────

  const options = {
    searchUser: searchUser || undefined,
    token,
    baseUrl,
    org: org || undefined,
    repo: repo || undefined,
    componentName,
    minStars: "0",
    maxPages: maxPagesStr?.trim() || "10",
    minFileSize: "0",
    format: "json",
    outputDir,
    filename: filename || undefined,
    ignoreDateRange,
    start: start || undefined,
    end: end || undefined,
    commitSearch,
    pullRequestNumber,
    totalRecords,
    delay,
    verbose,
    debug,
    metaTags: ["list-repos"],
  };

  // ── Confirmation ────────────────────────────────────────────────

  p.log.step(chalk.bold("Configuration Summary"));

  const summaryLines = [
    `  Component          ${chalk.green(options.componentName)}`,
    `  Organization       ${chalk.green(options.org || "All")}`,
    `  Max pages          ${chalk.green(options.maxPages)}`,
    `  Output             ${chalk.green(options.outputDir)}`,
  ];

  console.log(summaryLines.join("\n"));

  const confirmed = bail(
    await p.confirm({
      message: `List repos using ${chalk.bold(componentName)}?`,
    })
  );

  if (!confirmed) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  p.outro(`Searching for repos using ${chalk.bold(componentName)}`);

  // ── Execute ─────────────────────────────────────────────────────

  const validated = validateAndNormalize(options);
  const audit = new ComponentUsageAudit(validated);
  await audit.run();
}

// ── Interactive Router ───────────────────────────────────────────────

async function runInteractive() {
  p.intro(chalk.cyan.bold("GitHub Component Analysis"));

  const route = bail(
    await p.select({
      message: "What would you like to do?",
      options: routes.map(({ value, label, hint }) => ({ value, label, hint })),
    }),
  );

  const selected = routes.find((r) => r.value === route);
  await selected.handler();
}

// ── Entry point ──────────────────────────────────────────────────────

if (import.meta.url === `file://${process.argv[1]}`) {
  // If --componentName is passed on argv, delegate to the non-interactive path
  if (process.argv.includes("--componentName")) {
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
