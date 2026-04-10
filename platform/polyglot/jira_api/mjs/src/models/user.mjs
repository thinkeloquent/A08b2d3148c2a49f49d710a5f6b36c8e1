/**
 * @module models/user
 * @description Zod schemas and types for JIRA user entities.
 */

import { z } from 'zod';

export const UserSchema = z.object({
  accountId: z.string(),
  emailAddress: z.string().nullish(),
  displayName: z.string(),
  active: z.boolean().default(true),
  avatarUrls: z.record(z.string()).nullish(),
  timeZone: z.string().nullish(),
  locale: z.string().nullish(),
});

/** @typedef {z.infer<typeof UserSchema>} User */

export const UserSearchSchema = z.object({
  query: z.string(),
  projectKeys: z.string().optional(),
  startAt: z.number().default(0),
  maxResults: z.number().default(50),
});

export const UserSearchResultSchema = z.object({
  users: z.array(UserSchema).default([]),
  total: z.number().default(0),
  startAt: z.number().default(0),
  maxResults: z.number().default(50),
});
