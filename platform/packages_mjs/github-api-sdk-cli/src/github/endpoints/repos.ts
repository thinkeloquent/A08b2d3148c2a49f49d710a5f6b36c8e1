import {
  checkTotalRecordsLimit,
  getRemainingRecords,
} from "../../utils/records-limit.js";
import type { SharedContext } from "../context.js";

export interface RepoInfo {
  full_name: string;
  name: string;
  owner: { login: string };
}

/** Split a comma-separated string into trimmed, non-empty values. */
function splitComma(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const SENTINEL_USER = "_github_sdk_api_audit_";

/**
 * Fetch repositories for one or more users/organizations.
 * Both `config.org` and `config.searchUser` accept comma-separated values.
 * Results are deduplicated by `full_name`.
 */
export async function fetchUserRepos(ctx: SharedContext): Promise<RepoInfo[]> {
  const { config, makeRequest, log, totalFetched, cancelled, cache } = ctx;

  const cacheKey = `repos:${config.searchUser || ""}:${config.org || ""}:${config.repo || ""}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as RepoInfo[];
  }

  // If specific repos are requested, return them directly
  if (config.repo) {
    const repos: RepoInfo[] = config.repo.split(",").map((r: string) => {
      const trimmed = r.trim();
      const owner = config.org || config.searchUser || "";
      return {
        full_name: trimmed.includes("/") ? trimmed : `${owner}/${trimmed}`,
        name: trimmed.includes("/") ? trimmed.split("/")[1]! : trimmed,
        owner: {
          login: trimmed.includes("/") ? trimmed.split("/")[0]! : owner,
        },
      };
    });
    cache.set(cacheKey, repos);
    return repos;
  }

  // Build list of owners to fetch: { endpoint, params }[]
  const owners: Array<{ endpoint: string; params: Record<string, unknown> }> =
    [];

  for (const o of splitComma(config.org)) {
    owners.push({
      endpoint: "GET /orgs/{org}/repos",
      params: { org: o },
    });
  }

  for (const u of splitComma(config.searchUser)) {
    if (u === SENTINEL_USER) continue;
    owners.push({
      endpoint: "GET /users/{username}/repos",
      params: { username: u },
    });
  }

  if (owners.length === 0) {
    throw new Error(
      "At least one of searchUser, org, or repo is required to fetch repositories",
    );
  }

  const seen = new Set<string>();
  const repos: RepoInfo[] = [];
  const perPage = 100;

  for (const { endpoint, params } of owners) {
    let page = 1;

    while (true) {
      if (cancelled.value) break;
      if (checkTotalRecordsLimit(config, totalFetched)) break;

      try {
        const pageRepos = await makeRequest(endpoint, {
          ...params,
          page,
          per_page: Math.min(
            perPage,
            getRemainingRecords(config, totalFetched),
          ),
          sort: "updated",
          direction: "desc",
        });

        if (!pageRepos || pageRepos.length === 0) break;

        for (const repo of pageRepos) {
          if (seen.has(repo.full_name)) continue;
          seen.add(repo.full_name);
          repos.push({
            full_name: repo.full_name,
            name: repo.name,
            owner: { login: repo.owner.login },
          });
        }

        if (pageRepos.length < perPage) break;
        page++;
      } catch (error: any) {
        log(`Failed to fetch repositories: ${error.message}`, "warn");
        break;
      }
    }
  }

  cache.set(cacheKey, repos);
  return repos;
}
