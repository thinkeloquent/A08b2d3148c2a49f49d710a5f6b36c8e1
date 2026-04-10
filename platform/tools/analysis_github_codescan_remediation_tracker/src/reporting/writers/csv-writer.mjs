import fs from "fs/promises";
import path from "path";

/**
 * Write CSV report files — 4 CSV files for codescan remediation analysis.
 * @param {object} report - Full report object
 * @param {string} outputPath - Base path for CSV files (used to derive sibling files)
 */
export async function writeCsvReport(report, outputPath) {
  const base = outputPath.replace(/\.csv$/i, "");

  // 1. Rule breakdown CSV
  if (report.analytics?.ruleBreakdown?.length > 0) {
    const ruleBreakdownPath = `${base}-rule-breakdown.csv`;
    const headers = ["ruleId", "description", "severity", "openCount", "fixedCount", "fixRate"];
    let csv = headers.join(",") + "\n";
    for (const entry of report.analytics.ruleBreakdown) {
      const values = headers.map((h) => formatCsvValue(entry[h]));
      csv += values.join(",") + "\n";
    }
    await fs.writeFile(ruleBreakdownPath, csv, "utf8");
  }

  // 2. File heatmap CSV
  if (report.analytics?.fileHeatmap?.length > 0) {
    const heatmapPath = `${base}-file-heatmap.csv`;
    const headers = ["filePath", "alertCount", "hotspotScore", "topRules"];
    let csv = headers.join(",") + "\n";
    for (const entry of report.analytics.fileHeatmap) {
      const values = headers.map((h) => formatCsvValue(entry[h]));
      csv += values.join(",") + "\n";
    }
    await fs.writeFile(heatmapPath, csv, "utf8");
  }

  // 3. Weekly velocity CSV
  const weeklyData = report.analytics?.velocity?.weeklyData;
  if (weeklyData?.length > 0) {
    const velocityPath = `${base}-weekly-velocity.csv`;
    const headers = ["week", "fixedCount", "openedCount", "netChange", "cumulativeOpen"];
    let csv = headers.join(",") + "\n";
    for (const entry of weeklyData) {
      const values = headers.map((h) => formatCsvValue(entry[h]));
      csv += values.join(",") + "\n";
    }
    await fs.writeFile(velocityPath, csv, "utf8");
  }

  // 4. Summary CSV (single-row summary metrics)
  if (report.summary && Object.keys(report.summary).length > 0) {
    const summaryPath = `${base}-summary.csv`;
    const summaryHeaders = Object.keys(report.summary);
    const summaryValues = Object.values(report.summary).map(formatCsvValue);
    await fs.writeFile(
      summaryPath,
      summaryHeaders.join(",") + "\n" + summaryValues.join(",") + "\n",
      "utf8"
    );
  }
}

/**
 * Format a value for CSV output.
 */
function formatCsvValue(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return JSON.stringify(val);
  if (typeof val === "object") return JSON.stringify(JSON.stringify(val));
  return val;
}
