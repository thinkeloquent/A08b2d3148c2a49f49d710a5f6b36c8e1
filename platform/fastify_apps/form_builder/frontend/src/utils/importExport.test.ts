import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  exportFormToSchema,
  exportToYaml,
  exportToJson,
  importSchemaToForm,
  importFromYaml,
  importFromJson,
  importFromContent,
  detectFormat,
  downloadAsFile,
  ExportableFormSchema,
  ExportableElement,
  ExportableLayoutItem,
  ExportableBehavior,
} from './importExport';
import type { FormPage, FormMetadata, ElementMetadata, ElementBounds } from '../types';

// ==========================================================================
// TEST DATA GENERATORS
// ==========================================================================

function createMinimalFormPage(): FormPage {
  return {
    id: 'page-1',
    title: 'Test Page',
    description: 'A test page',
    elements: [
      {
        id: 'el-1',
        type: 'text',
        label: 'Test Field',
      },
    ],
    layout: [
      {
        i: 'el-1',
        x: 0,
        y: 0,
        w: 6,
        h: 2,
        minW: 2,
        minH: 2,
      },
    ],
  };
}

function createComplexFormPage(): FormPage {
  return {
    id: 'page-complex',
    title: 'Complex Page',
    description: 'A complex test page with multiple elements',
    elements: [
      {
        id: 'el-text',
        type: 'text',
        label: 'Text Field',
        placeholder: 'Enter text',
        required: true,
        helpText: 'This is help text',
      },
      {
        id: 'el-select',
        type: 'select',
        label: 'Select Field',
        options: [
          { label: 'Option 1', value: 'opt1' },
          { label: 'Option 2', value: 'opt2' },
        ],
        required: false,
      },
      {
        id: 'el-number',
        type: 'number',
        label: 'Number Field',
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 50,
      },
      {
        id: 'el-textarea',
        type: 'textarea',
        label: 'Text Area',
        rows: 5,
        placeholder: 'Enter long text',
      },
      {
        id: 'el-checkbox',
        type: 'checkbox',
        label: 'Checkbox Field',
        multiple: true,
        options: [
          { label: 'Check 1', value: 'c1' },
          { label: 'Check 2', value: 'c2' },
        ],
      },
    ],
    layout: [
      { i: 'el-text', x: 0, y: 0, w: 6, h: 2, minW: 2, minH: 2 },
      { i: 'el-select', x: 6, y: 0, w: 6, h: 2, minW: 2, minH: 2 },
      { i: 'el-number', x: 0, y: 2, w: 4, h: 2, minW: 2, minH: 2 },
      { i: 'el-textarea', x: 4, y: 2, w: 8, h: 4, minW: 2, minH: 2 },
      { i: 'el-checkbox', x: 0, y: 6, w: 6, h: 3, minW: 2, minH: 2 },
    ],
  };
}

function createElementBounds(): Record<string, ElementBounds> {
  return {
    'el-1': {
      elementId: 'el-1',
      bounds: {
        root: { x: 10, y: 20, width: 300, height: 80 },
        relative: { x: 10, y: 20, width: 300, height: 80 },
      },
    },
    'el-text': {
      elementId: 'el-text',
      bounds: {
        root: { x: 0, y: 0, width: 250, height: 60 },
        relative: { x: 0, y: 0, width: 250, height: 60 },
      },
    },
  };
}

function createFormMetadata(): FormMetadata {
  return {
    version: '2.0.0',
    pages: {
      'page-1': {
        pageId: 'page-1',
        metaComponents: [
          {
            id: 'meta-1',
            name: 'Group 1',
            pageId: 'page-1',
            type: 'grouping',
            childElements: [
              {
                id: 'child-1',
                type: 'text',
                label: 'Child Field',
              },
            ],
            childLayout: [
              { i: 'child-1', x: 0, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
            ],
          },
        ],
        metaLayout: [
          { id: 'meta-1', x: 0, y: 0, w: 12, h: 6, static: false },
        ],
      },
    },
  };
}

function createElementMetadata(): Record<string, ElementMetadata> {
  return {
    'el-1': {
      elementId: 'el-1',
      annotation: {
        type: 'string',
        entries: [
          { key: 'format', value: 'email' },
          { key: 'maxLength', value: '255' },
        ],
      },
      comments: 'This is a test comment with special characters: @#$%',
      references: [
        { key: 'api', value: 'users.email' },
        { key: 'db', value: 'users.email_address' },
      ],
    },
  };
}

// ==========================================================================
// EXPORT FUNCTION TESTS
// ==========================================================================

describe('Export Functions', () => {
  describe('exportFormToSchema', () => {
    it('exports minimal form correctly', () => {
      const page = createMinimalFormPage();
      const schema = exportFormToSchema([page]);

      expect(schema.version).toBe('1.0.0');
      expect(schema.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO timestamp
      expect(schema.pages).toHaveLength(1);
      expect(schema.pages[0].id).toBe('page-1');
      expect(schema.pages[0].title).toBe('Test Page');
      expect(schema.pages[0].elements).toHaveLength(1);
      expect(schema.pages[0].elements[0].fieldType).toBe('text');
      expect(schema.pages[0].layout).toHaveLength(1);
      expect(schema.pages[0].layout[0].id).toBe('el-1');
      expect(schema.pages[0].layout[0].rgl_grid).toEqual([0, 0, 6, 2]);
    });

    it('exports with custom version', () => {
      const page = createMinimalFormPage();
      const schema = exportFormToSchema([page], undefined, undefined, undefined, '2.5.0');

      expect(schema.version).toBe('2.5.0');
    });

    it('exports all optional element fields', () => {
      const page = createComplexFormPage();
      const schema = exportFormToSchema([page]);

      const textEl = schema.pages[0].elements.find(e => e.id === 'el-text');
      expect(textEl).toBeDefined();
      expect(textEl?.placeholder).toBe('Enter text');
      expect(textEl?.required).toBe(true);
      expect(textEl?.helpText).toBe('This is help text');

      const selectEl = schema.pages[0].elements.find(e => e.id === 'el-select');
      expect(selectEl?.options).toEqual([
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' },
      ]);

      const numberEl = schema.pages[0].elements.find(e => e.id === 'el-number');
      expect(numberEl?.min).toBe(0);
      expect(numberEl?.max).toBe(100);
      expect(numberEl?.step).toBe(1);
      expect(numberEl?.defaultValue).toBe(50);

      const textareaEl = schema.pages[0].elements.find(e => e.id === 'el-textarea');
      expect(textareaEl?.rows).toBe(5);
    });

    it('exports with element bounds', () => {
      const page = createMinimalFormPage();
      const bounds = createElementBounds();
      const schema = exportFormToSchema([page], undefined, undefined, bounds);

      expect(schema.pages[0].layout[0].bounds).toEqual({
        x: 10,
        y: 20,
        width: 300,
        height: 80,
      });
    });

    it('exports with metadata and container meta-components', () => {
      const page = createMinimalFormPage();
      const metadata = createFormMetadata();
      const schema = exportFormToSchema([page], metadata);

      expect(schema.metadata).toBeDefined();
      expect(schema.metadata?.pages['page-1']).toBeDefined();
      expect(schema.metadata?.pages['page-1'].metaComponents).toHaveLength(1);
      expect(schema.metadata?.pages['page-1'].metaComponents[0].metaType).toBe('grouping');
      expect(schema.metadata?.pages['page-1'].metaComponents[0].type).toBe('div');
      expect(schema.metadata?.pages['page-1'].metaComponents[0].childElementIds).toEqual(['child-1']);
    });

    it('exports with element metadata (annotations, comments, references)', () => {
      const page = createMinimalFormPage();
      const elementMeta = createElementMetadata();
      const metadata: FormMetadata = {
        version: '2.0.0',
        pages: {
          'page-1': {
            pageId: 'page-1',
            metaComponents: [],
            metaLayout: [],
          },
        },
      };
      const schema = exportFormToSchema([page], metadata, elementMeta);

      expect(schema.metadata).toBeDefined();
      expect(schema.metadata?.annotation['el-1']).toEqual({
        type: 'string',
        entries: [
          { key: 'format', value: 'email' },
          { key: 'maxLength', value: '255' },
        ],
      });
      expect(schema.metadata?.comments['el-1']).toBe('This is a test comment with special characters: @#$%');
      expect(schema.metadata?.references['el-1']).toEqual([
        { key: 'api', value: 'users.email' },
        { key: 'db', value: 'users.email_address' },
      ]);
    });

    it('exports multiple pages', () => {
      const page1 = createMinimalFormPage();
      const page2 = { ...createMinimalFormPage(), id: 'page-2', title: 'Page 2' };
      const schema = exportFormToSchema([page1, page2]);

      expect(schema.pages).toHaveLength(2);
      expect(schema.pages[0].id).toBe('page-1');
      expect(schema.pages[1].id).toBe('page-2');
    });

    it('exports empty pages array', () => {
      const schema = exportFormToSchema([]);

      expect(schema.pages).toEqual([]);
      expect(schema.version).toBe('1.0.0');
    });

    it('exports page with no elements', () => {
      const emptyPage: FormPage = {
        id: 'empty',
        title: 'Empty Page',
        elements: [],
        layout: [],
      };
      const schema = exportFormToSchema([emptyPage]);

      expect(schema.pages[0].elements).toEqual([]);
      expect(schema.pages[0].layout).toEqual([]);
    });

    it('exports static layout items', () => {
      const page = createMinimalFormPage();
      page.layout[0].static = true;
      const schema = exportFormToSchema([page]);

      expect(schema.pages[0].layout[0].static).toBe(true);
    });

    it('converts section meta-component to fieldset type', () => {
      const page = createMinimalFormPage();
      const metadata: FormMetadata = {
        version: '2.0.0',
        pages: {
          'page-1': {
            pageId: 'page-1',
            metaComponents: [
              {
                id: 'meta-section',
                name: 'Section 1',
                pageId: 'page-1',
                type: 'section',
                childElements: [],
                childLayout: [],
              },
            ],
            metaLayout: [],
          },
        },
      };
      const schema = exportFormToSchema([page], metadata);

      const metaComp = schema.metadata?.pages['page-1'].metaComponents[0];
      expect(metaComp?.metaType).toBe('section');
      expect(metaComp?.type).toBe('fieldset');
    });

    it('includes exportProperties from component library', () => {
      const page = createMinimalFormPage();
      page.elements[0].componentLibrary = 'tailwind';
      const schema = exportFormToSchema([page]);

      const element = schema.pages[0].elements[0];
      expect(element.exportProperties).toBeDefined();
      expect(element.componentLibrary).toBe('tailwind');
    });
  });

  describe('exportToYaml', () => {
    it('exports to valid YAML string', () => {
      const page = createMinimalFormPage();
      const yamlStr = exportToYaml([page]);

      expect(yamlStr).toContain('version:');
      expect(yamlStr).toContain('exportedAt:');
      expect(yamlStr).toContain('pages:');
      expect(yamlStr).toContain('Test Page');
      expect(yamlStr).toContain('fieldType: text');
    });

    it('YAML contains proper indentation', () => {
      const page = createMinimalFormPage();
      const yamlStr = exportToYaml([page]);

      expect(yamlStr).toContain('  - id:'); // 2-space indent
      expect(yamlStr).toContain('    title:'); // 4-space indent
    });

    it('uses custom version in YAML', () => {
      const page = createMinimalFormPage();
      const yamlStr = exportToYaml([page], undefined, undefined, undefined, '3.0.0');

      expect(yamlStr).toContain('version: 3.0.0');
    });
  });

  describe('exportToJson', () => {
    it('exports to valid JSON string', () => {
      const page = createMinimalFormPage();
      const jsonStr = exportToJson([page]);

      const parsed = JSON.parse(jsonStr);
      expect(parsed.version).toBe('1.0.0');
      expect(parsed.pages).toHaveLength(1);
      expect(parsed.pages[0].title).toBe('Test Page');
    });

    it('JSON is pretty-printed with 2-space indentation', () => {
      const page = createMinimalFormPage();
      const jsonStr = exportToJson([page]);

      expect(jsonStr).toContain('{\n  "version"');
      expect(jsonStr).toContain('    "id"');
    });

    it('uses custom version in JSON', () => {
      const page = createMinimalFormPage();
      const jsonStr = exportToJson([page], undefined, undefined, undefined, '4.0.0');

      expect(jsonStr).toContain('"version": "4.0.0"');
    });
  });
});

// ==========================================================================
// IMPORT FUNCTION TESTS
// ==========================================================================

describe('Import Functions', () => {
  describe('importSchemaToForm', () => {
    it('imports minimal schema correctly', () => {
      const schema: ExportableFormSchema = {
        version: '1.0.0',
        exportedAt: '2025-01-01T00:00:00.000Z',
        pages: [
          {
            id: 'page-1',
            title: 'Test Page',
            elements: [
              {
                id: 'el-1',
                fieldType: 'text',
                label: 'Test Field',
              },
            ],
            layout: [
              {
                id: 'el-1',
                rgl_grid: [0, 0, 6, 2],
              },
            ],
          },
        ],
      };

      const result = importSchemaToForm(schema);

      expect(result.pages).toHaveLength(1);
      expect(result.pages[0].id).toBe('page-1');
      expect(result.pages[0].title).toBe('Test Page');
      expect(result.pages[0].elements).toHaveLength(1);
      expect(result.pages[0].elements[0].type).toBe('text');
      expect(result.pages[0].layout).toHaveLength(1);
      expect(result.pages[0].layout[0].i).toBe('el-1');
      expect(result.pages[0].layout[0].x).toBe(0);
      expect(result.pages[0].layout[0].y).toBe(0);
      expect(result.pages[0].layout[0].w).toBe(6);
      expect(result.pages[0].layout[0].h).toBe(2);
    });

    it('imports all optional element fields', () => {
      const schema: ExportableFormSchema = {
        version: '1.0.0',
        exportedAt: '2025-01-01T00:00:00.000Z',
        pages: [
          {
            id: 'page-1',
            title: 'Test Page',
            elements: [
              {
                id: 'el-1',
                fieldType: 'text',
                label: 'Test Field',
                placeholder: 'Enter text',
                required: true,
                helpText: 'Help text',
                locked: false,
                componentLibrary: 'shadcn',
              },
            ],
            layout: [{ id: 'el-1', rgl_grid: [0, 0, 6, 2] }],
          },
        ],
      };

      const result = importSchemaToForm(schema);
      const element = result.pages[0].elements[0];

      expect(element.placeholder).toBe('Enter text');
      expect(element.required).toBe(true);
      expect(element.helpText).toBe('Help text');
      expect(element.locked).toBe(false);
      expect(element.componentLibrary).toBe('shadcn');
    });

    it('imports select element with options', () => {
      const schema: ExportableFormSchema = {
        version: '1.0.0',
        exportedAt: '2025-01-01T00:00:00.000Z',
        pages: [
          {
            id: 'page-1',
            title: 'Test Page',
            elements: [
              {
                id: 'el-select',
                fieldType: 'select',
                label: 'Select Field',
                options: [
                  { label: 'A', value: 'a' },
                  { label: 'B', value: 'b' },
                ],
              },
            ],
            layout: [{ id: 'el-select', rgl_grid: [0, 0, 6, 2] }],
          },
        ],
      };

      const result = importSchemaToForm(schema);
      const element = result.pages[0].elements[0];

      expect(element.options).toEqual([
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ]);
    });

    it('imports number element with min, max, step', () => {
      const schema: ExportableFormSchema = {
        version: '1.0.0',
        exportedAt: '2025-01-01T00:00:00.000Z',
        pages: [
          {
            id: 'page-1',
            title: 'Test Page',
            elements: [
              {
                id: 'el-num',
                fieldType: 'number',
                label: 'Number Field',
                min: 0,
                max: 100,
                step: 5,
                defaultValue: 50,
              },
            ],
            layout: [{ id: 'el-num', rgl_grid: [0, 0, 4, 2] }],
          },
        ],
      };

      const result = importSchemaToForm(schema);
      const element = result.pages[0].elements[0];

      expect(element.min).toBe(0);
      expect(element.max).toBe(100);
      expect(element.step).toBe(5);
      expect(element.defaultValue).toBe(50);
    });

    it('imports textarea with rows', () => {
      const schema: ExportableFormSchema = {
        version: '1.0.0',
        exportedAt: '2025-01-01T00:00:00.000Z',
        pages: [
          {
            id: 'page-1',
            title: 'Test Page',
            elements: [
              {
                id: 'el-textarea',
                fieldType: 'textarea',
                label: 'Text Area',
                rows: 10,
              },
            ],
            layout: [{ id: 'el-textarea', rgl_grid: [0, 0, 12, 4] }],
          },
        ],
      };

      const result = importSchemaToForm(schema);
      const element = result.pages[0].elements[0];

      expect(element.rows).toBe(10);
    });

    it('imports upload element with accept and multiple', () => {
      const schema: ExportableFormSchema = {
        version: '1.0.0',
        exportedAt: '2025-01-01T00:00:00.000Z',
        pages: [
          {
            id: 'page-1',
            title: 'Test Page',
            elements: [
              {
                id: 'el-upload',
                fieldType: 'upload',
                label: 'File Upload',
                accept: '.pdf,.doc',
                multiple: true,
              },
            ],
            layout: [{ id: 'el-upload', rgl_grid: [0, 0, 6, 2] }],
          },
        ],
      };

      const result = importSchemaToForm(schema);
      const element = result.pages[0].elements[0];

      expect(element.accept).toBe('.pdf,.doc');
      expect(element.multiple).toBe(true);
    });

    it('imports old layout format (i, x, y, w, h)', () => {
      const schema: ExportableFormSchema = {
        version: '1.0.0',
        exportedAt: '2025-01-01T00:00:00.000Z',
        pages: [
          {
            id: 'page-1',
            title: 'Test Page',
            elements: [{ id: 'el-1', fieldType: 'text', label: 'Field' }],
            layout: [
              {
                i: 'el-1',
                x: 2,
                y: 4,
                w: 8,
                h: 3,
                minW: 2,
                minH: 2,
                static: true,
              } as any,
            ],
          },
        ],
      };

      const result = importSchemaToForm(schema);
      const layout = result.pages[0].layout[0];

      expect(layout.i).toBe('el-1');
      expect(layout.x).toBe(2);
      expect(layout.y).toBe(4);
      expect(layout.w).toBe(8);
      expect(layout.h).toBe(3);
      expect(layout.minW).toBe(2);
      expect(layout.minH).toBe(2);
      expect(layout.static).toBe(true);
    });

    it('imports new layout format with rgl_grid', () => {
      const schema: ExportableFormSchema = {
        version: '1.0.0',
        exportedAt: '2025-01-01T00:00:00.000Z',
        pages: [
          {
            id: 'page-1',
            title: 'Test Page',
            elements: [{ id: 'el-1', fieldType: 'text', label: 'Field' }],
            layout: [
              {
                id: 'el-1',
                rgl_grid: [3, 5, 7, 4],
                static: true,
              },
            ],
          },
        ],
      };

      const result = importSchemaToForm(schema);
      const layout = result.pages[0].layout[0];

      expect(layout.i).toBe('el-1');
      expect(layout.x).toBe(3);
      expect(layout.y).toBe(5);
      expect(layout.w).toBe(7);
      expect(layout.h).toBe(4);
      expect(layout.static).toBe(true);
    });

    it('skips elements with unknown field types', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const schema: ExportableFormSchema = {
        version: '1.0.0',
        exportedAt: '2025-01-01T00:00:00.000Z',
        pages: [
          {
            id: 'page-1',
            title: 'Test Page',
            elements: [
              { id: 'el-1', fieldType: 'text', label: 'Valid' },
              { id: 'el-2', fieldType: 'unknown-type', label: 'Invalid' } as any,
              { id: 'el-3', fieldType: 'number', label: 'Valid 2' },
            ],
            layout: [
              { id: 'el-1', rgl_grid: [0, 0, 6, 2] },
              { id: 'el-2', rgl_grid: [6, 0, 6, 2] },
              { id: 'el-3', rgl_grid: [0, 2, 6, 2] },
            ],
          },
        ],
      };

      const result = importSchemaToForm(schema);

      expect(result.pages[0].elements).toHaveLength(2);
      expect(result.pages[0].elements[0].id).toBe('el-1');
      expect(result.pages[0].elements[1].id).toBe('el-3');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown field type: unknown-type')
      );

      consoleWarnSpy.mockRestore();
    });

    it('filters out layouts for non-existent elements', () => {
      const schema: ExportableFormSchema = {
        version: '1.0.0',
        exportedAt: '2025-01-01T00:00:00.000Z',
        pages: [
          {
            id: 'page-1',
            title: 'Test Page',
            elements: [{ id: 'el-1', fieldType: 'text', label: 'Field' }],
            layout: [
              { id: 'el-1', rgl_grid: [0, 0, 6, 2] },
              { id: 'el-missing', rgl_grid: [6, 0, 6, 2] },
            ],
          },
        ],
      };

      const result = importSchemaToForm(schema);

      expect(result.pages[0].layout).toHaveLength(1);
      expect(result.pages[0].layout[0].i).toBe('el-1');
    });

    it('reconstructs elementMetadata from annotation/comments/references', () => {
      const schema: ExportableFormSchema = {
        version: '1.0.0',
        exportedAt: '2025-01-01T00:00:00.000Z',
        pages: [
          {
            id: 'page-1',
            title: 'Test Page',
            elements: [{ id: 'el-1', fieldType: 'text', label: 'Field' }],
            layout: [{ id: 'el-1', rgl_grid: [0, 0, 6, 2] }],
          },
        ],
        metadata: {
          pages: {},
          behaviors: [],
          annotation: {
            'el-1': {
              type: 'email',
              entries: [{ key: 'domain', value: 'example.com' }],
            },
          },
          comments: {
            'el-1': 'This is a comment',
          },
          references: {
            'el-1': [{ key: 'ref1', value: 'val1' }],
          },
        },
      };

      const result = importSchemaToForm(schema);

      expect(result.elementMetadata).toBeDefined();
      expect(result.elementMetadata!['el-1']).toEqual({
        elementId: 'el-1',
        annotation: {
          type: 'email',
          entries: [{ key: 'domain', value: 'example.com' }],
        },
        comments: 'This is a comment',
        references: [{ key: 'ref1', value: 'val1' }],
      });
    });

    it('handles empty schema', () => {
      const schema: ExportableFormSchema = {
        version: '1.0.0',
        exportedAt: '2025-01-01T00:00:00.000Z',
        pages: [],
      };

      const result = importSchemaToForm(schema);

      expect(result.pages).toEqual([]);
      expect(result.metadata).toBeUndefined();
      expect(result.elementMetadata).toBeUndefined();
    });

    it('handles schema with no metadata', () => {
      const schema: ExportableFormSchema = {
        version: '1.0.0',
        exportedAt: '2025-01-01T00:00:00.000Z',
        pages: [
          {
            id: 'page-1',
            title: 'Test Page',
            elements: [],
            layout: [],
          },
        ],
      };

      const result = importSchemaToForm(schema);

      expect(result.metadata).toBeUndefined();
      expect(result.elementMetadata).toBeUndefined();
    });

    it('creates default annotation when only comments or references exist', () => {
      const schema: ExportableFormSchema = {
        version: '1.0.0',
        exportedAt: '2025-01-01T00:00:00.000Z',
        pages: [
          {
            id: 'page-1',
            title: 'Test Page',
            elements: [{ id: 'el-1', fieldType: 'text', label: 'Field' }],
            layout: [{ id: 'el-1', rgl_grid: [0, 0, 6, 2] }],
          },
        ],
        metadata: {
          pages: {},
          behaviors: [],
          annotation: {},
          comments: { 'el-1': 'Comment only' },
          references: {},
        },
      };

      const result = importSchemaToForm(schema);

      expect(result.elementMetadata!['el-1'].annotation).toEqual({
        type: 'string',
        entries: [],
      });
      expect(result.elementMetadata!['el-1'].comments).toBe('Comment only');
    });
  });

  describe('importFromYaml', () => {
    it('imports valid YAML', () => {
      const yamlContent = `
version: 1.0.0
exportedAt: '2025-01-01T00:00:00.000Z'
pages:
  - id: page-1
    title: Test Page
    elements:
      - id: el-1
        fieldType: text
        label: Test Field
    layout:
      - id: el-1
        rgl_grid: [0, 0, 6, 2]
`;

      const result = importFromYaml(yamlContent);

      expect(result.pages).toHaveLength(1);
      expect(result.pages[0].title).toBe('Test Page');
    });

    it('throws on invalid YAML syntax', () => {
      const invalidYaml = `
version: 1.0.0
  invalid indentation
pages:
  - id: page-1
`;

      expect(() => importFromYaml(invalidYaml)).toThrow();
    });

    it('imports YAML with special characters', () => {
      const yamlContent = `
version: 1.0.0
exportedAt: '2025-01-01T00:00:00.000Z'
pages:
  - id: page-1
    title: "Test Page with 'quotes' and \\"escapes\\""
    description: "Special chars: @#$%^&*()"
    elements:
      - id: el-1
        fieldType: text
        label: "Field with émoji 🎉"
    layout:
      - id: el-1
        rgl_grid: [0, 0, 6, 2]
`;

      const result = importFromYaml(yamlContent);

      expect(result.pages[0].title).toContain('quotes');
      expect(result.pages[0].description).toContain('@#$%');
      expect(result.pages[0].elements[0].label).toContain('🎉');
    });
  });

  describe('importFromJson', () => {
    it('imports valid JSON', () => {
      const jsonContent = JSON.stringify({
        version: '1.0.0',
        exportedAt: '2025-01-01T00:00:00.000Z',
        pages: [
          {
            id: 'page-1',
            title: 'Test Page',
            elements: [{ id: 'el-1', fieldType: 'text', label: 'Field' }],
            layout: [{ id: 'el-1', rgl_grid: [0, 0, 6, 2] }],
          },
        ],
      });

      const result = importFromJson(jsonContent);

      expect(result.pages).toHaveLength(1);
      expect(result.pages[0].title).toBe('Test Page');
    });

    it('throws on invalid JSON syntax', () => {
      const invalidJson = '{ "version": "1.0.0", invalid }';

      expect(() => importFromJson(invalidJson)).toThrow();
    });

    it('throws on JSON with trailing commas', () => {
      const jsonWithTrailingComma = `{
        "version": "1.0.0",
        "pages": [],
      }`;

      expect(() => importFromJson(jsonWithTrailingComma)).toThrow();
    });

    it('imports JSON with Unicode characters', () => {
      const jsonContent = JSON.stringify({
        version: '1.0.0',
        exportedAt: '2025-01-01T00:00:00.000Z',
        pages: [
          {
            id: 'page-1',
            title: 'Test with 中文 and émojis 🚀',
            elements: [
              {
                id: 'el-1',
                fieldType: 'text',
                label: 'Ελληνικά characters',
              },
            ],
            layout: [{ id: 'el-1', rgl_grid: [0, 0, 6, 2] }],
          },
        ],
      });

      const result = importFromJson(jsonContent);

      expect(result.pages[0].title).toContain('中文');
      expect(result.pages[0].title).toContain('🚀');
      expect(result.pages[0].elements[0].label).toContain('Ελληνικά');
    });
  });

  describe('importFromContent', () => {
    it('auto-detects and imports JSON', () => {
      const jsonContent = JSON.stringify({
        version: '1.0.0',
        exportedAt: '2025-01-01T00:00:00.000Z',
        pages: [
          {
            id: 'page-1',
            title: 'JSON Page',
            elements: [],
            layout: [],
          },
        ],
      });

      const result = importFromContent(jsonContent);

      expect(result.pages[0].title).toBe('JSON Page');
    });

    it('auto-detects and imports YAML', () => {
      const yamlContent = `version: 1.0.0
exportedAt: '2025-01-01T00:00:00.000Z'
pages:
  - id: page-1
    title: YAML Page
    elements: []
    layout: []
`;

      const result = importFromContent(yamlContent);

      expect(result.pages[0].title).toBe('YAML Page');
    });

    it('defaults to YAML for unknown format', () => {
      const yamlContent = `# Comment
version: 1.0.0
pages: []
`;

      const result = importFromContent(yamlContent);

      expect(result.pages).toEqual([]);
    });
  });
});

// ==========================================================================
// FORMAT DETECTION TESTS
// ==========================================================================

describe('Format Detection', () => {
  describe('detectFormat', () => {
    it('detects JSON object', () => {
      expect(detectFormat('{ "key": "value" }')).toBe('json');
      expect(detectFormat('  { "key": "value" }  ')).toBe('json');
      expect(detectFormat('\n\n{ "key": "value" }')).toBe('json');
    });

    it('detects JSON array', () => {
      expect(detectFormat('[ "item1", "item2" ]')).toBe('json');
      expect(detectFormat('  [ "item" ]  ')).toBe('json');
    });

    it('detects YAML with version:', () => {
      expect(detectFormat('version: 1.0.0')).toBe('yaml');
      expect(detectFormat('  version: 1.0.0  ')).toBe('yaml');
    });

    it('detects YAML with document marker', () => {
      expect(detectFormat('---')).toBe('yaml');
      expect(detectFormat('---\nversion: 1.0.0')).toBe('yaml');
      expect(detectFormat('  ---  ')).toBe('yaml');
    });

    it('returns unknown for empty string', () => {
      expect(detectFormat('')).toBe('unknown');
      expect(detectFormat('   ')).toBe('unknown');
      expect(detectFormat('\n\n')).toBe('unknown');
    });

    it('returns unknown for non-JSON/YAML content', () => {
      expect(detectFormat('plain text')).toBe('unknown');
      expect(detectFormat('key: value')).toBe('unknown'); // doesn't start with version: or ---
      expect(detectFormat('<xml></xml>')).toBe('unknown');
    });

    it('handles minified JSON', () => {
      expect(detectFormat('{"version":"1.0.0","pages":[]}')).toBe('json');
    });
  });
});

// ==========================================================================
// ROUND-TRIP TESTS
// ==========================================================================

describe('Round-Trip Export/Import', () => {
  it('minimal form survives round-trip via JSON', () => {
    const originalPage = createMinimalFormPage();
    const jsonStr = exportToJson([originalPage]);
    const result = importFromJson(jsonStr);

    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].id).toBe(originalPage.id);
    expect(result.pages[0].title).toBe(originalPage.title);
    expect(result.pages[0].elements).toHaveLength(1);
    expect(result.pages[0].elements[0].label).toBe(originalPage.elements[0].label);
  });

  it('minimal form survives round-trip via YAML', () => {
    const originalPage = createMinimalFormPage();
    const yamlStr = exportToYaml([originalPage]);
    const result = importFromYaml(yamlStr);

    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].id).toBe(originalPage.id);
    expect(result.pages[0].title).toBe(originalPage.title);
    expect(result.pages[0].elements).toHaveLength(1);
    expect(result.pages[0].elements[0].label).toBe(originalPage.elements[0].label);
  });

  it('complex form survives round-trip', () => {
    const originalPage = createComplexFormPage();
    const jsonStr = exportToJson([originalPage]);
    const result = importFromJson(jsonStr);

    expect(result.pages[0].elements).toHaveLength(5);

    const textEl = result.pages[0].elements.find(e => e.id === 'el-text');
    expect(textEl?.placeholder).toBe('Enter text');
    expect(textEl?.required).toBe(true);

    const selectEl = result.pages[0].elements.find(e => e.id === 'el-select');
    expect(selectEl?.options).toHaveLength(2);

    const numberEl = result.pages[0].elements.find(e => e.id === 'el-number');
    expect(numberEl?.min).toBe(0);
    expect(numberEl?.max).toBe(100);
  });

  it('metadata survives round-trip', () => {
    const page = createMinimalFormPage();
    const metadata = createFormMetadata();
    const elementMeta = createElementMetadata();

    const jsonStr = exportToJson([page], metadata, elementMeta);
    const result = importFromJson(jsonStr);

    expect(result.elementMetadata).toBeDefined();
    expect(result.elementMetadata!['el-1'].comments).toBe(
      'This is a test comment with special characters: @#$%'
    );
    expect(result.elementMetadata!['el-1'].references).toHaveLength(2);
  });

  it('special characters survive round-trip', () => {
    const page = createMinimalFormPage();
    page.elements[0].label = 'Test with "quotes" and \'apostrophes\'';
    page.elements[0].helpText = 'Special: @#$%^&*()_+-=[]{}|;:,.<>?/~`';
    page.description = 'Émojis: 🎉🚀💯';

    const jsonStr = exportToJson([page]);
    const result = importFromJson(jsonStr);

    expect(result.pages[0].elements[0].label).toContain('quotes');
    expect(result.pages[0].elements[0].helpText).toContain('@#$%');
    expect(result.pages[0].description).toContain('🎉');
  });
});

// ==========================================================================
// DOWNLOAD FUNCTION TESTS
// ==========================================================================

describe('downloadAsFile', () => {
  let createObjectURLSpy: any;
  let revokeObjectURLSpy: any;
  let createElementSpy: any;
  let appendChildSpy: any;
  let removeChildSpy: any;
  let clickSpy: any;

  beforeEach(() => {
    // Mock URL.createObjectURL and revokeObjectURL
    createObjectURLSpy = vi.fn(() => 'blob:mock-url');
    revokeObjectURLSpy = vi.fn();
    global.URL.createObjectURL = createObjectURLSpy;
    global.URL.revokeObjectURL = revokeObjectURLSpy;

    // Mock document methods
    clickSpy = vi.fn();
    const mockLink = {
      href: '',
      download: '',
      click: clickSpy,
    };
    createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a blob with correct content and mime type', () => {
    downloadAsFile('test content', 'test.txt', 'text/plain');

    expect(createObjectURLSpy).toHaveBeenCalled();
    const blob = createObjectURLSpy.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('text/plain');
  });

  it('creates a link element and triggers download', () => {
    downloadAsFile('content', 'myfile.json', 'application/json');

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
  });

  it('sets correct filename', () => {
    downloadAsFile('content', 'form-export.yaml', 'text/yaml');

    const mockLink = createElementSpy.mock.results[0].value;
    expect(mockLink.download).toBe('form-export.yaml');
  });

  it('cleans up URL object', () => {
    downloadAsFile('content', 'file.txt', 'text/plain');

    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
  });

  it('handles special characters in filename', () => {
    downloadAsFile('content', 'file with spaces & special.json', 'application/json');

    const mockLink = createElementSpy.mock.results[0].value;
    expect(mockLink.download).toBe('file with spaces & special.json');
  });
});

// ==========================================================================
// EDGE CASES
// ==========================================================================

describe('Edge Cases', () => {
  it('handles element with all optional fields undefined', () => {
    const page = createMinimalFormPage();
    page.elements[0].placeholder = undefined;
    page.elements[0].required = undefined;
    page.elements[0].helpText = undefined;

    const jsonStr = exportToJson([page]);
    const result = importFromJson(jsonStr);

    const element = result.pages[0].elements[0];
    expect(element.placeholder).toBeUndefined();
    expect(element.required).toBeUndefined();
    expect(element.helpText).toBeUndefined();
  });

  it('handles very long strings in labels and descriptions', () => {
    const longString = 'A'.repeat(10000);
    const page = createMinimalFormPage();
    page.elements[0].label = longString;
    page.elements[0].helpText = longString;

    const jsonStr = exportToJson([page]);
    const result = importFromJson(jsonStr);

    expect(result.pages[0].elements[0].label).toHaveLength(10000);
    expect(result.pages[0].elements[0].helpText).toHaveLength(10000);
  });

  it('handles large option arrays', () => {
    const page = createMinimalFormPage();
    const largeOptions = Array.from({ length: 1000 }, (_, i) => ({
      label: `Option ${i}`,
      value: `opt${i}`,
    }));
    page.elements[0].type = 'select';
    page.elements[0].options = largeOptions;

    const jsonStr = exportToJson([page]);
    const result = importFromJson(jsonStr);

    expect(result.pages[0].elements[0].options).toHaveLength(1000);
  });

  it('handles newlines in help text and comments', () => {
    const page = createMinimalFormPage();
    page.elements[0].helpText = 'Line 1\nLine 2\nLine 3';

    const elementMeta: Record<string, ElementMetadata> = {
      'el-1': {
        elementId: 'el-1',
        annotation: { type: 'string', entries: [] },
        comments: 'Comment line 1\nComment line 2',
        references: [],
      },
    };

    const metadata: FormMetadata = {
      version: '2.0.0',
      pages: {
        'page-1': {
          pageId: 'page-1',
          metaComponents: [],
          metaLayout: [],
        },
      },
    };

    const jsonStr = exportToJson([page], metadata, elementMeta);
    const result = importFromJson(jsonStr);

    expect(result.pages[0].elements[0].helpText).toContain('\n');
    expect(result.elementMetadata!['el-1'].comments).toContain('\n');
  });

  it('handles tabs in strings', () => {
    const page = createMinimalFormPage();
    page.elements[0].label = 'Label\twith\ttabs';

    const jsonStr = exportToJson([page]);
    const result = importFromJson(jsonStr);

    expect(result.pages[0].elements[0].label).toContain('\t');
  });

  it('handles empty strings in optional fields', () => {
    const page = createMinimalFormPage();
    page.elements[0].placeholder = '';
    page.elements[0].helpText = '';

    const jsonStr = exportToJson([page]);
    const result = importFromJson(jsonStr);

    expect(result.pages[0].elements[0].placeholder).toBe('');
    expect(result.pages[0].elements[0].helpText).toBe('');
  });

  it('handles zero values in numeric fields', () => {
    const page = createMinimalFormPage();
    page.elements[0].type = 'number';
    page.elements[0].min = 0;
    page.elements[0].max = 0;
    page.elements[0].step = 0;
    page.elements[0].defaultValue = 0;

    const jsonStr = exportToJson([page]);
    const result = importFromJson(jsonStr);

    const element = result.pages[0].elements[0];
    expect(element.min).toBe(0);
    expect(element.max).toBe(0);
    expect(element.step).toBe(0);
    expect(element.defaultValue).toBe(0);
  });

  it('handles false values in boolean fields', () => {
    const page = createMinimalFormPage();
    page.elements[0].required = false;
    page.elements[0].multiple = false;
    page.elements[0].locked = false;

    const jsonStr = exportToJson([page]);
    const result = importFromJson(jsonStr);

    expect(result.pages[0].elements[0].required).toBe(false);
    expect(result.pages[0].elements[0].multiple).toBe(false);
    expect(result.pages[0].elements[0].locked).toBe(false);
  });

  it('handles layout with bounds data', () => {
    const page = createMinimalFormPage();
    const bounds = createElementBounds();
    const schema = exportFormToSchema([page], undefined, undefined, bounds);

    expect(schema.pages[0].layout[0].bounds).toEqual({
      x: 10,
      y: 20,
      width: 300,
      height: 80,
    });

    const jsonStr = JSON.stringify(schema);
    const result = importFromJson(jsonStr);

    // Bounds are preserved in layout but not used for import
    expect(result.pages[0].layout[0].i).toBe('el-1');
  });

  it('handles custom annotation types', () => {
    const page = createMinimalFormPage();
    const elementMeta: Record<string, ElementMetadata> = {
      'el-1': {
        elementId: 'el-1',
        annotation: {
          type: 'custom',
          customType: 'MyCustomType',
          entries: [{ key: 'customKey', value: 'customValue' }],
        },
        comments: '',
        references: [],
      },
    };

    const metadata: FormMetadata = {
      version: '2.0.0',
      pages: {
        'page-1': {
          pageId: 'page-1',
          metaComponents: [],
          metaLayout: [],
        },
      },
    };

    const jsonStr = exportToJson([page], metadata, elementMeta);
    const result = importFromJson(jsonStr);

    expect(result.elementMetadata!['el-1'].annotation.type).toBe('custom');
    expect(result.elementMetadata!['el-1'].annotation.customType).toBe('MyCustomType');
  });

  it('handles empty annotation entries', () => {
    const page = createMinimalFormPage();
    const elementMeta: Record<string, ElementMetadata> = {
      'el-1': {
        elementId: 'el-1',
        annotation: { type: 'string', entries: [] },
        comments: '',
        references: [],
      },
    };

    const metadata: FormMetadata = {
      version: '2.0.0',
      pages: {
        'page-1': {
          pageId: 'page-1',
          metaComponents: [],
          metaLayout: [],
        },
      },
    };

    const jsonStr = exportToJson([page], metadata, elementMeta);
    const result = importFromJson(jsonStr);

    expect(result.elementMetadata!['el-1'].annotation.entries).toEqual([]);
  });

  it('handles duplicate element IDs gracefully', () => {
    const schema: ExportableFormSchema = {
      version: '1.0.0',
      exportedAt: '2025-01-01T00:00:00.000Z',
      pages: [
        {
          id: 'page-1',
          title: 'Test Page',
          elements: [
            { id: 'el-dup', fieldType: 'text', label: 'First' },
            { id: 'el-dup', fieldType: 'number', label: 'Second' },
          ],
          layout: [
            { id: 'el-dup', rgl_grid: [0, 0, 6, 2] },
          ],
        },
      ],
    };

    const result = importSchemaToForm(schema);

    // Both elements are imported (no de-duplication)
    expect(result.pages[0].elements).toHaveLength(2);
    expect(result.pages[0].elements[0].id).toBe('el-dup');
    expect(result.pages[0].elements[1].id).toBe('el-dup');
  });

  it('handles ISO timestamp formats', () => {
    const page = createMinimalFormPage();
    const schema = exportFormToSchema([page]);

    // Check ISO 8601 format
    expect(schema.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

    // Verify it's a valid date
    const date = new Date(schema.exportedAt);
    expect(date.toString()).not.toBe('Invalid Date');
  });
});
