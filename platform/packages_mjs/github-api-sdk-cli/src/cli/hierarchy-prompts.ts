/**
 * Hierarchy Scope Picker — Interactive Prompts
 *
 * Provides the unified hierarchy scope picker and cascading prompts
 * that replace scattered per-tool prompt patterns.
 */

import * as p from "@clack/prompts";
import {
  bail,
  daysAgo,
  today,
  promptUsername,
  promptOrgSelect,
  promptRepoSelect,
  promptBranchSelect,
  promptSourceDirSelect,
  promptToken,
  promptDataSource,
} from "./prompts.js";
import type {
  HierarchyLevel,
  HierarchyScopeConfig,
  HierarchyScope,
  HierarchyResult,
  CommitSearchResult,
  SearchQueryResult,
  SearchType,
  CodeSearchMode,
} from "./hierarchy-types.js";
import { HIERARCHY_LEVELS } from "./hierarchy-types.js";

// ── Level Display Labels ────────────────────────────────────────────

const LEVEL_LABELS: Record<HierarchyLevel, { label: string; hint: string }> = {
  account: { label: "Account", hint: "ownership and permissions" },
  repository: { label: "Repository", hint: "project container" },
  branch: { label: "Branch", hint: "specific version/timeline" },
  commit: { label: "Commit / Temporal", hint: "SHA, date range, or commit message" },
  files: { label: "Directory / Files", hint: "physical file structure" },
  search: { label: "Search", hint: "keyword, code, commit, or semantic search" },
};

// ── promptHierarchyScope ────────────────────────────────────────────

/**
 * Present a multiselect of hierarchy levels based on the tool's config.
 *
 * - Required levels are pre-selected and re-added if accidentally removed.
 * - Hidden levels are not shown.
 * - Unlisted levels default to "optional".
 */
export async function promptHierarchyScope(
  config: HierarchyScopeConfig,
): Promise<HierarchyScope> {
  const resolvedLevels: Array<{
    level: HierarchyLevel;
    requirement: "required" | "optional";
  }> = [];

  for (const level of HIERARCHY_LEVELS) {
    const req = config.levels[level] ?? "optional";
    if (req === "hidden") continue;
    resolvedLevels.push({ level, requirement: req });
  }

  const options = resolvedLevels.map(({ level, requirement }) => ({
    value: level,
    label:
      requirement === "required"
        ? `${LEVEL_LABELS[level].label} (required)`
        : LEVEL_LABELS[level].label,
    hint: LEVEL_LABELS[level].hint,
  }));

  const initialValues = resolvedLevels
    .filter((r) => r.requirement === "required")
    .map((r) => r.level);

  const selected = bail(
    await p.multiselect({
      message: "Select GitHub hierarchy levels to scope this analysis",
      options,
      initialValues,
      required: true,
    }),
  ) as HierarchyLevel[];

  // Post-validate: re-add required levels if accidentally deselected
  const requiredLevels = resolvedLevels
    .filter((r) => r.requirement === "required")
    .map((r) => r.level);

  const finalSelected = [...new Set([...selected, ...requiredLevels])];

  // Preserve original order
  const ordered = HIERARCHY_LEVELS.filter((l) =>
    finalSelected.includes(l),
  );

  return { selected: ordered };
}

// ── promptCommitSearch ──────────────────────────────────────────────

/**
 * Sub-prompt for the commit/temporal level.
 * Lets the user choose between date range, SHA, or commit message search.
 */
export async function promptCommitSearch(): Promise<CommitSearchResult> {
  const mode = bail(
    await p.select({
      message: "Commit search mode",
      options: [
        {
          value: "all",
          label: "By All Commits",
          hint: "no date filtering, all time",
        },
        {
          value: "branch",
          label: "Current Files in Branches",
          hint: "scan file tree, no commit history",
        },
        {
          value: "dateRange",
          label: "By Date Range",
          hint: "filter commits by date window",
        },
        {
          value: "sha",
          label: "By Commit SHA",
          hint: "filter by specific commit hash",
        },
        {
          value: "commitMessage",
          label: "By Commit Message",
          hint: "search commit messages for a pattern",
        },
        {
          value: "dateAgo",
          label: "By Date Ago",
          hint: "relative time window (e.g. last 7 days)",
        },
        {
          value: "pullRequest",
          label: "By Pull Request",
          hint: "commits from a specific PR number",
        },
      ],
    }),
  ) as CommitSearchResult["mode"];

  if (mode === "all") {
    return { mode: "all", ignoreDateRange: true };
  }

  if (mode === "branch") {
    return { mode: "branch", currentFiles: true, ignoreDateRange: true };
  }

  if (mode === "sha") {
    const sha = bail(
      await p.text({
        message: "Commit SHA (full or abbreviated)",
        placeholder: "e.g. a1b2c3d",
        validate: (v) => {
          const trimmed = v.trim();
          if (!trimmed) return "SHA is required";
          if (!/^[0-9a-fA-F]{4,40}$/.test(trimmed))
            return "SHA must be 4-40 hex characters";
          return undefined;
        },
      }),
    );
    return { mode: "sha", sha: sha.trim() };
  }

  if (mode === "commitMessage") {
    const commitMessage = bail(
      await p.text({
        message: "Commit message search pattern",
        placeholder: "e.g. fix: or JIRA-123",
        validate: (v) => {
          if (!v.trim()) return "Search pattern is required";
          return undefined;
        },
      }),
    );
    return { mode: "commitMessage", commitMessage: commitMessage.trim() };
  }

  if (mode === "dateAgo") {
    const preset = bail(
      await p.select({
        message: "How far back?",
        options: [
          { value: "7", label: "Last 7 days", hint: `${daysAgo(7)} to ${today()}` },
          { value: "14", label: "Last 14 days", hint: `${daysAgo(14)} to ${today()}` },
          { value: "30", label: "Last 30 days", hint: `${daysAgo(30)} to ${today()}` },
          { value: "90", label: "Last 90 days", hint: `${daysAgo(90)} to ${today()}` },
          { value: "custom", label: "Custom days", hint: "enter number of days" },
        ],
      }),
    ) as string;

    let days: number;
    if (preset === "custom") {
      const daysStr = bail(
        await p.text({
          message: "Number of days ago",
          placeholder: "e.g. 7, 14, 60",
          validate: (v) => {
            const n = parseInt(v.trim(), 10);
            if (isNaN(n) || n < 1) return "Must be a positive number";
            return undefined;
          },
        }),
      );
      days = parseInt(daysStr.trim(), 10);
    } else {
      days = parseInt(preset, 10);
    }

    return {
      mode: "dateAgo",
      start: daysAgo(days),
      end: today(),
      daysAgo: days,
      ignoreDateRange: false,
    };
  }

  if (mode === "pullRequest") {
    const prStr = bail(
      await p.text({
        message: "Pull request number",
        placeholder: "e.g. 42",
        validate: (v) => {
          const n = parseInt(v.trim(), 10);
          if (isNaN(n) || n < 1) return "Must be a positive integer";
          return undefined;
        },
      }),
    );
    return {
      mode: "pullRequest",
      pullRequestNumber: parseInt(prStr.trim(), 10),
      ignoreDateRange: true,
    };
  }

  // dateRange — delegate to existing promptDataSource
  const { start, end, ignoreDateRange } = await promptDataSource({
    allowCurrentFiles: false,
  });
  return {
    mode: "dateRange",
    start: start || undefined,
    end: end || undefined,
    ignoreDateRange: ignoreDateRange || false,
  };
}

// ── promptSearchQuery ───────────────────────────────────────────────

/**
 * Sub-prompt for the search level.
 * Lets the user choose a search type and enter query details.
 */
export async function promptSearchQuery(): Promise<SearchQueryResult> {
  const searchType = bail(
    await p.select({
      message: "Search type",
      options: [
        {
          value: "keyword",
          label: "General Keyword",
          hint: "search repos, issues, or PRs by keyword",
        },
        {
          value: "code",
          label: "Code Search",
          hint: "search code by pattern, regex, or symbol",
        },
        {
          value: "commitSearch",
          label: "Commit & Temporal",
          hint: "search commit messages with date qualifiers",
        },
        {
          value: "semantic",
          label: "Semantic (placeholder)",
          hint: "AI-powered semantic search (coming soon)",
        },
      ],
    }),
  ) as SearchType;

  if (searchType === "keyword") {
    const query = bail(
      await p.text({
        message: "Search query",
        placeholder: "e.g. authentication bug",
        validate: (v) => {
          if (!v.trim()) return "Query is required";
          return undefined;
        },
      }),
    );
    const qualifiers = bail(
      await p.text({
        message: "Additional qualifiers (optional)",
        placeholder: "e.g. org:microsoft stars:>100 is:open",
      }),
    );
    return {
      searchType: "keyword",
      query: query.trim(),
      qualifiers: qualifiers?.trim() || undefined,
    };
  }

  if (searchType === "code") {
    const query = bail(
      await p.text({
        message: "Code search pattern",
        placeholder: "e.g. addEventListener className",
        validate: (v) => {
          if (!v.trim()) return "Pattern is required";
          return undefined;
        },
      }),
    );
    const codeSearchMode = bail(
      await p.select({
        message: "Code search mode",
        options: [
          { value: "exact", label: "Exact match", hint: "literal string" },
          { value: "regex", label: "Regular expression", hint: "regex pattern" },
          { value: "symbol", label: "Symbol search", hint: "function/class/type names" },
        ],
      }),
    ) as CodeSearchMode;
    return {
      searchType: "code",
      query: query.trim(),
      codeSearchMode,
    };
  }

  if (searchType === "commitSearch") {
    const query = bail(
      await p.text({
        message: "Commit message pattern",
        placeholder: "e.g. fix: or BREAKING CHANGE",
        validate: (v) => {
          if (!v.trim()) return "Pattern is required";
          return undefined;
        },
      }),
    );
    const commitDateQualifiers = bail(
      await p.text({
        message: "Date qualifiers (optional)",
        placeholder: "e.g. committer-date:>2024-01-01",
      }),
    );
    return {
      searchType: "commitSearch",
      query: query.trim(),
      commitDateQualifiers: commitDateQualifiers?.trim() || undefined,
    };
  }

  // semantic — placeholder
  p.log.info("Semantic search is a placeholder — enter a description for future use.");
  const query = bail(
    await p.text({
      message: "Semantic search description",
      placeholder: "e.g. functions that handle user authentication",
      validate: (v) => {
        if (!v.trim()) return "Description is required";
        return undefined;
      },
    }),
  );
  return { searchType: "semantic", query: query.trim() };
}

// ── promptHierarchyCascade ──────────────────────────────────────────

/**
 * Cascade through the selected hierarchy levels, prompting for each.
 *
 * Returns the GitHub token and a HierarchyResult with all collected values.
 */
export async function promptHierarchyCascade(opts: {
  scope: HierarchyScope;
  config: HierarchyScopeConfig;
}): Promise<{ token: string; hierarchy: HierarchyResult }> {
  const { scope, config } = opts;
  const has = (level: HierarchyLevel) => scope.selected.includes(level);

  // ── Account ─────────────────────────────────────────────────────
  let searchUser = "";
  let org = "";
  if (has("account")) {
    if (config.multiUser) {
      searchUser = bail(
        await p.text({
          message: "GitHub username(s) to check (comma-separated)",
          placeholder: "octocat,torvalds",
          validate: (v) => {
            if (!v.trim()) return "At least one username is required";
            return undefined;
          },
        }),
      );
      searchUser = searchUser.trim();
    } else {
      const orgInput = bail(
        await p.text({
          message: "GitHub organization(s) (comma-separated, leave empty to skip)",
          placeholder: "e.g. facebook, mui (comma-separated)",
        }),
      );
      org = orgInput?.trim() || "";

      searchUser = await promptUsername({ requireUser: config.requireUser });
    }
  }

  // ── Token (always) ──────────────────────────────────────────────
  const token = await promptToken();

  // ── Repository ──────────────────────────────────────────────────
  let repo = "";
  if (has("repository")) {
    if (!org) {
      org = await promptOrgSelect({ token, username: searchUser });
    }
    repo = await promptRepoSelect({ token, owner: org || searchUser });
  }

  // ── Branch ──────────────────────────────────────────────────────
  let branch = "";
  if (has("branch")) {
    branch = await promptBranchSelect({
      token,
      owner: org || searchUser,
      repo,
    });
  }

  // ── Commit / Temporal ───────────────────────────────────────────
  let commitSearch: CommitSearchResult | undefined;
  let start: string | undefined;
  let end: string | undefined;
  let ignoreDateRange = false;
  let currentFiles = false;
  let pullRequestNumber: number | undefined;

  if (has("commit")) {
    commitSearch = await promptCommitSearch();
    // Propagate date/temporal settings from commit search result
    if (commitSearch.mode === "all") {
      ignoreDateRange = true;
    } else if (commitSearch.mode === "branch") {
      currentFiles = true;
      ignoreDateRange = true;
    } else if (commitSearch.mode === "dateRange") {
      start = commitSearch.start;
      end = commitSearch.end;
      ignoreDateRange = commitSearch.ignoreDateRange ?? false;
    } else if (commitSearch.mode === "dateAgo") {
      start = commitSearch.start;
      end = commitSearch.end;
      ignoreDateRange = false;
    } else if (commitSearch.mode === "pullRequest") {
      pullRequestNumber = commitSearch.pullRequestNumber;
      ignoreDateRange = true;
    }
  } else {
    // If commit level not selected, still prompt for data source
    const allowCurrentFiles = has("files");
    const dataSource = await promptDataSource({ allowCurrentFiles });
    start = dataSource.start;
    end = dataSource.end;
    ignoreDateRange = dataSource.ignoreDateRange;
    currentFiles = dataSource.currentFiles;
  }

  // ── Files / Directory ───────────────────────────────────────────
  let sourceDirs: string | undefined;
  if (has("files")) {
    sourceDirs = await promptSourceDirSelect({
      token,
      owner: org || searchUser,
      repo,
      branch,
    });
  }

  // ── Search ──────────────────────────────────────────────────────
  let searchQuery: SearchQueryResult | undefined;
  if (has("search")) {
    searchQuery = await promptSearchQuery();
  }

  return {
    token,
    hierarchy: {
      searchUser,
      org,
      repo,
      branch,
      commitSearch,
      sourceDirs,
      searchQuery,
      start,
      end,
      ignoreDateRange,
      currentFiles,
      pullRequestNumber,
    },
  };
}
