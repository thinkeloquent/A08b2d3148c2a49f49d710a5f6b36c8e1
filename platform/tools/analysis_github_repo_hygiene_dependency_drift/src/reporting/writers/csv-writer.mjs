import fs from "fs/promises";

/**
 * Write CSV report files — summary, dependency details, and per-repository breakdown.
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

  // Generate detailed dependency CSV
  if (report.analytics?.mostOutdated?.length > 0) {
    const detailPath = outputPath.replace(".csv", "-dependencies.csv");
    const details = report.analytics.mostOutdated;
    const headers = [
      "name",
      "ecosystem",
      "repository",
      "currentVersion",
      "latestVersion",
      "majorVersionsBehind",
      "minorVersionsBehind",
      "patchVersionsBehind",
      "severity",
      "driftDays",
    ];

    let detailCsv = headers.join(",") + "\n";
    details.forEach((entry) => {
      const values = [
        JSON.stringify(entry.name),
        entry.ecosystem,
        JSON.stringify(entry.repository),
        entry.currentVersion,
        entry.latestVersion || "",
        entry.versionsBehind?.major ?? "",
        entry.versionsBehind?.minor ?? "",
        entry.versionsBehind?.patch ?? "",
        entry.severity,
        entry.driftDays ?? "",
      ];
      detailCsv += values.join(",") + "\n";
    });
    await fs.writeFile(detailPath, detailCsv, "utf8");
  }

  // Generate per-repository CSV
  if (report.analytics?.byRepository?.length > 0) {
    const repoPath = outputPath.replace(".csv", "-repositories.csv");
    const repos = report.analytics.byRepository;
    const headers = [
      "repository",
      "filePath",
      "ecosystem",
      "lastCommitDate",
      "totalDependencies",
      "outdatedCount",
      "criticalCount",
      "majorCount",
      "driftScore",
    ];

    let repoCsv = headers.join(",") + "\n";
    repos.forEach((entry) => {
      const values = headers.map((h) => {
        const val = entry[h];
        if (val === null || val === undefined) return "";
        if (typeof val === "string") return JSON.stringify(val);
        return val;
      });
      repoCsv += values.join(",") + "\n";
    });
    await fs.writeFile(repoPath, repoCsv, "utf8");
  }

  // Generate stale manifests CSV
  if (report.analytics?.staleManifests?.length > 0) {
    const stalePath = outputPath.replace(".csv", "-stale-manifests.csv");
    const stale = report.analytics.staleManifests;
    const headers = [
      "repository",
      "filePath",
      "ecosystem",
      "lastCommitDate",
      "daysSinceUpdate",
      "totalDependencies",
    ];

    let staleCsv = headers.join(",") + "\n";
    stale.forEach((entry) => {
      const values = headers.map((h) => {
        const val = entry[h];
        if (val === null || val === undefined) return "";
        if (typeof val === "string") return JSON.stringify(val);
        return val;
      });
      staleCsv += values.join(",") + "\n";
    });
    await fs.writeFile(stalePath, staleCsv, "utf8");
  }
}
