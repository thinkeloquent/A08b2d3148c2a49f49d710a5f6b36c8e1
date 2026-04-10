import fs from "fs/promises";

/**
 * Write CSV report files — 5 CSV files for commit atomicity analysis.
 * @param {object} report - Full report object
 * @param {string} outputPath - Base path for CSV files
 */
export async function writeCsvReport(report, outputPath) {
  // 1. Summary CSV
  const summaryPath = outputPath.replace(".csv", "-summary.csv");
  const summary = report.summary;
  if (summary && Object.keys(summary).length > 0) {
    const summaryHeaders = Object.keys(summary);
    const summaryValues = Object.values(summary).map(formatCsvValue);
    await fs.writeFile(
      summaryPath,
      summaryHeaders.join(",") + "\n" + summaryValues.join(",") + "\n",
      "utf8"
    );
  }

  // 2. Commit Metrics CSV
  if (report.commitMetrics && report.commitMetrics.length > 0) {
    const commitsPath = outputPath.replace(".csv", "-commit-metrics.csv");
    const headers = [
      "sha",
      "message",
      "repository",
      "date",
      "additions",
      "deletions",
      "totalLines",
      "filesChanged",
      "isAtomic",
      "sizeBucket",
      "html_url",
    ];
    let csv = headers.join(",") + "\n";
    report.commitMetrics.forEach((entry) => {
      const values = headers.map((h) => formatCsvValue(entry[h]));
      csv += values.join(",") + "\n";
    });
    await fs.writeFile(commitsPath, csv, "utf8");
  }

  // 3. Weekly trends CSV
  if (report.analytics?.weeklyTrends?.length > 0) {
    const trendPath = outputPath.replace(".csv", "-weekly-trends.csv");
    const trends = report.analytics.weeklyTrends;
    const trendHeaders = Object.keys(trends[0]);
    let csv = trendHeaders.join(",") + "\n";
    trends.forEach((entry) => {
      const values = trendHeaders.map((h) => formatCsvValue(entry[h]));
      csv += values.join(",") + "\n";
    });
    await fs.writeFile(trendPath, csv, "utf8");
  }

  // 4. Repository breakdown CSV
  if (report.analytics?.repositoryBreakdown?.length > 0) {
    const repoPath = outputPath.replace(".csv", "-repo-breakdown.csv");
    const repos = report.analytics.repositoryBreakdown;
    const repoHeaders = Object.keys(repos[0]);
    let csv = repoHeaders.join(",") + "\n";
    repos.forEach((entry) => {
      const values = repoHeaders.map((h) => formatCsvValue(entry[h]));
      csv += values.join(",") + "\n";
    });
    await fs.writeFile(repoPath, csv, "utf8");
  }

  // 5. Largest commits CSV
  if (report.analytics?.largestCommits?.length > 0) {
    const largestPath = outputPath.replace(".csv", "-largest-commits.csv");
    const largestCommits = report.analytics.largestCommits;
    const largestHeaders = Object.keys(largestCommits[0]);
    let csv = largestHeaders.join(",") + "\n";
    largestCommits.forEach((entry) => {
      const values = largestHeaders.map((h) => formatCsvValue(entry[h]));
      csv += values.join(",") + "\n";
    });
    await fs.writeFile(largestPath, csv, "utf8");
  }
}

/**
 * Format a value for CSV output.
 */
function formatCsvValue(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return JSON.stringify(val);
  if (typeof val === "boolean") return val ? "true" : "false";
  return val;
}
