/**
 * Report Metadata
 *
 * Static metadata constants and dynamic criteria builder for the
 * GitHub Component Usage Audit tool.
 */

export const REPORT_VERSION = "1.0";
export const TOOL_NAME = "github-component-usage-audit";
export const REPORT_DESCRIPTION =
  "Audits real-world usage of a specific React UI component across public GitHub repositories.";

export const REPORT_PLAIN_ENGLISH = {
  what: "Finds how a named React component (e.g. MUI Accordion) is actually used across public GitHub repos.",
  how: "Searches GitHub code for import statements, validates repos by stars/archived status, fetches raw file content, and extracts JSX usage patterns via regex.",
  why: "Provides real-world usage examples to inform component API design decisions, documentation, and migration strategies.",
  main_logic:
    "Code Search → Repo Validation (stars ≥ N, not archived) → Raw Content Fetch → Dual-State JSX Regex Extraction → JSON Report.",
};

export const REPORT_FORMULA = [
  "Query: import { ComponentName } extension:tsx extension:jsx size:>minFileSize",
  "Repo filter: stargazers_count ≥ minStars AND archived === false",
  "JSX extraction: self-closing <C /> + paired <C>...</C> via regex",
  "Max results: maxPages × 100 (capped at 1000)",
];

/**
 * Build dynamic search criteria description from config.
 *
 * @param {object} config - Normalized configuration.
 * @returns {string[]} Array of human-readable criteria lines.
 */
export function buildCriteria(config) {
  return [
    `Component: ${config.componentName}`,
    `Minimum stars: ${config.minStars}`,
    `Minimum file size: ${config.minFileSize} bytes`,
    `Max pages: ${config.maxPages} (${config.maxPages * 100} results max)`,
    `Output format: ${config.format.toUpperCase()}`,
    config.outputDir ? `Output directory: ${config.outputDir}` : null,
  ].filter(Boolean);
}
