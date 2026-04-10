import fs from "fs/promises";

/**
 * Write CSV report files — 5 CSV files for context switching analysis.
 * @param {object} report - Full report object
 * @param {string} outputPath - Base path for CSV files
 */
export async function writeCsvReport(report, outputPath) {
  // 1. Summary CSV
  const summaryPath = outputPath.replace(".csv", "-summary.csv");
  const summary = report.summary;
  if (summary && Object.keys(summary).length > 0) {
    const flatSummary = {
      ...summary,
      longestFocusSession_repository: summary.longestFocusSession?.repository || "",
      longestFocusSession_activities: summary.longestFocusSession?.activities || "",
      longestFocusSession_durationHours: summary.longestFocusSession?.durationHours || "",
    };
    delete flatSummary.longestFocusSession;

    const summaryHeaders = Object.keys(flatSummary);
    const summaryValues = Object.values(flatSummary).map(formatCsvValue);
    await fs.writeFile(
      summaryPath,
      summaryHeaders.join(",") + "\n" + summaryValues.join(",") + "\n",
      "utf8"
    );
  }

  // 2. Activities CSV
  if (report.activities && report.activities.length > 0) {
    const activitiesPath = outputPath.replace(".csv", "-activities.csv");
    const headers = ["timestamp", "repository", "type", "reference", "url", "title"];
    let csv = headers.join(",") + "\n";
    report.activities.forEach((entry) => {
      const values = headers.map((h) => formatCsvValue(entry[h]));
      csv += values.join(",") + "\n";
    });
    await fs.writeFile(activitiesPath, csv, "utf8");
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

  // 4. Repository metrics CSV
  if (report.analytics?.repositoryMetrics?.length > 0) {
    const repoPath = outputPath.replace(".csv", "-repo-metrics.csv");
    const repos = report.analytics.repositoryMetrics;
    const repoHeaders = Object.keys(repos[0]);
    let csv = repoHeaders.join(",") + "\n";
    repos.forEach((entry) => {
      const values = repoHeaders.map((h) => formatCsvValue(entry[h]));
      csv += values.join(",") + "\n";
    });
    await fs.writeFile(repoPath, csv, "utf8");
  }

  // 5. Repo pair switches CSV
  if (report.analytics?.repoPairSwitches?.length > 0) {
    const pairPath = outputPath.replace(".csv", "-repo-pairs.csv");
    const pairs = report.analytics.repoPairSwitches;
    const pairHeaders = ["from", "to", "count"];
    let csv = pairHeaders.join(",") + "\n";
    pairs.forEach((entry) => {
      const values = pairHeaders.map((h) => formatCsvValue(entry[h]));
      csv += values.join(",") + "\n";
    });
    await fs.writeFile(pairPath, csv, "utf8");
  }
}

/**
 * Format a value for CSV output.
 */
function formatCsvValue(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return JSON.stringify(val);
  return val;
}
