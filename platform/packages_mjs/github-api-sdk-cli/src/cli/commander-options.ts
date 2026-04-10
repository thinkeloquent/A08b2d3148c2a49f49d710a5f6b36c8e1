import type { Command } from "commander";

/**
 * Add all common CLI options shared across analysis tools.
 * Tool-specific options should be added separately after calling this.
 */
export function addCommonOptions(program: Command): Command {
  return program
    .option(
      "--searchUser <userIdentifier>",
      "GitHub username(s), comma-separated (optional if org or repo provided)",
    )
    .option("--org <org>", "GitHub organization(s), comma-separated")
    .option(
      "--repo <repo>",
      "Comma-separated list of specific repository names",
    )
    .option(
      "--branch <branch>",
      'Git branch (* for all, default: repo default)',
    )
    .option(
      "--currentFiles",
      "Analyze current files in branch instead of commits",
      false,
    )
    .option(
      "--meta-tags <key=value>",
      "Metadata tags (can be repeated)",
      (value: string, previous: string[]) => {
        return previous.concat([value]);
      },
      [] as string[],
    )
    .option("--format <format>", "Output format (json|csv)", "json")
    .option(
      "--outputDir <directory>",
      "Directory to save files",
      "./output",
    )
    .option("--filename <filename>", "Base name for output files")
    .option(
      "--ignoreDateRange",
      "Ignore date range and search all time",
      false,
    )
    .option("--start <date>", "Start date (YYYY-MM-DD)")
    .option("--end <date>", "End date (YYYY-MM-DD)")
    .option("--token <token>", "GitHub Personal Access Token")
    .option("--baseUrl <url>", "GitHub API base URL (e.g. https://api.github.com)")
    .option("--verbose", "Enable verbose logging", false)
    .option("--debug", "Enable debug logging", false)
    .option(
      "--loadData <filepath>",
      "Path to JSON file to load at runtime",
    )
    .option(
      "--totalRecords <number>",
      "Maximum total records to fetch across all sources (0 = no limit)",
      "0",
    )
    .option(
      "--delay <seconds>",
      "Delay between API requests in seconds",
      "6",
    )
    .option("--commitSha <sha>", "Filter by specific commit SHA")
    .option("--commitMessage <pattern>", "Filter by commit message pattern")
    .option("--searchQuery <query>", "Search query string")
    .option("--searchType <type>", "Search type: keyword, code, commitSearch, semantic")
    .option("--codeSearchMode <mode>", "Code search mode: exact, regex, symbol")
    .option("--searchQualifiers <qualifiers>", "Search qualifiers")
    .option("--sourceDirs <dirs>", "Comma-separated source directories")
    .option("--daysAgo <number>", "Relative time window in days (e.g. 7, 30, 90)")
    .option("--pullRequest <number>", "Fetch commits from a specific PR number");
}
