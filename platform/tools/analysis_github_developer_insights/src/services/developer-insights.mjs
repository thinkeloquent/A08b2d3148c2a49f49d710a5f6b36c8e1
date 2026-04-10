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
import { writeHtmlReport } from "../reporting/writers/html-writer.mjs";
import { PRThroughputAnalyzer } from "../analysis/pr-throughput.mjs";
import { CodeChurnAnalyzer } from "../analysis/code-churn.mjs";
import { WorkPatternsAnalyzer } from "../analysis/work-patterns.mjs";
import { PRCycleTimeAnalyzer } from "../analysis/pr-cycle-time.mjs";

export class DeveloperInsights {
  constructor(options) {
    this.config = normalizeConfig(options);

    // Mutable state
    this.data = { pullRequests: [], commits: [], repositories: [] };
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
      makeGraphQLRequest,
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
      makeGraphQLRequest,
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
      `developer-insights-${this.config.searchUser || "unknown"}`;
    this.stream = new StreamWriter({
      outputDir: this.config.outputDir,
      filename: streamFilename,
      toolName: "developer-insights",
      toolConfig: { ...this.config },
    });
    this.ctx.stream = this.stream;

    // Initialize analyzers
    this.analyzers = {
      prThroughput: new PRThroughputAnalyzer(this.config),
      codeChurn: new CodeChurnAnalyzer(this.config),
      workPatterns: new WorkPatternsAnalyzer(this.config),
      prCycleTime: new PRCycleTimeAnalyzer(this.config),
    };

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

    this.log("DeveloperInsights initialized");
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
    if (
      this.data.pullRequests.length > 0 ||
      this.data.commits.length > 0
    ) {
      this.log("Saving partial results...", "warn");
      await this.generateReport(this.data, {}, this.data.repositories);
    }
  }

  displayInitialization() {
    this.output(chalk.blue.bold("Initialization"));

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
      chalk.blue.bold("\nStarting GitHub developer insights analysis...\n")
    );
  }

  performAnalysis(data) {
    this.output(chalk.blue.bold("Analysis Phase"));

    const { pullRequests, commits } = data;
    const enabledModules = this.config.modules.split(",").map((m) => m.trim());
    const analytics = {};

    for (const moduleName of enabledModules) {
      if (this.analyzers[moduleName]) {
        this.log(`Analyzing ${moduleName}...`);

        try {
          switch (moduleName) {
            case "prThroughput":
              analytics[moduleName] = this.analyzers[moduleName].analyze(
                pullRequests,
                { log: this.log }
              );
              break;
            case "prCycleTime":
              analytics[moduleName] = this.analyzers[moduleName].analyze(
                pullRequests,
                { log: this.log }
              );
              break;
            case "codeChurn":
              analytics[moduleName] = this.analyzers[moduleName].analyze(
                commits,
                pullRequests
              );
              break;
            case "workPatterns":
              analytics[moduleName] = this.analyzers[moduleName].analyze(
                commits,
                pullRequests,
                { log: this.log }
              );
              break;
            default:
              analytics[moduleName] = this.analyzers[moduleName].analyze(
                commits,
                pullRequests
              );
          }
        } catch (error) {
          this.log(`Failed to analyze ${moduleName}: ${error.message}`, "warn");
          analytics[moduleName] = {
            error: error.message,
            timestamp: new Date().toISOString(),
          };
        }
      }
    }

    return analytics;
  }

  async generateReport(data, analytics, repositories) {
    this.output(chalk.blue.bold("Report Generation"));

    await ensureDir(this.config.outputDir);

    const timestamp = new Date().toISOString().split("T")[0];
    const baseFilename =
      this.config.filename ||
      `developer-insights-${this.config.searchUser}-${timestamp}`;

    const report = buildReport(this.config, data, analytics, repositories, {
      totalFetched: this.totalFetched.value,
      cancelled: this.cancelled.value,
    });

    let outputPath;
    switch (this.config.format) {
      case "json":
        outputPath = path.join(this.config.outputDir, `${baseFilename}.json`);
        await writeJsonReport(report, outputPath);
        break;
      case "csv":
        outputPath = path.join(this.config.outputDir, `${baseFilename}.csv`);
        await writeCsvReport(report, outputPath);
        break;
      case "html":
        outputPath = path.join(this.config.outputDir, `${baseFilename}.html`);
        await writeHtmlReport(report, outputPath);
        break;
      case "database": {
        const { writeDatabaseReport } = await import(
          "../reporting/writers/database-writer.mjs"
        );
        const reportId = await writeDatabaseReport(report, this.config);
        this.output(`Report saved to database with ID: ${chalk.green(reportId)}`);
        return { report, outputPath: "database" };
      }
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
    this.output(chalk.green.bold("Analysis completed successfully!"));

    this.output("");
    this.output(chalk.blue.bold("Final Report Summary"));
    this.output("\u2500".repeat(60));
    this.output(
      `Total Pull Requests    : ${chalk.green(report.summary.totalPRsCreated)}`
    );
    this.output(
      `Repositories Analyzed  : ${chalk.green(
        report.metadata.repositoriesAnalyzed.length
      )}`
    );
    this.output(
      `Total Commits          : ${chalk.green(report.summary.totalCommits)}`
    );
    this.output(
      `Total Additions        : ${chalk.green(report.summary.linesAdded)}`
    );
    this.output(
      `Total Deletions        : ${chalk.green(report.summary.linesDeleted)}`
    );
    this.output(
      `Records Fetched        : ${chalk.green(
        this.totalFetched.value
      )}${
        this.config.totalRecords > 0
          ? `/${this.config.totalRecords}`
          : ""
      }`
    );
    if (outputPath !== "database") {
      this.output(`Report Location        : ${chalk.green(outputPath)}`);
    }
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
          `developer-insights-${this.config.searchUser}`;
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
