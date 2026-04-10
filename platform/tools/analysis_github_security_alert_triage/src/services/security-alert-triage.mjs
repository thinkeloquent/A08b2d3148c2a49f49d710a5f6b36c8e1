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
import { TriageAnalyzer } from "../analysis/triage-analyzer.mjs";
import { buildReport } from "../reporting/report-builder.mjs";
import { writeJsonReport } from "../reporting/writers/json-writer.mjs";

export class SecurityAlertTriage {
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
      `security-alert-triage-${repoName || "unknown"}`;
    this.stream = new StreamWriter({
      outputDir: this.config.outputDir,
      filename: streamFilename,
      toolName: "security-alert-triage",
      toolConfig: { ...this.config },
    });
    this.ctx.stream = this.stream;

    // Initialize analyzer
    this.analyzer = new TriageAnalyzer({
      alertTypes: this.config.alertTypes,
      alertState: this.config.alertState,
      minSeverity: this.config.minSeverity,
      toolName: this.config.toolName,
    });

    // SIGINT handler
    process.on("SIGINT", async () => {
      this.log("\nGracefully stopping...", "warn");
      this.cancelled.value = true;
      await this.savePartialResults();
      process.exit(0);
    });

    this.log("SecurityAlertTriage initialized");
  }

  async savePartialResults() {
    this.stream.finalize(false);
    const hasData =
      this.data.codeScanningAlerts.length > 0 ||
      this.data.secretScanningAlerts.length > 0 ||
      this.data.dependabotAlerts.length > 0;

    if (hasData) {
      this.log("Saving partial results...", "warn");
      await this.generateReport(this.data, this.performAnalysis(this.data));
    }
  }

  displayInitialization() {
    this.output(chalk.blue.bold("GitHub Security Alert Triage"));

    const [owner, repoName] = (this.config.repo || "/").split("/");

    const params = [
      ["Repository", this.config.repo || "N/A"],
      ["Alert types", this.config.alertTypes.join(", ")],
      ["Alert state", this.config.alertState],
      ["Min severity", this.config.minSeverity || "All"],
      ["Tool filter", this.config.toolName || "All tools"],
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

    this.output(chalk.blue.bold("\nFetching security alerts...\n"));
  }

  async fetchAllAlerts() {
    const [owner, repoName] = (this.config.repo || "/").split("/");
    const alertState =
      this.config.alertState === "all" ? "open" : this.config.alertState;

    // ── Code scanning ────────────────────────────────────────────────────────

    if (this.config.alertTypes.includes("code-scanning")) {
      this.output(`  Fetching code-scanning alerts...`);
      const params = { owner, repo: repoName, state: alertState };
      if (this.config.toolName) params.toolName = this.config.toolName;

      for await (const alert of fetchCodeScanningAlerts(this.ctx, params)) {
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
      const params = { owner, repo: repoName, state: alertState };

      for await (const alert of fetchSecretScanningAlerts(this.ctx, params)) {
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
      const params = { owner, repo: repoName, state: alertState };

      for await (const alert of fetchDependabotAlerts(this.ctx, params)) {
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

  performAnalysis(data) {
    this.output(chalk.blue.bold("\nAnalysis Phase"));

    try {
      const analytics = this.analyzer.analyze(data, { log: this.log });
      return analytics;
    } catch (error) {
      this.log(`Failed to analyze alerts: ${error.message}`, "warn");
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async generateReport(data, analytics) {
    this.output(chalk.blue.bold("Report Generation"));

    await ensureDir(this.config.outputDir);

    const [, repoName] = (this.config.repo || "unknown/unknown").split("/");
    const timestamp = new Date().toISOString().split("T")[0];
    const baseFilename =
      this.config.filename ||
      `security-alert-triage-${repoName || "unknown"}-${timestamp}`;

    const report = buildReport(this.config, data, analytics, {
      totalFetched: this.totalFetched.value,
      cancelled: this.cancelled.value,
    });

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
        `   Resets at: ${chalk.gray(
          new Date(rate.reset * 1000).toLocaleString()
        )}`
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
    this.output(chalk.green.bold("Security alert triage completed!"));

    this.output("");
    this.output(chalk.blue.bold("Final Report Summary"));
    this.output("\u2500".repeat(60));
    this.output(
      `Total Alerts           : ${chalk.green(summary.totalAlerts)}`
    );
    this.output(
      `  Code Scanning        : ${chalk.green(summary.totalCodeScanning)}`
    );
    this.output(
      `  Secret Scanning      : ${chalk.green(summary.totalSecretScanning)}`
    );
    this.output(
      `  Dependabot           : ${chalk.green(summary.totalDependabot)}`
    );
    this.output("");
    this.output(
      `  Critical             : ${chalk[summary.bySeverityCount.critical > 0 ? "red" : "green"].bold(summary.bySeverityCount.critical)}`
    );
    this.output(
      `  High                 : ${chalk[summary.bySeverityCount.high > 0 ? "yellow" : "green"](summary.bySeverityCount.high)}`
    );
    this.output(
      `  Medium               : ${chalk.cyan(summary.bySeverityCount.medium)}`
    );
    this.output(
      `  Low                  : ${chalk.gray(summary.bySeverityCount.low)}`
    );
    this.output(
      `Report Location        : ${chalk.green(outputPath)}`
    );
    this.output("\u2500".repeat(60));
  }

  async run() {
    try {
      this.displayInitialization();

      await this.fetchAllAlerts();
      const analytics = this.performAnalysis(this.data);
      const { report, outputPath } = await this.generateReport(
        this.data,
        analytics
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
          `security-alert-triage-${repoName || "unknown"}`;
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
