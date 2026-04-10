import {
  HOTSPOT_HEALTH,
  FREQUENCY_TIERS,
} from "../domain/models.mjs";

/**
 * File Touch Frequency Analyzer — measures how frequently each file is modified
 * relative to total commits to identify "God Objects" and bottleneck files.
 *
 * Metrics computed:
 * - fileFrequency = commits touching file / total commits
 * - hotspot classification (file frequency >= hotspotThreshold)
 * - Per-file metrics, directory breakdown, weekly trends
 */
export class FileTouchFrequencyAnalyzer {
  constructor(options = {}) {
    this.hotspotThreshold = options.hotspotThreshold || 10;
    this.topFilesLimit = options.topFilesLimit || 50;
  }

  /**
   * Analyze file touch frequency from commit data.
   * @param {{ commits: Array }} data - commits with `files` array attached
   * @param {{ log: Function }} deps
   * @returns {object} file touch frequency analytics
   */
  analyze(data, { log }) {
    const { commits } = data;

    if (!Array.isArray(commits)) {
      throw new Error("FileTouchFrequencyAnalyzer expects commits array");
    }

    if (commits.length === 0) {
      return this.emptyResult();
    }

    const totalCommits = commits.length;

    // ── 1. Count touches per file ───────────────────────────────────
    const fileTouchMap = new Map(); // filePath -> { commitCount, repositories }

    for (const commit of commits) {
      const files = commit.files || [];
      const seen = new Set(); // dedupe files within a single commit
      for (const filePath of files) {
        if (seen.has(filePath)) continue;
        seen.add(filePath);

        if (!fileTouchMap.has(filePath)) {
          fileTouchMap.set(filePath, {
            commitCount: 0,
            repositories: new Set(),
          });
        }

        const entry = fileTouchMap.get(filePath);
        entry.commitCount++;
        entry.repositories.add(commit.repository);
      }
    }

    // ── 2. Compute per-file metrics ─────────────────────────────────
    const fileMetrics = Array.from(fileTouchMap.entries())
      .map(([filePath, data]) => {
        const frequency = round((data.commitCount / totalCommits) * 100);
        const isHotspot = frequency >= this.hotspotThreshold;
        const frequencyTier = getFrequencyTier(frequency);
        const directory = getDirectory(filePath);

        return {
          filePath,
          repositories: [...data.repositories],
          commitCount: data.commitCount,
          frequency,
          isHotspot,
          frequencyTier,
          directory,
        };
      })
      .sort((a, b) => b.frequency - a.frequency);

    // ── 3. Compute aggregate summary ────────────────────────────────
    const totalUniqueFiles = fileMetrics.length;
    const hotspotFiles = fileMetrics.filter((f) => f.isHotspot);
    const hotspotCount = hotspotFiles.length;
    const maxFileFrequency = fileMetrics.length > 0 ? fileMetrics[0].frequency : 0;
    const topHotspotFile = fileMetrics.length > 0 ? fileMetrics[0].filePath : "N/A";

    const avgFileFrequency = totalUniqueFiles > 0
      ? round(fileMetrics.reduce((sum, f) => sum + f.frequency, 0) / totalUniqueFiles)
      : 0;

    const medianFrequency = totalUniqueFiles > 0
      ? fileMetrics[Math.floor(totalUniqueFiles / 2)].frequency
      : 0;

    const healthClassification = classifyHotspotHealth(maxFileFrequency);

    // ── 4. Top hotspots ─────────────────────────────────────────────
    const topHotspots = fileMetrics.slice(0, this.topFilesLimit).map((f) => ({
      filePath: f.filePath,
      repositories: f.repositories,
      commitCount: f.commitCount,
      frequency: f.frequency,
      isHotspot: f.isHotspot,
      frequencyTier: f.frequencyTier,
      directory: f.directory,
    }));

    // ── 5. Frequency tier distribution ──────────────────────────────
    const frequencyTierDistribution = computeFrequencyTierDistribution(fileMetrics);

    // ── 6. Directory breakdown ──────────────────────────────────────
    const directoryBreakdown = computeDirectoryBreakdown(fileMetrics, totalCommits);

    // ── 7. Weekly trends ────────────────────────────────────────────
    const weeklyTrends = computeWeeklyTrends(commits, this.hotspotThreshold);

    // ── 8. Repository breakdown ─────────────────────────────────────
    const repositoryBreakdown = computeRepositoryBreakdown(commits, this.hotspotThreshold);

    return {
      summary: {
        totalCommits,
        totalUniqueFiles,
        maxFileFrequency,
        topHotspotFile,
        hotspotCount,
        avgFileFrequency,
        medianFrequency,
        healthClassification,
        hotspotThreshold: this.hotspotThreshold,
        topFilesLimit: this.topFilesLimit,
      },
      fileMetrics,
      topHotspots,
      frequencyTierDistribution,
      directoryBreakdown,
      weeklyTrends,
      repositoryBreakdown,
    };
  }

  emptyResult() {
    return {
      summary: {
        totalCommits: 0,
        totalUniqueFiles: 0,
        maxFileFrequency: 0,
        topHotspotFile: "N/A",
        hotspotCount: 0,
        avgFileFrequency: 0,
        medianFrequency: 0,
        healthClassification: "excellent",
        hotspotThreshold: this.hotspotThreshold,
        topFilesLimit: this.topFilesLimit,
      },
      fileMetrics: [],
      topHotspots: [],
      frequencyTierDistribution: {},
      directoryBreakdown: [],
      weeklyTrends: [],
      repositoryBreakdown: [],
    };
  }
}

/**
 * Classify hotspot health based on the maximum file frequency.
 */
function classifyHotspotHealth(maxFrequency) {
  if (maxFrequency < HOTSPOT_HEALTH.EXCELLENT.max)
    return HOTSPOT_HEALTH.EXCELLENT.label;
  if (maxFrequency < HOTSPOT_HEALTH.HEALTHY.max)
    return HOTSPOT_HEALTH.HEALTHY.label;
  if (maxFrequency < HOTSPOT_HEALTH.MODERATE.max)
    return HOTSPOT_HEALTH.MODERATE.label;
  if (maxFrequency < HOTSPOT_HEALTH.CONCERNING.max)
    return HOTSPOT_HEALTH.CONCERNING.label;
  return HOTSPOT_HEALTH.CRITICAL.label;
}

/**
 * Get the frequency tier label for a given file frequency percentage.
 */
function getFrequencyTier(frequency) {
  if (frequency < FREQUENCY_TIERS.RARE.maxFreq)
    return FREQUENCY_TIERS.RARE.label;
  if (frequency < FREQUENCY_TIERS.OCCASIONAL.maxFreq)
    return FREQUENCY_TIERS.OCCASIONAL.label;
  if (frequency < FREQUENCY_TIERS.FREQUENT.maxFreq)
    return FREQUENCY_TIERS.FREQUENT.label;
  if (frequency < FREQUENCY_TIERS.VERY_FREQUENT.maxFreq)
    return FREQUENCY_TIERS.VERY_FREQUENT.label;
  return FREQUENCY_TIERS.HOTSPOT.label;
}

/**
 * Extract directory from file path.
 */
function getDirectory(filePath) {
  const parts = filePath.split("/");
  return parts.length > 1 ? parts.slice(0, -1).join("/") : "(root)";
}

/**
 * Compute frequency tier distribution — count of files in each tier.
 */
function computeFrequencyTierDistribution(fileMetrics) {
  const tiers = {};
  for (const tier of Object.values(FREQUENCY_TIERS)) {
    tiers[tier.label] = {
      count: 0,
      avgFrequency: 0,
      totalTouches: 0,
    };
  }

  for (const file of fileMetrics) {
    const entry = tiers[file.frequencyTier];
    if (entry) {
      entry.count++;
      entry.totalTouches += file.commitCount;
    }
  }

  const result = {};
  for (const [label, data] of Object.entries(tiers)) {
    result[label] = {
      count: data.count,
      totalTouches: data.totalTouches,
      avgFrequency: data.count > 0
        ? round(data.totalTouches / data.count)
        : 0,
    };
  }

  return result;
}

/**
 * Compute directory-level breakdown — aggregate file frequency by directory.
 */
function computeDirectoryBreakdown(fileMetrics, totalCommits) {
  const dirMap = new Map();

  for (const file of fileMetrics) {
    const dir = file.directory;

    if (!dirMap.has(dir)) {
      dirMap.set(dir, {
        fileCount: 0,
        totalTouches: 0,
        hotspotFileCount: 0,
        maxFrequency: 0,
      });
    }

    const entry = dirMap.get(dir);
    entry.fileCount++;
    entry.totalTouches += file.commitCount;
    if (file.isHotspot) entry.hotspotFileCount++;
    if (file.frequency > entry.maxFrequency) entry.maxFrequency = file.frequency;
  }

  return Array.from(dirMap.entries())
    .sort(([, a], [, b]) => b.totalTouches - a.totalTouches)
    .slice(0, 30)
    .map(([directory, data]) => ({
      directory,
      fileCount: data.fileCount,
      totalTouches: data.totalTouches,
      hotspotFileCount: data.hotspotFileCount,
      maxFrequency: data.maxFrequency,
      avgFrequency: data.fileCount > 0
        ? round((data.totalTouches / data.fileCount / totalCommits) * 100)
        : 0,
    }));
}

/**
 * Compute weekly trends for file touch frequency.
 */
function computeWeeklyTrends(commits, hotspotThreshold) {
  const weekMap = new Map();

  for (const commit of commits) {
    const commitDate = new Date(commit.date);
    const weekStart = new Date(commitDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split("T")[0];

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        totalCommits: 0,
        uniqueFiles: new Set(),
        fileTouchMap: new Map(),
      });
    }

    const week = weekMap.get(weekKey);
    week.totalCommits++;

    for (const filePath of (commit.files || [])) {
      week.uniqueFiles.add(filePath);
      week.fileTouchMap.set(
        filePath,
        (week.fileTouchMap.get(filePath) || 0) + 1
      );
    }
  }

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, data]) => {
      const hotspotCount = Array.from(data.fileTouchMap.values())
        .filter((touches) =>
          data.totalCommits > 0 && (touches / data.totalCommits) * 100 >= hotspotThreshold
        ).length;

      const maxFrequency = data.totalCommits > 0
        ? round(
            (Math.max(...data.fileTouchMap.values(), 0) / data.totalCommits) * 100
          )
        : 0;

      return {
        weekStart,
        totalCommits: data.totalCommits,
        uniqueFilesTouched: data.uniqueFiles.size,
        hotspotCount,
        maxFileFrequency: maxFrequency,
        avgFilesPerCommit: data.totalCommits > 0
          ? round(data.uniqueFiles.size / data.totalCommits)
          : 0,
      };
    });
}

/**
 * Compute per-repository breakdown.
 */
function computeRepositoryBreakdown(commits, hotspotThreshold) {
  const repoMap = new Map();

  for (const commit of commits) {
    const repo = commit.repository;
    if (!repoMap.has(repo)) {
      repoMap.set(repo, {
        totalCommits: 0,
        fileTouchMap: new Map(),
      });
    }

    const data = repoMap.get(repo);
    data.totalCommits++;

    for (const filePath of (commit.files || [])) {
      data.fileTouchMap.set(
        filePath,
        (data.fileTouchMap.get(filePath) || 0) + 1
      );
    }
  }

  return Array.from(repoMap.entries())
    .sort(([, a], [, b]) => b.totalCommits - a.totalCommits)
    .map(([repo, data]) => {
      const hotspotCount = Array.from(data.fileTouchMap.values())
        .filter((touches) =>
          data.totalCommits > 0 && (touches / data.totalCommits) * 100 >= hotspotThreshold
        ).length;

      const maxFrequency = data.totalCommits > 0
        ? round(
            (Math.max(...data.fileTouchMap.values(), 0) / data.totalCommits) * 100
          )
        : 0;

      return {
        repository: repo,
        totalCommits: data.totalCommits,
        uniqueFiles: data.fileTouchMap.size,
        hotspotCount,
        maxFileFrequency: maxFrequency,
        avgFilesPerCommit: data.totalCommits > 0
          ? round(data.fileTouchMap.size / data.totalCommits)
          : 0,
      };
    });
}

/**
 * Round to 2 decimal places.
 */
function round(value) {
  if (value === null || value === undefined) return null;
  return Math.round(value * 100) / 100;
}
