import chalk from "chalk";
import path from "path";
import { normalizeConfig } from "../config/normalize.mjs";
import {
  createGitHubClient,
  createLogger,
  createDebugLogger,
  ensureDir,
  writeAuditReport,
  StreamWriter,
} from "@internal/github-api-sdk-cli";
import { fetchSecretScanningAlerts } from "../github/endpoints/secret-scanning-alerts.mjs";
import { fetchSecretScanningLocations } from "../github/endpoints/secret-scanning-locations.mjs";
import {
  fetchDefaultBranch,
  resolveSecretScanningAlert,
} from "../github/endpoints/alert-dismiss.mjs";
import { loadHandler } from "../handler/handler-loader.mjs";
import { createHandlerContext } from "../handler/handler-context.mjs";
import { buildReport } from "../reporting/report-builder.mjs";
import { writeJsonReport } from "../reporting/writers/json-writer.mjs";

export class SecretScanningService {
  constructor(options) {
    this.config = normalizeConfig(options);

    // Mutable state
    this.alertsWithLocations = [];
    this.handlerResults = new Map(); // alertNumber → [{ action, message, path }]
    this.resolveResults = [];
    this.errors = [];
    this.apiCalls = [];
    this.totalFetched = { value: 0 };
    this.cancelled = { value: false };
    this.cache = new Map();

    // Logger
    const { log, output } = createLogger(this.config);
    const { debugLog } = createDebugLogger(this.config);
    this.log = log;
    this.output = output;
    this.debugLog = debugLog;

    // GitHub client
    const {
      octokit,
      coreLimiter,
      searchLimiter,
      makeRequest,
      makeSearchRequest,
      baseUrl,
    } = createGitHubClient(this.config, {
      log: this.log,
      debugLog: this.debugLog,
      apiCalls: this.apiCalls,
    });
    this.octokit = octokit;
    this.makeRequest = makeRequest;
    this.baseUrl = baseUrl;

    // Shared context for sub-modules
    this.ctx = {
      config: this.config,
      octokit,
      makeRequest,
      makeSearchRequest,
      coreLimiter,
      searchLimiter,
      log: this.log,
      output: this.output,
      debugLog: this.debugLog,
      apiCalls: this.apiCalls,
      errors: this.errors,
      totalFetched: this.totalFetched,
      cancelled: this.cancelled,
      cache: this.cache,
    };

    // Stream writer for crash-safe JSONL output
    const [, repoName] = (this.config.repo || "unknown/unknown").split("/");
    const streamFilename =
      this.config.filename ||
      `secret-scanning-${repoName || "unknown"}`;
    this.stream = new StreamWriter({
      outputDir: this.config.outputDir,
      filename: streamFilename,
      toolName: "github-security-secret-scanning",
      toolConfig: { ...this.config },
    });
    this.ctx.stream = this.stream;

    // SIGINT handler
    process.on("SIGINT", async () => {
      this.log("\nGracefully stopping...", "warn");
      this.cancelled.value = true;
      this.stream.finalize(false);
      process.exit(0);
    });

    this.log("SecretScanningService initialized");
  }

  displayInitialization() {
    this.output(chalk.blue.bold("GitHub Secret Scanning Tool"));

    const params = [
      ["Repository", this.config.repo || "N/A"],
      ["Mode", chalk.cyan(this.config.mode)],
      ["Handler", this.config.handler || "N/A"],
      ["Secret resolution", this.config.secretResolution],
      ["Auto resolve", this.config.autoResolve ? chalk.yellow("Yes") : "No"],
      ["Dry run", this.config.dryRun ? chalk.yellow("Yes (no GitHub writes)") : chalk.green("No")],
      ["Repo root", this.config.repoRoot || "N/A"],
      ["Output format", this.config.format.toUpperCase()],
      ["Output directory", this.config.outputDir],
      ["Verbose mode", this.config.verbose ? "Enabled" : "Disabled"],
      ["Debug mode", this.config.debug ? "Enabled" : "Disabled"],
    ];

    const maxLabelLength = Math.max(...params.map(([label]) => label.length));

    params.forEach(([label, value]) => {
      const padding = "\u2500".repeat(maxLabelLength - label.length);
      this.output(`${label} ${padding} ${value}`);
    });

    this.output("");
  }

  async fetchAlertsWithLocations() {
    const [owner, repoName] = (this.config.repo || "/").split("/");

    this.output(chalk.blue.bold("Fetching Secret Scanning Alerts\n"));

    this.output("  Fetching open alerts...");
    const alerts = [];
    for await (const alert of fetchSecretScanningAlerts(this.ctx, {
      owner,
      repo: repoName,
      state: "open",
    })) {
      if (this.cancelled.value) break;
      alerts.push(alert);
      this.totalFetched.value++;
    }
    this.output(
      `  ${chalk.green("\u2713")} Found ${chalk.green(alerts.length)} open alert(s)`
    );

    if (alerts.length === 0) return;

    // Fetch locations for each alert
    this.output("\n  Fetching locations for each alert...");
    for (const alert of alerts) {
      if (this.cancelled.value) break;

      const locations = [];
      for await (const loc of fetchSecretScanningLocations(this.ctx, {
        owner,
        repo: repoName,
        alertNumber: alert.number,
      })) {
        if (this.cancelled.value) break;
        locations.push(loc);
      }

      this.alertsWithLocations.push({ alert, locations });
      this.output(
        `  ${chalk.green("\u2713")} Alert #${alert.number}: ${chalk.cyan(alert.secret_type_display_name || alert.secret_type)} — ${locations.length} location(s)`
      );
    }

    this.output(
      `\n  Total: ${chalk.green(this.alertsWithLocations.length)} alert(s), ${chalk.green(this.alertsWithLocations.reduce((sum, a) => sum + a.locations.length, 0))} location(s)`
    );
  }

  async saveAlertData() {
    await ensureDir(this.config.outputDir);

    const [, repoName] = (this.config.repo || "unknown/unknown").split("/");
    const timestamp = new Date().toISOString().split("T")[0];
    const baseFilename =
      this.config.filename ||
      `secret-scanning-${repoName || "unknown"}-${timestamp}`;

    const alertDataPath = path.join(
      this.config.outputDir,
      `${baseFilename}.alerts.json`
    );

    const alertData = this.alertsWithLocations.map(({ alert, locations }) => ({
      number: alert.number,
      secret_type: alert.secret_type,
      secret_type_display_name: alert.secret_type_display_name,
      validity: alert.validity,
      html_url: alert.html_url,
      created_at: alert.created_at,
      locations: locations.map((loc) => ({
        type: loc.type,
        path: loc.details?.path || null,
        start_line: loc.details?.start_line || null,
        end_line: loc.details?.end_line || null,
        start_column: loc.details?.start_column || null,
        end_column: loc.details?.end_column || null,
        blob_sha: loc.details?.blob_sha || null,
        commit_sha: loc.details?.commit_sha || null,
      })),
    }));

    await writeJsonReport(alertData, alertDataPath);
    this.output(`\n  Alert data saved: ${chalk.green(alertDataPath)}`);

    return alertDataPath;
  }

  displayCheckSummary() {
    this.output(chalk.blue.bold("\nCheck Summary"));
    this.output("\u2500".repeat(60));

    if (this.alertsWithLocations.length === 0) {
      this.output(chalk.green("  No open secret scanning alerts found."));
      return;
    }

    for (const { alert, locations } of this.alertsWithLocations) {
      this.output(
        `\n  Alert #${chalk.cyan(alert.number)}: ${alert.secret_type_display_name || alert.secret_type}`
      );
      this.output(`    Validity: ${chalk.yellow(alert.validity || "unknown")}`);
      this.output(`    Locations (${locations.length}):`);

      for (const loc of locations) {
        if (loc.type === "commit" && loc.details?.path) {
          this.output(
            `      ${chalk.gray("\u2502")} ${loc.details.path}:${loc.details.start_line || "?"}`
          );
        }
      }
    }
    this.output("\u2500".repeat(60));
  }

  async runResolveMode() {
    this.output(chalk.blue.bold("\nResolve Phase\n"));

    // Load handler
    const handlerFn = await loadHandler(this.config.handler, this.log);
    const handlerContext = createHandlerContext({
      repoRoot: this.config.repoRoot,
      log: this.log,
    });

    let fixedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const { alert, locations } of this.alertsWithLocations) {
      if (this.cancelled.value) break;

      const alertResults = [];
      this.handlerResults.set(alert.number, alertResults);

      this.output(`  Processing alert #${chalk.cyan(alert.number)}...`);

      for (const loc of locations) {
        if (this.cancelled.value) break;

        // Only process commit-type locations with a file path
        if (loc.type !== "commit" || !loc.details?.path) {
          alertResults.push({
            action: "skipped",
            message: `Non-commit location type: ${loc.type}`,
            path: loc.details?.path || null,
          });
          skippedCount++;
          continue;
        }

        try {
          const result = await handlerFn(alert, loc, handlerContext);

          const action = result?.action || "error";
          const message = result?.message || "";

          alertResults.push({
            action,
            message,
            path: loc.details.path,
          });

          if (action === "fixed") {
            fixedCount++;
            this.output(
              `    ${chalk.green("\u2713")} ${loc.details.path} — fixed${message ? `: ${message}` : ""}`
            );
          } else if (action === "skipped") {
            skippedCount++;
            this.output(
              `    ${chalk.yellow("\u2013")} ${loc.details.path} — skipped${message ? `: ${message}` : ""}`
            );
          } else {
            errorCount++;
            this.output(
              `    ${chalk.red("\u2717")} ${loc.details.path} — error${message ? `: ${message}` : ""}`
            );
          }
        } catch (err) {
          errorCount++;
          alertResults.push({
            action: "error",
            message: err.message,
            path: loc.details.path,
          });
          this.output(
            `    ${chalk.red("\u2717")} ${loc.details.path} — error: ${err.message}`
          );
        }
      }
    }

    this.output(
      `\n  Handler results: ${chalk.green(fixedCount)} fixed, ${chalk.yellow(skippedCount)} skipped, ${chalk.red(errorCount)} error(s)`
    );

    return { fixedCount, skippedCount, errorCount };
  }

  async autoResolveAlerts() {
    if (!this.config.autoResolve || this.config.dryRun) {
      if (this.config.dryRun) {
        this.output(
          chalk.yellow(
            "\n  [DRY RUN] Skipping GitHub resolution — pass --autoResolve --no-dryRun to resolve on GitHub"
          )
        );
      }
      return;
    }

    const [owner, repoName] = (this.config.repo || "/").split("/");

    this.output(chalk.blue.bold("\nAuto-Resolve Phase\n"));

    for (const { alert } of this.alertsWithLocations) {
      if (this.cancelled.value) break;

      const results = this.handlerResults.get(alert.number) || [];

      // Only resolve if ALL locations returned "fixed"
      const allFixed =
        results.length > 0 && results.every((r) => r.action === "fixed");

      if (!allFixed) {
        this.output(
          `  ${chalk.yellow("\u2013")} Alert #${alert.number} — not all locations fixed, skipping`
        );
        this.resolveResults.push({
          number: alert.number,
          resolved: false,
          reason: "not all locations fixed",
        });
        continue;
      }

      try {
        await resolveSecretScanningAlert(this.ctx, {
          owner,
          repo: repoName,
          alertNumber: alert.number,
          resolution: this.config.secretResolution,
          comment: `Auto-resolved by secret-scanning tool (${results.length} location(s) fixed)`,
        });
        this.output(
          `  ${chalk.green("\u2713")} Alert #${alert.number} resolved on GitHub as "${this.config.secretResolution}"`
        );
        this.resolveResults.push({
          number: alert.number,
          resolved: true,
        });
      } catch (err) {
        this.log(
          `Failed to resolve alert #${alert.number}: ${err.message}`,
          "warn"
        );
        this.resolveResults.push({
          number: alert.number,
          resolved: false,
          reason: err.message,
        });
      }
    }

    const resolvedCount = this.resolveResults.filter((r) => r.resolved).length;
    const failedCount = this.resolveResults.filter((r) => !r.resolved).length;
    this.output(
      `\n  Resolved on GitHub: ${chalk.green(resolvedCount)}, Failed: ${chalk.red(failedCount)}`
    );
  }

  async generateReport(handlerStats) {
    this.output(chalk.blue.bold("\nReport Generation"));

    await ensureDir(this.config.outputDir);

    const [, repoName] = (this.config.repo || "unknown/unknown").split("/");
    const timestamp = new Date().toISOString().split("T")[0];
    const baseFilename =
      this.config.filename ||
      `secret-scanning-${repoName || "unknown"}-${timestamp}`;

    const report = buildReport(this.config, {
      alertsWithLocations: this.alertsWithLocations,
      handlerResults: this.handlerResults,
      resolveResults: this.resolveResults,
      handlerStats: handlerStats || null,
      totalFetched: this.totalFetched.value,
      cancelled: this.cancelled.value,
    });

    const outputPath = path.join(
      this.config.outputDir,
      `${baseFilename}.json`
    );
    await writeJsonReport(report, outputPath);
    this.output(`Report saved: ${chalk.green(outputPath)}`);

    if (this.config.debug) {
      const auditPath = path.join(
        this.config.outputDir,
        `${baseFilename}.audit.json`
      );
      await writeAuditReport(
        this.apiCalls,
        this.errors,
        this.config,
        auditPath,
        {
          totalFetched: this.totalFetched.value,
          cancelled: this.cancelled.value,
        }
      );
      this.output(`Audit file saved: ${chalk.green(auditPath)}`);
    }

    return { report, outputPath };
  }

  async showRateLimit() {
    try {
      const data = await this.makeRequest("GET /rate_limit");
      const { rate } = data;

      this.output(chalk.blue.bold("\nGitHub API Rate Limit Status:"));
      this.output(`   Limit: ${chalk.green.bold(rate.limit)}`);
      this.output(`   Remaining: ${chalk.green.bold(rate.remaining)}`);
      this.output(`   Used: ${chalk.yellow.bold(rate.used)}`);
      this.output(
        `   Resets at: ${chalk.gray(new Date(rate.reset * 1000).toLocaleString())}`
      );
    } catch {
      this.log("Failed to fetch rate limit information", "error");
    }
  }

  displayFinalSummary(report, outputPath) {
    const { summary } = report;

    this.output("");
    this.output(chalk.blue.bold("GitHub API Usage Summary:"));
    this.output("\u2500".repeat(60));
    this.output(`Total API calls: ${chalk.green(this.apiCalls.length)}`);

    this.output("");
    this.output(chalk.green.bold("Secret scanning completed!"));

    this.output("");
    this.output(chalk.blue.bold("Final Summary"));
    this.output("\u2500".repeat(60));
    this.output(`Mode                   : ${chalk.cyan(summary.mode)}`);
    this.output(`Total Alerts           : ${chalk.green(summary.totalAlerts)}`);
    this.output(`Total Locations        : ${chalk.green(summary.totalLocations)}`);

    if (summary.mode === "resolve") {
      this.output(`Fixed                  : ${chalk.green(summary.fixed)}`);
      this.output(`Skipped                : ${chalk.yellow(summary.skipped)}`);
      this.output(`Errors                 : ${summary.errored > 0 ? chalk.red(summary.errored) : summary.errored}`);
      this.output(`Resolved on GitHub     : ${chalk.green(summary.autoResolved)}`);

      if (summary.autoResolveFailed > 0) {
        this.output(`Failed to Resolve      : ${chalk.red(summary.autoResolveFailed)}`);
      }
    }

    this.output("");
    this.output(`Report Location        : ${chalk.green(outputPath)}`);
    this.output("\u2500".repeat(60));
  }

  async run() {
    try {
      this.displayInitialization();

      // Fetch alerts with locations
      await this.fetchAlertsWithLocations();

      // Save raw alert data
      await this.saveAlertData();

      let handlerStats = null;

      if (this.config.mode === "check") {
        // Check mode — display summary only
        this.displayCheckSummary();
      } else {
        // Resolve mode — apply handler, then optionally auto-resolve
        if (this.alertsWithLocations.length === 0) {
          this.output(chalk.green("\n  No alerts to resolve."));
        } else {
          handlerStats = await this.runResolveMode();
          await this.autoResolveAlerts();
        }
      }

      // Generate report
      const { report, outputPath } = await this.generateReport(handlerStats);

      this.stream.finalize(true);
      await this.showRateLimit();
      this.displayFinalSummary(report, outputPath);

      return { success: true, report, outputPath };
    } catch (error) {
      this.stream.finalize(false);
      this.log(`Error: ${error.message}`, "error");
      if (this.config.debug) {
        this.log(error.stack, "error");
      }
      process.exit(1);
    }
  }
}
