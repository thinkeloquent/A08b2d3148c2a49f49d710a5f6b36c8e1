import fs from "fs/promises";

/**
 * Write CSV report files — summary and PR cycle time details.
 * @param {object} report - Full report object
 * @param {string} outputPath - Base path for CSV files
 */
export async function writeCsvReport(report, outputPath) {
  // Generate summary CSV
  const summaryPath = outputPath.replace(".csv", "-summary.csv");
  const summary = report.summary;
  const summaryHeaders = Object.keys(summary);
  const summaryValues = Object.values(summary);

  let csv = summaryHeaders.join(",") + "\n" + summaryValues.join(",") + "\n";
  await fs.writeFile(summaryPath, csv, "utf8");

  // Generate detailed CSV for PR cycle times
  if (report.analytics?.details) {
    const detailPath = outputPath.replace(".csv", "-details.csv");
    const details = report.analytics.details;
    if (details.length > 0) {
      const headers = [
        "number",
        "title",
        "repository",
        "status",
        "created_at",
        "merged_at",
        "closed_at",
        "first_commit_at",
        "cycle_time_days",
        "pr_open_to_merge_days",
        "first_commit_to_merge_days",
        "additions",
        "deletions",
        "changed_files",
        "total_commits",
      ];
      let detailCsv = headers.join(",") + "\n";
      details.forEach((entry) => {
        const values = headers.map((h) => {
          const val = entry[h];
          if (val === null || val === undefined) return "";
          if (typeof val === "string") return JSON.stringify(val);
          return val;
        });
        detailCsv += values.join(",") + "\n";
      });
      await fs.writeFile(detailPath, detailCsv, "utf8");
    }
  }

  // Generate weekly trend CSV
  if (report.analytics?.weeklyTrend?.length > 0) {
    const trendPath = outputPath.replace(".csv", "-weekly-trend.csv");
    const trend = report.analytics.weeklyTrend;
    const trendHeaders = Object.keys(trend[0]);
    let trendCsv = trendHeaders.join(",") + "\n";
    trend.forEach((entry) => {
      const values = trendHeaders.map((h) => {
        const val = entry[h];
        if (val === null || val === undefined) return "";
        if (typeof val === "string") return JSON.stringify(val);
        return val;
      });
      trendCsv += values.join(",") + "\n";
    });
    await fs.writeFile(trendPath, trendCsv, "utf8");
  }
}
