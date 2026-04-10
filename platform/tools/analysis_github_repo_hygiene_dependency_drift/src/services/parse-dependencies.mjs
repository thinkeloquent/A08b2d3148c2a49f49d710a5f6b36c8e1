import { NPM_DEP_TYPES } from "../domain/models.mjs";

/**
 * Parse dependencies from a package.json file content.
 * @param {string} content - Raw JSON content of package.json
 * @param {string} repository - Repository full name (owner/repo)
 * @returns {Array<{name: string, currentVersion: string, dependencyType: string, ecosystem: string, repository: string}>}
 */
export function parseNpmDependencies(content, repository) {
  let pkg;
  try {
    pkg = JSON.parse(content);
  } catch {
    return [];
  }

  const deps = [];

  for (const [section, depType] of Object.entries(NPM_DEP_TYPES)) {
    const sectionDeps = pkg[section];
    if (!sectionDeps || typeof sectionDeps !== "object") continue;

    for (const [name, versionSpec] of Object.entries(sectionDeps)) {
      // Extract a clean version from the spec (strip ^, ~, >=, etc.)
      const cleanVersion = cleanNpmVersion(versionSpec);
      if (!cleanVersion) continue;

      deps.push({
        name,
        currentVersion: cleanVersion,
        rawVersionSpec: versionSpec,
        dependencyType: depType,
        ecosystem: "npm",
        repository,
      });
    }
  }

  return deps;
}

/**
 * Parse dependencies from a requirements.txt file content.
 * @param {string} content - Raw content of requirements.txt
 * @param {string} repository - Repository full name (owner/repo)
 * @returns {Array<{name: string, currentVersion: string, dependencyType: string, ecosystem: string, repository: string}>}
 */
export function parsePypiRequirements(content, repository) {
  const deps = [];
  const lines = content.split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Skip empty lines, comments, and flags
    if (!line || line.startsWith("#") || line.startsWith("-")) continue;

    // Handle inline comments
    const withoutComment = line.split("#")[0].trim();
    if (!withoutComment) continue;

    // Parse "package==version", "package>=version", "package~=version"
    const match = withoutComment.match(/^([a-zA-Z0-9_.-]+)\s*([=~<>!]+)\s*([^\s,;]+)/);
    if (match) {
      const [, name, , version] = match;
      deps.push({
        name: normalizePypiName(name),
        currentVersion: version,
        rawVersionSpec: withoutComment,
        dependencyType: "production",
        ecosystem: "pypi",
        repository,
      });
    } else {
      // Bare package name without version — record it but version is unknown
      const bareName = withoutComment.match(/^([a-zA-Z0-9_.-]+)/);
      if (bareName) {
        deps.push({
          name: normalizePypiName(bareName[1]),
          currentVersion: "unknown",
          rawVersionSpec: withoutComment,
          dependencyType: "production",
          ecosystem: "pypi",
          repository,
        });
      }
    }
  }

  return deps;
}

/**
 * Parse dependencies from a pyproject.toml file content.
 * Handles the [project] dependencies and [project.optional-dependencies] sections.
 * @param {string} content - Raw content of pyproject.toml
 * @param {string} repository - Repository full name (owner/repo)
 * @returns {Array<{name: string, currentVersion: string, dependencyType: string, ecosystem: string, repository: string}>}
 */
export function parsePyprojectToml(content, repository) {
  const deps = [];

  // Simple TOML parsing for the dependencies array
  // Look for dependencies = [...] under [project]
  const projectMatch = content.match(/\[project\]/);
  if (!projectMatch) return deps;

  // Extract the section after [project] until the next [section]
  const projectStart = projectMatch.index + projectMatch[0].length;
  const nextSection = content.indexOf("\n[", projectStart);
  const projectSection = nextSection > -1
    ? content.slice(projectStart, nextSection)
    : content.slice(projectStart);

  // Find dependencies = [...]
  const depsMatch = projectSection.match(/dependencies\s*=\s*\[([\s\S]*?)\]/);
  if (depsMatch) {
    const depsBlock = depsMatch[1];
    const depLines = depsBlock.split("\n")
      .map((l) => l.trim().replace(/^["']|["'],?$/g, ""))
      .filter((l) => l && !l.startsWith("#"));

    for (const depLine of depLines) {
      const match = depLine.match(/^([a-zA-Z0-9_.-]+)\s*([=~<>!]+)\s*([^\s,;"']+)/);
      if (match) {
        deps.push({
          name: normalizePypiName(match[1]),
          currentVersion: match[3],
          rawVersionSpec: depLine,
          dependencyType: "production",
          ecosystem: "pypi",
          repository,
        });
      }
    }
  }

  // Extract optional-dependencies
  const optDepsRegex = /\[project\.optional-dependencies\.([\w-]+)\]\s*\n([\s\S]*?)(?=\n\[|$)/g;
  let optMatch;
  while ((optMatch = optDepsRegex.exec(content)) !== null) {
    const groupName = optMatch[1];
    const block = optMatch[2];
    const depType = groupName === "dev" || groupName === "test" ? "development" : "optional";

    const lines = block.split("\n")
      .map((l) => l.trim().replace(/^["']|["'],?$/g, ""))
      .filter((l) => l && !l.startsWith("#"));

    for (const line of lines) {
      const match = line.match(/^([a-zA-Z0-9_.-]+)\s*([=~<>!]+)\s*([^\s,;"']+)/);
      if (match) {
        deps.push({
          name: normalizePypiName(match[1]),
          currentVersion: match[3],
          rawVersionSpec: line,
          dependencyType: depType,
          ecosystem: "pypi",
          repository,
        });
      }
    }
  }

  return deps;
}

/**
 * Clean an npm version specifier to extract a semver version.
 * Handles ^, ~, >=, workspace:, etc.
 * @param {string} spec - Version specifier from package.json
 * @returns {string | null} clean semver string or null if unparseable
 */
function cleanNpmVersion(spec) {
  if (!spec || typeof spec !== "string") return null;

  // Skip non-semver specs
  if (
    spec.startsWith("file:") ||
    spec.startsWith("link:") ||
    spec.startsWith("git") ||
    spec.startsWith("http://") ||
    spec.startsWith("https://") ||
    spec === "*" ||
    spec === "latest"
  ) {
    return null;
  }

  // Handle workspace protocol
  if (spec.startsWith("workspace:")) {
    return null;
  }

  // Strip range operators and extract version
  const cleaned = spec.replace(/^[\^~>=<|!\s]+/, "").split(" ")[0];
  if (/^\d+\.\d+/.test(cleaned)) {
    return cleaned;
  }

  return null;
}

/**
 * Normalize a PyPI package name (PEP 503).
 * Converts to lowercase and replaces hyphens/underscores/dots with hyphens.
 * @param {string} name
 * @returns {string}
 */
function normalizePypiName(name) {
  return name.toLowerCase().replace(/[-_.]+/g, "-");
}

// ── Maven (pom.xml) ─────────────────────────────────────────────────

/**
 * Parse dependencies from a Maven pom.xml file.
 * @param {string} content - Raw XML content of pom.xml
 * @param {string} repository - Repository full name (owner/repo)
 */
export function parseMavenDependencies(content, repository) {
  const deps = [];

  const depsBlockMatch = content.match(/<dependencies>([\s\S]*?)<\/dependencies>/g);
  if (!depsBlockMatch) return deps;

  for (const block of depsBlockMatch) {
    const depRegex = /<dependency>([\s\S]*?)<\/dependency>/g;
    let match;
    while ((match = depRegex.exec(block)) !== null) {
      const depXml = match[1];
      const groupId = extractXmlTag(depXml, "groupId");
      const artifactId = extractXmlTag(depXml, "artifactId");
      const version = extractXmlTag(depXml, "version");
      const scope = extractXmlTag(depXml, "scope");

      if (!groupId || !artifactId) continue;
      if (version && version.startsWith("${")) continue;

      deps.push({
        name: `${groupId}:${artifactId}`,
        currentVersion: version || "unknown",
        rawVersionSpec: version || "",
        dependencyType: mavenScopeToDepType(scope),
        ecosystem: "maven",
        repository,
      });
    }
  }

  return deps;
}

function extractXmlTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>\\s*([^<]+?)\\s*</${tag}>`));
  return match ? match[1].trim() : null;
}

function mavenScopeToDepType(scope) {
  if (!scope) return "production";
  switch (scope.toLowerCase()) {
    case "test": return "development";
    case "provided": return "build";
    default: return "production";
  }
}

// ── Gradle (build.gradle / build.gradle.kts) ────────────────────────

/**
 * Parse dependencies from a Gradle build file.
 * Handles both Groovy DSL and Kotlin DSL syntax.
 * @param {string} content - Raw content of build.gradle or build.gradle.kts
 * @param {string} repository - Repository full name (owner/repo)
 */
export function parseGradleDependencies(content, repository) {
  const deps = [];

  // Match: configuration 'group:name:version', configuration "group:name:version",
  //        configuration("group:name:version") (Kotlin DSL)
  const configRegex = /\b(implementation|api|compileOnly|runtimeOnly|testImplementation|testCompileOnly|testRuntimeOnly|classpath|annotationProcessor|kapt)\s*[\(]?\s*['"]([^'"]+?):([^'"]+?):([^'"]+?)['"]\s*[\)]?/g;

  let match;
  while ((match = configRegex.exec(content)) !== null) {
    const [, config, groupId, artifactId, version] = match;
    if (version.startsWith("$") || version.includes("${")) continue;

    deps.push({
      name: `${groupId}:${artifactId}`,
      currentVersion: version,
      rawVersionSpec: `${groupId}:${artifactId}:${version}`,
      dependencyType: gradleConfigToDepType(config),
      ecosystem: "maven",
      repository,
    });
  }

  return deps;
}

function gradleConfigToDepType(config) {
  switch (config) {
    case "testImplementation":
    case "testCompileOnly":
    case "testRuntimeOnly":
      return "development";
    case "compileOnly":
    case "annotationProcessor":
    case "kapt":
      return "build";
    default:
      return "production";
  }
}

// ── Go (go.mod) ─────────────────────────────────────────────────────

/**
 * Parse dependencies from a go.mod file.
 * @param {string} content - Raw content of go.mod
 * @param {string} repository - Repository full name (owner/repo)
 */
export function parseGoMod(content, repository) {
  const deps = [];

  // Multi-line require block: require ( ... )
  const requireBlockRegex = /require\s*\(([\s\S]*?)\)/g;
  let blockMatch;
  while ((blockMatch = requireBlockRegex.exec(content)) !== null) {
    const lines = blockMatch[1].split("\n");
    for (const line of lines) {
      const dep = parseGoRequireLine(line.trim(), repository);
      if (dep) deps.push(dep);
    }
  }

  // Single-line require: require module v1.2.3
  const singleRegex = /^require\s+(\S+)\s+(v[\d.]+\S*)/gm;
  let singleMatch;
  while ((singleMatch = singleRegex.exec(content)) !== null) {
    deps.push({
      name: singleMatch[1],
      currentVersion: singleMatch[2],
      rawVersionSpec: singleMatch[2],
      dependencyType: "production",
      ecosystem: "go",
      repository,
    });
  }

  return deps;
}

function parseGoRequireLine(line, repository) {
  if (!line || line.startsWith("//")) return null;

  const match = line.match(/^(\S+)\s+(v[\d.]+\S*)/);
  if (!match) return null;

  return {
    name: match[1],
    currentVersion: match[2],
    rawVersionSpec: match[2],
    dependencyType: line.includes("// indirect") ? "optional" : "production",
    ecosystem: "go",
    repository,
  };
}

// ── Ruby (Gemfile) ──────────────────────────────────────────────────

/**
 * Parse dependencies from a Gemfile.
 * @param {string} content - Raw content of Gemfile
 * @param {string} repository - Repository full name (owner/repo)
 */
export function parseGemfile(content, repository) {
  const deps = [];
  let currentGroup = null;

  const lines = content.split("\n");
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    if (line.match(/^group\s+.*:(development|test|doc)/)) {
      currentGroup = "development";
      continue;
    }
    if (line === "end") {
      currentGroup = null;
      continue;
    }

    const gemMatch = line.match(/^\s*gem\s+['"]([^'"]+)['"]\s*(?:,\s*['"]([^'"]*)['"]\s*)?/);
    if (gemMatch) {
      const [, name, versionSpec] = gemMatch;
      const version = versionSpec ? cleanGemVersion(versionSpec) : "unknown";

      deps.push({
        name,
        currentVersion: version,
        rawVersionSpec: versionSpec || "",
        dependencyType: currentGroup || "production",
        ecosystem: "rubygems",
        repository,
      });
    }
  }

  return deps;
}

function cleanGemVersion(spec) {
  if (!spec) return "unknown";
  const cleaned = spec.replace(/^[~>=<!\s]+/, "").trim();
  return cleaned || "unknown";
}

// ── Rust (Cargo.toml) ───────────────────────────────────────────────

/**
 * Parse dependencies from a Cargo.toml file.
 * @param {string} content - Raw content of Cargo.toml
 * @param {string} repository - Repository full name (owner/repo)
 */
export function parseCargoToml(content, repository) {
  const deps = [];

  const sections = [
    { regex: /\[dependencies\]\s*\n([\s\S]*?)(?=\n\[|$)/, type: "production" },
    { regex: /\[dev-dependencies\]\s*\n([\s\S]*?)(?=\n\[|$)/, type: "development" },
    { regex: /\[build-dependencies\]\s*\n([\s\S]*?)(?=\n\[|$)/, type: "build" },
  ];

  for (const { regex, type } of sections) {
    const sectionMatch = content.match(regex);
    if (!sectionMatch) continue;

    const lines = sectionMatch[1].split("\n");
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#") || line.startsWith("[")) break;

      // Simple: name = "version"
      let match = line.match(/^([a-zA-Z0-9_-]+)\s*=\s*"([^"]+)"/);
      if (match) {
        deps.push({
          name: match[1],
          currentVersion: cleanCargoVersion(match[2]),
          rawVersionSpec: match[2],
          dependencyType: type,
          ecosystem: "cargo",
          repository,
        });
        continue;
      }

      // Table: name = { version = "1.0", ... }
      match = line.match(/^([a-zA-Z0-9_-]+)\s*=\s*\{.*?version\s*=\s*"([^"]+)"/);
      if (match) {
        deps.push({
          name: match[1],
          currentVersion: cleanCargoVersion(match[2]),
          rawVersionSpec: match[2],
          dependencyType: type,
          ecosystem: "cargo",
          repository,
        });
      }
    }
  }

  return deps;
}

function cleanCargoVersion(spec) {
  return spec.replace(/^[\^~>=<!\s]+/, "").trim() || "unknown";
}

// ── NuGet (packages.config) ─────────────────────────────────────────

/**
 * Parse dependencies from a NuGet packages.config file.
 * @param {string} content - Raw XML content
 * @param {string} repository - Repository full name (owner/repo)
 */
export function parseNugetPackagesConfig(content, repository) {
  const deps = [];

  const packageRegex = /<package\s+[^>]*id=["']([^"']+)["'][^>]*version=["']([^"']+)["'][^>]*\/?>/gi;
  let match;
  while ((match = packageRegex.exec(content)) !== null) {
    deps.push({
      name: match[1],
      currentVersion: match[2],
      rawVersionSpec: match[2],
      dependencyType: "production",
      ecosystem: "nuget",
      repository,
    });
  }

  return deps;
}

// ── NuGet (Directory.Packages.props) ────────────────────────────────

/**
 * Parse dependencies from a NuGet Directory.Packages.props file.
 * @param {string} content - Raw XML content
 * @param {string} repository - Repository full name (owner/repo)
 */
export function parseNugetDirectoryPackages(content, repository) {
  const deps = [];

  // <PackageVersion Include="Name" Version="1.0.0" />
  const pkgRegex = /<PackageVersion\s+[^>]*Include=["']([^"']+)["'][^>]*Version=["']([^"']+)["'][^>]*\/?>/gi;
  let match;
  while ((match = pkgRegex.exec(content)) !== null) {
    deps.push({
      name: match[1],
      currentVersion: match[2],
      rawVersionSpec: match[2],
      dependencyType: "production",
      ecosystem: "nuget",
      repository,
    });
  }

  // Also check for PackageReference (sometimes in .props files)
  const refRegex = /<PackageReference\s+[^>]*Include=["']([^"']+)["'][^>]*Version=["']([^"']+)["'][^>]*\/?>/gi;
  while ((match = refRegex.exec(content)) !== null) {
    deps.push({
      name: match[1],
      currentVersion: match[2],
      rawVersionSpec: match[2],
      dependencyType: "production",
      ecosystem: "nuget",
      repository,
    });
  }

  return deps;
}

// ── Composer (composer.json) ─────────────────────────────────────────

/**
 * Parse dependencies from a Composer composer.json file.
 * @param {string} content - Raw JSON content
 * @param {string} repository - Repository full name (owner/repo)
 */
export function parseComposerJson(content, repository) {
  let pkg;
  try {
    pkg = JSON.parse(content);
  } catch {
    return [];
  }

  const deps = [];
  const sections = {
    require: "production",
    "require-dev": "development",
  };

  for (const [section, depType] of Object.entries(sections)) {
    const sectionDeps = pkg[section];
    if (!sectionDeps || typeof sectionDeps !== "object") continue;

    for (const [name, versionSpec] of Object.entries(sectionDeps)) {
      if (name === "php" || name.startsWith("ext-")) continue;

      const cleanVersion = cleanComposerVersion(versionSpec);
      if (!cleanVersion) continue;

      deps.push({
        name,
        currentVersion: cleanVersion,
        rawVersionSpec: versionSpec,
        dependencyType: depType,
        ecosystem: "composer",
        repository,
      });
    }
  }

  return deps;
}

function cleanComposerVersion(spec) {
  if (!spec || typeof spec !== "string") return null;
  if (spec === "*" || spec.startsWith("dev-")) return null;

  const cleaned = spec.replace(/^[\^~>=<|v!\s]+/, "").split(" ")[0].split(",")[0].split("|")[0].trim();
  if (/^\d+/.test(cleaned)) return cleaned;
  return null;
}

// ── Unified parser dispatcher ───────────────────────────────────────

/**
 * Route to the appropriate parser based on ecosystem and file path.
 * @param {string} ecosystem
 * @param {string} filePath
 * @param {string} content - Raw file content
 * @param {string} repository - Repository full name (owner/repo)
 * @returns {Array}
 */
export function parseDependencyFile(ecosystem, filePath, content, repository) {
  switch (ecosystem) {
    case "npm":
      if (filePath === "package.json") return parseNpmDependencies(content, repository);
      break;
    case "pypi":
      if (filePath === "requirements.txt") return parsePypiRequirements(content, repository);
      if (filePath === "pyproject.toml") return parsePyprojectToml(content, repository);
      break;
    case "maven":
      if (filePath === "pom.xml") return parseMavenDependencies(content, repository);
      if (filePath === "build.gradle" || filePath === "build.gradle.kts") return parseGradleDependencies(content, repository);
      break;
    case "go":
      if (filePath === "go.mod") return parseGoMod(content, repository);
      break;
    case "rubygems":
      if (filePath === "Gemfile") return parseGemfile(content, repository);
      break;
    case "cargo":
      if (filePath === "Cargo.toml") return parseCargoToml(content, repository);
      break;
    case "nuget":
      if (filePath === "packages.config") return parseNugetPackagesConfig(content, repository);
      if (filePath === "Directory.Packages.props") return parseNugetDirectoryPackages(content, repository);
      break;
    case "composer":
      if (filePath === "composer.json") return parseComposerJson(content, repository);
      break;
  }
  return [];
}
