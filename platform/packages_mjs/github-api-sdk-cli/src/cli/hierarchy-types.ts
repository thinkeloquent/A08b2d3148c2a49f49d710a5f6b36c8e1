/**
 * Hierarchy Scope Picker — Type Definitions
 *
 * Defines the 6-level GitHub hierarchy that analysis tools use to declare
 * which scope prompts they need. Each tool specifies levels as required,
 * optional, or hidden to drive the interactive scope picker.
 */

// ── Hierarchy Levels ────────────────────────────────────────────────

export const HIERARCHY_LEVELS = [
  "account",
  "repository",
  "branch",
  "commit",
  "files",
  "search",
] as const;

export type HierarchyLevel = (typeof HIERARCHY_LEVELS)[number];

export type LevelRequirement = "required" | "optional" | "hidden";

// ── Scope Configuration (per-tool) ──────────────────────────────────

export interface HierarchyScopeConfig {
  /** Per-level requirement. Unlisted levels default to "optional". */
  levels: Partial<Record<HierarchyLevel, LevelRequirement>>;
  /** When true, the account-level username prompt is required. */
  requireUser?: boolean;
  /** When true, accept comma-separated usernames (e.g. github_user_status). */
  multiUser?: boolean;
}

// ── Scope Selection Result ──────────────────────────────────────────

export interface HierarchyScope {
  selected: HierarchyLevel[];
}

// ── Commit / Temporal Sub-Prompt ────────────────────────────────────

export type CommitSearchMode = "all" | "branch" | "sha" | "dateRange" | "commitMessage" | "dateAgo" | "pullRequest";

export interface CommitSearchResult {
  mode: CommitSearchMode;
  sha?: string;
  start?: string;
  end?: string;
  ignoreDateRange?: boolean;
  currentFiles?: boolean;
  commitMessage?: string;
  daysAgo?: number;
  pullRequestNumber?: number;
}

// ── Search Sub-Prompt ───────────────────────────────────────────────

export type SearchType = "keyword" | "code" | "commitSearch" | "semantic";
export type CodeSearchMode = "exact" | "regex" | "symbol";

export interface SearchQueryResult {
  searchType: SearchType;
  query: string;
  codeSearchMode?: CodeSearchMode;
  qualifiers?: string;
  commitDateQualifiers?: string;
}

// ── Cascade Result ──────────────────────────────────────────────────

export interface HierarchyResult {
  searchUser: string;
  org: string;
  repo: string;
  branch: string;
  commitSearch?: CommitSearchResult;
  sourceDirs?: string;
  searchQuery?: SearchQueryResult;
  start?: string;
  end?: string;
  ignoreDateRange: boolean;
  currentFiles: boolean;
  pullRequestNumber?: number;
}
