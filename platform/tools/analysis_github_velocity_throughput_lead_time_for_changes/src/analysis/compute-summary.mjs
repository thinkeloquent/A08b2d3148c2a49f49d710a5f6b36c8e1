/**
 * Generate summary statistics from collected data and analytics.
 * @param {{ pullRequests: Array }} data
 * @param {object} analytics - Results from LeadTimeAnalyzer
 * @returns {object} summary object
 */
export function generateSummary(data, analytics) {
  const { pullRequests } = data;

  const mergedPRs = pullRequests.filter((pr) => pr.merged_at);
  const closedPRs = pullRequests.filter((pr) => pr.closed_at && !pr.merged_at);

  return {
    totalPRs: pullRequests.length,
    mergedPRs: mergedPRs.length,
    closedPRs: closedPRs.length,
    openPRs: pullRequests.length - mergedPRs.length - closedPRs.length,
    mergeRate: pullRequests.length > 0
      ? Math.round((mergedPRs.length / pullRequests.length) * 1000) / 10
      : 0,
    avgLeadTimeDays: analytics?.summary?.avgLeadTimeDays || 0,
    medianLeadTimeDays: analytics?.summary?.medianLeadTimeDays || 0,
    p90LeadTimeDays: analytics?.summary?.p90LeadTimeDays || 0,
    avgOpenToMergeDays: analytics?.summary?.avgOpenToMergeDays || 0,
    doraClassification: analytics?.summary?.doraClassification?.label || "Unknown",
  };
}
