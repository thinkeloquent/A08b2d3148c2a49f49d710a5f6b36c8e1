/**
 * Static report metadata for dependency drift analysis.
 */

export const REPORT_VERSION = "1.0";
export const TOOL_NAME = "dependency-drift";
export const REPORT_DESCRIPTION = "Dependency Drift: Using the API to check the age of requirements.txt or package.json versions.";
export const REPORT_INSIGHT = "Insight: Measures how much \"Technical Debt\" or \"Documentation Debt\" a developer has to fight through daily.";
export const REPORT_ANALYSIS = "Discovers non-fork, non-archived repositories and fetches dependency manifests (package.json, requirements.txt, pyproject.toml, pom.xml, go.mod, Gemfile, Cargo.toml, etc.) across 8 ecosystems. Parses each manifest with ecosystem-specific parsers, deduplicates packages, then queries public registries (npm, PyPI, Maven, Go proxy, RubyGems, crates.io, NuGet, Packagist) for latest versions. Computes semver drift severity and drift age for every dependency.";
export const REPORT_IMPROVES = "Repository Hygiene";

export const REPORT_PLAIN_ENGLISH = {
  what: "Audits dependency files across a user's repositories, comparing declared versions against the latest published versions in public registries to identify outdated or critically drifted packages.",
  how: "Fetches dependency manifests from each repo, parses them with ecosystem-specific parsers (npm, PyPI, Maven, Go, Ruby, Cargo, NuGet, Composer), then queries each package's public registry for the latest version. Computes semver version drift and days-since-latest-release. Classifies severity from current through critical based on major versions behind.",
  why: "Outdated dependencies are a security and stability risk — this tool gives a precise, ecosystem-aware inventory of technical debt at the dependency layer, ranked by severity.",
  main_logic: "Validate user → discover repos (no forks, no archived) → for each repo × ecosystem: fetch dependency file → parse with ecosystem-specific parser → extract {name, currentVersion, type} → deduplicate by ecosystem:name → for each unique package: query public registry API for latest version → compute version drift (semver diff) and drift days → classify severity (current/minor/moderate/major/critical) → aggregate: severity distribution, by-ecosystem breakdown, by-repo drift scores, most outdated packages, stale manifests → output report.",
};

export const REPORT_FORMULA = [
  "Drift Score = (Outdated Dependencies / Total Dependencies) * 100",
  "Version Drift = latest_version - current_version (semver comparison)",
  "Drift Days = now - latest_publish_date (days since latest version published)",
  "Severity: current (0,0,0), minor (0 major), moderate (1 major), major (2-3 major), critical (4+ major)",
  "Health Rating: Excellent (<=10%), Good (<=25%), Fair (<=50%), Poor (<=75%), Critical (>75%)",
  "Stale Manifest = dependency file not updated in > 90 days",
];

/**
 * Build dynamic criteria entries based on config.
 * @param {object} config
 * @returns {string[]}
 */
export function buildCriteria(config) {
  return [
    `Repositories discovered for user/org: ${config.searchUser}`,
    `Dependency files scanned: ${config.ecosystems.split(",").map((e) => {
      if (e.trim() === "npm") return "package.json";
      if (e.trim() === "pypi") return "requirements.txt, pyproject.toml";
      return e;
    }).join(", ")}`,
    `Current versions compared against latest releases on npm/PyPI registries`,
    `Drift severity: current (up-to-date), minor (patch/minor behind), moderate (1 major), major (2-3 major), critical (4+ major)`,
    !config.ignoreDateRange && config.start && config.end
      ? `Date range filter (by push date): ${config.start} to ${config.end}`
      : "Date range: All time",
    config.org ? `Organization scope: ${config.org}` : null,
    config.repo ? `Repository scope: ${config.repo}` : null,
    config.totalRecords > 0
      ? `Repository scan limit: ${config.totalRecords}`
      : null,
    "Forked and archived repositories excluded",
  ].filter(Boolean);
}
