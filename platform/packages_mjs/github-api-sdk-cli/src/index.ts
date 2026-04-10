// ── GitHub Client ────────────────────────────────────────────────────
export { createGitHubClient } from "./github/client.js";
export type { GitHubClient, GitHubClientConfig, GitHubClientDeps } from "./github/client.js";
export { createRateLimiters } from "./github/rate-limiters.js";
export { createRequestFn, createSearchRequestFn } from "./github/request.js";
export type { MakeRequestFn, MakeSearchRequestFn } from "./github/request.js";

// ── GitHub Context ───────────────────────────────────────────────────
export type { SharedContext, BaseConfig as ContextBaseConfig } from "./github/context.js";

// ── GitHub Endpoints ─────────────────────────────────────────────────
export { validateUser, GitHubUserSchema } from "./github/endpoints/users.js";
export type { GitHubUser } from "./github/endpoints/users.js";
export { fetchUserRepos } from "./github/endpoints/repos.js";
export type { RepoInfo } from "./github/endpoints/repos.js";
export { fetchRepoCommits } from "./github/endpoints/commits.js";
export type { CommitRecord } from "./github/endpoints/commits.js";
export { fetchPullRequestCommits } from "./github/endpoints/pull-request-commits.js";
export { fetchBranchesLite, fetchBranches, fetchBranchTree, fetchBranchTreeLite } from "./github/endpoints/branches.js";
export type { BranchInfo, TreeFile } from "./github/endpoints/branches.js";
export { fetchUserOrgsLite } from "./github/endpoints/orgs.js";
export type { OrgInfo } from "./github/endpoints/orgs.js";
export { fetchReposLite } from "./github/endpoints/repos-lite.js";
export type { RepoBasicInfo } from "./github/endpoints/repos-lite.js";

// ── CLI ──────────────────────────────────────────────────────────────
export {
  bail,
  daysAgo,
  today,
  promptQueryInput,
  promptUsername,
  promptOrgSelect,
  promptRepoSelect,
  promptSourceDirSelect,
  promptBranchSelect,
  promptToken,
  promptDataSource,
  promptOutputOptions,
} from "./cli/prompts.js";
export type {
  QueryInputOptions,
  QueryInputResult,
  UsernamePromptOptions,
  OrgSelectOptions,
  RepoSelectOptions,
  SourceDirSelectOptions,
  BranchSelectOptions,
  DataSourceOptions,
  DataSourceResult,
  OutputOptionsResult,
} from "./cli/prompts.js";
export {
  promptHierarchyScope,
  promptHierarchyCascade,
  promptCommitSearch,
  promptSearchQuery,
} from "./cli/hierarchy-prompts.js";
export {
  HIERARCHY_LEVELS,
} from "./cli/hierarchy-types.js";
export type {
  HierarchyLevel,
  LevelRequirement,
  HierarchyScopeConfig,
  HierarchyScope,
  CommitSearchMode,
  CommitSearchResult,
  SearchType,
  CodeSearchMode,
  SearchQueryResult,
  HierarchyResult,
} from "./cli/hierarchy-types.js";
export { addCommonOptions } from "./cli/commander-options.js";
export { validateAndNormalize } from "./cli/defaults-and-validate.js";
export type { ValidateOptions } from "./cli/defaults-and-validate.js";
export { parseMetaTags } from "./cli/parse-meta-tags.js";

// ── Config ───────────────────────────────────────────────────────────
export { BaseConfigSchema } from "./config/base-schema.js";
export type { BaseConfig } from "./config/base-schema.js";
export { normalizeConfig } from "./config/normalize.js";

// ── Reporting ────────────────────────────────────────────────────────
export { writeAuditReport } from "./reporting/audit-writer.js";
export type { ApiCallRecord } from "./reporting/audit-writer.js";

// ── Utils ────────────────────────────────────────────────────────────
export { createLogger } from "./utils/logger.js";
export type { LogFn, OutputFn, LogLevel, LoggerConfig } from "./utils/logger.js";
export { createDebugLogger } from "./utils/debug-log.js";
export type { DebugLogFn, DebugConfig } from "./utils/debug-log.js";
export { ensureDir } from "./utils/fsx.js";
export { delay } from "./utils/delay.js";
export { checkTotalRecordsLimit, getRemainingRecords } from "./utils/records-limit.js";
export type { RecordsConfig, MutableCounter } from "./utils/records-limit.js";
export { StreamWriter } from "./utils/stream-writer.js";
export type {
  StreamWriterOptions,
  StreamHeader,
  StreamRecord,
  StreamFooter,
  StreamContents,
} from "./utils/stream-writer.js";
