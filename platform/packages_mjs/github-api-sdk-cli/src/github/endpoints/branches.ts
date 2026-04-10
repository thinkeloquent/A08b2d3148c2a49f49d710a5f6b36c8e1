import { Octokit } from "octokit";
import { resolveGithubEnv } from "@internal/env-resolver";
import type { SharedContext } from "../context.js";

export interface BranchInfo {
  name: string;
  sha: string;
  protected: boolean;
}

export interface TreeFile {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size?: number;
  url: string;
}

/**
 * Lightweight branch fetch using a bare Octokit — no rate limiter or SharedContext.
 * Intended for prompt-time use only (fetches first page of branches).
 */
export async function fetchBranchesLite(
  token: string,
  owner: string,
  repo: string,
): Promise<BranchInfo[]> {
  const baseUrl = resolveGithubEnv().baseApiUrl;

  const octokit = new Octokit({ auth: token, baseUrl });

  const branches: BranchInfo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data } = await octokit.rest.repos.listBranches({
      owner,
      repo,
      page,
      per_page: perPage,
    });

    if (!data || data.length === 0) break;

    for (const branch of data) {
      branches.push({
        name: branch.name,
        sha: branch.commit.sha,
        protected: branch.protected || false,
      });
    }

    if (data.length < perPage) break;
    page++;
  }

  return branches;
}

/**
 * Lightweight tree fetch using a bare Octokit — no rate limiter or SharedContext.
 * Intended for prompt-time use only (e.g. directory listing for source dir selection).
 */
export async function fetchBranchTreeLite(
  token: string,
  owner: string,
  repo: string,
  branch: string,
): Promise<TreeFile[]> {
  const baseUrl = resolveGithubEnv().baseApiUrl;

  const octokit = new Octokit({ auth: token, baseUrl });

  try {
    const { data } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: "1",
    });

    return (data.tree || [])
      .filter((item: any) => item.type === "blob")
      .map((item: any) => ({
        path: item.path,
        mode: item.mode,
        type: item.type,
        sha: item.sha,
        size: item.size,
        url: item.url,
      }));
  } catch {
    return [];
  }
}

/**
 * Fetch all branches for a repository.
 */
export async function fetchBranches(
  ctx: SharedContext,
  owner: string,
  repo: string,
): Promise<BranchInfo[]> {
  const { makeRequest, log, cancelled, cache } = ctx;

  const cacheKey = `branches:${owner}/${repo}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as BranchInfo[];
  }

  const branches: BranchInfo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    if (cancelled.value) break;

    try {
      const pageBranches = await makeRequest(
        "GET /repos/{owner}/{repo}/branches",
        { owner, repo, page, per_page: perPage },
      );

      if (!pageBranches || pageBranches.length === 0) break;

      for (const branch of pageBranches) {
        branches.push({
          name: branch.name,
          sha: branch.commit.sha,
          protected: branch.protected || false,
        });
      }

      if (pageBranches.length < perPage) break;
      page++;
    } catch (error: any) {
      log(
        `Failed to fetch branches for ${owner}/${repo}: ${error.message}`,
        "warn",
      );
      break;
    }
  }

  cache.set(cacheKey, branches);
  return branches;
}

/**
 * Fetch the full file tree for a specific branch using the Git Trees API.
 */
export async function fetchBranchTree(
  ctx: SharedContext,
  owner: string,
  repo: string,
  branch: string,
): Promise<TreeFile[]> {
  const { makeRequest, log, cache } = ctx;

  const cacheKey = `tree:${owner}/${repo}:${branch}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as TreeFile[];
  }

  try {
    const data = await makeRequest(
      "GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
      { owner, repo, tree_sha: branch, recursive: "1" },
    );

    const files: TreeFile[] = (data.tree || [])
      .filter((item: any) => item.type === "blob")
      .map((item: any) => ({
        path: item.path,
        mode: item.mode,
        type: item.type,
        sha: item.sha,
        size: item.size,
        url: item.url,
      }));

    cache.set(cacheKey, files);
    return files;
  } catch (error: any) {
    if (error.status === 409) {
      log(
        `Repository ${owner}/${repo} is empty, skipping tree for ${branch}`,
        "warn",
      );
      return [];
    }
    if (error.status === 404) {
      log(
        `Branch '${branch}' not found in ${owner}/${repo}`,
        "warn",
      );
      return [];
    }
    log(
      `Failed to fetch tree for ${owner}/${repo}@${branch}: ${error.message}`,
      "warn",
    );
    return [];
  }
}
