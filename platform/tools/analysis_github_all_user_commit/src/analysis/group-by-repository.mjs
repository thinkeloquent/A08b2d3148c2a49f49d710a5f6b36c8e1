/**
 * Group commits by repository.
 * @param {Array} commits
 * @param {string} searchUser
 * @returns {object} grouped commits by repository
 */
export function groupByRepository(commits, searchUser) {
  const grouped = {};

  for (const commit of commits) {
    if (!grouped[commit.repository]) {
      grouped[commit.repository] = {
        direct: 0,
        pull_request: 0,
        commits: [],
        userId: searchUser,
        totalAdditions: 0,
        totalDeletions: 0,
        totalFiles: 0,
      };
    }

    grouped[commit.repository][commit.type]++;
    grouped[commit.repository].commits.push({
      ...commit,
      userId: searchUser,
    });

    if (commit.stats) {
      grouped[commit.repository].totalAdditions += commit.stats.additions;
      grouped[commit.repository].totalDeletions += commit.stats.deletions;
    }

    if (commit.files) {
      grouped[commit.repository].totalFiles += commit.files.length;
    }
  }

  return grouped;
}
