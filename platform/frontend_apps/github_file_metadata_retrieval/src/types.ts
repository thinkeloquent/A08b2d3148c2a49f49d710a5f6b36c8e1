export interface FileNode {
  type: 'file';
  size: number;
  lang: string;
  mimeType?: string;
  mode?: string;
  loc: number;
  modified: string;
  author: string;
  commit: string;
  message: string;
}

export interface DirNode {
  type: 'dir';
  items: Record<string, TreeNode>;
  mode?: string;
  lastCommit?: string;
  author?: string;
  hash?: string;
  date?: string;
}

export type TreeNode = FileNode | DirNode;

export interface RepoInfo {
  name: string;
  owner: string;
  stars: number;
  forks: number;
  description: string;
  tree: Record<string, TreeNode>;
}

export interface ApiRepo {
  id: string;
  name: string;
  description: string;
  githubUrl: string;
  stars: number;
  forks: number;
  language: string;
  maintainer: string;
}

export interface GitHubContentItem {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  html_url: string;
  download_url: string | null;
  content?: string;
  encoding?: string;
}

export interface GitHubRepoDetails {
  full_name: string;
  description: string;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  owner: { login: string };
  topics: string[];
}

export interface GitHubCommitInfo {
  sha: string;
  date: string;
  author: string;
  authorLogin: string;
  authorAvatarUrl: string;
  message: string;
  verified: boolean;
  verifiedReason: string;
}

export interface GitHubTreeEntry {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size?: number;
}

export interface GitHubCommitHistoryEntry {
  sha: string;
  fullSha: string;
  date: string;
  author: string;
  authorLogin: string;
  authorAvatarUrl: string;
  message: string;
  verified: boolean;
}

export interface CommitFileStats {
  sha: string;
  date: string;
  additions: number;
  deletions: number;
  author: string;
  authorLogin: string;
}

export interface CommitPullRequest {
  number: number;
  title: string;
  html_url: string;
  state: string;
  merged_at: string | null;
}

export interface CommitDetailFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export interface CommitDetail {
  sha: string;
  additions: number;
  deletions: number;
  files: CommitDetailFile[];
  prs: CommitPullRequest[];
}

export interface FileContentData {
  content: string;
  size: number;
  encoding: string;
}

/** Maps file mode octal to human-readable label */
export const FILE_MODES: Record<string, { label: string; description: string }> = {
  '100644': { label: 'Standard File', description: 'Non-executable file (read/write)' },
  '100755': { label: 'Executable', description: 'File with executable bit set' },
  '040000': { label: 'Directory', description: 'Subdirectory tree object' },
  '160000': { label: 'Submodule', description: 'Pointer to external repository commit' },
  '120000': { label: 'Symlink', description: 'Symbolic link to another file' },
};

export function parseGithubOwnerName(githubUrl: string): { owner: string; name: string } | null {
  try {
    const url = new URL(githubUrl);
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) return { owner: parts[0], name: parts[1] };
  } catch { /* ignore */ }
  return null;
}
