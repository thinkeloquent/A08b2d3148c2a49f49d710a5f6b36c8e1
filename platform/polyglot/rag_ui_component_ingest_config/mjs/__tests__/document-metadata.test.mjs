/**
 * @fileoverview Tests for DocumentMetadata and utility functions.
 */

import { describe, it, expect } from 'vitest';
import {
  DocumentMetadata,
  SOURCE_TYPES,
  classifySourceType,
  extractComponent,
  detectLanguage,
  buildImportPatterns,
  enrichMetadata,
} from '../src/index.mjs';

// ---------------------------------------------------------------------------
// classifySourceType
// ---------------------------------------------------------------------------

describe('classifySourceType()', () => {
  it('"Button.stories.tsx" → "story"', () => {
    expect(classifySourceType('Button.stories.tsx')).toBe('story');
  });

  it('"Button.stories.jsx" → "story"', () => {
    expect(classifySourceType('Button.stories.jsx')).toBe('story');
  });

  it('"Button.tsx" → "component"', () => {
    expect(classifySourceType('Button.tsx')).toBe('component');
  });

  it('"Button.jsx" → "component"', () => {
    expect(classifySourceType('Button.jsx')).toBe('component');
  });

  it('"README.md" → "doc"', () => {
    expect(classifySourceType('README.md')).toBe('doc');
  });

  it('"index.mdx" → "doc"', () => {
    expect(classifySourceType('index.mdx')).toBe('doc');
  });

  it('"Button.css" → "style"', () => {
    expect(classifySourceType('Button.css')).toBe('style');
  });

  it('"styles.less" → "style"', () => {
    expect(classifySourceType('styles.less')).toBe('style');
  });

  it('"styles.scss" → "style"', () => {
    expect(classifySourceType('styles.scss')).toBe('style');
  });

  it('"Button.module.css" → "style"', () => {
    expect(classifySourceType('Button.module.css')).toBe('style');
  });

  it('"Button.test.tsx" → "test"', () => {
    expect(classifySourceType('Button.test.tsx')).toBe('test');
  });

  it('"Button.spec.ts" → "test"', () => {
    expect(classifySourceType('Button.spec.ts')).toBe('test');
  });

  it('path containing /__tests__/ → "test"', () => {
    expect(classifySourceType('/src/__tests__/Button.tsx')).toBe('test');
  });

  it('"index.d.ts" → "type"', () => {
    expect(classifySourceType('index.d.ts')).toBe('type');
  });

  it('"Button.d.ts" → "type"', () => {
    expect(classifySourceType('Button.d.ts')).toBe('type');
  });

  it('"package.json" → "config"', () => {
    expect(classifySourceType('package.json')).toBe('config');
  });

  it('"tsconfig.json" → "config"', () => {
    expect(classifySourceType('tsconfig.json')).toBe('config');
  });

  it('"utils.ts" → "component" (fallback for .ts)', () => {
    expect(classifySourceType('utils.ts')).toBe('component');
  });

  it('"utils.js" → "component" (fallback for .js)', () => {
    expect(classifySourceType('utils.js')).toBe('component');
  });

  it('stories classification takes priority over component for .tsx', () => {
    // .stories.tsx must be caught before the .tsx → component rule
    expect(classifySourceType('Button.stories.tsx')).toBe('story');
  });

  it('all returned values are members of SOURCE_TYPES', () => {
    const files = [
      'Button.tsx',
      'Button.stories.tsx',
      'README.md',
      'styles.css',
      'Button.test.tsx',
      'index.d.ts',
      'package.json',
      'utils.ts',
    ];
    for (const f of files) {
      expect(SOURCE_TYPES).toContain(classifySourceType(f));
    }
  });
});

// ---------------------------------------------------------------------------
// extractComponent
// ---------------------------------------------------------------------------

describe('extractComponent()', () => {
  it('extracts component name from standard path', () => {
    expect(
      extractComponent('/path/components/Button/index.tsx', 'components'),
    ).toBe('Button');
  });

  it('extracts component name when file is directly under segment dir', () => {
    expect(
      extractComponent('/path/src/Button/Button.tsx', 'src'),
    ).toBe('Button');
  });

  it('returns null when segment is not in the path', () => {
    expect(
      extractComponent('/path/other/Button/index.tsx', 'components'),
    ).toBeNull();
  });

  it('defaults componentPathSegment to "components" when not provided', () => {
    expect(
      extractComponent('/path/components/Input/index.tsx'),
    ).toBe('Input');
  });

  it('returns null for a path with only the segment and no child', () => {
    expect(
      extractComponent('/path/components', 'components'),
    ).toBeNull();
  });

  it('handles Windows-style backslash paths by normalising to forward slashes', () => {
    expect(
      extractComponent('C:\\path\\components\\Button\\index.tsx', 'components'),
    ).toBe('Button');
  });

  it('extracts correctly with a nested path inside the component dir', () => {
    // The segment is "components"; the first child is the component name
    expect(
      extractComponent('/repo/ant-design/components/Button/style/index.tsx', 'components'),
    ).toBe('Button');
  });
});

// ---------------------------------------------------------------------------
// detectLanguage
// ---------------------------------------------------------------------------

describe('detectLanguage()', () => {
  it('"Button.tsx" → "tsx"', () => {
    expect(detectLanguage('Button.tsx')).toBe('tsx');
  });

  it('"utils.ts" → "typescript"', () => {
    expect(detectLanguage('utils.ts')).toBe('typescript');
  });

  it('"App.jsx" → "jsx"', () => {
    expect(detectLanguage('App.jsx')).toBe('jsx');
  });

  it('"index.js" → "javascript"', () => {
    expect(detectLanguage('index.js')).toBe('javascript');
  });

  it('"server.mjs" → "javascript"', () => {
    expect(detectLanguage('server.mjs')).toBe('javascript');
  });

  it('"styles.css" → "css"', () => {
    expect(detectLanguage('styles.css')).toBe('css');
  });

  it('"styles.less" → "less"', () => {
    expect(detectLanguage('styles.less')).toBe('less');
  });

  it('"styles.scss" → "scss"', () => {
    expect(detectLanguage('styles.scss')).toBe('scss');
  });

  it('"README.md" → "markdown"', () => {
    expect(detectLanguage('README.md')).toBe('markdown');
  });

  it('"docs.mdx" → "mdx"', () => {
    expect(detectLanguage('docs.mdx')).toBe('mdx');
  });

  it('"package.json" → "json"', () => {
    expect(detectLanguage('package.json')).toBe('json');
  });

  it('"index.d.ts" → "typescript" (declaration files are always typescript)', () => {
    expect(detectLanguage('index.d.ts')).toBe('typescript');
  });

  it('"Button.d.ts" → "typescript"', () => {
    expect(detectLanguage('Button.d.ts')).toBe('typescript');
  });

  it('unknown extension → "text"', () => {
    expect(detectLanguage('image.png')).toBe('text');
    expect(detectLanguage('archive.zip')).toBe('text');
  });

  it('file with no extension → "text"', () => {
    expect(detectLanguage('Makefile')).toBe('text');
  });

  it('is case-insensitive for extension matching', () => {
    expect(detectLanguage('Button.TSX')).toBe('tsx');
    expect(detectLanguage('STYLES.CSS')).toBe('css');
  });
});

// ---------------------------------------------------------------------------
// buildImportPatterns
// ---------------------------------------------------------------------------

describe('buildImportPatterns()', () => {
  it('returns an array of RegExp instances', () => {
    const patterns = buildImportPatterns(['antd', '@ant-design/icons']);
    expect(patterns).toHaveLength(2);
    expect(patterns[0]).toBeInstanceOf(RegExp);
    expect(patterns[1]).toBeInstanceOf(RegExp);
  });

  it('pattern for "antd" matches a standard import statement', () => {
    const [pattern] = buildImportPatterns(['antd']);
    expect(pattern.test("import { Button } from 'antd'")).toBe(true);
    expect(pattern.test('import { Button } from "antd"')).toBe(true);
  });

  it('pattern for "antd" does not match a different package', () => {
    const [pattern] = buildImportPatterns(['antd']);
    expect(pattern.test("import { Button } from 'antd-mobile'")).toBe(false);
  });

  it('pattern for scoped package matches correctly', () => {
    const [pattern] = buildImportPatterns(['@ant-design/icons']);
    expect(pattern.test("import { SearchOutlined } from '@ant-design/icons'")).toBe(true);
  });

  it('escapes special regex characters in package names', () => {
    const [pattern] = buildImportPatterns(['@mui/material']);
    expect(pattern.test("import { Button } from '@mui/material'")).toBe(true);
    // The slash must be literal, not a regex metacharacter
    expect(pattern.test("import { Button } from '@mui/other'")).toBe(false);
  });

  it('returns an empty array for an empty input', () => {
    expect(buildImportPatterns([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// DocumentMetadata — construction and toDict()
// ---------------------------------------------------------------------------

describe('DocumentMetadata', () => {
  /** Minimal valid data for construction. */
  const validData = {
    library: 'Ant Design',
    fileName: 'Button.tsx',
    filePath: '/dataset/repos/ant-design/components/Button/index.tsx',
    sourceType: 'component',
    language: 'tsx',
    contentHash: 'abc123',
    chunkIndex: 0,
    totalChunks: 3,
    ingestedAt: '2026-02-17T00:00:00.000Z',
  };

  it('constructs without error for valid data', () => {
    expect(() => new DocumentMetadata(validData)).not.toThrow();
  });

  it('is frozen after construction', () => {
    const meta = new DocumentMetadata(validData);
    expect(Object.isFrozen(meta)).toBe(true);
  });

  it('stores all required fields correctly', () => {
    const meta = new DocumentMetadata(validData);
    expect(meta.library).toBe('Ant Design');
    expect(meta.fileName).toBe('Button.tsx');
    expect(meta.filePath).toBe('/dataset/repos/ant-design/components/Button/index.tsx');
    expect(meta.sourceType).toBe('component');
    expect(meta.language).toBe('tsx');
    expect(meta.contentHash).toBe('abc123');
    expect(meta.chunkIndex).toBe(0);
    expect(meta.totalChunks).toBe(3);
    expect(meta.ingestedAt).toBe('2026-02-17T00:00:00.000Z');
  });

  it('optional fields default to null when not provided', () => {
    const meta = new DocumentMetadata(validData);
    expect(meta.libraryVersion).toBeNull();
    expect(meta.component).toBeNull();
    expect(meta.heading).toBeNull();
    expect(meta.exportName).toBeNull();
  });

  it('stores optional fields when provided', () => {
    const meta = new DocumentMetadata({
      ...validData,
      libraryVersion: '5.x',
      component: 'Button',
      heading: 'API',
      exportName: 'Button',
    });

    expect(meta.libraryVersion).toBe('5.x');
    expect(meta.component).toBe('Button');
    expect(meta.heading).toBe('API');
    expect(meta.exportName).toBe('Button');
  });

  it('throws a ZodError for invalid sourceType', () => {
    expect(
      () => new DocumentMetadata({ ...validData, sourceType: 'invalid-type' }),
    ).toThrow();
  });

  it('throws a ZodError when totalChunks is 0 (must be positive)', () => {
    expect(
      () => new DocumentMetadata({ ...validData, totalChunks: 0 }),
    ).toThrow();
  });

  describe('toDict()', () => {
    it('returns snake_case keys for all required fields', () => {
      const meta = new DocumentMetadata(validData);
      const dict = meta.toDict();

      expect(dict).toHaveProperty('library', 'Ant Design');
      expect(dict).toHaveProperty('file_name', 'Button.tsx');
      expect(dict).toHaveProperty('file_path');
      expect(dict).toHaveProperty('source_type', 'component');
      expect(dict).toHaveProperty('language', 'tsx');
      expect(dict).toHaveProperty('content_hash', 'abc123');
      expect(dict).toHaveProperty('chunk_index', 0);
      expect(dict).toHaveProperty('total_chunks', 3);
      expect(dict).toHaveProperty('ingested_at');
    });

    it('omits optional null fields from toDict() output', () => {
      const meta = new DocumentMetadata(validData);
      const dict = meta.toDict();

      // Optional fields that are null should not be in the dict
      expect(dict).not.toHaveProperty('library_version');
      expect(dict).not.toHaveProperty('component');
      expect(dict).not.toHaveProperty('heading');
      expect(dict).not.toHaveProperty('export_name');
    });

    it('includes optional fields in toDict() when they are set', () => {
      const meta = new DocumentMetadata({
        ...validData,
        libraryVersion: '5.x',
        component: 'Button',
        heading: 'API',
        exportName: 'Button',
      });
      const dict = meta.toDict();

      expect(dict).toHaveProperty('library_version', '5.x');
      expect(dict).toHaveProperty('component', 'Button');
      expect(dict).toHaveProperty('heading', 'API');
      expect(dict).toHaveProperty('export_name', 'Button');
    });

    it('does not emit camelCase keys', () => {
      const meta = new DocumentMetadata(validData);
      const dict = meta.toDict();

      expect(dict).not.toHaveProperty('fileName');
      expect(dict).not.toHaveProperty('filePath');
      expect(dict).not.toHaveProperty('sourceType');
      expect(dict).not.toHaveProperty('contentHash');
      expect(dict).not.toHaveProperty('chunkIndex');
      expect(dict).not.toHaveProperty('totalChunks');
      expect(dict).not.toHaveProperty('ingestedAt');
    });
  });

  describe('toJSON()', () => {
    it('toJSON() returns the same object as toDict()', () => {
      const meta = new DocumentMetadata(validData);
      expect(meta.toJSON()).toEqual(meta.toDict());
    });
  });
});

// ---------------------------------------------------------------------------
// SOURCE_TYPES constant
// ---------------------------------------------------------------------------

describe('SOURCE_TYPES', () => {
  it('is frozen', () => {
    expect(Object.isFrozen(SOURCE_TYPES)).toBe(true);
  });

  it('contains the expected canonical values', () => {
    expect(SOURCE_TYPES).toContain('component');
    expect(SOURCE_TYPES).toContain('story');
    expect(SOURCE_TYPES).toContain('doc');
    expect(SOURCE_TYPES).toContain('style');
    expect(SOURCE_TYPES).toContain('type');
    expect(SOURCE_TYPES).toContain('test');
    expect(SOURCE_TYPES).toContain('config');
  });

  it('has exactly 7 entries', () => {
    expect(SOURCE_TYPES).toHaveLength(7);
  });
});

// ---------------------------------------------------------------------------
// enrichMetadata
// ---------------------------------------------------------------------------

describe('enrichMetadata()', () => {
  const fakeLibraryConfig = {
    name: 'Ant Design',
    version: '5.x',
    componentPathSegment: 'components',
  };

  it('derives sourceType, language, and component from filePath', () => {
    const doc = {
      filePath: '/dataset/repos/ant-design/components/Button/index.tsx',
    };
    const meta = enrichMetadata(doc, fakeLibraryConfig);

    expect(meta.sourceType).toBe('component');
    expect(meta.language).toBe('tsx');
    expect(meta.component).toBe('Button');
    expect(meta.library).toBe('Ant Design');
    expect(meta.libraryVersion).toBe('5.x');
  });

  it('reads filePath from doc.metadata.filePath when available', () => {
    const doc = {
      metadata: {
        filePath: '/dataset/repos/ant-design/components/Checkbox/index.tsx',
      },
    };
    const meta = enrichMetadata(doc, fakeLibraryConfig);

    expect(meta.component).toBe('Checkbox');
  });

  it('sets component to undefined when path does not contain the segment', () => {
    const doc = {
      filePath: '/other/path/to/file.tsx',
    };
    const meta = enrichMetadata(doc, fakeLibraryConfig);

    expect(meta.component).toBeUndefined();
  });

  it('includes fileName extracted from filePath', () => {
    const doc = {
      filePath: '/dataset/repos/ant-design/components/Button/index.tsx',
    };
    const meta = enrichMetadata(doc, fakeLibraryConfig);

    expect(meta.fileName).toBe('index.tsx');
  });

  it('provides defaults for chunkIndex, totalChunks when not in existing metadata', () => {
    const doc = {
      filePath: '/some/file.tsx',
    };
    const meta = enrichMetadata(doc, fakeLibraryConfig);

    expect(meta.chunkIndex).toBe(0);
    expect(meta.totalChunks).toBe(1);
  });

  it('preserves chunkIndex and totalChunks from existing metadata', () => {
    const doc = {
      metadata: {
        filePath: '/some/file.tsx',
        chunkIndex: 2,
        totalChunks: 5,
      },
    };
    const meta = enrichMetadata(doc, fakeLibraryConfig);

    expect(meta.chunkIndex).toBe(2);
    expect(meta.totalChunks).toBe(5);
  });

  it('includes a non-empty ingestedAt timestamp', () => {
    const doc = {
      filePath: '/some/file.tsx',
    };
    const meta = enrichMetadata(doc, fakeLibraryConfig);

    expect(typeof meta.ingestedAt).toBe('string');
    expect(meta.ingestedAt.length).toBeGreaterThan(0);
  });
});
