import * as p from "@clack/prompts";
import { resolveGithubEnv } from "@internal/env-resolver";
import { fetchBranchesLite, fetchBranchTreeLite } from "../github/endpoints/branches.js";
import type { BranchInfo } from "../github/endpoints/branches.js";
import { fetchUserOrgsLite } from "../github/endpoints/orgs.js";
import { fetchReposLite } from "../github/endpoints/repos-lite.js";

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Bail on cancel — exit cleanly if user cancels a prompt.
 */
export function bail<T>(value: T | symbol): T {
  if (p.isCancel(value)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }
  return value as T;
}

export function today(): string {
  return new Date().toISOString().split("T")[0]!;
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0]!;
}

// ── Query Input ──────────────────────────────────────────────────────

export interface QueryInputOptions {
  /** When true, searchUser is required */
  requireUser?: boolean;
}

export interface QueryInputResult {
  searchUser: string;
  org: string;
  repo: string;
}

/**
 * Prompt for GitHub query inputs: user, org, repo.
 */
export async function promptQueryInput(
  options: QueryInputOptions = {},
): Promise<QueryInputResult> {
  const { requireUser = false } = options;

  const searchUser = bail(
    await p.text({
      message: requireUser
        ? "GitHub username(s) to analyze (comma-separated)"
        : "GitHub username(s) (comma-separated, leave empty if using org/repo)",
      placeholder: "e.g. octocat, torvalds",
      validate: requireUser
        ? (v) => {
            if (!v.trim()) return "Username is required";
            return undefined;
          }
        : undefined,
    }),
  );

  const org = bail(
    await p.text({
      message: "GitHub organization(s) (comma-separated, leave empty for all)",
      placeholder: "e.g. facebook, mui",
    }),
  );

  const repo = bail(
    await p.text({
      message:
        "Specific repositories (comma-separated, leave empty for all)",
      placeholder: "e.g. vscode,typescript",
    }),
  );

  // Validate at least one query input
  if (
    !requireUser &&
    !searchUser?.trim() &&
    !org?.trim() &&
    !repo?.trim()
  ) {
    p.log.error(
      "At least one of username, organization, or repository is required",
    );
    p.cancel("Cancelled.");
    process.exit(1);
  }

  return {
    searchUser: searchUser?.trim() || "",
    org: org?.trim() || "",
    repo: repo?.trim() || "",
  };
}

// ── Username Prompt ──────────────────────────────────────────────────

export interface UsernamePromptOptions {
  /** When true, username is required */
  requireUser?: boolean;
}

/**
 * Prompt for GitHub username (extracted from promptQueryInput for cascading flows).
 */
export async function promptUsername(
  options: UsernamePromptOptions = {},
): Promise<string> {
  const { requireUser = false } = options;

  const searchUser = bail(
    await p.text({
      message: requireUser
        ? "GitHub username(s) to analyze (comma-separated)"
        : "GitHub username(s) (comma-separated, leave empty if using org/repo)",
      placeholder: "e.g. octocat, torvalds",
      validate: requireUser
        ? (v) => {
            if (!v.trim()) return "Username is required";
            return undefined;
          }
        : undefined,
    }),
  );

  return searchUser?.trim() || "";
}

// ── Org Selection ───────────────────────────────────────────────────

export interface OrgSelectOptions {
  token: string;
  username: string;
}

/**
 * Prompt for organization selection using the GitHub API.
 *
 * Fetches the user's orgs and presents a `p.select()` list.
 * Falls back to text input if API fails or username is empty.
 */
export async function promptOrgSelect(
  options: OrgSelectOptions,
): Promise<string> {
  const { token, username } = options;

  // Fall back to text input when we can't look up orgs or multi-user
  const isMultiUser = username.includes(",");
  if (!username || isMultiUser) {
    const org = bail(
      await p.text({
        message: "GitHub organization(s) (comma-separated, leave empty for all)",
        placeholder: "e.g. facebook, mui",
      }),
    );
    return org?.trim() || "";
  }

  const s = p.spinner();
  s.start(`Fetching organizations for ${username}`);

  try {
    const orgs = await fetchUserOrgsLite(token, username);
    s.stop(
      `Found ${orgs.length} organization${orgs.length !== 1 ? "s" : ""}`,
    );

    if (orgs.length === 0) {
      const org = bail(
        await p.text({
          message: "GitHub organization (leave empty for all)",
          placeholder: "e.g. microsoft",
        }),
      );
      return org?.trim() || "";
    }

    // Build select options
    const selectOptions: Array<{
      value: string;
      label: string;
      hint?: string;
    }> = [
      {
        value: "",
        label: "Personal repos (no org filter)",
        hint: `repos owned by ${username}`,
      },
      {
        value: "__custom__",
        label: "Type custom name",
        hint: "free-text input",
      },
    ];

    for (const org of orgs) {
      selectOptions.push({
        value: org.login,
        label: org.login,
        hint: org.description || undefined,
      });
    }

    const selected = bail(
      await p.select({
        message: "GitHub organization",
        options: selectOptions,
      }),
    ) as string;

    if (selected === "__custom__") {
      const org = bail(
        await p.text({
          message: "Enter organization name",
          placeholder: "e.g. microsoft",
          validate: (v) => {
            if (!v.trim()) return "Organization name is required";
            return undefined;
          },
        }),
      );
      return org.trim();
    }

    return selected;
  } catch {
    s.stop("Could not fetch organizations — falling back to text input");
    const org = bail(
      await p.text({
        message: "GitHub organization (leave empty for all)",
        placeholder: "e.g. microsoft",
      }),
    );
    return org?.trim() || "";
  }
}

// ── Repo Selection ──────────────────────────────────────────────────

export interface RepoSelectOptions {
  token: string;
  owner: string;
}

/**
 * Prompt for repository selection using the GitHub API.
 *
 * Fetches repos for the owner and presents a `p.select()` list.
 * Falls back to text input if API fails or owner is empty.
 */
export async function promptRepoSelect(
  options: RepoSelectOptions,
): Promise<string> {
  const { token, owner } = options;

  // Fall back to text input when we can't look up repos or multi-owner
  const isMultiOwner = owner.includes(",");
  if (!owner || isMultiOwner) {
    const repo = bail(
      await p.text({
        message:
          "Specific repositories (comma-separated, leave empty for all)",
        placeholder: "e.g. vscode,typescript",
      }),
    );
    return repo?.trim() || "";
  }

  const s = p.spinner();
  s.start(`Fetching repositories for ${owner}`);

  try {
    // Try as org first, fall back to user
    let repos;
    try {
      repos = await fetchReposLite(token, owner, "org");
    } catch {
      repos = await fetchReposLite(token, owner, "user");
    }

    s.stop(`Found ${repos.length} repositor${repos.length !== 1 ? "ies" : "y"}`);

    // Too many repos or none — fall back to text input
    if (repos.length === 0 || repos.length > 200) {
      const repo = bail(
        await p.text({
          message:
            "Specific repositories (comma-separated, leave empty for all)",
          placeholder: "e.g. vscode,typescript",
        }),
      );
      return repo?.trim() || "";
    }

    // Build select options
    const selectOptions: Array<{
      value: string;
      label: string;
      hint?: string;
    }> = [
      { value: "", label: "All repositories", hint: `all repos in ${owner}` },
      {
        value: "__custom__",
        label: "Type custom name",
        hint: "comma-separated input",
      },
    ];

    for (const repo of repos) {
      selectOptions.push({
        value: repo.name,
        label: repo.name,
        hint: `default: ${repo.default_branch}`,
      });
    }

    const selected = bail(
      await p.select({
        message: "Repository",
        options: selectOptions,
      }),
    ) as string;

    if (selected === "__custom__") {
      const repo = bail(
        await p.text({
          message:
            "Enter repository names (comma-separated)",
          placeholder: "e.g. vscode,typescript",
          validate: (v) => {
            if (!v.trim()) return "At least one repository name is required";
            return undefined;
          },
        }),
      );
      return repo.trim();
    }

    return selected;
  } catch {
    s.stop("Could not fetch repositories — falling back to text input");
    const repo = bail(
      await p.text({
        message:
          "Specific repositories (comma-separated, leave empty for all)",
        placeholder: "e.g. vscode,typescript",
      }),
    );
    return repo?.trim() || "";
  }
}

// ── Source Directory Selection ───────────────────────────────────────

export interface SourceDirSelectOptions {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

/**
 * Prompt for source directory selection using the GitHub tree API.
 *
 * Fetches the file tree and extracts unique top-level directories,
 * presenting a `p.multiselect()`. Falls back to text input if
 * branch/repo not specified or API fails.
 */
export async function promptSourceDirSelect(
  options: SourceDirSelectOptions,
): Promise<string> {
  const { token, owner, repo, branch } = options;

  // Fall back to text input when we can't fetch the tree
  const hasMultipleRepos = repo.includes(",");
  const hasMultipleOwners = owner.includes(",");
  if (!owner || !repo || !branch || hasMultipleRepos || hasMultipleOwners) {
    const dirs = bail(
      await p.text({
        message: "Source directories to classify as code (comma-separated)",
        placeholder: "src,lib,app",
        defaultValue: "src",
        validate: (v) => {
          if (!v.trim()) return "At least one source directory is required";
          return undefined;
        },
      }),
    );
    return dirs?.trim() || "src";
  }

  const s = p.spinner();
  s.start(`Fetching directory tree for ${owner}/${repo}@${branch}`);

  try {
    const files = await fetchBranchTreeLite(token, owner, repo, branch);
    // Extract unique top-level directories
    const topDirs = new Set<string>();
    for (const file of files) {
      const firstSlash = file.path.indexOf("/");
      if (firstSlash > 0) {
        topDirs.add(file.path.substring(0, firstSlash));
      }
    }

    const dirList = [...topDirs].sort();
    s.stop(`Found ${dirList.length} top-level director${dirList.length !== 1 ? "ies" : "y"}`);

    if (dirList.length === 0) {
      const dirs = bail(
        await p.text({
          message: "Source directories to classify as code (comma-separated)",
          placeholder: "src,lib,app",
          defaultValue: "src",
          validate: (v) => {
            if (!v.trim()) return "At least one source directory is required";
            return undefined;
          },
        }),
      );
      return dirs?.trim() || "src";
    }

    // Build multiselect options
    const selectOptions: Array<{
      value: string;
      label: string;
    }> = [];

    for (const dir of dirList) {
      selectOptions.push({ value: dir, label: dir });
    }

    const selected = bail(
      await p.multiselect({
        message: "Source directories to classify as code",
        options: selectOptions,
        required: true,
      }),
    ) as string[];

    return selected.join(",");
  } catch {
    s.stop("Could not fetch directory tree — falling back to text input");
    const dirs = bail(
      await p.text({
        message: "Source directories to classify as code (comma-separated)",
        placeholder: "src,lib,app",
        defaultValue: "src",
        validate: (v) => {
          if (!v.trim()) return "At least one source directory is required";
          return undefined;
        },
      }),
    );
    return dirs?.trim() || "src";
  }
}

// ── Branch Selection ─────────────────────────────────────────────────

export interface BranchSelectOptions {
  token: string;
  owner: string;
  repo: string;
}

/**
 * Prompt for branch selection using the GitHub API.
 *
 * Supports multi-select: first choose a mode (default, all, select specific,
 * or type custom), then multiselect from fetched branches if "select specific".
 * Falls back to free-text input for multi-repo, missing owner/repo, or API failure.
 *
 * Returns comma-separated branch names when multiple are selected.
 */
export async function promptBranchSelect(
  options: BranchSelectOptions,
): Promise<string> {
  const { token, owner, repo } = options;

  // Fall back to text input when we can't fetch a single repo's branches
  const hasMultipleRepos = repo.includes(",");
  const hasMultipleOwners = owner.includes(",");
  if (!owner || !repo || hasMultipleRepos || hasMultipleOwners) {
    const branch = bail(
      await p.text({
        message:
          "Git branches (comma-separated, leave empty for default, * for all)",
        placeholder: "e.g. main,develop or *",
      }),
    );
    return branch?.trim() || "";
  }

  // Fetch branches from the API
  let branches: BranchInfo[] = [];
  const s = p.spinner();
  s.start(`Fetching branches for ${owner}/${repo}`);

  try {
    branches = await fetchBranchesLite(token, owner, repo);
    s.stop(`Found ${branches.length} branch${branches.length !== 1 ? "es" : ""}`);
  } catch (error: any) {
    s.stop("Could not fetch branches — falling back to text input");
    const branch = bail(
      await p.text({
        message:
          "Git branches (comma-separated, leave empty for default, * for all)",
        placeholder: "e.g. main,develop or *",
      }),
    );
    return branch?.trim() || "";
  }

  if (branches.length === 0) {
    const branch = bail(
      await p.text({
        message:
          "Git branches (comma-separated, leave empty for default, * for all)",
        placeholder: "e.g. main,develop or *",
      }),
    );
    return branch?.trim() || "";
  }

  // Step 1: choose mode
  const mode = bail(
    await p.select({
      message: "Git branch",
      options: [
        { value: "__default__", label: "Default branch", hint: "let GitHub decide" },
        { value: "__all__", label: "All branches", hint: "wildcard *" },
        { value: "__select__", label: "Select branches", hint: "pick one or more" },
        { value: "__custom__", label: "Type custom name", hint: "free-text input" },
      ],
    }),
  ) as string;

  if (mode === "__default__") return "";
  if (mode === "__all__") return "*";

  if (mode === "__custom__") {
    const branch = bail(
      await p.text({
        message: "Enter branch name(s) (comma-separated)",
        placeholder: "e.g. main,develop,feature/my-branch",
        validate: (v) => {
          if (!v.trim()) return "At least one branch name is required";
          return undefined;
        },
      }),
    );
    return branch.trim();
  }

  // Step 2: multiselect from fetched branches
  const branchOptions = branches.map((b) => ({
    value: b.name,
    label: b.name,
    hint: b.protected ? "protected" : undefined,
  }));

  const selected = bail(
    await p.multiselect({
      message: "Select branches",
      options: branchOptions,
      required: true,
    }),
  ) as string[];

  return selected.join(",");
}

// ── Token ────────────────────────────────────────────────────────────

/**
 * Prompt for GitHub token, or use environment variable.
 */
export async function promptToken(): Promise<string> {
  const envToken = resolveGithubEnv().token;

  if (envToken) {
    p.log.info("Using GitHub token from environment");
    return envToken;
  }

  const token = bail(
    await p.text({
      message: "GitHub Personal Access Token",
      placeholder: "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      validate: (v) => {
        if (!v.trim())
          return "Token is required (or set GITHUB_TOKEN env var)";
        return undefined;
      },
    }),
  );

  return token;
}

// ── Data Source ───────────────────────────────────────────────────────

export interface DataSourceOptions {
  /** Show "Current files in branch" option (for file-scan tools) */
  allowCurrentFiles?: boolean;
}

export interface DataSourceResult {
  start?: string;
  end?: string;
  ignoreDateRange: boolean;
  currentFiles: boolean;
}

/**
 * Prompt for data source: date range or current files in branch.
 */
export async function promptDataSource(
  options: DataSourceOptions = {},
): Promise<DataSourceResult> {
  const { allowCurrentFiles = false } = options;

  const dateOptions: Array<{
    value: string;
    label: string;
    hint?: string;
  }> = [
    {
      value: "last30",
      label: "Last 30 days",
      hint: `${daysAgo(30)} to ${today()}`,
    },
    {
      value: "last90",
      label: "Last 90 days",
      hint: `${daysAgo(90)} to ${today()}`,
    },
    {
      value: "lastX",
      label: "Last X days",
      hint: "enter number of days",
    },
    {
      value: "custom",
      label: "Custom range",
      hint: "specify start and end dates",
    },
    {
      value: "all",
      label: "All time",
      hint: "no date filtering",
    },
  ];

  if (allowCurrentFiles) {
    dateOptions.push({
      value: "currentFiles",
      label: "Current files in branch",
      hint: "scan file tree instead of commits",
    });
  }

  const dateMode = bail(
    await p.select({
      message: "Data source",
      options: dateOptions,
    }),
  );

  if (dateMode === "currentFiles") {
    return {
      ignoreDateRange: true,
      currentFiles: true,
    };
  }

  let start: string | undefined;
  let end: string | undefined;
  let ignoreDateRange = false;

  if (dateMode === "lastX") {
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
    const days = parseInt(daysStr.trim(), 10);
    start = daysAgo(days);
    end = today();
  } else if (dateMode === "custom") {
    start = bail(
      await p.text({
        message: "Start date",
        placeholder: "YYYY-MM-DD",
        validate: (v) => {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(v.trim()))
            return "Use YYYY-MM-DD format";
          if (new Date(v.trim()) > new Date())
            return "Start date cannot be in the future";
          return undefined;
        },
      }),
    );
    end = bail(
      await p.text({
        message: "End date",
        placeholder: "YYYY-MM-DD",
        validate: (v) => {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(v.trim()))
            return "Use YYYY-MM-DD format";
          if (new Date(v.trim()) > new Date())
            return "End date cannot be in the future";
          if (start && new Date(v.trim()) < new Date(start))
            return "End date must be after start date";
          return undefined;
        },
      }),
    );
  } else if (dateMode === "last90") {
    start = daysAgo(90);
    end = today();
  } else if (dateMode === "all") {
    ignoreDateRange = true;
  }
  // "last30" → defaults handled by validateAndNormalize

  return {
    start: start?.trim(),
    end: end?.trim(),
    ignoreDateRange,
    currentFiles: false,
  };
}

// ── Output Options ───────────────────────────────────────────────────

export interface OutputOptionsResult {
  format: string;
  outputDir: string;
  filename: string;
  totalRecords: string;
  delay: string;
  verbose: boolean;
  debug: boolean;
}

/**
 * Prompt for output format, directory, filename, records limit, delay, and extras.
 */
export async function promptOutputOptions(opts: {
  searchUser?: string;
}): Promise<OutputOptionsResult> {
  const format = bail(
    await p.select({
      message: "Output format",
      options: [
        {
          value: "json",
          label: "JSON",
          hint: "structured report with analytics",
        },
        {
          value: "csv",
          label: "CSV",
          hint: "flat table format (multiple files)",
        },
      ],
    }),
  );

  const outputDir = bail(
    await p.text({
      message: "Output directory",
      placeholder: "./output",
      defaultValue: "./output",
    }),
  );

  const defaultFilename = opts.searchUser
    ? `analysis-${opts.searchUser.trim()}`
    : "";

  const filename = bail(
    await p.text({
      message: "Output filename (leave empty for default)",
      placeholder: defaultFilename,
    }),
  );

  const totalRecords = bail(
    await p.text({
      message: "Max records to fetch (0 = no limit)",
      placeholder: "0",
      defaultValue: "0",
      validate: (v) => {
        if (!v.trim()) return undefined;
        const n = parseInt(v.trim(), 10);
        if (isNaN(n) || n < 0) return "Must be a non-negative number";
        return undefined;
      },
    }),
  );

  const delayStr = bail(
    await p.text({
      message: "Delay between API requests in seconds",
      placeholder: "6",
      defaultValue: "6",
      validate: (v) => {
        if (!v.trim()) return undefined;
        const n = parseInt(v.trim(), 10);
        if (isNaN(n) || n < 0) return "Must be a non-negative number";
        return undefined;
      },
    }),
  );

  const extras = bail(
    await p.multiselect({
      message: "Additional options",
      options: [
        { value: "verbose", label: "Verbose logging" },
        {
          value: "debug",
          label: "Debug mode",
          hint: "writes github.log + audit",
        },
      ],
      initialValues: [],
      required: false,
    }),
  ) as string[];

  return {
    format: format as string,
    outputDir: outputDir?.trim() || "./output",
    filename: filename?.trim() || "",
    totalRecords: totalRecords?.trim() || "0",
    delay: delayStr?.trim() || "6",
    verbose: extras.includes("verbose"),
    debug: extras.includes("debug"),
  };
}
