import { Octokit } from "octokit";
import { resolveGithubEnv } from "@internal/env-resolver";
import { createRateLimiters } from "./rate-limiters.js";
import { createRequestFn, createSearchRequestFn } from "./request.js";
import type { MakeRequestFn, MakeSearchRequestFn } from "./request.js";
import type { LogFn } from "../utils/logger.js";
import type { DebugLogFn } from "../utils/debug-log.js";
import type { ApiCallRecord } from "../reporting/audit-writer.js";
import type { API_Rate_Limiter } from "@internal/api-rate-limiter";

export interface GitHubClientConfig {
  token: string;
  baseUrl?: string;
  delay: number;
}

export interface GitHubClientDeps {
  log: LogFn;
  debugLog: DebugLogFn;
  apiCalls: ApiCallRecord[];
}

export interface GitHubClient {
  octokit: Octokit;
  coreLimiter: API_Rate_Limiter;
  searchLimiter: API_Rate_Limiter;
  makeRequest: MakeRequestFn;
  makeSearchRequest: MakeSearchRequestFn;
  baseUrl: string;
}

/**
 * Create a fully configured GitHub client with REST and Search support.
 */
export function createGitHubClient(
  config: GitHubClientConfig,
  { log, debugLog, apiCalls }: GitHubClientDeps,
): GitHubClient {
  const baseUrl =
    config.baseUrl || resolveGithubEnv().baseApiUrl;

  const octokit = new Octokit({
    auth: config.token,
    baseUrl,
  });

  const { coreLimiter, searchLimiter } = createRateLimiters(octokit, {
    log,
  });

  const makeRequest = createRequestFn(octokit, coreLimiter, {
    log,
    debugLog,
    apiCalls,
  });

  const makeSearchRequest = createSearchRequestFn(octokit, searchLimiter, {
    log,
    debugLog,
    apiCalls,
    delayMs: config.delay * 1000,
  });

  return {
    octokit,
    coreLimiter,
    searchLimiter,
    makeRequest,
    makeSearchRequest,
    baseUrl,
  };
}
