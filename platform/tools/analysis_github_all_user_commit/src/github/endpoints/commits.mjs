import { expect } from "expect";
import { CommitSchema } from "../../domain/commit-schema.mjs";
import {
  delay,
  checkTotalRecordsLimit,
  getRemainingRecords,
} from "@internal/github-api-sdk-cli";

/**
 * Get detailed commit info (parents, stats, files) for a single commit.
 * @param {Function} makeRequest
 * @param {string} owner
 * @param {string} repo
 * @param {string} sha
 * @param {{ log: Function }} deps
 * @returns {Promise<object>}
 */
export async function getDetailedCommitInfo(
  makeRequest,
  owner,
  repo,
  sha,
  { log }
) {
  try {
    const details = await makeRequest(
      `GET /repos/${owner}/${repo}/commits/${sha}`
    );

    return {
      parents:
        details.parents?.map((parent) => ({
          sha: parent.sha,
          url: parent.url,
          html_url: parent.html_url,
        })) || [],
      stats: {
        total: details.stats?.total || 0,
        additions: details.stats?.additions || 0,
        deletions: details.stats?.deletions || 0,
      },
      files:
        details.files?.map((file) => ({
          sha: file.sha,
          filename: file.filename,
          status: file.status,
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes,
          blob_url: file.blob_url,
          raw_url: file.raw_url,
          contents_url: file.contents_url,
          patch: file.patch,
        })) || [],
    };
  } catch (error) {
    log(
      `Failed to get detailed info for ${sha}: ${error.message}`,
      "warn"
    );
    return {
      parents: [],
      stats: { total: 0, additions: 0, deletions: 0 },
      files: [],
    };
  }
}

/**
 * Get commits for a repository by a specific author.
 * @param {Function} makeRequest
 * @param {string} owner
 * @param {string} repo
 * @param {string} author
 * @param {object|null} dateRange
 * @param {object} ctx - Context with config, state, log, etc.
 * @returns {Promise<Array>} commits array
 */
export async function getRepositoryCommits(
  makeRequest,
  owner,
  repo,
  author,
  dateRange,
  ctx
) {
  const { config, totalFetched, cancelled, errors, log } = ctx;
  const commits = [];
  let page = 1;
  const perPage = 100;

  while (!cancelled.value && !checkTotalRecordsLimit(config, totalFetched)) {
    try {
      const remainingRecords = getRemainingRecords(config, totalFetched);
      const requestOptions = {
        author,
        page,
        per_page: Math.min(perPage, remainingRecords),
      };

      if (dateRange && !config.ignoreDateRange) {
        requestOptions.since = new Date(dateRange.start).toISOString();
        requestOptions.until = new Date(dateRange.end).toISOString();
      }

      const response = await makeRequest(
        `GET /repos/${owner}/${repo}/commits`,
        requestOptions
      );

      if (response.length === 0) break;

      const formatted = await Promise.all(
        response.map(async (commit) => {
          const baseCommit = {
            sha: commit.sha,
            message: commit.commit.message,
            date: commit.commit.committer.date,
            repository: `${owner}/${repo}`,
            type: "direct",
            pullRequest: null,
            author: commit.commit.author.name,
            url: commit.html_url,
          };

          if (config.includeDetails) {
            const details = await getDetailedCommitInfo(
              makeRequest,
              owner,
              repo,
              commit.sha,
              { log }
            );
            baseCommit.parents = details.parents;
            baseCommit.stats = details.stats;
            baseCommit.files = details.files;
            await delay(config.delay * 1000);
          } else {
            baseCommit.parents = [];
            baseCommit.stats = { total: 0, additions: 0, deletions: 0 };
            baseCommit.files = [];
          }

          expect(() => CommitSchema.parse(baseCommit)).not.toThrow();

          return baseCommit;
        })
      );

      commits.push(...formatted);
      totalFetched.value += formatted.length;

      if (response.length < perPage) break;
      if (checkTotalRecordsLimit(config, totalFetched)) {
        const excess = totalFetched.value - config.totalRecords;
        if (excess > 0) {
          commits.splice(-excess);
          totalFetched.value = config.totalRecords;
        }
        break;
      }

      page++;
      await delay(config.delay * 1000);
    } catch (error) {
      if (error.status === 409 || error.status === 404) {
        log(
          `Skipping repository ${owner}/${repo}: ${error.message}`,
          "warn"
        );
        break;
      }
      errors.push({
        operation: "getRepositoryCommits",
        repository: `${owner}/${repo}`,
        error: error.message,
      });
      break;
    }
  }

  return commits;
}
