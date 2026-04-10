/**
 * Analyzer for dependency drift metrics.
 * Computes summaries, distributions, and rankings from enriched dependency data.
 */
export class DependencyDriftAnalyzer {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Analyze dependency drift data.
   * @param {{ repositoryDependencies: Array, allDependencies: Array, repositories: string[] }} data
   * @param {{ log: Function }} deps
   * @returns {object} analytics object
   */
  analyze(data, { log }) {
    const { allDependencies, repositoryDependencies, repositories } = data;

    if (!allDependencies || allDependencies.length === 0) {
      log("No dependencies found to analyze", "warn");
      return {
        severityDistribution: {},
        byEcosystem: {},
        byRepository: [],
        mostOutdated: [],
        dependencyTypeBreakdown: {},
        driftAgeDistribution: {},
      };
    }

    log(`Analyzing ${allDependencies.length} dependencies across ${repositoryDependencies.length} manifests`);

    const severityDistribution = this.computeSeverityDistribution(allDependencies);
    const byEcosystem = this.computeByEcosystem(allDependencies);
    const byRepository = this.computeByRepository(repositoryDependencies);
    const mostOutdated = this.computeMostOutdated(allDependencies);
    const dependencyTypeBreakdown = this.computeByDependencyType(allDependencies);
    const driftAgeDistribution = this.computeDriftAgeDistribution(allDependencies);
    const staleManifests = this.computeStaleManifests(repositoryDependencies);

    return {
      severityDistribution,
      byEcosystem,
      byRepository,
      mostOutdated,
      dependencyTypeBreakdown,
      driftAgeDistribution,
      staleManifests,
    };
  }

  /**
   * Count dependencies by severity level.
   */
  computeSeverityDistribution(deps) {
    const dist = { current: 0, minor: 0, moderate: 0, major: 0, critical: 0 };
    for (const dep of deps) {
      const severity = dep.severity || "current";
      if (dist[severity] !== undefined) {
        dist[severity]++;
      }
    }
    return dist;
  }

  /**
   * Group and summarize dependencies by ecosystem.
   */
  computeByEcosystem(deps) {
    const ecosystems = {};

    for (const dep of deps) {
      if (!ecosystems[dep.ecosystem]) {
        ecosystems[dep.ecosystem] = {
          total: 0,
          current: 0,
          outdated: 0,
          critical: 0,
          major: 0,
          moderate: 0,
          minor: 0,
        };
      }

      const eco = ecosystems[dep.ecosystem];
      eco.total++;

      if (dep.severity === "current") {
        eco.current++;
      } else {
        eco.outdated++;
        if (dep.severity === "critical") eco.critical++;
        if (dep.severity === "major") eco.major++;
        if (dep.severity === "moderate") eco.moderate++;
        if (dep.severity === "minor") eco.minor++;
      }
    }

    return ecosystems;
  }

  /**
   * Summarize drift per repository manifest.
   */
  computeByRepository(repositoryDependencies) {
    return repositoryDependencies.map((repoDeps) => {
      const totalDeps = repoDeps.dependencies.length;
      const outdated = repoDeps.dependencies.filter((d) => d.severity !== "current").length;
      const driftScore = totalDeps > 0
        ? round((outdated / totalDeps) * 100, 1)
        : 0;

      return {
        repository: repoDeps.repository,
        filePath: repoDeps.filePath,
        ecosystem: repoDeps.ecosystem,
        lastCommitDate: repoDeps.lastCommitDate,
        totalDependencies: totalDeps,
        outdatedCount: outdated,
        criticalCount: repoDeps.criticalCount,
        majorCount: repoDeps.majorCount,
        driftScore,
      };
    }).sort((a, b) => b.driftScore - a.driftScore);
  }

  /**
   * Rank the most outdated dependencies (by major versions behind).
   */
  computeMostOutdated(deps) {
    return deps
      .filter((d) => d.versionsBehind && d.versionsBehind.major > 0)
      .sort((a, b) => {
        const aMajor = a.versionsBehind?.major || 0;
        const bMajor = b.versionsBehind?.major || 0;
        if (bMajor !== aMajor) return bMajor - aMajor;
        const aMinor = a.versionsBehind?.minor || 0;
        const bMinor = b.versionsBehind?.minor || 0;
        return bMinor - aMinor;
      })
      .slice(0, 50)
      .map((d) => ({
        name: d.name,
        ecosystem: d.ecosystem,
        repository: d.repository,
        currentVersion: d.currentVersion,
        latestVersion: d.latestVersion,
        versionsBehind: d.versionsBehind,
        severity: d.severity,
        driftDays: d.driftDays,
      }));
  }

  /**
   * Count dependencies by type (production, development, etc).
   */
  computeByDependencyType(deps) {
    const types = {};

    for (const dep of deps) {
      const type = dep.dependencyType || "unknown";
      if (!types[type]) {
        types[type] = { total: 0, outdated: 0 };
      }
      types[type].total++;
      if (dep.severity !== "current") {
        types[type].outdated++;
      }
    }

    return types;
  }

  /**
   * Distribute dependencies by age of latest version (how long since last publish).
   */
  computeDriftAgeDistribution(deps) {
    const buckets = {
      "< 30 days": 0,
      "30-90 days": 0,
      "90-180 days": 0,
      "180-365 days": 0,
      "> 365 days": 0,
      "unknown": 0,
    };

    for (const dep of deps) {
      if (dep.driftDays === null || dep.driftDays === undefined) {
        buckets["unknown"]++;
      } else if (dep.driftDays < 30) {
        buckets["< 30 days"]++;
      } else if (dep.driftDays < 90) {
        buckets["30-90 days"]++;
      } else if (dep.driftDays < 180) {
        buckets["90-180 days"]++;
      } else if (dep.driftDays < 365) {
        buckets["180-365 days"]++;
      } else {
        buckets["> 365 days"]++;
      }
    }

    return buckets;
  }

  /**
   * Find dependency manifests that haven't been updated in a long time.
   */
  computeStaleManifests(repositoryDependencies) {
    const now = new Date();

    return repositoryDependencies
      .filter((rd) => rd.lastCommitDate)
      .map((rd) => {
        const lastUpdated = new Date(rd.lastCommitDate);
        const daysSinceUpdate = Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24));

        return {
          repository: rd.repository,
          filePath: rd.filePath,
          ecosystem: rd.ecosystem,
          lastCommitDate: rd.lastCommitDate,
          daysSinceUpdate,
          totalDependencies: rd.totalDependencies,
        };
      })
      .filter((m) => m.daysSinceUpdate > 90)
      .sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate);
  }
}

/**
 * Round a number to specified decimal places.
 */
function round(value, decimals = 2) {
  return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
}
