import {
  checkTotalRecordsLimit,
  getRemainingRecords,
} from "@internal/github-api-sdk-cli";

/**
 * Fetch commits for a specific repository, including file-level change
 * details (additions, deletions, filename).
 *
 * This is a TOOL-SPECIFIC endpoint — the generic fetchRepoCommits in the SDK
 * does not fetch per-commit file details. This version fetches each commit's
 * files individually for the markdown-to-code ratio analysis.
 *
 * @param {object} ctx - Shared context
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Array>} commits with file details
 */
export async function fetchRepoCommitsWithFiles(ctx, owner, repo) {
  const { config, makeRequest, log, totalFetched, cancelled, cache } = ctx;

  const cacheKey = `repo-commits-files:${owner}/${repo}:${config.searchUser || ""}:${config.branch || ""}:${config.start}:${config.end}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const commits = [];
  let page = 1;
  const perPage = 100;

  // Step 1: Fetch commit list
  while (true) {
    if (cancelled.value) break;
    if (checkTotalRecordsLimit(config, totalFetched)) break;

    try {
      const params = {
        owner,
        repo,
        page,
        per_page: Math.min(perPage, getRemainingRecords(config, totalFetched)),
      };

      // Note: no author filter — this tool analyzes all commits in the repo,
      // not just those by a specific user. searchUser is used only as the
      // repo owner for discovery.

      // Branch filter
      if (config.branch && config.branch !== "*") {
        params.sha = config.branch;
      }

      if (!config.ignoreDateRange) {
        if (config.start) params.since = `${config.start}T00:00:00Z`;
        if (config.end) params.until = `${config.end}T23:59:59Z`;
      }

      const pageCommits = await makeRequest(
        "GET /repos/{owner}/{repo}/commits",
        params
      );

      if (!pageCommits || pageCommits.length === 0) break;

      totalFetched.value += pageCommits.length;

      for (const commit of pageCommits) {
        commits.push({
          sha: commit.sha,
          timestamp:
            commit.commit?.author?.date ||
            commit.commit?.committer?.date ||
            null,
          repository: `${owner}/${repo}`,
          message: commit.commit?.message || "",
          url: commit.html_url || "",
        });
      }

      if (pageCommits.length < perPage) break;
      page++;
    } catch (error) {
      if (error.status === 409) {
        log(
          `Repository ${owner}/${repo} is empty or gone, skipping commits`,
          "warn"
        );
        break;
      }
      if (error.status === 404) {
        log(
          `Repository ${owner}/${repo} not found, skipping commits`,
          "warn"
        );
        break;
      }
      log(
        `Failed to fetch commits for ${owner}/${repo}: ${error.message}`,
        "warn"
      );
      break;
    }
  }

  // Step 2: Fetch file details for each commit
  for (const commit of commits) {
    if (cancelled.value) break;

    try {
      const detail = await makeRequest(
        "GET /repos/{owner}/{repo}/commits/{ref}",
        { owner, repo, ref: commit.sha }
      );

      commit.files = (detail.files || []).map((f) => ({
        filename: f.filename,
        status: f.status,
        additions: f.additions || 0,
        deletions: f.deletions || 0,
        changes: f.changes || 0,
      }));

      commit.stats = {
        additions: detail.stats?.additions || 0,
        deletions: detail.stats?.deletions || 0,
        total: detail.stats?.total || 0,
      };
    } catch (error) {
      log(
        `Failed to fetch commit detail ${commit.sha.substring(0, 7)}: ${error.message}`,
        "warn"
      );
      commit.files = [];
      commit.stats = { additions: 0, deletions: 0, total: 0 };
    }
  }

  cache.set(cacheKey, commits);
  return commits;
}
