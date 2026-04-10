import { z } from "zod";

export const ReviewSchema = z.object({
  id: z.number(),
  user: z.object({
    login: z.string(),
    id: z.number().optional(),
  }),
  state: z.enum([
    "APPROVED",
    "CHANGES_REQUESTED",
    "COMMENTED",
    "DISMISSED",
    "PENDING",
  ]),
  submitted_at: z.string().nullable(),
  html_url: z.string().optional(),
  pull_request_url: z.string().optional(),
  body: z.string().nullable().optional(),
});

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

export const ReviewerLoadEntrySchema = z.object({
  reviewer: z.string(),
  totalReviews: z.number(),
  approvals: z.number(),
  changesRequested: z.number(),
  comments: z.number(),
  dismissed: z.number(),
  uniquePRsReviewed: z.number(),
  uniqueReposReviewed: z.number(),
  repositories: z.array(z.string()),
  avgReviewsPerDay: z.number().nullable(),
  firstReviewDate: z.string().nullable(),
  lastReviewDate: z.string().nullable(),
  shareOfTotalReviews: z.number(),
});
