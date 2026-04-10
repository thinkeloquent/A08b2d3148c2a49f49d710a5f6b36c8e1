import {
  FILE_CATEGORIES,
  COMMIT_TYPES,
  COVERAGE_CLASSIFICATION,
} from "../domain/models.mjs";

/**
 * Markdown-to-Code Ratio Analyzer — measures how documentation file changes
 * correlate with source code changes across commits.
 *
 * Metrics computed:
 * - docToCodeRatio = docFileChanges / codeFileChanges
 * - Documentation coverage classification (excellent/good/moderate/low/minimal)
 * - Per-repository doc ratio
 * - Commit type distribution (doc_only, code_only, mixed, other_only)
 * - Weekly/daily trends of doc-to-code ratio
 * - Lines added/removed in docs vs code
 */
export class MarkdownToCodeAnalyzer {
  constructor(options = {}) {
    this.sourceDirs = options.sourceDirs || ["src"];
    this.docExtensions = options.docExtensions || [".md", ".mdx"];
  }

  /**
   * Classify a file path as documentation, code, or other.
   * @param {string} filename - File path relative to repo root
   * @returns {string} FILE_CATEGORIES value
   */
  classifyFile(filename) {
    if (!filename) return FILE_CATEGORIES.OTHER;

    const lowerFilename = filename.toLowerCase();

    // Check documentation: any file matching doc extensions at any depth
    for (const ext of this.docExtensions) {
      if (lowerFilename.endsWith(ext)) {
        return FILE_CATEGORIES.DOCUMENTATION;
      }
    }

    // Check code: files within configured source directories
    for (const dir of this.sourceDirs) {
      const dirPrefix = dir.endsWith("/") ? dir : `${dir}/`;
      if (lowerFilename.startsWith(dirPrefix.toLowerCase()) || lowerFilename === dir.toLowerCase()) {
        return FILE_CATEGORIES.CODE;
      }
    }

    // Common code file extensions regardless of directory
    const codeExtensions = [
      ".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx",
      ".py", ".pyw",
      ".java", ".kt", ".scala",
      ".go",
      ".rs",
      ".c", ".cpp", ".h", ".hpp",
      ".cs",
      ".rb",
      ".php",
      ".swift",
      ".vue", ".svelte",
      ".css", ".scss", ".less", ".sass",
      ".html", ".htm",
      ".sql",
      ".sh", ".bash", ".zsh",
      ".r", ".R",
      ".lua",
      ".ex", ".exs",
      ".erl",
      ".hs",
      ".ml", ".mli",
      ".dart",
    ];

    for (const ext of codeExtensions) {
      if (lowerFilename.endsWith(ext)) {
        return FILE_CATEGORIES.CODE;
      }
    }

    return FILE_CATEGORIES.OTHER;
  }

  /**
   * Classify a commit based on its file mix.
   * @param {Array} files - Array of { filename, ... }
   * @returns {string} COMMIT_TYPES value
   */
  classifyCommit(files) {
    if (!files || files.length === 0) return COMMIT_TYPES.OTHER_ONLY;

    let hasDoc = false;
    let hasCode = false;

    for (const file of files) {
      const category = this.classifyFile(file.filename);
      if (category === FILE_CATEGORIES.DOCUMENTATION) hasDoc = true;
      if (category === FILE_CATEGORIES.CODE) hasCode = true;
    }

    if (hasDoc && hasCode) return COMMIT_TYPES.MIXED;
    if (hasDoc) return COMMIT_TYPES.DOC_ONLY;
    if (hasCode) return COMMIT_TYPES.CODE_ONLY;
    return COMMIT_TYPES.OTHER_ONLY;
  }

  /**
   * Analyze markdown-to-code ratio from commits with file details.
   * @param {Array} commits - Commits with { sha, timestamp, repository, message, files, stats }
   * @param {{ log: Function }} deps
   * @returns {object} markdown-to-code analytics
   */
  analyze(commits, { log }) {
    if (!Array.isArray(commits)) {
      throw new Error("MarkdownToCodeAnalyzer expects an array of commits");
    }

    if (commits.length === 0) {
      return this.emptyResult();
    }

    // Classify all files across all commits
    let totalDocFiles = 0;
    let totalCodeFiles = 0;
    let totalOtherFiles = 0;
    let docAdditions = 0;
    let docDeletions = 0;
    let codeAdditions = 0;
    let codeDeletions = 0;

    const commitClassifications = [];
    const repoStats = new Map();

    for (const commit of commits) {
      const commitType = this.classifyCommit(commit.files);
      let commitDocFiles = 0;
      let commitCodeFiles = 0;
      let commitDocAdditions = 0;
      let commitDocDeletions = 0;
      let commitCodeAdditions = 0;
      let commitCodeDeletions = 0;

      for (const file of commit.files) {
        const category = this.classifyFile(file.filename);

        if (category === FILE_CATEGORIES.DOCUMENTATION) {
          totalDocFiles++;
          commitDocFiles++;
          docAdditions += file.additions;
          docDeletions += file.deletions;
          commitDocAdditions += file.additions;
          commitDocDeletions += file.deletions;
        } else if (category === FILE_CATEGORIES.CODE) {
          totalCodeFiles++;
          commitCodeFiles++;
          codeAdditions += file.additions;
          codeDeletions += file.deletions;
          commitCodeAdditions += file.additions;
          commitCodeDeletions += file.deletions;
        } else {
          totalOtherFiles++;
        }
      }

      commitClassifications.push({
        sha: commit.sha,
        timestamp: commit.timestamp,
        repository: commit.repository,
        message: commit.message.split("\n")[0],
        type: commitType,
        docFiles: commitDocFiles,
        codeFiles: commitCodeFiles,
        docAdditions: commitDocAdditions,
        docDeletions: commitDocDeletions,
        codeAdditions: commitCodeAdditions,
        codeDeletions: commitCodeDeletions,
      });

      // Per-repository aggregation
      if (!repoStats.has(commit.repository)) {
        repoStats.set(commit.repository, {
          totalCommits: 0,
          docOnlyCommits: 0,
          codeOnlyCommits: 0,
          mixedCommits: 0,
          otherOnlyCommits: 0,
          docFiles: 0,
          codeFiles: 0,
          docAdditions: 0,
          docDeletions: 0,
          codeAdditions: 0,
          codeDeletions: 0,
        });
      }

      const repo = repoStats.get(commit.repository);
      repo.totalCommits++;
      if (commitType === COMMIT_TYPES.DOC_ONLY) repo.docOnlyCommits++;
      else if (commitType === COMMIT_TYPES.CODE_ONLY) repo.codeOnlyCommits++;
      else if (commitType === COMMIT_TYPES.MIXED) repo.mixedCommits++;
      else repo.otherOnlyCommits++;
      repo.docFiles += commitDocFiles;
      repo.codeFiles += commitCodeFiles;
      repo.docAdditions += commitDocAdditions;
      repo.docDeletions += commitDocDeletions;
      repo.codeAdditions += commitCodeAdditions;
      repo.codeDeletions += commitCodeDeletions;
    }

    // Summary metrics
    const docToCodeRatio = totalCodeFiles > 0 ? totalDocFiles / totalCodeFiles : 0;
    const docToCodeLinesRatio =
      codeAdditions + codeDeletions > 0
        ? (docAdditions + docDeletions) / (codeAdditions + codeDeletions)
        : 0;
    const coverageClassification = classifyCoverage(docToCodeRatio);

    // Commit type distribution
    const commitTypeDistribution = {
      docOnly: commitClassifications.filter((c) => c.type === COMMIT_TYPES.DOC_ONLY).length,
      codeOnly: commitClassifications.filter((c) => c.type === COMMIT_TYPES.CODE_ONLY).length,
      mixed: commitClassifications.filter((c) => c.type === COMMIT_TYPES.MIXED).length,
      otherOnly: commitClassifications.filter((c) => c.type === COMMIT_TYPES.OTHER_ONLY).length,
    };

    // Compute percentages
    const totalCommits = commits.length;
    commitTypeDistribution.docOnlyPercent = round((commitTypeDistribution.docOnly / totalCommits) * 100);
    commitTypeDistribution.codeOnlyPercent = round((commitTypeDistribution.codeOnly / totalCommits) * 100);
    commitTypeDistribution.mixedPercent = round((commitTypeDistribution.mixed / totalCommits) * 100);
    commitTypeDistribution.otherOnlyPercent = round((commitTypeDistribution.otherOnly / totalCommits) * 100);

    // Weekly trends
    const weeklyTrends = computeWeeklyTrends(commitClassifications);

    // Daily breakdown
    const dailyBreakdown = computeDailyBreakdown(commitClassifications);

    // Per-repository metrics
    const repositoryMetrics = Array.from(repoStats.entries())
      .sort(([, a], [, b]) => b.totalCommits - a.totalCommits)
      .map(([repo, data]) => ({
        repository: repo,
        ...data,
        docToCodeRatio: data.codeFiles > 0 ? round(data.docFiles / data.codeFiles) : 0,
        docToCodeLinesRatio:
          data.codeAdditions + data.codeDeletions > 0
            ? round(
                (data.docAdditions + data.docDeletions) /
                  (data.codeAdditions + data.codeDeletions)
              )
            : 0,
        coverageClassification: classifyCoverage(
          data.codeFiles > 0 ? data.docFiles / data.codeFiles : 0
        ),
      }));

    // Top undocumented repos (code-heavy, low doc ratio)
    const undocumentedRepos = repositoryMetrics
      .filter((r) => r.codeFiles > 0 && r.docToCodeRatio < 0.05)
      .sort((a, b) => b.codeFiles - a.codeFiles);

    return {
      summary: {
        totalCommits,
        totalDocFileChanges: totalDocFiles,
        totalCodeFileChanges: totalCodeFiles,
        totalOtherFileChanges: totalOtherFiles,
        docToCodeRatio: round(docToCodeRatio),
        docToCodeLinesRatio: round(docToCodeLinesRatio),
        coverageClassification,
        docAdditions,
        docDeletions,
        codeAdditions,
        codeDeletions,
        uniqueRepositories: repoStats.size,
        commitTypeDistribution,
      },
      weeklyTrends,
      dailyBreakdown,
      repositoryMetrics,
      undocumentedRepos,
      commitClassifications,
    };
  }

  /**
   * Analyze current files in branch (file-scan mode).
   * Classifies each file and produces a summary compatible with the commit-based report.
   *
   * @param {Array} branchFiles - Files from fetchBranchTree with { path, repository, branch }
   * @returns {object} analytics in the same shape as analyze()
   */
  analyzeCurrentFiles(branchFiles) {
    if (!Array.isArray(branchFiles) || branchFiles.length === 0) {
      return this.emptyResult();
    }

    let totalDocFiles = 0;
    let totalCodeFiles = 0;
    let totalOtherFiles = 0;
    const repoStats = new Map();
    const fileClassifications = [];

    for (const file of branchFiles) {
      const category = this.classifyFile(file.path);

      if (category === FILE_CATEGORIES.DOCUMENTATION) totalDocFiles++;
      else if (category === FILE_CATEGORIES.CODE) totalCodeFiles++;
      else totalOtherFiles++;

      fileClassifications.push({
        path: file.path,
        repository: file.repository,
        branch: file.branch,
        category,
        size: file.size || 0,
      });

      // Per-repository aggregation
      const repoKey = file.repository;
      if (!repoStats.has(repoKey)) {
        repoStats.set(repoKey, {
          totalFiles: 0,
          docFiles: 0,
          codeFiles: 0,
          otherFiles: 0,
        });
      }
      const repo = repoStats.get(repoKey);
      repo.totalFiles++;
      if (category === FILE_CATEGORIES.DOCUMENTATION) repo.docFiles++;
      else if (category === FILE_CATEGORIES.CODE) repo.codeFiles++;
      else repo.otherFiles++;
    }

    // ── Per-directory documentation coverage ──────────────────────────
    const dirStats = new Map();
    for (const fc of fileClassifications) {
      const dir = fc.path.includes("/")
        ? fc.path.substring(0, fc.path.lastIndexOf("/"))
        : ".";
      if (!dirStats.has(dir)) {
        dirStats.set(dir, { docFiles: 0, codeFiles: 0, otherFiles: 0 });
      }
      const ds = dirStats.get(dir);
      if (fc.category === FILE_CATEGORIES.DOCUMENTATION) ds.docFiles++;
      else if (fc.category === FILE_CATEGORIES.CODE) ds.codeFiles++;
      else ds.otherFiles++;
    }

    // Attach directory-level coverage to each file classification
    for (const fc of fileClassifications) {
      const dir = fc.path.includes("/")
        ? fc.path.substring(0, fc.path.lastIndexOf("/"))
        : ".";
      const ds = dirStats.get(dir);
      const dirRatio = ds.codeFiles > 0 ? ds.docFiles / ds.codeFiles : 0;
      fc.dirCoverageClassification = classifyCoverage(dirRatio);
      fc.hasNearbyDocs = ds.docFiles > 0;
    }

    const docToCodeRatio = totalCodeFiles > 0 ? totalDocFiles / totalCodeFiles : 0;
    const coverageClassification = classifyCoverage(docToCodeRatio);

    // Per-repository metrics
    const repositoryMetrics = Array.from(repoStats.entries())
      .sort(([, a], [, b]) => b.totalFiles - a.totalFiles)
      .map(([repo, data]) => ({
        repository: repo,
        ...data,
        docToCodeRatio: data.codeFiles > 0 ? round(data.docFiles / data.codeFiles) : 0,
        coverageClassification: classifyCoverage(
          data.codeFiles > 0 ? data.docFiles / data.codeFiles : 0
        ),
      }));

    const undocumentedRepos = repositoryMetrics
      .filter((r) => r.codeFiles > 0 && r.docToCodeRatio < 0.05)
      .sort((a, b) => b.codeFiles - a.codeFiles);

    return {
      summary: {
        mode: "currentFiles",
        totalFiles: branchFiles.length,
        totalDocFiles,
        totalCodeFiles,
        totalOtherFiles,
        docToCodeRatio: round(docToCodeRatio),
        docToCodeLinesRatio: 0,
        coverageClassification,
        docAdditions: 0,
        docDeletions: 0,
        codeAdditions: 0,
        codeDeletions: 0,
        uniqueRepositories: repoStats.size,
        // Keep commit-based fields at zero for report compatibility
        totalCommits: 0,
        totalDocFileChanges: totalDocFiles,
        totalCodeFileChanges: totalCodeFiles,
        totalOtherFileChanges: totalOtherFiles,
        commitTypeDistribution: {
          docOnly: 0, codeOnly: 0, mixed: 0, otherOnly: 0,
          docOnlyPercent: 0, codeOnlyPercent: 0, mixedPercent: 0, otherOnlyPercent: 0,
        },
      },
      weeklyTrends: [],
      dailyBreakdown: [],
      repositoryMetrics,
      undocumentedRepos,
      commitClassifications: [],
      fileClassifications,
    };
  }

  emptyResult() {
    return {
      summary: {
        totalCommits: 0,
        totalDocFileChanges: 0,
        totalCodeFileChanges: 0,
        totalOtherFileChanges: 0,
        docToCodeRatio: 0,
        docToCodeLinesRatio: 0,
        coverageClassification: "minimal",
        docAdditions: 0,
        docDeletions: 0,
        codeAdditions: 0,
        codeDeletions: 0,
        uniqueRepositories: 0,
        commitTypeDistribution: {
          docOnly: 0,
          codeOnly: 0,
          mixed: 0,
          otherOnly: 0,
          docOnlyPercent: 0,
          codeOnlyPercent: 0,
          mixedPercent: 0,
          otherOnlyPercent: 0,
        },
      },
      weeklyTrends: [],
      dailyBreakdown: [],
      repositoryMetrics: [],
      undocumentedRepos: [],
      commitClassifications: [],
    };
  }
}

/**
 * Classify documentation coverage based on doc-to-code file ratio.
 */
function classifyCoverage(docToCodeRatio) {
  if (docToCodeRatio >= COVERAGE_CLASSIFICATION.EXCELLENT.min)
    return COVERAGE_CLASSIFICATION.EXCELLENT.label;
  if (docToCodeRatio >= COVERAGE_CLASSIFICATION.GOOD.min)
    return COVERAGE_CLASSIFICATION.GOOD.label;
  if (docToCodeRatio >= COVERAGE_CLASSIFICATION.MODERATE.min)
    return COVERAGE_CLASSIFICATION.MODERATE.label;
  if (docToCodeRatio >= COVERAGE_CLASSIFICATION.LOW.min)
    return COVERAGE_CLASSIFICATION.LOW.label;
  return COVERAGE_CLASSIFICATION.MINIMAL.label;
}

/**
 * Compute weekly doc-to-code trends.
 */
function computeWeeklyTrends(classifications) {
  const weekMap = new Map();

  for (const commit of classifications) {
    if (!commit.timestamp) continue;

    const actDate = new Date(commit.timestamp);
    const weekStart = new Date(actDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split("T")[0];

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        commits: 0,
        docFiles: 0,
        codeFiles: 0,
        docAdditions: 0,
        docDeletions: 0,
        codeAdditions: 0,
        codeDeletions: 0,
        docOnlyCommits: 0,
        codeOnlyCommits: 0,
        mixedCommits: 0,
      });
    }

    const week = weekMap.get(weekKey);
    week.commits++;
    week.docFiles += commit.docFiles;
    week.codeFiles += commit.codeFiles;
    week.docAdditions += commit.docAdditions;
    week.docDeletions += commit.docDeletions;
    week.codeAdditions += commit.codeAdditions;
    week.codeDeletions += commit.codeDeletions;
    if (commit.type === COMMIT_TYPES.DOC_ONLY) week.docOnlyCommits++;
    else if (commit.type === COMMIT_TYPES.CODE_ONLY) week.codeOnlyCommits++;
    else if (commit.type === COMMIT_TYPES.MIXED) week.mixedCommits++;
  }

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, data]) => ({
      weekStart,
      ...data,
      docToCodeRatio: data.codeFiles > 0 ? round(data.docFiles / data.codeFiles) : 0,
      docToCodeLinesRatio:
        data.codeAdditions + data.codeDeletions > 0
          ? round(
              (data.docAdditions + data.docDeletions) /
                (data.codeAdditions + data.codeDeletions)
            )
          : 0,
    }));
}

/**
 * Compute daily breakdown of doc vs code changes.
 */
function computeDailyBreakdown(classifications) {
  const dayMap = new Map();

  for (const commit of classifications) {
    if (!commit.timestamp) continue;

    const date = commit.timestamp.split("T")[0];

    if (!dayMap.has(date)) {
      dayMap.set(date, {
        commits: 0,
        docFiles: 0,
        codeFiles: 0,
        docOnlyCommits: 0,
        codeOnlyCommits: 0,
        mixedCommits: 0,
      });
    }

    const day = dayMap.get(date);
    day.commits++;
    day.docFiles += commit.docFiles;
    day.codeFiles += commit.codeFiles;
    if (commit.type === COMMIT_TYPES.DOC_ONLY) day.docOnlyCommits++;
    else if (commit.type === COMMIT_TYPES.CODE_ONLY) day.codeOnlyCommits++;
    else if (commit.type === COMMIT_TYPES.MIXED) day.mixedCommits++;
  }

  return Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date,
      ...data,
      docToCodeRatio: data.codeFiles > 0 ? round(data.docFiles / data.codeFiles) : 0,
    }));
}

/**
 * Round to 2 decimal places.
 */
function round(value) {
  if (value === null || value === undefined) return null;
  return Math.round(value * 100) / 100;
}
