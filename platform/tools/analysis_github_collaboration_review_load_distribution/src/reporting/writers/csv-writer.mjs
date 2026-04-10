import fs from "fs/promises";

/**
 * Write CSV report files — summary and reviewer details.
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

  // Generate detailed CSV for reviewer load entries
  if (report.analytics?.details) {
    const detailPath = outputPath.replace(".csv", "-details.csv");
    const details = report.analytics.details;
    if (details.length > 0) {
      const headers = [
        "reviewer",
        "totalReviews",
        "approvals",
        "changesRequested",
        "comments",
        "dismissed",
        "uniquePRsReviewed",
        "uniqueReposReviewed",
        "repositories",
        "avgReviewsPerDay",
        "firstReviewDate",
        "lastReviewDate",
        "shareOfTotalReviews",
      ];
      let detailCsv = headers.join(",") + "\n";
      details.forEach((entry) => {
        const values = headers.map((h) => {
          const val = entry[h];
          if (val === null || val === undefined) return "";
          if (Array.isArray(val)) return JSON.stringify(val.join(";"));
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

  // Generate by-repository CSV
  if (report.analytics?.byRepository?.length > 0) {
    const repoPath = outputPath.replace(".csv", "-by-repository.csv");
    const repos = report.analytics.byRepository;
    const repoHeaders = [
      "repository",
      "totalPRs",
      "totalReviews",
      "uniqueReviewers",
      "avgReviewsPerPR",
    ];
    let repoCsv = repoHeaders.join(",") + "\n";
    repos.forEach((entry) => {
      const values = repoHeaders.map((h) => {
        const val = entry[h];
        if (val === null || val === undefined) return "";
        if (typeof val === "string") return JSON.stringify(val);
        return val;
      });
      repoCsv += values.join(",") + "\n";
    });
    await fs.writeFile(repoPath, repoCsv, "utf8");
  }

  // Generate knowledge silos CSV
  if (report.analytics?.knowledgeSilos?.length > 0) {
    const siloPath = outputPath.replace(".csv", "-knowledge-silos.csv");
    const silos = report.analytics.knowledgeSilos;
    const siloHeaders = [
      "repository",
      "reviewers",
      "totalReviews",
      "risk",
      "description",
    ];
    let siloCsv = siloHeaders.join(",") + "\n";
    silos.forEach((entry) => {
      const values = siloHeaders.map((h) => {
        const val = entry[h];
        if (val === null || val === undefined) return "";
        if (Array.isArray(val)) return JSON.stringify(val.join(";"));
        if (typeof val === "string") return JSON.stringify(val);
        return val;
      });
      siloCsv += values.join(",") + "\n";
    });
    await fs.writeFile(siloPath, siloCsv, "utf8");
  }
}
