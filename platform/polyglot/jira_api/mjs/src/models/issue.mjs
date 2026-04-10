/**
 * @module models/issue
 * @description Zod schemas and types for JIRA issue entities.
 */

import { z } from 'zod';
import { UserSchema } from './user.mjs';
import { IssueTypeSchema, ProjectSchema } from './project.mjs';
import { textToAdf } from '../utils/adf.mjs';

export const IssueStatusSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(''),
  category: z.record(z.unknown()).nullish(),
});

/** @typedef {z.infer<typeof IssueStatusSchema>} IssueStatus */

export const IssuePrioritySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  iconUrl: z.string().nullish(),
});

export const IssueTransitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  to: IssueStatusSchema,
  hasScreen: z.boolean().default(false),
});

/** @typedef {z.infer<typeof IssueTransitionSchema>} IssueTransition */

export const IssueFieldsSchema = z.object({
  summary: z.string(),
  description: z.unknown().nullish(),
  issuetype: IssueTypeSchema,
  project: ProjectSchema,
  status: IssueStatusSchema,
  priority: IssuePrioritySchema.nullish(),
  assignee: UserSchema.nullish(),
  reporter: UserSchema.nullish(),
  labels: z.array(z.string()).default([]),
  created: z.string().nullish(),
  updated: z.string().nullish(),
  resolution: z.record(z.unknown()).nullish(),
  resolutiondate: z.string().nullish(),
});

export const IssueSchema = z.object({
  id: z.string(),
  key: z.string(),
  self: z.string(),
  fields: IssueFieldsSchema,
  changelog: z.record(z.unknown()).nullish(),
});

/** @typedef {z.infer<typeof IssueSchema>} Issue */

export const IssueCreateSchema = z.object({
  projectId: z.string(),
  summary: z.string(),
  description: z.string().optional(),
  issueTypeId: z.string(),
  priorityId: z.string().optional(),
  assigneeAccountId: z.string().optional(),
  reporterAccountId: z.string().optional(),
  labels: z.array(z.string()).default([]),
});

/**
 * Convert IssueCreate data to JIRA API format.
 * @param {z.infer<typeof IssueCreateSchema>} data
 * @returns {object}
 */
export function issueCreateToJiraFormat(data) {
  const fields = {
    project: { id: data.projectId },
    summary: data.summary,
    issuetype: { id: data.issueTypeId },
  };
  if (data.description) {
    fields.description = textToAdf(data.description);
  }
  if (data.priorityId) fields.priority = { id: data.priorityId };
  if (data.assigneeAccountId) fields.assignee = { accountId: data.assigneeAccountId };
  if (data.reporterAccountId) fields.reporter = { accountId: data.reporterAccountId };
  if (data.labels?.length) fields.labels = data.labels;
  return { fields };
}

export const IssueUpdateSchema = z.object({
  summary: z.string().optional(),
  description: z.string().optional(),
  labelsAdd: z.array(z.string()).default([]),
  labelsRemove: z.array(z.string()).default([]),
  priorityId: z.string().optional(),
});

/**
 * Convert IssueUpdate data to JIRA API update format.
 * @param {z.infer<typeof IssueUpdateSchema>} data
 * @returns {object}
 */
export function issueUpdateToJiraFormat(data) {
  const update = {};
  if (data.summary) update.summary = [{ set: data.summary }];
  if (data.description) {
    update.description = [{ set: textToAdf(data.description) }];
  }
  const labelOps = [];
  for (const l of data.labelsAdd) labelOps.push({ add: l });
  for (const l of data.labelsRemove) labelOps.push({ remove: l });
  if (labelOps.length) update.labels = labelOps;
  if (data.priorityId) update.priority = [{ set: { id: data.priorityId } }];
  return { update };
}

export const IssueTransitionRequestSchema = z.object({
  transitionId: z.string(),
  comment: z.string().optional(),
  resolutionName: z.string().optional(),
});

/**
 * Convert transition request to JIRA API format.
 * @param {z.infer<typeof IssueTransitionRequestSchema>} data
 * @returns {object}
 */
export function issueTransitionToJiraFormat(data) {
  const result = { transition: { id: data.transitionId } };
  const fields = {};
  if (data.resolutionName) fields.resolution = { name: data.resolutionName };
  if (Object.keys(fields).length) result.fields = fields;
  if (data.comment) {
    result.update = {
      comment: [
        {
          add: {
            body: textToAdf(data.comment),
          },
        },
      ],
    };
  }
  return result;
}

export const IssueAssignmentSchema = z.object({
  accountId: z.string().nullish(),
});

/**
 * Convert assignment to JIRA API format.
 * @param {z.infer<typeof IssueAssignmentSchema>} data
 * @returns {object}
 */
export function issueAssignmentToJiraFormat(data) {
  return { accountId: data.accountId ?? null };
}

export const IssueSearchResultSchema = z.object({
  issues: z.array(IssueSchema).default([]),
  total: z.number().default(0),
  startAt: z.number().default(0),
  maxResults: z.number().default(50),
});
