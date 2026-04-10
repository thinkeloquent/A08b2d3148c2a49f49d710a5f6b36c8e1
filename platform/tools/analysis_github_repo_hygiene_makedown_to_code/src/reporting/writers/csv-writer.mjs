import fs from "fs/promises";

/**
 * Write CSV report files — 5 CSV files for markdown-to-code analysis.
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
      commitType_docOnly: summary.commitTypeDistribution?.docOnly || 0,
      commitType_docOnlyPercent: summary.commitTypeDistribution?.docOnlyPercent || 0,
      commitType_codeOnly: summary.commitTypeDistribution?.codeOnly || 0,
      commitType_codeOnlyPercent: summary.commitTypeDistribution?.codeOnlyPercent || 0,
      commitType_mixed: summary.commitTypeDistribution?.mixed || 0,
      commitType_mixedPercent: summary.commitTypeDistribution?.mixedPercent || 0,
      commitType_otherOnly: summary.commitTypeDistribution?.otherOnly || 0,
      commitType_otherOnlyPercent: summary.commitTypeDistribution?.otherOnlyPercent || 0,
    };
    delete flatSummary.commitTypeDistribution;

    const summaryHeaders = Object.keys(flatSummary);
    const summaryValues = Object.values(flatSummary).map(formatCsvValue);
    await fs.writeFile(
      summaryPath,
      summaryHeaders.join(",") + "\n" + summaryValues.join(",") + "\n",
      "utf8"
    );
  }

  // 2. Commit classifications CSV
  if (report.commitClassifications && report.commitClassifications.length > 0) {
    const commitsPath = outputPath.replace(".csv", "-commits.csv");
    const headers = [
      "sha", "timestamp", "repository", "message", "type",
      "docFiles", "codeFiles",
      "docAdditions", "docDeletions",
      "codeAdditions", "codeDeletions",
    ];
    let csv = headers.join(",") + "\n";
    report.commitClassifications.forEach((entry) => {
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

  // 5. File classifications CSV (currentFiles mode)
  if (report.fileClassifications && report.fileClassifications.length > 0) {
    const filesPath = outputPath.replace(".csv", "-file-classifications.csv");
    const headers = [
      "path", "repository", "branch", "category", "size",
      "dirCoverageClassification", "hasNearbyDocs",
    ];
    let csv = headers.join(",") + "\n";
    report.fileClassifications.forEach((entry) => {
      const values = headers.map((h) => formatCsvValue(entry[h]));
      csv += values.join(",") + "\n";
    });
    await fs.writeFile(filesPath, csv, "utf8");
  }

  // 6. Undocumented repos CSV
  if (report.analytics?.undocumentedRepos?.length > 0) {
    const undocPath = outputPath.replace(".csv", "-undocumented-repos.csv");
    const repos = report.analytics.undocumentedRepos;
    const undocHeaders = Object.keys(repos[0]);
    let csv = undocHeaders.join(",") + "\n";
    repos.forEach((entry) => {
      const values = undocHeaders.map((h) => formatCsvValue(entry[h]));
      csv += values.join(",") + "\n";
    });
    await fs.writeFile(undocPath, csv, "utf8");
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
