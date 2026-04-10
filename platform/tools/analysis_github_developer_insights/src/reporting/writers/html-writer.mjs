import fs from "fs/promises";

/**
 * Write an HTML report to disk with styled dashboard.
 * @param {object} report - Full report object
 * @param {string} outputPath
 */
export async function writeHtmlReport(report, outputPath) {
  const data = report;

  const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Developer Insights Report - ${data.metadata.searchUser}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header p { margin: 5px 0; opacity: 0.9; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .metric { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border-radius: 10px; padding: 25px; text-align: center; }
        .metric-value { font-size: 2.5em; font-weight: bold; margin-bottom: 10px; }
        .metric-label { font-size: 1.1em; opacity: 0.9; }
        .section { margin-bottom: 40px; }
        .section h2 { color: #333; border-bottom: 3px solid #667eea; padding-bottom: 10px; margin-bottom: 20px; }
        .analytics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        .analytics-card { background: #f8f9fa; padding: 25px; border-radius: 10px; border-left: 5px solid #667eea; }
        .analytics-card h3 { margin-top: 0; color: #667eea; }
        .stat { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .stat:last-child { border-bottom: none; }
        .stat-label { font-weight: bold; color: #555; }
        .stat-value { color: #667eea; font-weight: bold; }
        .repository-list { background: #f8f9fa; padding: 20px; border-radius: 10px; }
        .repository-list ul { list-style: none; padding: 0; margin: 0; }
        .repository-list li { background: white; margin: 5px 0; padding: 10px; border-radius: 5px; border-left: 3px solid #667eea; }
        .footer { text-align: center; margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 10px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Developer Insights Report</h1>
            <p><strong>Developer:</strong> ${data.metadata.searchUser}</p>
            ${
              data.metadata.dateRange
                ? `<p><strong>Analysis Period:</strong> ${data.metadata.dateRange.start} to ${data.metadata.dateRange.end}</p>`
                : "<p><strong>Analysis Period:</strong> All Time</p>"
            }
            <p><strong>Generated:</strong> ${new Date(
              data.metadata.generatedAt
            ).toLocaleDateString()}</p>
            <p><strong>Report Version:</strong> ${data.metadata.reportVersion}</p>
        </div>

        <div class="summary">
            <div class="metric">
                <div class="metric-value">${data.summary.totalContributions}</div>
                <div class="metric-label">Total Contributions</div>
            </div>
            <div class="metric">
                <div class="metric-value">${data.summary.totalCommits}</div>
                <div class="metric-label">Commits</div>
            </div>
            <div class="metric">
                <div class="metric-value">${data.summary.totalPRsCreated}</div>
                <div class="metric-label">Pull Requests</div>
            </div>
            <div class="metric">
                <div class="metric-value">${data.summary.linesAdded}</div>
                <div class="metric-label">Lines Added</div>
            </div>
        </div>

        <div class="section">
            <h2>Detailed Analytics</h2>
            <div class="analytics-grid">
                ${
                  data.analytics.prThroughput
                    ? `
                <div class="analytics-card">
                    <h3>Pull Request Throughput</h3>
                    <div class="stat">
                        <span class="stat-label">Total PRs:</span>
                        <span class="stat-value">${data.analytics.prThroughput.totalPRs}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Merge Rate:</span>
                        <span class="stat-value">${data.analytics.prThroughput.mergeRate}%</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Avg. Time to Merge:</span>
                        <span class="stat-value">${data.analytics.prThroughput.avgTimeToMerge}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Merged:</span>
                        <span class="stat-value">${data.analytics.prThroughput.statusBreakdown.merged}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Open:</span>
                        <span class="stat-value">${data.analytics.prThroughput.statusBreakdown.open}</span>
                    </div>
                </div>
                `
                    : ""
                }

                ${
                  data.analytics.codeChurn
                    ? `
                <div class="analytics-card">
                    <h3>Code Churn Analysis</h3>
                    <div class="stat">
                        <span class="stat-label">Total Commits:</span>
                        <span class="stat-value">${data.analytics.codeChurn.totalCommits}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Lines Added:</span>
                        <span class="stat-value">${data.analytics.codeChurn.totalAdditions}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Lines Deleted:</span>
                        <span class="stat-value">${data.analytics.codeChurn.totalDeletions}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Net Change:</span>
                        <span class="stat-value">${data.analytics.codeChurn.netChange}</span>
                    </div>
                </div>
                `
                    : ""
                }

                ${
                  data.analytics.workPatterns
                    ? `
                <div class="analytics-card">
                    <h3>Work Patterns</h3>
                    <div class="stat">
                        <span class="stat-label">Most Active Day:</span>
                        <span class="stat-value">${data.analytics.workPatterns.mostActiveDay}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">After Hours Work:</span>
                        <span class="stat-value">${data.analytics.workPatterns.afterHoursPercentage}%</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Total Activities:</span>
                        <span class="stat-value">${data.analytics.workPatterns.totalActivities}</span>
                    </div>
                </div>
                `
                    : ""
                }

                ${
                  data.analytics.prCycleTime
                    ? `
                <div class="analytics-card">
                    <h3>PR Cycle Time</h3>
                    <div class="stat">
                        <span class="stat-label">Avg. Cycle Time:</span>
                        <span class="stat-value">${data.analytics.prCycleTime.avgCycleTime} days</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Total PRs:</span>
                        <span class="stat-value">${data.analytics.prCycleTime.totalPRs}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Merged PRs:</span>
                        <span class="stat-value">${data.analytics.prCycleTime.mergedPRs}</span>
                    </div>
                </div>
                `
                    : ""
                }
            </div>
        </div>

        <div class="section">
            <h2>Repository Activity</h2>
            <div class="repository-list">
                <p><strong>Repositories Analyzed:</strong> ${
                  data.metadata.repositoriesAnalyzed.length
                }</p>
                <ul>
                    ${data.metadata.repositoriesAnalyzed
                      .map((repo) => `<li>${repo}</li>`)
                      .join("")}
                </ul>
            </div>
        </div>

        ${
          data.metadata.metaTags &&
          Object.keys(data.metadata.metaTags).length > 0
            ? `
        <div class="section">
            <h2>Meta Tags</h2>
            <div class="repository-list">
                <ul>
                    ${Object.entries(data.metadata.metaTags)
                      .map(
                        ([key, value]) =>
                          `<li><strong>${key}:</strong> ${value}</li>`
                      )
                      .join("")}
                </ul>
            </div>
        </div>
        `
            : ""
        }

        <div class="footer">
            <p>Generated by Developer Insights Tool | Report Version ${data.metadata.reportVersion}</p>
            <p>Analysis Modules: ${data.metadata.enabledModules.join(", ")}</p>
        </div>
    </div>
</body>
</html>`;

  await fs.writeFile(outputPath, html, "utf8");
}
