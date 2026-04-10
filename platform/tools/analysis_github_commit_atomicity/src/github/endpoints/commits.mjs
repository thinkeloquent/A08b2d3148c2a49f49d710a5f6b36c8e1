import {
  checkTotalRecordsLimit,
  getRemainingRecords,
} from "@internal/github-api-sdk-cli";

/**
 * Generate weekly time ranges for date partitioning.
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {Array<{start: string, end: string}>}
 */
export function generateTimeRanges(startDate, endDate) {
  const ranges = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let current = new Date(start);

  while (current < end) {
    const rangeEnd = new Date(current);
    rangeEnd.setDate(rangeEnd.getDate() + 7);

    if (rangeEnd > end) {
      rangeEnd.setTime(end.getTime());
    }

    ranges.push({
      start: current.toISOString().split("T")[0],
      end: rangeEnd.toISOString().split("T")[0],
    });

    current = new Date(rangeEnd);
    current.setDate(current.getDate() + 1);
  }

  return ranges;
}

/**
 * Discover repositories for the user.
 * Uses org repos if org is specified, user repos otherwise.
 * Respects repo filter if provided.
 *
 * @param {object} ctx - Shared context
 * @returns {Promise<Array<{owner: string, name: string, full_name: string}>>}
 */
export async function discoverRepositories(ctx) {
  const { config, makeRequest, log, cancelled, cache } = ctx;

  const cacheKey = `repos:${config.searchUser}:${config.org}:${config.repo}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  // If specific repos are provided, parse and return them directly
  if (config.repo) {
    const repoOwner = config.org || config.searchUser;
    const repos = config.repo.split(",").map((r) => {
      const name = r.trim();
      const fullName = name.includes("/") ? name : `${repoOwner}/${name}`;
      const [owner, repoName] = fullName.split("/");
      return { owner, name: repoName, full_name: fullName };
    });
    cache.set(cacheKey, repos);
    return repos;
  }

  const repos = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    if (cancelled.value) break;

    try {
      let pageRepos;

      if (config.org) {
        pageRepos = await makeRequest("GET /orgs/{org}/repos", {
          org: config.org,
          page,
          per_page: perPage,
          type: "all",
          sort: "pushed",
          direction: "desc",
        });
      } else {
        pageRepos = await makeRequest("GET /users/{username}/repos", {
          username: config.searchUser,
          page,
          per_page: perPage,
          type: "all",
          sort: "pushed",
          direction: "desc",
        });
      }

      if (!pageRepos || pageRepos.length === 0) break;

      for (const repo of pageRepos) {
        repos.push({
          owner: repo.owner?.login || config.searchUser,
          name: repo.name,
          full_name: repo.full_name,
        });
      }

      if (pageRepos.length < perPage) break;
      page++;
    } catch (error) {
      log(`Failed to fetch repositories (page ${page}): ${error.message}`, "warn");
      break;
    }
  }

  log(`Discovered ${repos.length} repositories`);
  cache.set(cacheKey, repos);
  return repos;
}

/**
 * Fetch commits for a specific repository authored by the user.
 * Uses the repository commits listing API with author filter.
 *
 * @param {object} ctx - Shared context
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Array>} commits with basic info (sha, message, date)
 */
export async function fetchRepoCommits(ctx, owner, repo) {
  const { config, makeRequest, log, totalFetched, cancelled, cache } = ctx;

  const cacheKey = `repo-commits:${owner}/${repo}:${config.searchUser}:${config.start}:${config.end}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const commits = [];
  let page = 1;
  const perPage = 100;

  const params = {
    owner,
    repo,
    author: config.searchUser,
    page,
    per_page: perPage,
  };

  if (!config.ignoreDateRange) {
    if (config.start) params.since = new Date(config.start).toISOString();
    if (config.end) params.until = new Date(config.end + "T23:59:59Z").toISOString();
  }

  while (true) {
    if (cancelled.value) break;
    if (checkTotalRecordsLimit(config, totalFetched)) break;

    try {
      const remaining = getRemainingRecords(config, totalFetched);
      params.page = page;
      params.per_page = Math.min(perPage, remaining);

      const pageCommits = await makeRequest(
        "GET /repos/{owner}/{repo}/commits",
        params
      );

      if (!pageCommits || pageCommits.length === 0) break;

      for (const commit of pageCommits) {
        commits.push({
          sha: commit.sha,
          message: commit.commit?.message || "",
          author: commit.commit?.author?.name || commit.author?.login || "",
          authorLogin: commit.author?.login || "",
          date: commit.commit?.author?.date || commit.commit?.committer?.date || null,
          repository: `${owner}/${repo}`,
          html_url: commit.html_url || "",
        });
      }

      totalFetched.value += pageCommits.length;

      if (pageCommits.length < perPage) break;
      page++;
    } catch (error) {
      if (error.status === 409) {
        log(`Repository ${owner}/${repo} is empty, skipping`, "warn");
        break;
      }
      if (error.status === 404) {
        log(`Repository ${owner}/${repo} not found, skipping`, "warn");
        break;
      }
      log(
        `Failed to fetch commits for ${owner}/${repo} (page ${page}): ${error.message}`,
        "warn"
      );
      break;
    }
  }

  cache.set(cacheKey, commits);
  return commits;
}

/**
 * Fetch individual commit details (includes stats and file count).
 *
 * @param {object} ctx - Shared context
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} sha - Commit SHA
 * @returns {Promise<{additions: number, deletions: number, total: number, filesChanged: number} | null>}
 */
export async function fetchCommitDetails(ctx, owner, repo, sha) {
  const { makeRequest, log, cancelled, cache } = ctx;

  const cacheKey = `commit-details:${owner}/${repo}@${sha}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    if (cancelled.value) return null;

    const commit = await makeRequest(
      "GET /repos/{owner}/{repo}/commits/{ref}",
      { owner, repo, ref: sha }
    );

    const result = {
      additions: commit.stats?.additions || 0,
      deletions: commit.stats?.deletions || 0,
      total: commit.stats?.total || 0,
      filesChanged: commit.files?.length || 0,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    if (error.status === 409 || error.status === 404) {
      log(
        `Commit ${sha.slice(0, 7)} not accessible in ${owner}/${repo}, skipping`,
        "warn"
      );
      return null;
    }
    log(
      `Failed to fetch details for commit ${sha.slice(0, 7)}: ${error.message}`,
      "warn"
    );
    return null;
  }
}
