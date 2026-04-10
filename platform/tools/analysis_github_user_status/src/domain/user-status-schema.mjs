import { z } from "zod";

/**
 * Status enum for GitHub user accounts.
 */
export const USER_STATUSES = ["Active", "Suspended", "Not Found / Suspended", "Error"];

/**
 * Schema for validated user details from the GitHub API.
 */
export const UserDetailsSchema = z.object({
  id: z.number(),
  login: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  public_repos: z.number(),
  followers: z.number(),
  following: z.number(),
  bio: z.string().nullable(),
  location: z.string().nullable(),
  company: z.string().nullable(),
  blog: z.string().nullable(),
  twitter_username: z.string().nullable(),
  suspended_at: z.string().nullable().optional(),
});

/**
 * Schema for a single user status result.
 */
export const UserStatusSchema = z.object({
  username: z.string(),
  status: z.enum(["Active", "Suspended", "Not Found / Suspended", "Error"]),
  details: z
    .object({
      id: z.number().optional(),
      name: z.string().nullable().optional(),
      created_at: z.string().nullable().optional(),
      updated_at: z.string().optional(),
      public_repos: z.number().optional(),
      followers: z.number().optional(),
      following: z.number().optional(),
      bio: z.string().nullable().optional(),
      location: z.string().nullable().optional(),
      company: z.string().nullable().optional(),
      blog: z.string().nullable().optional(),
      twitter_username: z.string().nullable().optional(),
    })
    .optional(),
  error: z.string().optional(),
});
