/**
 * Generate a summary from dependency drift data and analytics.
 * @param {{ repositoryDependencies: Array, allDependencies: Array, repositories: string[] }} data
 * @param {object} analytics - Results from DependencyDriftAnalyzer
 * @returns {object} summary object
 */
export function generateSummary(data, analytics) {
  const { allDependencies, repositoryDependencies, repositories } = data;

  const totalDeps = allDependencies.length;
  const severity = analytics.severityDistribution || {};

  const upToDate = severity.current || 0;
  const outdated = totalDeps - upToDate;

  const driftScore = totalDeps > 0
    ? round((outdated / totalDeps) * 100, 1)
    : 0;

  return {
    repositoriesScanned: repositories.length,
    repositoriesWithDependencies: repositoryDependencies.length,
    totalDependencies: totalDeps,
    upToDate,
    outdated,
    minor: severity.minor || 0,
    moderate: severity.moderate || 0,
    major: severity.major || 0,
    critical: severity.critical || 0,
    driftScore,
    healthRating: classifyHealth(driftScore),
  };
}

/**
 * Classify overall dependency health based on drift score.
 * @param {number} driftScore - Percentage of outdated dependencies
 * @returns {string}
 */
function classifyHealth(driftScore) {
  if (driftScore <= 10) return "Excellent";
  if (driftScore <= 25) return "Good";
  if (driftScore <= 50) return "Fair";
  if (driftScore <= 75) return "Poor";
  return "Critical";
}

/**
 * Round a number to specified decimal places.
 */
function round(value, decimals = 2) {
  return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
}
