export { GitHubUserSchema } from "./user-schema.mjs";
export {
  DependencyEntrySchema,
  RepositoryDependenciesSchema,
} from "./dependency-schema.mjs";

/**
 * Supported dependency ecosystems.
 */
export const ECOSYSTEMS = {
  NPM: "npm",
  PYPI: "pypi",
  MAVEN: "maven",
  GO: "go",
  RUBYGEMS: "rubygems",
  CARGO: "cargo",
  NUGET: "nuget",
  COMPOSER: "composer",
};

/**
 * Dependency file paths to check per ecosystem.
 */
export const DEPENDENCY_FILES = {
  npm: ["package.json"],
  pypi: ["requirements.txt", "pyproject.toml"],
  maven: ["pom.xml", "build.gradle", "build.gradle.kts"],
  go: ["go.mod"],
  rubygems: ["Gemfile"],
  cargo: ["Cargo.toml"],
  nuget: ["packages.config", "Directory.Packages.props"],
  composer: ["composer.json"],
};

/**
 * Drift severity thresholds (based on major versions behind).
 */
export const DRIFT_SEVERITY = {
  CURRENT: "current",
  MINOR: "minor",
  MODERATE: "moderate",
  MAJOR: "major",
  CRITICAL: "critical",
};

/**
 * Drift severity thresholds for classification.
 * - current: 0 major, 0 minor behind
 * - minor: 0 major behind, any minor/patch
 * - moderate: 1 major version behind
 * - major: 2-3 major versions behind
 * - critical: 4+ major versions behind or unmaintained
 */
export const DRIFT_THRESHOLDS = {
  MODERATE: 1,
  MAJOR: 2,
  CRITICAL: 4,
};

/**
 * Dependency type classifications for npm package.json.
 */
export const NPM_DEP_TYPES = {
  dependencies: "production",
  devDependencies: "development",
  peerDependencies: "production",
  optionalDependencies: "optional",
};
