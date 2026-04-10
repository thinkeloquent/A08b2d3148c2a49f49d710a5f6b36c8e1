import { http, HttpResponse } from 'msw';
import type {
  ListRuleTreesResponse,
  RuleTreeResponse,
  DeleteResponse,
  ValidationResult,
  SaveRulesResponse,
} from '@/types/api';
import type { RuleTree } from '@/types/rule.types';

const BASE_URL = '/~/api/rule_tree_table';

// Mock data
export const mockRuleTrees: RuleTree[] = [
  {
    id: '1',
    name: 'User Eligibility Rules',
    description: 'Rules for determining user eligibility',
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    rules: {
      id: 'root',
      type: 'group',
      name: 'Root Rules',
      logic: 'AND',
      expanded: true,
      enabled: true,
      conditions: [
        {
          id: '1',
          type: 'condition',
          field: 'age',
          operator: 'greater_than',
          valueType: 'value',
          value: '18',
          dataType: 'number',
          enabled: true,
          validation: { isValid: true },
        },
        {
          id: '2',
          type: 'group',
          name: 'Location Rules',
          logic: 'OR',
          expanded: true,
          enabled: true,
          conditions: [
            {
              id: '3',
              type: 'condition',
              field: 'country',
              operator: 'equals',
              valueType: 'value',
              value: 'USA',
              dataType: 'string',
              enabled: true,
              validation: { isValid: true },
            },
            {
              id: '4',
              type: 'condition',
              field: 'country',
              operator: 'equals',
              valueType: 'value',
              value: 'Canada',
              dataType: 'string',
              enabled: true,
              validation: { isValid: true },
            },
          ],
        },
        {
          id: '5',
          type: 'condition',
          field: 'is_active',
          operator: 'is_true',
          valueType: 'value',
          value: 'true',
          dataType: 'boolean',
          enabled: true,
          validation: { isValid: true },
        },
      ],
    },
  },
  {
    id: '2',
    name: 'Access Control Rules',
    description: 'Rules for access control permissions',
    active: false,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z',
    rules: {
      id: 'root',
      type: 'group',
      name: 'Root Rules',
      logic: 'AND',
      expanded: true,
      enabled: true,
      conditions: [],
    },
  },
];

export const handlers = [
  // List rule trees
  http.get(`${BASE_URL}/trees`, () => {
    const response: ListRuleTreesResponse = {
      trees: mockRuleTrees,
    };
    return HttpResponse.json(response);
  }),

  // Get single rule tree
  http.get(`${BASE_URL}/trees/:id`, ({ params }) => {
    const tree = mockRuleTrees.find((t) => t.id === params.id);
    if (!tree) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    const response: RuleTreeResponse = { tree };
    return HttpResponse.json(response);
  }),

  // Create rule tree
  http.post(`${BASE_URL}/trees`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const newTree: RuleTree = {
      id: String(mockRuleTrees.length + 1),
      name: body.name as string,
      description: body.description as string,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rules: {
        id: 'root',
        type: 'group',
        name: 'Root Rules',
        logic: 'AND',
        expanded: true,
        enabled: true,
        conditions: [],
      },
    };
    const response: RuleTreeResponse = { tree: newTree };
    return HttpResponse.json(response, { status: 201 });
  }),

  // Update rule tree
  http.put(`${BASE_URL}/trees/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const tree = mockRuleTrees.find((t) => t.id === params.id);
    if (!tree) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    const updated = { ...tree, ...body, updatedAt: new Date().toISOString() };
    const response: SaveRulesResponse = {
      tree: updated as RuleTree,
      stats: { total: 5, groups: 2, conditions: 3, folders: 0, enabled: 5 },
    };
    return HttpResponse.json(response);
  }),

  // Delete rule tree
  http.delete(`${BASE_URL}/trees/:id`, ({ params }) => {
    const tree = mockRuleTrees.find((t) => t.id === params.id);
    if (!tree) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    const response: DeleteResponse = { success: true };
    return HttpResponse.json(response);
  }),

  // Validate rules
  http.post(`${BASE_URL}/rules/validate`, async () => {
    const response: ValidationResult = {
      isValid: true,
      errors: [],
      stats: { total: 5, groups: 2, conditions: 3, folders: 0, enabled: 5 },
    };
    return HttpResponse.json(response);
  }),
];
