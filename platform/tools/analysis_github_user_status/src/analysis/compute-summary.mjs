/**
 * Compute summary statistics from user status results.
 * @param {Array} users - Array of user status objects
 * @param {object} config - Config object
 * @param {number} totalFetched - Total records fetched
 * @returns {object} Summary statistics
 */
export function computeSummary(users, config, totalFetched) {
  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "Active").length,
    suspendedUsers: users.filter((u) => u.status === "Suspended").length,
    notFoundUsers: users.filter((u) => u.status === "Not Found / Suspended").length,
    errorUsers: users.filter((u) => u.status === "Error").length,
    totalRecordsFetched: totalFetched,
  };
}
