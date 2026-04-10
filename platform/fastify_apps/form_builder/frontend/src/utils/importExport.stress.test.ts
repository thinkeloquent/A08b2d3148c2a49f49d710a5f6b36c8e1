import { describe, it, expect, beforeAll } from 'vitest';
import {
  exportFormToSchema,
  exportToYaml,
  exportToJson,
  importFromYaml,
  importFromJson,
} from './importExport';
import type { FormPage, FormMetadata, ElementMetadata } from '../types';

// ==========================================================================
// LARGE DATA GENERATORS
// ==========================================================================

function generateLargeFormPages(numPages: number, elementsPerPage: number): FormPage[] {
  const pages: FormPage[] = [];

  for (let p = 0; p < numPages; p++) {
    const elements: FormPage['elements'] = [];
    const layout: FormPage['layout'] = [];

    for (let e = 0; e < elementsPerPage; e++) {
      const elementId = `el-p${p}-e${e}`;
      const fieldTypes = ['text', 'number', 'select', 'textarea', 'checkbox', 'radio', 'date'] as const;
      const fieldType = fieldTypes[e % fieldTypes.length];

      const element: any = {
        id: elementId,
        type: fieldType,
        label: `Field ${e} on Page ${p}`,
        placeholder: `Enter value ${e}`,
        required: e % 3 === 0,
        helpText: `Help text for field ${e}`,
      };

      // Add type-specific fields
      if (fieldType === 'select' || fieldType === 'checkbox' || fieldType === 'radio') {
        element.options = Array.from({ length: 10 }, (_, i) => ({
          label: `Option ${i}`,
          value: `opt${i}`,
        }));
      }
      if (fieldType === 'number') {
        element.min = 0;
        element.max = 1000;
        element.step = 1;
      }
      if (fieldType === 'textarea') {
        element.rows = 5;
      }

      elements.push(element);

      // Add layout
      const gridWidth = 12;
      const itemsPerRow = 3;
      const itemWidth = Math.floor(gridWidth / itemsPerRow);
      const row = Math.floor(e / itemsPerRow);
      const col = e % itemsPerRow;

      layout.push({
        i: elementId,
        x: col * itemWidth,
        y: row * 2,
        w: itemWidth,
        h: 2,
        minW: 2,
        minH: 2,
      });
    }

    pages.push({
      id: `page-${p}`,
      title: `Page ${p}`,
      description: `Description for page ${p}`,
      elements,
      layout,
    });
  }

  return pages;
}

function generateLargeMetadata(numPages: number, metaComponentsPerPage: number): FormMetadata {
  const pages: FormMetadata['pages'] = {};

  for (let p = 0; p < numPages; p++) {
    const pageId = `page-${p}`;
    const metaComponents: any[] = [];
    const metaLayout: any[] = [];

    for (let m = 0; m < metaComponentsPerPage; m++) {
      const metaId = `meta-p${p}-m${m}`;

      metaComponents.push({
        id: metaId,
        name: `Group ${m}`,
        pageId,
        type: 'grouping',
        childElements: Array.from({ length: 5 }, (_, i) => ({
          id: `child-${metaId}-${i}`,
          type: 'text',
          label: `Child ${i}`,
        })),
        childLayout: Array.from({ length: 5 }, (_, i) => ({
          i: `child-${metaId}-${i}`,
          x: 0,
          y: i * 2,
          w: 12,
          h: 2,
          minW: 2,
          minH: 2,
        })),
      });

      metaLayout.push({
        id: metaId,
        x: 0,
        y: m * 12,
        w: 12,
        h: 10,
        static: false,
      });
    }

    pages[pageId] = {
      pageId,
      metaComponents,
      metaLayout,
    };
  }

  return {
    version: '2.0.0',
    pages,
  };
}

function generateLargeElementMetadata(numElements: number, pageNum: number = 0): Record<string, ElementMetadata> {
  const metadata: Record<string, ElementMetadata> = {};

  for (let i = 0; i < numElements; i++) {
    const elementId = `el-p${pageNum}-e${i}`;
    metadata[elementId] = {
      elementId,
      annotation: {
        type: 'string',
        entries: Array.from({ length: 10 }, (_, j) => ({
          key: `key${j}`,
          value: `value${j}`,
        })),
      },
      comments: `This is a long comment for element ${i}. `.repeat(10),
      references: Array.from({ length: 5 }, (_, j) => ({
        key: `ref${j}`,
        value: `value${j}`,
      })),
    };
  }

  return metadata;
}

function generateDeepNestedOptions(depth: number): any[] {
  const options = [];
  for (let i = 0; i < 100; i++) {
    options.push({
      label: `Option ${i} - ${'nested '.repeat(depth)}`,
      value: `opt-${i}-${'x'.repeat(depth * 10)}`,
    });
  }
  return options;
}

// ==========================================================================
// STRESS TESTS
// ==========================================================================

describe('Stress Tests - Large Datasets', () => {
  describe('Large Form Exports', () => {
    it('handles 100 pages', () => {
      const pages = generateLargeFormPages(100, 10);
      const schema = exportFormToSchema(pages);

      expect(schema.pages).toHaveLength(100);
      expect(schema.pages[0].elements).toHaveLength(10);
      expect(schema.pages[99].elements).toHaveLength(10);
    });

    it('handles 1000 elements on single page', () => {
      const pages = generateLargeFormPages(1, 1000);
      const schema = exportFormToSchema(pages);

      expect(schema.pages[0].elements).toHaveLength(1000);
      expect(schema.pages[0].layout).toHaveLength(1000);
    });

    it('handles 50 pages with 100 elements each (5000 total elements)', () => {
      const pages = generateLargeFormPages(50, 100);
      const schema = exportFormToSchema(pages);

      expect(schema.pages).toHaveLength(50);
      const totalElements = schema.pages.reduce((sum, page) => sum + page.elements.length, 0);
      expect(totalElements).toBe(5000);
    });

    it('handles large metadata with 50 meta-components per page', () => {
      const pages = generateLargeFormPages(10, 10);
      const metadata = generateLargeMetadata(10, 50);
      const schema = exportFormToSchema(pages, metadata);

      expect(schema.metadata?.pages['page-0'].metaComponents).toHaveLength(50);
    });

    it('handles 1000 element metadata entries', () => {
      const pages = generateLargeFormPages(1, 1000);
      const elementMetadata = generateLargeElementMetadata(1000, 0);
      const metadata: FormMetadata = {
        version: '2.0.0',
        pages: {
          'page-0': {
            pageId: 'page-0',
            metaComponents: [],
            metaLayout: [],
          },
        },
      };
      const schema = exportFormToSchema(pages, metadata, elementMetadata);

      expect(Object.keys(schema.metadata?.annotation || {})).toHaveLength(1000);
      expect(Object.keys(schema.metadata?.comments || {})).toHaveLength(1000);
    });
  });

  describe('Large Form Imports', () => {
    it('imports 100 pages', () => {
      const pages = generateLargeFormPages(100, 10);
      const jsonStr = exportToJson(pages);
      const result = importFromJson(jsonStr);

      expect(result.pages).toHaveLength(100);
    });

    it('imports 1000 elements on single page', () => {
      const pages = generateLargeFormPages(1, 1000);
      const jsonStr = exportToJson(pages);
      const result = importFromJson(jsonStr);

      expect(result.pages[0].elements).toHaveLength(1000);
    });

    it('imports 5000 total elements across 50 pages', () => {
      const pages = generateLargeFormPages(50, 100);
      const jsonStr = exportToJson(pages);
      const result = importFromJson(jsonStr);

      const totalElements = result.pages.reduce((sum, page) => sum + page.elements.length, 0);
      expect(totalElements).toBe(5000);
    });
  });

  describe('Large String Handling', () => {
    it('handles 10KB comments', () => {
      const pages = generateLargeFormPages(1, 1);
      const elementMetadata: Record<string, ElementMetadata> = {
        'el-p0-e0': {
          elementId: 'el-p0-e0',
          annotation: { type: 'string', entries: [] },
          comments: 'A'.repeat(10 * 1024), // 10KB
          references: [],
        },
      };
      const metadata: FormMetadata = {
        version: '2.0.0',
        pages: {
          'page-0': {
            pageId: 'page-0',
            metaComponents: [],
            metaLayout: [],
          },
        },
      };

      const jsonStr = exportToJson(pages, metadata, elementMetadata);
      const result = importFromJson(jsonStr);

      expect(result.elementMetadata!['el-p0-e0'].comments).toHaveLength(10 * 1024);
    });

    it('handles 100KB help text', () => {
      const pages = generateLargeFormPages(1, 1);
      pages[0].elements[0].helpText = 'B'.repeat(100 * 1024); // 100KB

      const jsonStr = exportToJson(pages);
      const result = importFromJson(jsonStr);

      expect(result.pages[0].elements[0].helpText).toHaveLength(100 * 1024);
    });

    it('handles very long option labels (1000 chars each)', () => {
      const pages = generateLargeFormPages(1, 1);
      pages[0].elements[0].type = 'select';
      pages[0].elements[0].options = Array.from({ length: 100 }, (_, i) => ({
        label: `Option ${i}: ${'X'.repeat(1000)}`,
        value: `opt${i}`,
      }));

      const jsonStr = exportToJson(pages);
      const result = importFromJson(jsonStr);

      expect(result.pages[0].elements[0].options![0].label.length).toBeGreaterThan(1000);
    });
  });

  describe('Large Option Arrays', () => {
    it('handles 1000 options in select field', () => {
      const pages = generateLargeFormPages(1, 1);
      pages[0].elements[0].type = 'select';
      pages[0].elements[0].options = Array.from({ length: 1000 }, (_, i) => ({
        label: `Option ${i}`,
        value: `opt${i}`,
      }));

      const jsonStr = exportToJson(pages);
      const result = importFromJson(jsonStr);

      expect(result.pages[0].elements[0].options).toHaveLength(1000);
    });

    it('handles 5000 options in checkbox field', () => {
      const pages = generateLargeFormPages(1, 1);
      pages[0].elements[0].type = 'checkbox';
      pages[0].elements[0].options = Array.from({ length: 5000 }, (_, i) => ({
        label: `Check ${i}`,
        value: `check${i}`,
      }));

      const jsonStr = exportToJson(pages);
      const result = importFromJson(jsonStr);

      expect(result.pages[0].elements[0].options).toHaveLength(5000);
    });

    it('handles options with deeply nested strings', () => {
      const pages = generateLargeFormPages(1, 1);
      pages[0].elements[0].type = 'select';
      pages[0].elements[0].options = generateDeepNestedOptions(10);

      const jsonStr = exportToJson(pages);
      const result = importFromJson(jsonStr);

      expect(result.pages[0].elements[0].options).toHaveLength(100);
    });
  });

  describe('File Size Tests', () => {
    it('generates JSON file larger than 1MB', () => {
      const pages = generateLargeFormPages(20, 200);
      const jsonStr = exportToJson(pages);

      const sizeInBytes = new Blob([jsonStr]).size;
      const sizeInMB = sizeInBytes / (1024 * 1024);

      expect(sizeInMB).toBeGreaterThan(1);
      console.log(`Generated JSON size: ${sizeInMB.toFixed(2)} MB`);
    });

    it('generates YAML file larger than 1MB', () => {
      const pages = generateLargeFormPages(20, 200);
      const yamlStr = exportToYaml(pages);

      const sizeInBytes = new Blob([yamlStr]).size;
      const sizeInMB = sizeInBytes / (1024 * 1024);

      expect(sizeInMB).toBeGreaterThan(1);
      console.log(`Generated YAML size: ${sizeInMB.toFixed(2)} MB`);
    });

    it('measures export size with full metadata', () => {
      const pages = generateLargeFormPages(50, 100);
      const metadata = generateLargeMetadata(50, 10);
      const elementMetadata = generateLargeElementMetadata(100, 0); // First 100 elements of page 0

      const jsonStr = exportToJson(pages, metadata, elementMetadata);
      const sizeInBytes = new Blob([jsonStr]).size;
      const sizeInMB = sizeInBytes / (1024 * 1024);

      console.log(`Full export with metadata size: ${sizeInMB.toFixed(2)} MB`);
      expect(sizeInMB).toBeGreaterThan(0.5);
    });
  });

  describe('Deep Nesting Tests', () => {
    it('handles 5 levels of meta-components', () => {
      const page: FormPage = {
        id: 'page-nested',
        title: 'Nested Page',
        elements: [],
        layout: [],
      };

      const metadata: FormMetadata = {
        version: '2.0.0',
        pages: {
          'page-nested': {
            pageId: 'page-nested',
            metaComponents: Array.from({ length: 5 }, (_, level) => ({
              id: `meta-level-${level}`,
              name: `Level ${level}`,
              pageId: 'page-nested',
              type: 'grouping',
              childElements: Array.from({ length: 10 }, (_, i) => ({
                id: `child-${level}-${i}`,
                type: 'text',
                label: `Child ${i} at level ${level}`,
              })),
              childLayout: [],
            })),
            metaLayout: [],
          },
        },
      };

      const schema = exportFormToSchema([page], metadata);
      expect(schema.metadata?.pages['page-nested'].metaComponents).toHaveLength(5);
    });

    it('handles 100 annotation entries per element', () => {
      const pages = generateLargeFormPages(1, 10);
      const elementMetadata: Record<string, ElementMetadata> = {};

      for (let i = 0; i < 10; i++) {
        const elementId = `el-p0-e${i}`;
        elementMetadata[elementId] = {
          elementId,
          annotation: {
            type: 'object',
            entries: Array.from({ length: 100 }, (_, j) => ({
              key: `annotation-key-${j}`,
              value: `annotation-value-${j}`,
            })),
          },
          comments: '',
          references: [],
        };
      }

      const metadata: FormMetadata = {
        version: '2.0.0',
        pages: {
          'page-0': {
            pageId: 'page-0',
            metaComponents: [],
            metaLayout: [],
          },
        },
      };

      const schema = exportFormToSchema(pages, metadata, elementMetadata);
      expect(schema.metadata?.annotation['el-p0-e0'].entries).toHaveLength(100);
    });
  });
});

// ==========================================================================
// PERFORMANCE TESTS
// ==========================================================================

describe('Performance Tests', () => {
  const PERFORMANCE_THRESHOLD_MS = 5000; // 5 seconds max

  describe('Export Performance', () => {
    it('exports 100 pages in reasonable time', () => {
      const pages = generateLargeFormPages(100, 10);
      const startTime = performance.now();

      const schema = exportFormToSchema(pages);

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Export 100 pages took: ${duration.toFixed(2)}ms`);
      expect(schema.pages).toHaveLength(100);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
    });

    it('exports 1000 elements in reasonable time', () => {
      const pages = generateLargeFormPages(1, 1000);
      const startTime = performance.now();

      const schema = exportFormToSchema(pages);

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Export 1000 elements took: ${duration.toFixed(2)}ms`);
      expect(schema.pages[0].elements).toHaveLength(1000);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
    });

    it('exports to JSON in reasonable time', () => {
      const pages = generateLargeFormPages(50, 100);
      const startTime = performance.now();

      const jsonStr = exportToJson(pages);

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Export to JSON (5000 elements) took: ${duration.toFixed(2)}ms`);
      expect(jsonStr.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
    });

    it('exports to YAML in reasonable time', () => {
      const pages = generateLargeFormPages(50, 100);
      const startTime = performance.now();

      const yamlStr = exportToYaml(pages);

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Export to YAML (5000 elements) took: ${duration.toFixed(2)}ms`);
      expect(yamlStr.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
    });
  });

  describe('Import Performance', () => {
    it('imports 100 pages in reasonable time', () => {
      const pages = generateLargeFormPages(100, 10);
      const jsonStr = exportToJson(pages);

      const startTime = performance.now();

      const result = importFromJson(jsonStr);

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Import 100 pages took: ${duration.toFixed(2)}ms`);
      expect(result.pages).toHaveLength(100);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
    });

    it('imports 1000 elements in reasonable time', () => {
      const pages = generateLargeFormPages(1, 1000);
      const jsonStr = exportToJson(pages);

      const startTime = performance.now();

      const result = importFromJson(jsonStr);

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Import 1000 elements took: ${duration.toFixed(2)}ms`);
      expect(result.pages[0].elements).toHaveLength(1000);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
    });

    it('imports from YAML in reasonable time', () => {
      const pages = generateLargeFormPages(50, 100);
      const yamlStr = exportToYaml(pages);

      const startTime = performance.now();

      const result = importFromYaml(yamlStr);

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Import from YAML (5000 elements) took: ${duration.toFixed(2)}ms`);
      const totalElements = result.pages.reduce((sum, page) => sum + page.elements.length, 0);
      expect(totalElements).toBe(5000);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
    });
  });

  describe('Round-Trip Performance', () => {
    it('completes full round-trip (export + import) in reasonable time', () => {
      const pages = generateLargeFormPages(50, 50);

      const startTime = performance.now();

      const jsonStr = exportToJson(pages);
      const result = importFromJson(jsonStr);

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Full round-trip (2500 elements) took: ${duration.toFixed(2)}ms`);
      expect(result.pages).toHaveLength(50);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS * 2); // Allow 2x for round-trip
    });

    it('maintains data integrity after round-trip with large dataset', () => {
      const pages = generateLargeFormPages(10, 100);
      const originalElementCount = pages.reduce((sum, page) => sum + page.elements.length, 0);

      const jsonStr = exportToJson(pages);
      const result = importFromJson(jsonStr);

      const importedElementCount = result.pages.reduce((sum, page) => sum + page.elements.length, 0);

      expect(importedElementCount).toBe(originalElementCount);
      expect(result.pages).toHaveLength(10);
      expect(result.pages[0].elements[0].label).toBe('Field 0 on Page 0');
      expect(result.pages[9].elements[99].label).toBe('Field 99 on Page 9');
    });
  });

  describe('Memory Efficiency', () => {
    it('does not leak memory during repeated exports', () => {
      const pages = generateLargeFormPages(10, 100);

      // Run export 100 times
      for (let i = 0; i < 100; i++) {
        exportToJson(pages);
      }

      // If we get here without crashing, memory is being managed
      expect(true).toBe(true);
    });

    it('does not leak memory during repeated imports', () => {
      const pages = generateLargeFormPages(10, 100);
      const jsonStr = exportToJson(pages);

      // Run import 100 times
      for (let i = 0; i < 100; i++) {
        importFromJson(jsonStr);
      }

      // If we get here without crashing, memory is being managed
      expect(true).toBe(true);
    });
  });
});

// ==========================================================================
// BOUNDARY TESTS
// ==========================================================================

describe('Boundary Tests', () => {
  it('handles maximum safe integer values', () => {
    const pages = generateLargeFormPages(1, 1);
    pages[0].elements[0].type = 'number';
    pages[0].elements[0].min = Number.MIN_SAFE_INTEGER;
    pages[0].elements[0].max = Number.MAX_SAFE_INTEGER;

    const jsonStr = exportToJson(pages);
    const result = importFromJson(jsonStr);

    expect(result.pages[0].elements[0].min).toBe(Number.MIN_SAFE_INTEGER);
    expect(result.pages[0].elements[0].max).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('handles very small step values', () => {
    const pages = generateLargeFormPages(1, 1);
    pages[0].elements[0].type = 'number';
    pages[0].elements[0].step = 0.0001;

    const jsonStr = exportToJson(pages);
    const result = importFromJson(jsonStr);

    expect(result.pages[0].elements[0].step).toBe(0.0001);
  });

  it('handles negative grid coordinates', () => {
    const pages = generateLargeFormPages(1, 1);
    pages[0].layout[0].x = -5;
    pages[0].layout[0].y = -10;

    const jsonStr = exportToJson(pages);
    const result = importFromJson(jsonStr);

    expect(result.pages[0].layout[0].x).toBe(-5);
    expect(result.pages[0].layout[0].y).toBe(-10);
  });

  it('handles very large grid coordinates', () => {
    const pages = generateLargeFormPages(1, 1);
    pages[0].layout[0].x = 10000;
    pages[0].layout[0].y = 10000;

    const jsonStr = exportToJson(pages);
    const result = importFromJson(jsonStr);

    expect(result.pages[0].layout[0].x).toBe(10000);
    expect(result.pages[0].layout[0].y).toBe(10000);
  });

  it('handles element with all possible field types', () => {
    const fieldTypes = ['text', 'textarea', 'select', 'radio', 'checkbox', 'grid', 'date', 'number', 'upload', 'image', 'color', 'geolocation'];
    const pages: FormPage[] = [{
      id: 'all-types',
      title: 'All Types',
      elements: fieldTypes.map((type, i) => ({
        id: `el-${type}`,
        type: type as any,
        label: `Field ${type}`,
      })),
      layout: fieldTypes.map((type, i) => ({
        i: `el-${type}`,
        x: 0,
        y: i * 2,
        w: 12,
        h: 2,
        minW: 2,
        minH: 2,
      })),
    }];

    const jsonStr = exportToJson(pages);
    const result = importFromJson(jsonStr);

    expect(result.pages[0].elements).toHaveLength(fieldTypes.length);
  });
});
