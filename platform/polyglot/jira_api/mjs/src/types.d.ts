/**
 * Core adapter interfaces and type definitions for the Jira API client.
 */

/** Pluggable fetch implementation adapter. */
export interface FetchAdapter {
  fetch(url: string, init?: RequestInit): Promise<Response>;
}

/** Optional rate limiting adapter. */
export interface RateLimitAdapter {
  schedule<T>(fn: () => Promise<T>): Promise<T>;
}

/** Optional request cache adapter. */
export interface RequestCache {
  get(key: string): Promise<Response | undefined>;
  set(key: string, response: Response): Promise<void>;
}

/** Optional retry handler. */
export interface RetryHandler {
  run<T>(fn: () => Promise<T>): Promise<T>;
}

/** Response transformation hook. */
export type TransformResponse = (response: Response) => Promise<Response> | Response;

/** Configuration options for the generic FetchClient. */
export interface FetchClientOptions {
  fetchAdapter: FetchAdapter;
  rateLimitAdapter?: RateLimitAdapter;
  requestCache?: RequestCache;
  retryHandler?: RetryHandler;
  timeoutMs?: number;
  transformResponse?: TransformResponse;
}

/** HTTP method types supported by JIRA API. */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/** JIRA request configuration. */
export interface JiraRequestConfig {
  method: HttpMethod;
  path: string;
  pathParams?: Record<string, string | number>;
  queryParams?: Record<string, string | number | boolean | string[] | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

/** JIRA client configuration options. */
export interface JiraClientOptions {
  baseUrl: string;
  email: string;
  apiToken: string;
  fetchClientOptions?: Partial<FetchClientOptions>;
  timeoutMs?: number;
}

/** Type-safe JIRA response wrapper. */
export type JiraResponse<T = unknown> = T;

/** Logger interface matching logger.mjs output. */
export interface Logger {
  trace(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}
