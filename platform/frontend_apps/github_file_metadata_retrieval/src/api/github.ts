import type { GitHubContentItem, GitHubRepoDetails, GitHubCommitInfo, GitHubCommitHistoryEntry, CommitFileStats, CommitPullRequest, CommitDetail, CommitDetailFile, GitHubTreeEntry, FileContentData, TreeNode } from '@/types';

const API_PREFIX = '/~/api/rest/02-01-2026/providers/github_api/2022-11-28';

export const GITHUB_BASE_URL = import.meta.env.VITE_GITHUB_BASE_URL || 'https://github.com';

export interface VulnerabilityAlerts {
  enabled: boolean;
}

export async function fetchVulnerabilityAlerts(owner: string, repo: string): Promise<VulnerabilityAlerts> {
  const res = await fetch(`${API_PREFIX}/repos/${owner}/${repo}/vulnerability-alerts`);
  if (!res.ok) return { enabled: false };
  return res.json();
}

// ── API Fetchers ──────────────────────────────────────────────────────

export async function fetchRepoDetails(owner: string, repo: string): Promise<GitHubRepoDetails> {
  const res = await fetch(`${API_PREFIX}/repos/${owner}/${repo}`);
  if (!res.ok) throw new Error(`Failed to fetch repo details: ${res.status}`);
  return res.json();
}

export async function fetchContents(owner: string, repo: string, path = '', ref?: string): Promise<GitHubContentItem[]> {
  const encodedPath = path ? `/${path.split('/').map(encodeURIComponent).join('/')}` : '';
  const query = ref ? `?ref=${encodeURIComponent(ref)}` : '';
  const res = await fetch(`${API_PREFIX}/repos/${owner}/${repo}/contents${encodedPath}${query}`);
  if (!res.ok) throw new Error(`Failed to fetch contents: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}

export async function fetchFileContent(owner: string, repo: string, path: string): Promise<FileContentData | null> {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  const res = await fetch(`${API_PREFIX}/repos/${owner}/${repo}/contents/${encodedPath}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.content) return null;
  return {
    content: atob(data.content.replace(/\n/g, '')),
    size: data.size,
    encoding: data.encoding ?? 'base64',
  };
}

export async function fetchFileCommit(owner: string, repo: string, path: string): Promise<GitHubCommitInfo | null> {
  const res = await fetch(`${API_PREFIX}/repos/${owner}/${repo}/commits?path=${encodeURIComponent(path)}&per_page=1`);
  if (!res.ok) return null;
  const data = await res.json();
  const commits = Array.isArray(data) ? data : [];
  if (commits.length === 0) return null;
  const c = commits[0];
  const verification = c.commit?.verification;
  return {
    sha: c.sha?.slice(0, 7) ?? '\u2014',
    date: c.commit?.author?.date ?? c.commit?.committer?.date ?? '',
    author: c.commit?.author?.name ?? c.author?.login ?? '\u2014',
    authorLogin: c.author?.login ?? '',
    authorAvatarUrl: c.author?.avatar_url ?? '',
    message: c.commit?.message?.split('\n')[0] ?? '\u2014',
    verified: verification?.verified ?? false,
    verifiedReason: verification?.reason ?? 'unsigned',
  };
}

export async function fetchGitTree(owner: string, repo: string, treeSha: string, recursive = false): Promise<GitHubTreeEntry[]> {
  const query = recursive ? '?recursive=1' : '';
  const res = await fetch(`${API_PREFIX}/repos/${owner}/${repo}/git/trees/${encodeURIComponent(treeSha)}${query}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.tree ?? [];
}

/** Fetch commit history for a file (multiple commits) */
export async function fetchFileCommits(
  owner: string,
  repo: string,
  path: string,
  perPage = 30,
): Promise<GitHubCommitHistoryEntry[]> {
  const res = await fetch(
    `${API_PREFIX}/repos/${owner}/${repo}/commits?path=${encodeURIComponent(path)}&per_page=${perPage}`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  const commits = Array.isArray(data) ? data : [];
  return commits.map((c: Record<string, unknown>) => {
    const commit = c.commit as Record<string, unknown> | undefined;
    const commitAuthor = commit?.author as Record<string, string> | undefined;
    const committer = commit?.committer as Record<string, string> | undefined;
    const author = c.author as Record<string, string> | undefined;
    const verification = commit?.verification as Record<string, unknown> | undefined;
    const fullSha = (c.sha as string) ?? '';
    return {
      sha: fullSha.slice(0, 7),
      fullSha,
      date: commitAuthor?.date ?? committer?.date ?? '',
      author: commitAuthor?.name ?? author?.login ?? '\u2014',
      authorLogin: author?.login ?? '',
      authorAvatarUrl: author?.avatar_url ?? '',
      message: ((commit?.message as string) ?? '\u2014').split('\n')[0],
      verified: (verification?.verified as boolean) ?? false,
    };
  });
}

/** Fetch file-level stats from a single commit detail */
export async function fetchCommitFileStats(
  owner: string,
  repo: string,
  sha: string,
  filePath: string,
): Promise<CommitFileStats | null> {
  const res = await fetch(`${API_PREFIX}/repos/${owner}/${repo}/commits/${encodeURIComponent(sha)}`);
  if (!res.ok) return null;
  const data = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const files = (data.files as any[]) ?? [];
  const file = files.find((f: { filename?: string }) => f.filename === filePath);
  if (!file) return null;
  const commitAuthor = data.commit?.author;
  const author = data.author;
  return {
    sha: (data.sha as string).slice(0, 7),
    date: commitAuthor?.date ?? '',
    additions: file.additions ?? 0,
    deletions: file.deletions ?? 0,
    author: commitAuthor?.name ?? author?.login ?? '\u2014',
    authorLogin: author?.login ?? '',
  };
}

/** Fetch file-level stats for multiple commits (batched, max 5 concurrent) */
export async function fetchBulkCommitFileStats(
  owner: string,
  repo: string,
  commits: GitHubCommitHistoryEntry[],
  filePath: string,
): Promise<CommitFileStats[]> {
  const results: CommitFileStats[] = [];
  const chunks: GitHubCommitHistoryEntry[][] = [];
  for (let i = 0; i < commits.length; i += 5) {
    chunks.push(commits.slice(i, i + 5));
  }
  for (const chunk of chunks) {
    const promises = chunk.map(async (c) => {
      const stats = await fetchCommitFileStats(owner, repo, c.fullSha, filePath);
      if (stats) results.push(stats);
    });
    await Promise.all(promises);
  }
  // Sort by date ascending
  results.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return results;
}

/** Fetch pull requests associated with a commit */
export async function fetchCommitPulls(
  owner: string,
  repo: string,
  sha: string,
): Promise<CommitPullRequest[]> {
  const res = await fetch(`${API_PREFIX}/repos/${owner}/${repo}/commits/${encodeURIComponent(sha)}/pulls`);
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((pr: Record<string, unknown>) => ({
    number: pr.number as number,
    title: pr.title as string,
    html_url: pr.html_url as string,
    state: pr.state as string,
    merged_at: (pr.merged_at as string) ?? null,
  }));
}

/** Fetch PRs for multiple commits (batched, max 5 concurrent) */
export async function fetchBulkCommitPulls(
  owner: string,
  repo: string,
  shas: string[],
): Promise<Record<string, CommitPullRequest[]>> {
  const results: Record<string, CommitPullRequest[]> = {};
  const chunks: string[][] = [];
  for (let i = 0; i < shas.length; i += 5) {
    chunks.push(shas.slice(i, i + 5));
  }
  for (const chunk of chunks) {
    const promises = chunk.map(async (sha) => {
      const prs = await fetchCommitPulls(owner, repo, sha);
      if (prs.length > 0) results[sha.slice(0, 7)] = prs;
    });
    await Promise.all(promises);
  }
  return results;
}

/** Fetch full commit detail (file changes + PRs) for a single commit */
export async function fetchCommitDetail(
  owner: string,
  repo: string,
  sha: string,
): Promise<CommitDetail | null> {
  const [commitRes, prs] = await Promise.all([
    fetch(`${API_PREFIX}/repos/${owner}/${repo}/commits/${encodeURIComponent(sha)}`),
    fetchCommitPulls(owner, repo, sha),
  ]);
  if (!commitRes.ok) return null;
  const data = await commitRes.json();
  const rawFiles = (data.files as Record<string, unknown>[]) ?? [];
  const files: CommitDetailFile[] = rawFiles.map(f => ({
    filename: (f.filename as string) ?? '',
    status: (f.status as string) ?? 'modified',
    additions: (f.additions as number) ?? 0,
    deletions: (f.deletions as number) ?? 0,
    changes: (f.changes as number) ?? 0,
    patch: f.patch as string | undefined,
  }));
  return {
    sha: ((data.sha as string) ?? sha).slice(0, 7),
    additions: (data.stats as Record<string, number>)?.additions ?? 0,
    deletions: (data.stats as Record<string, number>)?.deletions ?? 0,
    files,
    prs,
  };
}

/** Fetch commit dates for all files in a list (for oldest/newest sorting) */
export async function fetchBulkCommitDates(
  owner: string,
  repo: string,
  filePaths: string[],
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  // Fetch in parallel, max 10 concurrent
  const chunks: string[][] = [];
  for (let i = 0; i < filePaths.length; i += 10) {
    chunks.push(filePaths.slice(i, i + 10));
  }
  for (const chunk of chunks) {
    const promises = chunk.map(async (p) => {
      const info = await fetchFileCommit(owner, repo, p);
      if (info?.date) results[p] = info.date;
    });
    await Promise.all(promises);
  }
  return results;
}

// ── MIME Type Detection ───────────────────────────────────────────────

const EXT_MIME: Record<string, string> = {
  js: 'text/javascript', jsx: 'text/javascript', mjs: 'text/javascript', cjs: 'text/javascript',
  ts: 'text/typescript', tsx: 'text/typescript', mts: 'text/typescript', cts: 'text/typescript',
  html: 'text/html', htm: 'text/html',
  css: 'text/css', scss: 'text/x-scss', less: 'text/x-less',
  json: 'application/json', jsonc: 'application/json', jsonl: 'application/json',
  xml: 'application/xml', svg: 'image/svg+xml',
  yaml: 'text/yaml', yml: 'text/yaml', toml: 'application/toml',
  md: 'text/markdown', mdx: 'text/markdown',
  py: 'text/x-python', pyi: 'text/x-python', pyw: 'text/x-python',
  rb: 'text/x-ruby', rs: 'text/x-rust', go: 'text/x-go',
  java: 'text/x-java', kt: 'text/x-kotlin', scala: 'text/x-scala',
  c: 'text/x-c', h: 'text/x-c', cpp: 'text/x-c++', hpp: 'text/x-c++', cc: 'text/x-c++',
  cs: 'text/x-csharp', swift: 'text/x-swift', m: 'text/x-objectivec',
  php: 'text/x-php', lua: 'text/x-lua', r: 'text/x-r',
  vue: 'text/x-vue', svelte: 'text/x-svelte',
  sh: 'text/x-shellscript', bash: 'text/x-shellscript', zsh: 'text/x-shellscript',
  fish: 'text/x-shellscript',
  dockerfile: 'text/x-dockerfile',
  makefile: 'text/x-makefile',
  txt: 'text/plain', text: 'text/plain', log: 'text/plain',
  csv: 'text/csv', tsv: 'text/tab-separated-values',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
  webp: 'image/webp', ico: 'image/x-icon',
  pdf: 'application/pdf', zip: 'application/zip', gz: 'application/gzip',
  woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf',
  wasm: 'application/wasm',
  sql: 'application/sql',
  graphql: 'application/graphql', gql: 'application/graphql',
  proto: 'text/x-protobuf',
};

const MIME_LANG: Record<string, string> = {
  'text/javascript': 'JavaScript', 'text/typescript': 'TypeScript',
  'text/html': 'HTML', 'text/css': 'CSS', 'text/x-scss': 'SCSS', 'text/x-less': 'Less',
  'application/json': 'JSON', 'application/xml': 'XML', 'image/svg+xml': 'SVG',
  'text/yaml': 'YAML', 'application/toml': 'TOML', 'text/markdown': 'Markdown',
  'text/x-python': 'Python', 'text/x-ruby': 'Ruby', 'text/x-rust': 'Rust', 'text/x-go': 'Go',
  'text/x-java': 'Java', 'text/x-kotlin': 'Kotlin', 'text/x-scala': 'Scala',
  'text/x-c': 'C', 'text/x-c++': 'C++', 'text/x-csharp': 'C#',
  'text/x-swift': 'Swift', 'text/x-objectivec': 'Objective-C',
  'text/x-php': 'PHP', 'text/x-lua': 'Lua', 'text/x-r': 'R',
  'text/x-vue': 'Vue', 'text/x-svelte': 'Svelte',
  'text/x-shellscript': 'Shell', 'text/x-dockerfile': 'Dockerfile', 'text/x-makefile': 'Makefile',
  'text/plain': 'Text', 'text/csv': 'CSV', 'text/tab-separated-values': 'TSV',
  'image/png': 'PNG Image', 'image/jpeg': 'JPEG Image', 'image/gif': 'GIF Image', 'image/webp': 'WebP Image',
  'application/pdf': 'PDF', 'application/zip': 'Archive', 'application/gzip': 'Archive',
  'application/wasm': 'WebAssembly', 'application/sql': 'SQL',
  'application/graphql': 'GraphQL', 'text/x-protobuf': 'Protobuf',
};

export function getMimeType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower === 'dockerfile') return 'text/x-dockerfile';
  if (lower === 'makefile' || lower === 'gnumakefile') return 'text/x-makefile';
  const ext = lower.split('.').pop() ?? '';
  return EXT_MIME[ext] ?? 'application/octet-stream';
}

export function langFromMime(mimeType: string): string {
  return MIME_LANG[mimeType] ?? 'Unknown';
}

// ── Tree Node Construction ────────────────────────────────────────────

export function contentsToTreeNodes(
  items: GitHubContentItem[],
  modeMap?: Record<string, string>,
): Record<string, TreeNode> {
  const result: Record<string, TreeNode> = {};
  for (const item of items) {
    const mode = modeMap?.[item.name];
    if (item.type === 'dir') {
      result[item.name] = {
        type: 'dir',
        items: {},
        mode,
      };
    } else {
      const mimeType = getMimeType(item.name);
      const lang = langFromMime(mimeType);
      result[item.name] = {
        type: 'file',
        size: item.size,
        lang,
        mimeType,
        mode,
        loc: 0,
        modified: '\u2014',
        author: '\u2014',
        commit: item.sha.slice(0, 7),
        message: '\u2014',
      };
    }
  }
  return result;
}

/** Build a name -> mode map from tree entries (for current directory only) */
export function buildModeMap(treeEntries: GitHubTreeEntry[], currentPath: string): Record<string, string> {
  const prefix = currentPath ? currentPath + '/' : '';
  const map: Record<string, string> = {};
  for (const entry of treeEntries) {
    // For recursive trees, filter to direct children of currentPath
    if (prefix) {
      if (!entry.path.startsWith(prefix)) continue;
      const rest = entry.path.slice(prefix.length);
      if (rest.includes('/')) continue; // deeper child
      map[rest] = entry.mode;
    } else {
      if (entry.path.includes('/')) continue;
      map[entry.path] = entry.mode;
    }
  }
  return map;
}

// ── Fuzzy Search ──────────────────────────────────────────────────────

export function fuzzyMatch(query: string, target: string): { match: boolean; score: number } {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (!q) return { match: true, score: 0 };

  let qi = 0;
  let score = 0;
  let prevMatchIdx = -2;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      if (ti === prevMatchIdx + 1) score += 2;
      if (ti === 0 || t[ti - 1] === '.' || t[ti - 1] === '-' || t[ti - 1] === '_') score += 3;
      score += 1;
      prevMatchIdx = ti;
      qi++;
    }
  }

  return { match: qi === q.length, score };
}
