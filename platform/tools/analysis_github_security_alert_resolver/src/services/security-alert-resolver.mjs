import chalk from "chalk";
import path from "path";
import { writeFileSync } from "fs";
import { normalizeConfig } from "../config/normalize.mjs";
import {
  createGitHubClient,
  createLogger,
  createDebugLogger,
  ensureDir,
  writeAuditReport,
  StreamWriter,
} from "@internal/github-api-sdk-cli";
import { fetchCodeScanningAlerts } from "../github/endpoints/code-scanning-alerts.mjs";
import { fetchSecretScanningAlerts } from "../github/endpoints/secret-scanning-alerts.mjs";
import { fetchDependabotAlerts } from "../github/endpoints/dependabot-alerts.mjs";
import {
  fetchDefaultBranch,
  dismissCodeScanningAlert,
  resolveSecretScanningAlert,
  dismissDependabotAlert,
} from "../github/endpoints/alert-dismiss.mjs";
import { ResolutionChecker } from "../analysis/resolution-checker.mjs";
import { buildReport } from "../reporting/report-builder.mjs";
import { writeJsonReport } from "../reporting/writers/json-writer.mjs";

export class SecurityAlertResolver {
  constructor(options) {
    this.config = normalizeConfig(options);

    // Mutable state
    this.data = {
      codeScanningAlerts: [],
      secretScanningAlerts: [],
      dependabotAlerts: [],
    };
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

    // Build shared context for sub-modules
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
      `security-alert-resolver-${repoName || "unknown"}`;
    this.stream = new StreamWriter({
      outputDir: this.config.outputDir,
      filename: streamFilename,
      toolName: "security-alert-resolver",
      toolConfig: { ...this.config },
    });
    this.ctx.stream = this.stream;

    // Initialize resolution checker
    this.checker = new ResolutionChecker();

    // SIGINT handler
    process.on("SIGINT", async () => {
      this.log("\nGracefully stopping...", "warn");
      this.cancelled.value = true;
      await this.savePartialResults();
      process.exit(0);
    });

    this.log("SecurityAlertResolver initialized");
  }

  async savePartialResults() {
    this.stream.finalize(false);
    const hasData =
      this.data.codeScanningAlerts.length > 0 ||
      this.data.secretScanningAlerts.length > 0 ||
      this.data.dependabotAlerts.length > 0;

    if (hasData) {
      this.log("Saving partial results...", "warn");
    }
  }

  displayInitialization() {
    this.output(chalk.blue.bold("GitHub Security Alert Resolver"));

    const params = [
      ["Repository", this.config.repo || "N/A"],
      ["Alert types", this.config.alertTypes.join(", ")],
      ["Dry run", this.config.dryRun ? chalk.yellow("Yes (no API writes)") : chalk.green("No")],
      ["Auto close", this.config.autoClose ? chalk.yellow("Yes") : "No"],
      ["Dismiss reason", this.config.dismissReason],
      ["Secret resolution", this.config.secretResolution],
      ["Branch override", this.config.ref || "Auto-detect"],
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

    if (this.config.dryRun) {
      this.output(
        chalk.yellow.bold(
          "\n[DRY RUN] No alerts will be closed. Pass --autoClose --no-dryRun to write changes.\n"
        )
      );
    }

    this.output(chalk.blue.bold("\nFetching open security alerts...\n"));
  }

  async fetchAllAlerts() {
    const [owner, repoName] = (this.config.repo || "/").split("/");

    // ── Code scanning ────────────────────────────────────────────────────────

    if (this.config.alertTypes.includes("code-scanning")) {
      this.output(`  Fetching code-scanning alerts...`);
      for await (const alert of fetchCodeScanningAlerts(this.ctx, {
        owner,
        repo: repoName,
        state: "open",
      })) {
        if (this.cancelled.value) break;
        this.data.codeScanningAlerts.push(alert);
        this.totalFetched.value++;
      }
      this.output(
        `  ${chalk.green("\u2713")} Code scanning: ${chalk.green(this.data.codeScanningAlerts.length)} alerts`
      );
    }

    // ── Secret scanning ──────────────────────────────────────────────────────

    if (this.config.alertTypes.includes("secret-scanning")) {
      this.output(`  Fetching secret-scanning alerts...`);
      for await (const alert of fetchSecretScanningAlerts(this.ctx, {
        owner,
        repo: repoName,
        state: "open",
      })) {
        if (this.cancelled.value) break;
        this.data.secretScanningAlerts.push(alert);
        this.totalFetched.value++;
      }
      this.output(
        `  ${chalk.green("\u2713")} Secret scanning: ${chalk.green(this.data.secretScanningAlerts.length)} alerts`
      );
    }

    // ── Dependabot ───────────────────────────────────────────────────────────

    if (this.config.alertTypes.includes("dependabot")) {
      this.output(`  Fetching dependabot alerts...`);
      for await (const alert of fetchDependabotAlerts(this.ctx, {
        owner,
        repo: repoName,
        state: "open",
      })) {
        if (this.cancelled.value) break;
        this.data.dependabotAlerts.push(alert);
        this.totalFetched.value++;
      }
      this.output(
        `  ${chalk.green("\u2713")} Dependabot: ${chalk.green(this.data.dependabotAlerts.length)} alerts`
      );
    }

    return this.data;
  }

  async checkResolutions(defaultBranch) {
    const [owner, repoName] = (this.config.repo || "/").split("/");

    this.output(chalk.blue.bold("\nResolution Check Phase"));

    const results = {
      codeScanningResolved: [],
      codeScanningStillOpen: [],
      secretScanningResolved: [],
      secretScanningStillOpen: [],
      dependabotResolved: [],
      dependabotStillOpen: [],
      failed: [],
      closeResults: [],
    };

    // ── Code scanning ────────────────────────────────────────────────────────

    if (this.config.alertTypes.includes("code-scanning")) {
      this.output(`  Checking code-scanning resolutions...`);
      const { resolved, stillOpen, errors } =
        await this.checker.checkCodeScanningResolutions(this.ctx, {
          owner,
          repo: repoName,
          openAlerts: this.data.codeScanningAlerts,
          defaultBranch,
        });
      results.codeScanningResolved = resolved;
      results.codeScanningStillOpen = stillOpen;
      results.failed.push(...errors);
      this.output(
        `  ${chalk.green("\u2713")} Code scanning: ${chalk.green(resolved.length)} resolved, ${chalk.yellow(stillOpen.length)} still open`
      );
    }

    // ── Secret scanning ──────────────────────────────────────────────────────

    if (this.config.alertTypes.includes("secret-scanning")) {
      this.output(`  Checking secret-scanning resolutions...`);
      const { resolved, stillOpen, errors } =
        await this.checker.checkSecretScanningResolutions(this.ctx, {
          owner,
          repo: repoName,
          openAlerts: this.data.secretScanningAlerts,
          defaultBranch,
        });
      results.secretScanningResolved = resolved;
      results.secretScanningStillOpen = stillOpen;
      results.failed.push(...errors);
      this.output(
        `  ${chalk.green("\u2713")} Secret scanning: ${chalk.green(resolved.length)} resolved, ${chalk.yellow(stillOpen.length)} still open`
      );
    }

    // ── Dependabot ───────────────────────────────────────────────────────────

    if (this.config.alertTypes.includes("dependabot")) {
      this.output(`  Checking dependabot resolutions...`);
      const { resolved, stillOpen, errors } =
        await this.checker.checkDependabotResolutions(this.ctx, {
          owner,
          repo: repoName,
          openAlerts: this.data.dependabotAlerts,
        });
      results.dependabotResolved = resolved;
      results.dependabotStillOpen = stillOpen;
      results.failed.push(...errors);
      this.output(
        `  ${chalk.green("\u2713")} Dependabot: ${chalk.green(resolved.length)} resolved, ${chalk.yellow(stillOpen.length)} still open`
      );
    }

    return results;
  }

  async autoCloseResolved(resolutionData) {
    const [owner, repoName] = (this.config.repo || "/").split("/");
    const closeResults = [];

    this.output(chalk.blue.bold("\nAuto-Close Phase"));

    const { dismissReason, dismissComment } = this.config;

    // ── Code scanning ────────────────────────────────────────────────────────

    for (const alert of resolutionData.codeScanningResolved) {
      if (this.cancelled.value) break;
      try {
        await dismissCodeScanningAlert(this.ctx, {
          owner,
          repo: repoName,
          alertNumber: alert.number,
          dismissedReason: dismissReason,
          dismissedComment: dismissComment,
        });
        this.output(
          `  ${chalk.green("\u2713")} Closed code-scanning #${alert.number}`
        );
        closeResults.push({ number: alert.number, type: "code-scanning", success: true });
      } catch (err) {
        this.log(
          `Failed to close code-scanning alert #${alert.number}: ${err.message}`,
          "warn"
        );
        closeResults.push({
          number: alert.number,
          type: "code-scanning",
          success: false,
          error: err.message,
        });
        resolutionData.failed.push({
          number: alert.number,
          type: "code-scanning",
          error: err.message,
        });
      }
    }

    // ── Secret scanning ──────────────────────────────────────────────────────

    for (const alert of resolutionData.secretScanningResolved) {
      if (this.cancelled.value) break;
      try {
        await resolveSecretScanningAlert(this.ctx, {
          owner,
          repo: repoName,
          alertNumber: alert.number,
          resolution: this.config.secretResolution,
          comment: dismissComment,
        });
        this.output(
          `  ${chalk.green("\u2713")} Closed secret-scanning #${alert.number}`
        );
        closeResults.push({ number: alert.number, type: "secret-scanning", success: true });
      } catch (err) {
        this.log(
          `Failed to close secret-scanning alert #${alert.number}: ${err.message}`,
          "warn"
        );
        closeResults.push({
          number: alert.number,
          type: "secret-scanning",
          success: false,
          error: err.message,
        });
        resolutionData.failed.push({
          number: alert.number,
          type: "secret-scanning",
          error: err.message,
        });
      }
    }

    resolutionData.closeResults = closeResults;
    return closeResults;
  }

  async generateReport(resolutionData, defaultBranch) {
    this.output(chalk.blue.bold("Report Generation"));

    await ensureDir(this.config.outputDir);

    const [, repoName] = (this.config.repo || "unknown/unknown").split("/");
    const timestamp = new Date().toISOString().split("T")[0];
    const baseFilename =
      this.config.filename ||
      `security-alert-resolver-${repoName || "unknown"}-${timestamp}`;

    const autoClosedCount =
      (resolutionData.closeResults || []).filter((r) => r.success).length;
    const failedCloseCount =
      (resolutionData.closeResults || []).filter((r) => !r.success).length;

    const report = buildReport(
      this.config,
      resolutionData,
      defaultBranch,
      {
        totalFetched: this.totalFetched.value,
        cancelled: this.cancelled.value,
        autoClosedCount,
        failedCloseCount,
      }
    );

    const outputPath = path.join(
      this.config.outputDir,
      `${baseFilename}.json`
    );
    await writeJsonReport(report, outputPath);

    this.output(`Report saved: ${chalk.green(outputPath)}`);

    // Generate audit file if debug mode
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

      if (rate.remaining < 10) {
        this.log("Rate limit is low!", "warn");
      }
    } catch (error) {
      this.log("Failed to fetch rate limit information", "error");
    }
  }

  displaySummary(report, outputPath) {
    const { summary } = report;

    this.output("");
    this.output(chalk.blue.bold("GitHub API Usage Summary:"));
    this.output("\u2500".repeat(60));
    this.output(`Total API calls: ${chalk.green(this.apiCalls.length)}`);

    this.output("");
    this.output(chalk.green.bold("Security alert resolution completed!"));

    this.output("");
    this.output(chalk.blue.bold("Final Report Summary"));
    this.output("\u2500".repeat(60));
    this.output(
      `Default Branch         : ${chalk.cyan(summary.defaultBranch)}`
    );
    this.output(
      `Total Open Alerts      : ${chalk.green(summary.totalOpen)}`
    );
    this.output(
      `Total Resolved         : ${chalk.green(summary.totalResolved)}`
    );
    this.output(
      `Total Still Open       : ${chalk.yellow(summary.totalStillOpen)}`
    );

    if (this.config.autoClose && !this.config.dryRun) {
      this.output(
        `Auto Closed            : ${chalk.green(summary.totalAutoClosed)}`
      );
      if (summary.totalFailed > 0) {
        this.output(
          `Failed to Close        : ${chalk.red(summary.totalFailed)}`
        );
      }
    } else {
      this.output(
        chalk.yellow(
          `[DRY RUN] No alerts were closed. Pass --autoClose --no-dryRun to write changes.`
        )
      );
    }

    this.output("");

    // Per-type breakdown
    for (const [type, counts] of Object.entries(summary.byType)) {
      this.output(
        `  ${type.padEnd(20)} open=${counts.open} resolved=${chalk.green(counts.resolved)} autoClosed=${chalk.green(counts.autoClosed)} failed=${counts.failed > 0 ? chalk.red(counts.failed) : counts.failed}`
      );
    }

    this.output("");
    this.output(
      `Report Location        : ${chalk.green(outputPath)}`
    );
    this.output("\u2500".repeat(60));
  }

  async run() {
    try {
      this.displayInitialization();

      // ── Fetch default branch ───────────────────────────────────────────────

      const [owner, repoName] = (this.config.repo || "/").split("/");
      let defaultBranch = this.config.ref;

      if (!defaultBranch) {
        this.output(`  Detecting default branch...`);
        defaultBranch = await fetchDefaultBranch(this.ctx, {
          owner,
          repo: repoName,
        });
        this.output(
          `  ${chalk.green("\u2713")} Default branch: ${chalk.cyan(defaultBranch)}`
        );
      } else {
        this.output(
          `  ${chalk.green("\u2713")} Using branch override: ${chalk.cyan(defaultBranch)}`
        );
      }

      // ── Fetch all open alerts ──────────────────────────────────────────────

      await this.fetchAllAlerts();

      // ── Check resolutions ──────────────────────────────────────────────────

      const resolutionData = await this.checkResolutions(defaultBranch);

      // ── Auto-close if configured ───────────────────────────────────────────

      if (this.config.autoClose && !this.config.dryRun) {
        await this.autoCloseResolved(resolutionData);
      } else {
        resolutionData.closeResults = [];
      }

      // ── Generate report ────────────────────────────────────────────────────

      const { report, outputPath } = await this.generateReport(
        resolutionData,
        defaultBranch
      );

      this.stream.finalize(true);
      await this.showRateLimit();
      this.displaySummary(report, outputPath);

      return { success: true, report, outputPath };
    } catch (error) {
      this.stream.finalize(false);
      try {
        await ensureDir(this.config.outputDir);
        const [, repoName] = (this.config.repo || "unknown/unknown").split("/");
        const errFilename =
          this.config.filename ||
          `security-alert-resolver-${repoName || "unknown"}`;
        writeFileSync(
          path.join(
            this.config.outputDir,
            `dashboard-${errFilename}.errors.json`
          ),
          JSON.stringify({
            errors: [error.message],
            inputs: {
              ...this.config,
            },
          })
        );
      } catch {
        // Best-effort error file write
      }
      this.log(`Error: ${error.message}`, "error");
      if (this.config.debug) {
        this.log(error.stack, "error");
      }
      process.exit(1);
    }
  }
}
