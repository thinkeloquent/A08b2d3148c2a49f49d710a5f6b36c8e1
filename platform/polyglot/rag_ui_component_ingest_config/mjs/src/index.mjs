/**
 * @fileoverview Public API barrel for @internal/rag-ui-component-ingest-config.
 *
 * Import everything you need from this entry point:
 *
 * ```js
 * import {
 *   RagUIComponentIngestConfig,
 *   SingleLibraryConfig,
 *   DEFAULTS,
 *   DEFAULT_LIBRARY,
 * } from '@internal/rag-ui-component-ingest-config';
 * ```
 */

export { RagUIComponentIngestConfig, SingleLibraryConfig } from './config.mjs';
export { BaseIngestConfig } from './base-config.mjs';
export { LibraryConfig, ResolvedLibraryConfig } from './library-config.mjs';
export {
  DocumentMetadata,
  SOURCE_TYPES,
  classifySourceType,
  extractComponent,
  detectLanguage,
  buildImportPatterns,
  enrichMetadata,
} from './document-metadata.mjs';
export { DEFAULTS, DEFAULT_LIBRARY } from './defaults.mjs';
