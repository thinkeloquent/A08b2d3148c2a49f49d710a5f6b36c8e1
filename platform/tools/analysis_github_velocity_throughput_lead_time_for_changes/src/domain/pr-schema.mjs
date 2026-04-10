import { z } from "zod";

export const PullRequestSchema = z.object({
  id: z.number(),
  number: z.number(),
  title: z.string(),
  state: z.enum(["open", "closed"]),
  created_at: z.string(),
  updated_at: z.string(),
  closed_at: z.string().nullable(),
  merged_at: z.string().nullable(),
  html_url: z.string().optional(),
  user: z
    .object({
      login: z.string(),
    })
    .optional(),
  additions: z.number().optional(),
  deletions: z.number().optional(),
  changed_files: z.number().optional(),
  commits: z.number().optional(),
  comments: z.number().optional(),
  review_comments: z.number().optional(),
});

export const LeadTimeEntrySchema = z.object({
  number: z.number(),
  title: z.string(),
  repository: z.string(),
  created_at: z.string(),
  merged_at: z.string().nullable(),
  closed_at: z.string().nullable(),
  first_commit_at: z.string().nullable(),
  first_review_at: z.string().nullable(),
  last_approval_at: z.string().nullable(),
  lead_time_days: z.number().nullable(),
  coding_time_days: z.number().nullable(),
  review_time_days: z.number().nullable(),
  merge_time_days: z.number().nullable(),
  pr_open_to_merge_days: z.number().nullable(),
  status: z.enum(["merged", "closed", "open"]),
  additions: z.number().optional(),
  deletions: z.number().optional(),
  changed_files: z.number().optional(),
  total_commits: z.number().optional(),
});
