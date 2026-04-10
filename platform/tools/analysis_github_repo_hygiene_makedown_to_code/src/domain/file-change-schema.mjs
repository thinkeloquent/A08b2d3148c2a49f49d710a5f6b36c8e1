import { z } from "zod";

export const FileChangeSchema = z.object({
  filename: z.string(),
  status: z.string(),
  additions: z.number(),
  deletions: z.number(),
  changes: z.number(),
});

export const CommitWithFilesSchema = z.object({
  sha: z.string(),
  timestamp: z.string().nullable(),
  repository: z.string(),
  message: z.string(),
  url: z.string(),
  files: z.array(FileChangeSchema).default([]),
  stats: z.object({
    additions: z.number(),
    deletions: z.number(),
    total: z.number(),
  }).default({ additions: 0, deletions: 0, total: 0 }),
});
