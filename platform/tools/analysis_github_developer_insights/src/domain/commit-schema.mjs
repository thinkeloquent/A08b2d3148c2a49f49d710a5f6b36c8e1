import { z } from "zod";

export const DateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const CommitSchema = z.object({
  sha: z.string(),
  commit: z.object({
    author: z.object({
      name: z.string(),
      email: z.string(),
      date: z.string(),
    }),
    message: z.string(),
  }),
  stats: z
    .object({
      additions: z.number(),
      deletions: z.number(),
      total: z.number(),
    })
    .optional(),
});
