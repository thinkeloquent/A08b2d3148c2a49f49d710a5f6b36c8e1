import chalk from "chalk";
import fs from "fs/promises";
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
import { groupByRule, ruleMapToArray } from "../analysis/rule-grouper.mjs";
import { buildFileHeatmap } from "../analysis/file-heatmap.mjs";
import { computeVelocity } from "../analysis/remediation-velocity.mjs";
import { buildReport } from "../reporting/report-builder.mjs";
import { writeJsonReport } from "../reporting/writers/json-writer.mjs";
import { writeCsvReport } from "../reporting/writers/csv-writer.mjs";

export class CodescanRemediationTracker {
  constructor(options) {
    this.config = normalizeConfig(options);

    // Parse owner/repo from config.repo
    const repoParts = (this.config.repo || "").split("/");
    if (repoParts.length < 2) {
      throw new Error(`Invalid repo format "${this.config.repo}" — expected "owner/repo"`);
    }
    this.owner = repoParts[0];
    this.repoName = repoParts.slice(1).join("/");

    // Mutable state
    this.data = { openAlerts: [], fixedAlerts: [] };
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
    const streamFilename =
      this.config.filename ||
      `codescan-remediation-tracker-${this.owner}-${this.repoName}`;
    this.stream = new StreamWriter({
      outputDir: this.config.outputDir,
      filename: streamFilename,
      toolName: "codescan-remediation-tracker",
      toolConfig: { ...this.config },
    });
    this.ctx.stream = this.stream;

    // SIGINT handler
    process.on("SIGINT", async () => {
      this.log("\nGracefully stopping...", "warn");
      this.cancelled.value = true;
      await this.savePartialResults();
      process.exit(0);
    });

    this.log("CodescanRemediationTracker initialized");
  }

  async savePartialResults() {
    this.stream.finalize(false);
    if (this.data.openAlerts.length > 0 || this.data.fixedAlerts.length > 0) {
      this.log("Saving partial results...", "warn");
      await this.generateReport(this.data, {});
    }
  }

  displayInitialization() {
    this.output(chalk.blue.bold("CodeQL Code Scanning Remediation Tracker"));

    const params = [
      ["Repository", `${this.owner}/${this.repoName}`],
      ["Tool filter", this.config.toolName || "CodeQL"],
      ["Severity filter", this.config.severity?.join(", ") || "all"],
      ["Include fixed", this.config.includeFixed ? "Yes" : "No"],
      ["Velocity window", `${this.config.velocityWeeks} weeks`],
      ["Top files", String(this.config.topFiles)],
      ["Top rules", String(this.config.topRules)],
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

    this.output(chalk.blue.bold("\nStarting code scanning analysis...\n"));
  }

  async fetchAllAlerts() {
    this.output(chalk.blue.bold("Fetch Phase"));

    const openAlerts = [];
    const fixedAlerts = [];

    const sharedParams = {
      owner: this.owner,
      repo: this.repoName,
      toolName: this.config.toolName,
    };

    // Fetch open alerts
    this.log(`Fetching open alerts for ${this.owner}/${this.repoName}`);
    for await (const alert of fetchCodeScanningAlerts(this.ctx, {
      ...sharedParams,
      state: "open",
    })) {
      if (this.cancelled.value) break;
      openAlerts.push(alert);
      this.totalFetched.value += 1;
    }
    this.output(`  Open alerts fetched: ${chalk.green(openAlerts.length)}`);

    // Fetch fixed alerts if requested
    if (this.config.includeFixed) {
      this.log(`Fetching fixed alerts for ${this.owner}/${this.repoName}`);
      for await (const alert of fetchCodeScanningAlerts(this.ctx, {
        ...sharedParams,
        state: "fixed",
      })) {
        if (this.cancelled.value) break;
        fixedAlerts.push(alert);
        this.totalFetched.value += 1;
      }
      this.output(`  Fixed alerts fetched: ${chalk.green(fixedAlerts.length)}`);
    }

    return { openAlerts, fixedAlerts };
  }

  performAnalysis(data) {
    this.output(chalk.blue.bold("Analysis Phase"));

    const { openAlerts, fixedAlerts } = data;

    // Apply severity filter to open alerts if configured
    const filteredOpen = this.config.severity?.length
      ? openAlerts.filter((a) => this.config.severity.includes(a.rule?.severity))
      : openAlerts;

    const filteredFixed = this.config.severity?.length
      ? fixedAlerts.filter((a) => this.config.severity.includes(a.rule?.severity))
      : fixedAlerts;

    // Rule grouping
    const allAlerts = [...filteredOpen, ...filteredFixed];
    const ruleMap = groupByRule(allAlerts);
    const openRuleMap = groupByRule(filteredOpen);
    const fixedRuleMap = groupByRule(filteredFixed);

    const ruleBreakdown = ruleMapToArray(ruleMap, this.config.topRules).map((rule) => ({
      ...rule,
      openCount: openRuleMap.get(rule.ruleId)?.count ?? 0,
      fixedCount: fixedRuleMap.get(rule.ruleId)?.count ?? 0,
      fixRate:
        (openRuleMap.get(rule.ruleId)?.count ?? 0) +
          (fixedRuleMap.get(rule.ruleId)?.count ?? 0) >
        0
          ? parseFloat(
              (
                ((fixedRuleMap.get(rule.ruleId)?.count ?? 0) /
                  ((openRuleMap.get(rule.ruleId)?.count ?? 0) +
                    (fixedRuleMap.get(rule.ruleId)?.count ?? 0))) *
                100
              ).toFixed(1)
            )
          : 0,
    }));

    // File heatmap
    const fileHeatmap = buildFileHeatmap(filteredOpen, this.config.topFiles);

    // Velocity
    const velocity = computeVelocity(filteredOpen, filteredFixed, this.config.velocityWeeks);

    // Summary
    const summary = {
      totalOpenAlerts: filteredOpen.length,
      totalFixedAlerts: filteredFixed.length,
      uniqueRules: ruleMap.size,
      topRule: ruleBreakdown[0]?.ruleId ?? "N/A",
      topRuleCount: ruleBreakdown[0]?.count ?? 0,
      topFile: fileHeatmap[0]?.filePath ?? "N/A",
      topFileScore: fileHeatmap[0]?.hotspotScore ?? 0,
      avgFixesPerWeek: velocity.avgFixesPerWeek,
      projectedWeeksToZero: velocity.projectedWeeksToZero ?? "N/A",
      trendDirection: velocity.trendDirection,
      batchCandidates: velocity.batchCandidates.length,
    };

    this.output(`  Unique rules: ${chalk.green(ruleMap.size)}`);
    this.output(`  Top rule: ${chalk.yellow(ruleBreakdown[0]?.ruleId ?? "N/A")} (${ruleBreakdown[0]?.count ?? 0} alerts)`);
    this.output(`  Top hotspot: ${chalk.yellow(fileHeatmap[0]?.filePath ?? "N/A")}`);
    this.output(`  Avg fixes/week: ${chalk.green(velocity.avgFixesPerWeek)}`);
    this.output(`  Trend: ${chalk.cyan(velocity.trendDirection)}`);

    return { ruleBreakdown, fileHeatmap, velocity, summary };
  }

  async generateReport(data, analytics) {
    this.output(chalk.blue.bold("Report Generation"));

    await ensureDir(this.config.outputDir);

    const timestamp = new Date().toISOString().split("T")[0];
    const safeName = `${this.owner}-${this.repoName}`.replace(/[^a-zA-Z0-9_-]/g, "-");
    const baseFilename =
      this.config.filename ||
      `codescan-remediation-tracker-${safeName}-${timestamp}`;

    const report = buildReport(this.config, data, analytics, {
      totalFetched: this.totalFetched.value,
      cancelled: this.cancelled.value,
    });

    let outputPath;
    switch (this.config.format) {
      case "csv":
        outputPath = path.join(this.config.outputDir, `${baseFilename}.csv`);
        await writeCsvReport(report, outputPath);
        break;
      case "json":
      default:
        outputPath = path.join(this.config.outputDir, `${baseFilename}.json`);
        await writeJsonReport(report, outputPath);
    }

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
    this.output("");
    this.output(chalk.blue.bold("GitHub API Usage Summary:"));
    this.output("\u2500".repeat(60));
    this.output(`Total API calls: ${chalk.green(this.apiCalls.length)}`);
    this.output(
      `API paths used: ${chalk.green(
        [
          ...new Set(
            this.apiCalls.map((call) => {
              try {
                return new URL(`${this.baseUrl}${call.url.split(" ")[1]}`).pathname;
              } catch {
                return call.url.split(" ")[1] || call.url;
              }
            })
          ),
        ].join(", ")
      )}`
    );

    this.output("");
    this.output(chalk.green.bold("CodeQL remediation analysis completed!"));

    const s = report.summary;
    this.output("");
    this.output(chalk.blue.bold("Final Report Summary"));
    this.output("\u2500".repeat(60));
    this.output(`Total Open Alerts      : ${chalk.red(s.totalOpenAlerts)}`);
    this.output(`Total Fixed Alerts     : ${chalk.green(s.totalFixedAlerts)}`);
    this.output(`Unique Rules           : ${chalk.green(s.uniqueRules)}`);
    this.output(`Top Rule               : ${chalk.yellow(s.topRule)} (${s.topRuleCount} alerts)`);
    this.output(`Top Hotspot File       : ${chalk.yellow(s.topFile)}`);
    this.output(`Avg Fixes / Week       : ${chalk.green(s.avgFixesPerWeek)}`);
    this.output(
      `Projected Weeks to Zero: ${
        typeof s.projectedWeeksToZero === "number"
          ? chalk.cyan(s.projectedWeeksToZero + " weeks")
          : chalk.gray("N/A")
      }`
    );
    this.output(`Trend Direction        : ${chalk.cyan(s.trendDirection)}`);
    this.output(`Batch Candidates       : ${chalk.green(s.batchCandidates)}`);
    this.output(`Records Fetched        : ${chalk.green(this.totalFetched.value)}`);
    this.output(`Report Location        : ${chalk.green(outputPath)}`);
    this.output("\u2500".repeat(60));
  }

  async run() {
    try {
      this.displayInitialization();

      this.data = await this.fetchAllAlerts();
      const analytics = this.performAnalysis(this.data);
      const { report, outputPath } = await this.generateReport(this.data, analytics);

      this.stream.finalize(true);
      await this.showRateLimit();
      this.displaySummary(report, outputPath);

      return { success: true, report, outputPath };
    } catch (error) {
      this.stream.finalize(false);
      try {
        await ensureDir(this.config.outputDir);
        const safeName = `${this.owner}-${this.repoName}`.replace(/[^a-zA-Z0-9_-]/g, "-");
        const errFilename =
          this.config.filename || `codescan-remediation-tracker-${safeName}`;
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
