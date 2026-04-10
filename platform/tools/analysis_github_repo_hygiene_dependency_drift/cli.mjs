#!/usr/bin/env node

/**
 * Interactive CLI for Dependency Drift analysis.
 *
 * Usage:
 *   node cli.mjs              — interactive wizard (prompts for all options)
 *   node cli.mjs --searchUser — skip to non-interactive mode (delegates to bin/dependency_drift.mjs)
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
import { DependencyDrift } from "./src/services/dependency-drift.mjs";

dotenv.config();


// ── Interactive Flow ─────────────────────────────────────────────────

async function runInteractive() {
  p.intro(chalk.cyan.bold("Dependency Drift Analyzer"));

  // ── Hierarchy scope picker ────────────────────────────────────────

  const scopeConfig = {
    levels: {},
  };
  const scope = await promptHierarchyScope(scopeConfig);
  const { token, hierarchy } = await promptHierarchyCascade({ scope, config: scopeConfig });
  const { searchUser, org, repo, branch, start, end, ignoreDateRange, currentFiles, commitSearch, pullRequestNumber } = hierarchy;

  // ── Tool-specific prompts ──────────────────────────────────────────

  const ecosystems = bail(
    await p.multiselect({
      message: "Which dependency ecosystems to check?",
      options: [
        { value: "npm", label: "npm", hint: "package.json" },
        { value: "pypi", label: "PyPI", hint: "requirements.txt, pyproject.toml" },
        { value: "maven", label: "Maven / Gradle", hint: "pom.xml, build.gradle" },
        { value: "go", label: "Go", hint: "go.mod" },
        { value: "rubygems", label: "RubyGems", hint: "Gemfile" },
        { value: "cargo", label: "Cargo", hint: "Cargo.toml" },
        { value: "nuget", label: "NuGet", hint: "packages.config, Directory.Packages.props" },
        { value: "composer", label: "Composer", hint: "composer.json" },
      ],
      initialValues: ["npm", "pypi"],
      required: true,
    })
  );

  // ── Common output prompts from SDK ─────────────────────────────────

  const { format, outputDir, filename, totalRecords, delay, verbose, debug } =
    await promptOutputOptions({ searchUser });

  // ── Build options object ───────────────────────────────────────────

  const options = {
    searchUser: searchUser || undefined,
    token,
    org: org || undefined,
    repo: repo || undefined,
    branch: branch || undefined,
    ecosystems: ecosystems.join(","),
    format,
    outputDir: outputDir || "./output",
    filename: filename || undefined,
    ignoreDateRange,
    currentFiles,
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
    `  Username       ${chalk.green(options.searchUser || "N/A")}`,
    `  Organization   ${chalk.green(options.org || "All")}`,
    `  Repositories   ${chalk.green(options.repo || "All")}`,
    `  Branch         ${chalk.green(options.branch || "Default")}`,
    `  Ecosystems     ${chalk.green(options.ecosystems)}`,
  ];

  if (options.currentFiles) {
    summaryLines.push(`  Data source    ${chalk.yellow("Current files in branch")}`);
  } else if (options.ignoreDateRange) {
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

  const queryLabel = options.searchUser || options.org || options.repo;
  const confirmed = bail(
    await p.confirm({
      message: `Run dependency drift analysis for ${chalk.bold(queryLabel)}?`,
    })
  );

  if (!confirmed) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  p.outro(`Starting analysis for ${chalk.bold(queryLabel)}`);

  // ── Execute ────────────────────────────────────────────────────────

  const validated = validateAndNormalize(options);
  const analyzer = new DependencyDrift(validated);
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
