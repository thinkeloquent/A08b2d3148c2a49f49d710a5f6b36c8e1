import { CLIProgressHelper } from "@internal/cli-progressor";
import {
  validateUser,
  fetchUserRepos,
  fetchBranches,
  fetchBranchTree,
} from "@internal/github-api-sdk-cli";
import { fetchFileContents, fetchFileLastCommit } from "../github/endpoints/contents.mjs";
import { DEPENDENCY_FILES } from "../domain/models.mjs";
import { parseDependencyFile } from "./parse-dependencies.mjs";
import {
  checkRegistryForPackage,
  computeVersionDrift,
  computeDriftDays,
} from "./check-registry.mjs";

/**
 * Fetch all data: validate user, discover repos, fetch dependency files,
 * parse dependencies, and check registry for latest versions.
 *
 * @param {object} ctx - Shared context
 * @returns {Promise<{ repositories: Array, repositoryDependencies: Array, allDependencies: Array }>}
 */
export async function fetchAllData(ctx) {
  const { config, log, output, cancelled } = ctx;

  const enabledEcosystems = config.ecosystems.split(",").map((e) => e.trim());

  // Validate user (only if a user is specified)
  if (config.searchUser) {
    output("User Validation");
    await validateUser(ctx.makeRequest, config.searchUser, { log });
    log(`User ${config.searchUser} validated`);
  }

  // Discover repositories
  output("Repository Discovery");

  const rawRepos = await CLIProgressHelper.withProgress(
    1,
    "Discovering repositories...",
    async (update) => {
      const result = await fetchUserRepos(ctx);
      update(1);
      return result;
    }
  );

  // Apply date filtering and skip forks/archived repos
  let repos = rawRepos;
  if (!config.ignoreDateRange && !config.currentFiles && config.start && config.end) {
    const startDate = new Date(config.start);
    const endDate = new Date(config.end);
    endDate.setHours(23, 59, 59, 999);

    repos = rawRepos.filter((repo) => {
      if (repo.fork || repo.archived) return false;
      if (!repo.pushed_at) return false;
      const pushedAt = new Date(repo.pushed_at);
      return pushedAt >= startDate && pushedAt <= endDate;
    });
  } else {
    repos = rawRepos.filter((repo) => !repo.fork && !repo.archived);
  }

  log(`Found ${repos.length} repositories`);

  if (cancelled.value || repos.length === 0) {
    return { repositories: repos.map((r) => r.full_name), repositoryDependencies: [], allDependencies: [] };
  }

  // ── Current Files Mode ─────────────────────────────────────────────
  if (config.currentFiles) {
    return fetchCurrentFilesData(ctx, repos, enabledEcosystems);
  }

  // Fetch dependency files from each repo
  output("Dependency File Discovery");

  const repositoryDependencies = [];
  const allDependencies = [];

  // Build the list of file paths to check per ecosystem
  const filesToCheck = [];
  for (const ecosystem of enabledEcosystems) {
    const paths = DEPENDENCY_FILES[ecosystem];
    if (paths) {
      for (const filePath of paths) {
        filesToCheck.push({ ecosystem, filePath });
      }
    }
  }

  await CLIProgressHelper.withProgress(
    repos.length,
    "Scanning repositories for dependency files...",
    async (update) => {
      for (const repo of repos) {
        if (cancelled.value) break;

        const repoFullName = repo.full_name;
        const [owner, repoName] = repoFullName.split("/");

        for (const { ecosystem, filePath } of filesToCheck) {
          if (cancelled.value) break;

          const fileData = await fetchFileContents(ctx, owner, repoName, filePath);
          if (!fileData) continue;

          const deps = parseDependencyFile(ecosystem, filePath, fileData.content, repoFullName);
          if (deps.length === 0) continue;

          // Fetch last commit date for this dependency file
          const lastCommit = await fetchFileLastCommit(ctx, owner, repoName, filePath);

          repositoryDependencies.push({
            repository: repoFullName,
            filePath,
            ecosystem,
            lastCommitDate: lastCommit?.date || null,
            lastCommitSha: lastCommit?.sha || null,
            dependencies: deps,
            totalDependencies: deps.length,
            outdatedCount: 0,
            criticalCount: 0,
            majorCount: 0,
          });

          allDependencies.push(...deps);

          log(`Found ${deps.length} ${ecosystem} dependencies in ${repoFullName}/${filePath}`);
        }

        update(1);
      }
    }
  );

  ctx.stream?.appendBatch("dependency", allDependencies);
  log(`Total dependency entries found: ${allDependencies.length}`);

  if (cancelled.value || allDependencies.length === 0) {
    return {
      repositories: repos.map((r) => r.full_name),
      repositoryDependencies,
      allDependencies,
    };
  }

  // Check registry for latest versions (deduplicated by package name + ecosystem)
  output("Registry Version Checks");

  const uniquePackages = new Map();
  for (const dep of allDependencies) {
    const key = `${dep.ecosystem}:${dep.name}`;
    if (!uniquePackages.has(key)) {
      uniquePackages.set(key, dep);
    }
  }

  const registryResults = new Map();

  await CLIProgressHelper.withProgress(
    uniquePackages.size,
    "Checking package registries for latest versions...",
    async (update) => {
      for (const [key, dep] of uniquePackages) {
        if (cancelled.value) break;

        const result = await checkRegistryForPackage(dep.ecosystem, dep.name, ctx);
        registryResults.set(key, result);
        update(1);
      }
    }
  );

  // Enrich all dependencies with registry data and drift computation
  for (const dep of allDependencies) {
    const key = `${dep.ecosystem}:${dep.name}`;
    const registry = registryResults.get(key);

    if (registry) {
      dep.latestVersion = registry.latestVersion;
      dep.latestPublishedAt = registry.publishedAt;
      dep.driftDays = computeDriftDays(registry.publishedAt);

      const drift = computeVersionDrift(dep.currentVersion, registry.latestVersion, dep.ecosystem);
      if (drift) {
        dep.versionsBehind = drift.versionsBehind;
        dep.severity = drift.severity;
      } else {
        dep.versionsBehind = null;
        dep.severity = "current";
      }
    } else {
      dep.latestVersion = null;
      dep.latestPublishedAt = null;
      dep.driftDays = null;
      dep.versionsBehind = null;
      dep.severity = "current";
      dep.registryError = "Package not found on registry";
    }
  }

  // Update repository-level counts
  for (const repoDeps of repositoryDependencies) {
    let outdated = 0;
    let critical = 0;
    let major = 0;

    for (const dep of repoDeps.dependencies) {
      if (dep.severity !== "current") outdated++;
      if (dep.severity === "critical") critical++;
      if (dep.severity === "major") major++;
    }

    repoDeps.outdatedCount = outdated;
    repoDeps.criticalCount = critical;
    repoDeps.majorCount = major;
  }

  return {
    repositories: repos.map((r) => r.full_name),
    repositoryDependencies,
    allDependencies,
  };
}

/**
 * Fetch current files in branch for all repos (file-scan mode).
 * Scans repo file trees and checks for dependency files.
 */
async function fetchCurrentFilesData(ctx, repos, enabledEcosystems) {
  const { config, log, output, cancelled } = ctx;

  output("Dependency File Discovery (Current Files)");

  const repositoryDependencies = [];
  const allDependencies = [];

  // Build the list of file paths to check per ecosystem
  const filesToCheck = [];
  for (const ecosystem of enabledEcosystems) {
    const paths = DEPENDENCY_FILES[ecosystem];
    if (paths) {
      for (const filePath of paths) {
        filesToCheck.push({ ecosystem, filePath });
      }
    }
  }

  await CLIProgressHelper.withProgress(
    repos.length,
    "Scanning branch file trees for dependency files...",
    async (update) => {
      for (const repo of repos) {
        if (cancelled.value) break;

        const repoFullName = repo.full_name;
        const [owner, repoName] = repoFullName.split("/");
        const branch = config.branch || "HEAD";

        // Gather branches to scan
        let branchNames = [branch];
        if (config.branchWildcard) {
          const branches = await fetchBranches(ctx, owner, repoName);
          branchNames = branches.map((b) => b.name);
          log(`Scanning ${branchNames.length} branches in ${repoFullName}`);
        }

        for (const branchName of branchNames) {
          if (cancelled.value) break;

          // Get the tree to check which dependency files exist
          const treeFiles = await fetchBranchTree(ctx, owner, repoName, branchName);
          const treeFilePaths = new Set(treeFiles.map((f) => f.path));

          for (const { ecosystem, filePath } of filesToCheck) {
            if (cancelled.value) break;

            // Only fetch file contents if the file exists in the tree
            if (!treeFilePaths.has(filePath)) continue;

            const fileData = await fetchFileContents(ctx, owner, repoName, filePath);
            if (!fileData) continue;

            const deps = parseDependencyFile(ecosystem, filePath, fileData.content, repoFullName);
            if (deps.length === 0) continue;

            repositoryDependencies.push({
              repository: repoFullName,
              filePath,
              ecosystem,
              branch: branchName,
              lastCommitDate: null,
              lastCommitSha: null,
              dependencies: deps,
              totalDependencies: deps.length,
              outdatedCount: 0,
              criticalCount: 0,
              majorCount: 0,
            });

            allDependencies.push(...deps);

            log(`Found ${deps.length} ${ecosystem} dependencies in ${repoFullName}/${filePath} (${branchName})`);
          }
        }

        update(1);
      }
    }
  );

  ctx.stream?.appendBatch("dependency", allDependencies);
  log(`Total dependency entries found: ${allDependencies.length}`);

  if (cancelled.value || allDependencies.length === 0) {
    return {
      repositories: repos.map((r) => r.full_name),
      repositoryDependencies,
      allDependencies,
    };
  }

  // Check registry for latest versions (deduplicated by package name + ecosystem)
  output("Registry Version Checks");

  const uniquePackages = new Map();
  for (const dep of allDependencies) {
    const key = `${dep.ecosystem}:${dep.name}`;
    if (!uniquePackages.has(key)) {
      uniquePackages.set(key, dep);
    }
  }

  const registryResults = new Map();

  await CLIProgressHelper.withProgress(
    uniquePackages.size,
    "Checking package registries for latest versions...",
    async (update) => {
      for (const [key, dep] of uniquePackages) {
        if (cancelled.value) break;

        const result = await checkRegistryForPackage(dep.ecosystem, dep.name, ctx);
        registryResults.set(key, result);
        update(1);
      }
    }
  );

  // Enrich all dependencies with registry data and drift computation
  for (const dep of allDependencies) {
    const key = `${dep.ecosystem}:${dep.name}`;
    const registry = registryResults.get(key);

    if (registry) {
      dep.latestVersion = registry.latestVersion;
      dep.latestPublishedAt = registry.publishedAt;
      dep.driftDays = computeDriftDays(registry.publishedAt);

      const drift = computeVersionDrift(dep.currentVersion, registry.latestVersion, dep.ecosystem);
      if (drift) {
        dep.versionsBehind = drift.versionsBehind;
        dep.severity = drift.severity;
      } else {
        dep.versionsBehind = null;
        dep.severity = "current";
      }
    } else {
      dep.latestVersion = null;
      dep.latestPublishedAt = null;
      dep.driftDays = null;
      dep.versionsBehind = null;
      dep.severity = "current";
      dep.registryError = "Package not found on registry";
    }
  }

  // Update repository-level counts
  for (const repoDeps of repositoryDependencies) {
    let outdated = 0;
    let critical = 0;
    let major = 0;

    for (const dep of repoDeps.dependencies) {
      if (dep.severity !== "current") outdated++;
      if (dep.severity === "critical") critical++;
      if (dep.severity === "major") major++;
    }

    repoDeps.outdatedCount = outdated;
    repoDeps.criticalCount = critical;
    repoDeps.majorCount = major;
  }

  return {
    repositories: repos.map((r) => r.full_name),
    repositoryDependencies,
    allDependencies,
  };
}
