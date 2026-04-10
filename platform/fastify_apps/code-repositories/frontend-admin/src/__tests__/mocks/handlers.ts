import { http, HttpResponse } from 'msw';
import type {
  ListRepositoriesResponse,
  GetRepositoryResponse,
  ListTagsResponse,
  GetTagResponse,
  ListMetadataResponse,
  GetMetadataResponse,
  DeleteResponse,
} from '@/types/api';

const BASE_URL = '/api/code-repositories';

// Mock data
export const mockRepositories = [
  {
    id: '1',
    name: 'react',
    description: 'A JavaScript library for building user interfaces',
    type: 1,
    githubUrl: 'https://github.com/facebook/react',
    packageUrl: 'https://www.npmjs.com/package/react',
    stars: 200000,
    forks: 40000,
    version: '18.2.0',
    maintainer: 'Meta',
    language: 'JavaScript',
    license: 'MIT',
    size: '2.5MB',
    healthScore: 98,
    status: 1,
    trending: true,
    verified: true,
    tags: [
      { id: 1, name: 'frontend' },
      { id: 2, name: 'ui' },
    ],
    metadata: [
      { id: 1, name: 'README.md', contentType: 'text/markdown' },
    ],
  },
  {
    id: '2',
    name: 'lodash',
    description: 'A modern JavaScript utility library',
    type: 1,
    githubUrl: 'https://github.com/lodash/lodash',
    packageUrl: 'https://www.npmjs.com/package/lodash',
    stars: 58000,
    forks: 7000,
    version: '4.17.21',
    maintainer: 'John-David Dalton',
    language: 'JavaScript',
    license: 'MIT',
    size: '1.2MB',
    healthScore: 95,
    status: 1,
    trending: false,
    verified: true,
    tags: [
      { id: 3, name: 'utility' },
    ],
    metadata: [],
  },
];

export const mockTags = [
  { id: 1, name: 'frontend', createdAt: { iso8601: '2024-01-01T00:00:00Z' } },
  { id: 2, name: 'ui', createdAt: { iso8601: '2024-01-02T00:00:00Z' } },
  { id: 3, name: 'utility', createdAt: { iso8601: '2024-01-03T00:00:00Z' } },
];

export const mockMetadata = [
  {
    id: 1,
    name: 'README.md',
    contentType: 'text/markdown',
    sourceUrl: 'https://raw.githubusercontent.com/facebook/react/main/README.md',
    labels: ['documentation'],
  },
];

export const handlers = [
  // Repositories
  http.get(`${BASE_URL}/repos`, () => {
    const response: ListRepositoriesResponse = {
      repositories: mockRepositories,
      pagination: {
        page: 1,
        limit: 10,
        total: mockRepositories.length,
        totalPages: 1,
      },
    };
    return HttpResponse.json(response);
  }),

  http.get(`${BASE_URL}/repos/:id`, ({ params }) => {
    const repo = mockRepositories.find((r) => r.id === params.id);
    if (!repo) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    const response: GetRepositoryResponse = { repository: repo };
    return HttpResponse.json(response);
  }),

  http.post(`${BASE_URL}/repos`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const newRepo = {
      id: String(mockRepositories.length + 1),
      ...body,
      type: body.type === 'npm' ? 1 : body.type === 'docker' ? 2 : 3,
      status: 1,
      stars: body.stars || 0,
      forks: body.forks || 0,
    };
    const response: GetRepositoryResponse = { repository: newRepo as never };
    return HttpResponse.json(response, { status: 201 });
  }),

  http.put(`${BASE_URL}/repos/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const repo = mockRepositories.find((r) => r.id === params.id);
    if (!repo) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    const updated = { ...repo, ...body };
    const response: GetRepositoryResponse = { repository: updated };
    return HttpResponse.json(response);
  }),

  http.delete(`${BASE_URL}/repos/:id`, ({ params }) => {
    const repo = mockRepositories.find((r) => r.id === params.id);
    if (!repo) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    const response: DeleteResponse = { success: true };
    return HttpResponse.json(response);
  }),

  // Tags
  http.get(`${BASE_URL}/tags`, () => {
    const response: ListTagsResponse = { tags: mockTags };
    return HttpResponse.json(response);
  }),

  http.get(`${BASE_URL}/tags/:id`, ({ params }) => {
    const tag = mockTags.find((t) => t.id === Number(params.id));
    if (!tag) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    const response: GetTagResponse = { tag };
    return HttpResponse.json(response);
  }),

  http.post(`${BASE_URL}/tags`, async ({ request }) => {
    const body = await request.json() as { name: string };
    const newTag = {
      id: mockTags.length + 1,
      name: body.name,
      createdAt: { iso8601: new Date().toISOString() },
    };
    const response: GetTagResponse = { tag: newTag };
    return HttpResponse.json(response, { status: 201 });
  }),

  http.put(`${BASE_URL}/tags/:id`, async ({ params, request }) => {
    const body = await request.json() as { name: string };
    const tag = mockTags.find((t) => t.id === Number(params.id));
    if (!tag) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    const updated = { ...tag, ...body };
    const response: GetTagResponse = { tag: updated };
    return HttpResponse.json(response);
  }),

  http.delete(`${BASE_URL}/tags/:id`, ({ params }) => {
    const tag = mockTags.find((t) => t.id === Number(params.id));
    if (!tag) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    const response: DeleteResponse = { success: true };
    return HttpResponse.json(response);
  }),

  // Metadata
  http.get(`${BASE_URL}/repos/:repoId/metadata`, () => {
    const response: ListMetadataResponse = { items: mockMetadata };
    return HttpResponse.json(response);
  }),

  http.get(`${BASE_URL}/metadata/:id`, ({ params }) => {
    const meta = mockMetadata.find((m) => m.id === Number(params.id));
    if (!meta) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    const response: GetMetadataResponse = { metadata: meta };
    return HttpResponse.json(response);
  }),

  http.put(`${BASE_URL}/metadata/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const meta = mockMetadata.find((m) => m.id === Number(params.id));
    if (!meta) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    const updated = { ...meta, ...body };
    const response: GetMetadataResponse = { metadata: updated };
    return HttpResponse.json(response);
  }),

  http.delete(`${BASE_URL}/metadata/:id`, ({ params }) => {
    const meta = mockMetadata.find((m) => m.id === Number(params.id));
    if (!meta) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    const response: DeleteResponse = { success: true };
    return HttpResponse.json(response);
  }),
];
