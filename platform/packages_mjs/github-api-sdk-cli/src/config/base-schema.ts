import { z } from "zod";

/**
 * Base configuration schema shared across all analysis tools.
 * Tools extend this with `.merge()` for their tool-specific fields.
 *
 * At least one of searchUser, org, or repo is required.
 */
export const BaseConfigSchema = z
  .object({
    searchUser: z.string().optional(),
    org: z.string().optional(),
    repo: z.string().optional(),
    branch: z.string().optional(),
    branchWildcard: z.boolean().default(false),
    currentFiles: z.boolean().default(false),
    metaTags: z
      .record(z.string(), z.string())
      .optional()
      .default({}),
    format: z.enum(["json", "csv"]).default("json"),
    outputDir: z.string().default("./output"),
    filename: z.string().optional(),
    ignoreDateRange: z.boolean().default(false),
    start: z.string().optional(),
    end: z.string().optional(),
    token: z.string().min(1, "GitHub token is required"),
    baseUrl: z.string().url("baseUrl must be a valid URL").optional(),
    verbose: z.boolean().default(false),
    debug: z.boolean().default(false),
    loadData: z.string().optional(),
    totalRecords: z.number().min(0).default(0),
    delay: z.number().min(0).default(6),
    commitSha: z.string().optional(),
    commitMessage: z.string().optional(),
    searchQuery: z.string().optional(),
    searchType: z.enum(["keyword", "code", "commitSearch", "semantic"]).optional(),
    codeSearchMode: z.enum(["exact", "regex", "symbol"]).optional(),
    searchQualifiers: z.string().optional(),
    sourceDirs: z.string().optional(),
    pullRequestNumber: z.number().optional(),
    daysAgo: z.number().optional(),
  })
  .refine((d) => d.searchUser || d.org || d.repo, {
    message: "At least one of searchUser, org, or repo is required",
  });

export type BaseConfig = z.infer<typeof BaseConfigSchema>;
