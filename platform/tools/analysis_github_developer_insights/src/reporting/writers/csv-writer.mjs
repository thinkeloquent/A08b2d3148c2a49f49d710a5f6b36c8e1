import fs from "fs/promises";

/**
 * Write CSV report files — summary, PR details, and commit details.
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

  // Generate detailed CSV for PRs
  if (report.analytics.prThroughput?.details) {
    const prPath = outputPath.replace(".csv", "-pull-requests.csv");
    const prDetails = report.analytics.prThroughput.details;
    if (prDetails.length > 0) {
      const headers = Object.keys(prDetails[0]);
      let prCsv = headers.join(",") + "\n";
      prDetails.forEach((pr) => {
        const values = headers.map((h) => JSON.stringify(pr[h] || ""));
        prCsv += values.join(",") + "\n";
      });
      await fs.writeFile(prPath, prCsv, "utf8");
    }
  }

  // Generate detailed CSV for commits
  if (report.analytics.codeChurn?.details) {
    const commitPath = outputPath.replace(".csv", "-commits.csv");
    const commitDetails = report.analytics.codeChurn.details;
    if (commitDetails.length > 0) {
      const headers = [
        "sha",
        "message",
        "author_name",
        "author_email",
        "date",
        "repository",
        "additions",
        "deletions",
        "total",
      ];
      let commitCsv = headers.join(",") + "\n";
      commitDetails.forEach((commit) => {
        const values = [
          JSON.stringify(commit.sha),
          JSON.stringify(commit.message),
          JSON.stringify(commit.author.name),
          JSON.stringify(commit.author.email),
          JSON.stringify(commit.author.date),
          JSON.stringify(commit.repository),
          commit.stats.additions,
          commit.stats.deletions,
          commit.stats.total,
        ];
        commitCsv += values.join(",") + "\n";
      });
      await fs.writeFile(commitPath, commitCsv, "utf8");
    }
  }
}
