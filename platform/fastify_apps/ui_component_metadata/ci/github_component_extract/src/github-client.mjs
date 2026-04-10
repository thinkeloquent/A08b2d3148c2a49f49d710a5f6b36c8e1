/**
 * GitHub API Client
 * Fetches repo file tree and raw file content.
 */

import { resolveGithubEnv } from '@internal/env-resolver';

/** Directories to skip when scanning for components */
const SKIP_DIRS = new Set([
  'node_modules', 'dist', 'build', '.next', '.nuxt', 'coverage',
  '__tests__', '__mocks__', '__snapshots__', '__fixtures__',
  '.storybook', '.github', '.vscode',
]);

/** File patterns to skip */
const SKIP_PATTERNS = [
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/,
  /\.stories\.[jt]sx?$/,
  /\.d\.ts$/,
  /\.config\.[jt]s$/,
];

/**
 * Parse owner/repo from a GitHub URL or "owner/repo" string.
 * @param {string} input
 * @returns {{ owner: string, repo: string }}
 */
export function parseRepoInput(input) {
  // Handle full URLs: https://github.com/owner/repo
  const urlMatch = input.match(/github\.com\/([^/]+)\/([^/.\s]+)/);
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2] };

  // Handle owner/repo format
  const parts = input.split('/');
  if (parts.length === 2) return { owner: parts[0], repo: parts[1] };

  throw new Error(`Invalid repo format: "${input}". Use "owner/repo" or a GitHub URL.`);
}

/**
 * Determine if a file path should be included for scanning.
 * @param {string} filePath
 * @returns {boolean}
 */
function shouldIncludeFile(filePath) {
  // Must be .tsx or .jsx
  if (!/\.[jt]sx$/.test(filePath)) return false;

  // Check directory exclusions
  const segments = filePath.split('/');
  for (const seg of segments) {
    if (SKIP_DIRS.has(seg)) return false;
  }

  // Check file pattern exclusions
  const filename = segments[segments.length - 1];
  for (const pattern of SKIP_PATTERNS) {
    if (pattern.test(filename)) return false;
  }

  return true;
}

/**
 * Create a GitHub API client.
 * @param {{ token?: string, githubCfg?: { base_url?: string } }} options
 */
export function createGitHubClient({ token, githubCfg = {} } = {}) {
  const GITHUB_API =
    githubCfg.base_url ||
    resolveGithubEnv().baseApiUrl;

  const headers = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'github-component-extract/0.1.0',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  /**
   * Make a GitHub API request with error handling.
   * @param {string} url
   * @param {Record<string, string>} [extraHeaders]
   * @returns {Promise<Response>}
   */
  async function apiFetch(url, extraHeaders = {}) {
    const res = await fetch(url, { headers: { ...headers, ...extraHeaders } });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`GitHub API ${res.status}: ${res.statusText} — ${url}\n${body}`);
    }
    return res;
  }

  return {
    /**
     * Fetch the full file tree for a repo/branch.
     * Returns only .tsx/.jsx file paths (excluding tests, stories, etc.).
     * @param {string} owner
     * @param {string} repo
     * @param {string} branch
     * @returns {Promise<string[]>}
     */
    async getComponentFiles(owner, repo, branch) {
      const url = `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
      const res = await apiFetch(url);
      const data = await res.json();

      if (data.truncated) {
        process.stderr.write(`[warn] Tree was truncated by GitHub — very large repo, some files may be missed\n`);
      }

      return data.tree
        .filter(item => item.type === 'blob' && shouldIncludeFile(item.path))
        .map(item => item.path);
    },

    /**
     * Fetch raw file content.
     * @param {string} owner
     * @param {string} repo
     * @param {string} path
     * @param {string} ref
     * @returns {Promise<string>}
     */
    async getRawContent(owner, repo, path, ref) {
      const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${ref}`;
      const res = await apiFetch(url, { 'Accept': 'application/vnd.github.raw+json' });
      return res.text();
    },

    /**
     * Check remaining rate limit.
     * @returns {Promise<{ remaining: number, limit: number, reset: number }>}
     */
    async getRateLimit() {
      const res = await apiFetch(`${GITHUB_API}/rate_limit`);
      const data = await res.json();
      return data.resources.core;
    },
  };
}
