import { z } from "zod";

export const CommitParentSchema = z.object({
  sha: z.string(),
  url: z.string(),
  html_url: z.string(),
});

export const CommitStatsSchema = z.object({
  total: z.number(),
  additions: z.number(),
  deletions: z.number(),
});

export const CommitFileSchema = z.object({
  sha: z.string().optional(),
  filename: z.string(),
  status: z.string(),
  additions: z.number(),
  deletions: z.number(),
  changes: z.number(),
  blob_url: z.string().optional(),
  raw_url: z.string().optional(),
  contents_url: z.string().optional(),
  patch: z.string().optional(),
});

export const CommitSchema = z.object({
  sha: z.string(),
  message: z.string(),
  date: z.string(),
  repository: z.string(),
  type: z.enum(["direct", "pull_request"]),
  pullRequest: z.number().nullable(),
  author: z.string(),
  url: z.string(),
  parents: z.array(CommitParentSchema).optional(),
  stats: CommitStatsSchema.optional(),
  files: z.array(CommitFileSchema).optional(),
});
