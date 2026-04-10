import { z } from "zod";

/**
 * Schema for a single dependency entry with drift information.
 */
export const DependencyEntrySchema = z.object({
  name: z.string(),
  currentVersion: z.string(),
  latestVersion: z.string().nullable(),
  ecosystem: z.enum(["npm", "pypi", "maven", "go", "rubygems", "cargo", "nuget", "composer"]),
  repository: z.string(),
  dependencyType: z.enum(["production", "development", "build", "optional", "unknown"]),
  versionsBehind: z.object({
    major: z.number(),
    minor: z.number(),
    patch: z.number(),
  }).nullable(),
  driftDays: z.number().nullable(),
  latestPublishedAt: z.string().nullable(),
  severity: z.enum(["current", "minor", "moderate", "major", "critical"]),
  registryError: z.string().nullable().optional(),
});

/**
 * Schema for a repository's dependency manifest.
 */
export const RepositoryDependenciesSchema = z.object({
  repository: z.string(),
  filePath: z.string(),
  ecosystem: z.enum(["npm", "pypi", "maven", "go", "rubygems", "cargo", "nuget", "composer"]),
  lastCommitDate: z.string().nullable(),
  lastCommitSha: z.string().nullable(),
  dependencies: z.array(DependencyEntrySchema),
  totalDependencies: z.number(),
  outdatedCount: z.number(),
  criticalCount: z.number(),
  majorCount: z.number(),
});
