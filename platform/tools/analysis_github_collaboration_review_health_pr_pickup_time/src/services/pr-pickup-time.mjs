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
import { fetchAllData } from "./fetch-all-data.mjs";
import { buildReport } from "../reporting/report-builder.mjs";
import { writeJsonReport } from "../reporting/writers/json-writer.mjs";
import { writeCsvReport } from "../reporting/writers/csv-writer.mjs";
import { PickupTimeAnalyzer } from "../analysis/pickup-time.mjs";

export class PrPickupTime {
  constructor(options) {
    this.config = normalizeConfig(options);

    // Mutable state
    this.data = { pullRequests: [], repositories: [] };
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
      `pr-pickup-time-${this.config.searchUser || "unknown"}`;
    this.stream = new StreamWriter({
      outputDir: this.config.outputDir,
      filename: streamFilename,
      toolName: "pr-pickup-time",
      toolConfig: { ...this.config },
    });
    this.ctx.stream = this.stream;

    // Initialize analyzer
    this.analyzer = new PickupTimeAnalyzer(this.config);

    // SIGINT handler
    process.on("SIGINT", async () => {
      this.log("\nGracefully stopping...", "warn");
      this.cancelled.value = true;
      await this.savePartialResults();
      process.exit(0);
    });

    // Load external data if provided
    if (this.config.loadData) {
      this.loadExternalData();
    }

    this.log("PrPickupTime initialized");
  }

  async loadExternalData() {
    try {
      const raw = await fs.readFile(this.config.loadData, "utf8");
      this.LOAD_DATA = JSON.parse(raw);
      this.log(`External data loaded from ${this.config.loadData}`);
    } catch (error) {
      this.log(`Failed to load external data: ${error.message}`, "error");
      process.exit(1);
    }
  }

  async savePartialResults() {
    this.stream.finalize(false);
    if (this.data.pullRequests.length > 0) {
      this.log("Saving partial results...", "warn");
      await this.generateReport(this.data, {}, this.data.repositories);
    }
  }

  displayInitialization() {
    this.output(chalk.blue.bold("PR Pickup Time Analyzer"));

    const params = [
      ["Search user", this.config.searchUser],
      [
        "Date range",
        this.config.ignoreDateRange
          ? "All time"
          : `${this.config.start || "Auto"} to ${this.config.end || "Auto"}`,
      ],
      ["Organization", this.config.org || "All organizations"],
      ["Repositories", this.config.repo || "All repositories"],
      ["Output format", this.config.format.toUpperCase()],
      ["Output directory", this.config.outputDir],
      [
        "Review comments",
        this.config.includeReviewComments ? "Enabled" : "Disabled",
      ],
      [
        "Total records limit",
        this.config.totalRecords === 0
          ? "No limit"
          : String(this.config.totalRecords),
      ],
      ["API delay", `${this.config.delay}s`],
      ["Verbose mode", this.config.verbose ? "Enabled" : "Disabled"],
      ["Debug mode", this.config.debug ? "Enabled" : "Disabled"],
    ];

    const maxLabelLength = Math.max(...params.map(([label]) => label.length));

    params.forEach(([label, value]) => {
      const padding = "\u2500".repeat(maxLabelLength - label.length);
      this.output(`${label} ${padding} ${value}`);
    });

    this.output(
      chalk.blue.bold("\nStarting PR pickup time analysis...\n")
    );
  }

  performAnalysis(data) {
    this.output(chalk.blue.bold("Analysis Phase"));

    try {
      const analytics = this.analyzer.analyze(data.pullRequests, {
        log: this.log,
      });
      return analytics;
    } catch (error) {
      this.log(`Failed to analyze pickup time: ${error.message}`, "warn");
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async generateReport(data, analytics, repositories) {
    this.output(chalk.blue.bold("Report Generation"));

    await ensureDir(this.config.outputDir);

    const timestamp = new Date().toISOString().split("T")[0];
    const baseFilename =
      this.config.filename ||
      `pickup-time-${this.config.searchUser}-${timestamp}`;

    const report = buildReport(this.config, data, analytics, repositories, {
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
                return new URL(
                  `${this.baseUrl}${call.url.split(" ")[1]}`
                ).pathname;
              } catch {
                return call.url.split(" ")[1] || call.url;
              }
            })
          ),
        ].join(", ")
      )}`
    );

    this.output("");
    this.output(chalk.green.bold("PR Pickup Time analysis completed!"));

    this.output("");
    this.output(chalk.blue.bold("Final Report Summary"));
    this.output("\u2500".repeat(60));
    this.output(
      `Total Pull Requests    : ${chalk.green(report.summary.totalPRs)}`
    );
    this.output(
      `PRs With Pickup        : ${chalk.green(report.summary.prsWithPickup)}`
    );
    this.output(
      `PRs Without Pickup     : ${chalk.yellow(report.summary.prsWithoutPickup)}`
    );

    if (report.summary.avgPickupHours !== null) {
      this.output(
        `Avg Pickup Time        : ${chalk.green(report.summary.avgPickupHours + " hours")} (${report.summary.avgPickupDays} days)`
      );
    }
    if (report.summary.medianPickupHours !== null) {
      this.output(
        `Median Pickup Time     : ${chalk.green(report.summary.medianPickupHours + " hours")} (${report.summary.medianPickupDays} days)`
      );
    }
    if (report.summary.p90PickupHours !== null) {
      this.output(
        `P90 Pickup Time        : ${chalk.green(report.summary.p90PickupHours + " hours")}`
      );
    }

    // Distribution summary
    if (report.analytics?.distribution) {
      const dist = report.analytics.distribution;
      this.output("");
      this.output(chalk.blue.bold("Pickup Time Distribution"));
      this.output("\u2500".repeat(60));
      for (const [key, bucket] of Object.entries(dist)) {
        this.output(
          `${bucket.label.padEnd(10)} : ${chalk.green(bucket.count)} PRs (${bucket.percentage}%)`
        );
      }
    }

    // Top responders
    if (report.analytics?.byFirstResponder?.length > 0) {
      this.output("");
      this.output(chalk.blue.bold("Top First Responders"));
      this.output("\u2500".repeat(60));
      const topResponders = report.analytics.byFirstResponder.slice(0, 5);
      for (const r of topResponders) {
        this.output(
          `${chalk.green(r.responder.padEnd(20))} : ${r.reviewCount} reviews, avg ${r.avgPickupHours}h`
        );
      }
    }

    this.output("");
    this.output(
      `Records Fetched        : ${chalk.green(
        this.totalFetched.value
      )}${
        this.config.totalRecords > 0
          ? `/${this.config.totalRecords}`
          : ""
      }`
    );
    this.output(`Report Location        : ${chalk.green(outputPath)}`);
    this.output("\u2500".repeat(60));
  }

  async run() {
    try {
      this.displayInitialization();

      this.data = await fetchAllData(this.ctx);
      const analytics = this.performAnalysis(this.data);
      const { report, outputPath } = await this.generateReport(
        this.data,
        analytics,
        this.data.repositories
      );

      this.stream.finalize(true);
      await this.showRateLimit();
      this.displaySummary(report, outputPath);

      return { success: true, report, outputPath };
    } catch (error) {
      this.stream.finalize(false);
      try {
        await ensureDir(this.config.outputDir);
        const errFilename =
          this.config.filename ||
          `pickup-time-${this.config.searchUser}`;
        writeFileSync(
          path.join(
            this.config.outputDir,
            `dashboard-${errFilename}.errors.json`
          ),
          JSON.stringify({
            errors: [error.message],
            inputs: {
              ...this.config,
              userProfile: `https://${
                process.env.GITHUB_HOSTNAME || "github.com"
              }/${this.config.searchUser}?tab=overview`,
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
