#!/usr/bin/env node

/**
 * Interactive CLI for CodeQL Code Scanning Remediation Tracker.
 *
 * Usage:
 *   node cli.mjs              — interactive wizard (prompts for all options)
 *   node cli.mjs --repo       — skip to non-interactive mode (delegates to bin/codescan_remediation_tracker.mjs)
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
import { CodescanRemediationTracker } from "./src/services/codescan-remediation-tracker.mjs";

dotenv.config();


// ── Route definitions ────────────────────────────────────────────────

const ROUTES = [
  {
    value: "full",
    label: "Full Remediation Report",
    hint: "All severities with velocity analysis",
  },
  {
    value: "severity",
    label: "Severity Focus",
    hint: "Filter to error-only or warning-only",
  },
  {
    value: "hotspot",
    label: "Hotspot Analysis",
    hint: "File heatmap focus, skip velocity",
  },
];

// ── Interactive Flow ─────────────────────────────────────────────────

async function runInteractive() {
  p.intro(chalk.cyan.bold("CodeQL Code Scanning Remediation Tracker"));

  // ── Route selection ───────────────────────────────────────────────

  const route = bail(
    await p.select({
      message: "Select analysis mode",
      options: ROUTES,
    })
  );

  // ── Hierarchy scope picker ────────────────────────────────────────

  const scopeConfig = {
    levels: {},
  };
  const scope = await promptHierarchyScope(scopeConfig);
  const { token, hierarchy } = await promptHierarchyCascade({ scope, config: scopeConfig });
  const { org, repo } = hierarchy;

  // ── Route-specific prompts ────────────────────────────────────────

  let severity;
  let includeFixed = true;
  let velocityWeeks = 12;
  let topFiles = 20;
  let topRules = 30;
  let skipVelocity = false;

  if (route === "full") {
    // Multi-select severities (optional — empty means all)
    const severitySelection = bail(
      await p.multiselect({
        message: "Severity levels to include (space to toggle, enter to confirm)",
        options: [
          { value: "error", label: "error" },
          { value: "warning", label: "warning" },
          { value: "note", label: "note" },
        ],
        required: false,
      })
    );
    severity = severitySelection.length > 0 ? severitySelection : undefined;

    const includeFixedVal = bail(
      await p.confirm({
        message: "Include fixed alerts in velocity analysis?",
        initialValue: true,
      })
    );
    includeFixed = includeFixedVal;

    const velocityWeeksRaw = bail(
      await p.text({
        message: "Velocity analysis window (weeks)",
        placeholder: "12",
        defaultValue: "12",
        validate: (v) => {
          const n = parseInt(v, 10);
          if (isNaN(n) || n < 1 || n > 52) return "Enter a number between 1 and 52";
        },
      })
    );
    velocityWeeks = parseInt(velocityWeeksRaw, 10);
  } else if (route === "severity") {
    const severityChoice = bail(
      await p.select({
        message: "Focus severity",
        options: [
          { value: ["error"], label: "error only" },
          { value: ["warning"], label: "warning only" },
          { value: ["error", "warning"], label: "error + warning" },
        ],
      })
    );
    severity = severityChoice;

    const includeFixedVal = bail(
      await p.confirm({
        message: "Include fixed alerts in velocity analysis?",
        initialValue: true,
      })
    );
    includeFixed = includeFixedVal;

    const velocityWeeksRaw = bail(
      await p.text({
        message: "Velocity analysis window (weeks)",
        placeholder: "12",
        defaultValue: "12",
        validate: (v) => {
          const n = parseInt(v, 10);
          if (isNaN(n) || n < 1 || n > 52) return "Enter a number between 1 and 52";
        },
      })
    );
    velocityWeeks = parseInt(velocityWeeksRaw, 10);
  } else if (route === "hotspot") {
    // Hotspot mode — file heatmap focus, skip velocity
    skipVelocity = true;
    includeFixed = false;

    const topFilesRaw = bail(
      await p.text({
        message: "Number of top hotspot files",
        placeholder: "20",
        defaultValue: "20",
        validate: (v) => {
          const n = parseInt(v, 10);
          if (isNaN(n) || n < 1 || n > 100) return "Enter a number between 1 and 100";
        },
      })
    );
    topFiles = parseInt(topFilesRaw, 10);

    const topRulesRaw = bail(
      await p.text({
        message: "Number of top rules",
        placeholder: "30",
        defaultValue: "30",
        validate: (v) => {
          const n = parseInt(v, 10);
          if (isNaN(n) || n < 1 || n > 100) return "Enter a number between 1 and 100";
        },
      })
    );
    topRules = parseInt(topRulesRaw, 10);
  }

  // ── Output options ────────────────────────────────────────────────

  const { format, outputDir, filename, totalRecords, delay, verbose, debug } =
    await promptOutputOptions({ searchUser: repo || org || "unknown" });

  // ── Build options object ──────────────────────────────────────────

  const options = {
    token,
    org: org || undefined,
    repo: repo || undefined,
    severity,
    toolName: "CodeQL",
    includeFixed,
    velocityWeeks: skipVelocity ? 12 : velocityWeeks,
    topFiles,
    topRules,
    format,
    outputDir,
    filename: filename || undefined,
    totalRecords,
    delay,
    verbose,
    debug,
    metaTags: [],
  };

  // ── Confirmation summary ──────────────────────────────────────────

  p.log.step(chalk.bold("Configuration Summary"));

  const summaryLines = [
    `  Mode               ${chalk.cyan(ROUTES.find((r) => r.value === route)?.label ?? route)}`,
    `  Repository         ${chalk.green(options.repo || "N/A")}`,
    `  Severity           ${chalk.green(options.severity?.join(", ") || "all")}`,
    `  Include fixed      ${chalk.green(options.includeFixed ? "Yes" : "No")}`,
    `  Velocity weeks     ${chalk.green(options.velocityWeeks)}`,
    `  Top files          ${chalk.green(options.topFiles)}`,
    `  Top rules          ${chalk.green(options.topRules)}`,
    `  Format             ${chalk.green(options.format.toUpperCase())}`,
    `  Output             ${chalk.green(options.outputDir)}`,
    `  API delay          ${chalk.green(options.delay + "s")}`,
    `  Verbose            ${options.verbose ? chalk.green("Yes") : chalk.gray("No")}`,
    `  Debug              ${options.debug ? chalk.green("Yes") : chalk.gray("No")}`,
  ];

  console.log(summaryLines.join("\n"));

  const confirmed = bail(
    await p.confirm({
      message: `Run codescan remediation analysis for ${chalk.bold(options.repo || options.org || "repository")}?`,
    })
  );

  if (!confirmed) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  p.outro(`Starting analysis for ${chalk.bold(options.repo || options.org || "repository")}`);

  // ── Execute ───────────────────────────────────────────────────────

  const validated = validateAndNormalize(options);
  const tracker = new CodescanRemediationTracker(validated);
  await tracker.run();
}

// ── Entry point ─────────────────────────────────────────────────────

if (import.meta.url === `file://${process.argv[1]}`) {
  // If --repo is passed on argv, delegate to the non-interactive path
  if (process.argv.includes("--repo")) {
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
