import { http, HttpResponse } from 'msw';
import type {
  ListFigmaFilesResponse,
  GetFigmaFileResponse,
  ListTagsResponse,
  GetTagResponse,
  ListMetadataResponse,
  GetMetadataResponse,
  DeleteResponse,
} from '@/types/api';

const BASE_URL = '/api/figma-files';

// Mock data
export const mockFigmaFiles = [
  {
    id: '1',
    name: 'Design System v2',
    description: 'Main design system with components and tokens',
    type: 1, // design_system
    figmaUrl: 'https://www.figma.com/file/abc123/Design-System',
    figmaFileKey: 'abc123',
    thumbnailUrl: 'https://example.com/thumb1.png',
    pageCount: 5,
    componentCount: 200,
    styleCount: 50,
    lastModifiedBy: 'Jane Doe',
    editorType: 'figma',
    status: 1, // stable
    trending: true,
    verified: true,
    tags: [
      { id: 1, name: 'design-system' },
      { id: 2, name: 'components' },
    ],
    metadata: [
      { id: 1, name: 'README.md', contentType: 'text/markdown' },
    ],
  },
  {
    id: '2',
    name: 'Icon Library',
    description: 'Comprehensive icon set for the platform',
    type: 5, // icon_set
    figmaUrl: 'https://www.figma.com/file/xyz456/Icons',
    figmaFileKey: 'xyz456',
    pageCount: 2,
    componentCount: 500,
    styleCount: 10,
    lastModifiedBy: 'John Smith',
    editorType: 'figma',
    status: 1, // stable
    trending: false,
    verified: true,
    tags: [
      { id: 3, name: 'icons' },
    ],
    metadata: [],
  },
];

export const mockTags = [
  { id: 1, name: 'design-system', createdAt: { iso8601: '2024-01-01T00:00:00Z' } },
  { id: 2, name: 'components', createdAt: { iso8601: '2024-01-02T00:00:00Z' } },
  { id: 3, name: 'icons', createdAt: { iso8601: '2024-01-03T00:00:00Z' } },
];

export const mockMetadata = [
  {
    id: 1,
    name: 'README.md',
    contentType: 'text/markdown',
    sourceUrl: 'https://example.com/readme',
    labels: ['documentation'],
  },
];

export const handlers = [
  // Figma Files
  http.get(`${BASE_URL}/files`, () => {
    const response: ListFigmaFilesResponse = {
      figmaFiles: mockFigmaFiles,
      pagination: {
        page: 1,
        limit: 10,
        total: mockFigmaFiles.length,
        totalPages: 1,
      },
    };
    return HttpResponse.json(response);
  }),

  http.get(`${BASE_URL}/files/:id`, ({ params }) => {
    const figmaFile = mockFigmaFiles.find((f) => f.id === params.id);
    if (!figmaFile) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    const response: GetFigmaFileResponse = { figmaFile };
    return HttpResponse.json(response);
  }),

  http.post(`${BASE_URL}/files`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const newFigmaFile = {
      id: String(mockFigmaFiles.length + 1),
      ...body,
      type: body.type === 'design_system' ? 1
        : body.type === 'component_library' ? 2
        : body.type === 'prototype' ? 3
        : body.type === 'illustration' ? 4
        : 5,
      status: 1,
      pageCount: body.page_count || 0,
      componentCount: body.component_count || 0,
      styleCount: body.style_count || 0,
    };
    const response: GetFigmaFileResponse = { figmaFile: newFigmaFile as never };
    return HttpResponse.json(response, { status: 201 });
  }),

  http.put(`${BASE_URL}/files/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const figmaFile = mockFigmaFiles.find((f) => f.id === params.id);
    if (!figmaFile) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    const updated = { ...figmaFile, ...body };
    const response: GetFigmaFileResponse = { figmaFile: updated };
    return HttpResponse.json(response);
  }),

  http.delete(`${BASE_URL}/files/:id`, ({ params }) => {
    const figmaFile = mockFigmaFiles.find((f) => f.id === params.id);
    if (!figmaFile) {
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
  http.get(`${BASE_URL}/files/:figmaFileId/metadata`, () => {
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
