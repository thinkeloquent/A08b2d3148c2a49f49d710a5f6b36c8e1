#!/usr/bin/env node

/**
 * Interactive CLI for GitHub Security Alert Resolver.
 *
 * Usage:
 *   node cli.mjs              — interactive wizard (prompts for all options)
 *   node cli.mjs --repo       — skip to non-interactive mode (delegates to bin/security_alert_resolver.mjs)
 *
 * Interactive routes:
 *   1. Dry Run — Check Resolutions     — preview what would be closed (default)
 *   2. Auto-Close Resolved Alerts      — actually close resolved alerts via GitHub API
 *   3. Code Scanning Only              — check only code scanning alerts
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
import { SecurityAlertResolver } from "./src/services/security-alert-resolver.mjs";

dotenv.config();


// ── Route definitions ────────────────────────────────────────────────────────

const ROUTES = [
  {
    value: "dry-run",
    label: "Dry Run — Check Resolutions",
    hint: "Preview which alerts are resolved without writing to GitHub API",
    alertTypes: ["code-scanning", "secret-scanning", "dependabot"],
    dryRun: true,
    autoClose: false,
  },
  {
    value: "auto-close",
    label: "Auto-Close Resolved Alerts",
    hint: "Check resolutions and close resolved alerts via GitHub PATCH API",
    alertTypes: ["code-scanning", "secret-scanning", "dependabot"],
    dryRun: false,
    autoClose: true,
  },
  {
    value: "code-scanning-only",
    label: "Code Scanning Only",
    hint: "Check only CodeQL and SAST tool findings against the default branch",
    alertTypes: ["code-scanning"],
    dryRun: true,
    autoClose: false,
  },
];


// ── Interactive Flow ─────────────────────────────────────────────────────────

async function runInteractive() {
  p.intro(chalk.cyan.bold("GitHub Security Alert Resolver"));

  // ── Route selection ───────────────────────────────────────────────────────

  const routeValue = bail(
    await p.select({
      message: "Select resolver mode",
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

  // ── Alert types (only for dry-run route, auto-close uses all) ─────────────

  let alertTypes = route.alertTypes;

  if (route.value === "dry-run") {
    const selectedTypes = bail(
      await p.multiselect({
        message: "Select alert types to check",
        options: [
          {
            value: "code-scanning",
            label: "Code Scanning",
            hint: "CodeQL and SAST findings",
          },
          {
            value: "secret-scanning",
            label: "Secret Scanning",
            hint: "Exposed credentials and tokens",
          },
          {
            value: "dependabot",
            label: "Dependabot",
            hint: "Vulnerable dependency alerts",
          },
        ],
        initialValues: ["code-scanning", "secret-scanning", "dependabot"],
        required: true,
      })
    );
    alertTypes = selectedTypes;
  }

  // ── Branch override (optional) ────────────────────────────────────────────

  const refInput = bail(
    await p.text({
      message: "Branch to check against (leave blank to auto-detect default branch)",
      placeholder: "e.g., main",
    })
  );
  const ref = refInput?.trim() || undefined;

  // ── Dismiss reason (for auto-close route) ─────────────────────────────────

  let dismissReason = "false positive";
  let dismissComment =
    "Auto-resolved: alert no longer present on default branch";

  if (route.autoClose) {
    const reasonInput = bail(
      await p.text({
        message: "Dismiss reason for closed alerts",
        placeholder: "false positive",
        defaultValue: "false positive",
      })
    );
    dismissReason = reasonInput?.trim() || "false positive";

    const commentInput = bail(
      await p.text({
        message: "Dismiss comment",
        placeholder: "Auto-resolved: alert no longer present on default branch",
        defaultValue:
          "Auto-resolved: alert no longer present on default branch",
      })
    );
    dismissComment =
      commentInput?.trim() ||
      "Auto-resolved: alert no longer present on default branch";
  }

  // ── Output options ────────────────────────────────────────────────────────

  const { format, outputDir, filename, totalRecords, delay, verbose, debug } =
    await promptOutputOptions({ searchUser: repo || org || "unknown" });

  // ── Build options object ──────────────────────────────────────────────────

  const options = {
    token,
    org: org || undefined,
    repo: repo || undefined,
    alertTypes,
    dryRun: route.dryRun,
    autoClose: route.autoClose,
    dismissReason,
    dismissComment,
    ref: ref || undefined,
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
    `  Mode               ${chalk.green(route.label)}`,
    `  Repository         ${chalk.green(options.repo || "N/A")}`,
    `  Alert types        ${chalk.green(options.alertTypes.join(", "))}`,
    `  Dry run            ${options.dryRun ? chalk.yellow("Yes (no API writes)") : chalk.green("No")}`,
    `  Auto close         ${options.autoClose ? chalk.yellow("Yes") : "No"}`,
    `  Branch             ${chalk.green(options.ref || "auto-detect")}`,
  ];

  if (options.autoClose) {
    summaryLines.push(
      `  Dismiss reason     ${chalk.green(options.dismissReason)}`,
      `  Dismiss comment    ${chalk.green(options.dismissComment)}`
    );
  }

  summaryLines.push(
    `  Format             ${chalk.green(options.format.toUpperCase())}`,
    `  Output             ${chalk.green(options.outputDir)}`,
    `  Verbose            ${options.verbose ? chalk.green("Yes") : chalk.gray("No")}`,
    `  Debug              ${options.debug ? chalk.green("Yes") : chalk.gray("No")}`
  );

  console.log(summaryLines.join("\n"));

  // ── Auto-close safety confirmation ────────────────────────────────────────

  if (route.autoClose) {
    const autoCloseConfirmed = bail(
      await p.confirm({
        message: chalk.yellow(
          "This will close resolved alerts via the GitHub API. Are you sure you want to continue?"
        ),
        initialValue: false,
      })
    );

    if (!autoCloseConfirmed) {
      p.cancel("Cancelled.");
      process.exit(0);
    }
  }

  // ── Final confirmation ────────────────────────────────────────────────────

  const confirmed = bail(
    await p.confirm({
      message: `Run resolver for ${chalk.bold(options.repo || options.org || "repository")}?`,
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
  const resolver = new SecurityAlertResolver(validated);
  await resolver.run();
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
