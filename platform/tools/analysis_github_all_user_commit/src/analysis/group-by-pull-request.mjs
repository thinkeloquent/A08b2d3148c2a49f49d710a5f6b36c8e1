/**
 * Group commits by pull request.
 * @param {Array} commits
 * @param {string} searchUser
 * @returns {object} grouped commits by pull request
 */
export function groupByPullRequest(commits, searchUser) {
  const grouped = {};

  for (const commit of commits) {
    if (commit.type === "pull_request" && commit.pullRequest) {
      const key = `${commit.repository}#${commit.pullRequest}`;

      if (!grouped[key]) {
        grouped[key] = {
          repository: commit.repository,
          pullRequest: commit.pullRequest,
          userId: searchUser,
          commits: [],
          totalAdditions: 0,
          totalDeletions: 0,
          totalFiles: 0,
        };
      }

      grouped[key].commits.push({
        ...commit,
        userId: searchUser,
      });

      if (commit.stats) {
        grouped[key].totalAdditions += commit.stats.additions;
        grouped[key].totalDeletions += commit.stats.deletions;
      }

      if (commit.files) {
        grouped[key].totalFiles += commit.files.length;
      }
    }
  }

  return grouped;
}
