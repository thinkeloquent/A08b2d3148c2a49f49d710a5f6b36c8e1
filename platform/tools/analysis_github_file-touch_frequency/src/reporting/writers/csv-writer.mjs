import fs from "fs/promises";

/**
 * Write CSV report files — 5 CSV files for file touch frequency analysis.
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

  // 2. File Metrics CSV (all files with frequency)
  if (report.fileMetrics && report.fileMetrics.length > 0) {
    const filesPath = outputPath.replace(".csv", "-file-metrics.csv");
    const headers = [
      "filePath",
      "commitCount",
      "frequency",
      "isHotspot",
      "frequencyTier",
      "directory",
      "repositories",
    ];
    let csv = headers.join(",") + "\n";
    report.fileMetrics.forEach((entry) => {
      const values = headers.map((h) => {
        if (h === "repositories") {
          return formatCsvValue((entry[h] || []).join("; "));
        }
        return formatCsvValue(entry[h]);
      });
      csv += values.join(",") + "\n";
    });
    await fs.writeFile(filesPath, csv, "utf8");
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

  // 5. Directory breakdown CSV
  if (report.analytics?.directoryBreakdown?.length > 0) {
    const dirPath = outputPath.replace(".csv", "-directory-breakdown.csv");
    const dirs = report.analytics.directoryBreakdown;
    const dirHeaders = Object.keys(dirs[0]);
    let csv = dirHeaders.join(",") + "\n";
    dirs.forEach((entry) => {
      const values = dirHeaders.map((h) => formatCsvValue(entry[h]));
      csv += values.join(",") + "\n";
    });
    await fs.writeFile(dirPath, csv, "utf8");
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
