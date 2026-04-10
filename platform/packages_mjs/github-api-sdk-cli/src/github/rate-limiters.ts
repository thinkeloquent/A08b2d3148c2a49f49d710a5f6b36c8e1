import { API_Rate_Limiter } from "@internal/api-rate-limiter";
import type { LogFn } from "../utils/logger.js";

/**
 * Create rate limiters for GitHub API resources.
 */
export function createRateLimiters(
  octokit: any,
  { log }: { log: LogFn },
): { coreLimiter: API_Rate_Limiter; searchLimiter: API_Rate_Limiter } {
  const getGitHubRateLimit = async (resource = "core") => {
    try {
      const response = await octokit.request("GET /rate_limit");
      return response.data.resources[resource];
    } catch (error: any) {
      log(
        `Failed to fetch rate limit, using safe defaults: ${error.message}`,
        "warn",
      );
      return { remaining: 1, reset: Math.floor(Date.now() / 1000) + 60 };
    }
  };

  const coreLimiter = new API_Rate_Limiter("github-core", {
    getRateLimitStatus: () => getGitHubRateLimit("core"),
  });

  const searchLimiter = new API_Rate_Limiter("github-search", {
    getRateLimitStatus: () => getGitHubRateLimit("search"),
  });

  return { coreLimiter, searchLimiter };
}
