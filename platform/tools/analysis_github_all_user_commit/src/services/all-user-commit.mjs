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
import { analyzeUserCommits } from "./analyze-user-commits.mjs";
import { buildReport } from "../reporting/report-builder.mjs";
import { writeJsonReport } from "../reporting/writers/json-writer.mjs";
import { writeCsvReport } from "../reporting/writers/csv-writer.mjs";

export class AllUserCommit {
  constructor(options) {
    this.config = normalizeConfig(options);

    // Mutable state
    this.commits = [];
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
    const { octokit, coreLimiter, searchLimiter, makeRequest, baseUrl } =
      createGitHubClient(this.config, {
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
      makeRequest: this.makeRequest,
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
      `all-user-commit-${this.config.searchUser || "unknown"}`;
    this.stream = new StreamWriter({
      outputDir: this.config.outputDir,
      filename: streamFilename,
      toolName: "all-user-commit",
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

    // Load external data if provided
    if (this.config.loadData) {
      this.loadExternalData();
    }

    this.log("AllUserCommit initialized");
  }

  async loadExternalData() {
    try {
      const data = await fs.readFile(this.config.loadData, "utf8");
      this.LOAD_DATA = JSON.parse(data);
      this.log(`External data loaded from ${this.config.loadData}`);
    } catch (error) {
      this.log(`Failed to load external data: ${error.message}`, "error");
      process.exit(1);
    }
  }

  async savePartialResults() {
    this.stream.finalize(false);
    if (this.commits.length > 0) {
      this.log("Saving partial results...", "warn");
      await this.generateReport();
    }
  }

  async generateReport() {
    this.output(chalk.blue.bold("Report Generation"));

    await ensureDir(this.config.outputDir);

    const filename =
      this.config.filename || `${this.config.searchUser}-commits`;
    const reportPath = path.join(
      this.config.outputDir,
      `${filename}.${this.config.format}`
    );

    const report = buildReport(this.commits, this.config, {
      totalFetched: this.totalFetched.value,
      cancelled: this.cancelled.value,
    });

    if (this.config.format === "json") {
      await writeJsonReport(report, reportPath);
    } else {
      await writeCsvReport(this.commits, reportPath);
    }

    this.output(`Report saved: ${chalk.green(reportPath)}`);

    if (this.config.debug) {
      const auditPath = path.join(
        this.config.outputDir,
        `${filename}.audit.json`
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

  async run() {
    try {
      this.output(
        chalk.blue.bold("Starting GitHub commit analysis...\n")
      );

      this.commits = await analyzeUserCommits(this);
      await this.generateReport();

      this.output("");
      this.output(chalk.blue.bold("GitHub API Usage Summary:"));
      this.output("\u2500".repeat(60));
      this.output(
        `Total API calls: ${chalk.green(this.apiCalls.length)}`
      );
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

      this.stream.finalize(true);
      await this.showRateLimit();

      this.output("");
      this.output(chalk.green.bold("Analysis completed successfully!"));

      this.output("");
      this.output(chalk.blue.bold("Final Report Summary"));
      this.output("\u2500".repeat(60));
      this.output(
        `User          : ${chalk.green(this.config.searchUser)}`
      );
      this.output(
        `Date Range     : ${chalk.green(
          this.config.start || "N/A"
        )}/${chalk.green(this.config.end || "N/A")}`
      );
      this.output(
        `Total Commits          : ${chalk.green(this.commits.length)}`
      );
      this.output(
        `Direct Commits         : ${chalk.green(
          this.commits.filter((c) => c.type === "direct").length
        )}`
      );
      this.output(
        `Pull Request Commits   : ${chalk.green(
          this.commits.filter((c) => c.type === "pull_request").length
        )}`
      );
      this.output(
        `Repositories Analyzed  : ${chalk.green(
          new Set(this.commits.map((c) => c.repository)).size
        )}`
      );

      const totalAdditions = this.commits.reduce(
        (sum, c) => sum + (c.stats?.additions || 0),
        0
      );
      const totalDeletions = this.commits.reduce(
        (sum, c) => sum + (c.stats?.deletions || 0),
        0
      );
      const totalFilesChanged = this.commits.reduce(
        (sum, c) => sum + (c.files?.length || 0),
        0
      );

      this.output(
        `Total Additions        : ${chalk.green(totalAdditions)}`
      );
      this.output(
        `Total Deletions        : ${chalk.green(totalDeletions)}`
      );
      this.output(
        `Files Changed          : ${chalk.green(totalFilesChanged)}`
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
      this.output(
        `Report Location        : ${chalk.green(
          path.join(
            this.config.outputDir,
            `${
              this.config.filename || this.config.searchUser + "-commits"
            }.${this.config.format}`
          )
        )}`
      );
      this.output("\u2500".repeat(60));
    } catch (error) {
      this.stream.finalize(false);
      try {
        await ensureDir(this.config.outputDir);
        const errFilename =
          this.config.filename || `${this.config.searchUser}-commits`;
        writeFileSync(
          path.join(
            this.config.outputDir,
            `dashboard-${errFilename}.errors.json`
          ),
          JSON.stringify({
            errors: [error.message],
            inputs: {
              ...this.config,
              userProfile: `https://${process.env.GITHUB_HOSTNAME}/${this.config.searchUser}?tab=overview`,
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
