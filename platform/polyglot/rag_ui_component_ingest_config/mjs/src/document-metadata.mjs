/**
 * @fileoverview DocumentMetadata and related classification utilities.
 *
 * Provides:
 *  - SOURCE_TYPES — canonical source type values
 *  - classifySourceType(filePath) — determines source type from file extension
 *  - extractComponent(filePath, componentPathSegment) — component name from path
 *  - detectLanguage(filePath) — language tag from file extension
 *  - buildImportPatterns(importPackages) — regex patterns for import detection
 *  - enrichMetadata(doc, libraryConfig) — derives metadata from a document object
 *  - DocumentMetadata — metadata container with toDict()
 *
 * Wire format (toDict) uses snake_case; internal properties use camelCase.
 */

import { DocumentMetadataSchema } from './schema.mjs';
import { createLogger } from './logger.mjs';

const _log = createLogger('document-metadata');

// ---------------------------------------------------------------------------
// SOURCE_TYPES
// ---------------------------------------------------------------------------

/**
 * Canonical set of source type discriminators.
 * Order matches the Python enum for interoperability.
 *
 * @type {readonly string[]}
 */
export const SOURCE_TYPES = Object.freeze([
  'component',
  'story',
  'doc',
  'style',
  'type',
  'test',
  'config',
]);

// ---------------------------------------------------------------------------
// classifySourceType
// ---------------------------------------------------------------------------

/**
 * Determine the source type of a file from its path.
 *
 * Classification rules (evaluated in order):
 *  - *.stories.tsx / *.stories.jsx → "story"
 *  - *.test.* / *.spec.* / __tests__/* → "test"
 *  - *.md / *.mdx → "doc"
 *  - *.css / *.less / *.scss / *.module.css → "style"
 *  - *.d.ts → "type"
 *  - *.json / package.json → "config"
 *  - *.tsx / *.jsx (not stories/test) → "component"
 *  - everything else (*.ts, *.js, …) → "component" (fallback)
 *
 * @param {string} filePath - Relative or absolute file path.
 * @returns {string} One of SOURCE_TYPES.
 */
export function classifySourceType(filePath) {
  const p = filePath.toLowerCase();
  const basename = p.split('/').pop() ?? p;

  // Stories
  if (/\.stories\.(tsx|jsx)$/.test(basename)) return 'story';

  // Tests
  if (
    /\.(test|spec)\.[a-z]+$/.test(basename) ||
    p.includes('/__tests__/')
  ) {
    return 'test';
  }

  // Docs
  if (/\.(md|mdx)$/.test(basename)) return 'doc';

  // Styles
  if (/\.(css|less|scss)$/.test(basename) || /\.module\.css$/.test(basename)) {
    return 'style';
  }

  // TypeScript declarations
  if (/\.d\.ts$/.test(basename)) return 'type';

  // Config / manifest
  if (/\.json$/.test(basename)) return 'config';

  // React components
  if (/\.(tsx|jsx)$/.test(basename)) return 'component';

  // Fallback — covers .ts, .js, and anything else
  return 'component';
}

// ---------------------------------------------------------------------------
// extractComponent
// ---------------------------------------------------------------------------

/**
 * Extract the component name from a file path relative to the component
 * path segment (e.g. "components").
 *
 * Given `/dataset/repos/ant-design/components/Button/index.tsx` and segment
 * `"components"` this returns `"Button"`.
 *
 * Returns `null` when the segment is not found in the path.
 *
 * @param {string} filePath
 * @param {string} [componentPathSegment='components']
 * @returns {string|null}
 */
export function extractComponent(filePath, componentPathSegment = 'components') {
  const parts = filePath.replace(/\\/g, '/').split('/');
  const idx = parts.indexOf(componentPathSegment);
  if (idx === -1 || idx + 1 >= parts.length) return null;
  return parts[idx + 1] ?? null;
}

// ---------------------------------------------------------------------------
// detectLanguage
// ---------------------------------------------------------------------------

/** @type {Record<string, string>} */
const EXTENSION_LANGUAGE_MAP = {
  '.tsx':  'tsx',
  '.ts':   'typescript',
  '.jsx':  'jsx',
  '.js':   'javascript',
  '.mjs':  'javascript',
  '.cjs':  'javascript',
  '.md':   'markdown',
  '.mdx':  'mdx',
  '.css':  'css',
  '.less': 'less',
  '.scss': 'scss',
  '.json': 'json',
};

/**
 * Determine the language tag for a file from its extension.
 *
 * @param {string} filePath
 * @returns {string} Language tag, e.g. "tsx", "typescript", "markdown".
 *   Falls back to `"text"` for unknown extensions.
 */
export function detectLanguage(filePath) {
  const lower = filePath.toLowerCase();

  // Declaration files are always TypeScript regardless of reported extension
  if (lower.endsWith('.d.ts')) return 'typescript';

  const match = lower.match(/(\.[a-z0-9]+)$/);
  if (!match) return 'text';

  return EXTENSION_LANGUAGE_MAP[match[1]] ?? 'text';
}

// ---------------------------------------------------------------------------
// buildImportPatterns
// ---------------------------------------------------------------------------

/**
 * Build a list of RegExp patterns that match ES import statements for the
 * given package names.
 *
 * Example: `["antd"]` → `/from ['"]antd['"]/`
 *
 * @param {string[]} importPackages
 * @returns {RegExp[]}
 */
export function buildImportPatterns(importPackages) {
  return importPackages.map(
    (pkg) =>
      new RegExp(
        `from\\s+['"]${pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`,
      ),
  );
}

// ---------------------------------------------------------------------------
// enrichMetadata
// ---------------------------------------------------------------------------

/**
 * Derive document metadata from a document-like object and a resolved library
 * config.
 *
 * The `doc` object is expected to have at minimum:
 *  - `filePath` or `metadata.filePath` — absolute/relative file path
 *  - `content` or `pageContent` — raw text content (used for hash)
 *  - optionally `metadata.chunkIndex`, `metadata.totalChunks`
 *
 * @param {object} doc - Document object (LangChain-compatible or plain).
 * @param {import('./library-config.mjs').ResolvedLibraryConfig} libraryConfig
 * @returns {Record<string, unknown>} Flat metadata dict (camelCase).
 */
export function enrichMetadata(doc, libraryConfig) {
  const existingMeta = doc.metadata ?? {};
  const filePath     = existingMeta.filePath ?? doc.filePath ?? '';
  const fileNameParts = filePath.replace(/\\/g, '/').split('/');
  const fileName     = fileNameParts[fileNameParts.length - 1] ?? filePath;
  const sourceType   = classifySourceType(filePath);
  const language     = detectLanguage(filePath);
  const component    = extractComponent(filePath, libraryConfig.componentPathSegment);

  return {
    library:              libraryConfig.name,
    libraryVersion:       libraryConfig.version ?? undefined,
    component:            component ?? undefined,
    fileName,
    filePath,
    sourceType,
    language,
    contentHash:          existingMeta.contentHash ?? '',
    chunkIndex:           existingMeta.chunkIndex  ?? 0,
    totalChunks:          existingMeta.totalChunks ?? 1,
    ingestedAt:           existingMeta.ingestedAt  ?? new Date().toISOString(),
    heading:              existingMeta.heading     ?? undefined,
    exportName:           existingMeta.exportName  ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// DocumentMetadata
// ---------------------------------------------------------------------------

/**
 * Typed container for document chunk metadata.
 *
 * Validates via `DocumentMetadataSchema` on construction.
 * `toDict()` emits snake_case for wire-format compatibility.
 */
export class DocumentMetadata {
  /**
   * @param {object} data - Metadata fields (camelCase).
   */
  constructor(data) {
    const parsed = DocumentMetadataSchema.parse(data);

    this.library         = parsed.library;
    this.libraryVersion  = parsed.libraryVersion ?? null;
    this.component       = parsed.component ?? null;
    this.fileName        = parsed.fileName;
    this.filePath        = parsed.filePath;
    this.sourceType      = parsed.sourceType;
    this.language        = parsed.language;
    this.contentHash     = parsed.contentHash;
    this.chunkIndex      = parsed.chunkIndex;
    this.totalChunks     = parsed.totalChunks;
    this.ingestedAt      = parsed.ingestedAt;
    this.heading         = parsed.heading ?? null;
    this.exportName      = parsed.exportName ?? null;

    Object.freeze(this);
  }

  /**
   * Return a plain object with snake_case keys for wire-format compatibility.
   *
   * @returns {Record<string, unknown>}
   */
  toDict() {
    const d = {
      library:         this.library,
      file_name:       this.fileName,
      file_path:       this.filePath,
      source_type:     this.sourceType,
      language:        this.language,
      content_hash:    this.contentHash,
      chunk_index:     this.chunkIndex,
      total_chunks:    this.totalChunks,
      ingested_at:     this.ingestedAt,
    };

    if (this.libraryVersion !== null) d.library_version = this.libraryVersion;
    if (this.component      !== null) d.component       = this.component;
    if (this.heading        !== null) d.heading         = this.heading;
    if (this.exportName     !== null) d.export_name     = this.exportName;

    return d;
  }

  /**
   * Alias for `toDict()`.
   *
   * @returns {Record<string, unknown>}
   */
  toJSON() {
    return this.toDict();
  }
}
