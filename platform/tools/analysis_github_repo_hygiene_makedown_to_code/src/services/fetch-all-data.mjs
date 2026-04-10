import { CLIProgressHelper } from "@internal/cli-progressor";
import {
  validateUser,
  fetchUserRepos,
  fetchBranches,
  fetchBranchTree,
} from "@internal/github-api-sdk-cli";
import { fetchRepoCommitsWithFiles } from "../github/endpoints/commits.mjs";

/**
 * Fetch all data: validate user, discover repos, fetch commits with file details.
 * Supports both commit-based and current-files-in-branch modes.
 *
 * @param {object} ctx - Shared context
 * @returns {Promise<{ commits: Array, repositories: string[], branchFiles?: Array }>}
 */
export async function fetchAllData(ctx) {
  const { config, makeRequest, log, output, cancelled } = ctx;

  // Validate user (only if a user is specified)
  if (config.searchUser) {
    output("User Validation");
    await validateUser(makeRequest, config.searchUser, { log });
    log(`User ${config.searchUser} validated`);
  }

  output("Data Collection");

  // ── 1. Discover repositories ───────────────────────────────────────
  const repos = await CLIProgressHelper.withProgress(
    1,
    "Discovering repositories...",
    async (update) => {
      const result = await fetchUserRepos(ctx);
      update(1);
      return result;
    }
  );

  log(`Discovered ${repos.length} repositories`);

  if (repos.length === 0) {
    log("No repositories found", "warn");
    return { commits: [], repositories: [] };
  }

  // ── Current Files Mode ─────────────────────────────────────────────
  if (config.currentFiles) {
    return fetchCurrentFilesData(ctx, repos);
  }

  // ── 2. Fetch commits with file details per repo (standard mode) ────
  const allCommits = [];
  const discoveredRepos = [];

  await CLIProgressHelper.withProgress(
    repos.length,
    "Fetching commits with file details...",
    async (update) => {
      for (const repo of repos) {
        if (cancelled.value) break;

        try {
          const [owner, repoName] = repo.full_name.split("/");
          const commits = await fetchRepoCommitsWithFiles(ctx, owner, repoName);

          if (commits.length > 0) {
            allCommits.push(...commits);
            discoveredRepos.push(repo.full_name);
          }

          log(`Fetched ${commits.length} commits from ${repo.full_name}`);
        } catch (error) {
          log(
            `Failed to fetch commits for ${repo.full_name}: ${error.message}`,
            "warn"
          );
        }

        update(1);
      }
    }
  );

  // ── 3. Deduplicate commits by SHA ──────────────────────────────────
  const seen = new Set();
  const dedupedCommits = allCommits.filter((c) => {
    if (seen.has(c.sha)) return false;
    seen.add(c.sha);
    return true;
  });

  ctx.stream?.appendBatch("commit", dedupedCommits);
  log(
    `Total commits: ${dedupedCommits.length} (${allCommits.length - dedupedCommits.length} duplicates removed)`
  );

  return {
    commits: dedupedCommits,
    repositories: discoveredRepos,
  };
}

/**
 * Fetch current files in branch for all repos (file-scan mode).
 */
async function fetchCurrentFilesData(ctx, repos) {
  const { config, log, cancelled } = ctx;

  const allFiles = [];
  const discoveredRepos = [];

  await CLIProgressHelper.withProgress(
    repos.length,
    "Scanning branch file trees...",
    async (update) => {
      for (const repo of repos) {
        if (cancelled.value) break;

        try {
          const [owner, repoName] = repo.full_name.split("/");
          const branch = config.branch || "HEAD";

          if (config.branchWildcard) {
            // Fetch all branches, scan each
            const branches = await fetchBranches(ctx, owner, repoName);
            for (const b of branches) {
              if (cancelled.value) break;
              const files = await fetchBranchTree(ctx, owner, repoName, b.name);
              allFiles.push(
                ...files.map((f) => ({
                  ...f,
                  repository: repo.full_name,
                  branch: b.name,
                }))
              );
            }
            log(
              `Scanned ${branches.length} branches in ${repo.full_name}`
            );
          } else {
            const files = await fetchBranchTree(ctx, owner, repoName, branch);
            allFiles.push(
              ...files.map((f) => ({
                ...f,
                repository: repo.full_name,
                branch,
              }))
            );
            log(
              `Scanned ${files.length} files in ${repo.full_name}@${branch}`
            );
          }

          discoveredRepos.push(repo.full_name);
        } catch (error) {
          log(
            `Failed to scan ${repo.full_name}: ${error.message}`,
            "warn"
          );
        }

        update(1);
      }
    }
  );

  log(`Total files scanned: ${allFiles.length}`);

  return {
    commits: [],
    repositories: discoveredRepos,
    branchFiles: allFiles,
  };
}
