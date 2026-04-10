import { Octokit } from "octokit";
import { resolveGithubEnv } from "@internal/env-resolver";

export interface RepoBasicInfo {
  name: string;
  full_name: string;
  default_branch: string;
}

/**
 * Lightweight repo fetch using a bare Octokit — no rate limiter or SharedContext.
 * Intended for prompt-time use only.
 */
export async function fetchReposLite(
  token: string,
  owner: string,
  type: "org" | "user",
): Promise<RepoBasicInfo[]> {
  const baseUrl = resolveGithubEnv().baseApiUrl;

  const octokit = new Octokit({ auth: token, baseUrl });

  const repos: RepoBasicInfo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    let data: any[];

    if (type === "org") {
      const response = await octokit.rest.repos.listForOrg({
        org: owner,
        page,
        per_page: perPage,
        sort: "updated",
        direction: "desc",
      });
      data = response.data;
    } else {
      const response = await octokit.rest.repos.listForUser({
        username: owner,
        page,
        per_page: perPage,
        sort: "updated",
        direction: "desc",
      });
      data = response.data;
    }

    if (!data || data.length === 0) break;

    for (const repo of data) {
      repos.push({
        name: repo.name,
        full_name: repo.full_name,
        default_branch: repo.default_branch || "main",
      });
    }

    if (data.length < perPage) break;
    page++;
  }

  return repos;
}
