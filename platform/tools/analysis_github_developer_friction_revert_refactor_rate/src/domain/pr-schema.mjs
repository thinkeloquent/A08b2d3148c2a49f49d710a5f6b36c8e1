import { z } from "zod";

export const PullRequestSchema = z.object({
  id: z.number(),
  number: z.number(),
  title: z.string(),
  state: z.string(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  closed_at: z.string().nullable().optional(),
  merged_at: z.string().nullable().optional(),
  html_url: z.string().optional(),
  additions: z.number().optional(),
  deletions: z.number().optional(),
  changed_files: z.number().optional(),
  commits: z.number().optional(),
  review_comments: z.number().optional(),
  body: z.string().nullable().optional(),
});
