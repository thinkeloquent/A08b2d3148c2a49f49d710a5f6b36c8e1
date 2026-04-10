/**
 * @module models/project
 * @description Zod schemas and types for JIRA project entities.
 */

import { z } from 'zod';

export const ProjectVersionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  archived: z.boolean().default(false),
  released: z.boolean().default(false),
  startDate: z.string().nullish(),
  releaseDate: z.string().nullish(),
  overdue: z.boolean().nullish(),
  userStartDate: z.string().nullish(),
  userReleaseDate: z.string().nullish(),
  projectId: z.number(),
});

/** @typedef {z.infer<typeof ProjectVersionSchema>} ProjectVersion */

export const ProjectVersionCreateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  projectId: z.number(),
  archived: z.boolean().default(false),
  released: z.boolean().default(false),
  startDate: z.string().optional(),
  releaseDate: z.string().optional(),
});

export const IssueTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(''),
  iconUrl: z.string().nullish(),
  subtask: z.boolean().default(false),
});

/** @typedef {z.infer<typeof IssueTypeSchema>} IssueType */

export const ProjectLeadSchema = z.object({
  accountId: z.string().nullish(),
  displayName: z.string().nullish(),
  active: z.boolean().nullish(),
  avatarUrls: z.record(z.string()).nullish(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  lead: ProjectLeadSchema.nullish(),
  projectTypeKey: z.string().nullish(),
  avatarUrls: z.record(z.string()).nullish(),
  url: z.string().nullish(),
  issueTypes: z.array(IssueTypeSchema).nullish(),
  versions: z.array(ProjectVersionSchema).nullish(),
});

/** @typedef {z.infer<typeof ProjectSchema>} Project */

export const ProjectDetailsSchema = z.object({
  project: ProjectSchema,
  versions: z.array(ProjectVersionSchema).default([]),
  issueTypes: z.array(IssueTypeSchema).default([]),
});
