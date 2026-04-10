/**
 * Generate summary statistics from collected data and analytics.
 * @param {{ pullRequests: Array }} data
 * @param {object} analytics - Results from ReviewLoadAnalyzer
 * @returns {object} summary object
 */
export function generateSummary(data, analytics) {
  const { pullRequests } = data;

  const mergedPRs = pullRequests.filter((pr) => pr.merged_at);
  const closedPRs = pullRequests.filter(
    (pr) => pr.closed_at && !pr.merged_at
  );
  const prsWithReviews = pullRequests.filter(
    (pr) => (pr._reviews || []).length > 0
  );

  return {
    totalPRsAnalyzed: pullRequests.length,
    mergedPRs: mergedPRs.length,
    closedPRs: closedPRs.length,
    openPRs: pullRequests.length - mergedPRs.length - closedPRs.length,
    prsWithReviews: prsWithReviews.length,
    totalReviews: analytics?.summary?.totalReviews || 0,
    uniqueReviewers: analytics?.summary?.uniqueReviewers || 0,
    avgReviewsPerPR: analytics?.summary?.avgReviewsPerPR || 0,
    avgReviewsPerReviewer: analytics?.summary?.avgReviewsPerReviewer || 0,
    giniCoefficient: analytics?.summary?.giniCoefficient || 0,
    loadClassification:
      analytics?.summary?.loadClassification?.label || "Unknown",
  };
}
