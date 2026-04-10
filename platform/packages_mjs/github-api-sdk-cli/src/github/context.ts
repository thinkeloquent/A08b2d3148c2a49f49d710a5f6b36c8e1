import type { MakeRequestFn, MakeSearchRequestFn } from "./request.js";
import type { LogFn, OutputFn } from "../utils/logger.js";
import type { DebugLogFn } from "../utils/debug-log.js";
import type { ApiCallRecord } from "../reporting/audit-writer.js";
import type { MutableCounter } from "../utils/records-limit.js";
import type { StreamWriter } from "../utils/stream-writer.js";

export interface BaseConfig {
  searchUser?: string;
  org?: string;
  repo?: string;
  branch?: string;
  branchWildcard?: boolean;
  currentFiles?: boolean;
  metaTags?: Record<string, string>;
  format?: string;
  outputDir?: string;
  filename?: string;
  ignoreDateRange?: boolean;
  start?: string;
  end?: string;
  token: string;
  verbose?: boolean;
  debug?: boolean;
  loadData?: string;
  totalRecords: number;
  delay: number;
  pullRequestNumber?: number;
  daysAgo?: number;
  [key: string]: unknown;
}

/**
 * Shared context object passed through the entire application.
 * All endpoint functions, services, and analysis modules receive this context.
 */
export interface SharedContext {
  config: BaseConfig;
  makeRequest: MakeRequestFn;
  makeSearchRequest: MakeSearchRequestFn;
  coreLimiter: { schedule: <T>(fn: () => Promise<T>) => Promise<T> };
  searchLimiter: { schedule: <T>(fn: () => Promise<T>) => Promise<T> };
  log: LogFn;
  output: OutputFn;
  debugLog: DebugLogFn;
  apiCalls: ApiCallRecord[];
  errors: unknown[];
  totalFetched: MutableCounter;
  cancelled: MutableCounter;
  cache: Map<string, unknown>;
  stream?: StreamWriter;
}
