#!/usr/bin/env node

/**
 * Interactive CLI for GitHub Component Usage Audit.
 *
 * Usage:
 *   node cli.mjs                   — interactive wizard (prompts for all options)
 *   node cli.mjs --componentName   — skip to non-interactive mode
 */

import * as p from "@clack/prompts";
import chalk from "chalk";
import dotenv from "dotenv";
import { resolveGithubEnv } from "@internal/env-resolver";
import {
  bail,
  promptToken,
  promptOutputOptions,
} from "@internal/github-api-sdk-cli";
import { validateAndNormalize } from "./src/cli/defaults-and-validate.mjs";
import { ComponentUsageAudit } from "./src/services/ComponentUsageAudit.mjs";

dotenv.config();

// ── Interactive Flow ─────────────────────────────────────────────────

async function runInteractive() {
  p.intro(chalk.cyan.bold("GitHub Component Usage Audit"));

  // ── 1. GitHub Token ──────────────────────────────────────────────
  const token = await promptToken();

  // ── 2. Component Name ────────────────────────────────────────────
  const componentName = bail(
    await p.text({
      message: "React component name to search for",
      placeholder: "Accordion",
      validate: (v) => {
        if (!v.trim()) return "Component name is required";
      },
    }),
  );

  // ── 3. Minimum Stars ────────────────────────────────────────────
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

  // ── 4. Max Pages ─────────────────────────────────────────────────
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

  // ── 5. Min File Size ─────────────────────────────────────────────
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

  // ── 6. Output options ────────────────────────────────────────────
  const outputOpts = await promptOutputOptions({ searchUser: componentName });

  // ── 7. Additional options ────────────────────────────────────────
  const extras = bail(
    await p.multiselect({
      message: "Additional options",
      options: [
        { value: "verbose", label: "Verbose logging" },
        { value: "debug", label: "Debug mode", hint: "writes audit log" },
      ],
      initialValues: [],
      required: false,
    }),
  );

  // ── Build options object ─────────────────────────────────────────

  const options = {
    token,
    componentName: componentName.trim(),
    minStars: minStarsStr?.trim() || "500",
    maxPages: maxPagesStr?.trim() || "10",
    minFileSize: minFileSizeStr?.trim() || "1000",
    format: "json",
    outputDir: outputOpts.outputDir?.trim() || "./output",
    filename: outputOpts.filename?.trim() || undefined,
    totalRecords: outputOpts.totalRecords || "0",
    delay: outputOpts.delay || "6",
    verbose: extras.includes("verbose"),
    debug: extras.includes("debug"),
    metaTags: [],
    // Sentinel for BaseConfigSchema refine
    searchUser: "_github_sdk_api_audit_",
  };

  // ── Confirmation summary ─────────────────────────────────────────

  p.log.step(chalk.bold("Configuration Summary"));

  const summaryLines = [
    `  Component      ${chalk.green(options.componentName)}`,
    `  Min stars      ${chalk.green(options.minStars)}`,
    `  Max pages      ${chalk.green(options.maxPages)}`,
    `  Min file size  ${chalk.green(options.minFileSize)} bytes`,
    `  Format         ${chalk.green("JSON")}`,
    `  Output         ${chalk.green(options.outputDir)}`,
    `  Verbose        ${options.verbose ? chalk.green("Yes") : chalk.gray("No")}`,
    `  Debug          ${options.debug ? chalk.green("Yes") : chalk.gray("No")}`,
  ];

  console.log(summaryLines.join("\n"));

  const confirmed = bail(
    await p.confirm({
      message: `Run audit for ${chalk.bold(options.componentName)}?`,
    }),
  );

  if (!confirmed) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  p.outro(`Starting audit for ${chalk.bold(options.componentName)}`);

  // ── Execute ──────────────────────────────────────────────────────

  const validated = validateAndNormalize(options);
  const audit = new ComponentUsageAudit(validated);
  await audit.run();
}

// ── Entry point ──────────────────────────────────────────────────────

if (import.meta.url === `file://${process.argv[1]}`) {
  // If --componentName is passed on argv, delegate to non-interactive
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
