#!/usr/bin/env node

/**
 * Interactive CLI for GitHub Security Alert Triage.
 *
 * Usage:
 *   node cli.mjs              — interactive wizard (prompts for all options)
 *   node cli.mjs --repo       — skip to non-interactive mode (delegates to bin/security_alert_triage.mjs)
 *
 * Interactive routes:
 *   1. Full Security Triage     — all 3 alert types
 *   2. Code Scanning Only       — code-scanning alerts only
 *   3. Secret Scanning Only     — secret-scanning alerts only
 *   4. Dependabot Only          — dependabot alerts only
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
import { SecurityAlertTriage } from "./src/services/security-alert-triage.mjs";

dotenv.config();


// ── Route definitions ────────────────────────────────────────────────────────

const ROUTES = [
  {
    value: "full",
    label: "Full Security Triage",
    hint: "Fetch all 3 alert types: code scanning, secret scanning, Dependabot",
    alertTypes: ["code-scanning", "secret-scanning", "dependabot"],
  },
  {
    value: "code-scanning",
    label: "Code Scanning Only",
    hint: "CodeQL and other SAST tool findings",
    alertTypes: ["code-scanning"],
  },
  {
    value: "secret-scanning",
    label: "Secret Scanning Only",
    hint: "Exposed credentials and tokens",
    alertTypes: ["secret-scanning"],
  },
  {
    value: "dependabot",
    label: "Dependabot Only",
    hint: "Vulnerable dependency alerts",
    alertTypes: ["dependabot"],
  },
];


// ── Interactive Flow ─────────────────────────────────────────────────────────

async function runInteractive() {
  p.intro(chalk.cyan.bold("GitHub Security Alert Triage"));

  // ── Route selection ───────────────────────────────────────────────────────

  const routeValue = bail(
    await p.select({
      message: "Select triage scope",
      options: ROUTES.map((r) => ({
        value: r.value,
        label: r.label,
        hint: r.hint,
      })),
    })
  );

  const route = ROUTES.find((r) => r.value === routeValue);

  // ── Hierarchy scope picker ────────────────────────────────────────────────

  const scopeConfig = { levels: {} };
  const scope = await promptHierarchyScope(scopeConfig);
  const { token, hierarchy } = await promptHierarchyCascade({ scope, config: scopeConfig });
  const { org, repo } = hierarchy;

  // ── Alert state ───────────────────────────────────────────────────────────

  const alertState = bail(
    await p.select({
      message: "Alert state to fetch",
      options: [
        { value: "open", label: "Open", hint: "Active unresolved alerts" },
        { value: "dismissed", label: "Dismissed", hint: "Manually dismissed alerts" },
        { value: "all", label: "All", hint: "Open + dismissed" },
      ],
      initialValue: "open",
    })
  );

  // ── Min severity (optional) ───────────────────────────────────────────────

  const minSeverity = bail(
    await p.select({
      message: "Minimum severity to include",
      options: [
        { value: "", label: "All severities", hint: "Include low, medium, high, critical" },
        { value: "critical", label: "Critical only" },
        { value: "error", label: "Error / High and above" },
        { value: "warning", label: "Warning / Medium and above" },
        { value: "note", label: "Note / Low and above (same as all)" },
      ],
      initialValue: "",
    })
  );

  // ── Tool name filter (code-scanning only) ─────────────────────────────────

  let toolName;
  if (route.alertTypes.includes("code-scanning")) {
    const toolNameInput = bail(
      await p.text({
        message: "Filter code-scanning by tool name (leave blank for all)",
        placeholder: "e.g., CodeQL",
      })
    );
    toolName = toolNameInput?.trim() || undefined;
  }

  // ── Output options ────────────────────────────────────────────────────────

  const { format, outputDir, filename, totalRecords, delay, verbose, debug } =
    await promptOutputOptions({ searchUser: repo || org || "unknown" });

  // ── Build options object ──────────────────────────────────────────────────

  const options = {
    token,
    org: org || undefined,
    repo: repo || undefined,
    alertTypes: route.alertTypes,
    alertState,
    minSeverity: minSeverity || undefined,
    toolName: toolName || undefined,
    format,
    outputDir,
    filename: filename || undefined,
    totalRecords,
    delay,
    verbose,
    debug,
    metaTags: [],
  };

  // ── Confirmation summary ──────────────────────────────────────────────────

  p.log.step(chalk.bold("Configuration Summary"));

  const summaryLines = [
    `  Triage scope       ${chalk.green(route.label)}`,
    `  Repository         ${chalk.green(options.repo || "N/A")}`,
    `  Alert types        ${chalk.green(options.alertTypes.join(", "))}`,
    `  Alert state        ${chalk.green(options.alertState)}`,
    `  Min severity       ${chalk.green(options.minSeverity || "All")}`,
  ];

  if (options.toolName) {
    summaryLines.push(`  Tool filter        ${chalk.green(options.toolName)}`);
  }

  summaryLines.push(
    `  Format             ${chalk.green(options.format.toUpperCase())}`,
    `  Output             ${chalk.green(options.outputDir)}`,
    `  Verbose            ${options.verbose ? chalk.green("Yes") : chalk.gray("No")}`,
    `  Debug              ${options.debug ? chalk.green("Yes") : chalk.gray("No")}`
  );

  console.log(summaryLines.join("\n"));

  const confirmed = bail(
    await p.confirm({
      message: `Run security triage for ${chalk.bold(options.repo || options.org || "repository")}?`,
    })
  );

  if (!confirmed) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  p.outro(
    `Starting ${chalk.bold(route.label)} for ${chalk.bold(options.repo || options.org || "repository")}`
  );

  // ── Execute ───────────────────────────────────────────────────────────────

  const validated = validateAndNormalize(options);
  const analyzer = new SecurityAlertTriage(validated);
  await analyzer.run();
}


// ── Entry point ──────────────────────────────────────────────────────────────

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
