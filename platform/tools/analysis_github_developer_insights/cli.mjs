#!/usr/bin/env node

/**
 * Interactive CLI for developer_insights.
 *
 * Usage:
 *   node cli.mjs              — interactive wizard (prompts for all options)
 *   node cli.mjs --searchUser — skip to non-interactive mode (delegates to bin/developer_insights.mjs)
 */

import * as p from "@clack/prompts";
import chalk from "chalk";
import dotenv from "dotenv";
import {
  bail,
  promptHierarchyScope,
  promptHierarchyCascade,
} from "@internal/github-api-sdk-cli";
import { validateAndNormalize } from "./src/cli/defaults-and-validate.mjs";
import { DeveloperInsights } from "./src/services/developer-insights.mjs";

dotenv.config();


// ── Interactive Flow ─────────────────────────────────────────────────

async function runInteractive() {
  p.intro(chalk.cyan.bold("Developer Insights Analyzer"));

  // ── Hierarchy scope picker ────────────────────────────────────────

  const scopeConfig = {
    levels: {},
  };
  const scope = await promptHierarchyScope(scopeConfig);
  const { token, hierarchy } = await promptHierarchyCascade({ scope, config: scopeConfig });
  const { searchUser, org, repo, start, end, ignoreDateRange, commitSearch, pullRequestNumber } = hierarchy;

  // ── 6. Output format (tool-specific: includes html and database) ───

  const format = bail(
    await p.select({
      message: "Output format",
      options: [
        {
          value: "json",
          label: "JSON",
          hint: "structured report with analytics",
        },
        { value: "csv", label: "CSV", hint: "flat table format" },
        { value: "html", label: "HTML", hint: "styled dashboard" },
        {
          value: "database",
          label: "Database",
          hint: "SQLite/Postgres via Sequelize",
        },
      ],
    })
  );

  // ── 6b. Database URL (if database format) ──────────────────────────

  let databaseUrl;
  if (format === "database") {
    databaseUrl = bail(
      await p.text({
        message: "Database URL",
        placeholder: "sqlite:./reports.db or postgres://...",
        validate: (v) => {
          if (!v.trim()) return "Database URL is required for database format";
        },
      })
    );
  }

  // ── 7. Output directory ────────────────────────────────────────────

  const outputDir = bail(
    await p.text({
      message: "Output directory",
      placeholder: "./output",
      defaultValue: "./output",
    })
  );

  // ── 8. Filename (optional) ─────────────────────────────────────────

  const filename = bail(
    await p.text({
      message: "Output filename (leave empty for default)",
      placeholder: `developer-insights-${searchUser.trim()}`,
    })
  );

  // ── 9. Record limit ────────────────────────────────────────────────

  const totalRecordsStr = bail(
    await p.text({
      message: "Max records to fetch (0 = no limit)",
      placeholder: "0",
      defaultValue: "0",
      validate: (v) => {
        if (!v.trim()) return;
        const n = parseInt(v.trim(), 10);
        if (isNaN(n) || n < 0) return "Must be a non-negative number";
      },
    })
  );

  // ── 10. API delay ─────────────────────────────────────────────────

  const delayStr = bail(
    await p.text({
      message: "Delay between API requests in seconds",
      placeholder: "6",
      defaultValue: "6",
      validate: (v) => {
        if (!v.trim()) return;
        const n = parseInt(v.trim(), 10);
        if (isNaN(n) || n < 0) return "Must be a non-negative number";
      },
    })
  );

  // ── 11. Analysis modules ───────────────────────────────────────────

  const modules = bail(
    await p.multiselect({
      message: "Analysis modules to run",
      options: [
        { value: "prThroughput", label: "PR Throughput", hint: "velocity, merge rates" },
        { value: "codeChurn", label: "Code Churn", hint: "additions, deletions" },
        { value: "workPatterns", label: "Work Patterns", hint: "timing analysis" },
        { value: "prCycleTime", label: "PR Cycle Time", hint: "creation to merge" },
      ],
      initialValues: ["prThroughput", "codeChurn", "workPatterns", "prCycleTime"],
      required: false,
    })
  );

  // ── 12. Additional options ─────────────────────────────────────────

  const extras = bail(
    await p.multiselect({
      message: "Additional options",
      options: [
        { value: "verbose", label: "Verbose logging" },
        { value: "debug", label: "Debug mode", hint: "writes github.log + audit" },
      ],
      initialValues: [],
      required: false,
    })
  );

  // ── Build options object ───────────────────────────────────────────

  const options = {
    searchUser: searchUser || undefined,
    token,
    org: org || undefined,
    repo: repo || undefined,
    format,
    outputDir: outputDir?.trim() || "./output",
    filename: filename?.trim() || undefined,
    ignoreDateRange,
    start: start || undefined,
    end: end || undefined,
    commitSearch,
    pullRequestNumber,
    totalRecords: totalRecordsStr?.trim() || "0",
    delay: delayStr?.trim() || "6",
    modules: modules.join(","),
    verbose: extras.includes("verbose"),
    debug: extras.includes("debug"),
    metaTags: [],
    databaseUrl: databaseUrl?.trim() || undefined,
  };

  // ── Confirmation summary ───────────────────────────────────────────

  p.log.step(chalk.bold("Configuration Summary"));

  const summaryLines = [
    `  Username       ${chalk.green(options.searchUser || "N/A")}`,
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
    `  Modules        ${chalk.green(options.modules)}`,
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

  const queryLabel = options.searchUser || options.org || options.repo;
  const confirmed = bail(
    await p.confirm({
      message: `Run analysis for ${chalk.bold(queryLabel)}?`,
    })
  );

  if (!confirmed) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  p.outro(`Starting analysis for ${chalk.bold(queryLabel)}`);

  // ── Execute ────────────────────────────────────────────────────────

  const validated = validateAndNormalize(options);
  const analyzer = new DeveloperInsights(validated);
  await analyzer.run();
}

// ── Entry point ──────────────────────────────────────────────────────

if (import.meta.url === `file://${process.argv[1]}`) {
  // If --searchUser, --org, or --repo is passed on argv, delegate to non-interactive
  if (
    process.argv.includes("--searchUser") ||
    process.argv.includes("--org") ||
    process.argv.includes("--repo")
  ) {
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
