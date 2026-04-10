/**
 * Static report metadata for markdown-to-code ratio analysis.
 */

export const REPORT_VERSION = "1.0";
export const TOOL_NAME = "markdown-to-code";
export const REPORT_DESCRIPTION = "Markdown-to-Code Ratio: Correlating commit volume in (.md, .mdx) coverage of code";
export const REPORT_INSIGHT = "Insight: Measures how much \"Technical Debt\" or \"Documentation Debt\" a developer has to fight through daily.";
export const REPORT_ANALYSIS = "Classifies every file in each commit as DOCUMENTATION (matching doc extensions like .md/.mdx), CODE (in source directories or matching code extensions), or OTHER. Categorizes commits as doc_only, code_only, mixed, or other_only. Computes doc-to-code ratios by both file count and line changes. Alternatively operates in current-files mode by fetching branch trees to assess live file-level documentation coverage.";
export const REPORT_IMPROVES = "Repository Hygiene";

export const REPORT_PLAIN_ENGLISH = {
  what: "Measures the ratio of documentation file changes (.md, .mdx) to source code file changes across a developer's commit history, or the live file ratio in the current branch.",
  how: "Fetches commits with file details per repository, classifies each file by extension (documentation vs code vs other), then categorizes entire commits. Computes docToCodeRatio = doc file changes / code file changes, and a line-level ratio from additions+deletions. In current-files mode, fetches branch trees and counts files directly.",
  why: "Repositories with high code churn but low documentation ratios accumulate knowledge debt — this metric acts as a proxy for documentation health and onboarding friction.",
  main_logic: "Validate user → discover repos → [commit mode]: fetch commits with file details per repo → classify each file (DOC | CODE | OTHER) → classify each commit (doc_only | code_only | mixed | other_only) → [file mode]: fetch branch tree → count files by type → compute docToCodeRatio and docToCodeLinesRatio → classify coverage (excellent ≥ 0.3 through minimal < 0.01) → commit type distribution → per-repo breakdown → flag undocumented repos (ratio < 0.05) → weekly/daily trends → output report.",
};

export const REPORT_FORMULA = [
  "Doc-to-Code Ratio = total_doc_file_changes / total_code_file_changes",
  "Doc-to-Code Lines Ratio = (doc_additions + doc_deletions) / (code_additions + code_deletions)",
  "Coverage Classification: excellent (>=0.3), good (>=0.15), moderate (>=0.05), low (>=0.01), minimal (<0.01)",
  "Commit Type = doc_only | code_only | mixed | other_only based on file categories in commit",
  "File is documentation if extension matches docExtensions (default: .md, .mdx)",
  "File is code if in sourceDirs or has a recognized code extension",
];

/**
 * Build dynamic criteria entries based on config.
 * @param {object} config
 * @returns {string[]}
 */
export function buildCriteria(config) {
  return [
    `Commits filtered for user: ${config.searchUser}`,
    `Documentation files: any file with extensions ${config.docExtensions.join(", ")}`,
    `Code files: files in source directories (${config.sourceDirs.join(", ")}) or common code extensions`,
    `Doc-to-Code Ratio = documentation file changes / code file changes`,
    `Doc-to-Code Lines Ratio = (doc additions + deletions) / (code additions + deletions)`,
    `Commit types: doc_only (only doc files), code_only (only code files), mixed (both), other_only (neither)`,
    !config.ignoreDateRange && config.start && config.end
      ? `Date range: ${config.start} to ${config.end}`
      : "Date range: All time",
    config.org ? `Organization scope: ${config.org}` : null,
    config.repo ? `Repository scope: ${config.repo}` : null,
    config.totalRecords > 0
      ? `Total records limit: ${config.totalRecords}`
      : null,
  ].filter(Boolean);
}
