import { Octokit } from "octokit";
import { resolveGithubEnv } from "@internal/env-resolver";

export interface OrgInfo {
  login: string;
  description: string | null;
}

/**
 * Lightweight org fetch using a bare Octokit — no rate limiter or SharedContext.
 * Intended for prompt-time use only.
 */
export async function fetchUserOrgsLite(
  token: string,
  username: string,
): Promise<OrgInfo[]> {
  const baseUrl = resolveGithubEnv().baseApiUrl;

  const octokit = new Octokit({ auth: token, baseUrl });

  const orgs: OrgInfo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data } = await octokit.rest.orgs.listForUser({
      username,
      page,
      per_page: perPage,
    });

    if (!data || data.length === 0) break;

    for (const org of data) {
      orgs.push({
        login: org.login,
        description: org.description ?? null,
      });
    }

    if (data.length < perPage) break;
    page++;
  }

  return orgs;
}
