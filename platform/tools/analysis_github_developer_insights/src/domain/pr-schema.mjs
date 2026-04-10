import { z } from "zod";

export const PullRequestSchema = z.object({
  id: z.number(),
  number: z.number(),
  title: z.string(),
  state: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  merged_at: z.string().nullable(),
  closed_at: z.string().nullable(),
  additions: z.number(),
  deletions: z.number(),
  changed_files: z.number(),
  repository: z.object({
    full_name: z.string(),
    name: z.string(),
    owner: z.object({ login: z.string() }),
  }),
});
