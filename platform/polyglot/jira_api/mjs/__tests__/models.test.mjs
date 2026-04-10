/**
 * Unit tests for models (Zod schemas and format converters)
 */
import { describe, it, expect } from 'vitest';
import { UserSchema } from '../src/models/user.mjs';
import { ProjectSchema, ProjectVersionSchema, IssueTypeSchema } from '../src/models/project.mjs';
import {
  IssueCreateSchema, IssueUpdateSchema, IssueTransitionRequestSchema,
  issueCreateToJiraFormat, issueUpdateToJiraFormat,
  issueTransitionToJiraFormat, issueAssignmentToJiraFormat,
} from '../src/models/issue.mjs';

describe('UserSchema', () => {
  describe('Statement Coverage', () => {
    it('parses valid user data', () => {
      const data = { accountId: 'acc1', displayName: 'Test User' };
      const result = UserSchema.parse(data);
      expect(result.accountId).toBe('acc1');
      expect(result.active).toBe(true);
    });
  });

  describe('Branch Coverage', () => {
    it('accepts optional fields', () => {
      const data = {
        accountId: 'acc1', displayName: 'User',
        emailAddress: 'u@test.com', timeZone: 'UTC',
      };
      const result = UserSchema.parse(data);
      expect(result.emailAddress).toBe('u@test.com');
    });
  });
});

describe('ProjectSchema', () => {
  describe('Statement Coverage', () => {
    it('parses valid project data', () => {
      const data = { id: '1', key: 'PROJ', name: 'Project' };
      const result = ProjectSchema.parse(data);
      expect(result.key).toBe('PROJ');
    });
  });
});

describe('IssueCreateSchema', () => {
  describe('Statement Coverage', () => {
    it('validates required fields', () => {
      const data = { projectId: '1', summary: 'Test', issueTypeId: '10001' };
      const result = IssueCreateSchema.parse(data);
      expect(result.projectId).toBe('1');
      expect(result.labels).toEqual([]);
    });
  });
});

describe('issueCreateToJiraFormat', () => {
  describe('Statement Coverage', () => {
    it('creates minimal fields', () => {
      const result = issueCreateToJiraFormat({
        projectId: '1', summary: 'Test', issueTypeId: '10001', labels: [],
      });
      expect(result.fields.project.id).toBe('1');
      expect(result.fields.summary).toBe('Test');
      expect(result.fields.issuetype.id).toBe('10001');
    });

    it('includes optional fields when provided', () => {
      const result = issueCreateToJiraFormat({
        projectId: '1', summary: 'Full', issueTypeId: '10001',
        description: 'A desc', priorityId: '2',
        assigneeAccountId: 'acc1', labels: ['bug'],
      });
      expect(result.fields.description.type).toBe('doc');
      expect(result.fields.priority.id).toBe('2');
      expect(result.fields.assignee.accountId).toBe('acc1');
      expect(result.fields.labels).toEqual(['bug']);
    });
  });

  describe('Branch Coverage', () => {
    it('omits description when not provided', () => {
      const result = issueCreateToJiraFormat({
        projectId: '1', summary: 'Min', issueTypeId: '10001', labels: [],
      });
      expect(result.fields.description).toBeUndefined();
    });
  });
});

describe('issueUpdateToJiraFormat', () => {
  describe('Statement Coverage', () => {
    it('creates summary update', () => {
      const result = issueUpdateToJiraFormat({
        summary: 'New', labelsAdd: [], labelsRemove: [],
      });
      expect(result.update.summary).toEqual([{ set: 'New' }]);
    });

    it('creates label operations', () => {
      const result = issueUpdateToJiraFormat({
        labelsAdd: ['a'], labelsRemove: ['b'],
      });
      expect(result.update.labels).toContainEqual({ add: 'a' });
      expect(result.update.labels).toContainEqual({ remove: 'b' });
    });
  });

  describe('Branch Coverage', () => {
    it('returns empty update when no fields', () => {
      const result = issueUpdateToJiraFormat({ labelsAdd: [], labelsRemove: [] });
      expect(result.update).toEqual({});
    });

    it('creates description update with ADF', () => {
      const result = issueUpdateToJiraFormat({
        description: 'New desc', labelsAdd: [], labelsRemove: [],
      });
      expect(result.update.description[0].set.type).toBe('doc');
    });
  });
});

describe('issueTransitionToJiraFormat', () => {
  describe('Statement Coverage', () => {
    it('creates minimal transition', () => {
      const result = issueTransitionToJiraFormat({ transitionId: '5' });
      expect(result.transition.id).toBe('5');
      expect(result.fields).toBeUndefined();
      expect(result.update).toBeUndefined();
    });

    it('includes comment and resolution', () => {
      const result = issueTransitionToJiraFormat({
        transitionId: '5', comment: 'Done', resolutionName: 'Fixed',
      });
      expect(result.fields.resolution.name).toBe('Fixed');
      expect(result.update.comment[0].add.body.type).toBe('doc');
    });
  });
});

describe('issueAssignmentToJiraFormat', () => {
  describe('Statement Coverage', () => {
    it('assigns user', () => {
      expect(issueAssignmentToJiraFormat({ accountId: 'acc1' })).toEqual({ accountId: 'acc1' });
    });

    it('unassigns user', () => {
      expect(issueAssignmentToJiraFormat({ accountId: null })).toEqual({ accountId: null });
    });
  });
});
