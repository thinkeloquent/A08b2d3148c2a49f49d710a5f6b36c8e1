import fs from "fs/promises";

/**
 * Write CSV report files — summary, pickup time details, weekly trend,
 * by-responder, and distribution.
 * @param {object} report - Full report object
 * @param {string} outputPath - Base path for CSV files
 */
export async function writeCsvReport(report, outputPath) {
  // Generate summary CSV
  const summaryPath = outputPath.replace(".csv", "-summary.csv");
  const summary = report.summary;
  const summaryHeaders = Object.keys(summary);
  const summaryValues = Object.values(summary).map((v) =>
    v === null ? "" : v
  );

  let csv = summaryHeaders.join(",") + "\n" + summaryValues.join(",") + "\n";
  await fs.writeFile(summaryPath, csv, "utf8");

  // Generate detailed CSV for pickup time entries
  if (report.analytics?.details) {
    const detailPath = outputPath.replace(".csv", "-details.csv");
    const details = report.analytics.details;
    if (details.length > 0) {
      const headers = [
        "number",
        "title",
        "repository",
        "author",
        "state",
        "created_at",
        "first_response_at",
        "first_responder",
        "first_response_type",
        "pickup_time_hours",
        "pickup_time_days",
        "merged_at",
        "html_url",
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

  // Generate by-responder CSV
  if (report.analytics?.byFirstResponder?.length > 0) {
    const responderPath = outputPath.replace(".csv", "-by-responder.csv");
    const responders = report.analytics.byFirstResponder;
    const responderHeaders = [
      "responder",
      "reviewCount",
      "avgPickupHours",
      "medianPickupHours",
      "reviews",
      "comments",
      "review_comments",
    ];
    let responderCsv = responderHeaders.join(",") + "\n";
    responders.forEach((entry) => {
      const values = [
        JSON.stringify(entry.responder),
        entry.reviewCount,
        entry.avgPickupHours === null ? "" : entry.avgPickupHours,
        entry.medianPickupHours === null ? "" : entry.medianPickupHours,
        entry.responseTypes?.review || 0,
        entry.responseTypes?.comment || 0,
        entry.responseTypes?.review_comment || 0,
      ];
      responderCsv += values.join(",") + "\n";
    });
    await fs.writeFile(responderPath, responderCsv, "utf8");
  }

  // Generate distribution CSV
  if (report.analytics?.distribution) {
    const distPath = outputPath.replace(".csv", "-distribution.csv");
    const dist = report.analytics.distribution;
    const distHeaders = ["bucket", "label", "count", "percentage"];
    let distCsv = distHeaders.join(",") + "\n";
    for (const [bucket, data] of Object.entries(dist)) {
      distCsv += `${JSON.stringify(bucket)},${JSON.stringify(data.label)},${data.count},${data.percentage}\n`;
    }
    await fs.writeFile(distPath, distCsv, "utf8");
  }
}
