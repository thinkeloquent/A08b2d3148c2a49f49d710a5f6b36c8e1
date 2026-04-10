/**
 * GitHub API Client
 * Uses @internal/github-api-sdk-cli for rate-limited API access.
 * Provides file tree fetching with configurable filtering and raw content retrieval.
 */

import { resolveGithubEnv } from '@internal/env-resolver';
import {
  createGitHubClient,
  createLogger,
  createDebugLogger,
  fetchBranchTree,
} from '@internal/github-api-sdk-cli';

/**
 * Escape special regex characters in a string so it can be safely interpolated
 * into a RegExp pattern. Prevents regex injection from user-supplied input.
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Directories to always skip */
const SKIP_DIRS = new Set([
  'node_modules', 'dist', 'build', '.next', '.nuxt', 'coverage',
  '__tests__', '__mocks__', '__snapshots__', '__fixtures__',
  '.storybook', '.github', '.vscode', '.git',
  'vendor', '__pycache__', '.mypy_cache', '.pytest_cache',
]);

/**
 * Parse owner/repo from a GitHub URL or "owner/repo" string.
 * @param {string} input
 * @returns {{ owner: string, repo: string }}
 */
export function parseRepoInput(input) {
  const urlMatch = input.match(/github\.com\/([^/]+)\/([^/.\s]+)/);
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2] };

  const parts = input.split('/');
  if (parts.length === 2) return { owner: parts[0], repo: parts[1] };

  throw new Error(`Invalid repo format: "${input}". Use "owner/repo" or a GitHub URL.`);
}

/**
 * Build a file filter function from configuration.
 * @param {object} filterConfig
 * @param {string} [filterConfig.rootFolder] - Root folder to scope search to
 * @param {string[]} [filterConfig.filesToSearch] - Glob-like extensions/patterns to include
 * @param {string[]} [filterConfig.filesToIgnore] - Patterns to exclude
 * @returns {(filePath: string) => boolean}
 */
function buildFileFilter({ rootFolder, filesToSearch = [], filesToIgnore = [] }) {
  // Default: scan JS/TS/Python files
  const defaultExtensions = /\.(mjs|js|jsx|ts|tsx|py)$/;

  // Convert filesToSearch to a regex (if provided)
  let includeRe = defaultExtensions;
  if (filesToSearch.length > 0) {
    const escaped = filesToSearch.map(p => {
      // Support "*.ext" → match extension; otherwise treat as literal
      if (p.startsWith('*.')) return escapeRegex(p.slice(1));
      return escapeRegex(p);
    });
    includeRe = new RegExp(`(${escaped.join('|')})$`);
  }

  // Convert filesToIgnore to regexes
  const ignorePatterns = filesToIgnore.map(p => {
    // Escape all regex-special chars first, then convert glob wildcards
    const escaped = escapeRegex(p).replace(/\\\*/g, '.*').replace(/\\\?/g, '.');
    return new RegExp(escaped);
  });

  return function shouldIncludeFile(filePath) {
    // Scope to root folder
    if (rootFolder && !filePath.startsWith(rootFolder.replace(/^\//, ''))) {
      return false;
    }

    // Check directory exclusions
    const segments = filePath.split('/');
    for (const seg of segments) {
      if (SKIP_DIRS.has(seg)) return false;
    }

    // Check file ignore patterns
    for (const pattern of ignorePatterns) {
      if (pattern.test(filePath)) return false;
    }

    // Must match include pattern
    if (!includeRe.test(filePath)) return false;

    // Skip common test/config files
    const filename = segments[segments.length - 1];
    if (/\.(test|spec|stories|story)\.[^.]+$/.test(filename)) return false;
    if (/\.config\.[jt]s$/.test(filename)) return false;
    if (/\.d\.ts$/.test(filename)) return false;

    return true;
  };
}

/**
 * Create a GitHub API client backed by the SDK.
 * @param {{ token?: string, delay?: number, verbose?: boolean, debug?: boolean }} options
 * @returns {{ ctx: object, getFiles: Function, getRawContent: Function, getRateLimit: Function }}
 */
export function createGitHubApiClient({ token, delay = 0.05, verbose = false, debug = false } = {}) {
  const resolvedToken = token || resolveGithubEnv().token || '';

  const { log, output } = createLogger({ verbose });
  const { debugLog } = createDebugLogger({ debug });
  const apiCalls = [];
  const errors = [];

  // Pass token only if non-empty — Octokit with empty string auth fails on public repos
  const { octokit, coreLimiter, searchLimiter, makeRequest, makeSearchRequest } =
    createGitHubClient(
      { token: resolvedToken || undefined, delay },
      { log, debugLog, apiCalls },
    );

  // Build SharedContext for SDK endpoint functions
  const ctx = {
    config: { token: resolvedToken, delay, verbose, debug, totalRecords: 0 },
    makeRequest,
    makeSearchRequest,
    coreLimiter,
    searchLimiter,
    log,
    output,
    debugLog,
    apiCalls,
    errors,
    totalFetched: { value: 0 },
    cancelled: { value: false },
    cache: new Map(),
  };

  return {
    ctx,
    apiCalls,

    /**
     * Fetch file paths matching filter criteria using the SDK's tree endpoint.
     * Uses fetchBranchTree (with SharedContext) for rate limiting and error logging.
     * @param {string} owner
     * @param {string} repo
     * @param {string} branch
     * @param {object} filterConfig - { rootFolder, filesToSearch, filesToIgnore }
     * @returns {Promise<string[]>}
     */
    async getFiles(owner, repo, branch, filterConfig = {}) {
      const treeFiles = await fetchBranchTree(ctx, owner, repo, branch);

      if (treeFiles.length === 0) {
        process.stderr.write(`  [warn] Empty tree returned for ${owner}/${repo}@${branch}\n`);
        process.stderr.write(`  [warn] Check that the branch name is correct (e.g. "master" vs "main")\n`);
      }

      const filter = buildFileFilter(filterConfig);

      return treeFiles
        .filter(item => filter(item.path))
        .map(item => item.path);
    },

    /**
     * Fetch raw file content via the SDK's rate-limited request function.
     * @param {string} owner
     * @param {string} repo
     * @param {string} path
     * @param {string} ref
     * @returns {Promise<string>}
     */
    async getRawContent(owner, repo, path, ref) {
      const data = await makeRequest(
        'GET /repos/{owner}/{repo}/contents/{path}',
        {
          owner,
          repo,
          path,
          ref,
          headers: { Accept: 'application/vnd.github.raw+json' },
          mediaType: { format: 'raw' },
        },
      );
      // Octokit returns the raw string when media type is 'raw'
      return typeof data === 'string' ? data : JSON.stringify(data);
    },

    /**
     * Resolve the HEAD commit SHA for a branch.
     * @param {string} owner
     * @param {string} repo
     * @param {string} branch
     * @returns {Promise<string|null>}
     */
    async getCommitSha(owner, repo, branch) {
      try {
        const data = await makeRequest('GET /repos/{owner}/{repo}/commits/{ref}', {
          owner,
          repo,
          ref: branch,
          per_page: 1,
        });
        return data.sha || null;
      } catch {
        return null;
      }
    },

    /**
     * Check remaining rate limit via the SDK.
     * @returns {Promise<{ remaining: number, limit: number, reset: number }>}
     */
    async getRateLimit() {
      const data = await makeRequest('GET /rate_limit');
      return data.resources.core;
    },
  };
}
