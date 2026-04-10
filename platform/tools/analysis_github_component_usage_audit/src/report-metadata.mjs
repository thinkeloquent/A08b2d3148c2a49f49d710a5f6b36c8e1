/**
 * Static report metadata for GitHub Component Usage Audit.
 */

export const REPORT_VERSION = "1.0";
export const TOOL_NAME = "component-usage-audit";
export const REPORT_DESCRIPTION = "Audits real-world usage of a specific React UI component (e.g. MUI Accordion) across public GitHub repositories by searching code, validating repos, and extracting JSX patterns.";
export const REPORT_INSIGHT = "Insight: Real-world usage patterns reveal how developers actually consume a component — common prop combinations, nesting patterns, and typical wrapper structures.";
export const REPORT_ANALYSIS = "Searches GitHub code for import statements matching the target component, validates each repository (stars >= threshold, not archived), fetches raw file content, and extracts JSX usage snippets via dual-state regex (self-closing + paired tags).";
export const REPORT_IMPROVES = "Component API design, documentation, and migration strategy";

export const REPORT_PLAIN_ENGLISH = {
  what: "Finds how a named React component (e.g. MUI Accordion) is actually used across public GitHub repos.",
  how: "Searches GitHub code for import statements, validates repos by stars/archived status, fetches raw file content, and extracts JSX usage patterns via regex.",
  why: "Provides real-world usage examples to inform component API design decisions, documentation, and migration strategies.",
  main_logic: "Code Search (import pattern) → Repo Validation (stars >= N, not archived) → Raw Content Fetch → Dual-State JSX Regex Extraction → JSON Report.",
};

export const REPORT_FORMULA = [
  'Query: "import { ComponentName }" extension:tsx extension:jsx size:>minFileSize',
  "Repo filter: stargazers_count >= minStars AND archived === false",
  "JSX extraction: self-closing <C /> + paired <C>...</C> via regex",
  "Max results: maxPages x 100 (capped at 1000)",
];

/**
 * Build dynamic criteria entries based on config.
 * @param {object} config
 * @returns {string[]}
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
