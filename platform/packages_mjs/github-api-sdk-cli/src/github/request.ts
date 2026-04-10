import { expect } from "expect";
import { delay } from "../utils/delay.js";
import type { LogFn } from "../utils/logger.js";
import type { DebugLogFn } from "../utils/debug-log.js";
import type { ApiCallRecord } from "../reporting/audit-writer.js";

interface RequestDeps {
  log: LogFn;
  debugLog: DebugLogFn;
  apiCalls: ApiCallRecord[];
}

interface SearchRequestDeps extends RequestDeps {
  delayMs: number;
}

export type MakeRequestFn = (
  url: string,
  options?: Record<string, unknown>,
  limiter?: { schedule: <T>(fn: () => Promise<T>) => Promise<T> } | null,
) => Promise<any>;

export type MakeSearchRequestFn = (
  url: string,
  options?: Record<string, unknown>,
) => Promise<any>;

/**
 * Create a REST core request function bound to an Octokit instance and rate limiter.
 */
export function createRequestFn(
  octokit: any,
  coreLimiter: { schedule: <T>(fn: () => Promise<T>) => Promise<T> },
  { log, debugLog, apiCalls }: RequestDeps,
): MakeRequestFn {
  async function makeRequest(
    url: string,
    options: Record<string, unknown> = {},
    limiter: { schedule: <T>(fn: () => Promise<T>) => Promise<T> } | null = null,
  ): Promise<any> {
    const startTime = Date.now();
    const requestLimiter = limiter || coreLimiter;

    try {
      log(`API Request: ${url}`);

      const response = await requestLimiter.schedule(async () => {
        return await octokit.request(url, options);
      });

      const duration = Date.now() - startTime;
      apiCalls.push({
        url,
        duration,
        status: response.status,
        timestamp: new Date().toISOString(),
      });

      await debugLog("api_request", {
        url,
        options,
        response: response.data,
        duration,
      });

      expect(response.status).toBe(200);

      return response.data;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      apiCalls.push({
        url,
        duration,
        status: error.status || "ERROR",
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      await debugLog("api_error", {
        url,
        options,
        error: error.message,
        duration,
      });

      throw error;
    }
  }

  return makeRequest;
}

/**
 * Create a search request function with built-in delay for GitHub search API.
 */
export function createSearchRequestFn(
  octokit: any,
  searchLimiter: { schedule: <T>(fn: () => Promise<T>) => Promise<T> },
  { log, debugLog, apiCalls, delayMs }: SearchRequestDeps,
): MakeSearchRequestFn {
  async function makeSearchRequest(
    url: string,
    options: Record<string, unknown> = {},
  ): Promise<any> {
    const startTime = Date.now();

    try {
      await delay(delayMs);

      log(`Search API: ${url}`);

      const response = await searchLimiter.schedule(async () => {
        return await octokit.request(url, options);
      });

      const duration = Date.now() - startTime;
      apiCalls.push({
        url,
        duration,
        status: response.status,
        timestamp: new Date().toISOString(),
      });

      await debugLog("search_request", {
        url,
        options,
        response: response.data,
        duration,
      });

      expect(response.status).toBe(200);

      return response.data;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      apiCalls.push({
        url,
        duration,
        status: error.status || "ERROR",
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      await debugLog("search_error", {
        url,
        options,
        error: error.message,
        duration,
      });

      throw error;
    }
  }

  return makeSearchRequest;
}
